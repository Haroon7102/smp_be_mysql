
// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, accessToken, message) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 message,
//                 access_token: accessToken,
//             }),
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(`Failed to create post: ${postResult.error.message}`);
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };

// // Route to upload files and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         const photoIds = [];

//         if (files && files.length > 0) {
//             // Upload images in parallel using Promise.all
//             const uploadPromises = files.map(file => {
//                 const formData = new FormData();
//                 formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                 formData.append('published', 'false');

//                 return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
//                     method: 'POST',
//                     body: formData,
//                     headers: formData.getHeaders(),
//                 })
//                     .then(response => response.json())
//                     .then(result => {
//                         if (!result.id) {
//                             throw new Error(`Photo upload failed: ${result.error.message}`);
//                         }
//                         photoIds.push({ media_fbid: result.id });
//                     });
//             });

//             // Await all uploads
//             await Promise.all(uploadPromises);

//             // Create a single post attaching all photos
//             const postData = {
//                 attached_media: JSON.stringify(photoIds),
//                 access_token: accessToken,
//             };
//             if (caption) postData.message = caption;

//             const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                 method: 'POST',
//                 body: new URLSearchParams(postData),
//             });

//             const postResult = await postResponse.json();
//             if (!postResponse.ok) {
//                 throw new Error(`Failed to create post: ${postResult.error.message}`);
//             }

//             res.json({ success: true, postId: postResult.id });
//         } else if (caption) {
//             // Only caption without images
//             const postResult = await postMessageToFacebook(pageId, accessToken, caption);
//             return res.json({ result: postResult });
//         } else {
//             return res.status(400).json({ error: 'Either files or a caption is required.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });


// module.exports = router;

// _______________________________________________________________.
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs'); // File system module
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
const https = require('https');

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
    methods: ['POST'],
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



// // Function to upload video to Facebook this si s
// const uploadVideoToFacebook = async (pageId, pageAccessToken, videoBuffer, caption = '') => {
//     try {
//         const formData = new FormData();
//         formData.append("source", videoBuffer, {
//             filename: "video.mp4", // Specify filename
//             contentType: "video/mp4", // MIME type
//         });
//         formData.append("description", caption || ''); // Default to an empty string if no caption
//         formData.append("access_token", pageAccessToken);

//         const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();
//         if (!response.ok) {
//             throw new Error(`Video upload failed: ${result.error.message}`);
//         }

//         return result.id;
//     } catch (error) {
//         console.error("Error uploading video:", error);
//         throw error;
//     }
// };

// // Function to create a video post on Facebook
// const createVideoPost = async (pageId, pageAccessToken, videoId) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 // message: caption, // Optional caption
//                 object_id: videoId, // Use the video ID here
//                 access_token: pageAccessToken,
//             }),
//         });

//         const postResult = await postResponse.json();

//         if (!postResponse.ok) {
//             throw new Error(`Video post creation failed: ${postResult.error.message}`);
//         }

//         console.log("Video post created successfully:", postResult);
//         return postResult.id; // Return the post ID
//     } catch (error) {
//         console.error("Error creating video post:", error);
//         throw error;
//     }
// };

const uploadVideoToFacebook = async (pageId, pageAccessToken, videoBuffer, caption = '') => {
    try {
        const formData = new FormData();
        formData.append("source", videoBuffer, {
            filename: "video.mp4", // Specify filename
            contentType: "video/mp4", // MIME type
        });
        formData.append("description", caption || '');
        formData.append("access_token", pageAccessToken);

        const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });


        const result = await response.json();
        if (!response.ok) {
            throw new Error(`Video upload failed: ${result.error.message}`);
        }

        return result.id;
    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
    finally {
        // Ensure cleanup after the upload
        // Cleanup any temporary resources here, like removing temp files if necessary
        // For example, remove files from server memory if stored
    }
};


// Function to create a video post on Facebook
const createVideoPost = async (pageId, pageAccessToken, videoId) => {
    try {
        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams({
                // message: caption,
                object_id: videoId, // Use the video ID here
                access_token: pageAccessToken,
            })

        });

        const postResult = await postResponse.json();

        if (!postResponse.ok) {
            throw new Error(`Video post creation failed: ${postResult.error.message}`);
        }

        console.log("Video post created successfully:", postResult);
        return postResult.id; // Return the post ID
    } catch (error) {
        console.error("Error creating video post:", error);
        throw error;
    }
    finally {
        // Cleanup temporary resources
    }
};

// Function to handle reels (treated similarly to videos)
const uploadReelToFacebook = async (pageId, pageAccessToken, videoBuffer, caption = '') => {
    try {
        // Use video_reels endpoint for uploading reels
        const formData = new FormData();
        formData.append('access_token', pageAccessToken);
        formData.append('description', caption);
        formData.append('source', videoBuffer, {
            filename: 'video.mp4',
            contentType: 'video/mp4',
        });

        const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/video_reels`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Error uploading reel: ${result.error.message}`);
        }

        console.log('Reel uploaded successfully, reelId:', result.id);
        return result.id; // Return the reel ID
    } catch (error) {
        console.error('Error uploading reel:', error);
        throw error;
    }
};

// Function to create a reel post on Facebook (if necessary)
const createReelPost = async (pageId, pageAccessToken, reelId) => {
    try {
        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams({
                object_id: reelId, // Use the reel ID for creating a post
                access_token: pageAccessToken,
                // message: caption || '', // Optional caption for the reel
            }),
        });

        const postResult = await postResponse.json();

        if (!postResponse.ok) {
            throw new Error(`Reel post creation failed: ${postResult.error.message}`);
        }

        console.log('Reel post created successfully:', postResult);
        return postResult.id; // Return the post ID
    } catch (error) {
        console.error('Error creating reel post:', error);
        throw error;
    }
};



// Optional: If Facebook requires a separate step for posting reels, add it here.


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

