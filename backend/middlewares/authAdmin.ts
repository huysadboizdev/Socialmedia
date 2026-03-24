import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

interface TokenDecode {
    id?: string;
    _id?: string;
}

const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
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

        const token_decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? 'secret') as TokenDecode
        
        const targetId = token_decode.id ?? token_decode._id;

        if (targetId === 'admin') {
            next();
            return;
        }

        if (!targetId) {
            res.json({ success: false, message: "Not Authorized Login Again" });
            return;
        }

        const user = await userModel.findById(targetId);
        if (user && user.role === 'admin') {
            next();
            return;
        } else {
            res.json({ success: false, message: "Not Authorized Login Again" });
            return;
        }
    } catch (error: unknown) {
        console.log(error);
        res.json({ success: false, message: "Not Authorized Login Again" });
        return;
    }
};

export default authAdmin
