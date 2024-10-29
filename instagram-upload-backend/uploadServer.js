const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
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

// Function to create a media container on Instagram
const createInstagramMediaContainer = async (instagramAccountId, accessToken, imageUrl, caption) => {
    try {
        const containerResponse = await fetch(`https://graph.facebook.com/v21.0/${instagramAccountId}/media`, {
            method: 'POST',
            body: new URLSearchParams({
                image_url: imageUrl,
                caption: caption || '',
                access_token: accessToken
            }),
        });

        const containerResult = await containerResponse.json();
        if (!containerResponse.ok) {
            throw new Error(`Failed to create media container: ${containerResult.error.message}`);
        }

        return containerResult.id;
    } catch (error) {
        console.error('Error creating Instagram media container:', error);
        throw error;
    }
};

// Function to publish media container on Instagram
const publishInstagramMedia = async (instagramAccountId, accessToken, creationId) => {
    try {
        const publishResponse = await fetch(`https://graph.facebook.com/v21.0/${instagramAccountId}/media_publish`, {
            method: 'POST',
            body: new URLSearchParams({
                creation_id: creationId,
                access_token: accessToken
            }),
        });

        const publishResult = await publishResponse.json();
        if (!publishResponse.ok) {
            throw new Error(`Failed to publish post: ${publishResult.error.message}`);
        }

        return publishResult;
    } catch (error) {
        console.error('Error publishing Instagram media:', error);
        throw error;
    }
};

// Route to upload files and post to Instagram
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, instagramAccountId, caption } = req.body;
    const files = req.files;

    if (!accessToken || !instagramAccountId) {
        return res.status(400).json({ error: 'Access token and Instagram account ID are required.' });
    }

    try {
        // If there are files, upload each file to Instagram as a container
        const mediaContainerIds = [];

        if (files && files.length > 0) {
            // Assume files are accessible from a URL for Instagram media
            const uploadPromises = files.map(file => {
                const imageUrl = `https://your-file-storage-service.com/${file.originalname}`; // Placeholder URL
                return createInstagramMediaContainer(instagramAccountId, accessToken, imageUrl, caption)
                    .then(containerId => mediaContainerIds.push(containerId));
            });

            await Promise.all(uploadPromises);

            // Publish each container individually or as a carousel (not natively supported)
            const publishPromises = mediaContainerIds.map(containerId =>
                publishInstagramMedia(instagramAccountId, accessToken, containerId)
            );

            const publishResults = await Promise.all(publishPromises);
            res.json({ success: true, publishResults });
        } else if (caption) {
            // Only caption without images
            const creationId = await createInstagramMediaContainer(instagramAccountId, accessToken, null, caption);
            const publishResult = await publishInstagramMedia(instagramAccountId, accessToken, creationId);
            return res.json({ success: true, publishResult });
        } else {
            return res.status(400).json({ error: 'Either files or a caption is required.' });
        }
    } catch (error) {
        console.error('Error during Instagram upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
