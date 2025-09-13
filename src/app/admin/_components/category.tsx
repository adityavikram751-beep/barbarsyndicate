"use client"

import type React from "react"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Plus, Edit, Trash2, RefreshCw, ImageIcon } from "lucide-react"

const API_URL = "https://barber-syndicate.vercel.app/api/v1"

interface Category {
  _id: string
  categoryname: string
  catImg: string
}

interface ImageFile {
  file: File
  previewUrl: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])
  const [categoryName, setCategoryName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<boolean>(true)

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("adminToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/category`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data: ApiResponse<Category[]> = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch categories")
      }

      setCategories(data.data || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories"
      setError(errorMessage)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (selectedImages.length + files.length > 1) {
      setError("You can only upload 1 image")
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setSelectedImages((prev) => [...prev, { file, previewUrl }])
    })
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!categoryName.trim()) {
      setError("Please enter a category name")
      return
    }

    try {
      setLoading(true)

      if (editingCategory) {
        // EDIT mode - only update name
        const response = await fetch(`${API_URL}/category/${editingCategory}`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: categoryName.trim() }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server returned non-JSON response")
        }

        const data: ApiResponse<Category> = await response.json()
        if (!data.success) {
          throw new Error(data.message || "Failed to update category")
        }
      } else {
        // ADD mode - require image
        if (selectedImages.length === 0) {
          setError("Please select an image")
          return
        }

        const formData = new FormData()
        formData.append("name", categoryName.trim())
        formData.append("image", selectedImages[0].file)

        const response = await fetch(`${API_URL}/category`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server returned non-JSON response")
        }

        const data: ApiResponse<Category> = await response.json()
        if (!data.success) {
          throw new Error(data.message || "Failed to add category")
        }
      }

      setCategoryName("")
      setSelectedImages([])
      setEditingCategory(null)
      await fetchCategories() // Auto-refresh after successful save
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${editingCategory ? "update" : "add"} category`
      setError(errorMessage)
      console.error("Save category error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category._id)
    setCategoryName(category.categoryname)
    setSelectedImages([])
    setError("")
    setShowForm(true) // Show form when editing
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setCategoryName("")
    setSelectedImages([])
    setError("")
  }

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/category/${categoryToDelete._id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data: ApiResponse<void> = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Failed to delete category")
      }

      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      setShowForm(false) // Hide form after successful delete
      await fetchCategories() // Auto-refresh after successful delete
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category"
      setError(errorMessage)
      console.error("Delete error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setError("")
    await fetchCategories()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Category Management</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <p className="text-slate-600">Manage your product categories and organize your inventory</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-600 text-sm font-bold">!</span>
            </div>
            <span>{error}</span>
          </div>
        )}

        {showForm ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category Image</label>
                  <div className="flex flex-wrap gap-4">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="w-24 h-24 border-2 border-slate-200 rounded-lg overflow-hidden">
                          <img src={img.previewUrl || "/placeholder.svg"} alt="" className="object-cover w-full h-full" />
                        </div>
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors shadow-lg"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 1 && (
                      <label className="w-24 h-24 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors group">
                        <Plus className="w-6 h-6 mb-1 group-hover:text-slate-500" />
                        <span className="text-xs">Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                  disabled={loading}
                >
                  <Plus size={16} />
                  {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Show Form
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Categories</h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
              <span className="text-slate-600">Loading categories...</span>
            </div>
          )}

          {categories.length === 0 && !loading ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No categories found</p>
              <p className="text-slate-400 text-sm">Add your first category to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="group bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 p-6 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-lg truncate pr-2">{cat.categoryname}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={() => handleEditCategory(cat)}
                        title="Edit category"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                    <img
                      src={cat.catImg || "/placeholder.svg"}
                      alt={cat.categoryname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        ;(e.target as HTMLImageElement).src = "/category-placeholder.png"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Confirm Delete</h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">{categoryToDelete?.categoryname}</span>? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                onClick={handleDeleteCategory}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}