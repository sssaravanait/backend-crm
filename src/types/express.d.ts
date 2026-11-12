import type { AuthUser } from './auth.types';

// Augments Express's Request so req.user is typed across the codebase.
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export { };