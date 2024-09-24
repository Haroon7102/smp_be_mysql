const express = require('express');
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
require('dotenv').config();
const { User } = require('./models'); // Adjust the path if necessary
const jwt = require('jsonwebtoken'); // Ensure JWT is required if not already done

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
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

// app.use('/facebook', facebookRoute); // Ensure this line is present and correct


// Example of a protected route
app.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'This is a protected route.',
        user: req.user // Contains the decoded JWT payload (e.g., user information)
    });
});

// Passport strategies
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/callback'
},
    (accessToken, refreshToken, profile, done) => {
        return done(null, { profile, accessToken });
    }
));

// Instagram strategy
passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/instagram/callback'
},
    (accessToken, refreshToken, profile, done) => {
        return done(null, { profile, accessToken });
    }
));

// Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
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
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/'); // Redirect to your front-end route
    }
);

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
            res.redirect(`http://localhost:3000?token=${token}`);
        });
    }
);

app.get('/auth/user', authMiddleware, (req, res) => {
    // Assuming you're using sessions or JWT
    const user = req.user; // or fetch user from the token/session
    if (user) {
        res.json({ username: user.name, email: user.email });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Start the server and connect to the database
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch(err => console.log('Error: ' + err));

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

