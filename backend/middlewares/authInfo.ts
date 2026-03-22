import type { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import userModel, { type IUser } from '../models/userModel.js';

interface TokenPayload {
    _id?: string;
    id?: string;
}

export const authenticateUser = async (req: Request & { user?: IUser }, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? 'secret') as TokenPayload;
        
        // Handle both older tokens and legacy 'admin' string
        let targetId = decoded._id ?? decoded.id;
        if (targetId === 'admin') {
            const adminDoc = await userModel.findOne({ role: 'admin' });
            if (adminDoc) {
                targetId = adminDoc._id.toString();
            }
        }

        const user = await userModel.findById(targetId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
        return;
    } catch (_error: unknown) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
};
