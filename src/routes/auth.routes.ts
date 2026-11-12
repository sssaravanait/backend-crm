import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

/**
 * Middleware order matters: rate-limit first (cheapest rejection),
 * then validation, then the controller.
 */

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authController.me);