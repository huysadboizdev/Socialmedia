import { Types } from 'mongoose'
import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import bcrypt from 'bcrypt'
import userModel, { type IUser } from '../models/userModel.js'
import missionModel from '../models/missionModel.js'
import serviceModel from '../models/serviceModel.js'
import orderModel from '../models/orderModel.js'
import transactionModel from '../models/transactionModel.js'
import notificationModel from '../models/notificationModel.js'
import submissionModel from '../models/submissionModel.js'
import settingModel from '../models/settingModel.js'
import couponModel from '../models/couponModel.js'
import { addSmmOrder } from './smmApiService.js'

function getISOWeek(date: Date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

function maskName(name: string): string {
  if (!name) return 'Ẩn danh';
  const parts = name.split(' ');
  if (parts.length === 1) {
    const s = parts[0] ?? '';
    return s.length > 2 ? `${s.substring(0, 2)}${'*'.repeat(s.length - 2)}` : `${s}*`;
  }
  return parts.map((p, i) => {
    if (i === parts.length - 1) return p; // Keep last name
    return p.length > 1 ? `${p.charAt(0)}${'*'.repeat(p.length - 1)}` : p;
  }).join(' ');
}

function maskAmount(amount: number): string {
  const s = amount.toLocaleString('vi-VN');
  if (s.length <= 3) return `**${s}`;
  return `**${s.substring(2)}`;
}

/**
 * Get user membership rank and discount based on dynamic config
 */
export function getUserRank(user: { totalDeposit: number, role?: string } | null, config?: { tiers: { name: string, threshold: number, discount: number }[] }) {
  const defaultTiers = [
    { name: 'Nhà phân phối', threshold: 20000000, discount: 0.3 },
    { name: 'Cộng tác viên', threshold: 5000000, discount: 0.1 },
    { name: 'Thành viên', threshold: 0, discount: 0 }
  ];

  const tiers = config?.tiers ?? defaultTiers;
  
  // Sort tiers by threshold descending to find the highest match
  const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);
  
  if (user?.role === 'admin') {
    return { name: 'Quản trị viên', discount: sortedTiers[0]?.discount ?? 0.3 };
  }

  const deposit = user?.totalDeposit ?? 0;

  for (const tier of sortedTiers) {
    if (deposit >= tier.threshold) {
      return { name: tier.name, discount: tier.discount };
    }
  }

  return { name: 'Thành viên', discount: 0 };
}

interface UpdateProfileParams {
  username?: string;
  fullName?: string;
  email?: string;
  imageFile?: Express.Multer.File;
}

interface HandleServiceParams {
  action: string;
  serviceId?: string;
  quantity?: number;
  link?: string;
  note?: string;
  details?: Record<string, unknown> & { twoFactorCode?: string; notificationId?: string; orderId?: string; issue?: string; reportNote?: string };
  orderId?: string;
  issue?: string;
  reportNote?: string;
  couponCode?: string;
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

