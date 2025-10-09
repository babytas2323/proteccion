// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
};

export default cloudinaryConfig;