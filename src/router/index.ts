import { Router } from "express";
import { authRouter } from './auth.router'
import { taskRouter } from "./task.router";
import { userRouter } from "./user.router";

const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/task', taskRouter)

export default router