    const [rankConfig, weeklyWinner, _, withdrawnStats] = await Promise.all([
        settingModel.findOne({ key: 'membershipConfig' }),
        settingModel.findOne({ key: 'weeklyTopWinner' }),
        checkAttendance(userId),
        transactionModel.aggregate<{ total: number }>([
            { $match: { userId: new Types.ObjectId(userId), balanceType: 'mission', status: 'approved', type: { $in: ['transfer', 'withdraw'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);
    const rank = getUserRank(user, rankConfig?.value as { tiers: { name: string, threshold: number, discount: number }[] });
    
    let isWeeklyTop = false;
    if (weeklyWinner?.value) {
        const winnerVal = weeklyWinner.value as { userId: string, forWeek: string };
        if (winnerVal.userId === userId) {
            const currentWeek = getISOWeek(new Date());
            if (winnerVal.forWeek === currentWeek) {
                isWeeklyTop = true;
            }
        }
    }

    const firstStat = withdrawnStats[0];
    const totalWithdrawn = firstStat ? Math.abs(firstStat.total) : 0;

    return { 
        success: true, 
        user: { 
            ...user.toObject(), 
            rankName: rank.name,
            rankDiscount: rank.discount,
            isWeeklyTop,
            totalWithdrawn
        } 
    }
}

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, { username, fullName, email, imageFile }: UpdateProfileParams) => {
    const updateData: Partial<IUser> = {}
    if (username) updateData.username = username
    if (fullName) updateData.fullName = fullName
    
    if (email) {
        const trimmedEmail = email.trim()
        if (!validateEmail(trimmedEmail)) {
            throw new Error('Địa chỉ email không hợp lệ.')
        }
        
        // Check if email already exists for another user
        const existingUser = await userModel.findOne({ email: trimmedEmail, _id: { $ne: userId } })
        if (existingUser) {
            throw new Error('Email này đã được sử dụng bởi tài khoản khác')
        }
        
        updateData.email = trimmedEmail
    }

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
 * Validate service link based on platform and type
 */
function validateServiceLink(link: string, platform: string, category: string, name: string): { valid: boolean; message?: string } {
    if (!link) return { valid: false, message: 'Link không được để trống' };
    
    let isPlatformValid = false;
    switch (platform.toLowerCase()) {
        case 'facebook':
            isPlatformValid = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com|fb\.watch)\/.*$/i.test(link);
            break;
        case 'instagram':
            isPlatformValid = /^(https?:\/\/)?(www\.)?(instagram\.com)\/.*$/i.test(link);
            break;
        case 'tiktok':
            isPlatformValid = /^(https?:\/\/)?(www\.|vt\.)?(tiktok\.com)\/.*$/i.test(link);
            break;
        default:
            isPlatformValid = true;
    }

    if (!isPlatformValid) {
        return { valid: false, message: `Link ${platform} không hợp lệ!` };
    }

    const text = `${category} ${name}`.toLowerCase();
    let requiredType: 'post' | 'profile' | 'any' = 'any';
    
    if (text.includes('follow') || text.includes('theo dõi') || text.includes('sub') || text.includes('tích xanh') || text.includes('thành viên') || text.includes('member')) {
        requiredType = 'profile';
    } else if (text.includes('like') || text.includes('share') || text.includes('chia sẻ') || text.includes('comment') || text.includes('bình luận') || text.includes('view') || text.includes('lượt xem') || text.includes('tym') || text.includes('mắt') || text.includes('cảm xúc')) {
        requiredType = 'post';
    }

    if (requiredType === 'any') return { valid: true };

    const linkLower = link.toLowerCase();

    if (platform.toLowerCase() === 'facebook') {
        const postRegex = /\/(posts|videos|video\.php|photo\.php|photo|permalink\.php|story\.php|reel|watch|p|share)\/?|\?.*fbid=|fb\.watch/i;
        const isPostLink = postRegex.test(linkLower);
        
        if (requiredType === 'post' && !isPostLink) {
            return { valid: false, message: 'Vui lòng nhập link bài viết hoặc video (không sử dụng link trang cá nhân/Fanpage).' };
        }
        if (requiredType === 'profile' && isPostLink) {
            return { valid: false, message: 'Vui lòng nhập link trang cá nhân hoặc Fanpage (không sử dụng link bài viết).' };
        }
    } else if (platform.toLowerCase() === 'tiktok') {
        const isVideoLink = /\/video\//i.test(linkLower) || /vt\.tiktok\.com/i.test(linkLower);
        const isProfileLink = /\/@/i.test(linkLower) && !isVideoLink;

        if (requiredType === 'post' && !isVideoLink) {
            return { valid: false, message: 'Vui lòng nhập link video TikTok (ví dụ: tiktok.com/@user/video/123 hoặc vt.tiktok.com/...)' };
        }
        if (requiredType === 'profile' && !isProfileLink) {
            return { valid: false, message: 'Vui lòng nhập link kênh TikTok (ví dụ: tiktok.com/@user).' };
        }
    } else if (platform.toLowerCase() === 'instagram') {
        const isPostLink = /\/(p|reel|tv)\//i.test(linkLower);
        
        if (requiredType === 'post' && !isPostLink) {
            return { valid: false, message: 'Vui lòng nhập link bài viết/Reels Instagram (ví dụ: instagram.com/p/123).' };
        }
        if (requiredType === 'profile' && isPostLink) {
            return { valid: false, message: 'Vui lòng nhập link trang cá nhân Instagram (không sử dụng link bài viết).' };
        }
    }

    return { valid: true };
}

function validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Handle services and orders for user
 */
export const handleService = async (userId: string, params: HandleServiceParams) => {
    const { action, serviceId, quantity = 1, link, note, details, orderId, issue, reportNote, couponCode } = params;
    if (action === 'getServices') {
        const [services, user, rankConfig] = await Promise.all([
            serviceModel.find().lean(),
            userModel.findById(userId),
            settingModel.findOne({ key: 'membershipConfig' })
        ]);
        
        let discountPctPercent = 0;
        const rank = getUserRank(user ?? null, rankConfig?.value as { tiers: { name: string, threshold: number, discount: number }[] });
        discountPctPercent = rank.discount * 100;

        try {
             // Weekly TOP Reward Discount (20%)
             const weeklyWinner = await settingModel.findOne({ key: 'weeklyTopWinner' });
             if (weeklyWinner?.value) {
                 const winnerVal = weeklyWinner.value as { userId: string, forWeek: string };
                 if (winnerVal.userId === userId) {
                     const currentWeek = getISOWeek(new Date());
                     if (winnerVal.forWeek === currentWeek) {
                         discountPctPercent += 20;
                     }
                 }
             }
        } catch (err) {
             console.error("Error fetching weekly discount", err);
        }

        if (discountPctPercent > 90) {
            discountPctPercent = 90;
        }

        const rankDisplay = rank.name;

        const processedServices = services.map(s => {
            const safePrice = s.price || 0;
            if (discountPctPercent > 0) {
                return {
                    ...s,
                    originalPrice: safePrice,
                    price: safePrice - Math.floor(safePrice * (discountPctPercent / 100)),
                    name: `[Giảm ${discountPctPercent}%] ` + s.name
                };
            }
            return {
                ...s,
                originalPrice: safePrice,
                price: safePrice
            };
        });

        return { success: true, services: processedServices, discountPct: discountPctPercent, rankName: rankDisplay };
    }

    if (action === 'validateCoupon') {
        const [user, rankConfig] = await Promise.all([
            userModel.findById(userId),
            settingModel.findOne({ key: 'membershipConfig' })
        ]);
        if (!user) return { success: false, message: 'User not found' };

        const rank = getUserRank(user, rankConfig?.value as { tiers: { name: string, threshold: number, discount: number }[] });
        let discountPctPercent = rank.discount * 100;
        let weeklyDiscountPercent = 0;

        try {
            const weeklyWinner = await settingModel.findOne({ key: 'weeklyTopWinner' });
            if (weeklyWinner?.value) {
                const winnerVal = weeklyWinner.value as { userId: string, forWeek: string };
                if (winnerVal.userId === userId) {
                    const currentWeek = getISOWeek(new Date());
                    if (winnerVal.forWeek === currentWeek) {
                        weeklyDiscountPercent = 20;
                        discountPctPercent += 20;
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching weekly discount in validateCoupon", err);
        }

        const couponInfo = {
            rankDiscount: discountPctPercent,
            couponDiscountPercent: 0,
            couponDiscountAmount: 0,
            isValid: false,
            message: ''
        };

        if (couponCode) {
            const coupon = await couponModel.findOne({ 
                code: couponCode.toUpperCase(), 
                isActive: true,
                expiryDate: { $gt: new Date() }
            });

            if (coupon) {
                if (coupon.usedQuantity < coupon.totalQuantity) {
                    couponInfo.isValid = true;
                    couponInfo.couponDiscountPercent = coupon.discountPercent;
                    couponInfo.couponDiscountAmount = coupon.discountAmount;
                } else {
                    couponInfo.message = 'Mã giảm giá đã hết lượt sử dụng';
                }
            } else {
                couponInfo.message = 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
            }
        }

        return { 
            success: couponCode ? couponInfo.isValid : true, 
            userDiscounts: {
                rankPercent: rank.discount * 100,
                weeklyPercent: weeklyDiscountPercent
            },
            couponInfo: couponInfo.isValid ? couponInfo : null,
            error: couponInfo.message
        };
    }

    if (action === 'reportOrder') {
        if (!orderId) return { success: false, message: 'Order ID is required' }
        if (!issue) return { success: false, message: 'Issue is required' }

        const order = await orderModel.findOne({ _id: orderId, userId })
        if (!order) return { success: false, message: 'Order not found' }

        order.set('report', {
            message: issue,
            note: reportNote,
            status: 'pending',
            createdAt: new Date()
        })
        
        await order.save()

        try {
            const adminUser = await userModel.findOne({ role: 'admin' })
            if (adminUser) {
                await notificationModel.create({
                    userId: adminUser._id,
                    type: 'warning',
                    message: `[REPORT] Người dùng vừa báo lỗi đơn hàng ${order._id.toString()}: ${issue}`,
                    isRead: false,
                    createdAt: new Date()
                })
            }
        } catch (notifErr) {
            console.error("Failed to notify admin of report", notifErr)
        }
        
        return { success: true, message: 'Báo lỗi thành công! Admin sẽ kiểm tra sớm nhất.' }
    }

    if (action === 'getReportedOrders') {
        const orders = await orderModel.find({ 
            userId, 
            'report.message': { $exists: true, $ne: null } 
        }).populate('service').sort({ 'report.createdAt': -1 })
        return { success: true, orders }
    }

    if (action === 'createOrder') {
        if (!serviceId) return { success: false, message: 'Service ID is required' }
        const service = await serviceModel.findById(serviceId)
        if (!service) return { success: false, message: 'Service not found' }

        if ((service as { isMaintenance?: boolean }).isMaintenance) {
            return { success: false, message: 'Dịch vụ này đang bảo trì, vui lòng quay lại sau!' }
        }

        if (link) {
            const validation = validateServiceLink(link, service.platform, service.category, service.name);
            if (!validation.valid) {
                return { success: false, message: validation.message ?? `Link ${service.platform} không hợp lệ!` };
            }
        }

        if (service.category === 'Tích Xanh') {
            const blueTickDetails = details as { username?: string };
            const username = blueTickDetails.username;
            if (typeof username !== 'string' || !validateEmail(username)) {
                return { success: false, message: 'Dịch vụ Tích Xanh yêu cầu tài khoản Gmail (@gmail.com)!' }
            }
        }

        const [user, rankConfig] = await Promise.all([
            userModel.findById(userId),
            settingModel.findOne({ key: 'membershipConfig' })
        ])
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
        let finalPrice = totalPrice;

        // Apply Highest Discount (Tiered Membership vs Weekly Reward vs Coupon)
        let discountPercent = 0;
        let couponDiscountAmount = 0;
        
        // 1. Tiered Membership Discount
        const rank = getUserRank(user, rankConfig?.value as { tiers: { name: string, threshold: number, discount: number }[] });
        discountPercent += rank.discount;

        // 2. Weekly Top Reward (20%)
        try {
            const weeklyWinner = await settingModel.findOne({ key: 'weeklyTopWinner' });
            const winnerVal = weeklyWinner?.value as { userId: string, forWeek: string } | undefined;
            if (winnerVal?.userId === userId) {
                const currentWeek = getISOWeek(new Date());
                if (winnerVal.forWeek === currentWeek) {
                    discountPercent += 0.2;
                }
            }
        } catch (err) {
            console.error("Error applying weekly discount in order", err);
        }

        // 3. Coupon Code Discount
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = await couponModel.findOne({ 
                code: couponCode.toUpperCase(), 
                isActive: true,
                expiryDate: { $gt: new Date() }
            });

            if (coupon) {
                if (coupon.usedQuantity < coupon.totalQuantity) {
                    if (coupon.discountPercent > 0) {
                        discountPercent += (coupon.discountPercent / 100);
                    } else if (coupon.discountAmount > 0) {
                        couponDiscountAmount = coupon.discountAmount;
                    }
                    appliedCoupon = coupon;
                } else {
                    return { success: false, message: 'Mã giảm giá đã hết lượt sử dụng!' }
                }
            } else {
                return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn!' }
            }
        }

        if (discountPercent > 0.9) {
            discountPercent = 0.9;
        }

        if (discountPercent > 0) {
            finalPrice = totalPrice - Math.floor(totalPrice * discountPercent);
        }
        
        if (couponDiscountAmount > 0) {
            finalPrice = Math.max(0, finalPrice - couponDiscountAmount);
        }

        if ((user.balance || 0) < finalPrice) {
            return { success: false, message: 'Số dư tài khoản không đủ. Vui lòng nạp thêm!' }
        }

        let externalOrderId = "";
        const apiProviderId = service.get('apiProviderId') as string | undefined;
        if (apiProviderId) {
            const apiRes = await addSmmOrder(apiProviderId, link ?? "", quantity);
            if (apiRes.order) {
                externalOrderId = String(apiRes.order);
            } else {
                return { success: false, message: `Lỗi kết nối nhà cung cấp: ${apiRes.error ?? 'Kiểm tra lại link hoặc số lượng.'}` };
            }
        }

        const order = await orderModel.create({
            userId,
            service: serviceId,
            quantity,
            totalPrice: finalPrice,
            link: link ?? "",
            note: note ?? "",
            details: details ?? {},
            status: 'Pending',
            externalOrderId: externalOrderId
        })

        user.balance = (user.balance || 0) - finalPrice
        await user.save()

        // Increment coupon usage
        if (appliedCoupon) {
            appliedCoupon.usedQuantity += 1;
            await appliedCoupon.save();
        }

        // Create transaction record for the payment
        await transactionModel.create({
            userId,
            amount: -finalPrice,
            type: 'payment',
            description: `Thanh toán đơn hàng: ${service.name}${appliedCoupon ? ` (Mã: ${appliedCoupon.code})` : ''}`,
            oldBalance: user.balance + finalPrice,
            newBalance: user.balance,
            balanceType: 'profile',
            status: 'approved',
            createdAt: new Date()
        })

        // Notify admin about the new order
        try {
            const adminUser = await userModel.findOne({ role: 'admin' });
            if (adminUser) {
                await notificationModel.create({
                    userId: adminUser._id,
                    type: 'info',
                    message: `[ORDER] Người dùng ${user.username || 'ẩn danh'} vừa đặt đơn ${service.platform}, ${service.category}: ${service.name} (SL: ${quantity})`,
                    isRead: false,
                    createdAt: new Date()
                });
            }
            
            // Notify user
            await notificationModel.create({
                userId: userId,
                type: 'success',
                message: `Đặt đơn hàng ${service.name} thành công. Vui lòng chờ xử lý!`,
                isRead: false,
                createdAt: new Date()
            });
        } catch (notifErr) {
            console.error("Failed to notify admin or user of new order", notifErr);
        }

        return { success: true, message: 'Đặt đơn hàng thành công!', order }
    }

    if (action === 'getOrderHistory') {
        const orders = await orderModel.find({ userId }).populate('service')
        return { success: true, orders }
    }

    if (action === 'getNotifications') {
        let actualUserId = userId;
        if (userId === 'admin') {
             const adminUser = await userModel.findOne({ role: 'admin' });
             if (adminUser) actualUserId = adminUser._id.toString();
             else return { success: true, notifications: [], unreadCount: 0 };
        }

        const notifications = await notificationModel.find({ userId: actualUserId }).sort({ createdAt: -1 }).limit(20);
        const unreadCount = await notificationModel.countDocuments({ userId: actualUserId, isRead: false });
        return { success: true, notifications, unreadCount };
    }

    if (action === 'markNotificationRead') {
         let actualUserId = userId;
         if (userId === 'admin') {
              const adminUser = await userModel.findOne({ role: 'admin' });
              if (adminUser) actualUserId = adminUser._id.toString();
              else return { success: false, message: 'Admin not found' };
         }

         if (!details?.notificationId) {
             // If no specific ID, mark all as read
             await notificationModel.updateMany({ userId: actualUserId, isRead: false }, { isRead: true });
             return { success: true, message: 'Marked all as read' };
         } else {
             await notificationModel.findByIdAndUpdate(details.notificationId, { isRead: true });
             return { success: true, message: 'Marked as read' };
         }
    }

    if (action === 'reportOrder') {
        if (!details?.orderId) return { success: false, message: 'Order ID is required' }
        if (!details.issue) return { success: false, message: 'Issue is required' }

        const order = await orderModel.findOne({ _id: details.orderId, userId })
        if (!order) return { success: false, message: 'Order not found' }

        order.set('report', {
            message: details.issue,
            note: details.reportNote,
            status: 'pending',
            createdAt: new Date()
        })
        
        await order.save()

        try {
            const adminUser = await userModel.findOne({ role: 'admin' })
            if (adminUser) {
                await notificationModel.create({
                    userId: adminUser._id,
                    type: 'warning',
                    message: `[REPORT] Người dùng vừa báo lỗi đơn hàng ${order._id.toString()}: ${details.issue}`,
                    isRead: false,
                    createdAt: new Date()
                })
            }
        } catch (notifErr) {
            console.error("Failed to notify admin of report", notifErr)
        }
        
        return { success: true, message: 'Báo lỗi thành công! Admin sẽ kiểm tra sớm nhất.' }
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

    try {
        const user = await userModel.findById(userId)
        const adminUser = await userModel.findOne({ role: 'admin' })
        if (adminUser) {
            await notificationModel.create({
                userId: adminUser._id,
                type: 'info',
                message: `[DEPOSIT] Người dùng ${user?.username ?? 'ẩn danh'} vừa yêu cầu nạp ${amount.toLocaleString('vi-VN')} đ`,
                isRead: false,
                createdAt: new Date()
            })
        }

        // Notify user
        await notificationModel.create({
            userId: userId,
            type: 'info',
            message: `Yêu cầu nạp ${amount.toLocaleString('vi-VN')}đ thành công. Vui lòng chờ Admin duyệt!`,
            isRead: false,
            createdAt: new Date()
        });
    } catch (notifErr) {
        console.error("Failed to notify admin or user of deposit", notifErr)
    }

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
    
    // Stable helper for Vietnam Date String (YYYY-MM-DD)
    // Using Intl.DateTimeFormat parts for maximum reliability across Node versions
    const getVNDateParts = (d: Date) => {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(d);
        const day = parts.find(p => p.type === 'day')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const year = parts.find(p => p.type === 'year')?.value;
        return { day, month, year, dateStr: `${year}-${month}-${day}` };
    }

    const vnNow = getVNDateParts(now);
    
    if (user.attendance.lastDate) {
        const vnLast = getVNDateParts(new Date(user.attendance.lastDate));
        
        // Already checked in today?
        if (vnLast.dateStr === vnNow.dateStr) {
            return { success: false, message: 'Bạn đã điểm danh hôm nay rồi!' }
        }

        // Reset streak on new month
        if (vnLast.month !== vnNow.month || vnLast.year !== vnNow.year) {
            user.attendance.streak = 0
        }
    }

    // Cycle reset: If current streak is 7, restart at 1
    if (user.attendance.streak >= 7) {
        user.attendance.streak = 0
    }

    // Increment
    user.attendance.streak += 1

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
        description: `Điểm danh thành công (Ngày ${user.attendance.streak}/7)`,
        oldBalance: user.missionBalance - rewardAmount,
        newBalance: user.missionBalance,
        balanceType: 'mission',
        status: 'approved', // Auto-approved
        createdAt: now
    })

    try {
        await notificationModel.create({
            userId: new Types.ObjectId(userId),
            type: 'success',
            message: `Điểm danh thành công ngày ${user.attendance.streak}! Bạn nhận được +${rewardAmount.toLocaleString()}đ`,
            isRead: false,
            createdAt: now
        });
    } catch (notifErr) {
        console.error("Failed to notify user of attendance", notifErr);
    }

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
    const user = await userModel.findById(uId);

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
             const approveResult = await approveUserSubmission(existingSubmission._id.toString(), true);
             
             if (approveResult.success) {
                existingSubmission.adminNote = `Auto: ${verificationResult.reason}`;
                await existingSubmission.save();

                try {
                    await notificationModel.create({
                        userId: uId,
                        type: 'success',
                        message: `Nhiệm vụ ${mission.title} đã được tự động duyệt thành công! (+${mission.reward.toLocaleString()}đ)`,
                        isRead: false,
                        createdAt: new Date()
                    });
                } catch (_notifErr) {}

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

        try {
            await notificationModel.create({
                userId: uId,
                type: 'info',
                message: `Nộp bằng chứng nhiệm vụ ${mission.title} thành công! Vui lòng chờ Admin duyệt.`,
                isRead: false,
                createdAt: new Date()
            });

            // Notify admin
            const adminUser = await userModel.findOne({ role: 'admin' });
            if (adminUser) {
                await notificationModel.create({
                    userId: adminUser._id,
                    type: 'info',
                    message: `[MISSION] Người dùng ${user?.username ?? 'ẩn danh'} vừa nộp bằng chứng nhiệm vụ: ${mission.title}`,
                    isRead: false,
                    createdAt: new Date()
                });
            }
        } catch (_notifErr) {}

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
    details?: { bankName?: string; bankAccount?: string; qrCodeFile?: Express.Multer.File; email?: string, twoFactorCode?: string }
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
            amount: -amount,
            type: 'transfer',
            description: 'Đổi tiền từ ví nhiệm vụ sang ví chính (Web Account)',
            oldBalance: user.missionBalance + amount,
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

        try {
            await notificationModel.create({
                userId,
                type: 'success',
                message: `Bạn đã rút thành công ${amount.toLocaleString('vi-VN')}đ từ ví nhiệm vụ sang ví chính!`,
                isRead: false,
                createdAt: new Date()
            });
        } catch (_err) {}

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

        // Generate a tracking code for SePay matching
        const trackingCode = `HUYWD${Math.floor(1000 + Math.random() * 9000)}`;

        await user.save();

        // Create a pending transaction record
        await transactionModel.create({
            userId,
            amount: -amount,
            type: 'withdraw',
            description: `${trackingCode} - Yêu cầu rút tiền về ngân hàng (${details?.bankName}). Thực nhận: ${finalAmount.toLocaleString()} đ (Phí 20%: ${fee.toLocaleString()} đ)`,
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

        try {
            await notificationModel.create({
                userId,
                type: 'info',
                message: `Yêu cầu rút ${amount.toLocaleString('vi-VN')}đ về ngân hàng của bạn đã được ghi nhận. Vui lòng chờ Admin duyệt!`,
                isRead: false,
                createdAt: new Date()
            });
        } catch (_err) {}

        try {
            const adminUser = await userModel.findOne({ role: 'admin' });
            if (adminUser) {
                await notificationModel.create({
                    userId: adminUser._id,
                    type: 'warning',
                    message: `[WITHDRAW] Người dùng ${user.username} vừa yêu cầu rút ${amount.toLocaleString('vi-VN')}đ về ngân hàng`,
                    isRead: false,
                    createdAt: new Date()
                });
            }
        } catch (_err) {}

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

/**
 * Leaderboard & Weekly Reward Logic
 */
export const getLeaderboardStats = async (requestingUserId?: string) => {
  const now = new Date();
  const currentWeekId = getISOWeek(now);

  // 1. Ensure Weekly Winner logic (Reward starts in current week based on previous week's performance)
  try {
    const winnerRecord = await settingModel.findOne({ key: 'weeklyTopWinner' });
    const winnerVal = winnerRecord?.value as { forWeek: string } | undefined;
    if (!winnerRecord || winnerVal?.forWeek !== currentWeekId) {
      // Monday 00:00 of current week
      const day = now.getDay() || 7;
      const currentMonday = new Date(now);
      currentMonday.setHours(0, 0, 0, 0);
      currentMonday.setDate(now.getDate() - (day - 1));

      // Previous Monday
      const lastMonday = new Date(currentMonday);
      lastMonday.setDate(currentMonday.getDate() - 7);

      // Previous Sunday 23:59:59
      const lastSunday = new Date(currentMonday);
      lastSunday.setMilliseconds(-1);

      const topPrevWeek = await transactionModel.aggregate([
        { $match: { type: 'deposit', status: 'approved', createdAt: { $gte: lastMonday, $lte: lastSunday } } },
        { $group: { _id: '$userId', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 }
      ]);

      const topPrevWeekResult = topPrevWeek[0] as { _id: Types.ObjectId, total: number } | undefined;
      if (topPrevWeekResult) {
        const winner = await userModel.findById(topPrevWeekResult._id);
        if (winner) {
          await settingModel.findOneAndUpdate(
            { key: 'weeklyTopWinner' },
            {
              value: {
                userId: winner._id.toString(),
                fullName: winner.fullName ?? winner.username,
                amount: topPrevWeekResult.total,
                forWeek: currentWeekId
              }
            },
            { upsert: true }
          );
        }
      } else {
        await settingModel.findOneAndUpdate(
          { key: 'weeklyTopWinner' },
          { value: { userId: '', forWeek: currentWeekId } },
          { upsert: true }
        );
      }
    }
  } catch (err) {
    console.error("Error updating weekly winner", err);
  }

  // 2. Aggregate Leaderboard (Monthly & Quarterly)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterMonth = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), quarterMonth * 3, 1);

  const [monthlyLeaders, quarterlyLeaders] = await Promise.all([
    transactionModel.aggregate<{ _id: Types.ObjectId, total: number, user: { fullName?: string, username: string } }>([
      { $match: { type: 'deposit', status: 'approved', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$userId', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]),
    transactionModel.aggregate<{ _id: Types.ObjectId, total: number, user: { fullName?: string, username: string } }>([
      { $match: { type: 'deposit', status: 'approved', createdAt: { $gte: startOfQuarter } } },
      { $group: { _id: '$userId', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ])
  ]);

  const formatRow = (row: { _id: Types.ObjectId, total: number, user: { fullName?: string, username: string } }) => {
    const isMe = requestingUserId && row._id.toString() === requestingUserId;
    return {
      name: isMe ? (row.user.fullName ?? row.user.username) : maskName(row.user.fullName ?? row.user.username),
      amount: isMe ? row.total.toLocaleString('vi-VN') : maskAmount(row.total),
      rawAmount: row.total
    };
  };
  return {
    success: true,
    monthly: monthlyLeaders.map((row) => formatRow(row)),
    quarterly: quarterlyLeaders.map((row) => formatRow(row)),
    currentMonth: now.getMonth() + 1,
    currentQuarter: quarterMonth + 1
  };
};

export const fetchActiveCoupons = async () => {
    const coupons = await couponModel.find({
        isActive: true,
        expiryDate: { $gt: new Date() },
        $expr: { $lt: ["$usedQuantity", "$totalQuantity"] }
    }).select('-createdAt -updatedAt -__v').sort({ discountPercent: -1, discountAmount: -1 });
    return { success: true, coupons };
};
