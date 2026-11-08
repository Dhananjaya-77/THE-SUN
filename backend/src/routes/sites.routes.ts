import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { operatorAndAbove, adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as sitesController from '../controllers/sites.controller.js';

const router = Router();

router.get('/summary', sitesController.getSummary);
router.get('/', sitesController.getAll);
router.get('/:id/stats', sitesController.getStats);
router.get('/:id', sitesController.getById);

router.use(authenticate);

router.post('/', operatorAndAbove, auditLog('sites'), validate(sitesController.createSiteSchema), sitesController.create);
router.put('/:id', operatorAndAbove, auditLog('sites'), validate(sitesController.updateSiteSchema), sitesController.update);
router.delete('/:id', adminOnly, auditLog('sites'), sitesController.remove);

export default router;
