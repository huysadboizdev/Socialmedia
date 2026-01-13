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
  getTransactionHistory,
  clickMission
} from '../controller/userController.js'
import { getAnnouncement as fetchAnnouncement } from '../controller/settingController.js'
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
userRouter.post('/mission/accept', authUser, acceptMission)
userRouter.post('/mission/click', authUser, clickMission)
userRouter.post('/mission/submit', authUser, upload.single('imageProof'), submitMission)
userRouter.post('/mission/withdraw', authUser, upload.single('qrCode'), withdrawMissionBalance)
userRouter.get('/missions/completed', authUser, getCompletedMissions)

// attendance
userRouter.post('/attendance', authUser, attendance)
userRouter.get('/transactions', authUser, getTransactionHistory)

// public
userRouter.get('/announcement', fetchAnnouncement)

export default userRouter
