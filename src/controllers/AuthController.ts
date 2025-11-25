import { config } from "../config";
import { AuthRequest } from "../middlewares/auth-middleware";
import { asyncHandler } from "../middlewares/error-handler";
import { AuthService } from "../services/AuthService";
import { TokenService } from "../services/TokenService";
import { IApiResponse } from "../types/api-response";
import { BadRequestError, UnauthorizedError, ValidationError } from "../utils/errors";


export class AuthController {
    private authService: AuthService
    private tokenService: TokenService

    constructor() {
        this.authService = new AuthService()
        this.tokenService = new TokenService()
    }

    signUp = asyncHandler(async (req, res): Promise<void> => {
        const { email, password, confirm_password, fullname, status, occupation, date_of_birth, username, phone } = req.body

        if (password !== confirm_password) throw new BadRequestError('Passwords does not match!')

        const user = await this.authService.registerUser({
            email, password,
            username, fullname,
            status, occupation,
            phone, date_of_birth
        })

        if (!user) throw new Error()

        const response: IApiResponse = {
            success: true,
            message: 'User signed up successfully',
            data: user
        }

        res.status(201).json(response)

    })

    login = asyncHandler(async (req: any, res: any): Promise<void> => {
        const { identifier, password } = req.body;

        let user;
        if (identifier.includes('@')) {
            user = await this.authService.handleLogin('email', identifier, password);
        } else if (identifier) {
            user = await this.authService.handleLogin('phone', identifier, password);
        } else {
            throw new UnauthorizedError("Invalid credentials.");
        }

        const isProduction = config.nodeEnv === 'production'
        
        // Store refresh token in cookies
        res.cookie("refresh-token", user.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });
            
        return res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                user: user.user,
                accessToken: user.accessToken
            }
        });
    })

    forgotPasswordLink = asyncHandler(async (req, res) => {
        const { email } = req.body

        if (email) {
            await this.authService.handleForgotPassword('email', email)
        } else {
            throw new UnauthorizedError('Invalid user')
        }

        return res.status(200).json({
            success: true,
            message: 'Password reset link sent successfully.',
        });

    })

    resetPassword = asyncHandler(async (req, res) => {
        const { email, resetToken, newPassword } = req.body

        await this.authService.handleResetPassword(email, resetToken, newPassword)

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully.'
        })
    })

    requestEmailVerification = asyncHandler(async (req, res) => {
        const { email } = req.body
        
        await this.authService.handleEmailVerification(email)

        return res.status(200).json({
            success: true,
            message: 'Verification email sent successfully!',
        })

    })

    verifyUserEmail = asyncHandler(async (req, res) => {
        const { token } = req.query
        if (!token) throw new ValidationError('Token is required!')
            
        const tokenValue = Array.isArray(token) ? token[0] : token;
        if (typeof tokenValue !== 'string') throw new BadRequestError('Invalid token format')
            
        await this.authService.verifyEmailToken(tokenValue)
            
        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        })
    })

    refreshAccessToken = asyncHandler(async (req, res) => {
        const refreshToken = req.cookies['refresh-token']
        if (!refreshToken) throw new UnauthorizedError('Token is required!')
        
        const { user, token } = await TokenService.handleRefreshAccessToken(refreshToken)

        return res.status(200).json({
            success: true,
            message: "New access token generated successfully",
            data: { user, token }
        })
        
    })
}
