import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as gridController from '../controllers/grid.controller.js';

const router = Router();

router.get('/status', gridController.getStatus);
router.get('/constraints', gridController.getConstraints);
router.get('/topology', gridController.getTopology);
router.get('/snapshots', gridController.getSnapshots);
router.get('/snapshots/:id', gridController.getSnapshotById);

router.post('/power-flow', authenticate, operatorAndAbove, auditLog('grid_simulation'), validate(gridController.powerFlowSchema), gridController.runPowerFlow);

export default router;
