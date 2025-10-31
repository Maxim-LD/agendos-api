import crypto from 'crypto'
import { secretConfig } from "../config";
import { setCache } from "../utils/caching";
import { generateToken } from "../utils/token";
import { hashPassword } from '../utils/hash';

export class TokenService {
  /**
   * @usage can only be called with classname because it is static
   * @param user
   * @returns accessToken and refreshToken
   */
    static async issueAuthTokens(user: { id: string; email: string }) {
        const { accessToken, refreshToken } = this.buildTokens(user); // call private static
        await setCache(`refresh-token:${user.id}`, refreshToken, secretConfig.refreshTokenExpiry);
        return { accessToken, refreshToken };
    }

    private static buildTokens(user: { id: string; email: string }) {
        const accessToken = generateToken(
            { user_id: user.id, email: user.email },
            secretConfig.secretKey,
            '30'
        );
        
        const refreshToken = generateToken(
            { user_id: user.id, email: user.email },
            secretConfig.refreshSecret,
            secretConfig.refreshTokenExpiry
        );
        
        return { accessToken, refreshToken };
    }

    static async issueEmailToken({ user_id, email }: { user_id: string; email: string; }): Promise<string> {
        const token = generateToken(
            { user_id, email },
            secretConfig.emailSecret,
            '1h'
        )
        return token
    }

    static async issueResetToken() {
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 15);     

        return { resetToken, resetTokenExpiry }
    }
}