"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ImageIcon,
  Search,
  Filter,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Grid3X3,
  List,
} from "lucide-react"

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
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])
  const [categoryName, setCategoryName] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [dragOver, setDragOver] = useState<boolean>(false)

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("adminToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.categoryname.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFileSelection(files)
  }

  const handleFileSelection = (files: File[]) => {
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
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileSelection(files)
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

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

        setSuccess("Category updated successfully!")
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

        setSuccess("Category added successfully!")
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
    setSuccess("")
    setShowForm(true) // Show form when editing
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setCategoryName("")
    setSelectedImages([])
    setError("")
    setSuccess("")
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
      setSuccess("Category deleted successfully!")
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
    setSuccess("")
    await fetchCategories()
  }

  const toggleCategorySelection = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
  }

  const selectAllCategories = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(filteredCategories.map((cat) => cat._id)))
    }
  }

  const exportCategories = () => {
    const dataStr = JSON.stringify(categories, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `categories-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Category Management
                </h1>
                <p className="text-slate-600 mt-1">Organize and manage your product categories</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportCategories}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="text-green-400 hover:text-green-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {showForm ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
              {editingCategory ? (
                <>
                  <Edit className="w-6 h-6 text-blue-600" />
                  Edit Category
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-blue-600" />
                  Add New Category
                </>
              )}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Category Image</label>
                  <div className="space-y-4">
                    {/* Image previews */}
                    {selectedImages.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {selectedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="w-32 h-32 border-2 border-slate-200 rounded-xl overflow-hidden shadow-md">
                              <img
                                src={img.previewUrl || "/placeholder.svg"}
                                alt=""
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drag and drop area */}
                    {selectedImages.length < 1 && (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          dragOver
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? "text-blue-500" : "text-slate-400"}`} />
                        <p className={`text-lg font-medium mb-2 ${dragOver ? "text-blue-600" : "text-slate-600"}`}>
                          {dragOver ? "Drop your image here" : "Drag & drop an image here"}
                        </p>
                        <p className="text-slate-500 mb-4">or</p>
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 shadow-md">
                          <Plus className="w-4 h-4" />
                          Choose File
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <p className="text-xs text-slate-400 mt-3">Maximum file size: 2MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : editingCategory ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Show Form
            </button>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
              <Filter className="w-6 h-6 text-blue-600" />
              Categories ({filteredCategories.length})
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 w-full sm:w-64"
                />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          {filteredCategories.length > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
              <button
                onClick={selectAllCategories}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <div
                  className={`w-4 h-4 border-2 rounded ${
                    selectedCategories.size === filteredCategories.length
                      ? "bg-blue-600 border-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {selectedCategories.size === filteredCategories.length && <Check className="w-3 h-3 text-white" />}
                </div>
                {selectedCategories.size === filteredCategories.length ? "Deselect All" : "Select All"}
              </button>

              {selectedCategories.size > 0 && (
                <span className="text-sm text-slate-600">{selectedCategories.size} selected</span>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <span className="text-slate-600 text-lg">Loading categories...</span>
              </div>
            </div>
          )}

          {filteredCategories.length === 0 && !loading ? (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <p className="text-slate-500 text-xl mb-2">{searchTerm ? "No categories found" : "No categories yet"}</p>
              <p className="text-slate-400">
                {searchTerm ? "Try adjusting your search terms" : "Add your first category to get started"}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`group bg-white/60 hover:bg-white/80 rounded-xl border border-white/40 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    viewMode === "list" ? "flex items-center p-4" : "p-6"
                  }`}
                >
                  {/* Selection checkbox */}
                  <div className={`${viewMode === "list" ? "mr-4" : "mb-4"}`}>
                    <button
                      onClick={() => toggleCategorySelection(cat._id)}
                      className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
                        selectedCategories.has(cat._id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {selectedCategories.has(cat._id) && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>

                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 text-lg truncate pr-2 flex-1">
                          {cat.categoryname}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                            onClick={() => handleEditCategory(cat)}
                            title="Edit category"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Delete category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-200 shadow-md">
                        <img
                          src={cat.catImg || "/placeholder.svg"}
                          alt={cat.categoryname}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shadow-md mr-4 flex-shrink-0">
                        <img
                          src={cat.catImg || "/placeholder.svg"}
                          alt={cat.categoryname}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            ;(e.target as HTMLImageElement).src = "/abstract-categories.png"
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-lg">{cat.categoryname}</h3>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          onClick={() => handleEditCategory(cat)}
                          title="Edit category"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cat)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Delete</h2>
              <p className="text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">"{categoryToDelete?.categoryname}"</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={handleDeleteCategory}
                disabled={loading}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
