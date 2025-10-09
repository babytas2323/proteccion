// Utility function for uploading images to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  // Check if we have Cloudinary credentials
  const hasCredentials = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && 
                        import.meta.env.VITE_CLOUDINARY_API_KEY;
  
  if (!hasCredentials) {
    console.warn('Cloudinary credentials not found. Using local storage fallback.');
    return saveImageLocally(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'tetela_radar'); // You'll need to create this upload preset in your Cloudinary account

  try {
    // Replace with your Cloudinary cloud name
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud_name';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    // Fallback to local storage
    return saveImageLocally(file);
  }
};

// Fallback function for local development (saves to local storage)
export const saveImageLocally = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // In a real app, you would send this to your backend
      resolve({
        success: true,
        url: e.target.result, // Base64 data URL
        filename: file.name,
      });
    };
    reader.readAsDataURL(file);
  });
};