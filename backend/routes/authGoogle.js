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
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.ACCESS_TOKEN_SECRET
    )

    res.json({
      success: true,
      token,
      user: req.user
    })
  }
)

export default router
