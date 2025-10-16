// Test script to check Cloudinary upload presets
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test Cloudinary presets
const testCloudinaryPresets = async () => {
  try {
    console.log('Testing Cloudinary upload presets...');
    
    // First, try to list upload presets (requires API secret)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload_presets`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.VITE_CLOUDINARY_API_KEY}:${process.env.VITE_CLOUDINARY_API_SECRET}`).toString('base64')}`
        }
      }
    );
    
    if (!response.ok) {
      console.log('Unable to list presets (this is normal for unsigned requests)');
      console.log('Response status:', response.status);
      console.log('Response text:', await response.text());
    } else {
      const presets = await response.json();
      console.log('Available upload presets:', presets);
    }
    
    // Try uploading with unsigned request (no preset required)
    console.log('Testing unsigned upload...');
    
    // Create a simple test image (1x1 pixel GIF)
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const imageBlob = new Blob([testImageBuffer], { type: 'image/gif' });
    
    // Try direct unsigned upload
    const formData = new FormData();
    formData.append('file', imageBlob, 'test-image.gif');
    formData.append('folder', 'accident_reports_test');
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('Unsigned upload response status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('Unsigned upload successful:', result.secure_url);
    } else {
      const errorText = await uploadResponse.text();
      console.log('Unsigned upload failed:', errorText);
    }
    
  } catch (error) {
    console.error('Error in Cloudinary presets test:', error);
  }
};

testCloudinaryPresets();