import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { protect } from "../middlewares/auth-middleware";
import { authRateLimit } from "../middlewares/rate-limiter";
import { validateTask } from "../middlewares/validator";

const taskController = new TaskController()

export const taskRouter = Router()

taskRouter.post('/new', protect, authRateLimit, validateTask, taskController.createTask)

