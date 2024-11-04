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
// // Add this to your backend router
router.post('/upload', upload.single('file'), async (req, res) => {
    const { instagramAccountId, caption, accessToken } = req.body;
    const mediaUrl = req.file ? `path/to/uploaded/media/${req.file.filename}` : null;

    try {
        const createMediaResponse = await fetch(`https://graph.facebook.com/v21.0/${instagramAccountId}/media`, {
            method: 'POST',
            body: new URLSearchParams({
                image_url: mediaUrl,
                caption,
                access_token: accessToken,
            }),
        });

        const createMediaResult = await createMediaResponse.json();
        if (!createMediaResponse.ok) throw new Error(createMediaResult.error.message);

        // Publish the media to Instagram
        const publishResponse = await fetch(`https://graph.facebook.com/v21.0/${instagramAccountId}/media_publish`, {
            method: 'POST',
            body: new URLSearchParams({
                creation_id: createMediaResult.id,
                access_token: accessToken,
            }),
        });

        const publishResult = await publishResponse.json();
        if (!publishResponse.ok) throw new Error(publishResult.error.message);

        res.json(publishResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