// Route to upload files and post to Facebook
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption, postType, reelId } = req.body;
    const files = req.files;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        // Fetch the page access token using the user's access token
        const pageAccessToken = await getPageAccessToken(accessToken, pageId);


        if (postType === 'feed') {
            // Handle photo upload for feed posts
            if (files && files.length > 0) {
                const photoIds = [];

                const uploadPromises = files.map(file => {
                    const formData = new FormData();
                    formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
                    formData.append('published', 'false');

                    return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${pageAccessToken}`, {
                        method: 'POST',
                        body: formData,
                        headers: formData.getHeaders(),
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (!result.id) {
                                throw new Error(`Photo upload failed: ${result.error.message}`);
                            }
                            photoIds.push({ media_fbid: result.id });
                        });
                });

                // Await all uploads
                await Promise.all(uploadPromises);

                // Create a single post attaching all photos
                const postData = {
                    attached_media: JSON.stringify(photoIds),
                    access_token: pageAccessToken,
                };
                if (caption) postData.message = caption;

                const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
                    method: 'POST',
                    body: new URLSearchParams(postData),
                    agent

                });

                const postResult = await postResponse.json();
                if (!postResponse.ok) {
                    throw new Error(`Failed to create post: ${postResult.error.message}`);
                }

                return res.json({ success: true, postId: postResult.id });
            } else {
                // If no files, just post the caption
                const postResult = await postMessageToFacebook(pageId, pageAccessToken, caption);
                return res.json({ result: postResult });
            }
        } else if (postType === 'videos') {
            if (files && files.length > 0) {
                const videoBuffer = files[0].buffer;

                // Send response to client immediately
                res.json({ success: true, message: 'Video upload started. The video will be posted shortly.' });

                // Run upload logic in the background
                (async () => {
                    try {
                        console.log('Starting video upload...');
                        const videoId = await uploadVideoToFacebook(pageId, pageAccessToken, videoBuffer, caption);
                        console.log('Video uploaded successfully, videoId:', videoId);

                        const postId = await createVideoPost(pageId, pageAccessToken, videoId, caption);
                        console.log('Post created successfully, postId:', postId);
                    } catch (error) {
                        console.error('Error during video upload or post creation:', error.message);
                        // You can add retry logic or save this error to a log for debugging
                    }
                    finally {
                        // Reset any temporary data related to video upload
                    }
                })();
            } else {
                return res.status(400).json({ error: 'Video file is required for video posts.' });
            }
        }
        else if (postType === 'reels') {
            if (files && files.length > 0) {
                const videoBuffer = files[0].buffer;

                // Send response to client immediately
                res.json({ success: true, message: 'Reel upload started. The reel will be posted shortly.' });

                // Run upload logic in the background
                (async () => {
                    try {
                        console.log('Starting reel upload...');
                        const videoId = await uploadReelToFacebook(pageId, pageAccessToken, videoBuffer, caption);
                        console.log('Reel uploaded successfully, videoId:', videoId);

                        const postId = await createReelPost(pageId, pageAccessToken, reelId);
                        console.log('Reel post created successfully, postId:', postId);
                    } catch (error) {
                        console.error('Error during reel upload or post creation:', error.message);
                        // You can add retry logic or save this error to a log for debugging
                    }
                    finally {
                        // Reset any temporary data related to video upload
                    }
                })();
            } else {
                return res.status(400).json({ error: 'Video file is required for reel posts.' });
            }
        }
        else {
            return res.status(400).json({ error: 'Invalid post type.' });
        }
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    } finally {
        // Cleanup after the whole process
        // For example, reset database entries if necessary
    }
});

module.exports = router;

// const express = require('express');
// const fetch = require('node-fetch');
// const fs = require('fs'); // File system module
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// const https = require('https');

// require('dotenv').config();

// const agent = new https.Agent({
//     rejectUnauthorized: true, // Ensures the SSL certificate is validated
//     secureProtocol: 'TLSv1_2_method', // Force TLS v1.2
// });


// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, pageAccessToken, message) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 message,
//                 access_token: pageAccessToken,
//             }),
//             agent,
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(`Failed to create post: ${postResult.error.message}`);
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };
// const uploadVideoToFacebook = async (pageId, pageAccessToken, videoBuffer, caption = '') => {
//     try {
//         const formData = new FormData();
//         formData.append("source", videoBuffer, {
//             filename: "video.mp4", // Specify filename
//             contentType: "video/mp4", // MIME type
//         });
//         formData.append("description", caption || '');
//         formData.append("access_token", pageAccessToken);

//         const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
//             method: 'POST',
//             body: formData,
//             headers: formData.getHeaders(),
//         });


//         const result = await response.json();
//         if (!response.ok) {
//             throw new Error(`Video upload failed: ${result.error.message}`);
//         }

//         return result.id;
//     } catch (error) {
//         console.error("Error uploading video:", error);
//         throw error;
//     }
//     finally {
//         // Ensure cleanup after the upload
//         // Cleanup any temporary resources here, like removing temp files if necessary
//         // For example, remove files from server memory if stored
//     }
// };


// // Function to create a video post on Facebook
// const createVideoPost = async (pageId, pageAccessToken, videoId) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 // message: caption,
//                 object_id: videoId, // Use the video ID here
//                 access_token: pageAccessToken,
//             })

//         });

//         const postResult = await postResponse.json();

//         if (!postResponse.ok) {
//             throw new Error(`Video post creation failed: ${postResult.error.message}`);
//         }

//         console.log("Video post created successfully:", postResult);
//         return postResult.id; // Return the post ID
//     } catch (error) {
//         console.error("Error creating video post:", error);
//         throw error;
//     }
//     finally {
//         // Cleanup temporary resources
//     }
// };

// // Function to handle reels (treated similarly to videos)
// const uploadReelToFacebook = async (pageId, pageAccessToken, videoBuffer, filename, caption) => {
//     const formData = new FormData();
//     formData.append('source', videoBuffer, { filename, contentType: 'video/mp4' });
//     formData.append('published', 'false');
//     if (caption) formData.append('description', caption);

//     const uploadResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/videos?access_token=${pageAccessToken}`, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(),
//     });

//     const uploadResult = await uploadResponse.json();
//     if (!uploadResponse.ok) {
//         throw new Error(`Reel upload failed: ${uploadResult.error.message}`);
//     }
//     return uploadResult.id;
// };

// // Get page access token using user access token
// const getPageAccessToken = async (userAccessToken, pageId) => {
//     try {
//         const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${userAccessToken}`);
//         const result = await response.json();

//         if (result.error) {
//             throw new Error(`Error fetching page access token: ${result.error.message}`);
//         }

//         return result.access_token;
//     } catch (error) {
//         console.error('Error fetching page access token:', error);
//         throw error;
//     }
// };

// // Route to upload files and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption, postType, videoPath } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         // Fetch the page access token using the user's access token
//         const pageAccessToken = await getPageAccessToken(accessToken, pageId);


//         if (postType === 'feed') {
//             // Handle photo upload for feed posts
//             if (files && files.length > 0) {
//                 const photoIds = [];

//                 const uploadPromises = files.map(file => {
//                     const formData = new FormData();
//                     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                     formData.append('published', 'false');

//                     return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${pageAccessToken}`, {
//                         method: 'POST',
//                         body: formData,
//                         headers: formData.getHeaders(),
//                     })
//                         .then(response => response.json())
//                         .then(result => {
//                             if (!result.id) {
//                                 throw new Error(`Photo upload failed: ${result.error.message}`);
//                             }
//                             photoIds.push({ media_fbid: result.id });
//                         });
//                 });

//                 // Await all uploads
//                 await Promise.all(uploadPromises);

//                 // Create a single post attaching all photos
//                 const postData = {
//                     attached_media: JSON.stringify(photoIds),
//                     access_token: pageAccessToken,
//                 };
//                 if (caption) postData.message = caption;

//                 const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                     method: 'POST',
//                     body: new URLSearchParams(postData),
//                     agent

//                 });

//                 const postResult = await postResponse.json();
//                 if (!postResponse.ok) {
//                     throw new Error(`Failed to create post: ${postResult.error.message}`);
//                 }

//                 return res.json({ success: true, postId: postResult.id });
//             } else {
//                 // If no files, just post the caption
//                 const postResult = await postMessageToFacebook(pageId, pageAccessToken, caption);
//                 return res.json({ result: postResult });
//             }
//         } else if (postType === 'videos') {
//             if (files && files.length > 0) {
//                 const videoBuffer = files[0].buffer;

//                 // Send response to client immediately
//                 res.json({ success: true, message: 'Video upload started. The video will be posted shortly.' });

//                 // Run upload logic in the background
//                 (async () => {
//                     try {
//                         console.log('Starting video upload...');
//                         const videoId = await uploadVideoToFacebook(pageId, pageAccessToken, videoBuffer, caption);
//                         console.log('Video uploaded successfully, videoId:', videoId);

//                         const postId = await createVideoPost(pageId, pageAccessToken, videoId, caption);
//                         console.log('Post created successfully, postId:', postId);
//                     } catch (error) {
//                         console.error('Error during video upload or post creation:', error.message);
//                         // You can add retry logic or save this error to a log for debugging
//                     }
//                     finally {
//                         // Reset any temporary data related to video upload
//                     }
//                 })();
//             } else {
//                 return res.status(400).json({ error: 'Video file is required for video posts.' });
//             }
//         }
//         else if (postType === 'reels') {
//             // Handle reel upload (similar to video upload)bbbbbbbb
//             if (files && files.length > 0) {
//                 const video = files[0]; // Assuming only one reel video is uploaded
//                 const reelId = await uploadReelToFacebook(pageId, pageAccessToken, video.buffer, video.originalname, caption);

//                 // Post the reel to the page
//                 const postResult = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                     method: 'POST',
//                     body: new URLSearchParams({
//                         message: caption,
//                         attached_media: JSON.stringify([{ media_fbid: reelId }]),
//                         access_token: pageAccessToken,
//                     }),
//                     agent,

//                 });

//                 const postData = await postResult.json();
//                 if (!postResult.ok) {
//                     throw new Error(`Reel post failed: ${postData.error.message}`);
//                 }

//                 return res.json({ success: true, postId: postData.id });
//             } else {
//                 return res.status(400).json({ error: 'Reel video file is required for reel posts.' });
//             }
//         } else {
//             return res.status(400).json({ error: 'Invalid post type.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     } finally {
//         // Cleanup after the whole process
//         // For example, reset database entries if necessary
//     }
// });

// module.exports = router;


// _______________________________________________________________.


// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, accessToken, message) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 message,
//                 access_token: accessToken,
//             }),
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(`Failed to create post: ${postResult.error.message}`);
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };

// // Function to upload a video to Facebook
// const uploadVideoToFacebook = async (pageId, accessToken, file, message) => {
//     const formData = new FormData();
//     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     formData.append('caption', message); // Optional caption
//     formData.append('access_token', accessToken);

//     try {
//         const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
//             method: 'POST',
//             body: formData,
//             headers: formData.getHeaders(),
//         });

//         const result = await response.json();
//         if (!response.ok) {
//             throw new Error(`Video upload failed: ${result.error.message}`);
//         }
//         return result;
//     } catch (error) {
//         console.error('Error uploading video to Facebook:', error);
//         throw error;
//     }
// };

// // Route to upload files (images or videos) and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         if (files && files.length > 0) {
//             // const postData = { access_token: accessToken };

//             // Check each file type (video or image)
//             const uploadPromises = files.map(file => {
//                 if (file.mimetype.startsWith('video/')) {
//                     // If the file is a video, upload it
//                     return uploadVideoToFacebook(pageId, accessToken, file, caption);
//                 } else if (file.mimetype.startsWith('image/')) {
//                     // If the file is an image, upload it
//                     const formData = new FormData();
//                     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                     formData.append('published', 'false');

//                     return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${accessToken}`, {
//                         method: 'POST',
//                         body: formData,
//                         headers: formData.getHeaders(),
//                     })
//                         .then(response => response.json())
//                         .then(result => {
//                             if (!result.id) {
//                                 throw new Error(`Photo upload failed: ${result.error.message}`);
//                             }
//                             return { media_fbid: result.id };
//                         });
//                 }
//             });

//             // Await all uploads
//             const mediaResults = await Promise.all(uploadPromises);

//             // Create a post attaching all media
//             const postData = {
//                 attached_media: JSON.stringify(mediaResults.filter(result => result).map(result => result.media_fbid)),
//                 access_token: accessToken,
//             };
//             if (caption) postData.message = caption;

//             const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                 method: 'POST',
//                 body: new URLSearchParams(postData),
//             });

//             const postResult = await postResponse.json();
//             if (!postResponse.ok) {
//                 throw new Error(`Failed to create post: ${postResult.error.message}`);
//             }

//             return res.json({ success: true, postId: postResult.id });
//         } else if (caption) {
//             // Only caption without images or videos
//             const postResult = await postMessageToFacebook(pageId, accessToken, caption);
//             return res.json({ result: postResult });
//         } else {
//             return res.status(400).json({ error: 'Either files or a caption is required.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// module.exports = router;

// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Helper function to handle Facebook API requests
// const handleFacebookRequest = async (url, options) => {
//     const response = await fetch(url, options);
//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(result.error?.message || 'Failed Facebook API request');
//     }
//     return result;
// };

// // Function to upload files (image or video) to Facebook
// const uploadFileToFacebook = async (pageId, accessToken, file, isVideo, caption) => {
//     const formData = new FormData();
//     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     if (caption && isVideo) formData.append('caption', caption); // Caption for videos only
//     formData.append('access_token', accessToken);

//     const url = isVideo
//         ? `https://graph-video.facebook.com/v21.0/${pageId}/videos`
//         : `https://graph.facebook.com/v21.0/${pageId}/photos?published=false`;

//     const response = await fetch(url, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(),
//     });

//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(`Upload failed: ${result.error.message}`);
//     }

//     return isVideo ? { video_id: result.id } : { media_fbid: result.id };
// };

// // Route to upload files and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         let mediaResults = [];

//         if (files && files.length > 0) {
//             // Process files (video or image)
//             mediaResults = await Promise.all(
//                 files.map(file => {
//                     const isVideo = file.mimetype.startsWith('video/');
//                     return uploadFileToFacebook(pageId, accessToken, file, isVideo, caption);
//                 })
//             );
//         }

//         // Prepare post data, adding media if available
//         const postData = {
//             access_token: accessToken,
//             attached_media: JSON.stringify(mediaResults.filter(result => result).map(result => result.media_fbid || result.video_id))
//         };
//         if (caption) postData.message = caption;

//         // Send the final post request
//         const postUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
//         const postResponse = await handleFacebookRequest(postUrl, {
//             method: 'POST',
//             body: new URLSearchParams(postData),
//         });

//         return res.json({ success: true, postId: postResponse.id });
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// module.exports = router;



// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.use(cors({
//     origin: 'https://smpfe.netlify.app',
//     methods: ['POST'],
//     credentials: true
// }));

// const handleFacebookRequest = async (url, options) => {
//     const response = await fetch(url, options);
//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(result.error?.message || 'Failed Facebook API request');
//     }
//     return result;
// };

// const uploadFileToFacebook = async (pageId, accessToken, file, isVideo, caption) => {
//     const formData = new FormData();
//     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//     if (caption && isVideo) formData.append('caption', caption);
//     formData.append('access_token', accessToken);

//     const url = isVideo
//         ? `https://graph-video.facebook.com/v21.0/${pageId}/videos`
//         : `https://graph.facebook.com/v21.0/${pageId}/photos?published=false`;

//     const response = await fetch(url, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(),
//     });

//     const result = await response.json();
//     if (!response.ok) {
//         throw new Error(`Upload failed: ${result.error.message}`);
//     }

//     return isVideo ? { video_id: result.id } : { media_fbid: result.id };
// };

// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         const mediaResults = await Promise.all(
//             files.map(file => {
//                 const isVideo = file.mimetype.startsWith('video/');
//                 return uploadFileToFacebook(pageId, accessToken, file, isVideo, caption);
//             })
//         );

//         const postData = {
//             access_token: accessToken,
//             attached_media: JSON.stringify(mediaResults.map(result => result.media_fbid || result.video_id))
//         };
//         if (caption) postData.message = caption;

//         const postUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
//         const postResponse = await handleFacebookRequest(postUrl, {
//             method: 'POST',
//             body: new URLSearchParams(postData),
//         });

//         res.json({ success: true, postId: postResponse.id });
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// module.exports = router;








// const express = require('express');
// const fetch = require('node-fetch');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Import AWS SDK for S3
// const app = express();

// const router = express.Router();
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 100 * 1024 * 1024 } // Adjust as needed, here 100MB
// });

// // Configure the S3 client
// const s3Client = new S3Client({
//     region: 'us-east-1', // Replace with your AWS region
//     credentials: {
//         accessKeyId: 'AKIAZPPGAA7WPICT4356',  // Store in environment variables
//         secretAccessKey: 'kA1y/vXN1MNlXXYqAmqP5s6+xkT7aUrpXVi5F9Ab' // Store in environment variables
//     }
// });

// // Function to upload files to S3 and get URLs
// const uploadFilesToS3 = async (files) => {
//     const fileUrls = [];

//     for (const file of files) {
//         const params = {
//             Bucket: 'smpbe',  // Replace with your actual S3 bucket name
//             Key: `uploads/${Date.now()}_${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype
//             // ACL: 'public-read'
//         };

//         // Upload file to S3
//         const command = new PutObjectCommand(params);
//         await s3Client.send(command);

//         // Get the URL of the uploaded file
//         const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
//         fileUrls.push(fileUrl);
//     }

//     return fileUrls;
// };

// // Upload file to Facebook (image/video)
// const uploadFileToFacebook = async (pageId, accessToken, fileUrl, isVideo, caption) => {
//     const formData = new FormData();
//     formData.append('url', fileUrl); // Use S3 file URL instead of file.buffer
//     formData.append('access_token', accessToken);

//     // Add description for videos if caption is provided
//     if (isVideo && caption) {
//         formData.append('description', caption);
//     }

//     const url = isVideo
//         ? `https://graph-video.facebook.com/v21.0/${pageId}/videos`
//         : `https://graph.facebook.com/v21.0/${pageId}/photos?published=false`;

//     const response = await fetch(url, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//         throw new Error(result.error.message || 'Upload to Facebook failed');
//     }

//     // Return media_fbid for images or video_id for videos
//     return isVideo ? { video_id: result.id } : { media_fbid: result.id };
// };

// // Function to handle uploading videos and images in sequence
// const uploadFilesSequentially = async (files, pageId, accessToken, caption) => {
//     const videoResults = [];
//     const imageResults = [];

//     // Upload each file
//     for (const file of files) {
//         const fileUrl = file.url;  // This assumes the file is already uploaded to S3 and you have the URL.

//         if (file.mimetype.startsWith('video/')) {
//             // Upload video
//             const videoResult = await uploadFileToFacebook(pageId, accessToken, fileUrl, true, caption);
//             videoResults.push(videoResult);
//         } else if (file.mimetype.startsWith('image/')) {
//             // Upload image
//             const imageResult = await uploadFileToFacebook(pageId, accessToken, fileUrl, false, caption);
//             imageResults.push(imageResult);
//         }
//     }

//     return { videoResults, imageResults };
// };

// // Route for uploading media
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         // Step 1: Upload files to S3 and get URLs
//         const fileUrls = await uploadFilesToS3(files);

//         // Prepare files with URLs to upload to Facebook
//         const filesWithUrls = files.map((file, index) => ({
//             ...file,
//             url: fileUrls[index],
//         }));

//         // Step 2: Upload files to Facebook using URLs
//         const { videoResults, imageResults } = await uploadFilesSequentially(filesWithUrls, pageId, accessToken, caption);

//         // Prepare the attached media for Facebook post
//         const attachedMedia = [];

//         // Add images to the post data
//         imageResults.forEach(result => attachedMedia.push({ media_fbid: result.media_fbid }));

//         // Add videos to the post data (one per post)
//         videoResults.forEach(result => attachedMedia.push({ media_fbid: result.video_id }));

//         const postData = {
//             access_token: accessToken,
//             attached_media: JSON.stringify(attachedMedia),
//         };

//         if (caption) postData.message = caption;

//         // Create a post on Facebook feed with images and videos
//         const postUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
//         const postResponse = await fetch(postUrl, {
//             method: 'POST',
//             body: new URLSearchParams(postData),
//         });

//         const postResult = await postResponse.json();

//         if (!postResponse.ok) {
//             throw new Error(postResult.error.message || 'Failed to post to Facebook feed');
//         }

//         res.json({ success: true, postId: postResult.id });
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });

