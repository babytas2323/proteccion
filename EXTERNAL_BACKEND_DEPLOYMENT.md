# External Backend Deployment Guide

This guide will help you deploy your backend API to Render so your Vercel frontend can connect to it.

## Prerequisites

1. A GitHub account
2. A Render account (free at https://render.com)

## Step 1: Prepare Your Code for Deployment

Make sure your repository includes these essential files:
- `server.js` (your main server file)
- `package.json` (with all dependencies)
- `render.yaml` (already created for you)

## Step 2: Deploy Backend to Render

1. **Sign up for Render**
   - Go to https://render.com and create a free account
   - Connect your GitHub account when prompted

2. **Create a New Web Service**
   - Click "New" → "Web Service"
   - Choose your repository (the one containing this project)
   - Configure the settings:
     - Name: `tetela-radar-backend` (or any name you prefer)
     - Region: Choose the one closest to your users
     - Branch: `main` (or whatever your default branch is)
     - Root Directory: Leave empty (root of repository)
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Instance Type: `Free`

3. **Advanced Settings**
   - Add environment variables if needed (optional for now)
   - Click "Create Web Service"

4. **Wait for Deployment**
   - Deployment will take 5-10 minutes
   - You'll see logs as the process runs
   - When complete, you'll get a URL like: `https://tetela-radar-backend-xxxx.onrender.com`

## Step 3: Update Your Frontend

1. Copy your new Render backend URL
2. Open `src/App.jsx` in your code editor
3. Find the `getApiBaseUrl()` function
4. Replace the return value with your Render backend URL:
   ```javascript
   const getApiBaseUrl = () => {
     // In development, use localhost
     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
       return 'http://localhost:3004';
     }
     
     // For production with external backend
     return 'https://your-render-backend-url.onrender.com'; // YOUR ACTUAL RENDER URL
   };
   ```

## Step 4: Redeploy Your Frontend

If you're using Vercel:
1. Commit and push your changes to GitHub
2. Vercel will automatically redeploy your site
3. Visit your site and test data saving

## Testing the Connection

1. Visit your frontend URL (https://proteccion-ten.vercel.app)
2. Open browser developer tools (F12)
3. Try to add a new incident
4. Check the console for any errors
5. Check the Network tab to see if API requests are successful

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Your backend already includes CORS configuration for Vercel
   - If you still get CORS errors, check that your Vercel URL is included in the CORS configuration in `server.js`

2. **404 Errors**
   - Make sure your Render backend URL is correct
   - Check that your API endpoints in `server.js` match what the frontend is calling

3. **Connection Refused**
   - Ensure your Render backend is running (check Render dashboard)
   - Verify the URL doesn't have extra characters or missing parts

### Checking Render Logs

1. Go to your Render dashboard
2. Click on your web service
3. Click "Logs" to see real-time logs
4. Look for any error messages

## Next Steps (Optional)

### Add Cloudinary for Image Storage

1. Sign up at https://cloudinary.com (free tier available)
2. Get your Cloud Name, API Key, and API Secret
3. Add these environment variables to your Render service:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_API_KEY`
   - `VITE_CLOUDINARY_API_SECRET`

### Add Environment Variables to Render

1. In your Render dashboard, go to your web service
2. Click "Environment" in the sidebar
3. Add any needed environment variables
4. Click "Save Changes"
5. Render will automatically redeploy with the new variables

## Support

If you encounter issues:

1. Check browser console (F12) for specific error messages
2. Check Render logs for backend errors
3. Verify all URLs are correctly configured
4. Ensure CORS is properly set up for your domains

With these steps, your application will have a fully functional external backend that can persist data between sessions.