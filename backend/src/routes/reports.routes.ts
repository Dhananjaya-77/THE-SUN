import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as reportsController from '../controllers/reports.controller.js';

const router = Router();

router.get('/templates', reportsController.getTemplates);
router.get('/schedules', reportsController.getSchedules);
router.get('/', reportsController.getAll);
router.get('/:id', reportsController.getById);

router.use(authenticate);

router.post('/', operatorAndAbove, auditLog('reports'), validate(reportsController.generateReportSchema), reportsController.generate);
router.delete('/:id', adminOnly, auditLog('reports'), reportsController.remove);

router.post('/schedules', operatorAndAbove, auditLog('report_schedules'), validate(reportsController.createScheduleSchema), reportsController.createSchedule);
router.put('/schedules/:id', operatorAndAbove, auditLog('report_schedules'), reportsController.updateSchedule);
router.delete('/schedules/:id', adminOnly, auditLog('report_schedules'), reportsController.removeSchedule);

export default router;
