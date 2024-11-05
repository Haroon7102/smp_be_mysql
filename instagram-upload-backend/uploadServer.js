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





const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const router = express.Router();
const upload = multer(); // Configure multer as needed

router.post('/upload', upload.single('image'), async (req, res) => {
    const { code, caption } = req.body;
    const image = req.file;

    if (!code || !image) {
        return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    try {
        // Exchange code for an access token with Instagram
        const tokenResponse = await fetch(`https://api.instagram.com/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: '1199616704485910',
                client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
                grant_type: 'authorization_code',
                redirect_uri: 'https://smpfe.netlify.app/dashboard',
                code
            })
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return res.status(500).json({ success: false, message: 'Failed to obtain access token' });
        }

        // Upload the image and caption to Instagram
        const formData = new FormData();
        formData.append('image', image.buffer, image.originalname);
        formData.append('caption', caption);
        formData.append('access_token', accessToken);

        const postResponse = await fetch('https://graph.instagram.com/v12.0/USER_ID/media', {
            method: 'POST',
            body: formData
        });
        const postResult = await postResponse.json();

        if (postResult.id) {
            res.json({ success: true, message: 'Post created successfully', postId: postResult.id });
        } else {
            res.status(500).json({ success: false, message: 'Failed to post to Instagram', error: postResult });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error });
    }
});

module.exports = router;
