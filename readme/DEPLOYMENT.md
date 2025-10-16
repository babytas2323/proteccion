# Deployment Guide

This guide will help you deploy the Tetela Radar application with Firebase Firestore as the backend.

## Firebase Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter a project name (e.g., "tetela-radar")
4. Accept the terms and conditions
5. Click "Create project"

### 2. Register Your Web App

1. In the Firebase Console, click the web icon (</>) to register a new app
2. Enter an app nickname (e.g., "tetela-radar-web")
3. Check "Also set up Firebase Hosting for this app" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later

### 3. Enable Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in locked mode" (for production)
4. Click "Next"
5. Choose a location for your database
6. Click "Enable"

### 4. Configure Firebase in Your Application

1. Open `src/firebase.js` in your project
2. Replace the placeholder configuration with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Frontend Deployment

### Deploy to Vercel (Recommended)

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up

2. **Deploy**
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework Preset: Vite
     - Root Directory: Leave empty
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

3. **Environment Variables**
   - Add your Firebase configuration as environment variables in the project settings:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

### Deploy to Netlify

1. **Create a Netlify Account**
   - Go to [netlify.com](https://netlify.com) and sign up

2. **Deploy**
   - Click "New site from Git"
   - Connect to your GitHub repository
   - Configure settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Environment Variables**
   - Add your Firebase configuration as environment variables in the project settings

## Configuration After Deployment

1. **Update Firebase Configuration**
   After deploying your Firebase project, update the configuration in `src/firebase.js` or use environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

## Troubleshooting

### Common Issues

1. **Firebase Configuration Errors**
   - Make sure all configuration values are correct
   - Check that you've enabled Firestore Database
   - Verify that your security rules allow read/write access

2. **CORS Issues**
   Firebase Firestore doesn't have CORS issues since it's accessed directly from the client

3. **Network Errors**
   - Check your internet connection
   - Verify that your Firebase project is properly configured
   - Check the browser console for specific error messages

### Monitoring

- Check your Firebase Console for usage statistics
- Monitor Firestore reads/writes in the Firebase Console
- Check deployment logs on Vercel/Netlify for frontend issues

## Security Considerations

1. **Firestore Security Rules**
   For production, update your Firestore security rules in the Firebase Console:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /accidents/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

2. **Environment Variables**
   - Never commit sensitive configuration to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

## Scaling Considerations

1. **Firebase Free Tier Limitations**
   - Document reads: 50,000/day
   - Document writes: 20,000/day
   - Storage: 1GB
   - Consider upgrading for production use

2. **Data Structure**
   - The current implementation uses a simple "accidents" collection
   - For complex queries, consider adding indexes in Firestore

3. **Offline Support**
   - Firebase has built-in offline support
   - Data will sync automatically when connectivity is restored

## Maintenance

1. **Regular Updates**
   - Keep Firebase SDK updated
   - Monitor for security vulnerabilities
   - Test after updates

2. **Backup Strategy**
   - Firebase automatically backs up your data
   - For critical applications, consider exporting data regularly
   - Test restore procedures

This deployment guide should help you get your Tetela Radar application running in a production environment with Firebase Firestore as the backend.