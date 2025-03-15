import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AIAgent } from './AIAgentForm';
import aiService from '../../services/ai/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIAgentTesterProps {
  agent: AIAgent;
  onClose: () => void;
}

const AIAgentTester: React.FC<AIAgentTesterProps> = ({ agent, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      role: 'system',
      content: `Esta es una conversación de prueba con el agente "${agent.name}". Puedes escribir mensajes para ver cómo respondería el agente en una conversación real.`,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generar un ID único para cada mensaje
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enviar un mensaje y procesar con el servicio de IA
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Añadir el mensaje del usuario
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Crear un ID temporal de conversación para el tester o usar uno existente
      // En un entorno real, esto vendría de una conversación real
      const testConversationId = agent.id ? `test-${agent.id}` : 'test-conversation';
      
      // Crear un array de historial de mensajes para el contexto (sin mensajes de sistema)
      const contextMessages = messages
        .filter(m => m.role !== 'system')
        .slice(-5); // Tomar solo los últimos 5 mensajes para el contexto
      
      // En un entorno real, esto se reemplazaría por una llamada a la API real:
      let aiResponse;
      
      if (process.env.NODE_ENV === 'production') {
        // Solo usar el servicio real en producción o desarrollo si hay credenciales
        aiResponse = await aiService.processMessage(
          agent.id || 'test',
          testConversationId,
          newMessage,
          true // Incluir metadatos para mostrar más información en el tester
        );
      } else {
        // Para entornos de desarrollo sin backend, usar respuestas simuladas
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Respuestas simuladas por tipo de agente
        const simulatedResponses: Record<string, string[]> = {
          'chatbot': [
            "¡Gracias por tu mensaje! Estoy aquí para ayudarte con cualquier duda sobre nuestros servicios.",
            "Entiendo lo que me comentas. ¿Podrías proporcionarme más detalles para poder asistirte mejor?",
            "Buena pregunta. Basado en la información que tenemos, te recomendaría considerar estas opciones...",
            "Según entiendo, necesitas ayuda con esto. ¿Te gustaría que te conectara con un agente especializado?",
          ],
          'classifier': [
            "CONSULTA_PRODUCTO",
            "SOPORTE_TECNICO",
            "CONSULTA_PRECIO",
            "SOLICITUD_INFORMACION",
          ],
          'summarizer': [
            "CONTEXTO: Consulta sobre productos y disponibilidad\nPROBLEMAS: Cliente interesado en conocer detalles\nSOLUCIONES: Se proporcionó información general\nACCIONES_PENDIENTES: Enviar catálogo detallado\nESTADO: Pendiente",
            "CONTEXTO: Soporte técnico para configuración\nPROBLEMAS: Dificultades con la instalación\nSOLUCIONES: Se explicaron los pasos a seguir\nCOMPROMISOS: Seguimiento en 24 horas\nESTADO: En proceso",
          ],
          'translator': [
            "Aquí está la traducción de tu mensaje: [Versión traducida del mensaje]",
            "He traducido tu texto al español: [Versión traducida del mensaje]",
          ],
        };

        // Seleccionar una respuesta aleatoria según el tipo de agente
        const responses = simulatedResponses[agent.type] || simulatedResponses['chatbot'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Simular el formato de respuesta del servicio
        aiResponse = {
          response: randomResponse,
          type: 'answer',
          metadata: {
            confidence: 0.92,
            sentiment: 0.5,
            tags: ['test']
          },
          requiresHumanAttention: false
        };
      }

      // Añadir la respuesta del asistente
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Si la IA indica que se necesita atención humana, mostrar un mensaje del sistema
      if (aiResponse.requiresHumanAttention) {
        const handoffMessage: Message = {
          id: generateId(),
          role: 'system',
          content: 'El agente ha indicado que esta consulta requiere atención humana.',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, handoffMessage]);
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: generateId(),
        role: 'system',
        content: 'Ha ocurrido un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el envío con la tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Restablecer la conversación
  const handleReset = () => {
    setMessages([
      {
        id: 'system-1',
        role: 'system',
        content: `Esta es una conversación de prueba con el agente "${agent.name}". Puedes escribir mensajes para ver cómo respondería el agente en una conversación real.`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900">Probando: {agent.name}</h3>
          <p className="text-xs text-gray-500">{agent.type} - {agent.model}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Reiniciar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } ${message.role === 'system' ? 'justify-center' : ''}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.role === 'assistant'
                    ? 'bg-white border border-gray-200 text-gray-800'
                    : 'bg-gray-200 text-gray-700 text-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Área de entrada de mensaje */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end">
          <div className="flex-1">
            <textarea
              rows={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Escribe un mensaje de prueba..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            className={`ml-2 p-2 rounded-full focus:outline-none ${
              newMessage.trim() && !isLoading
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md px-3 py-1">
            {process.env.NODE_ENV === 'production' 
              ? 'El agente está utilizando OpenAI para generar respuestas.' 
              : 'Simulando respuestas AI en entorno de desarrollo.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentTester;