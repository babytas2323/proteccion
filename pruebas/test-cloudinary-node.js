import dotenv from 'dotenv';
import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromSync } from 'fetch-blob/from.js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Test Cloudinary upload using Node.js
const testCloudinaryNode = async () => {
  try {
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('test-image.gif', testImageBuffer);
    console.log('Test image created.');
    
    // Create form data using formdata-node
    const formData = new FormData();
    
    // Add image file using fileFromSync
    const imageFile = fileFromSync('test-image.gif', 'image/gif');
    formData.append('image', imageFile);
    
    console.log('Sending request to Cloudinary upload endpoint...');
    
    // Send request to backend Cloudinary upload endpoint
    const response = await fetch('http://localhost:3004/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image: ${response.statusText} - ${errorText}`);
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

testCloudinaryNode();