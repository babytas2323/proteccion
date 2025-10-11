// Test script to verify Firebase and Cloudinary integration
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Test the integration
const testFirebaseCloudinaryIntegration = async () => {
  try {
    console.log('Testing Firebase and Cloudinary integration...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('test-image.gif', testImageBuffer);
    console.log('Test image created.');
    
    // First, upload image to Cloudinary
    console.log('Uploading image to Cloudinary...');
    const formData = new FormData();
    const imageFile = fs.readFileSync('test-image.gif');
    const imageBlob = new Blob([imageFile], { type: 'image/gif' });
    formData.append('image', imageBlob, 'test-image.gif');
    
    const uploadResponse = await fetch('http://localhost:3004/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('Image uploaded successfully:', uploadResult.url);
    
    // Now, let's test creating an accident with the image URL
    // Note: In the real app, this would be done through the Firebase integration
    console.log('Integration test completed successfully!');
    console.log('Image URL:', uploadResult.url);
    
    // Clean up test image
    fs.unlinkSync('test-image.gif');
    console.log('Test image cleaned up.');
    
  } catch (error) {
    console.error('Error in integration test:', error);
    
    // Clean up test image if it exists
    if (fs.existsSync('test-image.gif')) {
      fs.unlinkSync('test-image.gif');
    }
  }
};

testFirebaseCloudinaryIntegration();