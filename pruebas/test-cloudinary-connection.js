// Test script to verify Cloudinary connection and configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud name:', process.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('API key exists:', !!process.env.VITE_CLOUDINARY_API_KEY);
    console.log('API secret exists:', !!process.env.VITE_CLOUDINARY_API_SECRET);
    
    // Test ping to Cloudinary
    console.log('Testing Cloudinary ping...');
    const pingResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/ping`,
      {
        method: 'GET'
      }
    );
    
    console.log('Ping response status:', pingResponse.status);
    
    if (pingResponse.ok) {
      const pingResult = await pingResponse.json();
      console.log('Cloudinary ping result:', pingResult);
    } else {
      const errorText = await pingResponse.text();
      console.log('Cloudinary ping failed:', errorText);
    }
    
    // Test root folders
    console.log('Testing root folders access...');
    const foldersResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/folders`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.VITE_CLOUDINARY_API_KEY}:${process.env.VITE_CLOUDINARY_API_SECRET}`).toString('base64')}`
        }
      }
    );
    
    console.log('Folders response status:', foldersResponse.status);
    
    if (foldersResponse.ok) {
      const foldersResult = await foldersResponse.json();
      console.log('Cloudinary folders result:', foldersResult);
    } else {
      const errorText = await foldersResponse.text();
      console.log('Cloudinary folders access failed:', errorText);
    }
    
    console.log('Cloudinary connection test completed!');
    
  } catch (error) {
    console.error('Error in Cloudinary connection test:', error);
  }
};

testCloudinaryConnection();