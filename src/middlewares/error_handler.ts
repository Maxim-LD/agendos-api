import { NextFunction, Request, Response } from "express"
import { IApiResponse } from "../types/api_response"
import { AppError } from "../utils/errors"
import { config } from "../config"
import { logger } from "../utils/logger"

export const notFoundHandler = (req: Request, res: Response): void => {
    const response: IApiResponse = {
        success: false,
        message: `Route ${req.originalUrl} not found!`,
        error: {
            code: 'NOT_FOUND'
        }
    }
    res.status(404).json(response)
}

// Async wrapper
type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<any> | void
    
export const asyncHandler = (fn: ExpressHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => { 
    let statusCode = 500
    let message = 'Internal server error!'
    let errorCode = 'INTERNAL_SERVER_ERROR'
    let isOperational = false

    if (error instanceof AppError) {
        statusCode = error.statusCode
        message = error.message
        errorCode = error.errorCode
        isOperational = error.isOperational
    }

    // DEV MODE
    if (config.nodeEnv === 'development' || !isOperational) {
        // The logger is configured with format.errors({ stack: true }), so it will automatically handle the stack.
        logger.error(`Error`, {
            error,
            // url: req.url,
            // method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }

    // Hide internal details
    if (config.nodeEnv === 'production' && !isOperational) {
        message = 'Something went wrong. Please try again later.';
    }

    const response: IApiResponse = {
        success: false,
        message,
        error: {
            code: errorCode,
            ...(config.nodeEnv === 'development' && { stack: error.stack }) // If it's true, the line becomes only { stack: error.stack }
        }
    }

    res.status(statusCode).json(response)
}