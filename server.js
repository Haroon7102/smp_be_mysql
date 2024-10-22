// const express = require('express');
// require('dotenv').config();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const passport = require('./auth/passport');
// const session = require('express-session');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { sequelize } = require('./models');
// const authRoutes = require('./auth/authRoutes');
// const postRoutes = require('./auth/postRoutes'); // Import your post routes
// const { generateCaption } = require('./openai/openaiservice');


// const authMiddleware = require('./middleware/middleware');
// const { User } = require('./models'); // Adjust the path if necessary
// const jwt = require('jsonwebtoken'); // Ensure JWT is required if not already done

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors({
//     origin: 'https://smpfe.netlify.app' // Allow requests only from this origin
// }));
// app.use(bodyParser.json());

// // Initialize session and passport
// app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Public Route
// app.get('/', (req, res) => {
//     res.send('API is running...');

// });

// // Authentication Routes
// app.use('/auth', authRoutes);

// // Post Routes
// app.use('/post', postRoutes); // Ensure you use the post routes

// // app.use('/facebook', facebookRoute); // Ensure this line is present and correct


// // Example of a protected route
// app.get('/protected', authMiddleware, (req, res) => {
//     res.json({
//         message: 'This is a protected route.',
//         user: req.user // Contains the decoded JWT payload (e.g., user information)
//     });
// });

// // Passport strategies
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//     done(null, obj);
// });

// // Facebook strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: 'http://localhost:5000/auth/facebook/callback'
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// // Instagram strategy
// passport.use(new InstagramStrategy({
//     clientID: process.env.INSTAGRAM_CLIENT_ID,
//     clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//     callbackURL: 'http://localhost:5000/auth/instagram/callback'
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// // Google strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'http://localhost:5000/auth/google/callback'
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             // Check if the user already exists in the database
//             let user = await User.findOne({ where: { googleId: profile.id } });

//             if (!user) {
//                 // If the user doesn't exist, create a new user
//                 user = await User.create({
//                     name: profile.displayName,
//                     email: profile.emails[0].value,  // Assuming the user's email is available
//                     googleId: profile.id,
//                 });
//             }

//             // Return the user
//             return done(null, user);
//         } catch (err) {
//             console.error('Error saving user to the database:', err);
//             return done(err, null);
//         }
//     }
// ));

// // Facebook authentication routes
// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your front-end route
//     }
// );

// // Instagram authentication routes
// app.get('/auth/instagram', passport.authenticate('instagram'));

// app.get('/auth/instagram/callback',
//     passport.authenticate('instagram', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your front-end route
//     }
// );

// // Google authentication routes
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         // Handle Google login success
//         const payload = { id: req.user.id };
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.redirect(`http://localhost:3000?token=${token}`);
//         });
//     }
// );

// app.get('/auth/user', authMiddleware, (req, res) => {
//     // Assuming you're using sessions or JWT
//     const user = req.user; // or fetch user from the token/session
//     if (user) {
//         res.json({ username: user.name, email: user.email });
//     } else {
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

// // Start the server and connect to the database
// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         // console.log(process.env);
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//     })
//     // .catch(err => console.log('Error: ' + err));
//     .catch(err => {
//         console.error('Unable to connect to the database:', err); // Log the error
//         process.exit(1); // Exit the process if the connection fails
//     });

// // List all routes for debugging purposes
// app._router.stack.forEach(function (r) {
//     if (r.route && r.route.path) {
//         console.log(r.route.path);
//     }
// });

// // Caption Generation Route
// app.post('/generate-caption', async (req, res) => {
//     const { prompt } = req.body;

//     if (!prompt) {
//         return res.status(400).json({ error: 'Prompt is required' });
//     }

//     try {
//         const caption = await generateCaption(prompt);
//         res.json({ caption });
//     } catch (error) {
//         console.error('Error generating caption:', error);
//         res.status(500).json({ error: 'Error generating caption' });
//     }
// });


// const express = require('express');
// require('dotenv').config();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const passport = require('./auth/passport');
// const session = require('express-session');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { sequelize } = require('./models');
// const authRoutes = require('./auth/authRoutes');
// const postRoutes = require('./auth/postRoutes'); // Import your post routes
// const { generateCaption } = require('./openai/openaiservice');
// const authMiddleware = require('./middleware/middleware');
// const { User } = require('./models');
// const jwt = require('jsonwebtoken'); // Ensure JWT is required

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors({
//     origin: 'https://smpfe.netlify.app' // Allow requests only from this origin
// }));
// app.use(bodyParser.json());

// // Initialize session and passport
// app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Public Route
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// // Authentication Routes
// app.use('/auth', authRoutes);

// // Post Routes
// app.use('/post', postRoutes); // Ensure you use the post routes

// // Example of a protected route
// app.get('/protected', authMiddleware, (req, res) => {
//     res.json({
//         message: 'This is a protected route.',
//         user: req.user // Contains the decoded JWT payload (e.g., user information)
//     });
// });

// // Passport strategies
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//     done(null, obj);
// });

// // Facebook strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: 'http://localhost:5000/auth/facebook/callback'
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// // Instagram strategy
// passport.use(new InstagramStrategy({
//     clientID: process.env.INSTAGRAM_CLIENT_ID,
//     clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//     callbackURL: 'http://localhost:5000/auth/instagram/callback'
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// // Google strategy
// passport.use(new GoogleStrategy({
//     // clientID: process.env.GOOGLE_CLIENT_ID,
//     // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     clientID: '330395361476-4m36c2pmkur4t7koof2ecor468421l44.apps.googleusercontent.com',      // Replace with actual client ID
//     clientSecret: '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', // Replace with actual client secret
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/google/callback' // Updated to the deployed backend URL
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             // Check if the user already exists in the database
//             let user = await User.findOne({ where: { googleId: profile.id } });

//             if (!user) {
//                 // If the user doesn't exist, create a new user
//                 user = await User.create({
//                     name: profile.displayName,
//                     email: profile.emails[0].value,  // Assuming the user's email is available
//                     googleId: profile.id,
//                 });
//             }

//             // Return the user
//             return done(null, user);
//         } catch (err) {
//             console.error('Error saving user to the database:', err);
//             return done(err, null);
//         }
//     }
// ));

// // Facebook authentication routes
// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your front-end route
//     }
// );

// // Instagram authentication routes
// app.get('/auth/instagram', passport.authenticate('instagram'));

// app.get('/auth/instagram/callback',
//     passport.authenticate('instagram', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your front-end route
//     }
// );

// // Google authentication routes
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         // Handle Google login success
//         const payload = { id: req.user.id };
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             // Updated to redirect to the deployed frontend URL
//             res.redirect(`https://smpfe.netlify.app/dashboard?token=${token}`);
//         });
//     }
// );

// // Route to fetch the authenticated user details
// app.get('/auth/user', authMiddleware, (req, res) => {
//     const user = req.user;
//     if (user) {
//         res.json({ username: user.name, email: user.email });
//     } else {
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

// // Start the server and connect to the database
// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//         process.exit(1); // Exit the process if the connection fails
//     });

// // List all routes for debugging purposes
// app._router.stack.forEach(function (r) {
//     if (r.route && r.route.path) {
//         console.log(r.route.path);
//     }
// });

// // Caption Generation Route
// app.post('/generate-caption', async (req, res) => {
//     const { prompt } = req.body;

//     if (!prompt) {
//         return res.status(400).json({ error: 'Prompt is required' });
//     }

//     try {
//         const caption = await generateCaption(prompt);
//         res.json({ caption });
//     } catch (error) {
//         console.error('Error generating caption:', error);
//         res.status(500).json({ error: 'Error generating caption' });
//     }
// });








const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./auth/passport');
const session = require('express-session');
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { sequelize } = require('./models');
const authRoutes = require('./auth/authRoutes');
const postRoutes = require('./auth/postRoutes'); // Import your post routes
const { generateCaption } = require('./openai/openaiservice');
const authMiddleware = require('./middleware/middleware');
const { User } = require('./models');
const jwt = require('jsonwebtoken'); // Ensure JWT is required
const Post = require('./models/Post'); // Adjust the path as necessary

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors({
    origin: 'https://smpfe.netlify.app' // Allow requests only from this origin
}));
app.use(bodyParser.json());

// Initialize session and passport
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Public Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Authentication Routes
app.use('/auth', authRoutes);

// Post Routes
app.use('/post', postRoutes); // Ensure you use the post routes

// Example of a protected route
app.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'This is a protected route.',
        user: req.user // Contains the decoded JWT payload (e.g., user information)
    });
});

