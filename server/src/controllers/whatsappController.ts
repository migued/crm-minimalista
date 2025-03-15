import { Request, Response } from 'express';
import whatsAppService, { WhatsAppConfig } from '../services/WhatsAppService';
import Organization from '../models/Organization';
import Conversation from '../models/Conversation';
import Contact from '../models/Contact';
import MessageTemplate from '../models/MessageTemplate';

// Configurar WhatsApp para una organización
export const configureWhatsApp = async (req: Request, res: Response) => {
  try {
    const { 
      organizationId, 
      phoneNumberId, 
      accessToken, 
      businessAccountId, 
      webhookVerifyToken 
    } = req.body;

    if (!organizationId || !phoneNumberId || !accessToken || !businessAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan parámetros requeridos' 
      });
    }

    // Verificar si la organización existe
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organización no encontrada' 
      });
    }

    // Crear/actualizar configuración de WhatsApp
    const whatsAppConfig: WhatsAppConfig = {
      phoneNumberId,
      accessToken,
      businessAccountId,
      webhookVerifyToken: webhookVerifyToken || 'default_verify_token'
    };

    // Guardar configuración en la base de datos
    organization.settings.whatsappIntegration = true;
    organization.markModified('settings');
    await organization.save();

    // Almacenar configuración (en un entorno real, esta información sensible
    // debería guardarse encriptada en la base de datos)
    whatsAppService.setConfig(whatsAppConfig);

    // Verificar que la configuración funciona haciendo una llamada de prueba
    try {
      await whatsAppService.getTemplates();
      return res.status(200).json({
        success: true,
        message: 'WhatsApp configurado correctamente'
      });
    } catch (error) {
      // Si hay un error, revertir los cambios
      organization.settings.whatsappIntegration = false;
      organization.markModified('settings');
      await organization.save();

      return res.status(400).json({
        success: false,
        message: 'Error al verificar credenciales de WhatsApp',
        error: (error as Error).message
      });
    }
  } catch (error) {
    console.error('Error configuring WhatsApp:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al configurar WhatsApp',
      error: (error as Error).message
    });
  }
};

// Obtener configuración actual de WhatsApp
export const getWhatsAppConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    // Verificar si la organización existe
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organización no encontrada' 
      });
    }

    // En un entorno real, aquí recuperaríamos la configuración encriptada
    const config = whatsAppService.getConfig();
    
    return res.status(200).json({
      success: true,
      isConfigured: whatsAppService.isConfigured(),
      // No devolver el access token por seguridad
      config: config ? {
        phoneNumberId: config.phoneNumberId,
        businessAccountId: config.businessAccountId,
        webhookVerifyToken: config.webhookVerifyToken
      } : null
    });
  } catch (error) {
    console.error('Error getting WhatsApp config:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de WhatsApp',
      error: (error as Error).message
    });
  }
};

// Obtener plantillas de WhatsApp
export const getWhatsAppTemplates = async (req: Request, res: Response) => {
  try {
    if (!whatsAppService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está configurado'
      });
    }

    const templates = await whatsAppService.getTemplates();
    
    return res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting WhatsApp templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de WhatsApp',
      error: (error as Error).message
    });
  }
};

// Verificar si un número está en WhatsApp
export const checkWhatsAppNumber = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Número de teléfono requerido' 
      });
    }

    if (!whatsAppService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está configurado'
      });
    }

    const result = await whatsAppService.validatePhoneNumber(phone);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking WhatsApp number:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar número en WhatsApp',
      error: (error as Error).message
    });
  }
};

// Enviar mensaje por WhatsApp
export const sendWhatsAppMessage = async (req: Request, res: Response) => {
  try {
    const { 
      contactId, 
      message, 
      templateId, 
      templateComponents, 
      attachmentUrl, 
      attachmentType, 
      attachmentCaption 
    } = req.body;

    if (!contactId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de contacto requerido' 
      });
    }

    if (!whatsAppService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está configurado'
      });
    }

    // Obtener información del contacto
    const contact = await Contact.findById(contactId);
    if (!contact || !contact.phone) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contacto no encontrado o sin número de teléfono' 
      });
    }

    let result;

    // Determinar tipo de mensaje a enviar
    if (templateId) {
      // Obtener información de la plantilla
      const template = await MessageTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ 
          success: false, 
          message: 'Plantilla no encontrada' 
        });
      }

      // Enviar mensaje usando plantilla
      result = await whatsAppService.sendTemplateMessage(
        contact.phone,
        template.name,
        template.language || 'es',
        templateComponents || []
      );
    } else if (attachmentUrl && attachmentType) {
      // Enviar mensaje con archivo adjunto
      result = await whatsAppService.sendMediaMessage(
        contact.phone,
        attachmentType as 'image' | 'document' | 'audio' | 'video',
        attachmentUrl,
        attachmentCaption
      );
    } else if (message) {
      // Enviar mensaje de texto
      result = await whatsAppService.sendTextMessage(
        contact.phone,
        message
      );
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requiere mensaje, plantilla o archivo adjunto' 
      });
    }

    // Crear o actualizar la conversación
    let conversation = await Conversation.findOne({ 
      contactId: contact._id,
      channel: 'whatsapp'
    });

    if (!conversation) {
      // Crear nueva conversación
      conversation = new Conversation({
        contactId: contact._id,
        channel: 'whatsapp',
        messages: [
          {
            content: message || 'Mensaje de plantilla o archivo enviado',
            direction: 'outbound',
            timestamp: new Date(),
            status: 'sent',
            messageId: result.messageId
          }
        ],
        lastMessageAt: new Date(),
        isResolved: false
      });
    } else {
      // Actualizar conversación existente
      conversation.messages.push({
        content: message || 'Mensaje de plantilla o archivo enviado',
        direction: 'outbound',
        timestamp: new Date(),
        status: 'sent',
        messageId: result.messageId
      });
      conversation.lastMessageAt = new Date();
      conversation.isResolved = false;
    }

    await conversation.save();
    
    return res.status(200).json({
      success: true,
      messageId: result.messageId,
      status: result.status,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje de WhatsApp',
      error: (error as Error).message
    });
  }
};

