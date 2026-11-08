import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as controlsController from '../controllers/controls.controller.js';

const router = Router();

router.get('/pending', controlsController.getPending);
router.get('/safety-checks', controlsController.getSafetyChecks);
router.get('/actions', controlsController.getAll);
router.get('/actions/:id', controlsController.getById);

router.use(authenticate);

router.post('/actions', operatorAndAbove, auditLog('controls'), validate(controlsController.createControlActionSchema), controlsController.create);
router.post('/actions/:id/authorize', operatorAndAbove, auditLog('controls'), controlsController.authorizeAction);
router.post('/actions/:id/reject', operatorAndAbove, auditLog('controls'), controlsController.rejectAction);
router.post('/actions/:id/execute', operatorAndAbove, auditLog('controls'), controlsController.executeAction);

export default router;
