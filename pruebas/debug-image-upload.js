// Debug script for image upload issues
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug image upload
const debugImageUpload = async () => {
  try {
    console.log('=== Debugging Image Upload Issue ===');
    
    // Check environment variables
    console.log('1. Checking environment variables...');
    console.log('   Cloud name:', process.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('   API key exists:', !!process.env.VITE_CLOUDINARY_API_KEY);
    console.log('   API secret exists:', !!process.env.VITE_CLOUDINARY_API_SECRET);
    
    if (!process.env.VITE_CLOUDINARY_CLOUD_NAME) {
      console.log('   ❌ ERROR: VITE_CLOUDINARY_CLOUD_NAME is missing');
      return;
    }
    
    if (!process.env.VITE_CLOUDINARY_API_KEY) {
      console.log('   ❌ ERROR: VITE_CLOUDINARY_API_KEY is missing');
      return;
    }
    
    console.log('   ✅ Environment variables are present');
    
    // Create test image
    console.log('\n2. Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const testImageBlob = new Blob([testImageBuffer], { type: 'image/gif' });
    console.log('   ✅ Test image created');
    
    // Test 1: Try upload with preset
    console.log('\n3. Test 1: Upload with preset...');
    const formData1 = new FormData();
    formData1.append('file', testImageBlob, 'debug-test.gif');
    formData1.append('upload_preset', 'accident_reports_preset');
    formData1.append('folder', 'accident_reports');
    
    console.log('   Sending request to Cloudinary...');
    const response1 = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData1
      }
    );
    
    console.log('   Response status:', response1.status);
    console.log('   Response headers:', [...response1.headers.entries()]);
    
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('   ✅ Upload with preset successful!');
      console.log('   Image URL:', result1.secure_url);
    } else {
      const errorText1 = await response1.text();
      console.log('   ❌ Upload with preset failed:', errorText1);
      
      // Test 2: Try upload without preset
      console.log('\n4. Test 2: Upload without preset...');
      const formData2 = new FormData();
      formData2.append('file', testImageBlob, 'debug-test.gif');
      formData2.append('folder', 'accident_reports');
      
      console.log('   Sending request to Cloudinary...');
      const response2 = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData2
        }
      );
      
      console.log('   Response status:', response2.status);
      console.log('   Response headers:', [...response2.headers.entries()]);
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('   ✅ Upload without preset successful!');
        console.log('   Image URL:', result2.secure_url);
      } else {
        const errorText2 = await response2.text();
        console.log('   ❌ Upload without preset failed:', errorText2);
        
        // Test 3: Try with different preset name
        console.log('\n5. Test 3: Upload with default preset...');
        const formData3 = new FormData();
        formData3.append('file', testImageBlob, 'debug-test.gif');
        formData3.append('upload_preset', 'ml_default');
        formData3.append('folder', 'accident_reports');
        
        console.log('   Sending request to Cloudinary...');
        const response3 = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData3
          }
        );
        
        console.log('   Response status:', response3.status);
        console.log('   Response headers:', [...response3.headers.entries()]);
        
        if (response3.ok) {
          const result3 = await response3.json();
          console.log('   ✅ Upload with default preset successful!');
          console.log('   Image URL:', result3.secure_url);
        } else {
          const errorText3 = await response3.text();
          console.log('   ❌ Upload with default preset failed:', errorText3);
        }
      }
    }
    
    console.log('\n=== Debugging Complete ===');
    
  } catch (error) {
    console.error('Error in debug script:', error);
  }
};

debugImageUpload();