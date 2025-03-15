import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Message } from '../models/Conversation';

dotenv.config();

// Tipos de respuestas posibles del agente IA
export enum AIResponseType {
  ANSWER = 'answer',      // Respuesta normal
  HANDOFF = 'handoff',    // Transferir a humano
  CLARIFY = 'clarify',    // Solicitar más información
  ACTION = 'action'       // Realizar una acción (ej. buscar info)
}

export interface AIResponse {
  type: AIResponseType;
  content: string;
  confidence?: number;
  metadata?: Record<string, any>;
  suggestedActions?: string[];
  sentimentScore?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ProcessMessageOptions {
  threadId?: string;
  systemPrompt?: string;
  contactName?: string;
  contactInfo?: Record<string, any>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeMetadata?: boolean;
}

class OpenAIService {
  private client: OpenAI;
  private defaultModel = 'gpt-4o';

  constructor() {
    // Inicializar el cliente de OpenAI con la API key
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Procesa un mensaje con OpenAI para obtener una respuesta
   */
  public async processMessage(
    conversationHistory: Message[], 
    message: string, 
    options: ProcessMessageOptions = {}
  ): Promise<AIResponse> {
    try {
      // Preparar mensajes para la API de OpenAI
      const messages: ChatMessage[] = [];
      
      // Agregar sistema prompt si existe
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: this.enhanceSystemPrompt(options.systemPrompt, options)
        });
      } else {
        // Sistema prompt por defecto
        messages.push({
          role: 'system',
          content: `Eres un asistente de servicio al cliente amigable. Responde de manera útil, 
          concisa y profesional. Si no sabes la respuesta a algo, admítelo claramente y ofrece 
          transferir la conversación a un humano. No inventes información.`
        });
      }
      
