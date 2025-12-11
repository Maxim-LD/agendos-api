import { config } from "../config";
import { AuthRequest } from "../middlewares/auth-middleware";
import { asyncHandler } from "../middlewares/error-handler";
import { AuthService } from "../services/AuthService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { IApiResponse } from "../types/api-response";
import { CreateProfileDTO, UpdateUserDTO } from "../types/user";
import { BadRequestError, UnauthorizedError, ValidationError } from "../utils/errors";


export class AuthController {
    private authService: AuthService
    private userService: UserService
    private tokenService: TokenService

    constructor() {
        this.authService = new AuthService()
        this.userService = new UserService()
        this.tokenService = new TokenService()
    }

    signUp = asyncHandler(async (req, res): Promise<void> => {
        const { fullname, email, password, confirm_password } = req.body

        if (password !== confirm_password) throw new BadRequestError('Passwords does not match!')

        const { user, accessToken, refreshToken} = await this.authService.registerUser({
            fullname,
            email,
            password,
        })

        if (!user) throw new BadRequestError('User account creation failed!')

        const isProduction = config.nodeEnv === 'production'
        
        // Store refresh token in cookies
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        });

        const response: IApiResponse = {
            success: true,
            message: 'User signed up successfully',
            data: {
                user,
                accessToken
            }
        }

        res.status(201).json(response)

    })

    onboard = asyncHandler(async (req, res) => {
        const { email } = req.query as { email: string }
        const { username, phone, occupation, date_of_birth, status, maximum_daily_capacity } = req.body 
        
        const payload: CreateProfileDTO = {
            username,
            status,
            occupation,
            phone,
            maximum_daily_capacity,
            date_of_birth
        }
        const user = await this.userService.createProfile(email, payload)

        const response: IApiResponse = {
            success: true,
            message: 'User onboarding completed',
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
