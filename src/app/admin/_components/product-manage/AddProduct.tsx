
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
import { Plus } from "lucide-react"

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

interface Category {
  _id: string
  categoryname: string
}

interface FormData {
  name: string
  description: string
  single: string
  dozen: string
  carton: string
  brand: string
  categoryId: string
  points: string
  variants: string
  isFeature: boolean
}

interface AddProductProps {
  onAddProduct: (product: Product) => void
  categories?: Category[]
}

export function AddProduct({ onAddProduct, categories = [] }: AddProductProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    single: "",
    dozen: "",
    carton: "",
    brand: "",
    categoryId: "",
    points: "",
    variants: "",
    isFeature: false,
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setImages([])
      setImagePreviews([])
      setFormData({
        name: "",
        description: "",
        single: "",
        dozen: "",
        carton: "",
        brand: "",
        categoryId: "",
        points: "",
        variants: "",
        isFeature: false,
      })
    }
  }, [isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      alert("You can only upload a maximum of 5 images")
      return
    }
    setImages((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please add at least one image (max 5).")
      return
    }

    try {
      setUploading(true)
      const token = localStorage.getItem("adminToken")
      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("categoryId", formData.categoryId)
      data.append("brand", formData.brand)
      data.append("isFeature", formData.isFeature ? "true" : "false")
      
      // Points: convert to array of strings
      const pointsArray =
        formData.points && formData.points.trim() !== ""
          ? formData.points.split("\n").map((s) => s.trim()).filter(Boolean)
          : []
      data.append("points", JSON.stringify(pointsArray))

      // Variants: validate JSON
      if (formData.variants && formData.variants.trim() !== "") {
        try {
          JSON.parse(formData.variants)
          data.append("variants", formData.variants)
        } catch (jsonError) {
          alert("Invalid JSON format for variants")
          return
        }
      } else {
        data.append("variants", JSON.stringify([]))
      }

      // Add pricing
      data.append("pricing", JSON.stringify({
        single: Number.parseFloat(formData.single),
        dozen: Number.parseFloat(formData.dozen),
        carton: Number.parseFloat(formData.carton),
      }))

      images.forEach((img) => data.append("image", img))

      const res = await fetch("https://4frnn03l-3000.inc1.devtunnels.ms/api/v1/product", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      })

      const result = await res.json()
      if (res.ok) {
        const newProduct: Product = {
          id: Date.now(),
          name: formData.name,
          image: imagePreviews[0] || "/placeholder.svg?height=100&width=100",
          description: formData.description,
          pricing: {
            single: Number.parseFloat(formData.single),
            dozen: Number.parseFloat(formData.dozen),
            carton: Number.parseFloat(formData.carton),
          },
        }
        onAddProduct(newProduct)
        setIsOpen(false)
      } else {
        alert(result.message || "Failed to add product")
      }
    } catch (err) {
      console.error("Error adding product", err)
      alert("Error adding product")
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
          <div>
            <Label htmlFor="name" className="text-rose-700">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="brand" className="text-rose-700">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-rose-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-rose-700">Category</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-rose-200 rounded-md focus:border-rose-400"
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
            <Label htmlFor="points" className="text-rose-700">Points (one per line)</Label>
            <Textarea
              id="points"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              className="border-rose-200 focus:border-rose-400"
              placeholder="Enter product points, one per line"
            />
          </div>
          <div>
            <Label htmlFor="variants" className="text-rose-700">Variants (JSON format)</Label>
            <Textarea
              id="variants"
              value={formData.variants}
              onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
              className="border-rose-200 focus:border-rose-400 font-mono text-sm"
              placeholder='[{"size":"M","price":199},{"size":"L","price":249}]'
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeature"
              checked={formData.isFeature}
              onChange={(e) => setFormData({ ...formData, isFeature: e.target.checked })}
            />
            <Label htmlFor="isFeature" className="text-rose-700">Mark as Featured</Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="single" className="text-rose-700">1 pc ($)</Label>
              <Input
                id="single"
                type="number"
                value={formData.single}
                onChange={(e) => setFormData({ ...formData, single: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="dozen" className="text-rose-700">12 pcs ($)</Label>
              <Input
                id="dozen"
                type="number"
                value={formData.dozen}
                onChange={(e) => setFormData({ ...formData, dozen: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
            <div>
              <Label htmlFor="carton" className="text-rose-700">Carton ($)</Label>
              <Input
                id="carton"
                type="number"
                value={formData.carton}
                onChange={(e) => setFormData({ ...formData, carton: e.target.value })}
                className="border-rose-200 focus:border-rose-400"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="images" className="text-rose-700">Upload Images (Max 5)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border-rose-200 focus:border-rose-400"
            />
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border"
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