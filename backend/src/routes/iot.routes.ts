import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as iotController from '../controllers/iot.controller.js';

const router = Router();

router.get('/stats', iotController.getStats);
router.get('/gateways', iotController.getGateways);
router.get('/devices', iotController.getAll);
router.get('/devices/:id', iotController.getById);

router.post('/devices/:id/heartbeat', validate(iotController.heartbeatSchema), iotController.heartbeat);

router.use(authenticate);

router.post('/devices', operatorAndAbove, auditLog('iot_devices'), validate(iotController.createDeviceSchema), iotController.create);
router.put('/devices/:id', operatorAndAbove, auditLog('iot_devices'), validate(iotController.updateDeviceSchema), iotController.update);
router.delete('/devices/:id', adminOnly, auditLog('iot_devices'), iotController.remove);

export default router;