// module.exports = router;


// const express = require('express');
// const fetch = require('node-fetch');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const router = express.Router();

// // Middleware Configuration
// app.use(express.json({ limit: '600mb' }));
// app.use(express.urlencoded({ limit: '600mb', extended: true }));
// app.use((req, res, next) => {
//     res.setTimeout(700000, () => { // 700 seconds timeout
//         console.log('Request timed out');
//         res.status(408).send('Request Timeout');
//     });
//     next();
// });

// router.use(cors({
//     origin: 'https://smpfe.netlify.app',
//     methods: ['POST'],
//     credentials: true
// }));

// // Helper function to check if a URL is a video
// const isVideo = (url) => {
//     return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi');
// };

// const getFileSize = async (fileUrl) => {
//     const response = await fetch(fileUrl, { method: 'HEAD' });
//     const fileSize = response.headers.get('content-length');
//     if (!fileSize) {
//         throw new Error('Unable to fetch file size for the video.');
//     }
//     return parseInt(fileSize, 10);
// };

// // Resumable Video Upload Implementation
// const uploadVideoResumably = async (pageId, accessToken, fileUrl, caption) => {
//     const fileSize = await getFileSize(fileUrl);

//     const startResumableUpload = async () => {
//         const url = `https://graph-video.facebook.com/v21.0/${pageId}/videos`;
//         const params = new URLSearchParams({
//             access_token: accessToken,
//             upload_phase: 'start',
//             file_size: fileSize
//         });

