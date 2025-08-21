import React, { useState, useEffect } from 'react';

// Type definitions
interface Brand {
  _id: string;
  brand: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: Brand[];
}

interface CreateBrandResponse {
  success: boolean;
  message: string;
}

// Custom hook for fetching brands
const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/brands', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setBrands(data.data);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (name: string): Promise<boolean> => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await fetch('https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreateBrandResponse = await response.json();
      
      if (data.success) {
        // Refresh the brands list after successful creation
        await fetchBrands();
        return true;
      } else {
        throw new Error(data.message || 'Failed to create brand');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating brand:', err);
      return false;
    } finally {
      setCreating(false);
    }
  };

  React.useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, error, creating, refetch: fetchBrands, createBrand };
};

const brands = () => {
  const { brands: brandsList, loading, error, creating, refetch, createBrand } = useBrands();
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBrandName.trim()) {
      return;
    }

    const success = await createBrand(newBrandName.trim());
    
    if (success) {
      setNewBrandName('');
      setShowCreateForm(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setNewBrandName('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading brands...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading brands</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with title and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brands ({brandsList.length})</h1>
        
        <div className="flex gap-2">
          <button
            onClick={toggleCreateForm}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              showCreateForm 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showCreateForm ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Brand
              </>
            )}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Create Brand Form */}
      {showCreateForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <form onSubmit={handleCreateBrand} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={creating}
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newBrandName.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Create Brand
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {brandsList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brandsList.map((brand) => (
            <div
              key={brand._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {brand.brand}
                </h3>
            
              </div>
              <p className="text-sm text-gray-600 mt-2 font-mono">
                ID: {brand._id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default brands;