// Test script to verify direct Firebase connection
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// Test Firebase connection
const testDirectFirebase = async () => {
  try {
    console.log('Testing direct Firebase connection...');
    
    // Add a test document
    console.log('Adding test document to Firebase...');
    const docRef = await addDoc(collection(db, "test"), {
      name: "Direct Firebase Test Document",
      timestamp: new Date(),
      message: "Firebase direct connection test"
    });
    
    console.log('Document added with ID:', docRef.id);
    
    // Read documents
    console.log('Reading documents from Firebase...');
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log(`Found ${querySnapshot.size} documents in test collection`);
    
    querySnapshot.forEach((doc) => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', doc.data());
    });
    
    console.log('Direct Firebase connection test completed successfully!');
    
  } catch (error) {
    console.error('Error in direct Firebase connection test:', error);
  }
};

testDirectFirebase();