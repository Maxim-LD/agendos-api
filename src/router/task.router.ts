import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { protect } from "../middlewares/auth-middleware";
import { authRateLimit } from "../middlewares/rate-limiter";
import { validateAddTask, validateOnboardTask } from "../middlewares/validator";

const taskController = new TaskController()

export const taskRouter = Router()

taskRouter.post('/new', protect, authRateLimit, validateOnboardTask, taskController.createTask)
taskRouter.post('/fresh', protect, authRateLimit, validateAddTask, taskController.createTask)

