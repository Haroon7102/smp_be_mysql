const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include DELETE
    allowedHeaders: ["Content-Type", "Authorization"], // Include any necessary headers

    credentials: true
}));

router.post('/chat', async (req, res) => {
    const { text } = req.body;

    try {
        // Call OpenAI API to generate response based on user input
        const openaiResponse = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-3.5-turbo',  // or the relevant GPT model
            prompt: `Generate a post content for the following input: ${text}`,
            max_tokens: 100,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `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`
            }
        });

        const reply = openaiResponse.data.choices[0].text.trim();
        res.json({ reply });
    } catch (error) {
        if (error.response && error.response.status === 429) {
            // Handle quota exceeded error (HTTP 429: Too many requests)
            console.error('Quota exceeded or rate limit reached');
            res.status(429).send('Quota exceeded or rate limit reached. Please try again later.');
        } else {
            console.error('Error generating response:', error);
            res.status(500).send('Error generating content');
        }
    }
});


module.exports = router;