
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
const axios = require('axios');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CORS setup
router.use(cors({
    origin: 'https://smpfe.netlify.app', // Replace with your frontend URL
    methods: ['POST'],
    credentials: true
}));

// Function to post a message to Facebook (for general post)
const postMessageToFacebook = async (pageId, accessToken, message) => {
    try {
        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams({
                message,
                access_token: accessToken,
            }),
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

// Function to upload a video to Facebook
const uploadVideoToFacebook = async (pageId, accessToken, videoBuffer, filename, caption) => {
    const formData = new FormData();
    formData.append('source', videoBuffer, { filename, contentType: 'video/mp4' });
    formData.append('published', 'false');

    try {
        const videoResponse = await fetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos?access_token=${accessToken}`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });

        const videoResult = await videoResponse.json();
        if (!videoResponse.ok) {
            throw new Error(`Video upload failed: ${videoResult.error.message}`);
        }

        // Now create a post with video ID
        const postData = {
            message: caption,
            attached_media: JSON.stringify([{ media_fbid: videoResult.id }]),
            access_token: accessToken,
        };

        const postResponse = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
            method: 'POST',
            body: new URLSearchParams(postData),
        });

        const postResult = await postResponse.json();
        if (!postResponse.ok) {
            throw new Error(`Failed to create post with video: ${postResult.error.message}`);
        }

        return postResult;
    } catch (error) {
        console.error('Error uploading video to Facebook:', error);
        throw error;
    }
};

// Function to upload a single photo to Facebook
async function uploadPhotoToFacebook({ accessToken, pageId, photoBuffer, caption }) {
    if (!accessToken || !pageId || !photoBuffer) {
        throw new Error('Missing required parameters: accessToken, pageId, or photoBuffer');
    }

    const url = `https://graph.facebook.com/v21.0/${pageId}/photos`;
    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('caption', caption || ''); // Caption is optional
    formData.append('source', photoBuffer, 'photo.jpg'); // Default filename
    formData.append('published', 'false'); // Prevent immediate publishing

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Photo upload response:', response.data);
        return response.data.id; // Return only the photo ID
    } catch (error) {
        console.error('Error uploading photo:', error.response?.data || error.message);
        throw error;
    }
}

// Function to upload multiple photos and get their media IDs
async function uploadMultiplePhotosAndGetMediaIds({ accessToken, pageId, files }) {
    if (!accessToken || !pageId || !files || files.length === 0) {
        throw new Error('Missing required parameters: accessToken, pageId, or files');
    }

    const mediaIds = [];

    for (const file of files) {
        try {
            console.log(`Uploading photo: ${file.originalname}, size: ${file.size} bytes`);

            const photoId = await uploadPhotoToFacebook({
                accessToken,
                pageId,
                photoBuffer: file.buffer,
                caption: '', // Add caption if needed
            });

            mediaIds.push(photoId);
            console.log(`Uploaded photo ID: ${photoId} for ${file.originalname}`);
        } catch (err) {
            console.error(`Failed to upload photo: ${file.originalname}. Error: ${err.response?.data || err.message}`);
        }

        // Optional delay to prevent hitting rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('Finished uploading all photos. Media IDs:', mediaIds);
    return mediaIds;
}

// Function to create a post with multiple media IDs
async function createPostWithMediaIds({ accessToken, pageId, mediaIds, message }) {
    if (!accessToken || !pageId || mediaIds.length === 0) {
        throw new Error('Missing required parameters: accessToken, pageId, or mediaIds');
    }

    const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const attachedMedia = mediaIds.map((id) => ({ media_fbid: id }));

    try {
        const response = await axios.post(
            url,
            {
                access_token: accessToken,
                message: message || 'Check out these photos!',
                attached_media: attachedMedia,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Created post response:', response.data);
        return response.data.id; // Return the Post ID
    } catch (error) {
        console.error('Error creating post:', error.response?.data || error.message);
        throw error;
    }
}



// Function to upload photos to Facebook


// const uploadPhotosToFacebook = async (pageId, accessToken, files, caption) => {
//     console.log('Uploading photos to Facebook...');
//     console.log('Page ID:', pageId);
//     console.log('Access Token:', accessToken);
//     console.log('Number of files:', files.length);

//     try {
//         // Upload all files using Promise.all to ensure proper handling
//         const uploadPromises = files.map((file, index) => {
//             console.log(`Processing file ${index + 1}/${files.length}: ${file.originalname}`);

//             const form = new FormData();
//             form.append('access_token', accessToken);
//             form.append('caption', caption || ''); // Default caption if none provided
//             form.append('source', file.buffer, { filename: file.originalname });

//             return axios.post(
//                 `https://graph.facebook.com/${pageId}/photos`,
//                 form,
//                 {
//                     headers: form.getHeaders(), // Ensure correct multipart headers
//                 }
//             )
//                 .then(response => {
//                     console.log(`File ${file.originalname} uploaded successfully. Response:`, response.data);
//                     return response.data;
//                 })
//                 .catch(err => {
//                     console.error(`Error uploading file ${file.originalname}:`, err.message);
//                     throw new Error(`File ${file.originalname} upload failed: ${err.response?.data?.error?.message || err.message}`);
//                 });
//         });

//         // Wait for all uploads to finish
//         const results = await Promise.all(uploadPromises);
//         console.log('All files uploaded successfully:', results);

//         return { success: true, message: 'Photos uploaded successfully', results };
//     } catch (error) {
//         console.error('Error during photo upload:', error.message);
//         throw error; // Propagate error back for further handling
//     }
// };


//    


// Router for handling uploads
router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption, postType, message } = req.body; // `postType` differentiates video or image
    const files = req.files;

    // Log incoming request details
    console.log('Upload request received');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', files);

    // Validation for required fields
    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        console.log('Upload request received:', { pageId, postType, filesLength: files?.length });

        // Send an immediate response to prevent request timeout
        res.status(202).json({ message: 'Upload in progress' });

        // Process the upload asynchronously
        const result = await processUpload({ accessToken, pageId, caption, postType, files, message });
        console.log('Upload completed successfully:', result);
    } catch (error) {
        console.error('Error during initial request handling:', error.message);
    }
});

// Process upload function
const processUpload = async ({ accessToken, pageId, caption, postType, files, message }) => {
    console.log('Entered processUpload function');
    console.log('Processing upload:', { postType, files: files?.length });

    try {
        let result;

        // Ensure post type is provided
        if (!postType) {
            throw new Error('Post type is required.');
        }

        // Handle text-only posts
        if (postType === 'feed' && (!files || files.length === 0)) {
            console.log('Detected text-only post. Message:', message);

            result = await postMessageToFacebook(pageId, accessToken, message);
            console.log('Text post created successfully:', result);
            return result;
        }

        // Handle photo uploads
        if (postType === 'feed' && files && files.length > 0) {
            console.log('Photo upload detected. Files:', files.length);

            const mediaIds = await uploadMultiplePhotosAndGetMediaIds({
                accessToken,
                pageId,
                files,
            });

            if (mediaIds.length === 0) {
                throw new Error('No media IDs generated. Photo upload might have failed.');
            }

            const postId = await createPostWithMediaIds({
                accessToken,
                pageId,
                mediaIds,
                message,
            });

            console.log(`Successfully created photo post with ID: ${postId}`);
            return postId;
        }

        // Handle video uploads
        if (postType === 'videos' && files && files.length > 0) {
            console.log('Video upload detected. Files:', files.length);

            const videoFile = files[0]; // Assume single video file for now
            if (videoFile.mimetype !== 'video/mp4') {
                throw new Error('Only MP4 videos are supported for uploads.');
            }

            result = await uploadVideoToFacebook(
                pageId,
                accessToken,
                videoFile.buffer,
                videoFile.originalname,
                caption
            );

            console.log('Video uploaded successfully:', result);
            return result;
        }

        // Invalid post type or unsupported condition
        throw new Error('Invalid or unsupported post type or input.');
    } catch (error) {
        console.error('Error during upload processing:', error.message);
        throw error;
    }
};

module.exports = router;


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



