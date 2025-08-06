import React from 'react';
import { ShoppingBag, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-2 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Barber Syndicate</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for wholesale cosmetics. We provide premium quality beauty products 
              with competitive bulk pricing and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Products
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Become a Partner
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products?category=skincare" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Skincare
                </a>
              </li>
              <li>
                <a href="/products?category=haircare" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Haircare
                </a>
              </li>
              <li>
                <a href="/products?category=makeup" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Makeup
                </a>
              </li>
              <li>
                <a href="/products?category=fragrance" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Fragrance
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>123 Business District,</p>
                  <p>3846 Main Market Mori Gate Delhi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">info@BarberSyndicate.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2025 Barber Syndicate. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>GST: 07AABCU9603R1ZX</span>
              <span>•</span>
              <span>Wholesale License: WL/MH/2024/001</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}