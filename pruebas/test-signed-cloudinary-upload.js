// Test script for signed Cloudinary upload
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Function to generate signature for signed upload
const generateSignature = (paramsToSign, apiSecret) => {
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
};

// Test signed Cloudinary upload
const testSignedCloudinaryUpload = async () => {
  try {
    console.log('Testing signed Cloudinary upload...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Create parameters for signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      folder: 'accident_reports',
      timestamp: timestamp
    };
    
    // Generate signature
    const signature = generateSignature(paramsToSign, process.env.VITE_CLOUDINARY_API_SECRET);
    console.log('Generated signature:', signature);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('folder', 'accident_reports');
    formData.append('timestamp', timestamp);
    formData.append('api_key', process.env.VITE_CLOUDINARY_API_KEY);
    formData.append('signature', signature);
    
    // Upload directly to Cloudinary
    console.log('Uploading image to Cloudinary with signature...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('Upload response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image uploaded successfully:', result.secure_url);
      console.log('Public ID:', result.public_id);
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
    }
    
  } catch (error) {
    console.error('Error in signed Cloudinary upload test:', error);
  }
};

testSignedCloudinaryUpload();