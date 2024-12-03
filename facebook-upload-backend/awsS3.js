// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Import the S3Client and command for v3
// const express = require('express');
// const multer = require('multer'); // Import multer for handling file uploads
// const router = express.Router();
// const app = express();

// // Increase the payload size limit
// app.use(express.json({ limit: '50mb' })); // Adjust the limit as needed
// app.use(express.urlencoded({ limit: '50mb', extended: true })); // Adjust the limit as needed

// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 10 * 1024 * 1024 } // Limit to 10 MB per file
// });


// // Configure the S3 client
// const s3Client = new S3Client({
//     region: 'us-east-1', // Replace with your AWS region
//     credentials: {
//         accessKeyId: 'AKIAZPPGAA7WPICT4356',  // Store in environment variables
//         secretAccessKey: 'kA1y/vXN1MNlXXYqAmqP5s6+xkT7aUrpXVi5F9Ab' // Store in environment variables
//     }
// });

// // Set up multer to handle file uploads

// // Route to handle uploading files to S3
// router.post('/upload-to-s3', upload.array('files', 10), async (req, res) => {
//     const uploadedFiles = [];
//     const files = req.files;

//     if (!files || files.length === 0) {
//         return res.status(400).json({ message: 'No files uploaded.' });
//     }

//     try {
//         for (const file of files) {
//             const params = {
//                 Bucket: 'smpbe',  // Replace with your actual S3 bucket name
//                 Key: `uploads/${Date.now()}_${file.originalname}`,
//                 Body: file.buffer,
//                 ContentType: file.mimetype,
//                 // ACL: 'public-read'
//             };

//             // Create a new command for uploading
//             const command = new PutObjectCommand(params);
//             const uploadResult = await s3Client.send(command);
//             uploadedFiles.push(`https://${params.Bucket}.s3.amazonaws.com/${params.Key}`);
//         }

//         return res.status(200).json({ files: uploadedFiles });
//     } catch (error) {
//         console.error('Error uploading files to S3:', error);
//         return res.status(500).json({ message: 'Failed to upload files to S3', error: error.message });
//     }
// });

// module.exports = router;


const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // For S3 operations
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner'); // For generating pre-signed URLs
const multer = require('multer');
const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
    region: 'us-east-1', // Replace with your AWS region
    credentials: {
        accessKeyId: 'AKIAZPPGAA7WPICT4356', // Use environment variables
        secretAccessKey: 'kA1y/vXN1MNlXXYqAmqP5s6+xkT7aUrpXVi5F9Ab', // Use environment variables
    },
});

// Multer setup (only needed if handling files locally before upload)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Route to generate pre-signed URL
router.post('/generate-presigned-url', async (req, res) => {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
        return res.status(400).json({ message: 'File name and type are required.' });
    }

    const params = {
        Bucket: 'smpbe', // Replace with your bucket name
        Key: `uploads/${Date.now()}_${fileName}`,
        ContentType: fileType,
    };

    try {
        // Generate pre-signed URL
        const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand(params), { expiresIn: 3600 }); // 1 hour expiry
        const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
        res.status(200).json({ uploadUrl, fileUrl });
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        res.status(500).json({ message: 'Failed to generate pre-signed URL', error: error.message });
    }
});
module.exports = router;