# How to Fix the Connection Error

The error you're seeing (`ERR_NAME_NOT_RESOLVED`) occurs because your frontend is trying to connect to a placeholder URL that doesn't exist.

## Understanding the Error

```
Sending request to API: https://your-php-backend-url.com/api/api/accidents
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

This error means:
1. `your-php-backend-url.com` is not a real domain - it's just a placeholder
2. The double `/api/api/` path is incorrect
3. You need to deploy your backend and update the URL

## Solution Options

### Option 1: Deploy PHP Backend (Recommended if you want to use PHP)

1. **Choose a hosting provider**:
   - Free options: 000WebHost, InfinityFree
   - Paid options: SiteGround, Bluehost

2. **Upload your files**:
   - Upload the entire project to your hosting
   - Make sure the directory structure is maintained

3. **Get your actual domain**:
   - Your hosting provider will give you a domain like `your-site.000webhostapp.com`

4. **Update your frontend**:
   ```javascript
   // In src/App.jsx, replace:
   return 'https://your-php-backend-url.com/api';
   
   // With your actual domain:
   return 'https://your-site.000webhostapp.com/api';
   ```

### Option 2: Deploy Node.js Backend to Render (Easier)

1. **Go to https://render.com** and create a free account

2. **Deploy your backend**:
   - Connect your GitHub repository
   - Set these configurations:
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `node server.js`

3. **Get your Render URL**:
   - After deployment, you'll get a URL like `https://tetela-radar-backend-xxxx.onrender.com`

4. **Update your frontend**:
   ```javascript
   // In src/App.jsx, replace:
   return 'https://your-php-backend-url.com/api';
   
   // With your Render URL:
   return 'https://tetela-radar-backend-xxxx.onrender.com';
   ```

## Step-by-Step Instructions

### For PHP Deployment:

1. Sign up at https://www.000webhost.com/
2. Create a new website
3. Use the file manager to upload your files:
   - Upload everything in the `api` folder to the `public_html` folder
   - Upload the `src` folder
   - Upload the `public` folder
4. Set permissions:
   - Set `src/data` folder to 777 (write permissions)
   - Set `public/images` folder to 777 (write permissions)
5. Get your domain from the 000webhost dashboard
6. Update `src/App.jsx` with your actual domain

### For Node.js Deployment on Render:

1. Go to https://render.com and sign up
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: tetela-radar-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Copy your URL from the Render dashboard
8. Update `src/App.jsx` with your Render URL

## Testing the Fix

1. After updating the URL in `src/App.jsx`, commit and push to GitHub
2. If using Vercel, it will automatically redeploy
3. Visit your site at https://proteccion-ten.vercel.app
4. Try adding a new incident
5. Check the browser console (F12) to see if the error is gone

## Troubleshooting

If you still see errors:

1. **Check the URL format**:
   - Correct: `https://your-domain.com/api`
   - Incorrect: `https://your-domain.com/api/api`

2. **Verify your backend is running**:
   - Visit your backend URL directly in the browser
   - You should see some response, not an error

3. **Check browser console**:
   - Look for specific error messages
   - Check the Network tab to see request details

## Need Help?

If you're having trouble with deployment:

1. Share which hosting provider you're using
2. Provide the actual domain/URL you're trying to use
3. I can give you specific instructions for your situation

The key is replacing the placeholder URL with your actual deployed backend URL.