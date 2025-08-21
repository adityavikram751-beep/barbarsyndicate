"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit } from "lucide-react"

interface Product {
  id: number
  name: string
  image: string
  description: string
  pricing: {
    single: number
    dozen: number
    carton: number
  }
}

interface FormData {
  name: string
  description: string
  single: string
  dozen: string
  carton: string
}

interface EditProductProps {
  product: Product
  onEditProduct: (updatedProduct: Product) => void
}

export function EditProduct({ product, onEditProduct }: EditProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: product.name,
    description: product.description,
    single: product.pricing.single.toString(),
    dozen: product.pricing.dozen.toString(),
    carton: product.pricing.carton.toString(),
  })

  const handleSubmit = () => {
    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      description: formData.description,
      pricing: {
        single: Number.parseFloat(formData.single),
        dozen: Number.parseFloat(formData.dozen),
        carton: Number.parseFloat(formData.carton),
      },
    }
    onEditProduct(updatedProduct)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-rose-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-900">Edit Product</DialogTitle>
          <DialogDescription>Update product information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name" className="text-rose-700">
              Product Name
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
            />
          </div>
          <div>
            <Label htmlFor="edit-description" className="text-rose-700">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="edit-single" className="text-rose-700">
                1 pc ($)
              </Label>
              <Input
                id="edit-single"
                type="number"
                value={formData.single}
                onChange={(e) => setFormData({ ...formData, single: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-dozen" className="text-rose-700">
                12 pcs ($)
              </Label>
              <Input
                id="edit-dozen"
                type="number"
                value={formData.dozen}
                onChange={(e) => setFormData({ ...formData, dozen: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="edit-carton" className="text-rose-700">
                Carton ($)
              </Label>
              <Input
                id="edit-carton"
                type="number"
                value={formData.carton}
                onChange={(e) => setFormData({ ...formData, carton: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full bg-rose-600 hover:bg-rose-700">
            Update Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}