'use client';
import { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageUpload({ 
  value, 
  onChange, 
  disabled = false, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  placeholder = "Upload profile photo"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${acceptedTypes.join(', ')})`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Create preview
      setPreview(base64);
      
      // Upload to Cloudinary
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update parent component
      onChange(data.url);
      setPreview(data.url);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setPreview(value || null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setError(null);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-32 h-32 mx-auto">
        {preview ? (
          <div className="relative w-32 h-32">
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover rounded-full border-4 border-gray-200"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <CameraIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">No photo</span>
            </div>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <CameraIcon className="w-4 h-4 mr-2" />
                {preview ? 'Change Photo' : placeholder}
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}