// const JwtStrategy = require('passport-jwt').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;

// const { User } = require('../models');
// const dotenv = require('dotenv');

// dotenv.config();

// // JWT Strategy
// const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET
// };

// passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
//     try {
//         const user = await User.findByPk(jwt_payload.id);
//         if (user) {
//             return done(null, user);
//         }
//         return done(null, false);
//     } catch (err) {
//         return done(err, false);
//     }
// }));

// // Google OAuth Strategy
// passport.use(new GoogleStrategy({
//     // clientID: process.env.GOOGLE_CLIENT_ID,
//     // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     clientID: '330395361476-4m36c2pmkur4t7koof2ecor468421l44.apps.googleusercontent.com',      // Replace with actual client ID
//     clientSecret: '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', // Replace with actual client secret
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/google/callback'
// },
//     async (token, tokenSecret, profile, done) => {
//         try {
//             let user = await User.findOne({ where: { googleId: profile.id } });
//             if (!user) {
//                 user = await User.create({
//                     googleId: profile.id,
//                     name: profile.displayName,
//                     email: profile.emails[0].value,
//                     password: null  // Explicitly set password to null
//                 });
//             }
//             return done(null, user);
//         } catch (err) {
//             return done(err, false);
//         }
//     }));



// // passport.use(new FacebookStrategy({
// //     clientID: '1332019044439778',      // Replace with actual client ID
// //     clientSecret: '84b1a81f8b8129f43983db4e9692a39a', // Replace with actual client secret
// //     callbackURL: 'https://smp-be-mysql.vercel.app/auth/facebook/callback',
// //     profileFields: ['id', 'displayName', 'email']
// // },
// //     async (accessToken, refreshToken, profile, done) => {
// //         try {
// //             // Attempt to find a user with the Facebook ID
// //             let user = await User.findOne({ where: { facebookId: profile.id } });

// //             // If no user found, create a new one
// //             if (!user) {
// //                 user = await User.create({
// //                     name: profile.displayName,
// //                     email: profile.emails[0].value,
// //                     facebookId: profile.id,
// //                     accessToken, // Save the access token if needed for future requests
// //                 });
// //             } else {
// //                 // Optionally, update the accessToken if the user already exists
// //                 await user.update({ accessToken });
// //             }

// //             // Pass the user object to done callback
// //             return done(null, { profile, accessToken });
// //         } catch (err) {
// //             console.error('Error handling Facebook login:', err);
// //             return done(err, null);
// //         }
// //     }
// // ));


// passport.serializeUser((user, done) => {
//     // Serialize the user with access token
//     done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//     // Deserialize the user object
//     done(null, obj);
// });

// module.exports = passport;


const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
const { User } = require('../models');  // Adjust path based on your project structure
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
