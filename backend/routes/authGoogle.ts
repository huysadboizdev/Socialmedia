import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { type IUser } from '../models/userModel.js'

const router = express.Router()

router.get(
  '/auth/google',
  (req, res, next) => {
      const { platform } = req.query;
      const state = platform ? Buffer.from(JSON.stringify({ platform })).toString('base64') : undefined;
      
      passport.authenticate('google', { 
          scope: ['profile', 'email'],
          state: state
      })(req, res, next);
  }
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }) as express.RequestHandler,
  (req: express.Request, res: express.Response) => {
    const user = req.user as IUser | undefined;
    const { state } = req.query; // Get state from query params
    
    // Determine frontend URL based on state or platform
    // We can pass 'mobile' in state when initiating auth from app
    let frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    let isMobile = false;

    if (state && typeof state === 'string') {
        try {
             // If state tells us it's mobile
             const stateObj = JSON.parse(Buffer.from(state, 'base64').toString());
             if (stateObj.platform === 'mobile') {
                 frontendUrl = 'mobile://'; // Deep link scheme
                 isMobile = true;
             }
        } catch (e) {
            // ignore if not json or base64
        }
    }

    if (!user) {
        const errorUrl = isMobile 
            ? `${frontendUrl}login?error=auth_failed` 
            : `${frontendUrl}/login?error=auth_failed`;
        res.redirect(errorUrl);
        return;
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET ?? 'secret'
    )

    // Redirect to frontend with token
    const redirectUrl = isMobile
            ? `${frontendUrl}google-auth?token=${token}` // mobile://google-auth?token=...
            : `${frontendUrl}/login?token=${token}`;
            
    res.redirect(redirectUrl)
    return;
  }
)

export default router
