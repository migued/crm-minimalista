import { Request, Response } from 'express';
import emailService from '../services/email/EmailService';
import EmailCampaign, { CampaignStatus } from '../models/EmailCampaign';
import EmailTemplate from '../models/EmailTemplate';
import AudienceSegment from '../models/AudienceSegment';
import mongoose from 'mongoose';

// Controlador para campañas de email
export const createEmailCampaign = async (req: Request, res: Response) => {
  try {
    const campaignData = req.body;
    
    // Crear la campaña
    const campaign = await emailService.createCampaign(campaignData);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error al crear campaña de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear campaña de email',
      error: (error as Error).message
    });
  }
};

// Actualizar una campaña
export const updateEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Actualizar la campaña
    const campaign = await emailService.updateCampaign(id, updates);
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error al actualizar campaña de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar campaña de email',
      error: (error as Error).message
    });
  }
};

// Obtener todas las campañas de una organización
export const getEmailCampaignsByOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    
    // Obtener las campañas
    const campaigns = await emailService.getCampaignsByOrganization(organizationId);
    
    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    console.error('Error al obtener campañas de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campañas de email',
      error: (error as Error).message
    });
  }
};

// Obtener una campaña por su ID
export const getEmailCampaignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener la campaña
    const campaign = await emailService.getCampaignById(id);
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error al obtener campaña de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campaña de email',
      error: (error as Error).message
    });
  }
};

// Eliminar una campaña
export const deleteEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Eliminar la campaña
    const result = await emailService.deleteCampaign(id);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Campaña eliminada correctamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Campaña no encontrada'
      });
    }
  } catch (error) {
    console.error('Error al eliminar campaña de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar campaña de email',
      error: (error as Error).message
    });
  }
};

// Programar una campaña
export const scheduleEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sendDate } = req.body;
    
    if (!sendDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de envío es obligatoria'
      });
    }
    
    // Programar la campaña
    const campaign = await emailService.scheduleCampaign(id, new Date(sendDate));
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error al programar campaña de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al programar campaña de email',
      error: (error as Error).message
    });
  }
};

// Cambiar el estado de una campaña
export const updateEmailCampaignStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !Object.values(CampaignStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    // Actualizar el estado
    const campaign = await emailService.updateCampaignStatus(id, status);
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error al actualizar estado de campaña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de campaña',
      error: (error as Error).message
    });
  }
};

// Obtener estadísticas de una campaña
export const getEmailCampaignStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener las estadísticas
    const stats = await emailService.getCampaignStats(id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de campaña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de campaña',
      error: (error as Error).message
    });
  }
};

// Enviar una campaña de prueba
export const sendTestEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testEmails } = req.body;
    
    if (!testEmails || !Array.isArray(testEmails) || testEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren emails de prueba'
      });
    }
    
    // Enviar la campaña de prueba
    const result = await emailService.sendTestCampaign(id, testEmails);
    
    res.status(200).json({
      success: true,
      message: 'Campaña de prueba enviada correctamente'
    });
  } catch (error) {
    console.error('Error al enviar campaña de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar campaña de prueba',
      error: (error as Error).message
    });
  }
};

// Enviar una campaña
export const sendEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Enviar la campaña
    const result = await emailService.sendCampaign(id);
    
    res.status(200).json({
      success: true,
      message: 'Campaña enviada correctamente'
    });
  } catch (error) {
    console.error('Error al enviar campaña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar campaña',
      error: (error as Error).message
    });
  }
};

// Controlador para plantillas de email
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { name, subject, content, category, thumbnailUrl, organizationId, isGlobal } = req.body;
    
    // Validaciones básicas
    if (!name || !subject || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: nombre, asunto, contenido y categoría'
      });
    }
    
    // Si no es global, debe tener organización
    if (!isGlobal && !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere ID de organización para plantillas no globales'
      });
    }
    
    // Crear la plantilla
    const template = new EmailTemplate({
      name,
      subject,
      content,
      category,
      thumbnailUrl,
      organizationId: isGlobal ? undefined : organizationId,
      isGlobal: isGlobal || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await template.save();
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error al crear plantilla de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plantilla de email',
      error: (error as Error).message
    });
  }
};

// Obtener todas las plantillas de una organización o globales
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const { organizationId, category } = req.query;
    
    // Construir query
    let query: any = {};
    if (organizationId) {
      query.$or = [
        { organizationId },
        { isGlobal: true }
      ];
    } else {
      query.isGlobal = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Obtener las plantillas
    const templates = await EmailTemplate.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error al obtener plantillas de email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de email',
      error: (error as Error).message
    });
  }
};

// Controlador para segmentos de audiencia
export const createAudienceSegment = async (req: Request, res: Response) => {
  try {
    const { name, description, organizationId, criteria, isSystem } = req.body;
    
    // Validaciones básicas
    if (!name || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: nombre y organización'
      });
    }
    
    // Crear el segmento
    const segment = new AudienceSegment({
      name,
      description,
      organizationId,
      criteria: criteria || [],
      isSystem: isSystem || false,
      createdAt: new Date(),
      lastUpdated: new Date()
    });
    
    // Simular el conteo de contactos
    segment.count = 1000 + Math.floor(Math.random() * 4000);
    
    await segment.save();
    
    res.status(201).json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Error al crear segmento de audiencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear segmento de audiencia',
      error: (error as Error).message
    });
  }
};

// Obtener todos los segmentos de una organización
export const getAudienceSegmentsByOrganization = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params;
    
    // Obtener los segmentos
    const segments = await AudienceSegment.find({ organizationId }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: segments.length,
      data: segments
    });
  } catch (error) {
    console.error('Error al obtener segmentos de audiencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener segmentos de audiencia',
      error: (error as Error).message
    });
  }
};

// Obtener la cantidad de contactos en un segmento
export const getContactsInSegment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener la cantidad
    const count = await emailService.getContactsInSegment(id);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error al obtener contactos en segmento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contactos en segmento',
      error: (error as Error).message
    });
  }
};