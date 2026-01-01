import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../../models/userModel.js'

export interface RegisterParams {
  username?: string;
  email?: string;
  password_1?: string;
  password_2?: string;
}

/**
 * Register a new user
 */
const register = async ({ username, email, password_1, password_2 }: RegisterParams) => {
  if (!username || !email || !password_1 || !password_2) {
    return { success: false, message: 'Missing fields' }
  }

  if (!validator.isEmail(email)) {
    return { success: false, message: 'Invalid email' }
  }

  if (await userModel.findOne({ email })) {
    return { success: false, message: 'Email exists' }
  }

  if (await userModel.findOne({ username })) {
    return { success: false, message: 'Username exists' }
  }

  if (password_1.length < 8) {
    return { success: false, message: 'Weak password' }
  }

  if (password_1 !== password_2) {
    return { success: false, message: 'Password mismatch' }
  }

  const hashed = await bcrypt.hash(password_1, 10)

  const newUser = await userModel.create({
    username,
    email,
    password: hashed
  })

  return { success: true, user: { id: newUser._id } }
}

export default register
