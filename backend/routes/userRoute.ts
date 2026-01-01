import express from 'express'
import {
  login,
  registerUser,
  requestDeposit,
  updateProfile,
  getUser,
  handleUserService,
  updatePassword,
  getMissions,
  completeMission,
  getCompletedMissions
} from '../controller/userController.js'
import upload from '../middlewares/multer.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router()

// auth
userRouter.post('/register', registerUser)
userRouter.post('/login', login)

// user
userRouter.get('/me', authUser, getUser)
userRouter.put('/profile', authUser, upload.single('image'), updateProfile)
userRouter.put('/password', authUser, updatePassword)

// money
userRouter.post('/deposit', authUser, requestDeposit)

// service & order
userRouter.post('/service', authUser, handleUserService)
userRouter.get('/missions', authUser, getMissions)
userRouter.post('/mission/complete', authUser, completeMission)
userRouter.get('/missions/completed', authUser, getCompletedMissions)

export default userRouter
