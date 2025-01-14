
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { FbPost } = require('../models'); // Ensure you have a Post model
const axios = require('axios');

router.get('/trigger-cron', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Manual cron job triggered.`);

    try {
        // Find all posts that are due for publishing
        const posts = await FbPost.findAll({
            where: {
                isScheduled: true,
                scheduledDate: { [Op.lte]: new Date() },
            },
        });

        if (posts.length === 0) {
            console.log('No scheduled posts to process.');
            return res.status(200).json({ message: 'No scheduled posts to process.' });
        }

        console.log(`Found ${posts.length} scheduled post(s) to process.`);

        for (const post of posts) {
            try {
                const uploadData = {
                    caption: post.message,
                    pageId: post.pageId,
                    accessToken: post.accessToken,
                    postType: post.postType,
                    files: JSON.parse(post.file), // Parse the file field if stored as JSON
                };

                // Send the post to the upload route
                const response = await axios.post(
                    'https://smp-be-mysql.vercel.app/facebook-upload/upload',
                    uploadData
                );

                if (response.status === 200) {
                    console.log(`Successfully uploaded post with ID ${post.id}.`);

                    // Mark the post as processed
                    post.isScheduled = false;
                    await post.save();
                } else {
                    console.error(`Failed to upload post with ID ${post.id}:`, response.data);
                }
            } catch (error) {
                console.error(`Error uploading post with ID ${post.id}:`, error.message);
            }
        }

        res.status(200).json({ message: 'Scheduled posts processed successfully.' });
    } catch (error) {
        console.error('Error during cron job execution:', error.message);
        res.status(500).json({ error: 'Error executing cron job.', details: error.message });
    }
});

module.exports = router;
