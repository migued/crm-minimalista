import express from 'express';
import {
  createEmailCampaign,
  updateEmailCampaign,
  getEmailCampaignsByOrganization,
  getEmailCampaignById,
  deleteEmailCampaign,
  scheduleEmailCampaign,
  updateEmailCampaignStatus,
  getEmailCampaignStats,
  sendTestEmailCampaign,
  sendEmailCampaign,
  createEmailTemplate,
  getEmailTemplates,
  createAudienceSegment,
  getAudienceSegmentsByOrganization,
  getContactsInSegment
} from '../controllers/emailController';

const router = express.Router();

// Rutas para campañas de email
router.post('/campaigns', createEmailCampaign);
router.put('/campaigns/:id', updateEmailCampaign);
router.get('/campaigns/organization/:organizationId', getEmailCampaignsByOrganization);
router.get('/campaigns/:id', getEmailCampaignById);
router.delete('/campaigns/:id', deleteEmailCampaign);
router.post('/campaigns/:id/schedule', scheduleEmailCampaign);
router.patch('/campaigns/:id/status', updateEmailCampaignStatus);
router.get('/campaigns/:id/stats', getEmailCampaignStats);
router.post('/campaigns/:id/test', sendTestEmailCampaign);
router.post('/campaigns/:id/send', sendEmailCampaign);

// Rutas para plantillas de email
router.post('/templates', createEmailTemplate);
router.get('/templates', getEmailTemplates);

// Rutas para segmentos de audiencia
router.post('/segments', createAudienceSegment);
router.get('/segments/organization/:organizationId', getAudienceSegmentsByOrganization);
router.get('/segments/:id/contacts', getContactsInSegment);

export default router;