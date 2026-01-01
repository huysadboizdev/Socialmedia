import 'dotenv/config'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import userModel, { type IUser } from '../models/userModel.js'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: '/auth/google/callback'
    },
    (_accessToken, _refreshToken, profile, done) => {
      userModel.findOne({ googleId: profile.id })
        .then(user => {
          if (!user) {
            const newUser = new userModel({
              username: profile.displayName,
              email: profile.emails?.[0]?.value ?? '',
              googleId: profile.id,
              image: profile.photos?.[0]?.value ?? ''
            })
            return newUser.save()
          }
          return user
        })
        .then(user => {
          done(null, user)
        })
        .catch((err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)), undefined)
        })
    }
  )
)

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser)._id)
})

passport.deserializeUser((id: string, done) => {
  userModel.findById(id)
    .then(user => {
      done(null, user)
    })
    .catch((err: unknown) => {
      done(err, null)
    })
})