// Webhook para WhatsApp - Verificación
export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
  try {
    // Parámetros de verificación que envía Meta
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    // Verificar el token
    const response = whatsAppService.verifyWebhook(mode, token, challenge);
    
    if (response) {
      return res.status(200).send(response);
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Verificación fallida' 
      });
    }
  } catch (error) {
    console.error('Error verifying WhatsApp webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar webhook de WhatsApp',
      error: (error as Error).message
    });
  }
};

// Webhook para WhatsApp - Eventos
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  try {
    // Responder rápidamente para que Facebook sepa que recibimos la notificación
    res.status(200).send('EVENT_RECEIVED');

    // Procesar el evento de WhatsApp
    const processedEvent = whatsAppService.processWebhookEvent(req.body);
    
    if (!processedEvent) {
      console.log('Evento de WhatsApp no procesable o no relevante');
      return;
    }

    // Si es una actualización de estado de mensaje
    if (processedEvent.type === 'status') {
      // Actualizar estado del mensaje en la base de datos
      const conversation = await Conversation.findOne({
        'messages.messageId': processedEvent.status?.messageId
      });

      if (conversation) {
        // Encontrar y actualizar el mensaje específico
        const messageIndex = conversation.messages.findIndex(
          msg => msg.messageId === processedEvent.status?.messageId
        );

        if (messageIndex !== -1) {
          conversation.messages[messageIndex].status = processedEvent.status?.status;
          await conversation.save();
        }
      }
    }
    
    // Si es un mensaje entrante
    if (processedEvent.type === 'message') {
      // Buscar el contacto por número de teléfono
      const phone = processedEvent.phone;
      let contact = await Contact.findOne({ phone });
      
      // Si no existe el contacto, crear uno nuevo
      if (!contact) {
        contact = new Contact({
          name: `WhatsApp ${phone}`,
          phone,
          isWhatsAppVerified: true
        });
        await contact.save();
      }

      // Buscar o crear conversación
      let conversation = await Conversation.findOne({
        contactId: contact._id,
        channel: 'whatsapp'
      });

      if (!conversation) {
        conversation = new Conversation({
          contactId: contact._id,
          channel: 'whatsapp',
          messages: [],
          lastMessageAt: new Date(),
          isResolved: false
        });
      }

      // Añadir el mensaje a la conversación
      conversation.messages.push({
        content: processedEvent.message?.text || 'Archivo recibido',
        direction: 'inbound',
        timestamp: new Date(processedEvent.message?.timestamp || Date.now()),
        status: 'received',
        messageId: processedEvent.message?.id,
        mediaUrl: processedEvent.message?.media?.link
      });

      conversation.lastMessageAt = new Date();
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();

      // Aquí se podrían agregar acciones adicionales como:
      // 1. Notificar a agentes
      // 2. Enviar respuesta automática
      // 3. Activar chatbot de IA
    }
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
  }
};

// Sincronizar contactos con WhatsApp
export const syncContactsWithWhatsApp = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;

    if (!whatsAppService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está configurado'
      });
    }

    // Obtener todos los contactos con número de teléfono
    const contacts = await Contact.find({ 
      organizationId,
      phone: { $exists: true, $ne: '' }
    });

    if (!contacts.length) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron contactos con número de teléfono'
      });
    }

    const results = {
      total: contacts.length,
      verified: 0,
      failed: 0
    };

    // Verificar cada contacto (esto puede ser un proceso lento)
    for (const contact of contacts) {
      try {
        const checkResult = await whatsAppService.validatePhoneNumber(contact.phone);
        
        // Actualizar estado del contacto
        contact.isWhatsAppVerified = checkResult.exists;
        await contact.save();
        
        results.verified += checkResult.exists ? 1 : 0;
        results.failed += checkResult.exists ? 0 : 1;
      } catch (error) {
        console.error(`Error checking contact ${contact._id}:`, error);
        results.failed++;
      }
    }

    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error syncing contacts with WhatsApp:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al sincronizar contactos con WhatsApp',
      error: (error as Error).message
    });
  }
};