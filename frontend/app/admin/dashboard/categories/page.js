'use client';

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [adding, setAdding] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/general/category/all");
      const data = response.data?.categories || response.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Failed to load categories.",
        confirmColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add Category Handler with FormData
  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a category name.",
        confirmColor: "#4F46E5",
      });
      return;
    }

    if (!imageFile) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a portrait collection image.",
        confirmColor: "#4F46E5",
      });
      return;
    }

    try {
      setAdding(true);
      
      const formData = new FormData();
      formData.append("name", newCategoryName.trim());
      formData.append("image", imageFile);

      const response = await axiosInstance.post("/admin/product/category/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: response.data?.message || "Category created successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      setNewCategoryName("");
      setImageFile(null);
      // Reset file input element if needed
      const fileInput = document.getElementById("categoryImageInput");
      if (fileInput) fileInput.value = "";

      fetchCategories();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: err.response?.data?.message || "Something went wrong.",
        confirmColor: "#4F46E5",
      });
    } finally {
      setAdding(false);
    }
  };

  // Remove Category Handler with SweetAlert Confirmation
  const handleRemoveCategory = async (id, categoryName) => {
    if (categories.length <= 4) {
      Swal.fire({
        icon: "error",
        title: "Deletion Restricted",
        text: `Cannot delete '${categoryName}'. Store must maintain at least 4 categories. (Current count: ${categories.length})`,
        confirmColor: "#4F46E5",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${categoryName}"?`,
      text: "This action cannot be undone and will remove its image.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        Swal.showLoading();
        const response = await axiosInstance.delete(`/admin/product/category/delete/${id}`);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data?.message || "Category removed successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        fetchCategories();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: err.response?.data?.message || "Failed to remove category.",
          confirmColor: "#4F46E5",
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or remove catalog categories and collection images (minimum 4 required)
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Total: {categories.length} Categories
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-6">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Add New Category
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Luxury"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Collection Image (Portrait) *
                </label>
                <input
                  id="categoryImageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-500 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">Recommended format for collections: 3:4 portrait layout.</p>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {adding ? "Uploading..." : "+ Create Category"}
              </button>
            </form>
          </div>
        </div>

        {/* Category List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Existing Categories
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No categories found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* Portrait Collection Image Preview */}
                      <div className="w-10 h-14 bg-slate-100 rounded-md overflow-hidden border border-slate-200 relative shrink-0">
                        {cat.image ? (
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[9px] text-slate-400">No img</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">{cat.name}</h3>
                        <p className="text-[10px] text-slate-400">
                          Added: {new Date(cat.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat._id, cat.name)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}