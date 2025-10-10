# Deployment Guide

This guide will help you deploy the Tetela Radar application with both frontend and backend components.

## Backend Deployment (Node.js Server)

### Option 1: Deploy to Render (Recommended)

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up for a free account

2. **Prepare Your Code**
   - Push your code to a GitHub repository
   - Make sure your repository includes:
     - `server.js` (your main server file)
     - `package.json` (with all dependencies)
     - `render.yaml` (deployment configuration)

3. **Deploy on Render**
   - Log into Render Dashboard
   - Click "New Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - Name: tetela-radar-backend
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Instance Type: Free
   - Click "Create Web Service"

4. **Get Your Deployed URL**
   - Once deployment is complete, you'll get a URL like:
     `https://tetela-radar-backend-xxxx.onrender.com`
   - Update this URL in your frontend code (`src/App.jsx`)

### Option 2: Deploy to Railway

1. **Create a Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Node.js app
   - Click "Deploy"

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

3. **Environment Variables (if needed)**
   - Add any environment variables in the project settings

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

## Configuration After Deployment

1. **Update API Base URL**
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

2. **Environment Variables**
   If you're using Cloudinary or other services, make sure to set the environment variables in your deployment platform:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_API_KEY`
   - `VITE_CLOUDINARY_API_SECRET`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   The server already includes CORS middleware, but if you encounter issues:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-url.vercel.app', 'https://your-frontend-url.netlify.app']
   }));
   ```

2. **File Upload Issues**
   Make sure your file upload limits are appropriate:
   ```javascript
   app.use(express.json({ limit: '10mb' }));
   ```

3. **Database Connection**
   If you expand to use a database, make sure to:
   - Use environment variables for connection strings
   - Set up connection pooling
   - Handle connection errors gracefully

### Monitoring

- Check your deployment logs on Render/Railway for backend issues
- Check Vercel/Netlify logs for frontend issues
- Monitor uptime and performance

## Scaling Considerations

1. **Free Tier Limitations**
   - Render free tier has sleep-after-inactivity feature
   - First request after sleep may be slow
   - Consider upgrading for production use

2. **Data Persistence**
   - The current implementation uses JSON files
   - For production, consider migrating to a database like MongoDB or PostgreSQL
   - Use managed database services (MongoDB Atlas, Supabase, etc.)

3. **Security**
   - Add authentication for sensitive operations
   - Validate and sanitize all inputs
   - Use HTTPS in production
   - Implement rate limiting for API endpoints

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Test after updates

2. **Backup Strategy**
   - Regularly backup your data files
   - Consider automated backup solutions
   - Test restore procedures

This deployment guide should help you get your Tetela Radar application running in a production environment with external services.

# Deployment Instructions for Render

## Deploying to Render

This application is configured to deploy to Render using the render.yaml file.

### Steps to Deploy:

1. Push your code to your GitHub repository
2. Connect your GitHub repository to Render
3. Select "Web Service" when prompted
4. Render will automatically detect the render.yaml file and use its configuration

### Configuration Details:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `node render-server.js`
- **Port**: Render will automatically set the PORT environment variable

### Environment Variables:

The application will automatically use the PORT environment variable provided by Render.

### How it Works:

1. During the build process, the React frontend is built into the `dist/` directory
2. The `render-server.js` file serves both the API endpoints and the frontend static files
3. All API requests are handled by the Node.js server
4. All other requests serve the React frontend

### Data Storage:

Data is stored in the `src/data/accidents.json` file, which will persist between deploys as long as you don't clear the filesystem.

### Troubleshooting:

If you encounter issues:
1. Check the build logs in the Render dashboard
2. Check the runtime logs for any errors
3. Ensure the PORT environment variable is being used correctly
4. Verify that the `src/data` directory has proper write permissions

### Local Development vs Production:

- **Local Development**: API runs on `http://localhost:3004`
- **Production**: API runs on the same domain as the frontend (relative paths)

The application automatically detects when it's running in production and adjusts the API calls accordingly.

## Your Deployed Application

Your application is now deployed at: https://proteccion-v6o1.onrender.com

All data will be stored in the accidents.json file on the Render server and will be accessible to all users who visit your application.
