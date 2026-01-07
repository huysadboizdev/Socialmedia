import { Types } from 'mongoose'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import bcrypt from 'bcrypt'
import userModel, { type IUser } from '../models/userModel.js'
import missionModel from '../models/missionModel.js'
import serviceModel from '../models/serviceModel.js'
import orderModel from '../models/orderModel.js'
import transactionModel from '../models/transactionModel.js'
import submissionModel from '../models/submissionModel.js'

interface UpdateProfileParams {
  username?: string;
  fullName?: string;
  imageFile?: Express.Multer.File;
}

interface HandleServiceParams {
  action: string;
  serviceId?: string;
  quantity?: number;
  link?: string;
  note?: string;
  details?: Record<string, unknown>;
}

interface ChangePasswordParams {
  oldPassword?: string;
  newPassword1?: string;
  newPassword2?: string;
}

interface MissionWithStatus {
    _id: Types.ObjectId;
    title: string;
    reward: number;
    link: string;
    type: string;
    isActive: boolean;
    status: string;
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
        try {
            console.log("Starting Cloudinary upload for:", imageFile.path);

            // Check for Cloudinary config presence
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const apiSecret = process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_SECRET_KEY;

            const missingKeys = [];
            if (!cloudName) missingKeys.push("CLOUDINARY_CLOUD_NAME/CLOUDINARY_NAME");
            if (!apiKey) missingKeys.push("CLOUDINARY_API_KEY");
            if (!apiSecret) missingKeys.push("CLOUDINARY_API_SECRET/CLOUDINARY_SECRET_KEY");

            if (missingKeys.length > 0) {
                throw new Error(`Missing Cloudinary configuration in .env: ${missingKeys.join(", ")}`);
            }

            const upload = await cloudinary.uploader.upload(imageFile.path)
            console.log("Cloudinary upload success:", upload.secure_url);
            updateData.image = upload.secure_url
        } catch (error: unknown) {
            console.error("Cloudinary upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Image upload failed: ${errorMessage}`);
        } finally {
             // Remove file from local storage
             if (fs.existsSync(imageFile.path)) {
                 fs.unlinkSync(imageFile.path)
             }
        }
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
export const handleService = async (userId: string, { action, serviceId, quantity = 1, link, note, details }: HandleServiceParams) => {
    if (action === 'getServices') {
        const services = await serviceModel.find()
        return { success: true, services }
    }

    if (action === 'createOrder') {
        if (!serviceId) return { success: false, message: 'Service ID is required' }
        const service = await serviceModel.findById(serviceId)
        if (!service) return { success: false, message: 'Service not found' }

        const user = await userModel.findById(userId)
        if (!user) return { success: false, message: 'User not found' }

        const totalPrice = service.price * quantity
        if ((user.balance || 0) < totalPrice) {
            return { success: false, message: 'Số dư tài khoản không đủ. Vui lòng nạp thêm!' }
        }

        const order = await orderModel.create({
            userId,
            service: serviceId,
            quantity,
            totalPrice,
            link: link ?? "",
            note: note ?? "",
            details: details ?? {},
            status: 'Pending'
        })

        user.balance = (user.balance || 0) - totalPrice
        await user.save()

        return { success: true, order, balance: user.balance }
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
/**
 * Daily Attendance
 */
export const checkAttendance = async (userId: string) => {
    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    // Initialize attendance if missing
    user.attendance ??= { lastDate: null, streak: 0 }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    let lastCheckIn = 0
    if (user.attendance.lastDate) {
        const last = new Date(user.attendance.lastDate)
        lastCheckIn = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime()
    }

    // Check if already checked in today
    if (lastCheckIn === today) {
        return { success: false, message: 'Bạn đã điểm danh hôm nay rồi!' }
    }

    const ONE_DAY = 24 * 60 * 60 * 1000
    // Check if consecutive day (allow checking in anytime the next day)
    // If last checkin was yesterday (today - lastCheckIn === ONE_DAY)
    if (lastCheckIn === today - ONE_DAY) {
        user.attendance.streak += 1
    } else {
        // Missed a day or first time
        user.attendance.streak = 1
    }

    // Cycle reset after 7 days
    if (user.attendance.streak > 7) {
        user.attendance.streak = 1
    }

    const rewards: Record<number, number | undefined> = {
        1: 100,
        2: 1000,
        3: 3000,
        4: 5000,
        5: 8000,
        6: 20000,
        7: 50000
    }

    const rewardAmount = rewards[user.attendance.streak] ?? 100

    // Update User
    user.balance = (user.balance || 0) + rewardAmount
    user.attendance.lastDate = now
    await user.save()

    // Create Transaction Record
    await transactionModel.create({
        userId: new Types.ObjectId(userId),
        amount: rewardAmount,
        status: 'approved', // Auto-approved
        createdAt: now
    })

    return { 
        success: true, 
        message: `Điểm danh thành công! +${rewardAmount.toLocaleString()}đ`,
        streak: user.attendance.streak,
        reward: rewardAmount,
        balance: user.balance
    }
}


/**
 * Get available missions for user with status
 */
export const getAvailableMissions = async (userId: string) => {
    // 1. Get all active missions
    const missions = await missionModel.find({ isActive: true }).lean();
    
    // 2. Get user's submissions
    const submissions = await submissionModel.find({ userId }).lean();
    
    // 3. Map submissions to mission IDs for easy lookup
    const submissionMap = new Map(submissions.map(s => [s.missionId.toString(), s]));
    
    // 4. Transform missions to include status
    const missionsWithStatus: MissionWithStatus[] = missions.map(mission => {
        const missionIdStr = mission._id.toString();
        const submission = submissionMap.get(missionIdStr);
        // Determine status: 'available', 'pending', 'approved' (completed), 'rejected'
        let status = 'available';
        
        if (submission) {
            status = submission.status;
        }

        return {
            _id: mission._id,
            title: mission.title,
            reward: mission.reward,
            link: mission.link,
            type: mission.type,
            isActive: mission.isActive,
            status
        };
    });

    return { success: true, missions: missionsWithStatus };
}

/**
 * Accept a mission
 */
export const acceptMission = async (userId: string, missionId: string) => {
    // Check if mission exists
    const mission = await missionModel.findById(missionId);
    if (!mission || !mission.isActive) {
        return { success: false, message: 'Nhiệm vụ không tồn tại hoặc đã hết hạn' }
    }

    // Check if already accepted/submitted
    const existing = await submissionModel.findOne({ userId, missionId });
    if (existing) {
         return { success: false, message: 'Bạn đã nhận nhiệm vụ này rồi' }
    }

    // Create 'accepted' submission
    await submissionModel.create({
        userId,
        missionId,
        status: 'accepted'
    });

    return { success: true, message: 'Nhận nhiệm vụ thành công!' }
}

/**
 * Submit mission proof
 */
export const submitMissionProof = async (userId: string, missionId: string, imageProof?: Express.Multer.File) => {
    if (!missionId) return { success: false, message: 'Mission ID is required' }
    if (!imageProof) return { success: false, message: 'Vui lòng tải lên ảnh bằng chứng' }

    // Check if mission exists
    const mission = await missionModel.findById(missionId);
    if (!mission || !mission.isActive) {
        // Cleanup file if invalid mission
        if (fs.existsSync(imageProof.path)) {
            try { fs.unlinkSync(imageProof.path) } catch (_error) { void _error }
        }
        return { success: false, message: 'Nhiệm vụ không tồn tại hoặc đã hết hạn' }
    }

    // Check if already submitted (pending or approved)
    // We allow finding 'accepted' or 'rejected' here to update them
    const existingSubmission = await submissionModel.findOne({ 
        userId, 
        missionId
    });

    // If it's pending or approved, block re-submission
    if (existingSubmission && (existingSubmission.status === 'pending' || existingSubmission.status === 'approved')) {
        if (fs.existsSync(imageProof.path)) {
            try { fs.unlinkSync(imageProof.path) } catch (_error) { void _error }
        }
        return { success: false, message: 'Bạn đã nộp nhiệm vụ này rồi, vui lòng chờ duyệt' }
    }

    try {
        console.log("Uploading proof for mission:", mission.title);

        // Check for Cloudinary config presence
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_SECRET_KEY;

        if (!cloudName || !apiKey || !apiSecret) {
             throw new Error("Missing Cloudinary configuration");
        }

        // Upload to Cloudinary
        const upload = await cloudinary.uploader.upload(imageProof.path, {
            folder: 'mission_proofs'
        });

        if (existingSubmission) {
            // Update existing record (accepted -> pending or rejected -> pending)
            existingSubmission.imageProof = upload.secure_url;
            existingSubmission.status = 'pending';
            existingSubmission.adminNote = undefined;
            await existingSubmission.save();
        } else {
            // Fallback: create new if for some reason acceptance didn't happen (or direct submission allowance)
            await submissionModel.create({
                userId,
                missionId,
                imageProof: upload.secure_url,
                status: 'pending'
            });
        }

        return { success: true, message: 'Nộp nhiệm vụ thành công! Vui lòng chờ Admin duyệt trong 24h.' }

    } catch (error: unknown) {
        console.error("Mission submission error:", error);
        return { success: false, message: 'Lỗi tải ảnh lên: ' + (error instanceof Error ? error.message : String(error)) }
    } finally {
        // Cleanup local file
        if (fs.existsSync(imageProof.path)) {
            fs.unlinkSync(imageProof.path);
        }
    }
}
