// Test script to verify direct Cloudinary upload without backend
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test direct Cloudinary upload
const testDirectCloudinaryUpload = async () => {
  try {
    console.log('Testing direct Cloudinary upload...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Create a Blob from the buffer
    const imageBlob = new Blob([testImageBuffer], { type: 'image/gif' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', imageBlob, 'test-image.gif');
    formData.append('upload_preset', 'ml_default'); // Using default upload preset
    formData.append('folder', 'accident_reports');
    
    // Upload directly to Cloudinary
    console.log('Uploading image directly to Cloudinary...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Image uploaded successfully:', result.secure_url);
    
    console.log('Direct Cloudinary upload test completed successfully!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
  } catch (error) {
    console.error('Error in direct Cloudinary upload test:', error);
  }
};

testDirectCloudinaryUpload();