"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import Image from "next/image"

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

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Rose Gold Lipstick Set",
    image: "/placeholder.svg?height=100&width=100",
    description: "Premium rose gold lipstick collection with 12 stunning shades",
    pricing: { single: 25.99, dozen: 280.0, carton: 1200.0 },
  },
  {
    id: 2,
    name: "Hydrating Face Serum",
    image: "/placeholder.svg?height=100&width=100",
    description: "Advanced hydrating serum with hyaluronic acid and vitamin C",
    pricing: { single: 45.99, dozen: 520.0, carton: 2200.0 },
  },
]

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    single: "",
    dozen: "",
    carton: "",
  })

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      image: "/placeholder.svg?height=100&width=100",
      description: formData.description,
      pricing: {
        single: Number.parseFloat(formData.single),
        dozen: Number.parseFloat(formData.dozen),
        carton: Number.parseFloat(formData.carton),
      },
    }
    setProducts([...products, newProduct])
    setFormData({ name: "", description: "", single: "", dozen: "", carton: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = () => {
    if (!editingProduct) return

    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            pricing: {
              single: Number.parseFloat(formData.single),
              dozen: Number.parseFloat(formData.dozen),
              carton: Number.parseFloat(formData.carton),
            },
          }
        : p,
    )
    setProducts(updatedProducts)
    setEditingProduct(null)
    setFormData({ name: "", description: "", single: "", dozen: "", carton: "" })
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      single: product.pricing.single.toString(),
      dozen: product.pricing.dozen.toString(),
      carton: product.pricing.carton.toString(),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-900">Product Management</h1>
          <p className="text-rose-600">Manage your cosmetic product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <Label htmlFor="name" className="text-rose-700">
                  Product Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-rose-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="single" className="text-rose-700">
                    1 pc ($)
                  </Label>
                  <Input
                    id="single"
                    type="number"
                    value={formData.single}
                    onChange={(e) => setFormData({ ...formData, single: e.target.value })}
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>
                <div>
                  <Label htmlFor="dozen" className="text-rose-700">
                    12 pcs ($)
                  </Label>
                  <Input
                    id="dozen"
                    type="number"
                    value={formData.dozen}
                    onChange={(e) => setFormData({ ...formData, dozen: e.target.value })}
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>
                <div>
                  <Label htmlFor="carton" className="text-rose-700">
                    Carton ($)
                  </Label>
                  <Input
                    id="carton"
                    type="number"
                    value={formData.carton}
                    onChange={(e) => setFormData({ ...formData, carton: e.target.value })}
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-rose-600 hover:bg-rose-700">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                          src={product.image || "/placeholder.svg"}
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
                    <TableCell className="text-rose-700">${product.pricing.single}</TableCell>
                    <TableCell className="text-rose-700">${product.pricing.dozen}</TableCell>
                    <TableCell className="text-rose-700">${product.pricing.carton}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={editingProduct?.id === product.id}
                          onOpenChange={(open) => !open && setEditingProduct(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(product)}
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
                              <Button onClick={handleEditProduct} className="w-full bg-rose-600 hover:bg-rose-700">
                                Update Product
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
