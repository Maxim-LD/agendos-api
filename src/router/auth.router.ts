import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateLogin, validateRegister } from "../middlewares/validator";
import { authRateLimit } from "../middlewares/rate_limiter";

const authController = new AuthController()

export const authRouter = Router()

authRouter.post('/signup', validateRegister, authRateLimit, authController.signUp)
authRouter.get('/verify-email', authRateLimit, authController.verifyUser)
authRouter.post('/login', authRateLimit, validateLogin, authController.login)
authRouter.post('/forgot-password', authRateLimit, authController.forgotPasswordLink)
authRouter.post('/reset-password', authRateLimit, authController.resetPassword)