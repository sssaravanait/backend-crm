import type { Response } from 'express';

/**
 * Standard success envelope: { success: true, data }.
 * Keeps every endpoint's response shape consistent for the frontend.
 */
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
    res.status(statusCode).json({ success: true, data });
};