
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const axios = require('axios');
const { SchPost } = require('../models');
const moment = require('moment-timezone');

router.get('/trigger-cron', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Manual cron job triggered.`);

    try {
        const currentTime = moment().tz('Asia/Karachi').startOf('minute').format('YYYY-MM-DD HH:mm');

        const posts = await SchPost.findAll({
            where: {
                isScheduled: true,
            }
        });

        // Filter posts based on the scheduled date matching the current time (rounded to the minute)
        const postsToProcess = posts.filter(post => {
            const scheduledDate = moment(post.scheduledDate).startOf('minute').format('YYYY-MM-DD HH:mm');
            return scheduledDate === currentTime;
        });



        if (postsToProcess.length === 0) {
            console.log('No scheduled posts to process.');
            return res.status(200).json({ message: 'No scheduled posts to process.' });
        }

        console.log(`Found ${posts.length} scheduled post(s) to process.`);

        for (const post of postsToProcess) {
            console.log("Processing post:", {
                id: post.id,
                scheduledDate: post.scheduledDate,
                isScheduled: post.isScheduled,
            });


            let files = [];
            if (post.file) {
                try {
                    // Assuming `post.file` contains blob data as a JSON string
                    files = JSON.parse(post.file);
                    // Here we will convert the files to be ready for the upload route
                    files = files.map(file => {
                        return {
                            buffer: Buffer.from(file.data, 'base64'), // Assuming the file data is in base64 format
                            originalname: file.name,
                            mimetype: file.mimeType,
                        };
                    });
                } catch (error) {
                    console.error(`Invalid file format for post ID ${post.id}:`, error.message);
                    return; // Skip this post if files are invalid
                }
            }



            const uploadData = {
                caption: post.caption,
                pageId: post.pageId,
                accessToken: post.accessToken,
                postType: post.postType,
                files,
                email: post.email,
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
