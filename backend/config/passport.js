import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import pkg from 'passport-google-oauth2'
import { ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt'
import dotenv from 'dotenv'
dotenv.config()
const { Strategy: GoogleStrategy } = pkg;


const config = {
    usernameField: 'email',
    passwordField: 'password'
}

passport.use(
    new LocalStrategy(config, async function (email, password, done) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            const compareResult = await bcrypt.compare(password, user.password);
            if (!compareResult) {
                return done(null, false, { message: 'Password incorrect' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
)

const jwtOption = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies.token || null
    ]),
    secretOrKey: process.env.JWT_SECRET_KEY
}

const googleOption = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/login/google/callback'
}



passport.use(
    "jwt", 
    new JwtStrategy(
        jwtOption,
        async (user, done) => {
            const foundUser = await User.findById(user._id)
            if (!foundUser) {
                return done(null, false, {message: 'User not found'})
            }
            return done(null, foundUser)
        }
    )
)

passport.use(
  new GoogleStrategy(
    googleOption,
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️⃣ Try to find by socialId first
        let user = await User.findOne({
          socialId: profile.id, // Use profile.id, not profile._json.sub
          registerType: 'google'
        });

        if (user) {
          return done(null, user);
        }

        // 2️⃣ If not found, check if email already exists from local signup
        const existingUser = await User.findOne({ email: profile.email });

        if (existingUser) {
          // Link Google account to existing local account
          existingUser.socialId = profile.id;
          existingUser.registerType = 'google';
          await existingUser.save();
          return done(null, existingUser);
        }

        // 3️⃣ Create new user if no conflict
        const newUser = await User.create({
          email: profile.email,
          username: profile.displayName,
          socialId: profile.id,
          registerType: 'google',
          isVerified: true // Optional, since Google users are verified
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport