const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // Import the S3Client and command for v3
const express = require('express');
const multer = require('multer'); // Import multer for handling file uploads
const router = express.Router();

// Configure the S3 client
const s3Client = new S3Client({
    region: 'US East (N. Virginia) us-east-1', // Replace with your AWS region
    credentials: {
        accessKeyId: 'AKIAZPPGAA7WPICT4356',  // Store in environment variables
        secretAccessKey: 'kA1y/vXN1MNlXXYqAmqP5s6+xkT7aUrpXVi5F9Ab' // Store in environment variables
    }
});

// Set up multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle uploading files to S3
router.post('/upload-to-s3', upload.array('files', 10), async (req, res) => {
    const uploadedFiles = [];
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    try {
        for (const file of files) {
            const params = {
                Bucket: 'smpbe',  // Replace with your actual S3 bucket name
                Key: `uploads/${Date.now()}_${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read'
            };

            // Create a new command for uploading
            const command = new PutObjectCommand(params);
            const uploadResult = await s3Client.send(command);
            uploadedFiles.push(`https://${params.Bucket}.s3.amazonaws.com/${params.Key}`);
        }

        return res.status(200).json({ files: uploadedFiles });
    } catch (error) {
        console.error('Error uploading files to S3:', error);
        return res.status(500).json({ message: 'Failed to upload files to S3' });
    }
});

module.exports = router;


