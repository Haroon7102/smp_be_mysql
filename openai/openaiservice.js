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
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
    }

    const prompt = `Generate 5 engaging and professional social media captions related to "${topic}". 
    Include 5 relevant hashtags for each caption. Avoid any inappropriate or sensitive content.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Ensure the request is an object with a prompt key, rather than just a string.
        const result = await model.generateContent({ prompt: prompt });

        // Ensure the response structure is as expected
        const responseText = result.response.text;

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
        res.status(500).json({ error: "Failed to generate captions", details: err.message });
    }
});



module.exports = router;




