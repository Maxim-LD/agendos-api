import crypto from 'crypto'
import { secretConfig } from "../config";
import { getCache, setCache } from "../utils/caching";
import { generateToken, verifyToken } from "../utils/token";
import { UserRepository } from '../repository/UserRepository';
import { forbiddenError, invalidTokenError } from '../errors/factories';

export class TokenService {
    /**
   * @usage can only be called with classname because it is static
   * @param user
   * @returns accessToken and refreshToken
   */
    static async issueAuthTokens(
        user: {
            sn: bigint,
            id: string;
            email: string
        }
    ) {
        const { accessToken, refreshToken } = this.buildTokens(user); // call private static fn
        await setCache(
            `refresh-token:${user.id}`,
            refreshToken,
            secretConfig.refreshTokenExpiry
        );

        return { accessToken, refreshToken };
    }

    private static buildTokens(
        user: {
            id: string;
            email: string,
            sn?: bigint
        }
    ) {
        const accessToken = generateToken(
            { id: user.id, email: user.email, sn: user.sn },
            secretConfig.secretKey,
            '30m'
        );
        
        const refreshToken = generateToken(
            { id: user.id, email: user.email },
            secretConfig.refreshSecret,
            secretConfig.refreshTokenExpiry
        );
        
        return { accessToken, refreshToken };
    }

    static async issueEmailToken(user: { id: string; email: string; }): Promise<string> {
        const token = generateToken(
            { user_id: user.id, email: user.email },
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

    static async handleRefreshAccessToken(token: string) {
        const decoded = verifyToken(token, secretConfig.refreshSecret)

        const cachedResult = await getCache<string>(`refresh-token:${decoded.user_id}`)
        if (!cachedResult || cachedResult.data !== token ) throw invalidTokenError('Invalid refresh token!')
        
        const newToken = generateToken(
            { user_id: decoded.user_id, email: decoded.email, user_sn: decoded.user_sn },
            secretConfig.secretKey,
            '30m'
        )

        const dbUser = await new UserRepository().findById(decoded.user_id)
        if (!dbUser) throw forbiddenError('Invalid user!')
        
        return { user: dbUser, token: newToken }
    }
}