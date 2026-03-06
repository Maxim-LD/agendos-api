export class AppError extends Error {
    public readonly statusCode: number
    public readonly errorCode: string
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number,
        errorCode: string,
        isOperational: boolean = true
    ) {
        super(message)

        // AppError properties
        this.statusCode = statusCode
        this.errorCode = errorCode
        this.isOperational = isOperational // means the error is expected or manageable, not a bug

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

