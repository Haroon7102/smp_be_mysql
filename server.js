const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./auth/passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { sequelize } = require('./models');
const authRoutes = require('./auth/authRoutes');
const { generateCaption } = require('./openai/openaiservice');
const authMiddleware = require('./middleware/middleware');
const { User } = require('./models');
const jwt = require('jsonwebtoken'); // Ensure JWT is required
// const facebookRoutes = require('./auth/facebookRoutes');
const facebookUploadRouter = require('./facebook-upload-backend/uploadServer.js'); // Adjust the path if needed



const app = express();
const PORT = process.env.PORT || 5000;


// Middleware setup
// app.use(cors({
//     origin: 'https://smpfe.netlify.app' // Allow requests only from this origin
// }));
app.use(cors({
    origin: 'https://smpfe.netlify.app', // Ensure this matches your frontend URL
    methods: ['POST', 'GET', 'OPTIONS'], // List all methods you use
    allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers you use
    credentials: true
}));



app.use(bodyParser.json());

// Initialize session and passport
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// app.use('/facebook', facebookRoutes);

// Use the upload router
app.use('/facebook-upload', facebookUploadRouter);

// Public Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Authentication Routes
app.use('/auth', authRoutes);



// Example of a protected route
app.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'This is a protected route.',
        user: req.user // Contains the decoded JWT payload (e.g., user information)
    });
});



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

const VERIFY_TOKEN = 'IGQWROczJwcGc4RUxmRHltT3JsalVzaVVZAaWNlMGRONWpwTmRDTHdQWjBZANFJObHcyOU10R0dxb1VDbXMxOEduVmJNNWJxbXlWQzJEdUF5a1dPSWgzZAE9fZAHlHdlVvbzBfMDY0VHBvSENvUUttblhlLVVsMnFoVFEZD';
// Webhook verification endpoint
app.get('/callback', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VERIFY_TOKEN) {
        console.log('Webhook verified');
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403); // Forbidden
    }
});

// Webhook data handling endpoint
app.post('/callback', (req, res) => {
    console.log('Webhook received:', req.body);
    // Handle the incoming data (e.g., store it in the database, process it, etc.)
    res.sendStatus(200); // Respond with 200 OK
});
