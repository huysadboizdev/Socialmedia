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
  getCompletedMissions,
  attendance,
  submitMission,
  acceptMission,
  withdrawMissionBalance,
  getTransactionHistory
} from '../controller/userController.js'
import { getAnnouncement as fetchAnnouncement } from '../controller/settingController.js'
import upload from '../middlewares/multer.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router()

// auth
userRouter.post('/register', registerUser)
userRouter.post('/login', login)

// user
userRouter.get('/me', authUser, getUser as any)
userRouter.put('/profile', authUser, upload.single('image'), updateProfile as any)
userRouter.put('/password', authUser, updatePassword as any)

// money
userRouter.post('/deposit', authUser, requestDeposit)

// service & order
userRouter.post('/service', authUser, handleUserService)
userRouter.get('/missions', authUser, getMissions as any)
userRouter.post('/mission/accept', authUser, acceptMission as any)
userRouter.post('/mission/submit', authUser, upload.single('imageProof'), submitMission as any)
userRouter.post('/mission/withdraw', authUser, upload.single('qrCode'), withdrawMissionBalance as any)
userRouter.get('/missions/completed', authUser, getCompletedMissions as any)

// attendance
userRouter.post('/attendance', authUser, attendance)
userRouter.get('/transactions', authUser, getTransactionHistory as any)

// public
userRouter.get('/announcement', fetchAnnouncement)

export default userRouter
