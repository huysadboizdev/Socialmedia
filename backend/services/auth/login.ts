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

  return { success: true, token }
}

export default login
