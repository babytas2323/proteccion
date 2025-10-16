// Test script to verify Cloudinary preset configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test Cloudinary preset
const testCloudinaryPreset = async () => {
  try {
    console.log('Testing Cloudinary preset configuration...');
    
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Create FormData with the preset we configured
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'test-image.gif');
    formData.append('upload_preset', 'accident_reports_preset');
    formData.append('folder', 'accident_reports');
    
    // Upload directly to Cloudinary using the preset
    console.log('Uploading image with preset...');
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
      console.log('✅ Image uploaded successfully with preset!');
      console.log('Image URL:', result.secure_url);
      console.log('Public ID:', result.public_id);
      
      console.log('\n🎉 ¡La configuración de Cloudinary está funcionando correctamente!');
      console.log('La aplicación ahora debería poder cargar imágenes sin problemas.');
    } else {
      const errorText = await response.text();
      console.log('❌ Upload with preset failed:', errorText);
      
      // Provide specific guidance based on the error
      if (errorText.includes('Upload preset not found')) {
        console.log('\nℹ️  Instrucciones:');
        console.log('1. Verifica que hayas creado el upload preset con el nombre exacto "accident_reports_preset"');
        console.log('2. Asegúrate de que el preset esté configurado como "Unsigned"');
        console.log('3. Confirma que el folder esté configurado como "accident_reports"');
      } else if (errorText.includes('Invalid credentials')) {
        console.log('\nℹ️  Instrucciones:');
        console.log('1. Verifica que las credenciales en tu archivo .env sean correctas');
        console.log('2. Asegúrate de que tengas una cuenta activa de Cloudinary');
      }
    }
    
  } catch (error) {
    console.error('Error in Cloudinary preset test:', error);
  }
};

testCloudinaryPreset();