const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CORS setup
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ['POST'],
    credentials: true
}));
router.post('/instagram-upload/upload', async (req, res) => {
    const { instagramAccountId, accessToken, message, mediaUrl } = req.body;

    try {
        // Post to Instagram
        const response = await axios.post(
            `https://graph.facebook.com/v20.0/${instagramAccountId}/media`,
            {
                image_url: mediaUrl,
                caption: message,
                access_token: accessToken
            }
        );

        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Instagram upload error:', error);
        res.status(500).json({ success: false, error: 'Instagram upload failed.' });
    }
});
module.exports = router;