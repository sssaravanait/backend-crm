export type ErrorDetails = Record<string, string[]>;

export class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: ErrorDetails;
    readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string,
        details?: ErrorDetails,
        code: string = AppError.codeFor(statusCode),
        isOperational = statusCode < 500,
    ) {
        super(message);
        // Keeps `instanceof AppError` reliable when TypeScript targets ES5
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;
    }

    static badRequest(message = "Bad request", details?: ErrorDetails) {
        return new AppError(400, message, details, "BAD_REQUEST");
    }

    static unauthorized(message = "Authentication required") {
        return new AppError(401, message, undefined, "UNAUTHORIZED");
    }

    static forbidden(message = "You do not have permission to perform this action") {
        return new AppError(403, message, undefined, "FORBIDDEN");
    }

    static notFound(message = "Resource not found") {
        return new AppError(404, message, undefined, "NOT_FOUND");
    }

    static conflict(message = "Resource already exists", details?: ErrorDetails) {
        return new AppError(409, message, details, "CONFLICT");
    }

    static validation(details: ErrorDetails, message = "Validation failed") {
        return new AppError(422, message, details, "VALIDATION_ERROR");
    }

    static tooManyRequests(message = "Too many requests, please try again later") {
        return new AppError(429, message, undefined, "TOO_MANY_REQUESTS");
    }

    static internal(message = "Internal server error") {
        // Not operational: a programming or infrastructure bug, not an expected failure
        return new AppError(500, message, undefined, "INTERNAL_ERROR", false);
    }

    private static codeFor(statusCode: number): string {
        const codes: Record<number, string> = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            413: "PAYLOAD_TOO_LARGE",
            422: "VALIDATION_ERROR",
            429: "TOO_MANY_REQUESTS",
        };
        return codes[statusCode] ?? (statusCode >= 500 ? "INTERNAL_ERROR" : "ERROR");
    }
}