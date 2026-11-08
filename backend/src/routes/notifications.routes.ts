import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = Router();

router.use(authenticate);

router.get('/unread-count', notificationsController.getUnreadCount);
router.post('/mark-all-read', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);
router.get('/', notificationsController.getAll);

router.post('/', validate(notificationsController.createNotificationSchema), notificationsController.create);
router.delete('/:id', adminOnly, auditLog('notifications'), notificationsController.remove);

export default router;
