// Final test script for Cloudinary upload
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Final Cloudinary test
const finalCloudinaryTest = async () => {
  try {
    console.log('Final Cloudinary upload test...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Try direct upload with API key (signed)
    const timestamp = Math.round(new Date().getTime() / 1000);
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('folder', 'accident_reports');
    formData.append('timestamp', timestamp);
    formData.append('api_key', process.env.VITE_CLOUDINARY_API_KEY);
    
    console.log('Attempting signed upload...');
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
      console.log('✅ Signed upload successful!');
      console.log('Image URL:', result.secure_url);
      console.log('Public ID:', result.public_id);
      
      console.log('\n🎉 Cloudinary is configured correctly!');
      console.log('The application can now upload images directly to Cloudinary');
      console.log('without needing to start any backend server.');
    } else {
      const errorText = await response.text();
      console.log('❌ Signed upload failed:', errorText);
      
      // Try unsigned upload as last resort
      console.log('Trying unsigned upload...');
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
      
      console.log('Unsigned upload response status:', response2.status);
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Unsigned upload successful!');
        console.log('Image URL:', result2.secure_url);
      } else {
        const errorText2 = await response2.text();
        console.log('❌ Unsigned upload also failed:', errorText2);
        console.log('Please check your Cloudinary account settings and credentials.');
      }
    }
    
  } catch (error) {
    console.error('Error in final Cloudinary test:', error);
  }
};

finalCloudinaryTest();