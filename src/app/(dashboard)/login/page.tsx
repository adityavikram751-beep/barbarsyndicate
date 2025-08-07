'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const LoginUI = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch('https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
    
      // Log the token to the console
      console.log('Login successful. Token:', data.token);
    
    localStorage.setItem('token', data.token);
    
      setSuccess('Login successful!');
      setFormData({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-purple-100 mt-1">Sign in to your wholesale account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

           

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;