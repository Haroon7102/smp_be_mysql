const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const router = express.Router();
const dotenv = require('dotenv');
const authMiddleware = require('../middleware/middleware');

dotenv.config();

// Test Route
router.get('/test', (req, res) => {
    res.send('Test route works!');
});

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        const payload = { id: user.id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Sign In Route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Email or password does not match' });
        }
        const payload = { id: user.id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).send('Server error');
    }
});

// Fetch User Data Route
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['name', 'email'], // Select only the fields you need
        });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update Email
router.put('/update-email', authMiddleware, async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.email = email;
        await user.save();

        res.json({ msg: 'Email updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/update-password', async (req, res) => {
    const { email, password, newPassword } = req.body;

    // Logging to check what data is received
    console.log('Received data:', { email, password, newPassword });

    try {
        // Check if email and newPassword are provided
        if (!email || !newPassword) {
            return res.status(400).json({ msg: 'Email and new password are required' });
        }

        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // If 'password' is provided, it's a regular password update (not a reset)
        if (password) {
            // Compare the provided current password with the stored password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Email or password does not match' });
            }
        }

        // If no current password is provided, assume it's a password reset
        if (!password) {
            console.log('Password reset process initiated');
        }

        // Hash the new password and update it in the database
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Respond with success message
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error('Error during password update:', err.message);
        res.status(500).send('Server error');
    }
});




// Delete Account
router.delete('/delete', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await user.destroy();
        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const payload = { id: req.user.id };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1hr' }, (err, token) => {
        if (err) throw err;
        res.redirect(`https://client-ochre-kappa.vercel.app/dashboard?token=${token}`);
    });
});

// Export Router
module.exports = router;
