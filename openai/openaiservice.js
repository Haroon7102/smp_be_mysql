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

    // Validate input
    if (!topic || !numberOfCaptions) {
        return res.status(400).json({ error: "Topic and number of captions are required" });
    }

    const prompt = `Generate ${numberOfCaptions} engaging and professional social media captions related to "${topic}". 
    Include 5 relevant hashtags for each caption. Avoid any inappropriate or sensitive content.`;

    try {
        // Fetch the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Ensure the request is passed as an object with the prompt as a string
        const result = await model.generateContent({ prompt: prompt });

        // Check if response contains valid result
        if (!result || !result.response || !result.response.text) {
            throw new Error("Invalid response structure");
        }

        // Get the generated text content
        const responseText = result.response.text;

        // Optional: Validate response format if needed
        // For example, ensure it's a string and looks like a list of captions
        if (typeof responseText !== "string") {
            throw new Error("Response text is not in expected format");
        }

        // Parse the captions (if the response format is JSON-like or structured)
        const startIdx = responseText.indexOf("[");
        const endIdx = responseText.lastIndexOf("]") + 1;

        // If we cannot find a valid list format, handle it gracefully
        if (startIdx === -1 || endIdx === 0) {
            throw new Error("Could not parse captions from the response");
        }

        // Assuming that the response contains a list of captions in JSON format
        const captions = JSON.parse(responseText.slice(startIdx, endIdx));

        // Ensure we have the correct number of captions (e.g., numberOfCaptions)
        if (captions.length !== numberOfCaptions) {
            console.warn(`Generated ${captions.length} captions, expected ${numberOfCaptions}`);
        }

        // Return the captions in the response
        res.json({ captions });
    } catch (err) {
        console.error("Error generating captions:", err);
        res.status(500).json({ error: "Failed to generate captions", details: err.message });
    }
});




module.exports = router;




