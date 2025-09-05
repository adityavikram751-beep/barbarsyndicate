"use client"
import { useState, useEffect } from "react"
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
import { Edit2 } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  pricing: {
    single: number
    dozen: number
    carton: number
  }
}

interface Category {
  _id: string
  categoryname: string
}

interface Brand {
  _id: string
  brand: string
}

interface FormData {
  name: string
  description: string
  brand: string
  categoryId: string
  points: string
  isFeature: boolean
}

interface Variant {
  price: string
  quantity: string
}

interface EditProductProps {
  product: Product
  onUpdateProduct: (product: Product) => void
}

export function EditProduct({ product, onUpdateProduct }: EditProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    brand: "",
    categoryId: "",
    points: "",
    isFeature: false,
  })
  const [variants, setVariants] = useState<Variant[]>([{ price: "", quantity: "" }])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Initialize form with product data
  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description,
      brand: "",
      categoryId: "",
      points: "",
      isFeature: false,
    })

    setVariants([
      { price: product.pricing.single.toString(), quantity: "1" },
      { price: product.pricing.dozen.toString(), quantity: "12pcs" },
      { price: product.pricing.carton.toString(), quantity: "carter" },
    ])
  }, [product])

  // Fetch categories and brands
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://barber-syndicate.vercel.app/api/v1/category")
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        } else {
          console.error("Failed to fetch categories:", data.message)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    const fetchBrands = async () => {
      try {
        const res = await fetch("https://barber-syndicate.vercel.app/api/v1/brands")
        const data = await res.json()
        if (data.success) {
          setBrands(data.data)
        } else {
          console.error("Failed to fetch brands:", data.message)
        }
      } catch (err) {
        console.error("Error fetching brands:", err)
      }
    }

    fetchCategories()
    fetchBrands()
  }, [])

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setVariants([
        { price: product.pricing.single.toString(), quantity: "1" },
        { price: product.pricing.dozen.toString(), quantity: "12pcs" },
        { price: product.pricing.carton.toString(), quantity: "carter" },
      ])
      setFormData({
        name: product.name,
        description: product.description,
        brand: "",
        categoryId: "",
        points: "",
        isFeature: false,
      })
      setError(null)
    }
  }, [isOpen, product])

  const addVariant = () => {
    setVariants([...variants, { price: "", quantity: "" }])
  }

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    if (field === "price" && value && !/^\d*\.?\d*$/.test(value)) {
      return
    }
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.brand) {
      setError("Please fill in all required fields (Name, Category, Brand).")
      return
    }

    const cleanedVariants = variants.filter((v) => v.price && v.quantity)
    if (cleanedVariants.length === 0) {
      setError("Please add at least one valid variant with price and quantity.")
      return
    }

    try {
      setUploading(true)
      setError(null)
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setError("Authentication token not found. Please log in.")
        return
      }

      // Handle points
      const pointsArray = formData.points && formData.points.trim() !== ""
        ? formData.points.split("\n").map((s) => s.trim()).filter(Boolean)
        : []

      const jsonPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        brand: formData.brand,
        isFeature: formData.isFeature,
        points: pointsArray,
        variants: cleanedVariants
      }

      const res = await fetch(`https://barber-syndicate.vercel.app/api/v1/product/${product.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonPayload),
      })

      const result = await res.json()

      if (res.ok && result.success) {
        const updatedProduct: Product = {
          id: product.id,
          name: formData.name,
          description: formData.description,
          pricing: {
            single: parseFloat(cleanedVariants.find(v => v.quantity === "1")?.price || "0"),
            dozen: parseFloat(cleanedVariants.find(v => v.quantity === "12pcs")?.price || "0"),
            carton: parseFloat(cleanedVariants.find(v => v.quantity === "carter")?.price || "0"),
          },
        }
        onUpdateProduct(updatedProduct)
        setIsOpen(false)
      } else {
        setError(result.message || `Failed to update product: ${res.status} ${res.statusText}`)
      }
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Product
        </Button>
      </DialogTrigger>
      <DialogContent className="border-rose-200 max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="text-rose-900">Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="brand">Brand *</Label>
            <select
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.brand}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="points">Points (one per line)</Label>
            <Textarea
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              placeholder="Enter product points, one per line"
            />
          </div>
          <div>
            <Label>Variants</Label>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 mt-2 items-center">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Quantity (e.g., 1, 12pcs, carter)"
                  value={v.quantity}
                  onChange={(e) => updateVariant(i, "quantity", e.target.value)}
                />
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeVariant(i)}
                  >
                    ✖
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={addVariant} className="mt-2">
              + Add Variant
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-rose-600 hover:bg-rose-700"
            disabled={uploading}
          >
            {uploading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}