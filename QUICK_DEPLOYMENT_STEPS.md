# Quick Deployment Steps

Follow these steps to make your application fully functional with data persistence.

## Prerequisites
1. A GitHub account
2. A Render account (free)

## Step 1: Deploy Backend to Render

1. Push your code to a GitHub repository if you haven't already
2. Go to [render.com](https://render.com) and sign up/sign in
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `tetela-radar-backend` (or any name you prefer)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Click "Create Web Service"
7. Wait for deployment to complete (takes 5-10 minutes)
8. Copy the URL (looks like: `https://tetela-radar-backend-xxxx.onrender.com`)

## Step 2: Update Frontend Configuration

1. Open `src/App.jsx` in your code editor
2. Find the `getApiBaseUrl()` function
3. Replace the return value with your Render backend URL:
   ```javascript
   // For production, use your deployed backend URL
   return 'https://your-render-url.onrender.com'; // Use your actual URL
   ```
4. Commit and push changes to GitHub

## Step 3: Redeploy Frontend

If you're using Vercel:
1. Push your changes to GitHub
2. Vercel will automatically redeploy your site

## Optional: Set Up Cloudinary for Image Storage

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add these environment variables to your Vercel project:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_API_KEY`
   - `VITE_CLOUDINARY_API_SECRET`

## Testing

1. Visit your frontend URL
2. Try adding a new incident with an image
3. Check that it saves successfully

## Troubleshooting

If you still see "No se puede guardar datos en este entorno":
1. Check that you updated the URL in `src/App.jsx`
2. Verify your Render backend is running
3. Check browser console for errors
4. Check Render logs for backend errors

## Support

If you need help:
1. Check browser console (F12) for specific error messages
2. Check Render dashboard for backend logs
3. Verify all URLs are correctly configured