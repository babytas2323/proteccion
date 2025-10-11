import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test ping to Cloudinary
    const pingResponse = await cloudinary.api.ping();
    console.log('Cloudinary ping response:', pingResponse);
    
    // Test folder creation (this will create the folder if it doesn't exist)
    const foldersResponse = await cloudinary.api.root_folders();
    console.log('Cloudinary folders response:', foldersResponse);
    
    console.log('Cloudinary connection test completed successfully!');
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error);
  }
};

testCloudinary();