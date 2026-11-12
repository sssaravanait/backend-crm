/**
 * Base class for all expected (operational) errors.
 * The error middleware turns these into HTTP responses.
 * Anything that is NOT an AppError is treated as a programmer error (500).
 */
export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(statusCode: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

// Subclasses only fix the status and code. They add no logic (Open/Closed).
export class BadRequestError extends AppError {
    constructor(message = 'Bad request', details?: unknown) {
        super(400, 'BAD_REQUEST', message, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, 'UNAUTHORIZED', message);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(403, 'FORBIDDEN', message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, 'NOT_FOUND', message);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists', details?: unknown) {
        super(409, 'CONFLICT', message, details);
    }
}