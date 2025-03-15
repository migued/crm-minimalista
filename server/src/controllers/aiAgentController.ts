import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AIAgent, AgentTemplate, AgentType, IAIAgent, IAgentTemplate } from '../models/AIAgent';
import { Conversation, Message } from '../models/Conversation';
import Contact from '../models/Contact';
import openAIService, { AIResponseType } from '../services/OpenAIService';

// Crear un nuevo agente de IA
export const createAgent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      organizationId,
      systemPrompt,
      description,
      model,
      temperature,
      maxTokens,
      triggerConditions,
      handoffConditions
    } = req.body;

    // Validaciones básicas
    if (!name || !organizationId || !systemPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: nombre, organización y prompt del sistema'
      });
    }

    // Validar que el tipo sea válido
    if (type && !Object.values(AgentType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de agente no válido'
      });
    }

    // Crear el nuevo agente
    const newAgent = new AIAgent({
      name,
      type: type || AgentType.CHATBOT,
      organizationId,
      systemPrompt,
      description,
      model: model || 'gpt-4o',
      temperature: temperature !== undefined ? temperature : 0.7,
      maxTokens: maxTokens || 1024,
      triggerConditions,
      handoffConditions
    });

    await newAgent.save();

    res.status(201).json({
      success: true,
      data: newAgent
    });
  } catch (error) {
    console.error('Error al crear agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el agente de IA',
      error: (error as Error).message
    });
  }
};

// Obtener todos los agentes de una organización
export const getAgentsByOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    const agents = await AIAgent.find({ organizationId });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    console.error('Error al obtener agentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los agentes de IA',
      error: (error as Error).message
    });
  }
};

// Obtener un agente específico
export const getAgentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = await AIAgent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Error al obtener agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el agente de IA',
      error: (error as Error).message
    });
  }
};

// Actualizar un agente existente
export const updateAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Evitar actualizar el ID de la organización
    if (updates.organizationId) {
      delete updates.organizationId;
    }

    // Validar el tipo si se quiere actualizar
    if (updates.type && !Object.values(AgentType).includes(updates.type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de agente no válido'
      });
    }

    const agent = await AIAgent.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Error al actualizar agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el agente de IA',
      error: (error as Error).message
    });
  }
};

// Eliminar un agente
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = await AIAgent.findByIdAndDelete(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agente no encontrado'
      });
    }

    // También actualizar todas las conversaciones que estaban usando este agente
    await Conversation.updateMany(
      { aiAgentId: id },
      { $set: { isAiHandled: false, aiAgentId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Agente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el agente de IA',
      error: (error as Error).message
    });
  }
};

// Procesar un mensaje con un agente específico
export const processMessageWithAgent = async (req: Request, res: Response) => {
  try {
    const { agentId, conversationId, message, includeMetadata } = req.body;

    // Validaciones básicas
    if (!agentId || !conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: agentId, conversationId y message'
      });
    }

    // Obtener el agente
    const agent = await AIAgent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agente no encontrado'
      });
    }

    // Verificar que el agente esté activo
    if (!agent.isActive) {
      return res.status(400).json({
        success: false,
        message: 'El agente está desactivado'
      });
    }

    // Obtener la conversación y sus mensajes
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    // Actualizar la conversación para indicar que está siendo manejada por IA
    if (!conversation.isAiHandled) {
      conversation.isAiHandled = true;
      conversation.aiAgentId = new mongoose.Types.ObjectId(agentId);
      await conversation.save();
    }

    // Obtener información del contacto
    const contact = await Contact.findById(conversation.contactId);
    
    // Obtener los últimos 10 mensajes de la conversación para contexto
    const conversationMessages = conversation.messages.slice(-10);

    // Procesar el mensaje con OpenAI
    const aiResponse = await openAIService.processMessage(
      conversationMessages,
      message,
      {
        systemPrompt: agent.systemPrompt,
        contactName: contact ? contact.name : undefined,
        contactInfo: contact ? {
          name: contact.name,
          email: contact.email || 'N/A',
          phone: contact.phone || 'N/A'
        } : undefined,
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        includeMetadata: includeMetadata || false
      }
    );

    // Guardar el mensaje del usuario
    conversation.messages.push({
      content: message,
      direction: 'inbound',
      timestamp: new Date(),
      status: 'delivered'
    });

    // Guardar la respuesta del agente
    conversation.messages.push({
      content: aiResponse.content,
      direction: 'outbound',
      timestamp: new Date(),
      status: 'sent',
      senderId: 'bot',
      senderName: agent.name
    });

    // Actualizar la conversación
    conversation.lastMessageAt = new Date();
    
    // Si el agente indica handoff, marcar para transferencia
    if (aiResponse.type === AIResponseType.HANDOFF) {
      conversation.isAiHandled = false;
      conversation.aiAgentId = undefined;
    }
    
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse.content,
        type: aiResponse.type,
        metadata: includeMetadata ? {
          confidence: aiResponse.confidence,
          sentimentScore: aiResponse.sentimentScore,
          ...aiResponse.metadata
        } : undefined,
        requiresHumanAttention: aiResponse.type === AIResponseType.HANDOFF
      }
    });
  } catch (error) {
    console.error('Error al procesar mensaje con agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el mensaje con el agente de IA',
      error: (error as Error).message
    });
  }
};

