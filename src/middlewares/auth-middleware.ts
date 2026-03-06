import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "./error-handler";
import { unauthorizedError } from "../errors/factories";
import { getCache } from "../utils/caching";
import { verifyToken } from "../utils/token";
import { secretConfig } from "../config";

// Define a custom interface that extends the Express Request type
export interface AuthRequest extends Request {
    user?: string | JwtPayload;
    token?: string;
}

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {  
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) throw unauthorizedError('Access denied. No token provided!')
    
    // Check if the token is blacklisted
    const isBlacklisted = await getCache(`blacklist:${token}`)
    if (isBlacklisted) throw unauthorizedError('Token has been invalidated. Please log in again!')
    
    const decoded = verifyToken(token, secretConfig.secretKey)

    req.user = decoded
    req.token = token

    next()
})