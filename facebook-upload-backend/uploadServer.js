const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data'); // Import form-data package
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

// Endpoint to handle file uploads to Facebook or post only captions
router.post('/upload', upload.single('file'), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const file = req.file;

    // Check if accessToken and pageId are provided
    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        if (file) {
            // Upload image with optional caption
            const formData = new FormData();
            formData.append('source', file.buffer, { filename: file.originalname });
            if (caption) formData.append('caption', caption);

            const url = `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload photo: ${errorText}`);
            }

            const data = await response.json();
            return res.json({ message: 'Photo upload successful', data });

        } else if (caption) {
            // Post only caption as a text post
            const url = `https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: caption }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to post caption: ${errorText}`);
            }

            const data = await response.json();
            return res.json({ message: 'Caption post successful', data });

        } else {
            return res.status(400).json({ error: 'Either a file or a caption is required.' });
        }
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
