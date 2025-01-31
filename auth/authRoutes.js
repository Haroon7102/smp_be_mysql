const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ id: user.id }, '82ddefea6c50e02c85b93d9addf9da8b73bd62bd728423458ee1685a7b42cdf43f7d095957787be64108685ba4134b043e02fafb6d52a3d935d49344a194c3e0', { expiresIn: '15m' });

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '70120821@student.uol.edu.pk',
                pass: 'asip msvb rtbe ljcs'
            }
        });

        const resetLink = `https://smpfe.netlify.app/dashboard?token=${resetToken}`;
        const mailOptions = {
            from: '70120821@student.uol.edu.pk',
            to: user.email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ msg: 'Password reset link sent to your email' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



router.put('/update-password', async (req, res) => {
    const { email, password, newPassword, token } = req.body;

    // Logging to check received data
    console.log('Received data:', { email, password, newPassword, token });

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

        if (user.googleId) {
            return res.status(400).json({ msg: "You signed in with Google. Manage your password via Google settings." });
        }

        // Check if new password is the same as the current one
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ msg: 'New password must be different from the current password' });
        }

        // Case 1: Logged-in user updating password (Requires current password)
        if (password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is incorrect' });
            }
        }
        // Case 2: Password reset via email (Requires valid token)
        else if (token) {
            try {
                const decoded = jwt.verify(token, '82ddefea6c50e02c85b93d9addf9da8b73bd62bd728423458ee1685a7b42cdf43f7d095957787be64108685ba4134b043e02fafb6d52a3d935d49344a194c3e0');
                if (decoded.email !== email) {
                    return res.status(400).json({ msg: 'Invalid token or email mismatch' });
                }
            } catch (err) {
                return res.status(400).json({ msg: 'Invalid or expired token' });
            }
        }
        // Case 3: No password or token provided
        else {
            return res.status(400).json({ msg: 'Please provide the current password or a valid reset token' });
        }

        // Hash the new password and update it in the database
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

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
        res.redirect(`https://smpfe.netlify.app/dashboard?token=${token}`);
    });
});

// Export Router
module.exports = router;
