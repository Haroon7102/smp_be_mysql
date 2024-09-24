const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateCaption = async (prompt) => {
    try {
        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
            prompt: prompt,
            max_tokens: 100, // Adjust based on your needs
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error('Error generating caption:', error);
        throw new Error('Error generating caption');
    }
};

module.exports = {
    generateCaption,
};
