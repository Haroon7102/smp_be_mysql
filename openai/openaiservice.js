const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();


const { GoogleGenerativeAI } = require("@google/generative-ai");

router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include DELETE
    allowedHeaders: ["Content-Type", "Authorization"], // Include any necessary headers

    credentials: true
}));

const API_KEY = 'POhwCWWDdQRGuOqql0IanTFPRdx9xN6QtfdRjxvYNqnHQxjBmTpQ5E4huiwQKHGGKVV9sJw2RnT3BlbkFJKBjjNaWeXfEmb51jeSjvRmDx1BGU2xL633_gZNsPgS0Yiq81H4mE_MZd5xCdvPcXB4iTJC6AUA'; // Secure your API key in environment variables
if (!API_KEY) {
    console.error("API key is missing. Please set GOOGLE_GEN_AI_API_KEY in your environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Endpoint to generate captions
router.post('/generate-caption', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4', // Use GPT-4 or your preferred model
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );

        const caption = response.data.choices[0].message.content;
        res.status(200).json({ caption });
    } catch (error) {
        console.error('Error generating caption:', error.message);
        res.status(500).json({ error: 'Failed to generate caption' });
    }
});



module.exports = router;






