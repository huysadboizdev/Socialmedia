import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { type IUser } from '../models/userModel.js'

const router = express.Router()

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) as express.RequestHandler
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }) as express.RequestHandler,
  (req: express.Request, res: express.Response) => {
    const user = req.user as IUser | undefined;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login?error=auth_failed`);
      return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET ?? 'secret'
    )

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?token=${token}`)
    return;
  }
)

export default router
