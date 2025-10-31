import jwt, { JwtPayload } from 'jsonwebtoken'

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
    const decoded = jwt.verify(token, secretKey)
    console.log(decoded);
    

    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload!')
    }
    return decoded
}