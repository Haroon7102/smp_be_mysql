const cron = require('node-cron');
const { Op } = require('sequelize');
const axios = require('axios');
const { FbPost } = require('../models'); // Ensure you have a Post model

// Schedule a cron job to run every minute
cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Checking for scheduled posts...`);

    try {
        const posts = await FbPost.findAll({
            where: {
                isScheduled: true,
                scheduledDate: { [Op.lte]: new Date() },
            },
        });

        if (posts.length === 0) {
            console.log('No scheduled posts to process.');
            return;
        }

        console.log(`Found ${posts.length} scheduled post(s) to process.`);

        for (const post of posts) {
            const uploadData = {
                caption: post.message,
                pageId: post.pageId,
                accessToken: post.accessToken,
                postType: post.postType,
                files: JSON.parse(post.file), // Parse file data
            };

            try {
                const response = await axios.post(
                    'https://smp-be-mysql.vercel.app/facebook-upload/upload',
                    uploadData
                );

                if (response.status === 200) {
                    console.log(`Post with ID ${post.id} successfully uploaded.`);
                    post.isScheduled = false;
                    await post.save(); // Mark as processed
                } else {
                    console.error(`Failed to upload post ID ${post.id}:`, response.data);
                }
            } catch (error) {
                console.error(`Error uploading post ID ${post.id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error.message);
    }
});

module.exports = cron;
