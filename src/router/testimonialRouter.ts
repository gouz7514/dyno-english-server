import express, { Router } from 'express'
import { getTestimonials, postTestimonials } from '../api/testimonials'

const router: Router = express.Router()

router.get('/', getTestimonials)
router.post('/', postTestimonials)

export default router