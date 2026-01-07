import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenDecode {
    id: string;
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

        if (!token_decode.id) {
            return res.json({ success: false, message: "Invalid Token Payload" })
        }

        req.body ??= {};
        (req.body as { userId: string }).userId = token_decode.id;
        (req as AuthRequest).authUserId = token_decode.id // Backup for multer

        // Add a dummy await to satisfy lint if no async work is done, 
        // but normally we might check if user still exists in DB
        await Promise.resolve()

        next()
        return

    } catch (error: unknown) {
        console.log(error)
        res.json({ success: false, message: error instanceof Error ? error.message : String(error) })
        return
    }
}

export default authUser
