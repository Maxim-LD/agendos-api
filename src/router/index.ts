import { Router } from "express";
import { authRouter } from './auth.router'
import { taskRouter } from "./task.router";
import { userRouter } from "./user.router";
// import { learningPathRouter } from "./learning-path.router";

const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/tasks', taskRouter)
// router.use('/learning', learningPathRouter)

export default router