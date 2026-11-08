import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as batteriesController from '../controllers/batteries.controller.js';

const router = Router();

router.get('/fleet', batteriesController.getFleet);
router.get('/', batteriesController.getAll);
router.get('/:id', batteriesController.getById);
router.get('/:id/schedules', batteriesController.getSchedules);

router.use(authenticate);

router.post('/', operatorAndAbove, auditLog('batteries'), validate(batteriesController.createBatterySchema), batteriesController.create);
router.put('/:id', operatorAndAbove, auditLog('batteries'), validate(batteriesController.updateBatterySchema), batteriesController.update);
router.delete('/:id', adminOnly, auditLog('batteries'), batteriesController.remove);

router.post('/:id/schedules', operatorAndAbove, auditLog('battery_schedules'), validate(batteriesController.createScheduleSchema), batteriesController.createSchedule);
router.put('/schedules/:scheduleId', operatorAndAbove, auditLog('battery_schedules'), batteriesController.updateSchedule);
router.delete('/schedules/:scheduleId', operatorAndAbove, auditLog('battery_schedules'), batteriesController.removeSchedule);

export default router;
