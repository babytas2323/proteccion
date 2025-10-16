// Script to setup working Cloudinary configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup working configuration
const setupWorkingConfig = async () => {
  try {
    console.log('Setting up working Cloudinary configuration...');
    
    // Verify that we have the necessary environment variables
    const requiredVars = [
      'VITE_CLOUDINARY_CLOUD_NAME',
      'VITE_CLOUDINARY_API_KEY',
      'VITE_CLOUDINARY_API_SECRET'
    ];
    
    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        console.log(`❌ Missing environment variable: ${envVar}`);
        return;
      }
    }
    
    console.log('✅ All required environment variables are present');
    console.log('Cloud name:', process.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('API key exists:', !!process.env.VITE_CLOUDINARY_API_KEY);
    console.log('API secret exists:', !!process.env.VITE_CLOUDINARY_API_SECRET);
    
    // Test a simple signed upload to confirm everything works
    console.log('Testing signed upload...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('folder', 'accident_reports');
    formData.append('timestamp', timestamp);
    formData.append('api_key', process.env.VITE_CLOUDINARY_API_KEY);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('Test upload response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Signed upload test successful!');
      console.log('Image URL:', result.secure_url);
      console.log('Public ID:', result.public_id);
      
      console.log('\n🎉 Configuration is working correctly!');
      console.log('The application is now configured to upload images directly to Cloudinary');
      console.log('without needing to start any backend server.');
    } else {
      const errorText = await response.text();
      console.log('❌ Signed upload test failed:', errorText);
    }
    
  } catch (error) {
    console.error('Error setting up working configuration:', error);
  }
};

setupWorkingConfig();