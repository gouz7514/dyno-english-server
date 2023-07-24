import express, { Router } from 'express'
import { getUsers, postUsers, patchUsers } from '../api/users'

const router: Router = express.Router()

router.get('/', getUsers)
router.post('/', postUsers)
router.patch('/', patchUsers)

export default router