// uploadServer.js

const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const router = express.Router(); // Use Router for modularity
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config(); // Load environment variables from .env file

// Endpoint to handle file uploads to Facebook
router.post('/upload', upload.single('file'), async (req, res) => {
    const { accessToken, pageId } = req.body;
    const file = req.file;

    // Check if file and tokens are provided
    if (!file || !accessToken || !pageId) {
        return res.status(400).json({ error: 'File, access token, and page ID are required.' });
    }

    try {
        // Start upload session
        const uploadSessionId = await startUploadSession(pageId, accessToken, file.originalname);

        // Upload file chunk
        const fileHandle = await uploadFileChunk(uploadSessionId, accessToken, file.buffer);

        // Send the response back
        res.json({ fileHandle });
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// Function to start the upload session with Facebook
const startUploadSession = async (pageId, accessToken, fileName) => {
    const url = `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}&name=${fileName}&published=false`;

    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
        throw new Error('Failed to start upload session: ' + (await response.text()));
    }

    const data = await response.json();
    return data.upload_session_id; // Return the upload session ID
};

// Function to upload file chunk to Facebook
const uploadFileChunk = async (uploadSessionId, accessToken, fileChunk) => {
    const url = `https://graph.facebook.com/v21.0/${uploadSessionId}/data?access_token=${accessToken}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream', // Set content type to the binary file type
        },
        body: fileChunk, // Send the file buffer
    });

    if (!response.ok) {
        throw new Error('Failed to upload file chunk: ' + (await response.text()));
    }

    const data = await response.json();
    return data; // Return the response from Facebook
};

module.exports = router; // Export the router
