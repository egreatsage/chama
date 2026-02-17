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
    photoUrl: user?.photoUrl || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    setIsSaving(true);
    
    try {

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        photoUrl: formData.photoUrl,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

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
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
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
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 py-6  sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-blue-700">
            My Profile
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-t-4 border-green-500">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-700 px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Profile Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white">
                    {user?.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-white">
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-blue-100 text-sm sm:text-base">
                    {user?.email}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-white text-green-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {/* Success/Error Message */}
          {message && (
            <div className={`mx-4 sm:mx-6 mt-6 px-4 py-3 rounded-lg text-sm font-medium shadow-md ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                : 'bg-red-50 text-red-700 border-l-4 border-red-500'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('success') ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {message}
              </div>
            </div>
          )}

          {/* Profile Fields */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* First Name */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 sm:p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-medium text-gray-900">{user?.firstName || '-'}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 border border-green-100 hover:shadow-lg transition-shadow duration-200">
                <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-medium text-gray-900">{user?.lastName || '-'}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 sm:p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-medium text-gray-900 break-all">{user?.email || '-'}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 border border-green-100 hover:shadow-lg transition-shadow duration-200">
                <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-medium text-gray-900">{user?.phoneNumber || '-'}</p>
                )}
              </div>

              {/* Role */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 sm:p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                  Role
                </label>
                <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg shadow-sm ${
                  user?.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                  user?.role === 'treasurer' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                  'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {user?.role || 'User'}
                </span>
              </div>

              {/* Photo URL (if editing) */}
              {isEditing && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 border border-green-100 hover:shadow-lg transition-shadow duration-200">
                  <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    Photo URL
                  </label>
                  <input
                    type="text"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    placeholder="Enter photo URL"
                  />
                </div>
              )}
              {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Required to change" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="New password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Confirm new" />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
          
          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-2.5 border-2 border-red-300 rounded-lg text-sm font-semibold text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? <a href="/support" className="text-blue-600 hover:text-green-600 font-semibold transition-colors duration-200">Contact Support</a>
          </p>
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