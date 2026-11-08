import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.get('/stats', aiController.getStats);
router.get('/models', aiController.getModels);
router.get('/models/:id', aiController.getModelById);
router.get('/anomalies', aiController.getAnomalies);
router.get('/recommendations', aiController.getRecommendations);

router.post('/anomalies', validate(aiController.createAnomalySchema), aiController.reportAnomaly);

router.use(authenticate);

router.post('/models', operatorAndAbove, auditLog('ai_models'), validate(aiController.createModelSchema), aiController.createModel);
router.put('/models/:id', operatorAndAbove, auditLog('ai_models'), aiController.updateModel);
router.post('/anomalies/:id/resolve', operatorAndAbove, auditLog('ai_anomalies'), aiController.resolveAnomaly);

router.post('/recommendations', operatorAndAbove, auditLog('ai_recommendations'), validate(aiController.createRecommendationSchema), aiController.createRecommendation);
router.put('/recommendations/:id', operatorAndAbove, auditLog('ai_recommendations'), aiController.updateRecommendationStatus);

export default router;