//         const response = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
//         const result = await response.json();
//         if (!response.ok) throw new Error(`Failed to start upload: ${result.error?.message}`);
//         return result;
//     };

//     // Define transferChunk function
//     const transferChunk = async (uploadSessionId, startOffset, endOffset, fileUrl) => {
//         const fileStream = await fetch(fileUrl);
//         const chunk = fileStream.body.slice(startOffset, endOffset);

//         const formData = new FormData();
//         formData.append('upload_session_id', uploadSessionId);
//         formData.append('start_offset', startOffset);
//         formData.append('video_file_chunk', chunk);

//         const url = `https://graph-video.facebook.com/v21.0/${pageId}/videos`;
//         const response = await fetch(url, {
//             method: 'POST',
//             body: formData,
//             headers: formData.getHeaders()
//         });

//         const result = await response.json();
//         if (!response.ok) throw new Error(`Failed to upload chunk: ${result.error?.message}`);
//         return result;
//     };

//     const transferChunkWithRetry = async (uploadSessionId, startOffset, endOffset, retries = 3) => {
//         for (let attempt = 1; attempt <= retries; attempt++) {
//             try {
//                 return await transferChunk(uploadSessionId, startOffset, endOffset, fileUrl);
//             } catch (error) {
//                 console.log(`Retrying chunk upload (Attempt ${attempt}/${retries})...`);
//                 if (attempt === retries) throw error;
//                 await new Promise(resolve => setTimeout(resolve, attempt * 2000)); // Exponential backoff
//             }
//         }
//     };

