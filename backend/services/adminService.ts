import Service from '../models/serviceModel.js'
import userModel from '../models/userModel.js'
import transactionModel from '../models/transactionModel.js'
import orderModel, { type OrderStatus } from '../models/orderModel.js'
import missionModel from '../models/missionModel.js'
import submissionModel from '../models/submissionModel.js'

export interface AdminLoginParams {
  email?: string;
  password?: string;
}

export interface ServiceParams {
  platform: string;
  category: string;
  name: string;
  price: number;
  speed: string;
}

export interface UpdateServiceParams extends ServiceParams {
  serviceId: string;
}

export interface OrderManagementParams {
  action: string;
  orderId?: string;
  status?: OrderStatus;
}

export interface MissionParams {
  title: string;
  link: string;
  type: "like" | "follow" | "comment" | "share";
  reward: number;
}

export interface UpdateMissionParams extends Partial<MissionParams> {
  missionId: string;
  isActive?: boolean;
}

/**
 * Admin login
 */
export const adminLogin = async ({ email, password }: AdminLoginParams) => {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        return await Promise.resolve({ success: true })
    }
    return { success: false, message: 'Invalid admin credentials' }
}

/**
 * Delete a user
 */
export const deleteUserAccount = async (userId: string) => {
    await userModel.findByIdAndDelete(userId)
    return { success: true, message: 'User deleted successfully' }
}

/**
 * Get all users
 */
export const fetchAllUsers = async () => {
    const users = await userModel.find()
    return { success: true, users }
}

/**
 * Admin view of user login
 */
export const adminAuthUser = async ({ email }: { email?: string }) => {
    const user = await userModel.findOne({ email })
    if (!user) {
        return { success: false, message: 'User does not exist' }
    }
    if (user.isBlocked) {
        return { success: false, message: 'Your account has been blocked' }
    }
    return { success: true, user }
}

/**
 * Service Management
 */
export const createService = async ({ platform, category, name, price, speed }: ServiceParams) => {
    if (!platform || !category || !name || !price || !speed) {
        return { success: false, message: 'Please Fill In All Information' }
    }
    const newService = new Service({ platform, category, name, price, speed })
    await newService.save()
    return { success: true, service: newService }
}

export const updateService = async ({ serviceId, platform, category, name, price, speed }: UpdateServiceParams) => {
    if (!serviceId || !platform || !category || !name || !price || !speed) {
        return { success: false, message: 'Please fill in the information completely' }
    }
    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { platform, category, name, price, speed },
        { new: true }
    )
    if (!updatedService) {
        return { success: false, message: 'Service not available' }
    }
    return { success: true, service: updatedService }
}

export const fetchAllServices = async () => {
    const services = await Service.find()
    return { success: true, services }
}

export const removeService = async (serviceId: string) => {
    await Service.findByIdAndDelete(serviceId)
    return { success: true, message: 'Service deleted successfully' }
}

/**
 * Deposit Management
 */
export const approveUserDeposit = async (transactionId: string) => {
    const transaction = await transactionModel.findById(transactionId)
    if (!transaction || transaction.status !== 'pending') {
        return { success: false, message: 'Invalid transaction' }
    }

    transaction.status = 'approved'
    await transaction.save()

    await userModel.findByIdAndUpdate(
        transaction.userId,
        { $inc: { balance: transaction.amount } }
    )

    return { success: true, message: 'Deposit successful' }
}

export const rejectUserDeposit = async (transactionId: string) => {
    const transaction = await transactionModel.findById(transactionId)
    if (!transaction || transaction.status !== 'pending') {
        return { success: false, message: 'Invalid transaction' }
    }

    transaction.status = 'rejected'
    await transaction.save()

    return { success: true, message: 'Transaction has been declined' }
}

export const fetchPendingTransactions = async () => {
    const transactions = await transactionModel.find({ status: 'pending' }).populate({
        path: 'userId',
        model: 'user',
        select: 'username email'
    })
    return { success: true, transactions }
}

/**
 * Order Management
 */
export const manageOrders = async ({ action, orderId, status }: OrderManagementParams) => {
    if (action === 'getAllOrders') {
        const orders = await orderModel
            .find()
            .populate('service')
            .populate('userId', 'username email')
            .sort({ orderDate: -1 })
        return { success: true, orders }
    }

    if (action === 'getOrderById') {
        if (!orderId) return { success: false, message: 'Order ID is required' }
        const order = await orderModel.findById(orderId).populate('service')
        if (!order) return { success: false, message: 'Order does not exist' }
        return { success: true, order }
    }

    if (action === 'updateOrderStatus') {
        if (!orderId) return { success: false, message: 'Order ID is required' }
        if (!status) return { success: false, message: 'Status is required' }
        const order = await orderModel.findById(orderId)
        if (!order) return { success: false, message: 'Order does not exist' }
        order.status = status
        await order.save()
        return { success: true, message: 'Order status has been updated', order }
    }

    if (action === 'deleteOrder') {
        if (!orderId) return { success: false, message: 'Order ID is required' }
        const order = await orderModel.findById(orderId)
        if (!order) return { success: false, message: 'Order does not exist' }
        await order.deleteOne()
        return { success: true, message: 'Order has been deleted' }
    }

    return { success: false, message: 'Invalid action' }
}

