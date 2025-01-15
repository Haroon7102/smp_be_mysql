
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const axios = require('axios');
const { SchPost } = require('../models');
router.get('/trigger-cron', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Manual cron job triggered.`);

    try {
        const currentTime = new Date().toISOString(); // Current UTC time
        console.log("Current time (UTC):", currentTime);

        // Find all posts due for publishing
        const posts = await SchPost.findAll({
            where: {
                isScheduled: true,
                scheduledDate: { [Op.lte]: currentTime },
            },
        });

        if (posts.length === 0) {
            console.log('No scheduled posts to process.');
            return res.status(200).json({ message: 'No scheduled posts to process.' });
        }

        console.log(`Found ${posts.length} scheduled post(s) to process.`);

        for (const post of posts) {
            console.log("Processing post:", {
                id: post.id,
                scheduledDate: post.scheduledDate,
                isScheduled: post.isScheduled,
            });

            let files = [];
            try {
                files = post.file ? JSON.parse(post.file) : [];
            } catch (error) {
                console.error(`Invalid file format for post ID ${post.id}:`, error.message);
                continue; // Skip this post
            }

            const uploadData = {
                caption: post.message,
                pageId: post.pageId,
                accessToken: post.accessToken,
                postType: post.postType,
                files,
            };

            try {
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
                console.error(`Error uploading post with ID ${post.id}:`, error.response?.data || error.message);
            }
        }

        res.status(200).json({ message: 'Scheduled posts processed successfully.' });
    } catch (error) {
        console.error('Error during cron job execution:', error.message);
        res.status(500).json({ error: 'Error executing cron job.', details: error.message });
    }
});


module.exports = router;
