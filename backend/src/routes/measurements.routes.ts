import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as measurementsController from '../controllers/measurements.controller.js';

const router = Router();

router.get('/latest', measurementsController.getLatest);
router.get('/aggregated', measurementsController.getAggregated);
router.get('/', measurementsController.getAll);

router.post('/bulk', validate(measurementsController.bulkIngestSchema), measurementsController.ingestBulk);
router.post('/', validate(measurementsController.ingestMeasurementSchema), measurementsController.ingest);

router.delete('/:id', authenticate, adminOnly, auditLog('measurements'), measurementsController.remove);

export default router;
