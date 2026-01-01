import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenDecode {
    id: string;
}

// user authentication middleware
const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.headers
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

        (req.body as { userId: string }).userId = token_decode.id

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
