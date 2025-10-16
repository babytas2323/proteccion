// Browser debug script for image upload issues
// This script is meant to be run in the browser console

// Function to debug image upload in browser
async function debugBrowserImageUpload() {
  try {
    console.log('=== Browser Debugging Image Upload Issue ===');
    
    // Check environment variables (in browser, we access them differently)
    console.log('1. Checking environment variables...');
    console.log('   VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('   VITE_CLOUDINARY_API_KEY exists:', !!import.meta.env.VITE_CLOUDINARY_API_KEY);
    
    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
      console.log('   ❌ ERROR: VITE_CLOUDINARY_CLOUD_NAME is missing');
      return;
    }
    
    console.log('   ✅ Environment variables are present');
    
    // Create test image (1x1 pixel GIF)
    console.log('\n2. Creating test image...');
    const testImageData = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const binary = atob(testImageData);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    const testImageBlob = new Blob([new Uint8Array(array)], { type: 'image/gif' });
    console.log('   ✅ Test image created');
    
    // Test 1: Try upload with preset
    console.log('\n3. Test 1: Upload with preset...');
    const formData1 = new FormData();
    formData1.append('file', testImageBlob, 'browser-debug-test.gif');
    formData1.append('upload_preset', 'accident_reports_preset');
    formData1.append('folder', 'accident_reports');
    
    console.log('   Sending request to Cloudinary...');
    const response1 = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData1
      }
    );
    
    console.log('   Response status:', response1.status);
    
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
      formData2.append('file', testImageBlob, 'browser-debug-test.gif');
      formData2.append('folder', 'accident_reports');
      
      console.log('   Sending request to Cloudinary...');
      const response2 = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData2
        }
      );
      
      console.log('   Response status:', response2.status);
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('   ✅ Upload without preset successful!');
        console.log('   Image URL:', result2.secure_url);
      } else {
        const errorText2 = await response2.text();
        console.log('   ❌ Upload without preset failed:', errorText2);
      }
    }
    
    console.log('\n=== Browser Debugging Complete ===');
    
  } catch (error) {
    console.error('Error in browser debug script:', error);
  }
}

// Export for use in browser
window.debugBrowserImageUpload = debugBrowserImageUpload;

console.log('Browser debug script loaded. Run debugBrowserImageUpload() in console to test.');