//     const finishResumableUpload = async (uploadSessionId) => {
//         const url = `https://graph-video.facebook.com/v21.0/${pageId}/videos`;
//         const params = new URLSearchParams({
//             access_token: accessToken,
//             upload_phase: 'finish',
//             upload_session_id: uploadSessionId
//         });

//         const response = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
//         const result = await response.json();
//         if (!response.ok) throw new Error(`Failed to finish upload: ${result.error?.message}`);
//         return result;
//     };

//     try {
//         const startResponse = await startResumableUpload();
//         let { upload_session_id, start_offset, end_offset } = startResponse;

//         while (parseInt(start_offset) < parseInt(end_offset)) {
//             const transferResponse = await transferChunkWithRetry(upload_session_id, start_offset, end_offset);
//             start_offset = transferResponse.start_offset;
//             end_offset = transferResponse.end_offset;
//         }

//         const finishResponse = await finishResumableUpload(upload_session_id);
//         return { video_id: finishResponse.video_id };
//     } catch (error) {
//         console.error('Error during upload:', error.message);
//         throw error;
//     }
// };

// // Image Upload Implementation
// const uploadImage = async (pageId, accessToken, fileUrl, caption) => {
//     const formData = new FormData();
//     formData.append('url', fileUrl);
//     formData.append('access_token', accessToken);

//     if (caption) {
//         formData.append('caption', caption);
//     }

//     const url = `https://graph.facebook.com/v21.0/${pageId}/photos`;

//     const response = await fetch(url, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders()
//     });

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.error.message || 'Failed to upload image');
//     return { media_fbid: result.id };
// };

// // Upload Media Route
// router.post('/upload', async (req, res) => {
//     const { accessToken, pageId, caption, mediaUrls } = req.body;

//     if (!accessToken || !pageId || !mediaUrls || mediaUrls.length === 0) {
//         return res.status(400).json({ error: 'Missing required fields: accessToken, pageId, mediaUrls' });
//     }

//     try {
//         const uploadPromises = mediaUrls.map(async (url) => {
//             const isVideoFile = isVideo(url);
//             if (isVideoFile) {
//                 return uploadVideoResumably(pageId, accessToken, url, caption);
//             } else {
//                 return uploadImage(pageId, accessToken, url, caption);
//             }
//         });

//         const results = await Promise.all(uploadPromises);

//         const attachedMedia = results.map(result => {
//             return result.video_id
//                 ? { media_fbid: result.video_id }
//                 : { media_fbid: result.media_fbid };
//         });

//         const postData = {
//             access_token: accessToken,
//             attached_media: JSON.stringify(attachedMedia),
//             message: caption
//         };

//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams(postData)
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) throw new Error(postResult.error.message || 'Failed to post on Facebook');

//         res.json({ success: true, postId: postResult.id });
//     } catch (error) {
//         console.error('Error during upload:', error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;

// --------------------------------------------------------
// const express = require('express');
// const fetch = require('node-fetch');
// const FormData = require('form-data');
// const cors = require('cors');
// require('dotenv').config();

// const router = express.Router();

// // Middleware Configuration
// router.use(express.json({ limit: '600mb' }));
// router.use(express.urlencoded({ limit: '600mb', extended: true }));
// router.use(cors({
//     origin: 'https://smpfe.netlify.app',
//     methods: ['POST'],
//     credentials: true,
// }));

// // Helper function to check if a URL is a video
// const isVideo = (url) => url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi');

// // Video Upload Implementation
// const uploadVideo = async (pageId, accessToken, fileUrl, caption) => {
//     const formData = new FormData();
//     formData.append('file_url', fileUrl);
//     formData.append('access_token', accessToken);
//     if (caption) formData.append('description', caption);

//     const url = `https://graph-video.facebook.com/v21.0/${pageId}/videos`;
//     const response = await fetch(url, { method: 'POST', body: formData });
//     const result = await response.json();

