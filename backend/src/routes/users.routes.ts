import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { auditLog } from '../middleware/audit.js';
import * as usersController from '../controllers/users.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', adminOnly, usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id', adminOnly, auditLog('users'), validate(usersController.updateUserSchema), usersController.update);
router.delete('/:id', adminOnly, auditLog('users'), usersController.remove);

router.get('/:id/scopes', usersController.getScopes);
router.post('/:id/scopes', adminOnly, auditLog('user_scopes'), validate(usersController.assignScopeSchema), usersController.assignScope);
router.delete('/:id/scopes/:siteId', adminOnly, auditLog('user_scopes'), usersController.removeScope);

export default router;
