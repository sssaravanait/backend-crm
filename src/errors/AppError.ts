export class AppError extends Error {
    readonly statusCode: number;
    readonly details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
    }

    static notFound(message = "Resource not found") {
        return new AppError(404, message);
    }

    static unauthorized(message = "Authentication required") {
        return new AppError(401, message);
    }
}