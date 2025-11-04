import { generateToken, verifyToken } from '../../../src/utils/token'
import jwt from 'jsonwebtoken';
/**
 * This is to test the functionality of the fn in question 
 * @params payload(Record<str, any>), secret(str), expiry(jwtOption object)
 * @returns token(str)
 * 
 * Test case scenarios
 * 1. happy path case
 * 2. edge case
 * 3. error case
 */

describe('generateToken', () => {
    const payload = { userId: 123 }
    const secret = 'test-secret'
    
    // 1. Happy path case
    it('should generate a valid JWT token with a string expiry', () => {
        const token = generateToken(payload, secret, '1h')
        expect(typeof token).toBe('string')
        expect(token.split('.').length).toBe(3)

        const decoded = verifyToken(token, secret) as jwt.JwtPayload;
        expect(decoded.userId).toBe(payload.userId)
        expect(decoded.iat).toBeDefined()
        expect(decoded.exp).toBeDefined()
    })

    it('should generate a valid JWT token with a numeric expiry (in seconds)', () => {
        const expiresInSeconds = 3600; // 1 hour
        const token = generateToken(payload, secret, expiresInSeconds)
        expect(typeof token).toBe('string')

        const decoded = verifyToken(token, secret) as jwt.JwtPayload;
        expect(decoded.userId).toBe(payload.userId)
        // Check if expiry is roughly what we set
        const timeDifference = decoded.exp! - decoded.iat!;
        expect(timeDifference).toBe(expiresInSeconds);
    })

    // 2. Edge cases
    it('should handle an empty payload', () => {
        const token = generateToken({}, secret, '1m');
        expect(typeof token).toBe('string');
        const decoded = verifyToken(token, secret) as jwt.JwtPayload;
        expect(decoded.iat).toBeDefined();
    });

    // 3. Error cases
    it('should throw an error if payload is not a plain object', () => {
        // jsonwebtoken library expects a plain object for the payload.
        // Let's test with a string.
        const invalidPayload: any = 'not-an-object';
        expect(() => generateToken(invalidPayload, secret, '1h'))
            .toThrow();
    })
})