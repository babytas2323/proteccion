// Test script to verify full integration between Cloudinary and Firebase
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Load environment variables
dotenv.config();

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

// Test full integration
const testFullIntegration = async () => {
  try {
    console.log('Testing full integration between Cloudinary and Firebase...');
    
    // Step 1: Upload image to Cloudinary
    console.log('Step 1: Uploading image to Cloudinary...');
    const testImageBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    const formData = new FormData();
    formData.append('file', new Blob([testImageBuffer], { type: 'image/gif' }), 'integration-test-image.gif');
    formData.append('upload_preset', 'accident_reports_preset');
    formData.append('folder', 'accident_reports');
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Image uploaded to Cloudinary successfully!');
    console.log('Image URL:', uploadResult.secure_url);
    
    // Step 2: Save data to Firebase with image URL
    console.log('Step 2: Saving data to Firebase...');
    const testData = {
      nombre: "Test de Integración Completa",
      municipio: "Tetela de Ocampo",
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().split(' ')[0],
      tipo: "Prueba de Integración",
      descripcion: "Prueba para verificar la integración completa entre Cloudinary y Firebase",
      coordenadas: [-97.8096, 19.8116],
      nivel_riesgo: "medium",
      afectados: 0,
      localidad: "Test Location",
      telefono: "2221234567",
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "accidents"), testData);
    console.log('✅ Data saved to Firebase successfully!');
    console.log('Document ID:', docRef.id);
    
    // Step 3: Retrieve data from Firebase
    console.log('Step 3: Retrieving data from Firebase...');
    const q = query(collection(db, "accidents"), orderBy("createdAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('No documents found in Firebase');
    }
    
    const retrievedDoc = querySnapshot.docs[0];
    const retrievedData = retrievedDoc.data();
    console.log('✅ Data retrieved from Firebase successfully!');
    console.log('Retrieved document ID:', retrievedDoc.id);
    console.log('Retrieved image URL:', retrievedData.imageUrl);
    
    // Step 4: Verify image URL matches
    if (retrievedData.imageUrl === uploadResult.secure_url) {
      console.log('✅ Image URL matches between Cloudinary and Firebase!');
    } else {
      console.log('❌ Image URL mismatch!');
      console.log('Cloudinary URL:', uploadResult.secure_url);
      console.log('Firebase URL:', retrievedData.imageUrl);
    }
    
    // Step 5: Cleanup - Delete test document
    console.log('Step 4: Cleaning up test data...');
    await deleteDoc(docRef);
    console.log('✅ Test data cleaned up successfully!');
    
    console.log('\n🎉 ¡Integración completa verificada con éxito!');
    console.log('La aplicación puede:');
    console.log('1. Cargar imágenes a Cloudinary');
    console.log('2. Guardar datos en Firebase con la URL de la imagen');
    console.log('3. Recuperar datos de Firebase con la URL de la imagen');
    console.log('4. Limpiar datos de prueba');
    
  } catch (error) {
    console.error('Error in full integration test:', error);
  }
};

testFullIntegration();