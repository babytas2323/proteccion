// Cloudinary configuration with better error handling
const cloudinaryConfig = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvyuii8ot',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '245658548747968',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || '**********',
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