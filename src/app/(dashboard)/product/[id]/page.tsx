"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingCart, Heart, Share2, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Product {
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
  quantityOptions: { type: string; minOrder?: number; price: number }[];
}

interface ApiProduct {
  quantityOptions: { type: string; price: number; minOrder: number; }[];
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  description: string;
  qunatity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  points: string[];
  __v?: number;
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  description: string;
  qunatity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  points: string[];
  __v?: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = `https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/product/single/${id}`;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.success && data.product) {
          const apiProduct: ApiProduct = data.product;
          setProduct({
            id: apiProduct._id,
            name: apiProduct.name,
            price: apiProduct.price,
            category: apiProduct.categoryId,
            shortDescription: apiProduct.description,
            description: apiProduct.description,
            quantity: apiProduct.qunatity,
            isFeature: apiProduct.isFeature,
            carter: apiProduct.carter,
            images: apiProduct.images || ['/placeholder-image.jpg'],
            quantityOptions: apiProduct.quantityOptions || [
              { type: 'Default', price: apiProduct.price, minOrder: 1 },
            ],
          });

          // Fetch similar products using GET
          const SIMILAR_PRODUCTS_API = `https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/product/similar?pageno=${currentPage}&id=${apiProduct.categoryId}`;
          const similarResponse = await fetch(SIMILAR_PRODUCTS_API, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            signal: controller.signal,
          });

          const similarData = await similarResponse.json();
          if (similarData.status === 'success' && similarData.data) {
            setSimilarProducts(similarData.data);
            setTotalPages(similarData.pages || 1);
          } else {
            console.warn('No similar products found');
          }
        } else {
          throw new Error(data.message || 'Product not found');
        }
      } catch (err) {
        let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        if (err instanceof Error && err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your network or try again.';
        }
        setError(errorMessage);
        router.push('/product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router, currentPage]);

  const handleWhatsAppClick = () => {
    if (!product) return;
    const selectedOption = product.quantityOptions[selectedQuantity];
    const message = `Hi! I'm interested in ${product.name} (${selectedOption.type}). Can you please provide more details${isAuthenticated ? ` and confirm the price of ₹${selectedOption.price}?` : '?'}`;
    const phoneNumber = '919876543210';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product URL copied to clipboard!');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading product</h3>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-purple-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
        {/* Back Button */}
        <Link
          href="/product"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
              <img
                src={product.images[selectedImage] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                  {product.category}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            </div>
            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Quantity & Pricing</h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.quantityOptions.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedQuantity === index
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="quantity"
                          value={index}
                          checked={selectedQuantity === index}
                          onChange={() => setSelectedQuantity(index)}
                          className="sr-only"
                        />
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{option.type}</div>
                          <div className="text-sm text-gray-600">
                            Minimum order: {option.minOrder || 1} pieces
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold text-purple-600 ${
                            !isAuthenticated ? 'blur-sm select-none' : ''
                          }`}
                        >
                          {isAuthenticated ? `₹${option.price.toFixed(2)}` : 'Login to view price'}
                        </div>
                        <div className="text-sm text-gray-500">per piece</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  disabled={!isAuthenticated}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact via WhatsApp</span>
                </button>
                <button
                  className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  disabled={!isAuthenticated}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Inquiry</span>
                </button>
              </div>
            </div>
            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
                <div className="text-amber-800">
                  <h3 className="font-semibold text-lg mb-2">Login Required</h3>
                  <p className="text-sm">
                    Please login to view pricing, quantity options, and place orders.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
            {/* Product Features */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Premium quality ingredients
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Suitable for all skin types
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Dermatologically tested
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Wholesale pricing available
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                  Fast shipping nationwide
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct._id}
                  href={`/product/${similarProduct._id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square rounded-t-xl overflow-hidden">
                    <img
                      src={similarProduct.images[0] || '/placeholder-image.jpg'}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{similarProduct.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{similarProduct.description}</p>
                    <div className="mt-2 text-lg font-bold text-purple-600">
                      {isAuthenticated ? `₹${similarProduct.price.toFixed(2)}` : 'Login to view price'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:text-purple-600 disabled:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-gray-900">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:text-purple-600 disabled:text-gray-300 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}