const express = require('express');
const axios = require('axios');
const router = express.Router();

// router.get('/callback', async (req, res) => {
//     const { code } = req.query;
//     console.log('hitting instagram call back');
//     try {
//         const response = await axios.post('https://api.instagram.com/oauth/access_token', {
//             client_id: '1199616704485910',
//             client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
//             grant_type: 'authorization_code',
//             redirect_uri: 'https://smpfe.netlify.app/instagram-upload/callback', // Must match exactly with the URL used in the initial request
//             code
//         });

//         const accessToken = response.data.access_token;

//         // Store the accessToken securely on your backend as needed for further actions

//         // Redirect to the dashboard with login success status
//         res.redirect(`https://smpfe.netlify.app/dashboard?logged_in=true`);
//     } catch (error) {
//         console.error('Error exchanging code for access token:', error.response?.data || error.message);

//         // Redirect to the dashboard with login failure status
//         res.redirect(`https://smpfe.netlify.app/dashboard?logged_in=false`);
//     }
// });

// module.exports = router;



router.get('/callback', async (req, res) => {
    const { code } = req.query;
    console.log('Instagram Callback - Code:', code);
    try {
        const response = await axios.post('https://api.instagram.com/oauth/access_token', {
            client_id: '1199616704485910',
            client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
            grant_type: 'authorization_code',
            redirect_uri: 'https://smpfe.netlify.app/instagram-upload/callback',
            code
        });

        console.log('Access Token Response:', response.data);
        res.redirect('https://smpfe.netlify.app/dashboard');

        // ... rest of the logic
    } catch (error) {
        console.error('Error exchanging code for access token:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');

        // ... rest of the error handling
    }
});

module.exports = router;
