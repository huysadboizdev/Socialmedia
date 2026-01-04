import { Types } from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import bcrypt from 'bcrypt'
import userModel, { type IUser } from '../models/userModel.js'
import missionModel from '../models/missionModel.js'
import serviceModel from '../models/serviceModel.js'
import orderModel from '../models/orderModel.js'
import transactionModel from '../models/transactionModel.js'

interface UpdateProfileParams {
  username?: string;
  fullName?: string;
  imageFile?: Express.Multer.File;
}

interface HandleServiceParams {
  action: string;
  serviceId?: string;
  quantity?: number;
}

interface ChangePasswordParams {
  oldPassword?: string;
  newPassword1?: string;
  newPassword2?: string;
}

/**
 * Get user information
 */
export const getInfo = async (userId: string) => {
    const user = await userModel.findById(userId).select('-password')
    if (!user) return { success: false, message: 'User not found' }
    return { success: true, user }
}

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, { username, fullName, imageFile }: UpdateProfileParams) => {
    const updateData: Partial<IUser> = {}
    if (username) updateData.username = username
    if (fullName) updateData.fullName = fullName

    if (imageFile) {
        const upload = await cloudinary.uploader.upload(imageFile.path)
        updateData.image = upload.secure_url
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true })
    return { success: true, user: updatedUser }
}

/**
 * Update user password
 */
export const changePassword = async (userId: string, { oldPassword, newPassword1, newPassword2 }: ChangePasswordParams) => {
    const user = await userModel.findById(userId)
    if (!user || !user.password) return { success: false, message: 'User or password not found' }

    if (!oldPassword || !newPassword1 || !newPassword2) {
        return { success: false, message: 'Missing fields' }
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
        return { success: false, message: 'Wrong old password' }
    }

    if (newPassword1 !== newPassword2) {
        return { success: false, message: 'Mismatch' }
    }

    user.password = await bcrypt.hash(newPassword1, 10)
    await user.save()

    return { success: true }
}

/**
 * Handle services and orders for user
 */
export const handleService = async (userId: string, { action, serviceId, quantity = 1 }: HandleServiceParams) => {
    if (action === 'getServices') {
        const services = await serviceModel.find()
        return { success: true, services }
    }

    if (action === 'createOrder') {
        if (!serviceId) return { success: false, message: 'Service ID is required' }
        const service = await serviceModel.findById(serviceId)
        if (!service) return { success: false, message: 'Service not found' }

        const order = await orderModel.create({
            userId,
            service: serviceId,
            quantity,
            totalPrice: service.price * quantity,
            status: 'Pending'
        })

        return { success: true, order }
    }

    if (action === 'getOrderHistory') {
        const orders = await orderModel.find({ userId }).populate('service')
        return { success: true, orders }
    }

    return { success: false, message: 'Invalid action' }
}

/**
 * Request money deposit
 */
export const depositRequest = async (userId: string, amount: number) => {
    if (amount <= 0) return { success: false, message: 'Invalid amount' }

    await transactionModel.create({ userId, amount })
    return { success: true }
}

/**
 * Get active missions
 */
export const getActiveMissions = async () => {
    const missions = await missionModel.find({ isActive: true })
    return { success: true, missions }
}

/**
 * Complete a mission
 */
export const completeMissionAction = async (userId: string, missionId: string) => {
    const mission = await missionModel.findById(missionId)
    if (!mission || !mission.isActive) {
        return { success: false, message: 'Mission not available' }
    }

    const user = await userModel.findById(userId)
    if (!user) {
        return { success: false, message: 'User not found' }
    }

    if (user.completedMissions.some((id: Types.ObjectId) => id.toString() === missionId)) {
        return { success: false, message: 'Mission already completed' }
    }

    user.balance = (user.balance || 0) + (mission.reward || 0)
    user.completedMissions.push(new Types.ObjectId(missionId))

    await user.save()

    return {
        success: true,
        message: 'Mission completed',
        reward: mission.reward,
        balance: user.balance
    }
}

/**
 * Get completed missions history
 */
export const getCompletedMissionsHistory = async (userId: string) => {
    const user = await userModel
        .findById(userId)
        .populate('completedMissions')

    if (!user) return { success: false, message: 'User not found' }

    return {
        success: true,
        completedMissions: user.completedMissions
    }
}
