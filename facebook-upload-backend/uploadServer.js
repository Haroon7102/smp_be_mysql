// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data'); // Import form-data package
// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
// require('dotenv').config();

// // Endpoint to handle file uploads to Facebook or post only captions
// router.post('/upload', upload.single('file'), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const file = req.file;

//     // Check if accessToken and pageId are provided
//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         if (file) {
//             // Upload image with optional caption
//             const formData = new FormData();
//             formData.append('source', file.buffer, { filename: file.originalname });
//             if (caption) formData.append('caption', caption);

//             const url = `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`;
//             const response = await fetch(url, {
//                 method: 'POST',
//                 body: formData,
//                 headers: formData.getHeaders(),
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(`Failed to upload photo: ${errorText}`);
//             }

//             const data = await response.json();
//             return res.json({ message: 'Photo upload successful', data });

//         } else if (caption) {
//             // Post only caption as a text post
//             const url = `https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}`;
//             const response = await fetch(url, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ message: caption }),
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(`Failed to post caption: ${errorText}`);
//             }

//             const data = await response.json();
//             return res.json({ message: 'Caption post successful', data });

//         } else {
//             return res.status(400).json({ error: 'Either a file or a caption is required.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// module.exports = router;

// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data'); // Import form-data
// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
// require('dotenv').config();

// // Endpoint to handle file uploads to Facebook or log other files
// router.post('/upload', upload.single('file'), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const file = req.file;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         if (file) {
//             const fileType = file.mimetype.split('/')[0];

//             if (fileType === 'image' || fileType === 'video') {
//                 // Image or video upload to Facebook
//                 const uploadResult = await uploadMediaToFacebook(pageId, accessToken, file, caption);
//                 return res.json({ result: uploadResult });
//             } else {
//                 // Document or other file types; save to server or database if needed
//                 console.log(`Received a ${file.mimetype} file: ${file.originalname}`);
//                 return res.json({ message: `File ${file.originalname} received but not uploaded to Facebook.` });
//             }
//         } else if (caption) {
//             // Only caption without a file
//             const postResult = await postMessageToFacebook(pageId, accessToken, caption);
//             return res.json({ result: postResult });
//         } else {
//             return res.status(400).json({ error: 'Either a file or a caption is required.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// // Function to upload media (image or video) to Facebook
// const uploadMediaToFacebook = async (pageId, accessToken, file, caption) => {
//     const formData = new FormData();
//     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     if (caption) formData.append('caption', caption);

//     const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(), // Required to set correct headers
//     });

//     if (!response.ok) {
//         throw new Error('Failed to upload media to Facebook: ' + (await response.text()));
//     }
//     return await response.json();
// };

// // Function to post only a message to Facebook
// const postMessageToFacebook = async (pageId, accessToken, caption) => {
//     const url = `https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}&message=${encodeURIComponent(caption)}`;
//     const response = await fetch(url, { method: 'POST' });

//     if (!response.ok) {
//         throw new Error('Failed to post message to Facebook: ' + (await response.text()));
//     }
//     return await response.json();
// };

// module.exports = router;



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
//     origin: 'https://smpfe.netlify.app',
//     methods: ['POST'],
//     credentials: true
// }));

// // Endpoint to handle file uploads to Facebook or log other files
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files; // Get multiple files
//     console.log(req.files); // Array of uploaded files

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         if (files && files.length > 0) {
//             const results = [];

//             for (const file of files) {
//                 const fileType = file.mimetype.split('/')[0];

//                 if (fileType === 'image' || fileType === 'video') {
//                     const uploadResult = await uploadMediaToFacebook(pageId, accessToken, file, caption);
//                     results.push(uploadResult);
//                 } else {
//                     console.log(`Received a ${file.mimetype} file: ${file.originalname}`);
//                 }
//             }
//             return res.json({ results });
//         } else if (caption) {
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

// // Function to upload media (image or video) to Facebook
// const uploadMediaToFacebook = async (pageId, accessToken, file, caption) => {
//     const formData = new FormData();
//     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     if (caption) formData.append('caption', caption); // Use 'description' for videos

//     const endpoint = file.mimetype.startsWith('video/')
//         ? `https://graph.facebook.com/v21.0/${pageId}/videos?access_token=${accessToken}`
//         : `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`;

//     const response = await fetch(endpoint, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(), // Required to set correct headers
//     });

//     if (!response.ok) {
//         throw new Error('Failed to upload media to Facebook: ' + (await response.text()));
//     }
//     return await response.json();
// };

// // Function to post only a message to Facebook
// const postMessageToFacebook = async (pageId, accessToken, caption) => {
//     const url = `https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}&message=${encodeURIComponent(caption)}`;
//     const response = await fetch(url, { method: 'POST' });

//     if (!response.ok) {
//         throw new Error('Failed to post message to Facebook: ' + (await response.text()));
//     }
//     return await response.json();
// };

// module.exports = router;



// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
// const cors = require('cors');

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app',
//     methods: ['POST'],
//     credentials: true
// }));

// require('dotenv').config();
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

// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         if (files && files.length > 0) {
//             const photoIds = [];

//             // Upload images individually and save media IDs
//             for (const file of files) {
//                 const formData = new FormData();
//                 formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                 formData.append('published', 'false');

//                 const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
//                     method: 'POST',
//                     body: formData,
//                     headers: formData.getHeaders(),
//                 });

//                 const result = await response.json();
//                 if (!response.ok) {
//                     throw new Error(`Failed to upload photo: ${result.error.message}`);
//                 }
//                 photoIds.push({ media_fbid: result.id });
//             }

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

// CORS setup
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ['POST'],
    credentials: true
}));

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

// Route to upload files and post to Facebook
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const files = req.files;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        const photoIds = [];

        if (files && files.length > 0) {
            // Upload images in parallel using Promise.all
            const uploadPromises = files.map(file => {
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
                        photoIds.push({ media_fbid: result.id });
                    });
            });

            // Await all uploads
            await Promise.all(uploadPromises);

            // Create a single post attaching all photos
            const postData = {
                attached_media: JSON.stringify(photoIds),
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
            // Only caption without images
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