// Evaluar si un mensaje debe ser manejado por un agente específico
export const evaluateAgentTrigger = async (req: Request, res: Response) => {
  try {
    const { organizationId, message, channel, contactId } = req.body;

    // Validaciones básicas
    if (!organizationId || !message || !channel) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: organizationId, message y channel'
      });
    }

    // Obtener todos los agentes activos para la organización
    const agents = await AIAgent.find({ organizationId, isActive: true });

    if (agents.length === 0) {
      return res.status(200).json({
        success: true,
        triggered: false,
        message: 'No hay agentes disponibles'
      });
    }

    // Verificar contacto y sus tags si se proporciona un ID
    let contactTags: string[] = [];
    if (contactId) {
      const contact = await Contact.findById(contactId);
      if (contact && contact.tags) {
        contactTags = contact.tags;
      }
    }

    // Evaluar cada agente para ver cuál debe manejar el mensaje
    let selectedAgent: IAIAgent | null = null;
    
    for (const agent of agents) {
      if (!agent.triggerConditions) continue;
      
      // Verificar canal
      if (agent.triggerConditions.channels && 
          agent.triggerConditions.channels.length > 0 &&
          !agent.triggerConditions.channels.includes(channel)) {
        continue;
      }
      
      // Verificar palabras clave
      if (agent.triggerConditions.keywords && agent.triggerConditions.keywords.length > 0) {
        const messageLC = message.toLowerCase();
        const hasKeyword = agent.triggerConditions.keywords.some(keyword => 
          messageLC.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          selectedAgent = agent;
          break;
        }
      }
      
      // Verificar tags de contacto
      if (contactTags.length > 0 && 
          agent.triggerConditions.contactTags && 
          agent.triggerConditions.contactTags.length > 0) {
        const hasMatchingTag = agent.triggerConditions.contactTags.some(tag => 
          contactTags.includes(tag)
        );
        
        if (hasMatchingTag) {
          selectedAgent = agent;
          break;
        }
      }
    }

    if (selectedAgent) {
      return res.status(200).json({
        success: true,
        triggered: true,
        agent: {
          id: selectedAgent._id,
          name: selectedAgent.name,
          type: selectedAgent.type
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        triggered: false
      });
    }
  } catch (error) {
    console.error('Error al evaluar trigger de agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al evaluar trigger de agente de IA',
      error: (error as Error).message
    });
  }
};

// Obtener todas las plantillas de agentes
export const getAgentTemplates = async (req: Request, res: Response) => {
  try {
    const { industry } = req.query;
    
    let query = {};
    if (industry) {
      query = { industry };
    }

    const templates = await AgentTemplate.find(query);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error al obtener plantillas de agentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de agentes',
      error: (error as Error).message
    });
  }
};

// Crear una nueva plantilla de agente
export const createAgentTemplate = async (req: Request, res: Response) => {
  try {
    const { name, systemPrompt, description, industry } = req.body;

    // Validaciones básicas
    if (!name || !systemPrompt || !description || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Crear la nueva plantilla
    const newTemplate = new AgentTemplate({
      name,
      systemPrompt,
      description,
      industry
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      data: newTemplate
    });
  } catch (error) {
    console.error('Error al crear plantilla de agente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plantilla de agente',
      error: (error as Error).message
    });
  }
};

// Crear un agente a partir de una plantilla
export const createAgentFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, organizationId, name, customizations } = req.body;

    // Validaciones básicas
    if (!templateId || !organizationId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: templateId, organizationId y name'
      });
    }

    // Obtener la plantilla
    const template = await AgentTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Crear el agente con la plantilla
    const newAgent = new AIAgent({
      name,
      type: AgentType.CHATBOT,
      organizationId,
      systemPrompt: template.systemPrompt,
      description: template.description,
      ...customizations
    });

    await newAgent.save();

    res.status(201).json({
      success: true,
      data: newAgent
    });
  } catch (error) {
    console.error('Error al crear agente desde plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear agente desde plantilla',
      error: (error as Error).message
    });
  }
};

// Analizar texto con IA
export const analyzeText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'El texto es requerido'
      });
    }

    const analysis = await openAIService.analyzeText(text);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error al analizar texto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar texto con IA',
      error: (error as Error).message
    });
  }
};

// Resumir una conversación
export const summarizeConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId, maxLength } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la conversación es requerido'
      });
    }

    // Obtener la conversación
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    // Construir el texto de la conversación
    const conversationText = conversation.messages.map(msg => {
      const role = msg.direction === 'inbound' ? 'Usuario' : 'Agente';
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    // Resumir el texto
    const summary = await openAIService.summarizeText(
      conversationText, 
      maxLength || 200
    );

    res.status(200).json({
      success: true,
      data: {
        summary,
        conversationId
      }
    });
  } catch (error) {
    console.error('Error al resumir conversación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resumir conversación con IA',
      error: (error as Error).message
    });
  }
};