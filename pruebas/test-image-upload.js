import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test image upload
const testImageUpload = async () => {
  try {
    console.log('Testing image upload to Cloudinary...');
    
    // Check if test image exists
    const testImagePath = './test-image.jpg';
    if (!fs.existsSync(testImagePath)) {
      console.log('Test image not found. Creating a simple test image...');
      
      // Create a simple test image (1x1 pixel GIF)
      const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      fs.writeFileSync(testImagePath, testImageBuffer);
      console.log('Test image created.');
    }
    
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'test_uploads',
      use_filename: true,
      unique_filename: false
    });
    
    console.log('Image uploaded successfully!');
    console.log('Secure URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    // Clean up uploaded image from Cloudinary
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Test image cleaned up from Cloudinary.');
    
    console.log('Image upload test completed successfully!');
  } catch (error) {
    console.error('Error testing image upload:', error);
  }
};

testImageUpload();