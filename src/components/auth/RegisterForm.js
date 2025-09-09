// /components/auth/RegisterForm.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';

// Reusable PasswordInput Component
const PasswordInput = ({ 
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  autoComplete,
  error,
  disabled = false,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className={`absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    photoUrl: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (url) => {
    setFormData(prev => ({
      ...prev,
      photoUrl: url
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      toast.success("success", {
      icon: <CheckCircle className="text-white" size={20} />, // ✅ icon
      style: {
        background: "#22c55e", // Tailwind green-500
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "12px",
        fontWeight: "500",
      },
    });
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Profile Photo (Optional)
            </label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={handleImageUpload}
              disabled={isLoading}
              placeholder="Upload profile photo"
            />
          </div>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
              <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${validationErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="0700-000-000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
              )}
            </div>
            </div>
           
             <div className='grid md:grid-cols-2 gap-4'>
               <PasswordInput
                 id="password"
                 name="password"
                 value={formData.password}
                 onChange={handleChange}
                 placeholder="Password"
                 label="Password"
                 required
                 autoComplete="new-password"
                 error={validationErrors.password}
                 disabled={isLoading}
               />
            
               <PasswordInput
                 id="confirmPassword"
                 name="confirmPassword"
                 value={formData.confirmPassword}
                 onChange={handleChange}
                 placeholder="Confirm Password"
                 label="Confirm Password"
                 required
                 error={validationErrors.confirmPassword}
                 disabled={isLoading}
               />
             </div>
            
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#393B66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}