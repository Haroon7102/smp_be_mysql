const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const { User } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// JWT Strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findByPk(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
},
    async (token, tokenSecret, profile, done) => {
        try {
            let user = await User.findOne({ where: { googleId: profile.id } });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: null  // Explicitly set password to null
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { facebookId: profile.id } });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    facebookId: profile.id,
                    accessToken // Save the access token
                });
            }

            return done(null, { profile, accessToken });
        } catch (err) {
            console.error('Error handling Facebook login:', err);
            return done(err, null);
        }
    }
));


passport.serializeUser((user, done) => {
    // Serialize the user with access token
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    // Deserialize the user object
    done(null, obj);
});

module.exports = passport;
