import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as simulationController from '../controllers/simulation.controller.js';

const router = Router();

router.get('/baselines', simulationController.getBaselines);
router.get('/scenarios', simulationController.getAll);
router.get('/scenarios/:id', simulationController.getById);

router.use(authenticate);

router.post('/scenarios', operatorAndAbove, auditLog('simulation'), validate(simulationController.createScenarioSchema), simulationController.createAndRun);
router.put('/scenarios/:id', operatorAndAbove, auditLog('simulation'), simulationController.update);
router.delete('/scenarios/:id', adminOnly, auditLog('simulation'), simulationController.remove);
router.post('/scenarios/:id/save-baseline', operatorAndAbove, auditLog('simulation'), simulationController.saveBaseline);

export default router;
