// const express = require('express');
// const axios = require('axios');
// const router = express.Router();

// const INSTAGRAM_APP_ID = '1199616704485910';
// const INSTAGRAM_APP_SECRET = '35b13ad41ab9c6560e0f6710bd54a033'; // Replace with your Instagram app secret
// const REDIRECT_URI = 'https://smpfe.netlify.app/dashboard';

// // Step 1: Exchange code for an access token
// router.post('/upload', async (req, res) => {
//     const { code } = req.body;

//     if (!code) {
//         return res.status(400).json({ error: 'Authorization code is required' });
//     }

//     try {
//         // Exchange the code for an access token
//         const tokenResponse = await axios.post(
//             'https://api.instagram.com/oauth/access_token',
//             new URLSearchParams({
//                 client_id: INSTAGRAM_APP_ID,
//                 client_secret: INSTAGRAM_APP_SECRET,
//                 grant_type: 'authorization_code',
//                 redirect_uri: REDIRECT_URI,
//                 code: code,
//             })
//         );

//         const { access_token, user_id } = tokenResponse.data;

//         // Use the access token to post content to Instagram
//         // Replace with your media and message details here
//         const mediaData = {
//             image_url: 'https://example.com/image.jpg', // Replace with your image URL
//             caption: 'Your post caption here', // Replace with your caption
//             access_token: access_token
//         };

//         // Create a media object (this prepares the media for posting)
//         const mediaResponse = await axios.post(
//             `https://graph.instagram.com/${user_id}/media`,
//             mediaData
//         );

//         const { id: media_id } = mediaResponse.data;

//         // Publish the media (actually post it on Instagram)
//         const publishResponse = await axios.post(
//             `https://graph.instagram.com/${user_id}/media_publish`,
//             {
//                 creation_id: media_id,
//                 access_token: access_token
//             }
//         );

//         res.json({ success: true, post_id: publishResponse.data.id });
//     } catch (error) {
//         console.error('Error posting to Instagram:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Failed to post to Instagram' });
//     }
// });

// module.exports = router;





// const express = require('express');
// const multer = require('multer');
// const fetch = require('node-fetch');
// const FormData = require('form-data');

// const router = express.Router();
// const upload = multer(); // Configure multer as needed

// router.post('/upload', upload.single('image'), async (req, res) => {
//     const { code, caption } = req.body;
//     const image = req.file;

//     if (!code || !image) {
//         return res.status(400).json({ success: false, message: 'Missing required data' });
//     }

//     try {
//         // Exchange code for an access token with Instagram
//         const tokenResponse = await fetch(`https://api.instagram.com/oauth/access_token`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: new URLSearchParams({
//                 client_id: '1199616704485910',
//                 client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
//                 grant_type: 'authorization_code',
//                 redirect_uri: 'https://smpfe.netlify.app/dashboard',
//                 code
//             })
//         });
//         const tokenData = await tokenResponse.json();
//         const accessToken = tokenData.access_token;

//         if (!accessToken) {
//             return res.status(500).json({ success: false, message: 'Failed to obtain access token' });
//         }

//         // Upload the image and caption to Instagram
//         const formData = new FormData();
//         formData.append('image', image.buffer, image.originalname);
//         formData.append('caption', caption);
//         formData.append('access_token', accessToken);

//         const postResponse = await fetch('https://graph.instagram.com/v12.0/USER_ID/media', {
//             method: 'POST',
//             body: formData
//         });
//         const postResult = await postResponse.json();

//         if (postResult.id) {
//             res.json({ success: true, message: 'Post created successfully', postId: postResult.id });
//         } else {
//             res.status(500).json({ success: false, message: 'Failed to post to Instagram', error: postResult });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Internal server error', error });
//     }
// });

// module.exports = router;




// const express = require('express');
// const multer = require('multer');
// const fetch = require('node-fetch');
// const FormData = require('form-data');

// const router = express.Router();
// const upload = multer(); // Use multer to handle file uploads

// router.post('/upload', upload.single('image'), async (req, res) => {
//     const { caption, code } = req.body;
//     const image = req.file;

//     if (!code || !image) {
//         return res.status(400).json({ success: false, message: 'Missing required data: code or image' });
//     }

//     try {
//         // Step 1: Exchange code for access token
//         const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: new URLSearchParams({
//                 client_id: '1199616704485910',
//                 client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
//                 grant_type: 'authorization_code',
//                 redirect_uri: 'https://smpfe.netlify.app/dashboard',
//                 code
//             })
//         });

