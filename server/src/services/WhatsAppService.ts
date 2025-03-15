import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  components: any[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface WhatsAppMessage {
  messageId: string;
  status: string;
  timestamp: Date;
}

class WhatsAppService {
  private apiVersion = 'v17.0';
  private baseUrl = 'https://graph.facebook.com';
  private config: WhatsAppConfig | null = null;

  constructor() {
    // Intentar cargar configuración desde variables de entorno
    if (
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    ) {
      this.config = {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'default_verify_token'
      };
    }
  }

  // Configurar el servicio con credenciales
  public setConfig(config: WhatsAppConfig): void {
    this.config = config;
  }

  // Verificar si el servicio está configurado
  public isConfigured(): boolean {
    return !!this.config;
  }

  // Obtener la configuración actual
  public getConfig(): WhatsAppConfig | null {
    return this.config;
  }

  // Validar un número de teléfono en WhatsApp
  public async validatePhoneNumber(phoneNumber: string): Promise<{ exists: boolean; status: string }> {
    if (!this.config) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      // Eliminamos caracteres no numéricos del número de teléfono
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // En la API real, usaríamos el endpoint de contactos
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/${this.config.phoneNumberId}/messages`,
        {
          params: {
            access_token: this.config.accessToken
          }
        }
      );

      // En una implementación real, se analizaría la respuesta
      // Por ahora, simulamos una validación exitosa
      return {
        exists: true,
        status: 'active'
      };
    } catch (error) {
      console.error('Error validating WhatsApp number:', error);
      return {
        exists: false,
        status: 'unknown'
      };
    }
  }

  // Obtener plantillas de mensajes
  public async getTemplates(): Promise<WhatsAppTemplate[]> {
    if (!this.config) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/${this.config.businessAccountId}/message_templates`,
        {
          params: {
            access_token: this.config.accessToken
          }
        }
      );

      return response.data.data.map((template: any) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        components: template.components,
        status: template.status
      }));
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  // Enviar un mensaje de texto simple
  public async sendTextMessage(
    to: string,
    text: string
  ): Promise<WhatsAppMessage> {
    if (!this.config) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.apiVersion}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: text
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      return {
        messageId: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending WhatsApp text message:', error);
      throw error;
    }
  }

  // Enviar un mensaje con plantilla
  public async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'es',
    components: any[] = []
  ): Promise<WhatsAppMessage> {
    if (!this.config) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.apiVersion}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      return {
        messageId: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  // Enviar un mensaje con un archivo adjunto (imagen, documento, etc.)
  public async sendMediaMessage(
    to: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    mediaUrl: string,
    caption?: string
  ): Promise<WhatsAppMessage> {
    if (!this.config) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.apiVersion}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: mediaType,
          [mediaType]: {
            link: mediaUrl,
            caption: caption || ''
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`
          }
        }
      );

      return {
        messageId: response.data.messages[0].id,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error sending WhatsApp ${mediaType} message:`, error);
      throw error;
    }
  }

  // Manejar verificación del webhook
  public verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (!this.config) {
      return null;
    }

    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }

    return null;
  }

  // Procesar eventos del webhook
  public processWebhookEvent(body: any): { 
    type: string, 
    phone: string, 
    message?: any,
    status?: any 
  } | null {
    try {
      if (body.object !== 'whatsapp_business_account') {
        return null;
      }

      // Extraer los datos de la notificación
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (!value.messages && !value.statuses) {
        return null;
      }

      // Si es una actualización de estado de mensaje
      if (value.statuses && value.statuses.length > 0) {
        const status = value.statuses[0];
        return {
          type: 'status',
          phone: status.recipient_id,
          status: {
            messageId: status.id,
            status: status.status,
            timestamp: status.timestamp
          }
        };
      }

      // Si es un mensaje entrante
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        return {
          type: 'message',
          phone: message.from,
          message: {
            id: message.id,
            type: message.type,
            timestamp: message.timestamp,
            text: message.text?.body,
            media: message.image || message.audio || message.document || message.video
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error processing WhatsApp webhook event:', error);
      return null;
    }
  }
}

export default new WhatsAppService();