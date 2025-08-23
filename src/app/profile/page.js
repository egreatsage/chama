
'use client';
import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useAuthStore from '@/store/authStore';

function ProfileContent() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    photoUrl: user?.photoUrl || ''

  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      photoUrl: user?.photoUrl || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and information.
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {message && (
            <div className={`mx-6 mb-4 px-4 py-3 rounded-md text-sm ${
              message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">First name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md  shadow-sm outline-none focus:none py-2 px-2 border sm:text-sm"
                    />
                  ) : (
                    user?.firstName
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm outline-none focus:none py-2 px-2 border sm:text-sm"
                    />
                  ) : (
                    user?.lastName
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {
                    isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm outline-none focus:none py-2 px-2 border sm:text-sm"/>
                  ):(
                     user?.email
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm outline-none focus:none py-2 px-2 border sm:text-sm"
                    />
                  ) : (
                    user?.phoneNumber
                  )}
                </dd>
              </div>
            
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user?.role === 'treasurer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          
          {isEditing && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}