'use client';

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";
import { Trash2, Upload, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminCarousel() {
  const [carousels, setCarousels] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch Banners from Backend
  const fetchCarousels = async () => {
    try {
      setFetching(true);
      const res = await axiosInstance.get("/admin/crousels/all");
      if (res.data.success) {
        setCarousels(res.data.carousels || []);
      }
    } catch (err) {
      console.error("Failed to fetch carousels:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Failed to load carousel banners.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  // Handle Local Image Selection and Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit New Banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a carousel banner image.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    // Ensure redirectUrl starts with a '/' if provided and not an external URL (http/https)
    let formattedRedirectUrl = redirectUrl.trim();
    if (formattedRedirectUrl) {
      if (!formattedRedirectUrl.startsWith("/") && !formattedRedirectUrl.startsWith("http")) {
        formattedRedirectUrl = `/${formattedRedirectUrl}`;
      }
    } else {
      formattedRedirectUrl = "/";
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("redirectUrl", formattedRedirectUrl);
    formData.append("image", image);

    setLoading(true);
    try {
      const res = await axiosInstance.post("/admin/crousels/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: res.data?.message || "Carousel banner uploaded successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        // Reset form
        setTitle("");
        setRedirectUrl("");
        setImage(null);
        setPreview(null);
        // Refresh list
        fetchCarousels();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: err.response?.data?.message || "Failed to add carousel banner.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Banner with Minimum 1 Requirement
  const handleDelete = async (id, bannerTitle) => {
    // Check if only one item remains
    if (carousels.length <= 1) {
      Swal.fire({
        icon: "error",
        title: "Deletion Restricted",
        text: "Cannot delete banner. Store must maintain at least 1 carousel banner.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${bannerTitle || 'Banner'}"?`,
      text: "This action cannot be undone.",
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
        const res = await axiosInstance.delete(`/admin/crousels/delete/${id}`);

        if (res.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: res.data?.message || "Carousel banner removed successfully.",
            timer: 1800,
            showConfirmButton: false,
          });

          setCarousels((prev) => prev.filter((item) => item._id !== id));
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: err.response?.data?.message || "Failed to remove banner.",
          confirmButtonColor: "#4F46E5",
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Carousel Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store hero banners (minimum 1 active banner required for store operations)
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Total: {carousels.length} Banners
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Banner Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-6">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Add New Slide Banner
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Banner Title / Label
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Collection 2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Redirect Path / Link
                </label>
                <input
                  type="text"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="e.g. /category/luxury-watches"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Banner Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Image Preview */}
              {preview && (
                <div className="relative w-full h-32 bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  <img src={preview} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Publish Banner</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Carousel List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Active Banners
            </h2>

            {fetching ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Loading banners...</span>
              </div>
            ) : carousels.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                <span>No carousel banners found.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {carousels.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition gap-3"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-24 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {item.title || "Untitled Banner"}
                      </h3>
                      <a
                        href={item.redirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 flex items-center gap-1 hover:underline truncate mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {item.redirectUrl || "/"}
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.title)}
                      disabled={carousels.length <= 1}
                      title={
                        carousels.length <= 1
                          ? "At least one banner must remain"
                          : "Remove Banner"
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                        carousels.length <= 1
                          ? "text-slate-300 border border-transparent cursor-not-allowed"
                          : "text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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