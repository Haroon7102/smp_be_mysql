const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');

const { GoogleGenerativeAI } = require("@google/generative-ai");



const API_KEY = "AIzaSyCjp4hY8BiN_rdcWQ6NHfFoMILhdysLcB0"; // Keep this secret!
const genAI = new GoogleGenerativeAI(API_KEY);
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include DELETE
    allowedHeaders: ["Content-Type", "Authorization"], // Include any necessary headers

    credentials: true
}));

router.post("/generate-captions", async (req, res) => {
    const { topic, numberOfCaptions } = req.body;

    if (!topic || !numberOfCaptions) {
        return res.status(400).json({ error: "Topic and number of captions are required" });
    }

    const prompt = `Create ${numberOfCaptions} creative captions for social media posts on the topic '${topic}'. Each caption should include 2-3 relevant trending hashtags.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse captions from response text
        const startIdx = responseText.indexOf("[");
        const endIdx = responseText.lastIndexOf("]") + 1;
        if (startIdx === -1 || endIdx === 0) {
            throw new Error("Invalid response format");
        }

        const captions = JSON.parse(responseText.slice(startIdx, endIdx));
        res.json({ captions });
    } catch (err) {
        console.error("Error generating captions:", err);
        res.status(500).json({ error: "Failed to generate captions" });
    }
});


module.exports = router;




