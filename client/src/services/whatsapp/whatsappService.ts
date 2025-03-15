import axios from 'axios';

// Tipos
interface SendMessagePayload {
  contactId: string;
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
  attachments?: Array<{
    type: 'image' | 'document' | 'audio' | 'video';
    url: string;
    caption?: string;
  }>;
}

interface TemplateMessage {
  id: string;
  name: string;
  category: string;
  language: string;
  components: any[];
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

// NOTA: Esta es una implementación simulada para desarrollo
// En producción, se conectaría a la API real de WhatsApp Business
class WhatsAppService {
  private apiUrl = '/api/whatsapp';
  private mockData = {
    templates: [
      {
        id: 'template_1',
        name: 'bienvenida',
        category: 'MARKETING',
        language: 'es',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Bienvenido a {{1}}',
            parameters: [{ type: 'text', text: 'nombre_negocio' }]
          },
          {
            type: 'BODY',
            text: 'Hola {{1}}, gracias por contactarnos. Estamos aquí para atenderte. ¿En qué podemos ayudarte hoy?',
            parameters: [{ type: 'text', text: 'nombre_cliente' }]
          }
        ],
        status: 'APPROVED'
      },
      {
        id: 'template_2',
        name: 'seguimiento',
        category: 'UTILITY',
        language: 'es',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Seguimiento de tu interés en {{1}}',
            parameters: [{ type: 'text', text: 'producto_servicio' }]
          },
          {
            type: 'BODY',
            text: 'Hola {{1}}, queríamos saber si tienes alguna pregunta adicional sobre {{2}} que te mostramos anteriormente.',
            parameters: [
              { type: 'text', text: 'nombre_cliente' },
              { type: 'text', text: 'producto_servicio' }
            ]
          }
        ],
        status: 'APPROVED'
      },
      {
        id: 'template_3',
        name: 'confirmacion_cita',
        category: 'UTILITY',
        language: 'es',
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Confirmación de cita',
            parameters: []
          },
          {
            type: 'BODY',
            text: 'Hola {{1}}, este mensaje es para confirmar tu cita para el {{2}} a las {{3}}. Por favor responde "CONFIRMAR" para mantener la cita o "CAMBIAR" si necesitas reagendarla.',
            parameters: [
              { type: 'text', text: 'nombre_cliente' },
              { type: 'text', text: 'fecha' },
              { type: 'text', text: 'hora' }
            ]
          }
        ],
        status: 'APPROVED'
      }
    ]
  };

  // Obtener plantillas disponibles
  async getTemplates(): Promise<TemplateMessage[]> {
    try {
      // En un entorno real, esta sería una llamada a la API:
      // const response = await axios.get(`${this.apiUrl}/templates`);
      // return response.data;
      
      // En desarrollo, devolvemos datos simulados
      return new Promise(resolve => {
        setTimeout(() => resolve(this.mockData.templates), 500);
      });
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      throw error;
    }
  }

  // Enviar mensaje de WhatsApp
  async sendMessage(payload: SendMessagePayload): Promise<{ id: string; status: string }> {
    try {
      // En un entorno real, esta sería una llamada a la API:
      // const response = await axios.post(`${this.apiUrl}/send`, payload);
      // return response.data;
      
      // En desarrollo, simulamos una respuesta exitosa
      return new Promise(resolve => {
        console.log('Enviando mensaje:', payload);
        setTimeout(() => {
          resolve({ 
            id: `msg_${Date.now()}`, 
            status: 'sent' 
          });
        }, 700);
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  // Verificar estado de un número en WhatsApp
  async checkNumber(phoneNumber: string): Promise<{ exists: boolean; status: string }> {
    try {
      // En un entorno real, esta sería una llamada a la API:
      // const response = await axios.get(`${this.apiUrl}/check?number=${phoneNumber}`);
      // return response.data;
      
      // En desarrollo, simulamos que la mayoría de números existen
      return new Promise(resolve => {
        const exists = Math.random() > 0.2; // 80% probabilidad de que exista
        setTimeout(() => {
          resolve({ 
            exists, 
            status: exists ? 'active' : 'inactive' 
          });
        }, 300);
      });
    } catch (error) {
      console.error('Error al verificar número:', error);
      throw error;
    }
  }

  // Sincronizar contactos con WhatsApp
  async syncContacts(): Promise<{ synced: number; failed: number }> {
    try {
      // En un entorno real, esta sería una llamada a la API:
      // const response = await axios.post(`${this.apiUrl}/sync-contacts`);
      // return response.data;
      
      // En desarrollo, simulamos una sincronización exitosa
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ 
            synced: Math.floor(Math.random() * 50) + 10, 
            failed: Math.floor(Math.random() * 5) 
          });
        }, 1500);
      });
    } catch (error) {
      console.error('Error al sincronizar contactos:', error);
      throw error;
    }
  }
}

export default new WhatsAppService();