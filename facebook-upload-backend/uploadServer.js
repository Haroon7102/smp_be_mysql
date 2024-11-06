
// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, accessToken, message) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 message,
//                 access_token: accessToken,
//             }),
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(`Failed to create post: ${postResult.error.message}`);
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };

// // Route to upload files and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         const photoIds = [];

//         if (files && files.length > 0) {
//             // Upload images in parallel using Promise.all
//             const uploadPromises = files.map(file => {
//                 const formData = new FormData();
//                 formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                 formData.append('published', 'false');

//                 return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
//                     method: 'POST',
//                     body: formData,
//                     headers: formData.getHeaders(),
//                 })
//                     .then(response => response.json())
//                     .then(result => {
//                         if (!result.id) {
//                             throw new Error(`Photo upload failed: ${result.error.message}`);
//                         }
//                         photoIds.push({ media_fbid: result.id });
//                     });
//             });

//             // Await all uploads
//             await Promise.all(uploadPromises);

//             // Create a single post attaching all photos
//             const postData = {
//                 attached_media: JSON.stringify(photoIds),
//                 access_token: accessToken,
//             };
//             if (caption) postData.message = caption;

//             const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                 method: 'POST',
//                 body: new URLSearchParams(postData),
//             });

//             const postResult = await postResponse.json();
//             if (!postResponse.ok) {
//                 throw new Error(`Failed to create post: ${postResult.error.message}`);
//             }

//             res.json({ success: true, postId: postResult.id });
//         } else if (caption) {
//             // Only caption without images
//             const postResult = await postMessageToFacebook(pageId, accessToken, caption);
//             return res.json({ result: postResult });
//         } else {
//             return res.status(400).json({ error: 'Either files or a caption is required.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });


// module.exports = router;




const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ['POST', 'GET', 'OPTIONS'], // Allow methods you plan to use
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    credentials: true // Allow credentials if necessary
}));

// Additional CORS middleware to handle preflight requests
router.options('*', cors());

// Function to post a message to Facebook
const postMessageToFacebook = async (pageId, accessToken, message) => {
    try {
        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams({
                message,
                access_token: accessToken,
            }),
        });

        const postResult = await postResponse.json();
        if (!postResponse.ok) {
            throw new Error(`Failed to create post: ${postResult.error.message}`);
        }
        return postResult;
    } catch (error) {
        console.error('Error posting message to Facebook:', error);
        throw error;
    }
};

// Function to upload a video to Facebook
const uploadVideoToFacebook = async (pageId, accessToken, file) => {
    const formData = new FormData();
    formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
    formData.append('published', 'false');  // Unpublished to allow attachment to a post later

    const videoResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/videos?access_token=${accessToken}`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
    });

    const videoResult = await videoResponse.json();
    if (!videoResponse.ok) {
        throw new Error(`Video upload failed: ${videoResult.error.message}`);
    }

    // Poll for video processing completion
    let isProcessed = false;
    while (!isProcessed) {
        const statusCheck = await fetch(`https://graph.facebook.com/v21.0/${videoResult.id}?fields=status&access_token=${accessToken}`);
        const statusResult = await statusCheck.json();
        if (statusResult.status && statusResult.status.video_status === 'ready') {
            isProcessed = true;
        } else if (statusResult.status && statusResult.status.video_status === 'error') {
            throw new Error('Video processing error on Facebook.');
        } else {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before rechecking
        }
    }

    return { media_fbid: videoResult.id };
};

// Route to upload files and post to Facebook
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const files = req.files;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        const mediaAttachments = [];

        if (files && files.length > 0) {
            // Upload images and videos in parallel
            const uploadPromises = files.map(file => {
                if (file.mimetype.startsWith('video/')) {
                    return uploadVideoToFacebook(pageId, accessToken, file)
                        .then(videoAttachment => mediaAttachments.push(videoAttachment));
                } else {
                    const formData = new FormData();
                    formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
                    formData.append('published', 'false');

                    return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
                        method: 'POST',
                        body: formData,
                        headers: formData.getHeaders(),
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (!result.id) {
                                throw new Error(`Photo upload failed: ${result.error.message}`);
                            }
                            mediaAttachments.push({ media_fbid: result.id });
                        });
                }
            });

            // Await all uploads
            await Promise.all(uploadPromises);

            // Create a post with all attached media (videos and images)
            const postData = {
                attached_media: JSON.stringify(mediaAttachments),
                access_token: accessToken,
            };
            if (caption) postData.message = caption;

            const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
                method: 'POST',
                body: new URLSearchParams(postData),
            });

            const postResult = await postResponse.json();
            if (!postResponse.ok) {
                throw new Error(`Failed to create post: ${postResult.error.message}`);
            }

            res.json({ success: true, postId: postResult.id });
        } else if (caption) {
            // Only caption without images or videos
            const postResult = await postMessageToFacebook(pageId, accessToken, caption);
            return res.json({ result: postResult });
        } else {
            return res.status(400).json({ error: 'Either files or a caption is required.' });
        }
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
