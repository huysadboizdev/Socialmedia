import type { Request, Response, NextFunction } from 'express';
import userModel from '../models/userModel.js';

interface AuthRequest extends Request {
    authUserId?: string;
}

const check2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as AuthRequest).authUserId ?? (req.body as { userId: string }).userId;

        if (!userId) {
            res.json({ success: false, message: "Unauthorized" });
            return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
            res.json({ success: false, message: "User not found" });
            return;
        }

        // If 2FA is enabled but not verified for this session
        if (user.is2FAEnabled && !user.is2FAVerified) {
            res.status(403).json({ 
                success: false, 
                message: "2FA verification required", 
                needs2FA: true,
                email: user.email 
            });
            return;
        }

        next();
    } catch (error: unknown) {
        console.log(error);
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message });
    }
};

export default check2FA;
