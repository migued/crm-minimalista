import { CampaignStatus, CampaignType, EmailCampaign } from '../../models/EmailCampaign';
import Contact from '../../models/Contact';
import mongoose from 'mongoose';
import AudienceSegment from '../../models/AudienceSegment';
import EmailTemplate from '../../models/EmailTemplate';
import Organization from '../../models/Organization';

/**
 * Servicio para gestionar campañas de email
 */
class EmailService {
  /**
   * Crea una nueva campaña de email
   */
  public async createCampaign(campaignData: Partial<EmailCampaign>): Promise<EmailCampaign> {
    try {
      // Validar datos mínimos
      if (!campaignData.name || !campaignData.subject || !campaignData.content || !campaignData.segmentId || !campaignData.organizationId) {
        throw new Error('Datos incompletos para crear la campaña');
      }

      // Verificar que la organización existe
      const organization = await Organization.findById(campaignData.organizationId);
      if (!organization) {
        throw new Error(`Organización no encontrada: ${campaignData.organizationId}`);
      }

      // Verificar que el segmento existe
      const segment = await AudienceSegment.findById(campaignData.segmentId);
      if (!segment) {
        throw new Error(`Segmento no encontrado: ${campaignData.segmentId}`);
      }

      // Si se proporciona un ID de plantilla, verificar que existe
      if (campaignData.templateId) {
        const template = await EmailTemplate.findById(campaignData.templateId);
        if (!template) {
          throw new Error(`Plantilla no encontrada: ${campaignData.templateId}`);
        }
      }

      // Crear la campaña
      const campaign = new EmailCampaign({
        ...campaignData,
        status: campaignData.status || CampaignStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await campaign.save();
      return campaign;
    } catch (error) {
      console.error('Error al crear campaña de email:', error);
      throw error;
    }
  }

  /**
   * Actualiza una campaña de email existente
   */
  public async updateCampaign(campaignId: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // No permitir cambiar la organización
      if (updates.organizationId && updates.organizationId.toString() !== campaign.organizationId.toString()) {
        throw new Error('No se puede cambiar la organización de una campaña');
      }

      // Si se cambia el segmento, verificar que existe
      if (updates.segmentId && updates.segmentId.toString() !== campaign.segmentId.toString()) {
        const segment = await AudienceSegment.findById(updates.segmentId);
        if (!segment) {
          throw new Error(`Segmento no encontrado: ${updates.segmentId}`);
        }
      }

      // Si se cambia la plantilla, verificar que existe
      if (updates.templateId && updates.templateId.toString() !== campaign.templateId?.toString()) {
        const template = await EmailTemplate.findById(updates.templateId);
        if (!template) {
          throw new Error(`Plantilla no encontrada: ${updates.templateId}`);
        }
      }

      // Actualizar la campaña
      const updatedCampaign = await EmailCampaign.findByIdAndUpdate(
        campaignId,
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!updatedCampaign) {
        throw new Error(`No se pudo actualizar la campaña: ${campaignId}`);
      }

      return updatedCampaign;
    } catch (error) {
      console.error('Error al actualizar campaña de email:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las campañas de una organización
   */
  public async getCampaignsByOrganization(organizationId: string): Promise<EmailCampaign[]> {
    try {
      return await EmailCampaign.find({ organizationId })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error al obtener campañas de email:', error);
      throw error;
    }
  }

  /**
   * Obtiene una campaña por su ID
   */
  public async getCampaignById(campaignId: string): Promise<EmailCampaign> {
    try {
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }
      return campaign;
    } catch (error) {
      console.error('Error al obtener campaña de email:', error);
      throw error;
    }
  }

  /**
   * Elimina una campaña
   */
  public async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const result = await EmailCampaign.findByIdAndDelete(campaignId);
      return !!result;
    } catch (error) {
      console.error('Error al eliminar campaña de email:', error);
      throw error;
    }
  }

  /**
   * Programa el envío de una campaña
   */
  public async scheduleCampaign(campaignId: string, sendDate: Date): Promise<EmailCampaign> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // Verificar que la campaña no esté ya enviada
      if (campaign.status === CampaignStatus.COMPLETED) {
        throw new Error('No se puede programar una campaña ya enviada');
      }

      // Verificar que la fecha de envío es futura
      if (sendDate <= new Date()) {
        throw new Error('La fecha de envío debe ser en el futuro');
      }

      // Actualizar la campaña
      campaign.status = CampaignStatus.SCHEDULED;
      campaign.schedule = {
        ...campaign.schedule,
        sendDate
      };
      campaign.updatedAt = new Date();

      await campaign.save();
      return campaign;
    } catch (error) {
      console.error('Error al programar campaña de email:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado de una campaña
   */
  public async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<EmailCampaign> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // No permitir cambiar a completado manualmente
      if (status === CampaignStatus.COMPLETED && campaign.status !== CampaignStatus.COMPLETED) {
        throw new Error('No se puede marcar una campaña como completada manualmente');
      }

      // No permitir cambiar una campaña completada
      if (campaign.status === CampaignStatus.COMPLETED) {
        throw new Error('No se puede cambiar el estado de una campaña ya enviada');
      }

      // Actualizar el estado
      campaign.status = status;
      campaign.updatedAt = new Date();

      await campaign.save();
      return campaign;
    } catch (error) {
      console.error('Error al actualizar estado de campaña:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de una campaña
   */
  public async getCampaignStats(campaignId: string): Promise<any> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // En un ambiente real, aquí se consultarían las estadísticas reales
      // Por ahora, devolvemos datos de simulación
      return {
        totalSent: 5000 + Math.floor(Math.random() * 2000),
        delivered: 4800 + Math.floor(Math.random() * 150),
        opened: 2400 + Math.floor(Math.random() * 500),
        clicked: 800 + Math.floor(Math.random() * 200),
        bounced: 150 + Math.floor(Math.random() * 50),
        unsubscribed: 20 + Math.floor(Math.random() * 15),
        openRate: 48 + Math.floor(Math.random() * 10),
        clickRate: 16 + Math.floor(Math.random() * 5),
        timeline: this.generateTimelineData(24),
        deviceStats: {
          desktop: 45 + Math.floor(Math.random() * 15),
          mobile: 35 + Math.floor(Math.random() * 15),
          tablet: 5 + Math.floor(Math.random() * 5)
        },
        locationStats: [
          { name: 'México', value: 2500, percentage: 50 },
          { name: 'Estados Unidos', value: 1000, percentage: 20 },
          { name: 'Colombia', value: 750, percentage: 15 },
          { name: 'España', value: 500, percentage: 10 },
          { name: 'Otros', value: 250, percentage: 5 }
        ],
        linkPerformance: [
          { url: 'https://example.com/product1', clicks: 320, uniqueClicks: 280, clickRate: 5.6 },
          { url: 'https://example.com/product2', clicks: 245, uniqueClicks: 210, clickRate: 4.2 },
          { url: 'https://example.com/product3', clicks: 180, uniqueClicks: 165, clickRate: 3.3 },
          { url: 'https://example.com/product4', clicks: 150, uniqueClicks: 130, clickRate: 2.6 },
          { url: 'https://example.com/product5', clicks: 105, uniqueClicks: 95, clickRate: 1.9 }
        ]
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de campaña:', error);
      throw error;
    }
  }

  /**
   * Genera datos de actividad en línea de tiempo para simulación
   */
  private generateTimelineData(hours: number): { opens: any[]; clicks: any[] } {
    const opens: any[] = [];
    const clicks: any[] = [];
    
    const totalOpens = 2400 + Math.floor(Math.random() * 500);
    const totalClicks = 800 + Math.floor(Math.random() * 200);
    
    let remainingOpens = totalOpens;
    let remainingClicks = totalClicks;
    
    // Primeras 6 horas tienen el 70% de la actividad
    for (let i = 0; i < 6; i++) {
      const openPortion = Math.floor((Math.random() * 0.2 + 0.1) * totalOpens * 0.7);
      const clickPortion = Math.floor((Math.random() * 0.2 + 0.1) * totalClicks * 0.7);
      
      remainingOpens -= openPortion;
      remainingClicks -= clickPortion;
      
      opens.push({
        label: `${i}h`,
        value: openPortion
      });
      
      clicks.push({
        label: `${i}h`,
        value: clickPortion
      });
    }
    
    // Resto de horas
    const perHourOpens = remainingOpens / (hours - 6);
    const perHourClicks = remainingClicks / (hours - 6);
    
    for (let i = 6; i < hours; i++) {
      const varianceOpens = Math.random() * 0.5 + 0.75; // 75%-125% variance
      const varianceClicks = Math.random() * 0.5 + 0.75;
      
      opens.push({
        label: `${i}h`,
        value: Math.floor(perHourOpens * varianceOpens)
      });
      
      clicks.push({
        label: `${i}h`,
        value: Math.floor(perHourClicks * varianceClicks)
      });
    }
    
    return { opens, clicks };
  }

  /**
   * Obtiene contactos en un segmento
   */
  public async getContactsInSegment(segmentId: string): Promise<number> {
    try {
      // Verificar que el segmento existe
      const segment = await AudienceSegment.findById(segmentId);
      if (!segment) {
        throw new Error(`Segmento no encontrado: ${segmentId}`);
      }

      // En un ambiente real, aquí se aplicarían los criterios del segmento
      // Por ahora, devolvemos un número aleatorio
      return 1000 + Math.floor(Math.random() * 4000);
    } catch (error) {
      console.error('Error al obtener contactos en segmento:', error);
      throw error;
    }
  }

  /**
   * Envía una campaña de prueba
   */
  public async sendTestCampaign(campaignId: string, testEmails: string[]): Promise<boolean> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // Verificar que hay emails de prueba
      if (!testEmails || testEmails.length === 0) {
        throw new Error('No se proporcionaron emails de prueba');
      }

      // En un ambiente real, aquí se enviarían los emails de prueba
      // Por ahora, simulamos un envío exitoso
      console.log(`Simulando envío de campaña ${campaignId} a ${testEmails.join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('Error al enviar campaña de prueba:', error);
      throw error;
    }
  }

  /**
   * Envía una campaña
   */
  public async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      // Verificar que la campaña existe
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaña no encontrada: ${campaignId}`);
      }

      // Verificar que la campaña no está ya enviada
      if (campaign.status === CampaignStatus.COMPLETED) {
        throw new Error('La campaña ya ha sido enviada');
      }

      // Verificar que la campaña está en estado borrador o programada
      if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
        throw new Error(`No se puede enviar una campaña en estado ${campaign.status}`);
      }

      // En un ambiente real, aquí se enviaría la campaña
      // Por ahora, actualizamos el estado
      campaign.status = CampaignStatus.COMPLETED;
      campaign.sentAt = new Date();
      campaign.updatedAt = new Date();

      await campaign.save();
      
      return true;
    } catch (error) {
      console.error('Error al enviar campaña:', error);
      throw error;
    }
  }
}

export default new EmailService();