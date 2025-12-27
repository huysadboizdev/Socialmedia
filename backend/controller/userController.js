import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import missionModel from '../models/missionModel.js'
import { v2 as cloudinary } from 'cloudinary'
import serviceModel from '../models/serviceModel.js'


// regester user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password_1, password_2 } = req.body

    if (!username || !email || !password_1 || !password_2) {
      return res.json({ success: false, message: 'Missing fields' })
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Invalid email' })
    }

    if (await userModel.findOne({ email })) {
      return res.json({ success: false, message: 'Email exists' })
    }

    if (await userModel.findOne({ username })) {
      return res.json({ success: false, message: 'Username exists' })
    }

    if (password_1.length < 8) {
      return res.json({ success: false, message: 'Weak password' })
    }

    if (password_1 !== password_2) {
      return res.json({ success: false, message: 'Password mismatch' })
    }

    const hashed = await bcrypt.hash(password_1, 10)

    await userModel.create({
      username,
      email,
      password: hashed
    })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// login
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const user = await userModel.findOne({ email })
//     if (!user) return res.json({ success: false, message: 'Email not found' })

//     const match = await bcrypt.compare(password, user.password)
//     if (!match) return res.json({ success: false, message: 'Wrong password' })

//     const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ success: true, token })
//   } catch {
//     res.status(500).json({ success: false })
//   }
// }
// login with google
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'Email not found' })
    }

    // Check if the user registered via Google OAuth
    if (!user.password) {
      return res.json({
        success: false,
        message: 'Account uses Google login'
      })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.json({ success: false, message: 'Wrong password' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET
    )

    res.json({ success: true, token })
  } catch (err) {
    res.status(500).json({ success: false })
  }
}


// get info user
export const getUser = async (req, res) => {
  const user = await userModel.findById(req.body.userId).select('-password')
  res.json({ success: true, user })
}

// update profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, username } = req.body
    const image = req.file

    const updateData = {}
    if (username) updateData.username = username

    if (image) {
      const upload = await cloudinary.uploader.upload(image.path)
      updateData.image = upload.secure_url
    }

    await userModel.findByIdAndUpdate(userId, updateData)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// change password
export const updatePassword = async (req, res) => {
  const { userId, oldPassword, newPassword1, newPassword2 } = req.body

  const user = await userModel.findById(userId)
  if (!user) return res.json({ success: false })

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    return res.json({ success: false, message: 'Wrong old password' })
  }

  if (newPassword1 !== newPassword2) {
    return res.json({ success: false, message: 'Mismatch' })
  }

  user.password = await bcrypt.hash(newPassword1, 10)
  await user.save()

  res.json({ success: true })
}

// service & order
export const handleUserService = async (req, res) => {
  const { action, serviceId, quantity } = req.body
  const userId = req.body.userId

  if (action === 'getServices') {
    const services = await serviceModel.find()
    return res.json({ success: true, services })
  }

  if (action === 'createOrder') {
    const service = await serviceModel.findById(serviceId)
    if (!service) return res.json({ success: false })

    const order = await orderModel.create({
      userId,
      service: serviceId,
      quantity,
      totalPrice: service.price * quantity,
      status: 'Pending'
    })

    return res.json({ success: true, order })
  }

  if (action === 'getOrderHistory') {
    const orders = await orderModel.find({ userId }).populate('service')
    return res.json({ success: true, orders })
  }

  res.json({ success: false })
}

// deposit money
export const requestDeposit = async (req, res) => {
  const { userId, amount } = req.body
  if (amount <= 0) return res.json({ success: false })

  await transactionModel.create({ userId, amount })
  res.json({ success: true })
}
// ================= LẤY DANH SÁCH NHIỆM VỤ ĐANG HOẠT ĐỘNG =================
export const getMissions = async (req, res) => {
  try {
    const missions = await missionModel.find({ isActive: true })
    res.json({ success: true, missions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ================= HOÀN THÀNH NHIỆM VỤ – NHẬN TIỀN =================
export const completeMission = async (req, res) => {
  try {
    const { missionId } = req.body
    const userId = req.body.userId

    const mission = await missionModel.findById(missionId)
    if (!mission || !mission.isActive) {
      return res.json({ success: false, message: 'Mission not available' })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    // chống làm lại nhiệm vụ
    if (user.completedMissions.includes(missionId)) {
      return res.json({ success: false, message: 'Mission already completed' })
    }

    // cộng tiền
    user.balance += mission.reward
    user.completedMissions.push(missionId)

    await user.save()

    res.json({
      success: true,
      message: 'Mission completed',
      reward: mission.reward,
      balance: user.balance
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ================= LỊCH SỬ NHIỆM VỤ ĐÃ HOÀN THÀNH =================
export const getCompletedMissions = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.body.userId)
      .populate('completedMissions')

    res.json({
      success: true,
      completedMissions: user.completedMissions
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}