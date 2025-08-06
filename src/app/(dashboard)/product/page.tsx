"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid, List, Loader } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useSearchParams } from 'next/navigation';

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
  images: string[]; // Added images field
  quantityOptions: { type: string }[]; // Added quantityOptions field
}

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  description: string;
  qunatity: string; // Note: typo in API response, should be 'quantity'
  isFeature: boolean;
  carter: number;
  images: string[]; // Added images field
  quantityOptions: { type: string }[]; // Added quantityOptions field
  __v?: number;
}

interface ApiResponse {
  success: boolean;
  products: ApiProduct[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  message?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductCatalog() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const API_URL = 'https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/product';

  const fetchProducts = async (page = 1, retryCount = 0) => {
    const maxRetries = 2;
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${API_URL}?page=${page}`, {
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

      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);

        const uniqueCategories = [...new Set(data.products.map((product: ApiProduct) => product.categoryId))];
        setCategories(uniqueCategories.map(id => ({
          id,
          name: `Category ${id.slice(-4)}`, // Placeholder; replace with actual names if available
        })));
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      if (err instanceof Error && err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your network or try again.';
      }

      console.error('Error fetching products:', {
        error: err,
        url: `${API_URL}?page=${page}`,
        retryCount,
      });

      if (retryCount < maxRetries) {
        console.log(`Retrying fetch (attempt ${retryCount + 1}/${maxRetries})...`);
        return fetchProducts(page, retryCount + 1);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    fetchProducts();
  }, [searchParams]);

  const transformedProducts = useMemo(() => {
    return products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.categoryId,
      shortDescription: product.description,
      description: product.description,
      quantity: product.qunatity, // Note: typo in API field name
      isFeature: product.isFeature,
      carter: product.carter,
      images: product.images || ['/placeholder-image.jpg'], // Fallback image if API doesn't provide
      quantityOptions: product.quantityOptions || [{ type: 'Default' }], // Fallback quantity option
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return transformedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transformedProducts, searchTerm, selectedCategory]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our extensive collection of premium wholesale cosmetic products
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Categories</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading && products.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <Loader className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                <span className="text-blue-700 text-sm">Loading products...</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <p className="text-gray-600">
                  Showing {filteredProducts.length} of {totalResults} products
                  {selectedCategory !== 'all' && (
                    <span className="ml-1">
                      in <span className="capitalize font-medium">{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className={`grid gap-3 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && filteredProducts.length > 0 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          currentPage === page
                            ? 'border-purple-500 bg-purple-50 text-purple-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}