// Script to verify Cloudinary configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify Cloudinary configuration
const verifyCloudinaryConfig = async () => {
  try {
    console.log('Verifying Cloudinary configuration...');
    
    // Check if environment variables are set
    console.log('Cloudinary Cloud Name:', process.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('Cloudinary API Key exists:', !!process.env.VITE_CLOUDINARY_API_KEY);
    console.log('Cloudinary API Secret exists:', !!process.env.VITE_CLOUDINARY_API_SECRET);
    
    if (!process.env.VITE_CLOUDINARY_CLOUD_NAME) {
      console.log('❌ Error: VITE_CLOUDINARY_CLOUD_NAME is not set');
      return;
    }
    
    if (!process.env.VITE_CLOUDINARY_API_KEY) {
      console.log('❌ Error: VITE_CLOUDINARY_API_KEY is not set');
      return;
    }
    
    if (!process.env.VITE_CLOUDINARY_API_SECRET) {
      console.log('❌ Error: VITE_CLOUDINARY_API_SECRET is not set');
      return;
    }
    
    // Test ping to Cloudinary
    console.log('Testing Cloudinary connection...');
    const pingResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/ping`,
      {
        method: 'GET'
      }
    );
    
    console.log('Ping response status:', pingResponse.status);
    
    if (pingResponse.ok) {
      const pingResult = await pingResponse.json();
      console.log('✅ Cloudinary connection successful:', pingResult);
    } else {
      const errorText = await pingResponse.text();
      console.log('❌ Cloudinary connection failed:', errorText);
    }
    
  } catch (error) {
    console.error('Error verifying Cloudinary configuration:', error);
  }
};

verifyCloudinaryConfig();