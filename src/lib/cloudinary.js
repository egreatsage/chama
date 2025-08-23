import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToCloudinary(base64Image, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'user-profiles', // Organize uploads in a folder
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Resize and crop to face
        { quality: 'auto' }, // Optimize quality automatically
        { format: 'webp' } // Convert to WebP for better compression
      ],
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default cloudinary;