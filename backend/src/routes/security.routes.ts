import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import * as securityController from '../controllers/security.controller.js';

const router = Router();

router.use(authenticate);

router.get('/audit-logs', adminOnly, securityController.getAuditLogs);
router.get('/sessions', adminOnly, securityController.getSessions);
router.delete('/sessions/:id', adminOnly, auditLog('sessions'), securityController.revokeSession);
router.get('/stats', securityController.getStats);

export default router;
