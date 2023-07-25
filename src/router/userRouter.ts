import express, { Router } from 'express'
import { getUsers, postUsers, patchUsers, getUserByToken } from '../api/users'

const router: Router = express.Router()

router.get('/token', getUserByToken)

router.get('/:userId', getUsers)
router.post('/', postUsers)
router.patch('/', patchUsers)

export default router