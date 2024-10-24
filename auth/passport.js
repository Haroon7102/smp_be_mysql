const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
const { User } = require('../models/user');  // Adjust path based on your project structure
const axios = require('axios');

dotenv.config();

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: '1332019044439778',      // Replace with actual client ID
    clientSecret: '84b1a81f8b8129f43983db4e9692a39a', // Replace with actual client secret
    callbackURL: 'https://smp-be-mysql.vercel.app/auth/facebook/callback',  // Replace with your actual URL
    profileFields: ['id', 'displayName', 'email'],
    scope: ['email', 'public_profile', 'pages_manage_posts', 'pages_show_list', 'pages_read_engagement']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find or create a user in the database
            let user = await User.findOne({ where: { facebookId: profile.id } });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails ? profile.emails[0].value : null,
                    facebookId: profile.id,
                    accessToken
                });
            } else {
                // Update the access token for the user
                await user.update({ accessToken });
            }

            // Fetch the user's pages using the access token
            const response = await axios.get(
                `https://graph.facebook.com/v14.0/me/accounts?access_token=${accessToken}`
            );

            const pages = response.data.data; // This will be the list of pages

            // Attach pages to the user object
            user.pages = pages;

            return done(null, { user, accessToken, pages });

        } catch (err) {
            console.error('Error handling Facebook login:', err);
            return done(err, null);
        }
    }));

module.exports = passport;
