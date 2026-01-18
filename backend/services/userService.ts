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

    // One-time migration of mission rewards for existing users
    if (!user.isMissionBalanceMigrated) {
        try {
            const missions = await missionModel.find({ _id: { $in: user.completedMissions } });
            const totalMissionRewards = missions.reduce((sum, mission) => sum + (mission.reward || 0), 0);

            if (totalMissionRewards > 0) {
                // Move mission rewards from balance to missionBalance
                const oldMissionBalance = user.missionBalance || 0;
                user.missionBalance = oldMissionBalance + totalMissionRewards;
                user.balance = (user.balance || 0) - totalMissionRewards;

                // Create a migration transaction record
                await transactionModel.create({
                    userId,
                    amount: totalMissionRewards,
                    type: 'mission',
                    description: `Đồng bộ tiền thưởng từ ${missions.length} nhiệm vụ đã hoàn thành trước đó`,
                    oldBalance: oldMissionBalance,
                    newBalance: user.missionBalance,
                    balanceType: 'mission',
                    status: 'approved',
                    createdAt: new Date()
                });
            }
            
            user.isMissionBalanceMigrated = true;
            await user.save();
        } catch (error) {
            console.error("Migration error for user", userId, error);
            // Continue anyway to not block user info fetch
        }
    }

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

const validateServiceLink = (link: string, platform: string): boolean => {
    if (!link) return false;
    let pattern;
    switch (platform.toLowerCase()) {
        case 'facebook':
            pattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.*$/i;
            break;
        case 'instagram':
            pattern = /^(https?:\/\/)?(www\.)?(instagram\.com)\/.*$/i;
            break;
        case 'tiktok':
            pattern = /^(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com)\/.*$/i;
            break;
        default:
            return true;
    }
    return pattern.test(link);
}