//     if (!response.ok) throw new Error(result.error.message || 'Failed to upload video');
//     return { video_id: result.id };
// };

// // Image Upload Implementation
// const uploadImage = async (pageId, accessToken, fileUrl, caption) => {
//     const formData = new FormData();
//     formData.append('url', fileUrl);
//     formData.append('access_token', accessToken);
//     if (caption) formData.append('caption', caption);

//     const url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
//     const response = await fetch(url, { method: 'POST', body: formData });
//     const result = await response.json();

//     if (!response.ok) throw new Error(result.error.message || 'Failed to upload image');
//     return { media_fbid: result.id };
// };

// // Upload Media and Post to Facebook Route
// router.post('/upload', async (req, res) => {
//     const { accessToken, pageId, caption, mediaUrls } = req.body;

//     if (!accessToken || !pageId || !mediaUrls || mediaUrls.length === 0) {
//         return res.status(400).json({ error: 'Missing required fields: accessToken, pageId, mediaUrls' });
//     }

//     try {
//         const uploadPromises = mediaUrls.map(async (url) => {
//             if (isVideo(url)) {
//                 return uploadVideo(pageId, accessToken, url, caption);
//             } else {
//                 return uploadImage(pageId, accessToken, url, caption);
//             }
//         });

//         const results = await Promise.all(uploadPromises);

//         const attachedMedia = results.map(result => ({
//             media_fbid: result.video_id || result.media_fbid,
//         }));

//         const postData = {
//             access_token: accessToken,
//             attached_media: JSON.stringify(attachedMedia),
//             message: caption,
//         };

//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams(postData),
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) throw new Error(postResult.error.message || 'Failed to post on Facebook');

//         res.json({ success: true, postId: postResult.id });
//     } catch (error) {
//         console.error('Error during upload:', error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;



// -----------------------------------------working code for s3 but facebook reject the urls
// Required modules
// const express = require('express');
// const fetch = require('node-fetch');
// const fs = require('fs');
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// const { setTimeout } = require('timers/promises');
// const https = require('https');
// https.globalAgent.options.minVersion = 'TLSv1.2';

// require('dotenv').config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Helper function: Retry mechanism with exponential backoff
// const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//         try {
//             const controller = new AbortController();
//             const timeout = setTimeout(() => controller.abort(), 15000); // 15-second timeout
//             const response = await fetch(url, { ...options, signal: controller.signal });
//             clearTimeout(timeout);
//             if (!response.ok) {
//                 if (response.status >= 500 || response.status === 429) {
//                     throw new Error(`Recoverable error: ${response.statusText}`);
//                 }
//             }
//             return response;
//         } catch (error) {
//             if (attempt === retries || error.name === 'AbortError') {
//                 throw error; // Final failure or non-retryable error
//             }
//             console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
//             await setTimeout(delay);
//             delay *= 2; // Exponential backoff
//         }
//     }
// };

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, pageAccessToken, message) => {
//     try {
//         const postResponse = await fetchWithRetry(
//             `https://graph.facebook.com/v21.0/${pageId}/feed`,
//             {
//                 method: 'POST',
//                 body: new URLSearchParams({
//                     message,
//                     access_token: pageAccessToken,
//                 }),
//             }
//         );

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(`Failed to create post: ${postResult.error.message}`);
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };
// const waitForVideoProcessing = async (pageAccessToken, videoId) => {
//     const maxRetries = 10; // Maximum number of retries
//     const delay = 5000; // Delay between retries in milliseconds (5 seconds)

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//         console.log(`Checking video status (attempt ${attempt})...`);

//         const statusResponse = await fetch(
//             `https://graph.facebook.com/v21.0/${videoId}?fields=status&access_token=${pageAccessToken}`
//         );

//         const statusResult = await statusResponse.json();
//         console.log("Video status response:", statusResult);

//         if (statusResult.status && statusResult.status.video_status === "ready") {
//             console.log("Video processing complete.");
//             return;
//         }

//         if (attempt === maxRetries) {
//             throw new Error("Video processing timed out.");
//         }

//         console.log("Video still processing. Retrying...");
//         await new Promise((resolve) => setTimeout(resolve, delay));
//     }
// };

// const uploadVideoToFacebook = async (pageId, pageAccessToken, videoUrl, caption) => {
//     try {
//         const formData = new FormData();
//         formData.append("file_url", videoUrl); // Use the pre-signed S3 URL
//         formData.append("description", caption);
//         formData.append("access_token", pageAccessToken);

//         console.log("Uploading video...");
//         const response = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();
//         console.log("Video upload response:", result);

//         if (!response.ok) {
//             console.error("Upload failed with error:", result.error);
//             throw new Error(result.error.message);
//         }

//         const videoId = result.id;

//         // Wait for video processing
//         console.log("Waiting for video processing...");
//         await waitForVideoProcessing(pageId, pageAccessToken, videoId);

//         return videoId;
//     } catch (error) {
//         console.error("Error uploading video:", error.message);
//         throw error;
//     }
// };

// const createVideoPost = async (pageId, pageAccessToken, videoId) => {
//     try {
//         const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 object_id: videoId, // Use the video ID here
//                 access_token: pageAccessToken,
//             }),
//         });

//         const postResult = await postResponse.json();
//         console.log("Video post creation response:", postResult);

//         if (!postResponse.ok) {
//             throw new Error(`Video post creation failed: ${postResult.error.message}`);
//         }

//         console.log("Video post created successfully:", postResult);
//         return postResult.id; // Return the post ID
//     } catch (error) {
//         console.error("Error creating video post:", error);
//         throw error;
//     }
// };

// // Get page access token using user access token
// const getPageAccessToken = async (userAccessToken, pageId) => {
//     try {
//         const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${userAccessToken}`);
//         const result = await response.json();

//         if (result.error) {
//             throw new Error(`Error fetching page access token: ${result.error.message}`);
//         }

//         return result.access_token;
//     } catch (error) {
//         console.error('Error fetching page access token:', error);
//         throw error;
//     }
// };

// // Other functions (uploadVideoToFacebook, createVideoPost, etc.)
// // Add fetchWithRetry to all Facebook API calls

// // Route to handle uploads and respond quickly for long tasks
// router.post('/upload', upload.none(), async (req, res) => {
//     const { accessToken, pageId, caption, postType, fileUrls } = req.body; // Accept file URLs instead of files
//     console.log("Received Request Body:", req.body);

