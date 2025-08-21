"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";
import Image from "next/image";
import { AddProduct } from "./product-manage/AddProduct";
import { EditProduct } from "./product-manage/EditProduct";
import { DeleteProduct } from "./product-manage/DeleteProduct";

interface Product {
  id: string; // Changed to string to match _id from API
  name: string;
  image: string;
  description: string;
  pricing: {
    single: number;
    dozen: number;
    carton: number;
  };
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product?page=${currentPage}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: ApiResponse = await response.json();
        
        // Map API data to Product interface
        const mappedProducts: Product[] = data.products.map((apiProduct) => ({
          id: apiProduct._id,
          name: apiProduct.name,
          image: apiProduct.images[0] || "/placeholder.svg", // Use first image or fallback
          description: apiProduct.description,
          pricing: {
            single: parseFloat(apiProduct.variants.find(v => v.quantity === "1")?.price || "0"),
            dozen: parseFloat(apiProduct.variants.find(v => v.quantity === "12Pcs")?.price || "0"),
            carton: parseFloat(apiProduct.variants.find(v => v.quantity === "Carter")?.price || "0"),
          },
        }));

        setProducts(mappedProducts);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError("Error fetching products. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">Product Management</h1>
          <p className="text-rose-600">Manage your cosmetic product catalog</p>
        </div>
        <AddProduct onAddProduct={function (product: Product): void {
          throw new Error("Function not implemented.");
        } } />
      </div>

      {loading && <p className="text-rose-700">Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <Card className="border-rose-200 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-rose-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200">
                  <TableHead className="text-rose-700">Product</TableHead>
                  <TableHead className="text-rose-700 hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-rose-700">1 pc</TableHead>
                  <TableHead className="text-rose-700">12 pcs</TableHead>
                  <TableHead className="text-rose-700">Carton</TableHead>
                  <TableHead className="text-rose-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-rose-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded-lg"
                        />
                        <span className="font-medium text-rose-900">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-rose-700 hidden md:table-cell max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell className="text-rose-700">${product.pricing.single.toFixed(2)}</TableCell>
                    <TableCell className="text-rose-700">${product.pricing.dozen.toFixed(2)}</TableCell>
                    <TableCell className="text-rose-700">${product.pricing.carton.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditProduct product={product} onEditProduct={handleEditProduct} />
                        <DeleteProduct productId={product.id} onDeleteProduct={handleDeleteProduct} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-rose-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}