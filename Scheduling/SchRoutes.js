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
router.get('/fetch-scheduled-posts', async (req, res) => {
    try {
        const posts = await SchPost.findAll();
        const formattedPosts = posts.map((post) => {
            const files = post.file ? JSON.parse(post.file) : [];
            return {
                id: post.id,
                caption: post.caption,
                scheduledDate: post.scheduledDate,
                pageId: post.pageId,
                accessToken: post.accessToken,
                postType: post.postType,
                email: post.email,
                isScheduled: post.isScheduled,
                files: files.map((file) => {
                    if (file && file.mimetype && file.buffer) {
                        return `data:${file.mimetype};base64,${file.buffer}`;
                    } else {
                        return null; // Handle improperly formatted file
                    }
                }),
            };
        });
        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});



router.put('/posts/:postId/update', upload.array('files', 10), async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, postType, scheduledDate, removeFiles } = req.body;
        const files = req.files; // Files uploaded through the form

        // Find the post in the database
        const post = await SchPost.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Parse existing file paths from the database
        const existingFiles = post.file ? JSON.parse(post.file) : [];

        // Remove specified files
        if (removeFiles) {
            const filesToRemove = JSON.parse(removeFiles); // Array of file paths to remove
            filesToRemove.forEach((filePath) => {
                const fileIndex = existingFiles.indexOf(filePath);
                if (fileIndex !== -1) {
                    // Remove the file from the array
                    existingFiles.splice(fileIndex, 1);

                    // Optionally, delete the file from the server
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete file ${filePath}:`, err);
                        }
                    });
                }
            });
        }

        // Add new files
        if (files && files.length > 0) {
            const newFilePaths = files.map((file) => file.path); // Get paths of uploaded files
            existingFiles.push(...newFilePaths); // Merge new files with existing ones
        }

        // Update post details
        post.caption = caption || post.caption;
        post.postType = postType || post.postType;
        post.scheduledDate = scheduledDate || post.scheduledDate;
        post.file = JSON.stringify(existingFiles); // Update file column as a JSON string

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