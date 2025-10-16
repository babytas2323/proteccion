// Simple script to create Cloudinary upload preset using signed request
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Function to generate signature for admin API requests
const generateAdminSignature = (paramsToSign, apiSecret) => {
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');
  
  return crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');
};

// Create upload preset
const createUploadPreset = async () => {
  try {
    console.log('Creating upload preset with signed request...');
    
    // Parameters for creating preset
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      name: 'accident_reports_preset',
      unsigned: true,
      folder: 'accident_reports',
      allowed_formats: 'jpg,jpeg,png,gif,webp',
      max_file_size: 5000000, // 5MB
      timestamp: timestamp
    };
    
    // Generate signature
    const signature = generateAdminSignature(params, process.env.VITE_CLOUDINARY_API_SECRET);
    params.signature = signature;
    
    // Create form data
    const formData = new FormData();
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });
    formData.append('api_key', process.env.VITE_CLOUDINARY_API_KEY);
    
    // Send request to create preset
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload_presets`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('Create preset response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload preset created successfully:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to create upload preset:', errorText);
    }
    
  } catch (error) {
    console.error('Error creating upload preset:', error);
  }
};

createUploadPreset();