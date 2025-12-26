'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterUI = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gstnumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.address) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      gstnumber: formData.gstnumber || undefined,
      address: formData.address,
    };

    try {
      const res = await fetch(
        'https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/user/singup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to register');
      }

      // Save token to localStorage if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Registration successful. Token saved:', data.token);
      }

      setSuccess('Registration successful! Awaiting admin approval.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gstnumber: '',
        address: '',
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-center">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Join Barber Syndicate</h2>
            <p className="text-purple-100 mt-1">Create your wholesale account</p>
          </div>

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

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                  placeholder="Enter your complete business address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* GST Number */}
              <div>
                <label htmlFor="gstnumber" className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  id="gstnumber"
                  name="gstnumber"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., 07AABCU9603R1ZX"
                  value={formData.gstnumber}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Provide your GST number for tax-compliant invoices
                </p>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Admin Approval Required:</strong> After registration, your account will be reviewed and approved by our team.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUI;
