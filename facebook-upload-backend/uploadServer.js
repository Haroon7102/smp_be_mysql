
// _______________________________________________________________.
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


// Function to post a message to Facebook
const postMessageToFacebook = async (pageId, pageAccessToken, message) => {
    try {
        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams({
                message,
                access_token: pageAccessToken,
            }),
            agent,
        });

        const postResult = await postResponse.json();
        if (!postResponse.ok) {
            throw new Error(`Failed to create post: ${postResult.error.message}`);
        }
        return postResult;
    } catch (error) {
        console.error('Error posting message to Facebook:', error);
        throw error;
    }
};



// Get page access token using user access token
const getPageAccessToken = async (userAccessToken, pageId) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${userAccessToken}`);
        const result = await response.json();

        if (result.error) {
            throw new Error(`Error fetching page access token: ${result.error.message}`);
        }

        return result.access_token;
    } catch (error) {
        console.error('Error fetching page access token:', error);
        throw error;
    }
};
const fetchPageName = async (pageId, accessToken) => {
    const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=name&access_token=${accessToken}`);
    const result = await response.json();

    if (response.ok && result.name) {
        return result.name; // Return the page name
    } else {
        throw new Error(`Failed to fetch page name: ${result.error ? result.error.message : 'Unknown error'}`);
    }
};


// Save post data to the database
const savePostToDatabase = async (email, pageId, pageName, message, accessToken, mediaIds, postId, mediaUrls) => {
    try {
        const mediaUrl = mediaUrls?.[0]; // Get the first media URL (optional)
        const newPost = await FbPost.create({
            email,
            pageId,
            pageName,
            message,
            accessToken,
            media: JSON.stringify(mediaUrls), // Save as JSON string
            mediaUrl: JSON.stringify(mediaUrls), // Save the first media URL (optional)
            postId,
        });
        console.log('Post saved successfully to the database:', newPost);
    } catch (error) {
        console.error('Error saving post to the database:', error);
        throw error;
    }
};

const fetchMediaUrlFromFacebook = async (mediaFbid, accessToken) => {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/${mediaFbid}?fields=picture,source,format&access_token=${accessToken}`
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to fetch media URL');
        }

        // Handle video media
        if (result.source) {
            return result.source;  // Return video URL
        }

        // Handle photo media
        if (result.picture) {
            return result.picture;  // Return image URL
        }

        throw new Error('Unknown media type or missing media URL');
    } catch (error) {
        console.error(`Error fetching media URL for ${mediaFbid}:`, error);
        throw error;
    }
};
const fetchMediaUrlFromFacebookimg = async (mediaFbid, accessToken) => {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/${mediaFbid}?fields=picture,source&access_token=${accessToken}`
        );
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to fetch media URL');
        }
        return result.source || result.picture; // `source` is for videos, `picture` for images
    } catch (error) {
        console.error(`Error fetching media URL for ${mediaFbid}:`, error);
        throw error;
    }
};




