// Test script to try using Cloudinary's default preset
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test using default preset
const testDefaultPreset = async () => {
  try {
    console.log('Testing default preset upload...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Create FormData with default preset
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('upload_preset', 'ml_default'); // Cloudinary's default preset
    formData.append('folder', 'accident_reports');
    
    // Upload directly to Cloudinary
    console.log('Uploading image with default preset...');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('Upload response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Image uploaded successfully with default preset:', result.secure_url);
      console.log('Public ID:', result.public_id);
    } else {
      const errorText = await response.text();
      console.log('❌ Upload with default preset failed:', errorText);
      
      // Try without preset
      console.log('Trying upload without preset...');
      const formData2 = new FormData();
      formData2.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
      formData2.append('folder', 'accident_reports');
      
      const response2 = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData2
        }
      );
      
      console.log('Upload without preset response status:', response2.status);
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Image uploaded successfully without preset:', result2.secure_url);
      } else {
        const errorText2 = await response2.text();
        console.log('❌ Upload without preset also failed:', errorText2);
      }
    }
    
  } catch (error) {
    console.error('Error in default preset test:', error);
  }
};

testDefaultPreset();