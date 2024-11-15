
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
const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();

const app = express();
const router = express.Router();

app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ limit: '600mb', extended: true }));
app.use((req, res, next) => {
    res.setTimeout(700000, () => {
        console.log('Request timed out');
        res.status(408).send('Request Timeout');
    });
    next();
});

router.use(cors({
    origin: 'https://smpfe.netlify.app',
    methods: ['POST'],
    credentials: true
}));

// Function to retry uploading to Facebook
const uploadFileToFacebookWithRetry = async (pageId, accessToken, fileUrl, isVideo, caption, retries = 3, retryDelay = 8000) => {
    const formData = new FormData();
    formData.append('url', fileUrl); // Using S3 file URL
    console.log(fileUrl);
    formData.append('access_token', accessToken);

    if (isVideo && caption) {
        formData.append('description', caption);
    }

    const url = isVideo
        ? `https://graph-video.facebook.com/v21.0/${pageId}/videos`
        : `https://graph.facebook.com/v21.0/${pageId}/photos?published=false`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log('Facebook API Response:', result); // Log the full response

        if (!response.ok) {
            throw new Error(result.error.message || 'Upload to Facebook failed');
        }

        return isVideo ? { video_id: result.id } : { media_fbid: result.id };
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying upload... Attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, retryDelay)); // Increased delay before retry
            return uploadFileToFacebookWithRetry(pageId, accessToken, fileUrl, isVideo, caption, retries - 1, retryDelay);
        } else {
            throw new Error(`Failed to upload after multiple attempts: ${error.message}`);
        }
    }
};

// Function to handle concurrent uploading of videos and images
const uploadFilesConcurrently = async (fileUrls, pageId, accessToken, caption) => {
    const uploadPromises = fileUrls.map(async (fileUrl) => {
        const isVideo = fileUrl.endsWith('.mp4'); // Adjust based on your file handling (consider file types)
        return uploadFileToFacebookWithRetry(pageId, accessToken, fileUrl, isVideo, caption);
    });

    return Promise.all(uploadPromises);
};

// Route for uploading media to Facebook
router.post('/upload', async (req, res) => {
    const { accessToken, pageId, caption, mediaUrls } = req.body; // `mediaUrls` are S3 URLs passed from frontend

    if (!accessToken || !pageId || !mediaUrls || !mediaUrls.length) {
        return res.status(400).json({ error: 'Access token, page ID, and media URLs are required.' });
    }

    try {
        // Handle files upload concurrently (images and videos)
        const uploadResults = await uploadFilesConcurrently(mediaUrls, pageId, accessToken, caption);

        // Prepare attached media for posting to Facebook
        const attachedMedia = uploadResults.map(result => {
            return result.video_id ? { media_fbid: result.video_id } : { media_fbid: result.media_fbid };
        });

        const postData = {
            access_token: accessToken,
            attached_media: JSON.stringify(attachedMedia),
        };

        if (caption) postData.message = caption;

        // Create a post on Facebook feed with images and videos
        const postUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
        const postResponse = await fetch(postUrl, {
            method: 'POST',
            body: new URLSearchParams(postData),
        });

        const postResult = await postResponse.json();

        if (!postResponse.ok) {
            throw new Error(postResult.error.message || 'Failed to post to Facebook feed');
        }

        res.json({ success: true, postId: postResult.id });
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

module.exports = router;







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