      // Agregar historial de conversación
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.direction === 'inbound' ? 'user' : 'assistant',
          content: msg.content,
          name: msg.direction === 'inbound' ? options.contactName : undefined
        });
      }
      
      // Agregar el mensaje actual
      messages.push({
        role: 'user',
        content: message,
        name: options.contactName
      });
      
      // Si estamos buscando metadatos, modificamos el sistema prompt
      if (options.includeMetadata) {
        messages[0].content += `\n\nImportante: Al final de tu respuesta, incluye un análisis 
        en formato JSON con la siguiente estructura:
        {
          "type": "answer|handoff|clarify|action",
          "confidence": 0.0-1.0,
          "sentiment": -1.0-1.0,
          "needsHumanAttention": true|false,
          "tags": ["tag1", "tag2"]
        }
        La respuesta debe estar en un bloque de código markdown.`;
      }
      
      // Realizar la llamada a la API
      const response = await this.client.chat.completions.create({
        model: options.model || this.defaultModel,
        messages: messages as any[],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });
      
      // Obtener la respuesta generada
      const aiMessage = response.choices[0]?.message?.content || '';
      
      // Procesar la respuesta para extraer metadatos si es necesario
      if (options.includeMetadata) {
        return this.processResponseWithMetadata(aiMessage);
      }
      
      // Respuesta básica
      return {
        type: AIResponseType.ANSWER,
        content: aiMessage
      };
    } catch (error) {
      console.error('Error al procesar mensaje con OpenAI:', error);
      return {
        type: AIResponseType.HANDOFF,
        content: 'Lo siento, estoy experimentando problemas técnicos. Permíteme transferirte con un agente humano.'
      };
    }
  }

  /**
   * Genera un sistema prompt mejorado basado en la información disponible
   */
  private enhanceSystemPrompt(basePrompt: string, options: ProcessMessageOptions): string {
    let enhancedPrompt = basePrompt;
    
    // Agregar información del contacto si está disponible
    if (options.contactInfo) {
      enhancedPrompt += `\n\nInformación del cliente:`;
      for (const [key, value] of Object.entries(options.contactInfo)) {
        enhancedPrompt += `\n- ${key}: ${value}`;
      }
    }
    
    // Agregar más instrucciones específicas
    enhancedPrompt += `\n\nImportante:
    - Preséntate como un asistente virtual al inicio de la conversación.
    - Sé cortés y profesional en todo momento.
    - Responde en el mismo idioma que usa el cliente.
    - Si el cliente solicita hablar con un humano, acepta y notifica que vas a transferirlo.
    - Si la consulta requiere conocimiento específico que no tienes, ofrece transferir a un humano.`;
    
    return enhancedPrompt;
  }

  /**
   * Procesa una respuesta que incluye metadatos en formato JSON
   */
  private processResponseWithMetadata(response: string): AIResponse {
    try {
      // Detectar si hay un bloque de código JSON en la respuesta
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      let metadata: Record<string, any> = {};
      let cleanContent = response;
      
      if (jsonMatch && jsonMatch[1]) {
        // Extraer y parsear el JSON
        try {
          metadata = JSON.parse(jsonMatch[1].trim());
          // Eliminar el bloque JSON de la respuesta
          cleanContent = response.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
        } catch (e) {
          console.warn('Error al parsear JSON de la respuesta:', e);
        }
      }
      
      // Determinar el tipo de respuesta
      let responseType = AIResponseType.ANSWER;
      if (metadata.type && Object.values(AIResponseType).includes(metadata.type)) {
        responseType = metadata.type as AIResponseType;
      }
      
      // Si hay indicación de handoff, cambiar el tipo
      if (metadata.needsHumanAttention === true) {
        responseType = AIResponseType.HANDOFF;
      }
      
      return {
        type: responseType,
        content: cleanContent,
        confidence: metadata.confidence || 0.9,
        sentimentScore: metadata.sentiment,
        metadata: {
          ...metadata,
          tags: metadata.tags || []
        },
        suggestedActions: metadata.actions || []
      };
    } catch (error) {
      console.error('Error al procesar metadata de respuesta:', error);
      return {
        type: AIResponseType.ANSWER,
        content: response
      };
    }
  }

  /**
   * Método para extraer entidades y sentimiento de un texto
   */
  public async analyzeText(text: string): Promise<{
    entities: Record<string, string[]>;
    sentiment: number;
    intent: string;
    summary: string;
  }> {
    try {
      const prompt = `
        Analiza el siguiente texto y extrae:
        
        1. Entidades (personas, empresas, productos, ubicaciones, fechas)
        2. Sentimiento (un valor entre -1 y 1, donde -1 es muy negativo y 1 muy positivo)
        3. Intención principal (consulta, queja, solicitud, agradecimiento, etc.)
        4. Un resumen breve (máximo 50 palabras)
        
        Responde SOLO en formato JSON con esta estructura:
        {
          "entities": {
            "personas": [],
            "empresas": [],
            "productos": [],
            "ubicaciones": [],
            "fechas": []
          },
          "sentiment": 0.0,
          "intent": "",
          "summary": ""
        }
        
        Texto a analizar: "${text}"
      `;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error al analizar texto:', error);
      return {
        entities: {},
        sentiment: 0,
        intent: 'unknown',
        summary: 'No se pudo analizar el texto'
      };
    }
  }

  /**
   * Traducir texto a otro idioma
   */
  public async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Traduce el siguiente texto al idioma ${targetLanguage}. 
      Mantén el formato y estilo originales, incluyendo puntuación y énfasis:
      
      "${text}"
      
      Solamente devuelve el texto traducido, sin explicaciones ni comentarios adicionales.`;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      
      return response.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error al traducir texto:', error);
      return text;
    }
  }

  /**
   * Resumir una conversación o texto largo
   */
  public async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    try {
      const prompt = `Resume el siguiente texto en máximo ${maxLength} caracteres, 
      manteniendo los puntos clave y el contexto esencial:
      
      "${text}"
      
      Solamente devuelve el resumen, sin explicaciones ni comentarios adicionales.`;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: Math.ceil(maxLength / 4)
      });
      
      return response.choices[0]?.message?.content || text;
    } catch (error) {
      console.error('Error al resumir texto:', error);
      return text.substring(0, maxLength) + '...';
    }
  }

  /**
   * Generar una respuesta rápida basada en un contexto
   */
  public async generateQuickResponse(context: string, tone: string = 'profesional'): Promise<string[]> {
    try {
      const prompt = `
        Genera 3 posibles respuestas cortas para el siguiente contexto, 
        utilizando un tono ${tone} y manteniendo cada respuesta bajo 100 caracteres:
        
        Contexto: "${context}"
        
        Devuelve solamente las 3 respuestas en formato JSON como un array de strings, sin numeración ni explicaciones.
      `;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message?.content || '{"responses":["Lo siento, no pude generar respuestas."]}';
      const parsed = JSON.parse(content);
      
      return Array.isArray(parsed) ? parsed : parsed.responses || [];
    } catch (error) {
      console.error('Error al generar respuestas rápidas:', error);
      return ['Lo siento, ocurrió un error al generar respuestas.'];
    }
  }

  /**
   * Validar si un texto cumple con políticas específicas (por ejemplo, contiene lenguaje ofensivo)
   */
  public async validateContent(text: string, policies: string[]): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      const policiesText = policies.join('\n- ');
      const prompt = `
        Evalúa si el siguiente texto cumple con estas políticas:
        - ${policiesText}
        
        Texto a evaluar: "${text}"
        
        Responde SOLO en formato JSON con esta estructura:
        {
          "valid": true/false,
          "issues": ["lista de problemas encontrados"]
        }
      `;
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0]?.message?.content || '{"valid":false,"issues":["Error al evaluar"]}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error al validar contenido:', error);
      return {
        valid: false,
        issues: ['Error técnico al validar']
      };
    }
  }
}

export default new OpenAIService();