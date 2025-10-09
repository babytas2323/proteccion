# Your Deployment Guide

This guide will help you deploy your Tetela Radar application with your specific setup.

## Current Status

- Frontend: Deployed on Vercel at https://proteccion-ten.vercel.app
- Backend: Not yet deployed (needs to be deployed to connect to your frontend)

## Step-by-Step Deployment

### 1. Deploy Backend to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up for a free account

2. **Fork or Push Your Code to GitHub**
   - If you haven't already, push your code to a GitHub repository

3. **Deploy on Render**
   - Log into Render Dashboard
   - Click "New Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - Name: proteccion-backend (or any name you prefer)
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Instance Type: Free
   - Click "Create Web Service"

4. **Get Your Deployed Backend URL**
   - Once deployment is complete, you'll get a URL like:
     `https://proteccion-backend-xxxx.onrender.com`
   - Copy this URL for the next step

### 2. Update Frontend to Connect to Deployed Backend

1. **Update API Base URL in App.jsx**
   After deploying your backend, update the URL in `src/App.jsx`:
   ```javascript
   const getApiBaseUrl = () => {
     // In development, use localhost
     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
       return 'http://localhost:3004';
     }
     
     // For production, use your deployed backend URL
     return 'https://your-deployed-backend-url.onrender.com'; // Replace with your actual URL
   };
   ```

2. **Redeploy Frontend**
   - Push your changes to GitHub
   - Vercel will automatically redeploy your frontend

### 3. Test the Connection

1. Visit your frontend at https://proteccion-ten.vercel.app
2. Try to add a new incident
3. Check the browser console for any errors
4. Check the Render logs for any backend errors

## Troubleshooting

### Common Issues

1. **CORS Errors**
   If you encounter CORS errors, make sure your backend server.js includes your Vercel URL:
   ```javascript
   const allowedOrigins = [
     'https://proteccion-ten.vercel.app',  // Your actual frontend domain
     // ... other domains
   ];
   ```

2. **Connection Refused Errors**
   Make sure:
   - Your backend is deployed and running
   - The URL in App.jsx matches your deployed backend URL
   - The PORT in server.js uses process.env.PORT for Render

3. **Data Not Saving**
   Check:
   - Render logs for any errors
   - Make sure the accidents.json file can be written to
   - File size limits in multer configuration

### Monitoring Your Deployed Application

1. **Render Dashboard**
   - View logs and monitor your backend service
   - Check for any errors or crashes

2. **Vercel Dashboard**
   - Monitor your frontend deployments
   - Check for any build errors

## Next Steps

1. **Custom Domain** (Optional)
   - You can add custom domains to both your frontend and backend
   - This makes the URLs more professional

2. **Environment Variables** (Optional)
   - For sensitive information, use environment variables
   - Configure them in both Render and Vercel dashboards

3. **Database Integration** (Optional)
   - Consider migrating from JSON files to a database like MongoDB
   - This provides better data persistence and scalability

## Support

If you encounter any issues during deployment:
1. Check the browser console for frontend errors
2. Check Render logs for backend errors
3. Verify all URLs are correctly configured
4. Ensure CORS is properly configured for your domains

This deployment guide is tailored specifically for your setup with Vercel frontend at https://proteccion-ten.vercel.app.