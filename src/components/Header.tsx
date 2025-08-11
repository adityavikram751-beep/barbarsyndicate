'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirect after logout

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState(''); // State for user's name
  const router = useRouter();

  // Check if user is logged in by verifying token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName'); // Adjust key based on your storage
    if (token) {
      setLoggedIn(true);
      setUserName(storedUserName || 'User'); // Fallback to 'User' if name not found
    } else {
      setLoggedIn(false);
      setUserName('');
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName'); // Clear user name
    setLoggedIn(false);
    setUserName('');
    setIsMenuOpen(false); // Close mobile menu on logout
    router.push('/login'); // Redirect to login page
  };

  const isActive = (path: string) => false; // Adjust this based on your routing logic

  return (
    <header className="bg-white shadow-sm border-b border-yellow-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-1 rounded-lg">
              <Image
                src="/logo.png"
                alt="Barber Syndicate Logo"
                width={80}
                height={50}
              />
            </div>
            <span className="text-xl font-bold text-red-700">
              Barber Syndicate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-red-700 ${
                isActive('/') ? 'text-red-700' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-red-700 ${
                isActive('/products') ? 'text-red-700' : 'text-gray-700'
              }`}
            >
              Products
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-red-700 text-gray-700"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm141414 text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Welcome, {userName}</span> {/* Display user's name */}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex1 items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-red-700 transition-colors"
                >
                  Login
 Ascendancy
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-red-700 to-yellow-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-105 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-red-700 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-100">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-red-700 ${
                  isActive('/') ? 'text-red-700 bg-yellow-100' : 'text-gray-700'
                } rounded-md`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-red-700 ${
                  isActive('/products') ? 'text-red-700 bg-yellow-100' : 'text-gray-700'
                } rounded-md`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-red-700 ${
                  isActive('/contact') ? 'text-red-700 bg-yellow-100' : 'text-gray-700'
                } rounded-md`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-3 border-t border-yellow-100">
                {loggedIn ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md">
                      Welcome, {userName} {/* Display user's name */}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-100 rounded-md transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-yellow-100 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 text-sm font-medium bg-gradient-to-r from-red-700 to-yellow-400 text-white rounded-md text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}