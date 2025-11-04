import { Router } from "express";
import { authRouter } from './auth.router'

const router = Router()

router.use('/auth', authRouter)
router.use('/task', authRouter)

export default router