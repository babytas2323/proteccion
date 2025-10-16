// Working Cloudinary upload script (same approach as successful test)
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Working Cloudinary upload
const workingCloudinaryUpload = async () => {
  try {
    console.log('Working Cloudinary upload test...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Create parameters for signature (same as in working test)
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      folder: 'accident_reports',
      timestamp: timestamp
    };
    
    // Generate signature (same method as working test)
    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&');
    
    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + process.env.VITE_CLOUDINARY_API_SECRET)
      .digest('hex');
    
    console.log('Generated signature:', signature);
    
    // Create FormData (same as in working test)
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('folder', 'accident_reports');
    formData.append('timestamp', timestamp);
    formData.append('api_key', process.env.VITE_CLOUDINARY_API_KEY);
    formData.append('signature', signature);
    
    // Upload directly to Cloudinary (same as in working test)
    console.log('Uploading image to Cloudinary with signature...');
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
      console.log('✅ Image uploaded successfully:', result.secure_url);
      console.log('Public ID:', result.public_id);
      
      console.log('\n🎉 This approach works!');
      console.log('We need to implement this signature generation in the frontend.');
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
    }
    
  } catch (error) {
    console.error('Error in working Cloudinary upload test:', error);
  }
};

workingCloudinaryUpload();