// Script to create Cloudinary upload preset
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Cloudinary upload preset
const createCloudinaryPreset = async () => {
  try {
    console.log('Creating Cloudinary upload preset...');
    
    // Create the preset configuration
    const presetData = {
      name: 'accident_reports_preset',
      unsigned: true,
      folder: 'accident_reports',
      allowed_formats: 'jpg,jpeg,png,gif,webp',
      max_file_size: 5000000, // 5MB limit
      transformation: {
        quality: 'auto',
        fetch_format: 'auto'
      }
    };
    
    // Send request to create preset
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload_presets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.VITE_CLOUDINARY_API_KEY}:${process.env.VITE_CLOUDINARY_API_SECRET}`).toString('base64')}`
        },
        body: JSON.stringify({
          name: presetData.name,
          unsigned: presetData.unsigned,
          folder: presetData.folder,
          allowed_formats: presetData.allowed_formats,
          max_file_size: presetData.max_file_size,
          transformation: presetData.transformation
        })
      }
    );
    
    console.log('Create preset response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Upload preset created successfully:', result);
      console.log('Preset name:', result.name);
    } else {
      const errorText = await response.text();
      console.log('Failed to create upload preset:', errorText);
      
      // If preset already exists, try to update it
      if (response.status === 409) {
        console.log('Preset already exists, attempting to update...');
        const updateResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/upload_presets/${presetData.name}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${process.env.VITE_CLOUDINARY_API_KEY}:${process.env.VITE_CLOUDINARY_API_SECRET}`).toString('base64')}`
            },
            body: JSON.stringify({
              unsigned: presetData.unsigned,
              folder: presetData.folder,
              allowed_formats: presetData.allowed_formats,
              max_file_size: presetData.max_file_size,
              transformation: presetData.transformation
            })
          }
        );
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('Upload preset updated successfully:', updateResult);
        } else {
          const updateErrorText = await updateResponse.text();
          console.log('Failed to update upload preset:', updateErrorText);
        }
      }
    }
    
  } catch (error) {
    console.error('Error creating Cloudinary preset:', error);
  }
};

createCloudinaryPreset();