import express from 'express'
import userController from '../controllers/userController'

export const userRouter = express.Router()

userRouter.get('/', userController.getUsers)
userRouter.post('/', userController.createUser)

userRouter.post('/:id/exercises', userController.createUserExercise)

userRouter.post('/:id/logs', () => {})