router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption, postType, email } = req.body;
    const files = req.files;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        const pageAccessToken = await getPageAccessToken(accessToken, pageId);
        const pageName = await fetchPageName(pageId, pageAccessToken);

        let mediaIds = [];
        let mediaUrls = [];
        let postId = null;

        if (files && files.length > 0) {
            if (postType === 'feed') {
                const photoUploads = files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('source', file.buffer, {
                        filename: file.originalname || 'photo.jpg',
                        contentType: file.mimetype || 'image/jpeg',
                    });
                    formData.append('published', 'false');

                    const response = await fetch(
                        `https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${pageAccessToken}`,
                        {
                            method: 'POST',
                            body: formData,
                            headers: formData.getHeaders(),
                        }
                    );

                    const result = await response.json();
                    if (!response.ok || !result.id) {
                        throw new Error(`Photo upload failed: ${result.error?.message || 'Unknown error'}`);
                    }

                    const mediaUrl = await fetchMediaUrlFromFacebookimg(result.id, pageAccessToken);
                    mediaUrls.push(mediaUrl);
                    return { media_fbid: result.id };
                });

                mediaIds = await Promise.all(photoUploads);

                const postData = {
                    attached_media: JSON.stringify(mediaIds),
                    access_token: pageAccessToken,
                };
                if (caption) postData.message = caption;

                const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
                    method: 'POST',
                    body: new URLSearchParams(postData),
                });

                const postResult = await postResponse.json();
                if (!postResponse.ok || !postResult.id) {
                    throw new Error(`Failed to create post: ${postResult.error?.message || 'Unknown error'}`);
                }

                postId = postResult.id;
            } else if (postType === 'videos' || postType === 'reels') {
                const videoBuffer = files[0].buffer;

                const formData = new FormData();
                formData.append('source', videoBuffer, {
                    filename: files[0].originalname,
                    contentType: files[0].mimetype,
                });
                if (caption) formData.append('description', caption);

                const videoResponse = await fetch(
                    `https://graph.facebook.com/v21.0/${pageId}/videos?access_token=${pageAccessToken}`,
                    {
                        method: 'POST',
                        body: formData,
                        headers: formData.getHeaders(),
                    }
                );

                const videoResult = await videoResponse.json();
                if (!videoResponse.ok || !videoResult.id) {
                    throw new Error(`${postType} upload failed: ${videoResult.error?.message || 'Unknown error'}`);
                }

                postId = videoResult.id;

                console.log(`Video uploaded with ID: ${postId}. Waiting for processing...`);
                await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds

                const mediaUrl = await fetchMediaUrlFromFacebook(videoResult.id, pageAccessToken, 5, 5000);
                mediaUrls.push(mediaUrl);
                mediaIds.push(videoResult.id);
            }

        } else {
            const postResult = await postMessageToFacebook(pageId, pageAccessToken, caption);
            postId = postResult.id;
        }

        // Save post and media URLs to the database
        await savePostToDatabase(email, pageId, pageName, caption, accessToken, mediaIds, postId, mediaUrls);

        return res.json({
            success: true,
            postId: postId,
            message: 'Post created successfully.',
            mediaIds: mediaIds,
            mediaUrls: mediaUrls,
        });
    } catch (error) {
        console.error('Error during upload:', error);
        return res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

const updatePostInDatabase = async (postId, email, message, mediaUrls) => {
    try {
        // Find the post in the database by `postId` and `email`
        const post = await FbPost.findOne({ where: { postId, email } });

        if (!post) {
            throw new Error('Post not found in the database');
        }

        // Parse existing media from the database (if stored as JSON string)
        const existingMedia = post.media ? JSON.parse(post.media) : [];

        // Check if mediaUrls is provided and contains data
        const updatedMedia = (mediaUrls && mediaUrls.length > 0)
            ? mediaUrls // Use the updated media URLs
            : existingMedia; // Use the existing media if no updated URLs are provided

        // Determine the first media URL (if any)
        const firstMediaUrl = updatedMedia.length > 0 ? updatedMedia[0] : null;

        // Update the post
        await FbPost.update(
            {
                message: message || post.message, // Update the caption or retain the existing one
                media: JSON.stringify(updatedMedia), // Save the updated media (or existing media)
                mediaUrl: firstMediaUrl, // Set the first media URL (or null if none)
            },
            { where: { postId, email } }
        );

        console.log('Post updated successfully in the database');
    } catch (error) {
        console.error('Error updating post in the database:', error);
        throw error;
    }
};




router.put('/post/update', upload.array('files', 10), async (req, res) => {
    let { accessToken, pageId, postId, caption, email, postType, mediaToRemove } = req.body;
    postId = postId.replace(/^"|"$/g, '');  // Remove leading and trailing quotes
    console.log("Request body:", req.body);  // Log the incoming request body
    console.log("Request body:", postId);  // Log the incoming request body

    const files = req.files;
    console.log("Uploaded files:", files);  // Log the uploaded files

    // Validate required fields
    if (!pageId || !postId) {
        console.log("Missing required fields: pageId or postId");  // Log the missing fields
        return res.status(400).json({ error: 'Access token, page ID, and post ID are required.' });
    }

    try {
        const pageAccessToken = await getPageAccessToken(accessToken, pageId);
        console.log("Page access token retrieved:", pageAccessToken);  // Log the page access token

        // Handle media removal
        if (mediaToRemove && mediaToRemove.length > 0) {
            console.log("Media to remove:", mediaToRemove);  // Log media IDs to remove
            for (const mediaId of mediaToRemove) {
                const deleteResponse = await fetch(
                    `https://graph.facebook.com/${mediaId}?access_token=${pageAccessToken}`,
                    { method: 'DELETE' }
                );
                console.log(`Media ${mediaId} deletion response:`, deleteResponse);
            }
        }

        let updatedMediaIds = [];
        let updatedMediaUrls = [];

        // Handle new media uploads
        if (files && files.length > 0) {
            console.log("Processing uploaded files for media");  // Log that media processing is starting
            const mediaUploads = files.map(async (file) => {
                const formData = new FormData();
                formData.append('source', file.buffer, {
                    filename: file.originalname || 'file.jpg',
                    contentType: file.mimetype || 'image/jpeg',
                });
                formData.append('published', 'false');

                const endpoint =
                    postType === 'video'
                        ? `https://graph.facebook.com/v21.0/${pageId}/videos`
                        : `https://graph.facebook.com/v21.0/${pageId}/photos`;

                const response = await fetch(`${endpoint}?access_token=${pageAccessToken}`, {
                    method: 'POST',
                    body: formData,
                    headers: formData.getHeaders(),
                });

                const result = await response.json();
                console.log(`Media upload result for ${file.originalname}:`, result);  // Log media upload result

                if (!response.ok || !result.id) {
                    throw new Error(`Media upload failed: ${result.error?.message || 'Unknown error'}`);
                }

                const mediaUrl = await fetchMediaUrlFromFacebookimg(result.id, pageAccessToken);
                updatedMediaUrls.push(mediaUrl);
                return { media_fbid: result.id };
            });

            updatedMediaIds = await Promise.all(mediaUploads);
        }

        // Prepare data for updating the post on Facebook
        const updateData = {
            access_token: pageAccessToken,
        };
        if (caption) updateData.message = caption;
        if (updatedMediaIds.length > 0) updateData.attached_media = JSON.stringify(updatedMediaIds);

        console.log("Data prepared for Facebook update:", updateData);  // Log the data for the update

        const updateResponse = await fetch(
            `https://graph.facebook.com/v21.0/${postId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: new URLSearchParams(updateData),
            }
        );

        const updateResult = await updateResponse.json();
        console.log("Facebook update response:", updateResult);  // Log Facebook update response

        if (!updateResponse.ok) {
            throw new Error(`Failed to update post: ${updateResult.error?.message || 'Unknown error'}`);
        }

        // Update the database
        await updatePostInDatabase(postId, email, caption, updatedMediaUrls);
        console.log("Post updated in database");

        res.json({ success: true, message: 'Post updated successfully.' });
    } catch (error) {
        console.error('Error updating post:', error);  // Log error message
        res.status(500).json({ error: 'Post update failed', details: error.message });
    }
});




router.delete('/post/delete', async (req, res) => {
    let { accessToken, pageId, postId, email } = req.body;  // Change const to let
    postId = postId.replace(/^"|"$/g, '');  // Remove leading and trailing quotes


    console.log("data recived", req.body);

    try {
        // Get the page access token
        const pageAccessToken = await getPageAccessToken(accessToken, pageId);

        // Delete the post from Facebook
        console.log("before sending the postid", postId);

        const deleteResponse = await fetch(
            `https://graph.facebook.com/${postId}?access_token=${pageAccessToken}`,
            { method: 'DELETE' }
        );

        const deleteResult = await deleteResponse.json();
        console.log("Delete response from Facebook:", deleteResult);

        if (!deleteResponse.ok || !deleteResult.success) {
            throw new Error(
                `Failed to delete post on Facebook: ${deleteResult.error?.message || 'Unknown error'}`
            );
        }

        // Delete the post from the database
        await FbPost.destroy({
            where: { postId: postId, email: email }, // Ensure we match by postId and email
        });

        res.json({ success: true, message: 'Post deleted successfully.' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Post deletion failed', details: error.message });
    }
});

router.post('/posts', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

        // Fetch posts for the provided email
        const posts = await FbPost.findAll({
            where: { email }, // Filter posts by email
            attributes: ['id', 'email', 'pageId', 'pageName', 'message', 'media', 'createdAt', 'accessToken', 'postId'],
            order: [['createdAt', 'DESC']],
        });

        // Process posts and include media URL if media exists
        const safePosts = posts.map(post => {
            let media = null;
            let mediaUrl = null;

            // Safely parse media JSON if it exists
            try {
                media = post.media ? JSON.parse(post.media) : null;
            } catch (err) {
                console.error(`Invalid JSON in media field for post ID ${post.id}:`, err.message);
            }

            // Use media URL directly from the database if available
            if (media) {
                mediaUrl = media.url;  // Assuming media contains the URL you stored earlier
            }

            return {
                ...post.dataValues,
                media,
                mediaUrl, // Include media URL in response
            };
        });

        res.json(safePosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});


router.post('/posts/count', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const totalPosts = await FbPost.count({ where: { email } }); // Using Sequelize's count method
        return res.json({ totalPosts }); // Returning only the count
    } catch (error) {
        console.error("Error counting posts:", error);
        return res.status(500).json({ error: "Server Error" });
    }
});


module.exports = router;
