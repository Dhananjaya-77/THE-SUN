import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as integrationsController from '../controllers/integrations.controller.js';

const router = Router();

router.get('/stats', integrationsController.getStats);
router.get('/', integrationsController.getAll);
router.get('/:id', integrationsController.getById);

router.use(authenticate);

router.post('/', operatorAndAbove, auditLog('integrations'), validate(integrationsController.createIntegrationSchema), integrationsController.create);
router.put('/:id', operatorAndAbove, auditLog('integrations'), validate(integrationsController.updateIntegrationSchema), integrationsController.update);
router.delete('/:id', adminOnly, auditLog('integrations'), integrationsController.remove);

router.post('/:id/test', operatorAndAbove, integrationsController.testConnection);
router.post('/:id/sync', operatorAndAbove, integrationsController.triggerSync);

export default router;
