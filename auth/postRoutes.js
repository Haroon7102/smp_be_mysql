const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making HTTP requests

const authMiddleware = require('../middleware/middleware'); // Ensure you have your middleware for authentication

router.post('/facebook', authMiddleware, async (req, res) => {
    const { message, pageId, facebookAccessToken } = req.body;

    if (!facebookAccessToken) {
        return res.status(401).json({ success: false, error: 'Access token is missing or invalid.' });
    }
    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required.' });
    }
    if (!pageId) {
        return res.status(400).json({ success: false, error: 'Page ID is required.' });
    }

    try {
        const response = await axios.post(`https://graph.facebook.com/${pageId}/feed`, {
            message,
            access_token: facebookAccessToken,
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error posting to Facebook:', error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: error.response?.data || 'An error occurred while posting to Facebook.',
        });
    }
});


// Example: Posting to Instagram
// Route to post on Instagram
router.post('/post/instagram', authMiddleware, async (req, res) => {
    const { imageUrl, caption } = req.body;  // Image URL and caption for the post
    const accessToken = req.user.instagramAccessToken;  // Retrieve the access token from the user's session or database

    try {
        // Step 1: Create a media object container
        const mediaResponse = await axios.post(`https://graph.instagram.com/v15.0/me/media`, {
            image_url: imageUrl,
            caption,
            access_token: accessToken
        });

        // Step 2: Publish the media object
        const publishResponse = await axios.post(`https://graph.instagram.com/v15.0/me/media_publish`, {
            creation_id: mediaResponse.data.id,
            access_token: accessToken
        });

        res.json({ success: true, data: publishResponse.data });
    } catch (error) {
        console.error('Error posting to Instagram:', error.response.data);
        res.status(500).json({ success: false, error: error.response.data });
    }
});


router.get('/callback', async (req, res) => {
    const code = req.query.code;
    const appId = '1332019044439778'; // Replace with your actual App ID
    const appSecret = '84b1a81f8b8129f43983db4e9692a39a'; // Replace with your actual App Secret
    const redirectUri = 'YOUR_REDIRECT_URI'; // Make sure this matches the one configured in Facebook App

    try {
        const response = await axios.get(`https://graph.facebook.com/v17.0/oauth/access_token`, {
            params: {
                client_id: appId,
                redirect_uri: redirectUri,
                client_secret: appSecret,
                code: code
            }
        });

        const accessToken = response.data.access_token;
        // Store or use the access token as needed
        res.send('Access token obtained: ' + accessToken);
    } catch (error) {
        res.send('Error getting access token: ' + error.message);
    }
});

module.exports = router;
