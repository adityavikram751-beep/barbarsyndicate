
'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, MessageCircle, Truck, FileText, Loader } from 'lucide-react';
import { productCategories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { CarouselDemo } from '@/components/CarouselCategory';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  shortDescription: string;
  description: string;
  quantity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('https://barber-syndicate.vercel.app/api/v1/product/feature');
        const data = await response.json();
        if (data.success) {
          // Map API data to Product interface
          const mappedProducts: Product[] = data.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.categoryId, // Note: You might need to map categoryId to a category name
            shortDescription: item.description.slice(0, 100), // Truncate for short description
            description: item.description,
            quantity: item.qunatity, // Note: API has typo 'qunatity' instead of 'quantity'
            isFeature: item.isFeature,
            carter: item.carter,
            images: item.images,
            quantityOptions: [{ type: item.qunatity }], // Adjust based on your needs
          }));
          setFeaturedProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    }
    fetchFeaturedProducts();
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
    {/* Hero Section */}
    <section className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 overflow-hidden">
        <div className="absolute inset-0 bg-white bg-opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Premium{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Wholesale
                  </span>{' '}
                  Cosmetics
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Discover high-quality beauty products at unbeatable wholesale prices. 
                  From skincare to makeup, we offer everything you need to stock your business 
                  with premium cosmetics.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Browse Products</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
               
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://i.pinimg.com/1200x/56/b0/09/56b009d7e650777ff1de19122217fc45.jpg"
                  alt="Premium cosmetics"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">500+ Products</p>
                    <p className="text-sm text-gray-600">Premium Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    {/* Key Benefits Section */}
    <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Barber Syndicate?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make wholesale cosmetics procurement simple, reliable, and profitable for your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Bulk Pricing</h3>
              <p className="text-gray-600">
                Get the best wholesale rates with significant discounts on bulk orders. 
                Maximize your profit margins with competitive pricing.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">GST Invoices</h3>
              <p className="text-gray-600">
                Professional GST-compliant invoices for all transactions. 
                Maintain proper business records and tax compliance.
              </p>
            </div>
            
            <div className="text-center space-y-4 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">WhatsApp Support</h3>
              <p className="text-gray-600">
                Direct communication with our team via WhatsApp for instant support, 
                queries, and order assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

{/* Product Categories Section */}
<section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Product Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of cosmetic products across multiple categories.
            </p>
          </div>
          
         <CarouselDemo />
        </div>
      </section>
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link
              href="/product"
              className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
            >
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Discover our most popular wholesale cosmetic products loved by businesses worldwide.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Suspense key={product.id} fallback={<Loader className="h-6 w-6 text-purple-600" />}>
                  <ProductCard product={product} />
                </Suspense>
              ))
            ) : (
              <div className="col-span-full text-center">
                <Loader className="h-6 w-6 text-purple-600 mx-auto animate-spin" />
                <p className="text-gray-600 mt-2">Loading featured products...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Only show registration card if not authenticated */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Wholesale Journey?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Join thousands of satisfied businesses who trust Barber Syndicate for their cosmetic needs.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Register Now
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      )}
       
    </div>
  );
}
