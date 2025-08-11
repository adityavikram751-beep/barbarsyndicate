"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Grid, List, Loader } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

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
  quantityOptions: { type: string }[];
}

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  categoryId: string;
  description: string;
  qunatity: string;
  isFeature: boolean;
  carter: number;
  images: string[];
  quantityOptions: { type: string }[];
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const PRODUCT_API_URL =
    "https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/product";
  const CATEGORY_API_URL =
    "https://qdp1vbhp-3000.inc1.devtunnels.ms/api/v1/category";

  // Fetch products
  const fetchProducts = async (page = 1, retryCount = 0) => {
    const maxRetries = 2;
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${PRODUCT_API_URL}?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (err) {
      let errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      if (err instanceof Error && err.name === "AbortError") {
        errorMessage = "Request timed out.";
      }

      if (retryCount < maxRetries) {
        return fetchProducts(page, retryCount + 1);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORY_API_URL);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(
          data.data.map((cat: any) => ({
            id: cat._id,
            name: cat.categoryname,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const transformedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.categoryId,
      shortDescription: product.description,
      description: product.description,
      quantity: product.qunatity,
      isFeature: product.isFeature,
      carter: product.carter,
      images: product.images || ["/placeholder-image.jpg"],
      quantityOptions: product.quantityOptions || [{ type: "Default" }],
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return transformedProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.shortDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transformedProducts, searchTerm, selectedCategory]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchProducts(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading products
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchProducts()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Product Catalog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our extensive collection of premium wholesale cosmetic
            products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>

                {/* Search */}
                <div className="mb-8">
                  <Label
                    htmlFor="search"
                    className="text-sm font-medium text-gray-700 mb-3 block"
                  >
                    Search Products
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-4 block">
                    Categories
                  </Label>
                  <RadioGroup
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="all"
                        id="all"
                        className="text-purple-600"
                      />
                      <Label
                        htmlFor="all"
                        className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        All Categories
                      </Label>
                    </div>
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={category.id}
                          id={category.id}
                          className="text-purple-600"
                        />
                        <Label
                          htmlFor={category.id}
                          className="text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors capitalize"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            {loading && products.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <Loader className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                <span className="text-blue-700 text-sm">
                  Loading products...
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {totalResults} products
                {selectedCategory !== "all" && (
                  <span className="ml-1">
                    in{" "}
                    <span className="capitalize font-medium">
                      {categories.find((c) => c.id === selectedCategory)?.name ||
                        selectedCategory}
                    </span>
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">View:</span>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none border-r"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  variant="outline"
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {totalPages > 1 && filteredProducts.length > 0 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      variant="outline"
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          variant={
                            currentPage === page ? "default" : "outline"
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}