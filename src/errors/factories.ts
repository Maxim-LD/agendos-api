import { AppError } from "./app-error"
import { ErrorCodes } from "./error-codes"

export const badRequestError = (message: string) => {
    return new AppError(message, 400, ErrorCodes.BAD_REQUEST)
}

export const notFoundError = (message: string) => {
   return new AppError(message, 404, ErrorCodes.NOT_FOUND)
}

export const validationError = (message: string) => {
    return new AppError(message, 422, ErrorCodes.VALIDATION_ERROR)
}

export const conflictError = (message: string) => {
    return new AppError(message, 409, ErrorCodes.CONFLICT_ERROR)
}

export const unauthorizedError = (message: string) => {
    return new AppError(message, 401, ErrorCodes.UNAUTHORIZED)
}

export const forbiddenError = (message: string = 'Access forbidden') => {
    return new AppError(message, 403, ErrorCodes.FORBIDDEN)
}

export const invalidTokenError =(message: string = 'Invalid or malformed token') => {
    return new AppError(message, 401, ErrorCodes.INVALID_TOKEN);
}