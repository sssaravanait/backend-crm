import type { RequestHandler } from "express";

const SILENT_PATHS = new Set(['/api/health']);

export const requestLogger: RequestHandler = (req, res, next) => {
    if (SILENT_PATHS.has(req.path)) {
        return next();
    }
    
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1000000;
        const timestamp = new Date().toISOString();

        console.log(
            `[${timestamp}]: ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(1)}ms`
        );
    });

    next();
};