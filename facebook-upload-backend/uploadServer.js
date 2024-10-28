const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

// Endpoint to handle file uploads to Facebook
router.post('/upload', upload.single('file'), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const file = req.file;

    // Check if file and tokens are provided
    if (!file || !accessToken || !pageId) {
        return res.status(400).json({ error: 'File, access token, and page ID are required.' });
    }

    try {
        // Upload file directly to Facebook /photos endpoint
        const url = `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: JSON.stringify({
                caption: caption || '',
                source: file.buffer.toString('base64')  // Convert buffer to base64
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload photo: ${errorText}`);
        }

        const data = await response.json();
        res.json({ message: 'Upload successful', data });

    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
