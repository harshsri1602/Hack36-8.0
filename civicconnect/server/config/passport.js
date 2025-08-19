const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
import UserModel from "../models/user.model";

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

        // Generate JWT token
        const token = jwt.sign(
          { userID: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return done(null, { user, token });
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
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
