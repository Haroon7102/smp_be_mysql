const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Facebook strategy
passport.use(new FacebookStrategy({
    clientID: 'YOUR_FACEBOOK_APP_ID',
    clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:5000/auth/facebook/callback'
},
    (accessToken, refreshToken, profile, done) => {
        // Save user profile and accessToken to database here
        return done(null, { profile, accessToken });
    }));

// Instagram strategy
passport.use(new InstagramStrategy({
    clientID: 'YOUR_INSTAGRAM_CLIENT_ID',
    clientSecret: 'YOUR_INSTAGRAM_CLIENT_SECRET',
    callbackURL: 'http://localhost:5000/auth/instagram/callback'
},
    (accessToken, refreshToken, profile, done) => {
        // Save user profile and accessToken to database here
        return done(null, { profile, accessToken });
    }));

// Facebook authentication routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/'); // Redirect to your front-end route
    });

// Instagram authentication routes
app.get('/auth/instagram', passport.authenticate('instagram'));

app.get('/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/'); // Redirect to your front-end route
    });

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
