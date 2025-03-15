import express from 'express';
import * as whatsappController from '../controllers/whatsappController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Rutas públicas para webhooks de WhatsApp (no requieren autenticación)
router.get('/webhook', whatsappController.verifyWhatsAppWebhook);
router.post('/webhook', whatsappController.handleWhatsAppWebhook);

// Rutas protegidas (requieren autenticación)
router.post('/config', authMiddleware, whatsappController.configureWhatsApp);
router.get('/config/:organizationId', authMiddleware, whatsappController.getWhatsAppConfig);
router.get('/templates', authMiddleware, whatsappController.getWhatsAppTemplates);
router.post('/check-number', authMiddleware, whatsappController.checkWhatsAppNumber);
router.post('/send', authMiddleware, whatsappController.sendWhatsAppMessage);
router.post('/sync-contacts/:organizationId', authMiddleware, whatsappController.syncContactsWithWhatsApp);

export default router;