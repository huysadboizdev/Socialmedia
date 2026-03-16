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
    const token = jwt.sign(
      { id: 'admin', role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET ?? 'secret'
    )
    return {
      success: true,
      token,
      user: {
        _id: 'admin',
        username: 'Admin',
        email: adminEmail,
        role: 'admin',
        balance: 999999999
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
    process.env.ACCESS_TOKEN_SECRET ?? 'secret'
  )

  // Reset 2FA verification status on login to force fresh verification
  if (user.is2FAEnabled) {
    user.is2FAVerified = false;
    await user.save();
  }

  // Exclude password from user object
  const { password: _, ...userData } = user.toObject()

  return { success: true, token, user: userData }
}

export default login
