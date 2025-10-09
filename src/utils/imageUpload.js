// Utility function for uploading images to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'tetela_radar'); // You'll need to create this upload preset in your Cloudinary account

  try {
    // Replace with your Cloudinary cloud name
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud_name'}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message,
    };
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