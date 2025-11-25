import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { InvalidTokenError } from './errors'

export const generateToken = (
    payload: Record<string, any>,
    secret: string,
    expiresIn: jwt.SignOptions['expiresIn']
): string => {
    try {
        const options: jwt.SignOptions = { expiresIn }

        return jwt.sign(payload, secret, options)
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(` Token generation failed: ${error.message}`)
        }
        throw error
    }
}

export const verifyToken = (token: string, secretKey: string): JwtPayload => {
    try {
        const decoded = jwt.verify(token, secretKey);

        if (typeof decoded === 'string') {
            throw new InvalidTokenError('Invalid token payload!');
        }
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new InvalidTokenError('Token has expired. Please log in again.');
        }
        throw new InvalidTokenError();
    }
}