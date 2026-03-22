import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../../models/userModel.js'

export interface LoginParams {
  email?: string;
  password?: string;
}

/**
 * Login user
 */
const login = async ({ email, password }: LoginParams) => {
  if (!email || !password) {
    return { success: false, message: 'Missing fields' }
  }

  // Check for Admin from .env
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (email === adminEmail && password === adminPassword) {
    // Check if admin user already exists in database
    let admin = await userModel.findOne({ email: adminEmail, role: 'admin' })
    admin ??= await userModel.create({
        username: 'Admin',
        email: adminEmail,
        role: 'admin',
        balance: 999999999,
        missionBalance: 0,
        password: await bcrypt.hash(adminPassword || 'admin', 10) // Store hashed password anyway
    });

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET ??= 'secret'
    )
    return {
      success: true,
      token,
      user: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: 'admin',
        balance: admin.balance
      }
    }
  }

  const user = await userModel.findOne({ email })
  if (!user) {
    return { success: false, message: 'Email not found' }
  }

  // Check if the user registered via Google OAuth
  if (!user.password) {
    return {
      success: false,
      message: 'Account uses Google login'
    }
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return { success: false, message: 'Wrong password' }
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET ??= 'secret'
  )

  // Exclude password from user object
  const { password: _, ...userData } = user.toObject()

  return { success: true, token, user: userData }
}

export default login
