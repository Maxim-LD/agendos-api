import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { Request } from 'express';

export const globalRatelimit = rateLimit({
    windowMs: config.rateLimit.windowMS,
    max: config.rateLimit.maxRequests, 
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
})

export const authRateLimit = rateLimit({
    windowMs: config.rateLimit.windowMS, // 15 minutes
    max: 20, // limit each IP to 5 requests per windowMs for auth endpoints
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    skip: (req: Request) => {
        // Skip rate limiting for successful requests
        return req.method === 'GET';
    }
});