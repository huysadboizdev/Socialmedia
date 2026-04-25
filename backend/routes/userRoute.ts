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
  clickMission,
  getLeaderboard,
  getActiveCoupons
} from '../controller/userController.js'
import { getAnnouncement as fetchAnnouncement } from '../controller/settingController.js'
import upload from '../middlewares/multer.js'
import authUser from '../middlewares/authUser.js'
import check2FA from '../middlewares/check2FAMiddleware.js'

const userRouter = express.Router()

// auth
userRouter.post('/register', registerUser)
userRouter.post('/login', login)

// user
userRouter.get('/me', authUser, getUser)
userRouter.put('/profile', authUser, upload.single('image'), updateProfile)
userRouter.put('/password', authUser, updatePassword)

// money
userRouter.post('/deposit', authUser, check2FA, requestDeposit)

// service & order
userRouter.post('/service', authUser, check2FA, handleUserService)
userRouter.get('/missions', authUser, check2FA, getMissions)
userRouter.post('/mission/accept', authUser, check2FA, acceptMission)
userRouter.post('/mission/click', authUser, check2FA, clickMission)
userRouter.post('/mission/submit', authUser, check2FA, upload.single('imageProof'), submitMission)
userRouter.post('/mission/withdraw', authUser, check2FA, upload.single('qrCode'), withdrawMissionBalance)
userRouter.get('/missions/completed', authUser, check2FA, getCompletedMissions)

// attendance
userRouter.post('/attendance', authUser, check2FA, attendance)
userRouter.get('/transactions', authUser, check2FA, getTransactionHistory)
userRouter.get('/leaderboard', getLeaderboard)

// public
userRouter.get('/announcement', fetchAnnouncement)
userRouter.get('/coupons/active', authUser, getActiveCoupons)

export default userRouter
