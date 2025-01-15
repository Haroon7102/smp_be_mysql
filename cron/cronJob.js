
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const axios = require('axios');
const { SchPost } = require('../models');
const moment = require('moment-timezone');
const FormData = require('form-data');


router.get('/trigger-cron', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Manual cron job triggered.`);

    try {
        // Get the current time rounded to the minute in the 'Asia/Karachi' timezone
        // const currentTime = moment().tz('Asia/Karachi').startOf('minute').format('YYYY-MM-DD HH:mm');
        // console.log(`Current Time: ${currentTime}`);

        // Fetch all scheduled posts
        const posts = await SchPost.findAll({
            where: {
                isScheduled: true, // Only fetch posts that are scheduled
            }
        });

        // Get current time in Asia/Karachi timezone
        const now = new Date();
        const currentTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }));
        currentTime.setSeconds(0, 0); // Remove seconds and milliseconds

        // Filter posts that are due to be processed at the current time
        const postsToProcess = posts.filter(post => {
            const scheduledTime = new Date(post.scheduledDate); // Scheduled time from the database
            scheduledTime.setSeconds(0, 0); // Remove seconds and milliseconds

            console.log(`Checking Post ID ${post.id}: Scheduled Time = ${scheduledTime.toISOString().slice(0, 16).replace('T', ' ')}`);
            return scheduledTime.getTime() === currentTime.getTime(); // Compare timestamps
        });

        if (postsToProcess.length === 0) {
            console.log("No posts are due for processing at this time.");
        } else {
            console.log("Posts due for processing:", postsToProcess);
            // Add your logic to process the posts
        }



        if (postsToProcess.length === 0) {
            console.log('No posts are due for processing at this time.');
            return res.status(200).json({ message: 'No posts are due for processing at this time.' });
        }

        console.log(`Found ${postsToProcess.length} post(s) to process.`);

        // Process each scheduled post
        for (const post of postsToProcess) {
            console.log(`Processing Post ID ${post.id} scheduled at ${post.scheduledDate}.`);

            // Prepare FormData
            const form = new FormData();

            // Append the regular data fields
            form.append('caption', post.caption);
            form.append('pageId', post.pageId);
            form.append('accessToken', post.accessToken);
            form.append('postType', post.postType);
            form.append('email', post.email);

            // Assuming `post.file` contains the file data (Buffer or Blob)
            form.append('file', post.file, {
                filename: 'file.jpg',  // Adjust filename dynamically if needed
                contentType: 'image/jpeg',  // Set the appropriate content type (adjust if necessary)
            });

            try {
                // Send data to the upload route
                const response = await axios.post(
                    'https://smp-be-mysql.vercel.app/facebook-upload/upload', // Your upload endpoint
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),  // Automatically adds the correct 'Content-Type' for multipart/form-data
                        },
                    }
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
