const jwt = require('jsonwebtoken');
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const UserModel = require('../models/user.model');

const {
  jwtSecret,
  jwtExpiresIn,
  clientID,
  clientSecret,
  callbackURL,
} = require('../config/env');

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) return done(new Error('No email from Google'), null);

        let user = await UserModel.findByEmail(email);

        if (!user) {
          const userId = await UserModel.create({
            name: profile.displayName,
            email,
            phone: null,
            password: null,
            store_name: null,
            address: null,
            avatar_url: profile.photos?.[0]?.value || null,
            role: 'owner',
          });

          user = await UserModel.findById(userId);
        }

        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role },
          jwtSecret,
          { expiresIn: jwtExpiresIn }
        );

        const { password: _, ...userWithoutPassword } = user;

        return done(null, { token, user: userWithoutPassword });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
