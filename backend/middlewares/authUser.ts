import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

interface TokenDecode {
    id?: string;
    _id?: string;
}

interface AuthRequest extends Request {
  authUserId?: string;
}

// user authentication middleware
const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined

        const authHeader = req.headers.authorization
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        } else if (typeof req.headers.token === 'string') {
            token = req.headers.token
        }

        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        
        if (typeof token !== 'string') {
            return res.json({ success: false, message: "Invalid Token Format" })
        }

        const token_decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? 'secret') as TokenDecode
        
        // Handle both id and _id formats
        let targetId = token_decode.id ?? token_decode._id;

        if (!targetId) {
            return res.json({ success: false, message: "Invalid Token Payload" })
        }

        if (targetId === 'admin') {
            const adminDoc = await userModel.findOne({ role: 'admin' });
            if (adminDoc) {
                targetId = adminDoc._id.toString();
            }
        }

        const userDoc = await userModel.findById(targetId);
        if (!userDoc) {
            return res.json({ success: false, message: "Tài khoản không tồn tại" });
        }

        if (userDoc.isBlocked) {
            return res.json({ success: false, message: "Tài khoản của bạn đã bị khóa do gian lận. Vui lòng liên hệ Admin để được mở khóa." });
        }

        req.body ??= {};
        (req.body as { userId: string }).userId = targetId;
        (req as AuthRequest).authUserId = targetId // Backup for multer

        next()
        return

    } catch (error: unknown) {
        console.log(error)
        res.json({ success: false, message: error instanceof Error ? error.message : String(error) })
        return
    }
}

export default authUser
