import type { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import userModel, { type IUser } from '../models/userModel.js';

interface TokenPayload {
    _id: string;
}

export const authenticateUser = async (req: Request & { user?: IUser }, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? 'secret') as TokenPayload;
        const user = await userModel.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
        return;
    } catch (_error: unknown) {
        res.status(401).json({ success: false, message: "Invalid Token" });
        return;
    }
};
