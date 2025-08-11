
'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, MessageCircle, Truck, FileText, Loader } from 'lucide-react';
import { productCategories } from '@/data/products';
import ProductCard from '@/components/ProductCard';

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

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/product/feature');
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Premium <span className="text-yellow-400">Wholesale</span> Cosmetics
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Discover high-quality beauty products at unbeatable wholesale prices. From skincare to
            makeup, we offer everything you need to stock your business with premium cosmetics.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Browse Products <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Barber Syndicate?
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            We make wholesale cosmetics procurement simple, reliable, and profitable for your business.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <Truck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Bulk Pricing</h3>
              <p className="text-gray-600 mt-2">
                Get the best wholesale rates with significant discounts on bulk orders. Maximize your
                profit margins with competitive pricing.
              </p>
            </div>
            <div className="text-center">
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">GST Invoices</h3>
              <p className="text-gray-600 mt-2">
                Professional GST-compliant invoices for all transactions. Maintain proper business
                records and tax compliance.
              </p>
            </div>
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">WhatsApp Support</h3>
              <p className="text-gray-600 mt-2">
                Direct communication with our team via WhatsApp for instant support, queries, and order
                assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Product Categories</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive range of cosmetic products across multiple categories.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategories.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 mt-2 line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
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

      {/* CTA Section */}
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
    </div>
  );
}
