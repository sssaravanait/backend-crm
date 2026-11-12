import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { isRole } from '../constants/auth.constant';
import type { AuthUser, TokenPayload } from '../types/auth.types.js';
import { UnauthorizedError } from '../utils/app-error';

const ALGORITHM = 'HS256' as const;

export const tokenService = {
    sign(user: AuthUser): string {
        return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET as string, {
            algorithm: ALGORITHM,
            expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
        });
    },

    verify(token: string): TokenPayload {
        let decoded: string | JwtPayload;
        try {
            // Pinning `algorithms` blocks the "alg: none" and algorithm-confusion attacks.
            decoded = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: [ALGORITHM] });
        } catch {
            // Hide the reason (expired, malformed, bad signature) from the client.
            throw new UnauthorizedError('Invalid or expired session');
        }

        if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || !isRole(decoded.role)) {
            throw new UnauthorizedError('Invalid session token');
        }
        return { sub: decoded.sub, role: decoded.role };
    },
};