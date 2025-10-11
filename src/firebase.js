// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
export default app;