import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Test direct image upload to Cloudinary endpoint
const testDirectCloudinaryUpload = async () => {
  try {
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('test-image.gif', testImageBuffer);
    console.log('Test image created.');
    
    // Create form data
    const formData = new FormData();
    
    // Add image file
    const imageFile = fs.readFileSync('test-image.gif');
    const imageBlob = new Blob([imageFile], { type: 'image/gif' });
    formData.append('image', imageBlob, 'test-image.gif');
    
    console.log('Sending request to Cloudinary upload endpoint...');
    
    // Send request to backend Cloudinary upload endpoint
    const response = await fetch('http://localhost:3004/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Image uploaded successfully:', result);
    
    // Clean up test image
    fs.unlinkSync('test-image.gif');
    console.log('Test image cleaned up.');
    
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Clean up test image if it exists
    if (fs.existsSync('test-image.gif')) {
      fs.unlinkSync('test-image.gif');
    }
  }
};

testDirectCloudinaryUpload();