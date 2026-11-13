import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';
import { LoginDto, RegisterDto, AuthUser } from '../types/auth.types';
import { clearAuthCookie, setAuthCookie } from '../utils/auth-cookie';

/**
 * Controllers are thin. They read validated input, call a service,
 * and write the HTTP response. They contain no business rules and no database access.
 * Input is already validated by middleware, so the casts below are safe.
 */

const register = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await authService.register(req.body as RegisterDto);
    setAuthCookie(res, token);
    sendSuccess(res, { user }, 201);
};

const login = async (req: Request, res: Response) => {
    const { user, token } = await authService.login(req.body as LoginDto);
    setAuthCookie(res, token);
    sendSuccess(res, { user });
};

const logout = async (req: Request, res: Response) => {
    // JWTs are stateless, so logout only clears the cookie. See "Known limits" below.
    clearAuthCookie(res);
    res.status(204).end();
};

const me = async (req: Request, res: Response) => {
    // Implementation for user profile
    const { id } = req.user as AuthUser;
    const user = await authService.getProfile(id);
    sendSuccess(res, { user });
};

export const authController = { register, login, logout, me };