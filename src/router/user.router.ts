import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateOnboard } from "../middlewares/validator";
import { protect } from "../middlewares/auth-middleware";

const authController = new AuthController()

export const userRouter = Router()

userRouter.patch('/onboarding', protect, validateOnboard, authController.onboard)