import express from 'express'
import passport from 'passport'

const router = express.Router()

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) as express.RequestHandler
)

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }) as express.RequestHandler,
  (req, res) => {
    res.redirect('/profile')
  }
)

export default router
