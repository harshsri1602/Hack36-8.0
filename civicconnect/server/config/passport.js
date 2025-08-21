import passport from 'passport';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from 'jsonwebtoken';
import UserModel from "../models/user.model.js";
import dotenv from 'dotenv';
dotenv.config();
//console.log(process.env.GOOGLE_ID);
//import { generateTokenAndSetCookie } from "../utils/generateTokenandSetCookies";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/callback/google`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by email
        let user = await UserModel.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user if not found
          user = await UserModel.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "nopassword", // dummy password since OAuth is used
          });
        } else if (!user.googleId) {
          // If user exists but no googleId stored, add it
          user.googleId = profile.id;
          await user.save();
        }

        // // Generate JWT token
        // const token = jwt.sign(
        //   { userID: user._id },
        //   process.env.JWT_SECRET,
        //   { expiresIn: "1h" }
        // );
       

        return done(null, { user });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user.user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
