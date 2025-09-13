"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X, Trash2 } from "lucide-react"

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
  const [variants, setVariants] = useState<Variant[]>([
    { price: "", quantity: "1" },
    { price: "", quantity: "12Pcs" },
    { price: "", quantity: "Carton" },
  ])
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
      setVariants([
        { price: "", quantity: "1" },
        { price: "", quantity: "12Pcs" },
        { price: "", quantity: "Carton" },
      ])
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

  // Update variant values
  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    if (field === "price" && value && !/^\d*\.?\d*$/.test(value)) {
      return // Only allow numbers and decimal points for price
    }
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  // Add new variant (optional, beyond the fixed 3)
  const addVariant = () => {
    setVariants([...variants, { price: "", quantity: "" }])
  }

  // Remove variant (only for additional variants beyond the first 3)
  const removeVariant = (index: number) => {
    if (index >= 3) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  // Submit form
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
    const cleanedVariants = variants.map((v) => ({ ...v, price: v.price || "0" }))
    const fixedVariants = cleanedVariants.slice(0, 3)
    if (fixedVariants.some(v => !v.price || parseFloat(v.price) <= 0)) {
      setError("Please provide valid prices for all three required variants (Single, Dozen, Carton).")
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

      const res = await fetch("https://barber-syndicate.vercel.app/api/v1/product", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      const result = await res.json()
      console.log("Server response:", result)

      if (res.ok) {
        const newProduct: Product = {
          id: result._id || crypto.randomUUID(),
          name: formData.name,
          image: result.image || imagePreviews[0] || "/placeholder.svg?height=100&width=100",
          description: formData.description,
          pricing: {
            single: parseFloat(fixedVariants[0]?.price) || 0,
            dozen: parseFloat(fixedVariants[1]?.price) || 0,
            carton: parseFloat(fixedVariants[2]?.price) || 0,
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
        <Button className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="border-rose-200 max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50">
          <DialogTitle className="text-2xl font-bold text-rose-900 flex items-center">
            <Plus className="h-6 w-6 mr-2 text-rose-600" />
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-rose-600">
            Create a new product in your catalog with detailed pricing options
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Basic Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                Brand <span className="text-red-500">*</span>
              </Label>
              <select
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[100px]"
              placeholder="Enter product description..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-rose-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Featured Product</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeature"
                  checked={formData.isFeature}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeature: !!checked })}
                  className="border-rose-200 focus:ring-rose-500"
                />
                <Label htmlFor="isFeature" className="text-sm text-gray-600">
                  Mark as featured product
                </Label>
              </div>
            </div>
          </div>

          {/* Points Section */}
          <div className="space-y-2">
            <Label htmlFor="points" className="text-sm font-medium text-gray-700">
              Product Points (one per line)
            </Label>
            <Textarea
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 min-h-[80px]"
              placeholder="Enter product points/benefits, one per line..."
            />
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-100">
            <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center">
              Pricing Structure <span className="text-sm text-rose-600 ml-2">(Required)</span>
            </h3>
            <div className="space-y-4">
              {variants.slice(0, 3).map((v, i) => {
                const labels = ['Single Unit', 'Dozen (12 Pieces)', 'Carton']
                return (
                  <div key={i} className="flex items-end gap-3 bg-white p-4 rounded-md shadow-sm border border-rose-100">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {labels[i]}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Price for ${labels[i].toLowerCase()}`}
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                        className="border-rose-200 focus:border-rose-500 focus:ring-rose-500 text-lg font-medium"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">{v.quantity}</p>
                    </div>
                  </div>
                )
              })}
              
              {/* Optional Additional Variants */}
              {variants.length > 3 && (
                <>
                  <div className="border-t border-rose-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Variants</h4>
                    {variants.slice(3).map((v, i) => (
                      <div key={i + 3} className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-md">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i + 3, "price", e.target.value)}
                          className="flex-1 border-rose-200 focus:border-rose-500"
                        />
                        <Input
                          type="text"
                          placeholder="Quantity"
                          value={v.quantity}
                          onChange={(e) => updateVariant(i + 3, "quantity", e.target.value)}
                          className="flex-1 border-rose-200 focus:border-rose-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(i + 3)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariant}
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                  >
                    + Add Custom Variant
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium text-gray-700">
              Product Images <span className="text-rose-600">(At least 1, max 5)</span>
            </Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border-rose-200 focus:border-rose-500 focus:ring-rose-500"
            />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-24 bg-gray-100 rounded-md overflow-hidden border border-rose-200">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {images.length + (imagePreviews.length - 1) >= 5 && (
                      <div className="absolute bottom-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                        Max
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {imagePreviews.length < 5 && (
              <p className="text-xs text-gray-500 mt-1">
                You can upload {5 - imagePreviews.length} more image{5 - imagePreviews.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading || !formData.name || !formData.categoryId || !formData.brand || images.length === 0}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Product...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}