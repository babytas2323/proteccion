// Test script to verify complete Firebase and Cloudinary integration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import fs from 'fs';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5JcNJ7G0wmK-5IulX0F56nwkKimVpaKQ",
  authDomain: "civil-8d47e.firebaseapp.com",
  projectId: "civil-8d47e",
  storageBucket: "civil-8d47e.firebasestorage.app",
  messagingSenderId: "659325927659",
  appId: "1:659325927659:web:1f2999916ea042e9e87eae",
  measurementId: "G-SLB8DRZXBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test complete integration
const testCompleteIntegration = async () => {
  try {
    console.log('Testing complete Firebase and Cloudinary integration...');
    
    // Step 1: Upload image to Cloudinary
    console.log('Step 1: Uploading image to Cloudinary...');
    
    // Create a simple test image (1x1 pixel GIF)
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    fs.writeFileSync('test-image.gif', testImageBuffer);
    console.log('Test image created.');
    
    const formData = new FormData();
    const imageFile = fs.readFileSync('test-image.gif');
    const imageBlob = new Blob([imageFile], { type: 'image/gif' });
    formData.append('image', imageBlob, 'test-image.gif');
    
    const uploadResponse = await fetch('http://localhost:3004/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('Image uploaded successfully:', uploadResult.url);
    
    // Step 2: Save accident data to Firebase with image URL
    console.log('Step 2: Saving accident data to Firebase...');
    
    const accidentData = {
      nombre: "Incidente de Prueba Integración",
      tipo: "Prueba de Integración",
      descripcion: "Este es un incidente de prueba para verificar la integración completa entre Firebase y Cloudinary",
      coordenadas: [0, 0],
      nivel_riesgo: "low",
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.public_id,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "accidents"), accidentData);
    console.log('Accident saved to Firebase with ID:', docRef.id);
    
    // Step 3: Read accident data from Firebase
    console.log('Step 3: Reading accident data from Firebase...');
    
    const querySnapshot = await getDocs(collection(db, "accidents"));
    console.log(`Found ${querySnapshot.size} documents in accidents collection`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.nombre === "Incidente de Prueba Integración") {
        console.log('Found test accident:');
        console.log('  ID:', doc.id);
        console.log('  Name:', data.nombre);
        console.log('  Image URL:', data.imageUrl);
      }
    });
    
    console.log('Complete integration test completed successfully!');
    
    // Clean up test image
    fs.unlinkSync('test-image.gif');
    console.log('Test image cleaned up.');
    
  } catch (error) {
    console.error('Error in complete integration test:', error);
    
    // Clean up test image if it exists
    if (fs.existsSync('test-image.gif')) {
      fs.unlinkSync('test-image.gif');
    }
  }
};

testCompleteIntegration();