/**
 * Mission Management
 */
export const createMission = async ({ title, link, type, reward }: MissionParams) => {
    if (!title) {
        return { success: false, message: 'Missing fields' }
    }
    const mission = new missionModel({ title, link, type, reward })
    await mission.save()
    return { success: true, mission }
}

export const updateMission = async ({ missionId, title, link, type, reward, isActive }: UpdateMissionParams) => {
    const mission = await missionModel.findByIdAndUpdate(
        missionId,
        { title, link, type, reward, isActive },
        { new: true }
    )
    if (!mission) return { success: false, message: 'Mission not found' }
    return { success: true, mission }
}

export const removeMission = async (missionId: string) => {
    await missionModel.findByIdAndDelete(missionId)
    return { success: true, message: 'Mission deleted' }
}

export const fetchAllMissions = async () => {
    const missions = await missionModel.find()
    return { success: true, missions }
}

export const reassignMissionToUser = async (userId: string, missionId: string) => {
    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    user.completedMissions = user.completedMissions.filter(
        (id) => id.toString() !== missionId
    )
    await user.save()
    return { success: true, message: 'Mission assigned to user' }
}

/**
 * Dashboard Statistics
 */
export const fetchDashboardStats = async () => {
    const totalUsers = await userModel.countDocuments()
    
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayOrders = await orderModel.countDocuments({ orderDate: { $gte: startOfToday } })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    interface AggResult { total: number }

    const monthlyRevenueData = await orderModel.aggregate<AggResult>([
        { $match: { status: 'Completed', orderDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const monthlyRevenue = monthlyRevenueData.length > 0 ? (monthlyRevenueData[0]?.total ?? 0) : 0

    const userBalances = await userModel.aggregate<AggResult>([
        { $group: { _id: null, total: { $sum: '$balance' } } }
    ])
    const systemBalance = userBalances.length > 0 ? (userBalances[0]?.total ?? 0) : 0

    const recentOrders = await orderModel.find()
        .populate('service', 'name platform')
        .populate('userId', 'username')
        .sort({ orderDate: -1 })
        .limit(10)

    return {
        success: true,
        stats: {
            totalUsers,
            todayOrders,
            monthlyRevenue,
            systemBalance
        },
        recentOrders
    }
}

/**
 * Manual Balance Adjustment
 */
export const adjustUserBalance = async (userId: string, amount: number) => {
    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    // Update user balance
    user.balance += amount
    await user.save()

    // Create a transaction record for history
    const transaction = new transactionModel({
        userId,
        amount,
        status: 'approved',
        createdAt: new Date()
    })
    await transaction.save()

    return { 
        success: true, 
        message: `Successfully adjusted balance by ${amount.toLocaleString()}₫`,
        newBalance: user.balance 
    }
}

/**
 * Fetch all pending mission submissions
 */
export const fetchPendingSubmissions = async () => {
    const submissions = await submissionModel.find({ status: 'pending' })
        .populate('userId', 'username fullName')
        .populate('missionId', 'title reward link')
        .sort({ createdAt: -1 })
    
    return { success: true, submissions }
}

/**
 * Approve a mission submission
 */
export const approveUserSubmission = async (submissionId: string) => {
    const submission = await submissionModel.findById(submissionId)
    if (!submission || submission.status !== 'pending') {
        return { success: false, message: 'Invalid or already processed submission' }
    }

    const mission = await missionModel.findById(submission.missionId)
    if (!mission) return { success: false, message: 'Mission not found' }

    // 1. Mark submission approved
    submission.status = 'approved'
    await submission.save()

    // 2. Add reward to user balance
    const user = await userModel.findById(submission.userId)
    if (user) {
        user.balance = (user.balance || 0) + (mission.reward || 0)
        // 3. Add to completedMissions list
        if (!user.completedMissions.includes(mission._id)) {
            user.completedMissions.push(mission._id)
        }
        await user.save()

        // 4. Create transaction record
        await transactionModel.create({
            userId: user._id,
            amount: mission.reward,
            status: 'approved',
            createdAt: new Date()
        })
    }

    return { success: true, message: 'Mission approved and reward sent' }
}

/**
 * Reject a mission submission
 */
export const rejectUserSubmission = async (submissionId: string, note?: string) => {
    const submission = await submissionModel.findById(submissionId)
    if (!submission || submission.status !== 'pending') {
        return { success: false, message: 'Invalid submission' }
    }

    submission.status = 'rejected'
    submission.adminNote = note
    await submission.save()

    return { success: true, message: 'Submission rejected' }
}
