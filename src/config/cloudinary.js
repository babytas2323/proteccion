// Cloudinary configuration with better error handling
const cloudinaryConfig = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
};

// Check if we have valid credentials
export const hasValidCredentials = () => {
  return (
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    import.meta.env.VITE_CLOUDINARY_API_KEY &&
    import.meta.env.VITE_CLOUDINARY_API_SECRET
  );
};

export default cloudinaryConfig;