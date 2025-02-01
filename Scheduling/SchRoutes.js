const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs'); // File system module
const multer = require('multer');
const streamifier = require('streamifier');
const FormData = require('form-data');
const cors = require('cors');
const https = require('https');
const { FbPost } = require('../models'); // Ensure you have a Post model
const { SchPost } = require('../models');
// const cron = require('node-cron');

require('dotenv').config();

const agent = new https.Agent({
    rejectUnauthorized: true, // Ensures the SSL certificate is validated
    secureProtocol: 'TLSv1_2_method', // Force TLS v1.2
});


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CORS setup
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include DELETE
    allowedHeaders: ["Content-Type", "Authorization"], // Include any necessary headers

    credentials: true
}));
router.post('/schedule-post', upload.array('files', 10), async (req, res) => {
    const { caption, scheduledDate, pageId, accessToken, postType, email } = req.body;

    if (!accessToken || !pageId || !scheduledDate) {
        return res.status(400).json({ error: 'Access token, page ID, and scheduled date are required.' });
    }

    try {
        // Handle files (if any)
        const files = req.files || []; // `req.files` is an array of uploaded files
        const fileBuffers = files.map(file => ({
            buffer: file.buffer, // File binary data
            originalName: file.originalname, // File name
            mimetype: file.mimetype, // MIME type
        }));

        // Save post data including scheduledDate and isScheduled
        const post = await SchPost.create({
            caption: caption,
            scheduledDate: new Date(scheduledDate), // Convert to Date object
            pageId: pageId,
            accessToken: accessToken,
            postType: postType,
            email: email, // Assuming email is used for the user ID
            isScheduled: true,
            file: JSON.stringify(fileBuffers), // Save file data as JSON in the database
        });

        res.status(201).json({
            message: 'Post saved successfully!',
            post: post,
        });
    } catch (error) {
        console.error('Error during scheduling post:', error);
        return res.status(500).json({ error: 'Scheduling post failed', details: error.message });
    }
});
router.post('/fetch-scheduled-posts', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const posts = await SchPost.findAll({ where: { email } }); // Filter posts by email
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});



router.put('/posts/:postId/update', upload.array('files', 10), async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, scheduledDate } = req.body;

        // Find the post in the database
        const post = await SchPost.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update post details
        post.caption = caption || post.caption;
        post.scheduledDate = scheduledDate || post.scheduledDate;

        await post.save(); // Save the updated post

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ error: 'Error updating post', details: error.message });
    }
});

router.delete('/delete-scheduled-post/:id', async (req, res) => {
    try {
        const post = await SchPost.findByPk(req.params.id);
        if (post) {
            await post.destroy();
            res.status(200).json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
});

module.exports = router;