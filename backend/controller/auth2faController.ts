import type { Request, RequestHandler } from 'express';
import userModel from '../models/userModel.js';
import * as mailService from '../services/mailService.js';

interface AuthRequest extends Request {
    authUserId?: string;
}

export const sendEmailCode: RequestHandler = async (req, res) => {
    try {
        const userId = ((req as unknown) as AuthRequest).authUserId ?? (req.body as { userId: string }).userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to user
        user.twoFactorSecret = code;
        user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        // Send email
        const mailResult = await mailService.send2FACode(user.email, code);
        
        if (mailResult.success) {
            res.json({ success: true, message: 'Mã xác minh đã được gửi qua Email' });
        } else {
            res.status(500).json({ success: false, message: 'Không thể gửi email xác minh' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

export const verifyEmailCode: RequestHandler = async (req, res) => {
    try {
        const userId = ((req as unknown) as AuthRequest).authUserId ?? (req.body as { userId: string }).userId;
        const { code } = req.body as { code?: string };

        if (!userId || !code) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin' });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (user.twoFactorSecret !== code) {
            res.json({ success: false, message: 'Mã xác minh không chính xác' });
            return;
        }

        if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
            res.json({ success: false, message: 'Mã xác minh đã hết hạn' });
            return;
        }

        // Success
        user.is2FAEnabled = true; // Enable it once verified
        user.twoFactorMethod = 'email';
        user.is2FAVerified = true;
        user.twoFactorSecret = undefined;
        user.twoFactorExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Xác thực 2 yếu tố đã được kích hoạt thành công' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

// Simplified routes
export const generate2FA = sendEmailCode;
export const verifySetup2FA = verifyEmailCode;
export const verify2FACode = verifyEmailCode;
export const disable2FA: RequestHandler = async (req, res) => {
    try {
        const userId = ((req as unknown) as AuthRequest).authUserId ?? (req.body as { userId: string }).userId;
        const { code } = req.body as { code?: string };

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (!code) {
            // If no code provided, send one via email
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.twoFactorSecret = newCode;
            user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);
            await user.save();

            const mailResult = await mailService.send2FACode(user.email, newCode);
            if (mailResult.success) {
                res.json({ success: true, pendingEmail: true, message: 'Mã xác minh đã được gửi qua Email để tắt 2FA' });
            } else {
                res.status(500).json({ success: false, message: 'Không thể gửi email xác minh' });
            }
            return;
        }

        if (user.twoFactorSecret !== code) {
            res.json({ success: false, message: 'Mã xác minh không chính xác' });
            return;
        }

        if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
            res.json({ success: false, message: 'Mã xác minh đã hết hạn' });
            return;
        }

        user.is2FAEnabled = false;
        user.twoFactorMethod = 'none';
        user.is2FAVerified = false;
        user.twoFactorSecret = undefined;
        user.twoFactorExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Đã tắt xác thực 2 yếu tố' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};
