const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data'); // Import form-data package
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

// Endpoint to handle file uploads to Facebook
router.post('/upload', upload.single('file'), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const file = req.file;

    if (!file || !accessToken || !pageId) {
        return res.status(400).json({ error: 'File, access token, and page ID are required.' });
    }

    try {
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
        res.json({ message: 'Upload successful', data });
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
