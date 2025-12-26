"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteProductProps {
  productId: string;
  productName: string;
  onDeleteProduct: (productId: string) => void;
}

export function DeleteProduct({
  productId,
  productName,
  onDeleteProduct,
}: DeleteProductProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(
        `https://barber-syndicate.vercel.app/api/v1/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token");
        }
        if (response.status === 404) {
          throw new Error(`Product "${productName}" not found. It may have already been deleted.`);
        }
        throw new Error("Failed to delete product");
      }

      const data = await response.json();
      if (data.success) {
        onDeleteProduct(productId);
        toast.success(`Product "${productName}" deleted successfully`);
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* ✅ Icon-only button with border (outline style) */}
        <Button
          variant="outline"
          size="icon"
          className="border border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
          disabled={isLoading}
          aria-label={`Delete ${productName}`}
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-rose-700 border-t-transparent rounded-full" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="border-rose-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rose-900">
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription className="text-rose-700">
            Are you sure you want to delete "{productName}"? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-rose-200 text-rose-700 hover:bg-rose-100">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-rose-700 text-white hover:bg-rose-800"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
