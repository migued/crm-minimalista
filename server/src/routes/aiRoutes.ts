import express from 'express';
import * as aiAgentController from '../controllers/aiAgentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Rutas de Agentes
router.post('/agents', aiAgentController.createAgent);
router.get('/agents/organization/:organizationId', aiAgentController.getAgentsByOrganization);
router.get('/agents/:id', aiAgentController.getAgentById);
router.put('/agents/:id', aiAgentController.updateAgent);
router.delete('/agents/:id', aiAgentController.deleteAgent);

// Rutas para plantillas
router.get('/templates', aiAgentController.getAgentTemplates);
router.post('/templates', aiAgentController.createAgentTemplate);
router.post('/agents/from-template', aiAgentController.createAgentFromTemplate);

// Rutas para procesamiento de mensajes
router.post('/process', aiAgentController.processMessageWithAgent);
router.post('/evaluate-trigger', aiAgentController.evaluateAgentTrigger);
router.post('/analyze', aiAgentController.analyzeText);
router.post('/summarize', aiAgentController.summarizeConversation);

export default router;