// // Passport strategies
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//     done(null, obj);
// });


// passport.use(new FacebookStrategy({
//     clientID: '1332019044439778',      // Replace with actual client ID
//     clientSecret: '84b1a81f8b8129f43983db4e9692a39a', // Replace with actual client secret
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/facebook/callback',
//     profileFields: ['id', 'displayName', 'email']
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             // Attempt to find a user with the Facebook ID
//             let user = await User.findOne({ where: { facebookId: profile.id } });

//             // If no user found, create a new one
//             if (!user) {
//                 user = await User.create({
//                     name: profile.displayName,
//                     email: profile.emails[0].value,
//                     facebookId: profile.id,
//                     accessToken, // Save the access token if needed for future requests
//                 });
//             } else {
//                 // Optionally, update the accessToken if the user already exists
//                 await user.update({ accessToken });
//             }

//             // Pass the user object to done callback
//             return done(null, { profile, accessToken });
//         } catch (err) {
//             console.error('Error handling Facebook login:', err);
//             return done(err, null);
//         }
//     }
// ));

// Session setup for passport
app.use(session({ secret: '84b1a81f8b8129f43983db4e9692a39a', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email', 'public_profile', 'pages_manage_posts', 'pages_show_list'] })
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login', session: true }),
    (req, res) => {
        // Successful authentication, redirect with user info
        res.json({
            message: 'Successfully logged in with Facebook!',
            user: req.user
        });
    }
);

// // Instagram strategy
// passport.use(new InstagramStrategy({
//     clientID: process.env.INSTAGRAM_CLIENT_ID,
//     clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/instagram/callback' // Updated to the deployed backend URL
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Ensure this is set in your .env
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ensure this is set in your .env
    callbackURL: 'https://smp-be-mysql.vercel.app/auth/google/callback' // Updated to the deployed backend URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user already exists in the database
            let user = await User.findOne({ where: { googleId: profile.id } });

            if (!user) {
                // If the user doesn't exist, create a new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,  // Assuming the user's email is available
                    googleId: profile.id,
                });
            }

            // Return the user
            return done(null, user);
        } catch (err) {
            console.error('Error saving user to the database:', err);
            return done(err, null);
        }
    }
));

