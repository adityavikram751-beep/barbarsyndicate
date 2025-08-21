"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface DeleteProductProps {
  productId: string
  onDeleteProduct?: (productId: string) => void
}

export function DeleteProduct({ productId, onDeleteProduct }: DeleteProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setError(null)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Authentication token not found. Please log in.")
        return
      }

      const res = await fetch(`https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await res.json()
      if (res.ok) {
        if (onDeleteProduct) {
          onDeleteProduct(productId)
        }
        setIsOpen(false)
      } else {
        setError(result.message || "Failed to delete product")
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Error deleting product. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-rose-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-900">Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="text-rose-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}