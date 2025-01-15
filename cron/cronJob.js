
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const axios = require('axios');
const { SchPost } = require('../models');
const moment = require('moment-timezone');

router.get('/trigger-cron', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Manual cron job triggered.`);

    try {
        // Get the current time rounded to the minute in the 'Asia/Karachi' timezone
        const currentTime = moment().tz('Asia/Karachi').startOf('minute').format('YYYY-MM-DD HH:mm');
        console.log(`Current Time: ${currentTime}`);

        // Fetch all scheduled posts
        const posts = await SchPost.findAll({
            where: {
                isScheduled: true, // Only fetch posts that are scheduled
            }
        });

        // Filter posts that are due to be processed at the current time
        const postsToProcess = posts.filter(post => {
            const scheduledTime = moment(post.scheduledDate).startOf('minute').format('YYYY-MM-DD HH:mm'); // Scheduled time (rounded to minute level)

            console.log(`Checking Post ID ${post.id}:`);
            console.log(`Scheduled Time: ${scheduledTime.format('YYYY-MM-DD HH:mm')}`);

            return scheduledTime.isSame(currentTime); // Compare only the minute
        });

        if (postsToProcess.length === 0) {
            console.log('No posts are due for processing at this time.');
            return res.status(200).json({ message: 'No posts are due for processing at this time.' });
        }

        console.log(`Found ${postsToProcess.length} post(s) to process.`);

        // Process each scheduled post
        for (const post of postsToProcess) {
            console.log(`Processing Post ID ${post.id} scheduled at ${post.scheduledDate}.`);

            const uploadData = {
                caption: post.caption,
                pageId: post.pageId,
                accessToken: post.accessToken,
                postType: post.postType,
                file: post.file, // Assuming this contains the file info
                email: post.email, // For any additional data you need
            };

            try {
                // Send data to the upload route
                const response = await axios.post(
                    'https://smp-be-mysql.vercel.app/facebook-upload/upload', // Your upload endpoint
                    uploadData
                );

                if (response.status === 200) {
                    console.log(`Successfully uploaded Post ID ${post.id}.`);

                    // Mark the post as processed
                    post.isScheduled = false; // Set isScheduled to false
                    await post.save(); // Save the updated record in the database
                } else {
                    console.error(`Failed to upload Post ID ${post.id}:`, response.data);
                }
            } catch (error) {
                console.error(`Error uploading Post ID ${post.id}:`, error.response?.data || error.message);
            }
        }

        res.status(200).json({ message: 'Scheduled posts processed successfully.' });
    } catch (error) {
        console.error('Error during cron job execution:', error.message);
        res.status(500).json({ error: 'Error executing cron job.', details: error.message });
    }
});



module.exports = router;
