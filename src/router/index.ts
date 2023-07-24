import express, { Router } from 'express'

import testimonialRouter from './testimonialRouter'
import userRouter from './userRouter'

const router: Router = express.Router()

router.use('/testimonials', testimonialRouter)
router.use('/users', userRouter)

export default router