import Service from '../models/serviceModel.js'
import userModel, { type IUser } from '../models/userModel.js'
import transactionModel from '../models/transactionModel.js'
import orderModel, { type OrderStatus } from '../models/orderModel.js'
import missionModel from '../models/missionModel.js'
import submissionModel from '../models/submissionModel.js'
import notificationModel from '../models/notificationModel.js'
import type { UpdateQuery, Types } from 'mongoose'

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
  isMaintenance?: boolean;
  apiProviderId?: string;
  apiProvider?: string;
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
 * Helper to update user deposit statistics
 * Updates both total and monthly deposit values.
 */
export const updateUserDepositStats = async (userId: string | Types.ObjectId, amount: number) => {
    if (amount <= 0) return;
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    const monthId = currentYear * 100 + currentMonth; // e.g. 202600 for Jan 2026

    const user = await userModel.findById(userId);
    if (!user) return;

    const update: UpdateQuery<IUser> = {
        $inc: { totalDeposit: amount }
    };

    if (user.lastDepositMonth !== monthId) {
        // Reset monthly stats for a new month
        update.$set = { 
            monthlyDeposit: amount,
            lastDepositMonth: monthId
        };
    } else {
        // Increment monthly stats for the current month
        update.$inc = { 
            totalDeposit: amount,
            monthlyDeposit: amount 
        };
    }

    await userModel.findByIdAndUpdate(userId, update);
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

export interface UpdateUserParams {
    userId: string;
    username?: string;
    fullName?: string;
    email?: string;
    isBlocked?: boolean;
    balance?: number;
}

/**
 * Update user details
 */
export const updateUserAccount = async ({ userId, username, fullName, email, isBlocked, balance }: UpdateUserParams) => {
    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    if (username) user.username = username
    if (fullName) user.fullName = fullName
    if (email) user.email = email
    if (isBlocked !== undefined) user.isBlocked = isBlocked
    
    // Handle balance update
    if (balance !== undefined && balance !== user.balance) {
        const oldBalance = user.balance || 0
        const newBalance = balance
        const amount = newBalance - oldBalance
        
        user.balance = newBalance
        
        // Log transaction
        await transactionModel.create({
            userId: user._id,
            amount: amount,
            type: 'adjustment',
            description: 'Admin chỉnh sửa thông tin số dư',
            oldBalance: oldBalance,
            newBalance: newBalance,
            balanceType: 'profile',
            status: 'approved',
            createdAt: new Date()
        })
    }

    await user.save()
    return { success: true, message: 'User updated successfully', user }
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
export const createService = async ({ platform, category, name, price, speed, isMaintenance, apiProviderId, apiProvider }: ServiceParams) => {
    if (!platform || !category || !name || !price || !speed) {
        return { success: false, message: 'Please Fill In All Information' }
    }
    const newService = new Service({ platform, category, name, price, speed, isMaintenance, apiProviderId, apiProvider })
    await newService.save()
    return { success: true, service: newService }
}

export const updateService = async ({ serviceId, platform, category, name, price, speed, isMaintenance, apiProviderId, apiProvider }: UpdateServiceParams) => {
    if (!serviceId || !platform || !category || !name || !price || !speed) {
        return { success: false, message: 'Please fill in the information completely' }
    }
    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { platform, category, name, price, speed, isMaintenance, apiProviderId, apiProvider },
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
export const approveUserDeposit = async (transactionId: string, bonusPercent = 0) => {
    const transaction = await transactionModel.findById(transactionId)
    if (!transaction || transaction.status !== 'pending') {
        return { success: false, message: 'Invalid transaction' }
    }

    transaction.status = 'approved'
    await transaction.save()

    const user = await userModel.findByIdAndUpdate(
        transaction.userId,
        { $inc: { balance: transaction.amount } },
        { new: true }
    )

    if (user) {
        transaction.oldBalance = user.balance - transaction.amount
        
        // Handle bonus calculation
        if (bonusPercent > 0) {
            const bonusAmount = Math.floor(transaction.amount * (bonusPercent / 100))
            const updatedUser = await userModel.findByIdAndUpdate(
                transaction.userId,
                { $inc: { balance: bonusAmount } },
                { new: true }
            )
            if (updatedUser) {
                transaction.description = `Nạp tiền vào tài khoản (Khuyến mãi ${bonusPercent}%)`
                transaction.amount += bonusAmount
                transaction.newBalance = updatedUser.balance
            }
        } else {
            transaction.newBalance = user.balance
            transaction.description = 'Nạp tiền vào tài khoản'
        }

        transaction.type = 'deposit'
        transaction.balanceType = 'profile'
        await transaction.save()

        // Update user deposit stats
        await updateUserDepositStats(transaction.userId, transaction.amount)
    }

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
const validateMissionLink = (link: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|instagram\.com|tiktok\.com|vt\.tiktok\.com)\/.*$/i;
    return pattern.test(link);
}

/**
 * Create a new mission
 */
export const createMission = async ({ title, link, type, reward }: MissionParams) => {
    if (!title || !link) {
        return { success: false, message: 'Vui lòng điền đầy đủ thông tin' }
    }

    if (!validateMissionLink(link)) {
        return { success: false, message: 'Link nhiệm vụ phải là Facebook, Instagram hoặc TikTok hợp lệ' }
    }

    const newMission = new missionModel({ title, link, type, reward })
    await newMission.save()
    return { success: true, mission: newMission }
}

/**
 * Update an existing mission
 */
export const updateMission = async ({ missionId, ...updateData }: UpdateMissionParams) => {
    if (updateData.link && !validateMissionLink(updateData.link)) {
        return { success: false, message: 'Link nhiệm vụ phải là Facebook, Instagram hoặc TikTok hợp lệ' }
    }

    const updatedMission = await missionModel.findByIdAndUpdate(missionId, updateData, { new: true })
    if (!updatedMission) return { success: false, message: 'Mission not found' }
    return { success: true, mission: updatedMission }
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
    
    // Count all non-cancelled orders
    const totalOrders = await orderModel.countDocuments({ status: { $ne: 'Cancelled' } })

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    interface AggResult { total: number }

    const revenueFilter = { status: { $ne: 'Cancelled' } } // Include Pending, In Progress, Completed
    const monthlyFilter = { ...revenueFilter, orderDate: { $gte: startOfMonth } }

    const monthlyRevenueData = await orderModel.aggregate<AggResult>([
        { $match: monthlyFilter },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const monthlyRevenue = monthlyRevenueData.length > 0 ? (monthlyRevenueData[0]?.total ?? 0) : 0

    const totalRevenueData = await orderModel.aggregate<AggResult>([
        { $match: revenueFilter },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const totalRevenue = totalRevenueData.length > 0 ? (totalRevenueData[0]?.total ?? 0) : 0

    // User requested System Balance to match Total Revenue
    const systemBalance = totalRevenue

    const recentOrders = await orderModel.find()
        .populate('service', 'name platform')
        .populate('userId', 'username')
        .sort({ orderDate: -1 })
        .limit(5)

    const recentDeposits = await transactionModel.find({ type: 'deposit' })
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(5)

    // --- Analytics Data (Last 7 Days) ---
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    interface DailyTrendAgg {
        _id: string;
        count: number;
        uniques: Types.ObjectId[];
    }

    const dailyTrends = await orderModel.aggregate<DailyTrendAgg>([
        { 
            $match: { 
                orderDate: { $gte: sevenDaysAgo } 
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                count: { $sum: 1 },
                uniques: { $addToSet: "$userId" }
            }
        },
        { $sort: { "_id": 1 } }
    ])

    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    const weeklyData = []
    
    for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        const dayMatch = dailyTrends.find(t => t._id === dateStr)
        
        weeklyData.push({
            name: dayNames[d.getDay()],
            clicks: dayMatch ? (dayMatch.count * 3 + 5) : 5, // Mock clicks based on orders
            uniques: dayMatch ? (dayMatch.uniques.length + 2) : 2 // Mock uniques
        })
    }

    return {
        success: true,
        stats: {
            totalUsers,
            todayOrders,
            totalOrders,
            monthlyRevenue,
            totalRevenue,
            systemBalance
        },
        recentOrders,
        recentDeposits,
        analytics: {
            weeklyData,
            totalClicks: (await orderModel.countDocuments()) * 3 + totalUsers,
            uniqueVisitors: totalUsers,
            bounceRate: "42%",
            avgSession: "3m 45s",
            referrers: [
                { name: 'Trực tiếp', value: Math.floor(totalUsers * 0.6) },
                { name: 'Tìm kiếm', value: Math.floor(totalUsers * 0.2) },
                { name: 'Mạng xã hội', value: Math.floor(totalUsers * 0.15) },
                { name: 'Khác', value: Math.floor(totalUsers * 0.05) },
            ],
            devices: [
                { name: 'Điện thoại', value: 75 },
                { name: 'Máy tính', value: 20 },
                { name: 'Máy tính bảng', value: 5 },
            ]
        }
    }
}

/**
 * Manual Balance Adjustment
 */
export const adjustUserBalance = async (userId: string, amount: number, bonusPercent = 0) => {
    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    // Calculate total including bonus if it's a positive adjustment
    const bonusAmount = (amount > 0 && bonusPercent > 0) ? Math.floor(amount * (bonusPercent / 100)) : 0;
    const finalAmount = amount + bonusAmount;

    // Update user balance
    user.balance = (user.balance || 0) + finalAmount
    await user.save()

    // Create a transaction record for history
    const transaction = new transactionModel({
        userId,
        amount: finalAmount,
        type: 'adjustment',
        description: bonusAmount > 0 
            ? `Admin cộng tiền (Gốc: ${amount.toLocaleString()}₫, KM: ${bonusPercent}%)` 
            : (amount >= 0 ? 'Admin cộng tiền' : 'Admin trừ tiền'),
        oldBalance: user.balance - finalAmount,
        newBalance: user.balance,
        balanceType: 'profile',
        status: 'approved',
        createdAt: new Date()
    })
    await transaction.save()

    const displayAmount = bonusAmount > 0 ? `${amount.toLocaleString()}₫ + ${bonusPercent}% KM` : `${amount.toLocaleString()}₫`;


    return { 
        success: true, 
        message: `Successfully adjusted balance by ${displayAmount}`,
        newBalance: user.balance 
    }
}

/**
 * Emergency utility to fix balances corrupted by string concatenation
 * This will parse the string-concatenated values back into the intended numbers or cap them.
 */
export const fixCorruptedBalances = async () => {
    const users = await userModel.find({});
    let fixCount = 0;

    for (const user of users) {
        let needsFix = false;
        
        // Fix main balance
        if (user.balance > 1000000000) { // Over 1 Billion
            const balStr = String(user.balance);
            if (balStr.endsWith("000000")) {
                user.balance = user.balance / 1000000;
                needsFix = true;
            } else if (balStr.endsWith("000")) {
                user.balance = user.balance / 1000;
                needsFix = true;
            }
        }

        // Fix mission balance
        if (user.missionBalance > 1000000000) {
            const mBalStr = String(user.missionBalance);
            if (mBalStr.endsWith("000000")) {
                user.missionBalance = user.missionBalance / 1000000;
                needsFix = true;
            } else if (mBalStr.endsWith("000")) {
                user.missionBalance = user.missionBalance / 1000;
                needsFix = true;
            }
        }

        if (needsFix) {
            await user.save();
            fixCount++;
        }
    }
    return { success: true, fixed: fixCount };
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
        user.missionBalance = (user.missionBalance || 0) + (mission.reward || 0)
        // 3. Add to completedMissions list
        if (!user.completedMissions.includes(mission._id)) {
            user.completedMissions.push(mission._id)
        }
        await user.save()

        // 4. Create transaction record
        await transactionModel.create({
            userId: user._id,
            amount: mission.reward,
            type: 'mission',
            description: `Hoàn thành nhiệm vụ: ${mission.title}`,
            oldBalance: user.missionBalance - (mission.reward || 0),
            newBalance: user.missionBalance,
            balanceType: 'mission',
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

/**
 * Fetch all reported orders
 */
export const fetchAllReportedOrders = async () => {
    try {
        const reports = await orderModel.find({ 
            report: { $exists: true } 
        }).populate('userId', 'username email').populate('service', 'name').sort({ 'report.createdAt': -1 });
        return { success: true, reports };
    } catch (error) {
        throw new Error(`Error fetching reported orders: ${String(error)}`);
    }
};

/**
 * Reply to a report
 */
export const replyToReport = async (orderId: string, response: string, status: 'pending' | 'resolved') => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order || !order.report) {
             throw new Error("Order or report not found");
        }

        order.report.adminResponse = response;
        order.report.status = status;
        await order.save();

        // Create notification for user
        await notificationModel.create({
            userId: order.userId,
            message: `Admin đã phản hồi báo cáo đơn hàng #${order._id.toString().slice(-6).toUpperCase()}: ${response}`,
            type: 'admin_message'
        });

        return { success: true, message: "Reply sent successfully" };
    } catch (error) {
        throw new Error(`Error replying to report: ${String(error)}`);
    }
};

/**
 * Fetch processed mission submissions (approved or rejected)
 */
export const fetchSubmissionHistory = async () => {
    const submissions = await submissionModel.find({ status: { $in: ['approved', 'rejected'] } })
        .populate('userId', 'username fullName')
        .populate('missionId', 'title reward link')
        .sort({ updatedAt: -1 })
    
    return { success: true, submissions }
}
/**
 * Fetch all withdrawal requests
 */
export const fetchWithdrawalRequests = async () => {
    const requests = await transactionModel.find({ 
        type: 'withdraw', 
        balanceType: 'mission' 
    }).populate({
        path: 'userId',
        model: 'user',
        select: 'username fullName email'
    }).sort({ createdAt: -1 })
    
    return { success: true, requests }
}

/**
 * Approve withdrawal request
 */
export const approveWithdrawalRequest = async (transactionId: string) => {
    const transaction = await transactionModel.findById(transactionId)
    if (!transaction || transaction.status !== 'pending' || transaction.type !== 'withdraw') {
        return { success: false, message: 'Invalid or already processed withdrawal' }
    }

    transaction.status = 'approved'
    await transaction.save()

    // Send email notification
    if (transaction.withdrawalDetails?.email) {
        try {
             // Dynamic import to avoid circular dependency if any, or just consistent with paymentController
             const { sendWithdrawalApprovedNotification } = await import('./mailService.js');
             await sendWithdrawalApprovedNotification(transaction.withdrawalDetails.email, {
                bankName: transaction.withdrawalDetails.bankName ?? '',
                bankAccount: transaction.withdrawalDetails.bankAccount ?? '',
                amount: Math.abs(transaction.amount),
                transactionId: transaction._id.toString()
            });
        } catch (error) {
            console.error('Failed to send withdrawal approval email:', error);
        }
    }

    return { success: true, message: 'Withdrawal approved' }
}

/**
 * Reject withdrawal request (Refunding user's mission balance)
 */
export const rejectWithdrawalRequest = async (transactionId: string) => {
    const transaction = await transactionModel.findById(transactionId)
    if (!transaction || transaction.status !== 'pending' || transaction.type !== 'withdraw') {
        return { success: false, message: 'Invalid or already processed withdrawal' }
    }

    transaction.status = 'rejected'
    await transaction.save()

    // Refund mission balance
    const user = await userModel.findById(transaction.userId)
    if (user) {
        user.missionBalance = (user.missionBalance || 0) + Math.abs(transaction.amount)
        await user.save()

        // Create a refund record
        await transactionModel.create({
            userId: user._id,
            amount: Math.abs(transaction.amount),
            type: 'adjustment',
            description: `Hoàn trả tiền rút bị từ chối: ${transactionId}`,
            oldBalance: user.missionBalance - Math.abs(transaction.amount),
            newBalance: user.missionBalance,
            balanceType: 'mission',
            status: 'approved',
            createdAt: new Date()
        })
    }

    return { success: true, message: 'Withdrawal rejected and refunded' }
}

/**
 * Fetch all deposit transactions
 */
export const fetchAllDeposits = async () => {
    const deposits = await transactionModel.find({ 
        type: 'deposit' 
    }).populate({
        path: 'userId',
        model: 'user',
        select: 'username fullName email'
    }).sort({ createdAt: -1 })
    
    return { success: true, deposits }
}

/**
 * Admin Notifications
 */
export const getAdminNotifications = async () => {
    const adminUser = await userModel.findOne({ role: 'admin' })
    if (!adminUser) return { success: true, notifications: [], unreadCount: 0 }
    
    const notifications = await notificationModel.find({ userId: adminUser._id }).sort({ createdAt: -1 }).limit(20)
    const unreadCount = await notificationModel.countDocuments({ userId: adminUser._id, isRead: false })
    return { success: true, notifications, unreadCount }
}

export const markAdminNotificationRead = async (notificationId?: string) => {
    const adminUser = await userModel.findOne({ role: 'admin' })
    if (!adminUser) return { success: false, message: 'Admin not found' }

    if (!notificationId) {
        await notificationModel.updateMany({ userId: adminUser._id, isRead: false }, { isRead: true })
        return { success: true, message: 'Marked all as read' }
    } else {
        await notificationModel.findByIdAndUpdate(notificationId, { isRead: true })
        return { success: true, message: 'Marked as read' }
    }
}
