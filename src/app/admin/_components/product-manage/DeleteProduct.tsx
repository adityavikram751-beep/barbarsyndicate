"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteProductProps {
  productId: number
  onDeleteProduct: (id: number) => void
}

export function DeleteProduct({ productId, onDeleteProduct }: DeleteProductProps) {
  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => onDeleteProduct(productId)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}