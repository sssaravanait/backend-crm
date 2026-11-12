import { Router } from 'express';
import { authRouter } from './auth.routes';

/** Aggregates all feature routers under /api. Add new feature routers here. */
export const apiRouter = Router();

// Used by the Docker healthcheck
apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

apiRouter.use('/auth', authRouter);