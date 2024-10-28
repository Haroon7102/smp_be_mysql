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

const { google } = require('googleapis');
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
require('dotenv').config();
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure Google Drive API
const oauth2Client = new google.auth.OAuth2(
    'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
    'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your Google Client Secret
    'https://smp-be-mysql.vercel.app/auth/google/callback' // Replace with your Redirect URI
);

// Set your refresh token for authentication
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

router.post('/upload', upload.single('file'), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const file = req.file;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        let fileLink = '';

        if (file) {
            const driveResponse = await uploadFileToDrive(file);
            fileLink = driveResponse.webContentLink;
        }

        const message = `${caption || ''} ${fileLink}`.trim();
        const postResult = await postMessageToFacebook(pageId, accessToken, message);
        return res.json({ result: postResult });
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// Function to upload a file to Google Drive
const uploadFileToDrive = async (file) => {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = {
        name: file.originalname,
        mimeType: file.mimetype,
    };
    const media = {
        mimeType: file.mimetype,
        body: file.buffer,
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webContentLink',
    });

    return response.data;
};

// Function to post a message or link to Facebook
const postMessageToFacebook = async (pageId, accessToken, message) => {
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed?access_token=${accessToken}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url, { method: 'POST' });

    if (!response.ok) {
        throw new Error('Failed to post message to Facebook: ' + (await response.text()));
    }
    return await response.json();
};

module.exports = router;
