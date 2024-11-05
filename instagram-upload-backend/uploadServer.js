const express = require('express');
const axios = require('axios');
const router = express.Router();

const INSTAGRAM_APP_ID = '1199616704485910';
const INSTAGRAM_APP_SECRET = '35b13ad41ab9c6560e0f6710bd54a033'; // Replace with your Instagram app secret
const REDIRECT_URI = 'https://smpfe.netlify.app/dashboard';

// Step 1: Exchange code for an access token
router.post('/upload', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post(
            'https://api.instagram.com/oauth/access_token',
            new URLSearchParams({
                client_id: INSTAGRAM_APP_ID,
                client_secret: INSTAGRAM_APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code: code,
            })
        );

        const { access_token, user_id } = tokenResponse.data;

        // Use the access token to post content to Instagram
        // Replace with your media and message details here
        const mediaData = {
            image_url: 'https://example.com/image.jpg', // Replace with your image URL
            caption: 'Your post caption here', // Replace with your caption
            access_token: access_token
        };

        // Create a media object (this prepares the media for posting)
        const mediaResponse = await axios.post(
            `https://graph.instagram.com/${user_id}/media`,
            mediaData
        );

        const { id: media_id } = mediaResponse.data;

        // Publish the media (actually post it on Instagram)
        const publishResponse = await axios.post(
            `https://graph.instagram.com/${user_id}/media_publish`,
            {
                creation_id: media_id,
                access_token: access_token
            }
        );

        res.json({ success: true, post_id: publishResponse.data.id });
    } catch (error) {
        console.error('Error posting to Instagram:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to post to Instagram' });
    }
});

module.exports = router;
