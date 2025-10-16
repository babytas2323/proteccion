import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Test image upload with real image
const testImageUploadWithAccident = async () => {
  try {
    // Create a simple test image (1x1 pixel GIF)
    console.log('Creating test image...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('test-image.gif', testImageBuffer);
    console.log('Test image created.');
    
    // Create form data
    const formData = new FormData();
    
    // Add accident data
    const accidentData = {
      nombre: "Incidente con Imagen",
      tipo: "Prueba de Imagen",
      descripcion: "Este es un incidente de prueba con imagen adjunta"
    };
    formData.append('accident', JSON.stringify(accidentData));
    
    // Add image file
    const imageFile = fs.readFileSync('test-image.gif');
    const imageBlob = new Blob([imageFile], { type: 'image/gif' });
    formData.append('image', imageBlob, 'test-image.gif');
    
    console.log('Sending request to backend...');
    
    // Send request to backend
    const response = await fetch('http://localhost:3004/api/accidents', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create accident: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Accident with image created successfully:', result);
    
    // Clean up test image
    fs.unlinkSync('test-image.gif');
    console.log('Test image cleaned up.');
    
  } catch (error) {
    console.error('Error creating accident with image:', error);
    
    // Clean up test image if it exists
    if (fs.existsSync('test-image.gif')) {
      fs.unlinkSync('test-image.gif');
    }
  }
};

testImageUploadWithAccident();