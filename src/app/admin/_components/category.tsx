"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

const API_URL = "https://4frnn03l-3000.inc1.devtunnels.ms/api/v1";

interface Category {
  _id: string;
  categoryname: string;
  catImg: string;
}

interface ImageFile {
  file: File;
  previewUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/category`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const data: ApiResponse<Category[]> = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      setCategories(data.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedImages.length + files.length > 1) {
      setError("You can only upload 1 image");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedImages((prev) => [...prev, { file, previewUrl }]);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!categoryName.trim()) {
      setError("Please enter a category name");
      return;
    }

    try {
      setLoading(true);

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
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error("Server returned non-JSON response");
        }

        const data: ApiResponse<Category> = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to update category");
        }
      } else {
        // ADD mode - require image
        if (selectedImages.length === 0) {
          setError("Please select an image");
          return;
        }

        const formData = new FormData();
        formData.append("name", categoryName.trim());
        formData.append("image", selectedImages[0].file);

        const response = await fetch(`${API_URL}/category`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error("Server returned non-JSON response");
        }

        const data: ApiResponse<Category> = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to add category");
        }
      }

      setCategoryName("");
      setSelectedImages([]);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingCategory ? "update" : "add"} category`;
      setError(errorMessage);
      console.error("Save category error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category._id);
    setCategoryName(category.categoryname);
    setSelectedImages([]);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName("");
    setSelectedImages([]);
    setError("");
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/category/${categoryToDelete._id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const data: ApiResponse<void> = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category";
      setError(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Category Management
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveCategory} className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!editingCategory && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
                      <img src={img.previewUrl} alt="" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 backdrop-blur-sm bg-red-500 bg-opacity-70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-opacity-90"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedImages.length < 1 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400">
                      <Plus size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                <Plus size={16} />
                {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>

          {loading && <div className="text-center py-4">Loading...</div>}

          {categories.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-800 font-medium">{cat.categoryname}</span>
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        onClick={() => handleEditCategory(cat)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <img
                      src={cat.catImg}
                      alt={cat.categoryname}
                      className="w-20 h-20 object-cover border rounded"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{categoryToDelete?.categoryname}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
  );
}