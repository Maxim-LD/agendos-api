export class AppError extends Error {
    public readonly statusCode: number
    public readonly errorCode: string
    public readonly isOperational: boolean

    constructor(message: string, statusCode: number, errorCode: string, isOperational: boolean = true) {
        super(message)

        // AppError properties
        this.statusCode = statusCode
        this.errorCode = errorCode
        this.isOperational = isOperational // means the error is expected or manageable, not a bug

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400, 'BAD_REQUEST')
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND')
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 422, 'VALIDATION_ERROR')
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT_ERROR')
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, 401, 'UNAUTHORIZED')
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN')
    }
}

export class InvalidTokenError extends AppError {
    constructor(message: string = 'Invalid or malformed token') {
        super(message, 401, 'INVALID_TOKEN');
    }
}