//         // Log the response status and body
//         console.log(`Token Response Status: ${tokenResponse.status}`);
//         const tokenData = await tokenResponse.json();
//         console.log('Token Data:', tokenData); // Log the token data

//         if (!tokenResponse.ok) {
//             return res.status(tokenResponse.status).json({
//                 success: false,
//                 message: 'Failed to obtain access token',
//                 error: tokenData
//             });
//         }

//         // Check if access token is present
//         if (!tokenData.access_token) {
//             return res.status(500).json({ success: false, message: 'Access token not received', error: tokenData });
//         }

//         const accessToken = tokenData.access_token;

//         // Log the access token (be careful with logging sensitive information)
//         console.log('Access Token:', accessToken);

//         // Step 2: Upload the image and caption to Instagram
//         const formData = new FormData();
//         formData.append('image', image.buffer, image.originalname);
//         formData.append('caption', caption);
//         formData.append('access_token', accessToken);

//         const postResponse = await fetch('https://graph.instagram.com/v12.0/me/media', {
//             method: 'POST',
//             body: formData,
//         });

//         const postResult = await postResponse.json();

//         if (postResult.id) {
//             // Step 3: Publish the media
//             const publishResponse = await fetch(`https://graph.instagram.com/v12.0/me/media_publish`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     creation_id: postResult.id,
//                     access_token: accessToken,
//                 }),
//             });

//             const publishResult = await publishResponse.json();

//             if (publishResult.id) {
//                 res.json({ success: true, message: 'Post created successfully', postId: publishResult.id });
//             } else {
//                 res.status(500).json({ success: false, message: 'Failed to publish post', error: publishResult });
//             }
//         } else {
//             res.status(500).json({ success: false, message: 'Failed to create media object', error: postResult });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'Internal server error', error });
//     }
// });

// module.exports = router;




// instagramRoutes.js
const express = require('express');
const axios = require('axios');
const multer = require('multer');

const router = express.Router();

// Multer configuration to store the file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Instagram OAuth client credentials
const clientId = '1199616704485910'; // Replace with your Instagram App Client ID
const clientSecret = '35b13ad41ab9c6560e0f6710bd54a033'; // Replace with your Instagram App Client Secret
// In-memory store for access token and user ID (for demonstration purposes)
let instagramAccessToken = null; // Store access token
let instagramUserId = null; // Store user ID (make sure this is available in the response)

// Handle the code exchange for access token
router.post('/token', async (req, res) => {
    console.log('Received request on /token endpoint');

    const { code } = req.body;

    if (!code) {
        console.log('Missing code or redirect_uri');
        return res.status(400).json({ success: false, message: 'Code or redirect_uri missing' });
    }

    console.log('Code and redirect_uri received:', { code });

    try {
        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: 'https://smpfe.netlify.app/dashboard',
            code,
        });

        instagramAccessToken = tokenResponse.data.access_token;
        instagramUserId = tokenResponse.data.user_id;

        console.log('Access token generated:', instagramAccessToken);

        return res.status(200).json({ success: true, accessToken: instagramAccessToken });
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return res.status(400).json({ success: false, message: 'Error exchanging code for token' });
    }
});

// Handle posting to Instagram
router.post('/upload', upload.single('image'), async (req, res) => {
    const { caption } = req.body;

    if (!caption || !req.file) {
        return res.status(400).json({ success: false, message: 'Caption or image missing' });
    }

    // Convert the image buffer to base64
    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    try {
        // Post to Instagram using the Instagram Graph API
        const mediaResponse = await axios.post(`https://graph.facebook.com/v12.0/${instagramUserId}/media`, {
            caption,
            image_url: imageUrl, // Use the base64 encoded image URL
            access_token: instagramAccessToken, // Use the stored access token
        });

        // Publish the media object
        const creationResponse = await axios.post(`https://graph.facebook.com/v12.0/${instagramUserId}/media_publish`, {
            creation_id: mediaResponse.data.id, // Use the media ID from the previous response
            access_token: instagramAccessToken,
        });

        return res.status(200).json({ success: true, data: creationResponse.data });
    } catch (error) {
        console.error('Error posting to Instagram:', error);
        return res.status(400).json({ success: false, message: 'Error posting to Instagram' });
    }
});

module.exports = router;

