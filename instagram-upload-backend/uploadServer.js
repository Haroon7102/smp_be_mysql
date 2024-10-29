const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://api.instagram.com/oauth/access_token', {
            client_id: '1199616704485910',
            client_secret: '35b13ad41ab9c6560e0f6710bd54a033',
            grant_type: 'authorization_code',
            redirect_uri: 'https://smpfe.netlify.app/auth/callback', // Must match exactly with the URL used in the initial request
            code
        });

        const accessToken = response.data.access_token;

        // Pass the login success as a query parameter
        res.redirect(`https://smpfe.netlify.app/dashboard?logged_in=true`);
    } catch (error) {
        console.error('Error exchanging code for access token:', error.response?.data || error.message);
        res.redirect(`https://smpfe.netlify.app/dashboard?logged_in=false`);
    }
});

module.exports = router;
