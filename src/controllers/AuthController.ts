import { asyncHandler } from "../middlewares/error_handler";
import { AuthService } from "../services/AuthService";
import { EmailService } from "../services/EmailService";
import { IApiResponse } from "../types/api_response";
import { BadRequestError, UnauthorizedError, ValidationError } from "../utils/errors";


export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
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

    resendEmailVerification = asyncHandler(async (req, res): Promise<void> => {
        const { email } = req.body
    
    })

    verifyUser = asyncHandler(async (req, res) => {
        const { token } = req.query
        if (!token) throw new ValidationError('Token is required!')
            
        const tokenValue = Array.isArray(token) ? token[0] : token;
        if (typeof tokenValue !== 'string') throw new BadRequestError('Invalid token format')
            
        await this.authService.verifyEmailToken(tokenValue)
            
        return res.status(200).json({
            success: true,
            message: 'User verified successfully',
        })
        
        // res.cookie('access_token', accessToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'strict'
        // });
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
        
        // Store refresh token in cookies
        res.cookie("refresh-token", user.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
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
}
