"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  image: string
  description: string
  pricing: {
    single: number
    dozen: number
    carton: number
  }
  brand?: string
  categoryId?: string
  points?: string[]
  isFeature?: boolean
  variants?: { price: string; quantity: string }[]
  images?: string[]
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

interface AddProductProps {
  onAddProduct: (product: Product) => void
}

export function AddProduct({ onAddProduct }: AddProductProps) {
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
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  // Fetch categories and brands
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/category")
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
        const res = await fetch("https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/brands")
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

  // Clean up image previews to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setImages([])
      setImagePreviews([])
      setVariants([{ price: "", quantity: "" }])
      setFormData({
        name: "",
        description: "",
        brand: "",
        categoryId: "",
        points: "",
        isFeature: false,
      })
      setError(null)
    }
  }, [isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      setError("You can only upload a maximum of 5 images")
      return
    }
    setImages((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    setError(null)
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      const url = prev[index]
      URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  // ---- Variants Handling ----
  const addVariant = () => {
    setVariants([...variants, { price: "", quantity: "" }])
  }

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    if ((field === "price" || field === "quantity") && value && !/^\d*\.?\d*$/.test(value)) {
      return // Only allow numbers and decimal points
    }
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // ---- Submit ----
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.categoryId || !formData.brand) {
      setError("Please fill in all required fields (Name, Category, Brand).")
      return
    }
    if (images.length === 0) {
      setError("Please add at least one image (max 5).")
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

      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("categoryId", formData.categoryId)
      data.append("brand", formData.brand)
      data.append("isFeature", formData.isFeature ? "true" : "false")
      const pointsArray =
        formData.points && formData.points.trim() !== ""
          ? formData.points.split("\n").map((s) => s.trim()).filter(Boolean)
          : []
      data.append("points", JSON.stringify(pointsArray))
      data.append("variants", JSON.stringify(cleanedVariants))
      images.forEach((img) => data.append("image", img))

      // Log FormData for debugging
      for (const [key, value] of data.entries()) {
        console.log(`${key}:`, value)
      }

      const res = await fetch("https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      const result = await res.json()
      console.log("Server response:", result)

      if (res.ok) {
        const newProduct: Product = {
          id: result._id || crypto.randomUUID(), // Use server-provided ID or generate a UUID
          name: formData.name,
          image: result.image || imagePreviews[0] || "/placeholder.svg?height=100&width=100",
          description: formData.description,
          pricing: {
            single: parseFloat(cleanedVariants[0]?.price) || 0,
            dozen: parseFloat(cleanedVariants[1]?.price) || 0,
            carton: parseFloat(cleanedVariants[2]?.price) || 0,
          },
          brand: formData.brand,
          categoryId: formData.categoryId,
          points: pointsArray,
          isFeature: formData.isFeature,
          variants: cleanedVariants,
          images: result.images || imagePreviews,
        }
        onAddProduct(newProduct)
        setIsOpen(false)
      } else {
        setError(result.message || "Failed to add product")
      }
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error adding product. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="border-rose-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-900">Add New Product</DialogTitle>
          <DialogDescription>Create a new product in your catalog</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          {/* Brand Select */}
          <div>
            <Label htmlFor="brand">Brand</Label>
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
          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          {/* Category Select */}
          <div>
            <Label htmlFor="category">Category</Label>
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
          {/* Points */}
          <div>
            <Label htmlFor="points">Points (one per line)</Label>
            <Textarea
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              placeholder="Enter product points, one per line"
            />
          </div>
          {/* Variants */}
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
                  type="string"
                  placeholder="Quantity"
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
          {/* Images */}
          <div>
            <Label htmlFor="images">Upload Images (Max 5)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <Image
                      src={preview}
                      alt="Preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-rose-600 hover:bg-rose-700"
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}