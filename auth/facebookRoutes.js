const express = require('express');
const router = express.Router();
// const { FacebookUser } = require('../models'); // Assuming you have the FacebookUser model defined
const FacebookUser = require('../models/facebook_users'); // Assuming you have the FacebookUser model defined

// Route to save Facebook user data
router.post('/save-user', async (req, res) => {
    try {
        const { userId, name, email, accessToken } = req.body;

        // Validate input
        if (!userId || !name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the user already exists
        let facebookUser = await FacebookUser.findOne({ where: { userId } });

        if (!facebookUser) {
            // Create a new Facebook user
            facebookUser = await FacebookUser.create({ userId, name, email, accessToken });
        } else {
            // Update the existing user's access token
            facebookUser.accessToken = accessToken;
            await facebookUser.save();
        }

        res.status(201).json({ message: 'User saved successfully', user: facebookUser });
    } catch (error) {
        console.error('Error saving Facebook user:', error);
        res.status(500).json({ error: 'Failed to save Facebook user' });
    }
});

module.exports = router;
