import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateEmail, validateLogin, validatePasswordReset, validateRegister } from "../middlewares/validator";
import { authRateLimit } from "../middlewares/rate-limiter";
import { protect } from "../middlewares/auth-middleware";

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/signup', validateRegister, authRateLimit, authController.signUp)
authRouter.post('/send-email-verification', protect, authRateLimit, validateEmail, authController.requestEmailVerification)
authRouter.get('/verify-email', authRateLimit, authController.verifyUserEmail)
authRouter.post('/login', authRateLimit, validateLogin, authController.login)
authRouter.post('/forgot-password', authRateLimit, authController.forgotPasswordLink)
authRouter.post('/reset-password', authRateLimit, validatePasswordReset, authController.resetPassword)
authRouter.post('/refresh-token', authController.refreshAccessToken)