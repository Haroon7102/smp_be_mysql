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


const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

require('dotenv').config();

router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const files = req.files;
    if (!accessToken || !pageId || files.length === 0) {
        return res.status(400).json({ error: 'Access token, page ID, and files are required.' });
    }

    try {
        const photoIds = [];

        // Step 1: Upload each image individually to Facebook (unpublished)
        for (const file of files) {
            const formData = new FormData();
            formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
            formData.append('published', 'false');

            const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders(),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to upload photo: ${result.error.message}`);
            }
            photoIds.push({ media_fbid: result.id });
        }

        // Step 2: Create a post that attaches all uploaded photos
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
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;
