"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShoppingCart, Heart, Share2, Loader, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  isFeature: boolean;
  images: string[];
  variants: { price: string; quantity: string; _id: string }[];
  points: string[];
}

interface ApiProduct {
  _id: string;
  name: string;
  brand: string;
  categoryId: string;
  variants: { price: string; quantity: string; _id: string }[];
  description: string;
  isFeature: boolean;
  images: string[];
  points: string[];
  __v?: number;
}

interface SimilarProduct {
  _id: string;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  isFeature: boolean;
  images: string[];
  variants: { price: string; quantity: string; _id: string }[];
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
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Enquiry related states
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [showEnquiryPopup, setShowEnquiryPopup] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const API_URL = `https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product/single/${id}`;
  const ENQUIRY_API_URL = 'https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/enquiry';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
    setIsAuthenticated(!!token);
    setUserId(storedUserId);

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
            brand: apiProduct.brand,
            category: apiProduct.categoryId,
            description: apiProduct.description,
            isFeature: apiProduct.isFeature,
            images: apiProduct.images || ['/placeholder-image.jpg'],
            variants: apiProduct.variants || [],
            points: apiProduct.points || [],
          });

          // Fetch similar products using the new API
          const SIMILAR_PRODUCTS_API = `https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product?page=${currentPage}`;
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
          if (similarData.success && similarData.products) {
            // Filter out the current product from similar products
            const filteredProducts = similarData.products.filter(
              (p: SimilarProduct) => p._id !== apiProduct._id
            );
            setSimilarProducts(filteredProducts);
            setTotalPages(similarData.totalPages || 1);
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

  const handleEnquiry = async () => {
    if (!product || !userId || !isAuthenticated) {
      setEnquiryError('Please login to create an enquiry');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      setEnquiryError('No variants available for this product');
      return;
    }

    try {
      setIsSubmittingEnquiry(true);
      setEnquiryError(null);

      // Get the selected variant
      const selectedVariantData = product.variants[selectedVariant];

      const enquiryData = {
        id: userId,
        productId: product.id,
        variants: [{
          price: selectedVariantData.price,
          quantity: selectedVariantData.quantity
        }]
      };

      const response = await fetch(ENQUIRY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // If your API requires authorization
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (data.success) {
        setShowEnquiryPopup(true);
        // Auto-close popup after 3 seconds
        setTimeout(() => {
          setShowEnquiryPopup(false);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to create enquiry');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create enquiry';
      setEnquiryError(errorMessage);
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!product || product.variants.length === 0) return;
    const selectedOption = product.variants[selectedVariant];
    const message = `Hi! I'm interested in ${product.name} (${selectedOption.quantity}). Can you please provide more details${isAuthenticated ? ` and confirm the price of ₹${selectedOption.price}?` : '?'}`;
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
          text: product.description,
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

  const getLowestPrice = (variants: { price: string; quantity: string; _id: string }[]) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => parseFloat(v.price)));
  };

  // Enquiry Success Popup Component
  const EnquirySuccessPopup = () => (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
          </div>
          <button
            onClick={() => setShowEnquiryPopup(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Your enquiry has been created successfully!</p>
        <button
          onClick={() => setShowEnquiryPopup(false)}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );

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
      {/* Enquiry Success Popup */}
      {showEnquiryPopup && <EnquirySuccessPopup />}
      
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
                <div className="flex flex-col space-y-2">
                  <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                    {product.brand}
                  </span>
                  {product.isFeature && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full w-fit">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  {/* <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-5 w-5" />
                  </button> */}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">{product.description}</p>
              
              {/* Product Points */}
              {product.points && product.points.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {product.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Variant & Pricing</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.variants.map((variant, index) => (
                      <label
                        key={variant._id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedVariant === index
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="variant"
                            value={index}
                            checked={selectedVariant === index}
                            onChange={() => setSelectedVariant(index)}
                            className="sr-only"
                          />
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{variant.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold text-purple-600 ${
                              !isAuthenticated ? 'blur-sm select-none' : ''
                            }`}
                          >
                            {isAuthenticated ? `₹${parseFloat(variant.price).toFixed(2)}` : 'Login to view price'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* No Variants Message */}
            {(!product.variants || product.variants.length === 0) && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600">Contact us for pricing and availability information.</p>
              </div>
            )}
            
            {/* Enquiry Error Message */}
            {enquiryError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{enquiryError}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                disabled={!isAuthenticated || !product.variants.length}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Contact via WhatsApp</span>
              </button>
              <button
                onClick={handleEnquiry}
                disabled={!isAuthenticated || isSubmittingEnquiry}
                className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingEnquiry ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                <span>
                  {isSubmittingEnquiry ? 'Adding...' : 'Add to Inquiry'}
                </span>
              </button>
            </div>
            
            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
                <div className="text-amber-800">
                  <h3 className="font-semibold text-lg mb-2">Login Required</h3>
                  <p className="text-sm">
                    Please login to view pricing, variant options, and place orders.
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {similarProduct.brand}
                      </span>
                      {similarProduct.isFeature && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">{similarProduct.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{similarProduct.description}</p>
                    {/* <div className="text-lg font-bold text-purple-600">
                      {isAuthenticated && similarProduct.variants.length > 0 
                        // ? `From ₹${getLowestPrice(similarProduct.variants).toFixed(2)}` 
                        ? 'Login to view price'
                      }
                    </div> */}
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