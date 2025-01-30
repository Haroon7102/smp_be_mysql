const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const { Groq } = require('groq-sdk')

router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include DELETE
    allowedHeaders: ["Content-Type", "Authorization"], // Include any necessary headers

    credentials: true
}));


const groq = new Groq({ apiKey: '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' });

router.post("/generate-captions", async (req, res) => {
    try {
        const { userInput } = req.body;

        if (!userInput) {
            return res.status(400).json({ error: "User input is required" });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: userInput }],
            model: "llama-3.3-70b-versatile",
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "No response from AI.";

        res.json({ response: responseText });
    } catch (error) {
        console.error("Error generating captions:", error);
        res.status(500).json({ error: "Failed to generate captions" });
    }
});



module.exports = router;






