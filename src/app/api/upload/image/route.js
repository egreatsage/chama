// app/api/upload/image/route.js - Public API route for image upload during registration
import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { message: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Generate a unique identifier for the image
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    
    // Upload to Cloudinary with a unique public_id
    const uploadResult = await uploadToCloudinary(image, {
      public_id: `registration_${timestamp}_${uniqueId}`, // Unique filename for registration
      folder: 'user_registrations', // Optional: organize uploads in folders
      resource_type: 'image',
      // Optional: Add transformations for optimization
      transformation: [
        { width: 400, height: 400, crop: 'fill', quality: 'auto' }
      ]
    });
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { message: 'Failed to upload image' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Image uploaded successfully',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      // Optional: return optimized URL
      optimizedUrl: uploadResult.url
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}