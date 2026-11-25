import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError, type ErrorDetails } from "../errors/AppError";

const MONGO_DUPLICATE_KEY = 11000;
const JWT_ERRORS = new Set(["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"]);

const zodIssuesToDetails = (error: ZodError): ErrorDetails =>
    error.issues.reduce<ErrorDetails>((acc, issue) => {
        const key = issue.path.join(".") || "_form";
        (acc[key] ??= []).push(issue.message);
        return acc;
    }, {});

/**
 * Converts any thrown value into an AppError with the correct status code.
 * Add new error types here, not in the route handlers.
 */
const toAppError = (err: unknown): AppError => {
    if (err instanceof AppError) return err;

    // Zod errors thrown outside the validate middleware
    if (err instanceof ZodError) {
        return AppError.validation(zodIssuesToDetails(err));
    }

    // Malformed JSON from express.json()
    if (err instanceof SyntaxError && "body" in err) {
        return AppError.badRequest("Malformed JSON body");
    }

    // Body larger than the express.json() limit
    if ((err as { type?: string }).type === "entity.too.large") {
        return new AppError(413, "Request body is too large", undefined, "PAYLOAD_TOO_LARGE");
    }

    // Invalid ObjectId, for example GET /api/customers/not-an-id
    if (err instanceof mongoose.Error.CastError) {
        return AppError.badRequest(`Invalid value for "${err.path}"`);
    }

    // Mongoose schema validation that slipped past the request validators
    if (err instanceof mongoose.Error.ValidationError) {
        const details = Object.fromEntries(
            Object.entries(err.errors).map(([field, e]) => [field, [e.message]]),
        );
        return AppError.validation(details);
    }

    if ((err as { code?: number }).code === MONGO_DUPLICATE_KEY) {
        const field = Object.keys((err as { keyValue?: object }).keyValue ?? {})[0];
        return AppError.conflict(
            "A record with this value already exists",
            field ? { [field]: [`${field} already exists`] } : undefined,
        );
    }

    // JWT errors from the authentication middleware
    if (err instanceof Error && JWT_ERRORS.has(err.name)) {
        return AppError.unauthorized("Invalid or expired token");
    }

    return AppError.internal();
};

// Must be registered after all routes, and must keep the 4-argument signature
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const appError = toAppError(err);

    if (!appError.isOperational || appError.statusCode >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    // Headers already sent: delegate to Express so it can close the connection
    if (res.headersSent) {
        next(err);
        return;
    }

    res.status(appError.statusCode).json({
        message: appError.message,
        code: appError.code,
        statusCode: appError.statusCode,
        ...(appError.details && { errors: appError.details }),
    });
};

// Catches unmatched routes and forwards them to the same error handler
export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};