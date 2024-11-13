
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
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Increase the payload limit for file uploads
app.use(express.json({ limit: '100mb' })); // Set to an appropriate size
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // Adjusted to 100MB for larger uploads
});

router.use(cors({
    origin: 'https://smpfe.netlify.app',
    methods: ['POST'],
    credentials: true
}));

// Function to upload a single media file (image or video) to Facebook
const uploadFileToFacebook = async (pageId, accessToken, file, isVideo, caption) => {
    const formData = new FormData();
    formData.append('source', file.buffer, { filename: file.originalname, contentType: file.mimetype });
    formData.append('access_token', accessToken);

    // Add caption for video
    if (isVideo && caption) {
        formData.append('description', caption);
    }

    const url = isVideo
        ? `https://graph-video.facebook.com/v21.0/${pageId}/videos`
        : `https://graph.facebook.com/v21.0/${pageId}/photos?published=false`; // Photos set as unpublished

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error ? result.error.message : 'Upload failed');
    }

    return isVideo ? { video_id: result.id } : { media_fbid: result.id };
};

router.post('/upload', upload.array('files', 10), async (req, res) => {
    const { accessToken, pageId, caption } = req.body;
    const files = req.files;

    if (!accessToken || !pageId) {
        return res.status(400).json({ error: 'Access token and page ID are required.' });
    }

    try {
        // Separate files into images and videos
        const images = files.filter(file => file.mimetype.startsWith('image/'));
        const videos = files.filter(file => file.mimetype.startsWith('video/'));

        let imageFbIds = [];

        // Upload images first as unpublished
        if (images.length > 0) {
            imageFbIds = await Promise.all(
                images.map(image => uploadFileToFacebook(pageId, accessToken, image, false))
            );
        }

        // Upload video with caption
        let videoFbId = null;
        if (videos.length > 0) {
            const videoUpload = await uploadFileToFacebook(pageId, accessToken, videos[0], true, caption);
            videoFbId = videoUpload.video_id;
        }

        // Prepare attached_media
        const attachedMedia = [
            ...imageFbIds.map(image => ({ media_fbid: image.media_fbid })),
            ...(videoFbId ? [{ media_fbid: videoFbId }] : [])
        ];

        // Final post with attached media and caption
        const postData = {
            access_token: accessToken,
            attached_media: JSON.stringify(attachedMedia),
            message: caption || ''
        };

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



