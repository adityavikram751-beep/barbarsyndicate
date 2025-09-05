"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, RefreshCw } from "lucide-react";
import { AddProduct } from "./product-manage/AddProduct";
import { EditProduct } from "./product-manage/EditProduct";
import { DeleteProduct } from "./product-manage/DeleteProduct";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  pricing: {
    single: number;
    dozen: number;
    carton: number;
  };
  brand?: string;
  categoryId?: string;
  points?: string[];
  isFeatured?: boolean;
  variants?: { price: string; quantity: string }[];
  images?: string[];
}

interface ApiProduct {
  _id: string;
  name: string;
  images: string[];
  description: string;
  variants: {
    price: string;
    quantity: string;
    _id: string;
  }[];
  brand: string;
  categoryId: string;
  points: string[];
  isFeatured: boolean;
}

interface ApiResponse {
  success: boolean;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  products: ApiProduct[];
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(`https://barber-syndicate.vercel.app/api/v1/product?page=${currentPage}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token");
        }
        throw new Error("Failed to fetch products");
      }

      const data: ApiResponse = await response.json();
      const mappedProducts: Product[] = data.products.map((apiProduct) => ({
        id: apiProduct._id,
        name: apiProduct.name,
        description: apiProduct.description,
        pricing: {
          single: parseFloat(apiProduct.variants.find(v => v.quantity === "1")?.price || "0"),
          dozen: parseFloat(apiProduct.variants.find(v => v.quantity === "12Pcs")?.price || "0"),
          carton: parseFloat(apiProduct.variants.find(v => v.quantity === "Carton")?.price || "0"),
        },
        brand: apiProduct.brand,
        categoryId: apiProduct.categoryId,
        points: apiProduct.points || [],
        isFeatured: apiProduct.isFeatured || false,
        variants: apiProduct.variants,
        images: apiProduct.images || [],
      }));
      setProducts(mappedProducts);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load products. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    fetchProducts(); // Refresh the product list to ensure sync with backend
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">Product Management</h1>
          <p className="text-rose-600">Manage your cosmetic product catalog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <AddProduct onAddProduct={handleAddProduct} />
        </div>
      </header>

      {isLoading && <p className="text-rose-700">Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Package className="h-5 w-5" /> Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200">
                  <TableHead className="text-rose-700">Image</TableHead>
                  <TableHead className="text-rose-700">Product</TableHead>
                  <TableHead className="text-rose-700 hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-rose-700">1 pc</TableHead>
                  <TableHead className="text-rose-700">12 pcs</TableHead>
                  <TableHead className="text-rose-700">Carton</TableHead>
                  <TableHead className="text-rose-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-rose-700">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="border-rose-200">
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <span className="text-rose-700">No Image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-rose-900">
                          {product.name.split(" ").slice(0, 5).join(" ")}
                          {product.name.split(" ").length > 5 ? "..." : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-rose-700 hidden md:table-cell max-w-xs truncate">
                        {product.description.split(" ").slice(0, 10).join(" ")}
                        {product.description.split(" ").length > 10 ? "..." : ""}
                      </TableCell>
                      <TableCell className="text-rose-700">${product.pricing.single.toFixed(2)}</TableCell>
                      <TableCell className="text-rose-700">${product.pricing.dozen.toFixed(2)}</TableCell>
                      <TableCell className="text-rose-700">${product.pricing.carton.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <EditProduct product={product} onUpdateProduct={handleUpdateProduct} />
                          <DeleteProduct
                            productId={product.id}
                            productName={product.name}
                            onDeleteProduct={handleDeleteProduct}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 hover:bg-rose-200 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-rose-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50 hover:bg-rose-200 transition-colors"
              >
                Next
              </button>
            </nav>
          )}
        </CardContent>
      </Card>
    </div>
  );
}