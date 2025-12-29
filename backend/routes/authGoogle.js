import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.ACCESS_TOKEN_SECRET
    )

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/login?token=${token}`)
  }
)

export default router
