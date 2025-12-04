import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { AuthController } from "../controllers/AuthController";
import { validateOnboard } from "../middlewares/validator";

const authController = new AuthController()

export const userRouter = Router()

userRouter.patch('/onboarding', validateOnboard, authController.onboard)