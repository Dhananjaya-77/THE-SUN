import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as forecastController from '../controllers/forecast.controller.js';

const router = Router();

router.get('/latest', forecastController.getLatest);
router.get('/accuracy', forecastController.getAccuracy);
router.get('/', forecastController.getAll);
router.get('/:id', forecastController.getById);

router.use(authenticate);

router.post('/', operatorAndAbove, auditLog('forecasts'), validate(forecastController.createForecastSchema), forecastController.create);
router.delete('/:id', adminOnly, auditLog('forecasts'), forecastController.remove);

export default router;
