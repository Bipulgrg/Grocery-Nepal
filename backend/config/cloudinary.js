const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Verify Cloudinary credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? 'Present' : 'Missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? 'Present' : 'Missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? 'Present' : 'Missing');
  throw new Error('Missing required Cloudinary credentials');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Test the configuration
cloudinary.config().cloud_name; // This will throw an error if not configured properly

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'recipe-images',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };