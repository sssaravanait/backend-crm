import type { Request, RequestHandler } from 'express';
import { AUTH_COOKIE_NAME, type Role } from '../constants/auth.constant';
import { userRepository } from '../repositories/user.repository';
import { tokenService } from '../services/token.service';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error';

const extractToken = (req: Request): string | undefined =>
    req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

/**
 * Verifies the JWT and confirms the user still exists.
 * The DB check means a deleted or deactivated account loses access right away,
 * even if its token hasn't expired yet.
 * Express 5 forwards rejected promises from async handlers to the error middleware.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next(new UnauthorizedError('Authentication required'));
    }

    const { sub } = tokenService.verify(token); // Throws UnauthorizedError on failure
    const user = await userRepository.findById(sub);
    if (!user) {
        return next(new UnauthorizedError('Account no longer exists'));
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
};

/** Role-based access control. Must run after `authenticate`. */
export const authorize =
    (...allowedRoles: Role[]): RequestHandler =>
        (req, _res, next) => {
            if (!req.user) {
                return next(new UnauthorizedError());
            }
            if (!allowedRoles.includes(req.user.role)) {
                return next(new ForbiddenError());
            }
            next();
        };