//     // Validate input
//     if (!accessToken || !pageId) {
//         console.error("Missing required fields: accessToken or pageId");
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     if (postType === 'feed' && (!fileUrls || (Array.isArray(fileUrls) && fileUrls.length === 0) || typeof fileUrls === 'string')) {
//         console.error("Missing file URLs for feed post.");
//         return res.status(400).json({ error: 'File URLs are required for feed posts.' });
//     }

//     try {
//         // Get page access token
//         console.log(`Fetching page access token for page ID: ${pageId}`);
//         const pageAccessToken = await getPageAccessToken(accessToken, pageId);
//         console.log(`Page access token received: ${pageAccessToken}`);

//         if (postType === 'feed') {
//             // Handle post with images/videos from file URLs
//             const photoIds = [];
//             const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls]; // Handle single URL or array of URLs

//             if (urls && urls.length > 0) {
//                 console.log(`Uploading photos with file URLs: ${JSON.stringify(urls)}`);
//                 const uploadPromises = urls.map((fileUrl) => {
//                     const formData = new FormData();
//                     formData.append('image_url', fileUrl); // Use the correct image_url field
//                     formData.append('published', 'false'); // Ensure it isn't posted immediately

//                     return fetch(`https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${pageAccessToken}`, {
//                         method: 'POST',
//                         body: formData,
//                     })
//                         .then((response) => response.json())
//                         .then((result) => {
//                             if (!result.id) {
//                                 throw new Error(`Photo upload failed: ${result.error.message}`);
//                             }
//                             photoIds.push({ media_fbid: result.id });
//                         })
//                         .catch((error) => {
//                             console.error('Error uploading photo:', error);
//                             throw error;
//                         });
//                 });

//                 await Promise.all(uploadPromises);
//                 console.log("Photo uploads successful. Photo IDs:", photoIds);

//                 // Create post with attached media (photos)
//                 const postData = {
//                     attached_media: JSON.stringify(photoIds),
//                     access_token: pageAccessToken,
//                 };
//                 if (caption) postData.message = caption;

//                 console.log("Posting to Facebook feed with data:", postData);
//                 const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                     method: 'POST',
//                     body: new URLSearchParams(postData),
//                 });

//                 const postResult = await postResponse.json();
//                 if (!postResponse.ok) {
//                     console.error("Failed to create post:", postResult.error);
//                     throw new Error(`Failed to create post: ${postResult.error.message}`);
//                 }

//                 console.log("Post successful. Post ID:", postResult.id);
//                 return res.json({ success: true, postId: postResult.id });
//             } else {
//                 // If no files, post just the message
//                 console.log("No file URLs provided. Posting message only.");
//                 const postResult = await postMessageToFacebook(pageId, pageAccessToken, caption || ""); // Post message without file
//                 console.log("Message posted successfully. Post ID:", postResult.id);
//                 return res.json({ success: true, postId: postResult.id });
//             }
//         } else if (postType === 'videos') {
//             // Handle video upload (if a file is provided, proceed with video upload)
//             if (req.files && req.files.length > 0) {
//                 console.log("Uploading video file:", req.files[0].originalname);
//                 const videoBuffer = req.files[0].buffer;

//                 // Respond immediately, video upload is in progress
//                 res.status(202).json({ message: 'Processing video upload. Check back later for status.' });

//                 try {
//                     const videoId = await uploadVideoToFacebook(pageId, pageAccessToken, videoBuffer, caption);
//                     console.log(`Video upload successful. Video ID: ${videoId}`);
//                     const postId = await createVideoPost(pageId, pageAccessToken, videoId);
//                     console.log(`Video post successful. Post ID: ${postId}`);
//                 } catch (backgroundError) {
//                     console.error('Background task failed:', backgroundError);
//                 }
//                 return;
//             } else {
//                 console.error("Video file is required for video posts.");
//                 return res.status(400).json({ error: 'Video file is required for video posts.' });
//             }
//         } else if (postType === 'reels') {
//             // Handle reel upload (similar to video upload)
//             if (req.files && req.files.length > 0) {
//                 console.log("Uploading reel video file:", req.files[0].originalname);
//                 const video = req.files[0]; // Assuming only one reel video is uploaded
//                 const reelId = await uploadReelToFacebook(pageId, pageAccessToken, video.buffer, video.originalname, caption);

//                 const postResult = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
//                     method: 'POST',
//                     body: new URLSearchParams({
//                         message: caption,
//                         attached_media: JSON.stringify([{ media_fbid: reelId }]),
//                         access_token: pageAccessToken,
//                     }),
//                 });

//                 const postData = await postResult.json();
//                 if (!postResult.ok) {
//                     console.error("Reel post failed:", postData.error);
//                     throw new Error(`Reel post failed: ${postData.error.message}`);
//                 }

//                 console.log("Reel post successful. Post ID:", postData.id);
//                 return res.json({ success: true, postId: postData.id });
//             } else {
//                 console.error("Reel video file is required for reel posts.");
//                 return res.status(400).json({ error: 'Reel video file is required for reel posts.' });
//             }
//         } else {
//             console.error("Invalid post type:", postType);
//             return res.status(400).json({ error: 'Invalid post type.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     }
// });




// module.exports = router;









// const express = require('express');
// const fetch = require('node-fetch');
// const fs = require('fs'); // File system module
// const multer = require('multer');
// const FormData = require('form-data');
// const cors = require('cors');
// const https = require('https');

// require('dotenv').config();

// const agent = new https.Agent({
//     rejectUnauthorized: true, // Ensures the SSL certificate is validated
//     secureProtocol: 'TLSv1_2_method', // Force TLS v1.2
// });


// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // CORS setup
// router.use(cors({
//     origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
//     methods: ['POST'],
//     credentials: true
// }));

// // Function to post a message to Facebook
// const postMessageToFacebook = async (pageId, pageAccessToken, message) => {
//     try {
//         const postResponse = await fetch(https://graph.facebook.com/v21.0/${pageId}/feed, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 message,
//                 access_token: pageAccessToken,
//             }),
//             agent,
//         });

//         const postResult = await postResponse.json();
//         if (!postResponse.ok) {
//             throw new Error(Failed to create post: ${postResult.error.message});
//         }
//         return postResult;
//     } catch (error) {
//         console.error('Error posting message to Facebook:', error);
//         throw error;
//     }
// };
// const uploadVideoToFacebook = async (pageId, pageAccessToken, videoBuffer, caption = '') => {
//     try {
//         const formData = new FormData();
//         formData.append("source", videoBuffer, {
//             filename: "video.mp4", // Specify filename
//             contentType: "video/mp4", // MIME type
//         });
//         formData.append("description", caption || '');
//         formData.append("access_token", pageAccessToken);

//         const response = await fetch(https://graph-video.facebook.com/v21.0/${pageId}/videos, {
//             method: 'POST',
//             body: formData,
//             headers: formData.getHeaders(),
//         });


//         const result = await response.json();
//         if (!response.ok) {
//             throw new Error(Video upload failed: ${result.error.message});
//         }

//         return result.id;
//     } catch (error) {
//         console.error("Error uploading video:", error);
//         throw error;
//     }
//     finally {
//         // Ensure cleanup after the upload
//         // Cleanup any temporary resources here, like removing temp files if necessary
//         // For example, remove files from server memory if stored
//     }
// };


// // Function to create a video post on Facebook
// const createVideoPost = async (pageId, pageAccessToken, videoId) => {
//     try {
//         const postResponse = await fetch(https://graph.facebook.com/v21.0/${pageId}/feed, {
//             method: 'POST',
//             body: new URLSearchParams({
//                 // message: caption,
//                 object_id: videoId, // Use the video ID here
//                 access_token: pageAccessToken,
//             })

//         });

//         const postResult = await postResponse.json();

//         if (!postResponse.ok) {
//             throw new Error(Video post creation failed: ${postResult.error.message});
//         }

//         console.log("Video post created successfully:", postResult);
//         return postResult.id; // Return the post ID
//     } catch (error) {
//         console.error("Error creating video post:", error);
//         throw error;
//     }
//     finally {
//         // Cleanup temporary resources
//     }
// };

// // Function to handle reels (treated similarly to videos)
// const uploadReelToFacebook = async (pageId, pageAccessToken, videoBuffer, filename, caption) => {
//     const formData = new FormData();
//     formData.append('source', videoBuffer, { filename, contentType: 'video/mp4' });
//     formData.append('published', 'false');
//     if (caption) formData.append('description', caption);

//     const uploadResponse = await fetch(https://graph.facebook.com/v21.0/${pageId}/videos?access_token=${pageAccessToken}, {
//         method: 'POST',
//         body: formData,
//         headers: formData.getHeaders(),
//     });

//     const uploadResult = await uploadResponse.json();
//     if (!uploadResponse.ok) {
//         throw new Error(Reel upload failed: ${uploadResult.error.message});
//     }
//     return uploadResult.id;
// };

// // Get page access token using user access token
// const getPageAccessToken = async (userAccessToken, pageId) => {
//     try {
//         const response = await fetch(https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${userAccessToken});
//         const result = await response.json();

//         if (result.error) {
//             throw new Error(Error fetching page access token: ${result.error.message});
//         }

//         return result.access_token;
//     } catch (error) {
//         console.error('Error fetching page access token:', error);
//         throw error;
//     }
// };

// // Route to upload files and post to Facebook
// router.post('/upload', upload.array('files', 10), async (req, res) => {
//     const { accessToken, pageId, caption, postType, videoPath } = req.body;
//     const files = req.files;

//     if (!accessToken || !pageId) {
//         return res.status(400).json({ error: 'Access token and page ID are required.' });
//     }

//     try {
//         // Fetch the page access token using the user's access token
//         const pageAccessToken = await getPageAccessToken(accessToken, pageId);


//         if (postType === 'feed') {
//             // Handle photo upload for feed posts
//             if (files && files.length > 0) {
//                 const photoIds = [];

//                 const uploadPromises = files.map(file => {
//                     const formData = new FormData();
//                     formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
//                     formData.append('published', 'false');

//                     return fetch(https://graph.facebook.com/v21.0/${pageId}/photos?access_token=${pageAccessToken}, {
//                         method: 'POST',
//                         body: formData,
//                         headers: formData.getHeaders(),
//                     })
//                         .then(response => response.json())
//                         .then(result => {
//                             if (!result.id) {
//                                 throw new Error(Photo upload failed: ${result.error.message});
//                             }
//                             photoIds.push({ media_fbid: result.id });
//                         });
//                 });

//                 // Await all uploads
//                 await Promise.all(uploadPromises);

//                 // Create a single post attaching all photos
//                 const postData = {
//                     attached_media: JSON.stringify(photoIds),
//                     access_token: pageAccessToken,
//                 };
//                 if (caption) postData.message = caption;

//                 const postResponse = await fetch(https://graph.facebook.com/v21.0/${pageId}/feed, {
//                     method: 'POST',
//                     body: new URLSearchParams(postData),
//                     agent

//                 });

//                 const postResult = await postResponse.json();
//                 if (!postResponse.ok) {
//                     throw new Error(Failed to create post: ${postResult.error.message});
//                 }

//                 return res.json({ success: true, postId: postResult.id });
//             } else {
//                 // If no files, just post the caption
//                 const postResult = await postMessageToFacebook(pageId, pageAccessToken, caption);
//                 return res.json({ result: postResult });
//             }
//         } else if (postType === 'videos') {
//             if (files && files.length > 0) {
//                 const videoBuffer = files[0].buffer;

//                 // Send response to client immediately
//                 res.json({ success: true, message: 'Video upload started. The video will be posted shortly.' });

//                 // Run upload logic in the background
//                 (async () => {
//                     try {
//                         console.log('Starting video upload...');
//                         const videoId = await uploadVideoToFacebook(pageId, pageAccessToken, videoBuffer, caption);
//                         console.log('Video uploaded successfully, videoId:', videoId);

//                         const postId = await createVideoPost(pageId, pageAccessToken, videoId, caption);
//                         console.log('Post created successfully, postId:', postId);
//                     } catch (error) {
//                         console.error('Error during video upload or post creation:', error.message);
//                         // You can add retry logic or save this error to a log for debugging
//                     }
//                     finally {
//                         // Reset any temporary data related to video upload
//                     }
//                 })();
//             } else {
//                 return res.status(400).json({ error: 'Video file is required for video posts.' });
//             }
//         }
//         else if (postType === 'reels') {
//             // Handle reel upload (similar to video upload)bbbbbbbb
//             if (files && files.length > 0) {
//                 const video = files[0]; // Assuming only one reel video is uploaded
//                 const reelId = await uploadReelToFacebook(pageId, pageAccessToken, video.buffer, video.originalname, caption);

//                 // Post the reel to the page
//                 const postResult = await fetch(https://graph.facebook.com/v21.0/${pageId}/feed, {
//                     method: 'POST',
//                     body: new URLSearchParams({
//                         message: caption,
//                         attached_media: JSON.stringify([{ media_fbid: reelId }]),
//                         access_token: pageAccessToken,
//                     }),
//                     agent,

//                 });

//                 const postData = await postResult.json();
//                 if (!postResult.ok) {
//                     throw new Error(Reel post failed: ${postData.error.message});
//                 }

//                 return res.json({ success: true, postId: postData.id });
//             } else {
//                 return res.status(400).json({ error: 'Reel video file is required for reel posts.' });
//             }
//         } else {
//             return res.status(400).json({ error: 'Invalid post type.' });
//         }
//     } catch (error) {
//         console.error('Error during upload:', error);
//         res.status(500).json({ error: 'Upload failed', details: error.message });
//     } finally {
//         // Cleanup after the whole process
//         // For example, reset database entries if necessary
//     }
// });

// module.exports = router;