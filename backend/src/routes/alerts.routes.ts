import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as alertsController from '../controllers/alerts.controller.js';

const router = Router();

router.get('/stats', alertsController.getStats);
router.get('/open', alertsController.getOpenAlerts);
router.get('/', alertsController.getAll);
router.get('/:id', alertsController.getById);

router.post('/', validate(alertsController.createAlertSchema), alertsController.create);

router.use(authenticate);

router.put('/:id', operatorAndAbove, auditLog('alerts'), alertsController.update);
router.post('/:id/acknowledge', operatorAndAbove, auditLog('alerts'), alertsController.acknowledge);
router.post('/:id/resolve', operatorAndAbove, auditLog('alerts'), alertsController.resolve);

export default router;
