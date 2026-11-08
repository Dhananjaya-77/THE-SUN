import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(authController.registerSchema), authController.register);
router.post('/login', validate(authController.loginSchema), authController.login);
router.post('/refresh', validate(authController.refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
