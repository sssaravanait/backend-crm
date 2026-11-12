import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/app-error';

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details === undefined ? {} : { details: err.details }),
            },
        });
        return;
    }

    console.error(
        'Unhandled error:',
        err instanceof Error ? err.stack ?? err.message : 'Non-Error value thrown',
    );
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
        },
    });
};