const validateGmail = (email: string): boolean => {
    if (!email) return false;
    return email.toLowerCase().endsWith('@gmail.com');
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

        if ((service as { isMaintenance?: boolean }).isMaintenance) {
            return { success: false, message: 'Dịch vụ này đang bảo trì, vui lòng quay lại sau!' }
        }

        if (link && !validateServiceLink(link, service.platform)) {
            return { success: false, message: `Link ${service.platform} không hợp lệ!` }
        }

        if (service.category === 'Tích Xanh') {
            const blueTickDetails = details as { username?: string };
            const username = blueTickDetails.username;
            if (typeof username !== 'string' || !validateGmail(username)) {
                return { success: false, message: 'Dịch vụ Tích Xanh yêu cầu tài khoản Gmail (@gmail.com)!' }
            }
        }

        const user = await userModel.findById(userId)
        if (!user) return { success: false, message: 'User not found' }

        if (service.category !== 'Tích Xanh') {
            if (quantity < 1000) {
                return { success: false, message: 'Số lượng tối thiểu là 1,000!' }
            }
            if (quantity > 1000000) {
                return { success: false, message: 'Số lượng tối đa là 1,000,000!' }
            }
        }

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

        // Create transaction record for the payment
        await transactionModel.create({
            userId,
            amount: -totalPrice,
            type: 'payment',
            description: `Thanh toán đơn hàng: ${service.name}`,
            oldBalance: user.balance + totalPrice,
            newBalance: user.balance,
            balanceType: 'profile',
            status: 'approved',
            createdAt: new Date()
        })

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
export const depositRequest = async (userId: string, amount: number, content?: string) => {
    if (amount <= 0) return { success: false, message: 'Invalid amount' }

    await transactionModel.create({ 
        userId, 
        amount, 
        type: 'deposit',
        description: content ? `Nạp tiền: ${content}` : 'Yêu cầu nạp tiền',
        balanceType: 'profile',
        status: 'pending'
    })
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

    user.missionBalance = (user.missionBalance || 0) + (mission.reward || 0)
    user.completedMissions.push(new Types.ObjectId(missionId))

    await user.save()

    // Create transaction record
    await transactionModel.create({
        userId,
        amount: mission.reward,
        type: 'mission',
        description: `Hoàn thành nhiệm vụ: ${mission.title}`,
        oldBalance: user.missionBalance - (mission.reward || 0),
        newBalance: user.missionBalance,
        balanceType: 'mission',
        status: 'approved',
        createdAt: new Date()
    })

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
    user.missionBalance = (user.missionBalance || 0) + rewardAmount
    user.attendance.lastDate = now
    await user.save()

    // Create Transaction Record
    await transactionModel.create({
        userId: new Types.ObjectId(userId),
        amount: rewardAmount,
        type: 'attendance',
        description: `Điểm danh thành công (Ngày ${user.attendance.streak})`,
        oldBalance: user.missionBalance - rewardAmount,
        newBalance: user.missionBalance,
        balanceType: 'mission',
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
        // Determine status: 'available', 'pending', 'approved', 'rejected'
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
            status,
            clickedAt: submission?.clickedAt
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
 * Record a click on a mission link
 */
export const recordMissionClick = async (userId: string, missionId: string) => {
    const mission = await missionModel.findById(missionId);
    if (!mission || !mission.isActive) {
        return { success: false, message: 'Nhiệm vụ không tồn tại' };
    }

    const uId = new Types.ObjectId(userId);
    const mId = new Types.ObjectId(missionId);

    console.log(`[CLICK_TRACKING] Processing for User: ${userId}, Mission: ${missionId}`);

    let submission = await submissionModel.findOne({ userId: uId, missionId: mId });
    if (!submission) {
        console.log(`[CLICK_TRACKING] Creating new 'accepted' submission for User: ${userId}`);
        submission = await submissionModel.create({
            userId: uId,
            missionId: mId,
            status: 'accepted',
            isClicked: true,
            clickedAt: new Date()
        });
    } else {
        console.log(`[CLICK_TRACKING] Updating existing submission (Status: ${submission.status}) to isClicked: true for User: ${userId}`);
        submission.isClicked = true;
        submission.clickedAt = new Date();
        await submission.save();
    }

    return { success: true, message: 'Link click recorded' };
}

/**
 * Submit mission proof
 */
export const submitMissionProof = async (userId: string, missionId: string, imageProof?: Express.Multer.File, _isLinkClicked?: string) => {
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

    const uId = new Types.ObjectId(userId);
    const mId = new Types.ObjectId(missionId);

    // Check submission status
    const existingSubmission = await submissionModel.findOne({ 
        userId: uId, 
        missionId: mId
    });

    // If it's pending or approved, block re-submission
    if (existingSubmission && (existingSubmission.status === 'pending' || existingSubmission.status === 'approved')) {
        if (fs.existsSync(imageProof.path)) {
            try { fs.unlinkSync(imageProof.path) } catch (_error) { void _error }
        }
        return { success: false, message: 'Bạn đã nộp nhiệm vụ này rồi, vui lòng chờ duyệt' }
    }

    // AUTO-REJECT IF NOT CLICKED
    if (!existingSubmission || !existingSubmission.isClicked) {
        if (fs.existsSync(imageProof.path)) {
            try { fs.unlinkSync(imageProof.path) } catch (_error) { void _error }
        }
        
        const errorMessage = 'Hệ thống: Bạn chưa ấn "Thực hiện" hoặc "Link nhiệm vụ". Vui lòng ấn vào link trước khi nộp ảnh bằng chứng.';
        
        if (existingSubmission) {
            existingSubmission.status = 'rejected';
            existingSubmission.adminNote = errorMessage;
            await existingSubmission.save();
        } else {
             await submissionModel.create({
                userId: uId,
                missionId: mId,
                status: 'rejected',
                adminNote: errorMessage,
                imageProof: '' 
            });
        }
        
        return { 
            success: false, 
            message: 'Bạn phải truy cập link nhiệm vụ hoặc ấn "Thực hiện" trước khi nộp bằng chứng.' 
        };
    }

    try {
        console.log(`[MISSION_SUBMIT] Processing proof for Mission: ${mission.title} by User: ${userId}`);

        // Check for Cloudinary config presence
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_SECRET_KEY;

        if (!cloudName || !apiKey || !apiSecret) {
             throw new Error("Missing Cloudinary configuration");
        }

        // Upload to Cloudinary with extended timeout (5 mins)
        const upload = await cloudinary.uploader.upload(imageProof.path, {
            folder: 'mission_proofs',
            timeout: 300000 // 300 seconds (5 minutes)
        });

        // Update submission with proof and set to pending first for trace
        existingSubmission.imageProof = upload.secure_url;
        existingSubmission.status = 'pending';
        existingSubmission.adminNote = 'Hệ thống: Đã click link - Tự động duyệt';
        await existingSubmission.save();

        // NEW AUTO VERIFICATION LOGIC (NO AI VISION)
        let verificationResult;
        try {
             const { verifyMissionProof } = await import('./verifyMissionService.js');
             console.log(`[MISSION_VERIFY] Verifying proof for mission type: ${mission.type}`);
             // Pass clickedAt if available. explicitly cast to Date if needed or let JS handle it
             verificationResult = await verifyMissionProof(imageProof.path, mission.type, existingSubmission.clickedAt ?? undefined);
             console.log(`[MISSION_VERIFY] Result:`, verificationResult);
        } catch (err) {
             console.error("[MISSION_VERIFY] failed:", err);
             verificationResult = { success: false, status: 'pending', reason: 'System Error', imageHash: '' };
        }

        // Save hash if available
        if (verificationResult.imageHash) {
            existingSubmission.imageHash = verificationResult.imageHash;
        }

        if (verificationResult.status === 'approved') {
             const { approveUserSubmission } = await import('./adminService.js');
             const approveResult = await approveUserSubmission(existingSubmission._id.toString());
             
             if (approveResult.success) {
                existingSubmission.adminNote = `Auto: ${verificationResult.reason}`;
                await existingSubmission.save();

                return { 
                    success: true, 
                    message: `Nhiệm vụ được duyệt tự động! (+${mission.reward.toLocaleString()}đ)` 
                };
             }
        } 
        
        // If rejected
        if (verificationResult.status === 'rejected') {
             existingSubmission.status = 'rejected';
             existingSubmission.adminNote = `Auto Reject: ${verificationResult.reason}`;
             await existingSubmission.save();
             
             return {
                 success: false,
                 message: `Từ chối: ${verificationResult.reason}`
             };
        }

        // If pending / fallback
        existingSubmission.adminNote = `Check: ${verificationResult.reason}. Chờ Admin duyệt.`;
        await existingSubmission.save();

        return { 
            success: true, 
            message: 'Nộp thành công! Vui lòng chờ Admin duyệt.' 
        };

    } catch (error: unknown) {
        console.error("Mission submission error:", error);
        return { success: false, message: 'Lỗi nộp nhiệm vụ: ' + (error instanceof Error ? error.message : String(error)) }
    } finally {
        // Cleanup local file
        if (fs.existsSync(imageProof.path)) {
            fs.unlinkSync(imageProof.path);
        }
    }
}

/**
 * Withdraw mission balance
 */
export const withdrawMissionBalance = async (
    userId: string, 
    amount: number, 
    method: 'web' | 'bank' = 'web',
    details?: { bankName?: string; bankAccount?: string; qrCodeFile?: Express.Multer.File; email?: string }
) => {
    if (amount < 10000) return { success: false, message: 'Số tiền rút tối thiểu là 10.000 đ' }

    const user = await userModel.findById(userId)
    if (!user) return { success: false, message: 'User not found' }

    if ((user.missionBalance || 0) < amount) {
        return { success: false, message: 'Số dư nhiệm vụ không đủ' }
    }

    // Deduct from mission balance first
    user.missionBalance = (user.missionBalance || 0) - amount

    if (method === 'web') {
        // Instant transfer to profile balance
        user.balance = (user.balance || 0) + amount
        await user.save()

        // Create an approved transaction record
        await transactionModel.create({
            userId,
            amount,
            type: 'transfer',
            description: 'Đổi tiền từ ví nhiệm vụ sang ví chính (Web Account)',
            oldBalance: user.missionBalance,
            newBalance: user.missionBalance, // This is for mission balance type
            balanceType: 'mission',
            status: 'approved',
            withdrawalDetails: { method: 'web' },
            createdAt: new Date()
        })

        // Also record the addition to profile balance
        await transactionModel.create({
            userId,
            amount,
            type: 'adjustment',
            description: 'Nhận tiền từ ví nhiệm vụ (Web Account)',
            oldBalance: (user.balance || 0) - amount,
            newBalance: user.balance,
            balanceType: 'profile',
            status: 'approved',
            createdAt: new Date()
        })

        return { 
            success: true, 
            message: 'Rút tiền về ví chính thành công!', 
            missionBalance: user.missionBalance,
            balance: user.balance
        }
    } else {
        // Bank withdrawal - needs admin approval and has 20% fee
        let qrCodeUrl = "";
        
        if (details?.qrCodeFile) {
            try {
                const upload = await cloudinary.uploader.upload(details.qrCodeFile.path, {
                    folder: 'withdrawal_qrs'
                });
                qrCodeUrl = upload.secure_url;
            } catch (error) {
                console.error("QR Upload error", error);
            } finally {
                if (fs.existsSync(details.qrCodeFile.path)) {
                    fs.unlinkSync(details.qrCodeFile.path);
                }
            }
        }

        const fee = amount * 0.2;
        const finalAmount = amount - fee;

        await user.save();

        // Create a pending transaction record
        await transactionModel.create({
            userId,
            amount: -amount,
            type: 'withdraw',
            description: `Yêu cầu rút tiền về ngân hàng (${details?.bankName}). Thực nhận: ${finalAmount.toLocaleString()} đ (Phí 20%: ${fee.toLocaleString()} đ)`,
            oldBalance: user.missionBalance + amount,
            newBalance: user.missionBalance,
            balanceType: 'mission',
            status: 'pending',
            withdrawalDetails: {
                method: 'bank',
                bankName: details?.bankName,
                bankAccount: details?.bankAccount,
                qrCode: qrCodeUrl,
                email: details?.email
            },
            createdAt: new Date()
        })

        if (details?.email) {
            try {
                // Dynamic import mailService
                const { sendWithdrawalNotification } = await import('./mailService.js');
                void sendWithdrawalNotification(details.email, {
                     bankName: details.bankName ?? 'Unknown',
                     bankAccount: details.bankAccount ?? 'Unknown',
                     amount: amount,
                     transactionId: `WD-${Date.now()}`
                });
            } catch (error) {
                console.error("Email notification failed", error);
            }
        }

        return { 
            success: true, 
            message: 'Yêu cầu rút tiền về ngân hàng đã được gửi! Vui lòng chờ Admin duyệt.', 
            missionBalance: user.missionBalance 
        }
    }
}

/**
 * Get user transaction history
 */
export const getTransactions = async (userId: string, type?: string) => {
    const query: Record<string, string> = { userId }
    if (type) {
        query.type = type
    }
    const transactions = await transactionModel.find(query).sort({ createdAt: -1 })
    return { success: true, transactions }
}