// Facebook authentication routes
// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your front-end route
//     }
// );

// Instagram authentication routes
app.get('/auth/instagram', passport.authenticate('instagram'));

app.get('/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/'); // Redirect to your front-end route
    }
);

// Google authentication routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Handle Google login success
        const payload = { id: req.user.id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // Updated to redirect to the deployed frontend URL
            res.redirect(`https://smpfe.netlify.app/dashboard?token=${token}`);
        });
    }
);

// Route to fetch the authenticated user details
app.get('/auth/user', authMiddleware, (req, res) => {
    const user = req.user;
    if (user) {
        res.json({ username: user.name, email: user.email });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// // Start the server and connect to the database
// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//         process.exit(1); // Exit the process if the connection fails
//     });


// Start the server and connect to the database
sequelize.authenticate()
    .then(async () => {
        console.log('Database connected...');

        // Sync models here (only in development; in production, use migrations)
        await sequelize.sync(); // This will ensure your models match the database schema

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1); // Exit the process if the connection fails
    });


// List all routes for debugging purposes
app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
        console.log(r.route.path);
    }
});

// Caption Generation Route
app.post('/generate-caption', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const caption = await generateCaption(prompt);
        res.json({ caption });
    } catch (error) {
        console.error('Error generating caption:', error);
        res.status(500).json({ error: 'Error generating caption' });
    }
});

// // Assuming you are using express
// app.post('/api/posts', async (req, res) => {
//     const { userId, pageId, message } = req.body;

//     try {
//         const post = await Post.create({ userId, pageId, message });
//         res.status(201).json(post); // Send the created post back as a response
//     } catch (error) {
//         console.error('Error creating post:', error);
//         res.status(500).json({ error: 'Failed to create post' });
//     }
// });

app.post('/api/posts', async (req, res) => {
    const { userId, pageId, message } = req.body;

    console.log('Received post data:', { userId, pageId, message }); // Log received data

    try {
        const post = await Post.create({ userId, pageId, message });
        res.status(201).json(post); // Send the created post back as a response
    } catch (error) {
        console.error('Error creating post:', error.message || error); // Log specific error message
        res.status(500).json({ error: 'Failed to create post' });
    }
});



// const express = require('express');
// require('dotenv').config();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const passport = require('./auth/passport');
// const session = require('express-session');
// const FacebookStrategy = require('passport-facebook').Strategy;
// const InstagramStrategy = require('passport-instagram').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { sequelize } = require('./models');
// const authRoutes = require('./auth/authRoutes');
// const postRoutes = require('./auth/postRoutes'); // Post routes
// const { generateCaption } = require('./openai/openaiservice');
// const authMiddleware = require('./middleware/middleware');
// const { User } = require('./models');
// const jwt = require('jsonwebtoken');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors({
//     origin: 'https://smpfe.netlify.app' // Frontend URL
// }));
// app.use(bodyParser.json());

// // Initialize session and passport
// app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Public Route
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// // Authentication Routes
// app.use('/auth', authRoutes);

// // Post Routes
// app.use('/post', postRoutes); // Posting routes integrated

