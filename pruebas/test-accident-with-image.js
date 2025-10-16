import dotenv from 'dotenv';
import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromSync } from 'fetch-blob/from.js';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Test creating accident with image
const testAccidentWithImage = async () => {
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
      nombre: "Incidente con Imagen Real",
      tipo: "Prueba de Imagen Real",
      descripcion: "Este es un incidente de prueba con imagen adjunta real",
      coordenadas: [0, 0],
      nivel_riesgo: "low"
    };
    formData.append('accident', JSON.stringify(accidentData));
    
    // Add image file
    const imageFile = fileFromSync('test-image.gif', 'image/gif');
    formData.append('image', imageFile);
    
    console.log('Sending request to accident creation endpoint...');
    
    // Send request to backend accident creation endpoint
    const response = await fetch('http://localhost:3004/api/accidents', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create accident: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Accident with image created successfully:', result);
    
    // Verify that the accident has an imageUrl
    if (result.data && result.data.imageUrl) {
      console.log('Image URL found in accident data:', result.data.imageUrl);
    } else {
      console.log('No image URL found in accident data');
    }
    
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

testAccidentWithImage();