// // Protected Route Example
// app.get('/protected', authMiddleware, (req, res) => {
//     res.json({
//         message: 'This is a protected route.',
//         user: req.user // Contains JWT payload (user information)
//     });
// });

// // Passport strategies
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//     done(null, obj);
// });

// // // Facebook strategy
// // passport.use(new FacebookStrategy({
// //     clientID: process.env.FACEBOOK_APP_ID, // Use your .env variables
// //     clientSecret: process.env.FACEBOOK_APP_SECRET,
// //     callbackURL: 'https://smp-be-mysql.vercel.app/auth/facebook/callback',
// //     profileFields: ['id', 'displayName', 'email']
// // },
// //     async (accessToken, refreshToken, profile, done) => {
// //         try {
// //             let user = await User.findOne({ where: { facebookId: profile.id } });
// //             if (!user) {
// //                 user = await User.create({
// //                     name: profile.displayName,
// //                     email: profile.emails[0].value,
// //                     facebookId: profile.id,
// //                     accessToken
// //                 });
// //             } else {
// //                 await user.update({ accessToken });
// //             }
// //             return done(null, { profile, accessToken });
// //         } catch (err) {
// //             console.error('Error handling Facebook login:', err);
// //             return done(err, null);
// //         }
// //     }
// // ));

// passport.use(new FacebookStrategy({
//     // clientID: process.env.FACEBOOK_APP_ID,
//     // clientSecret: process.env.FACEBOOK_APP_SECRET,
//     clientID: '1332019044439778',
//     clientSecret: '84b1a81f8b8129f43983db4e9692a39a',
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/facebook/callback',
//     profileFields: ['id', 'displayName', 'email'],
//     scope: ['email', 'public_profile', 'pages_manage_posts', 'pages_show_list', 'pages_read_engagement'] // Add any other necessary permissions here
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             let user = await User.findOne({ where: { facebookId: profile.id } });
//             if (!user) {
//                 user = await User.create({
//                     name: profile.displayName,
//                     email: profile.emails[0].value,
//                     facebookId: profile.id,
//                     accessToken
//                 });
//             } else {
//                 await user.update({ accessToken });
//             }
//             return done(null, { profile, accessToken });
//         } catch (err) {
//             console.error('Error handling Facebook login:', err);
//             return done(err, null);
//         }
//     }));


// // Instagram strategy
// passport.use(new InstagramStrategy({
//     clientID: process.env.INSTAGRAM_CLIENT_ID,
//     clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/instagram/callback'
// },
//     (accessToken, refreshToken, profile, done) => {
//         return done(null, { profile, accessToken });
//     }
// ));

// // Google strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'https://smp-be-mysql.vercel.app/auth/google/callback'
// },
//     async (accessToken, refreshToken, profile, done) => {
//         try {
//             let user = await User.findOne({ where: { googleId: profile.id } });
//             if (!user) {
//                 user = await User.create({
//                     name: profile.displayName,
//                     email: profile.emails[0].value,
//                     googleId: profile.id
//                 });
//             }
//             return done(null, user);
//         } catch (err) {
//             console.error('Error saving user to the database:', err);
//             return done(err, null);
//         }
//     }
// ));

// // Facebook authentication routes
// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to your frontend after login
//     }
// );

// // Instagram authentication routes
// app.get('/auth/instagram', passport.authenticate('instagram'));

// app.get('/auth/instagram/callback',
//     passport.authenticate('instagram', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/'); // Redirect to frontend
//     }
// );

// // Google authentication routes
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         const payload = { id: req.user.id };
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.redirect(`https://smpfe.netlify.app/dashboard?token=${token}`); // Frontend URL
//         });
//     }
// );

// // Fetch authenticated user details
// app.get('/auth/user', authMiddleware, (req, res) => {
//     const user = req.user;
//     if (user) {
//         res.json({ username: user.name, email: user.email });
//     } else {
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

// // Start the server and connect to the database
// sequelize.authenticate()
//     .then(() => {
//         console.log('Database connected...');
//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//         process.exit(1); // Exit process if database connection fails
//     });

// // Debug all routes
// app._router.stack.forEach(function (r) {
//     if (r.route && r.route.path) {
//         console.log(r.route.path);
//     }
// });

// // Caption Generation Route
// app.post('/generate-caption', async (req, res) => {
//     const { prompt } = req.body;
//     if (!prompt) {
//         return res.status(400).json({ error: 'Prompt is required' });
//     }
//     try {
//         const caption = await generateCaption(prompt);
//         res.json({ caption });
//     } catch (error) {
//         console.error('Error generating caption:', error);
//         res.status(500).json({ error: 'Error generating caption' });
//     }
// });
