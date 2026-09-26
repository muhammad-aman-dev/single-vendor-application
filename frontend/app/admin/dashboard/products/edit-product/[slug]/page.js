'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";
import axiosInstance from "@/lib/axiosInstance";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const MAX_IMAGES = 6;

export default function EditProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  // Local state for existing server images & newly staged local File objects
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    detailedDescription: "",
    category: "",
    gender: "Unisex",
    price: 0,
    comparePrice: 0,
    stock: 0,
    status: "Active",
    featured: false,
    variations: [],
    seo: {
      title: "",
      description: "",
      keywords: [],
    },
  });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  // Fetch Categories and Product Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const catRes = await axiosInstance.get("/general/category/all");
        setCategories(catRes.data?.categories || catRes.data || []);

        const prodRes = await axiosInstance.get(`/admin/product/get-product-edit/${slug}`);
        const product = prodRes.data?.product;

        if (product) {
          let parsedKeywords = [];
          if (Array.isArray(product.seo?.keywords)) {
            parsedKeywords = product.seo.keywords;
          } else if (typeof product.seo?.keywords === "string") {
            parsedKeywords = product.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean);
          }

          // Schema's variations.values only has { value, stock } — drop any
          // stray "price" field that might exist on older/legacy records.
          const normalizedVariations = (product.variations || []).map((variation) => ({
            option: variation.option || "",
            values: (variation.values || []).map((val) => ({
              value: val.value || "",
              stock: val.stock ?? "",
            })),
          }));

          setFormData({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            detailedDescription: product.detailedDescription || "",
            category: product.category || "",
            gender: product.gender || "Unisex",
            price: product.price || 0,
            comparePrice: product.comparePrice || 0,
            stock: product.stock || 0,
            status: product.status || "Active",
            featured: product.featured || false,
            variations: normalizedVariations,
            seo: {
              title: product.seo?.title || "",
              description: product.seo?.description || "",
              keywords: parsedKeywords,
            },
          });

          // Standardize existing image format
          const formattedExisting = (product.images || []).map((img) =>
            typeof img === "string" ? { url: img, alt: product.name || "" } : img
          );
          setExistingImages(formattedExisting);
        }
      } catch (err) {
        console.error("Failed to load product edit data:", err);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: err.response?.data?.message || "Failed to load product details.",
          confirmButtonColor: "#4F46E5",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newImageFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [newImageFiles]);

  const formatSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  };

  // Handle standard input changes & automatic slug sync if matching previous slug format
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name" && (!prev.slug || prev.slug === formatSlug(prev.name))) {
        updated.slug = formatSlug(value);
      }

      if (name === "slug") {
        updated.slug = formatSlug(value);
      }

      return updated;
    });
  };

  const handleDetailedDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      detailedDescription: content,
    }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  };

  // Keyword Management Handlers
  const addKeyword = () => {
    const keyword = keywordInput.trim().replace(/,/g, "");
    if (!keyword) return;

    if (!formData.seo.keywords.includes(keyword)) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keyword],
        },
      }));
    }
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((kw) => kw !== keywordToRemove),
      },
    }));
  };

  // ---- Variations: schema only supports { value, stock } per value ----
  // (productModel.js -> variations.values = [{ value, stock }])
  // No per-value price exists in the schema, so it's removed here.
  const addVariation = () => {
    setFormData((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          option: "",
          values: [{ value: "", stock: "" }],
        },
      ],
    }));
  };

  const removeVariation = (variationIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== variationIndex),
    }));
  };

  const updateVariationOption = (variationIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === variationIndex ? { ...v, option: value } : v
      ),
    }));
  };

  const addVariationValue = (variationIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === variationIndex
          ? { ...v, values: [...v.values, { value: "", stock: "" }] }
          : v
      ),
    }));
  };

  const removeVariationValue = (variationIndex, valueIndex) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === variationIndex
          ? { ...v, values: v.values.filter((_, idx) => idx !== valueIndex) }
          : v
      ),
    }));
  };

  const updateVariationValue = (variationIndex, valueIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v, i) =>
        i === variationIndex
          ? {
              ...v,
              values: v.values.map((item, idx) =>
                idx === valueIndex ? { ...item, [field]: value } : item
              ),
            }
          : v
      ),
    }));
  };

  // Browser Compression & File Selection Handler
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const currentTotal = existingImages.length + newImageFiles.length;
    if (currentTotal + files.length > MAX_IMAGES) {
      Swal.fire({
        icon: "warning",
        title: "Limit Exceeded",
        text: `You can only have up to ${MAX_IMAGES} images in total.`,
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setCompressing(true);

      const compressionOptions = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const compressedBlob = await imageCompression(file, compressionOptions);
          const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type || file.type,
            lastModified: Date.now(),
          });

          return {
            file: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
            alt: "",
          };
        })
      );

      setNewImageFiles((prev) => [...prev, ...processedFiles]);
    } catch (err) {
      console.error("Error processing images:", err);
      Swal.fire({
        icon: "error",
        title: "Processing Failed",
        text: "Could not process selected images.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Alt Text Updates
  const handleExistingAltChange = (index, value) => {
    setExistingImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], alt: value };
      return updated;
    });
  };

  const handleNewAltChange = (index, value) => {
    setNewImageFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], alt: value };
      return updated;
    });
  };

  // Image Removal Handlers
  const removeExistingImage = async (index) => {
    if (existingImages.length + newImageFiles.length === 1) {
      Swal.fire({
        icon: "warning",
        title: "Action Restricted",
        text: "At least one product image is required.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Remove this image?",
      text: "This image will be permanently removed when you save changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, remove",
    });

    if (confirm.isConfirmed) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => {
      if (prev[index]?.previewUrl) URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Handler using Multipart FormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImageFiles.length;
    if (!formData.name || !formData.category || !formData.price || totalImages === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please complete all required fields (Name, Category, Price, and at least 1 Image).",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    // Validation: Ensure every image (both existing and new) has alt text
    const hasEmptyExistingAlt = existingImages.some((img) => !img.alt || !img.alt.trim());
    const hasEmptyNewAlt = newImageFiles.some((item) => !item.alt || !item.alt.trim());
    if (hasEmptyExistingAlt || hasEmptyNewAlt) {
      Swal.fire({
        icon: "warning",
        title: "Alt Text Required",
        text: "Please fill out the Alt Text field for all uploaded and existing images.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      // Basic Text Fields
      data.append("name", formData.name.trim());
      data.append("newSlug", formData.slug || formatSlug(formData.name));
      data.append("description", formData.description.trim());
      data.append("detailedDescription", formData.detailedDescription);
      data.append("category", formData.category);
      data.append("gender", formData.gender);
      data.append("price", Number(formData.price || 0));
      data.append("comparePrice", formData.comparePrice ? Number(formData.comparePrice) : 0);
      data.append("stock", Number(formData.stock || 0));
      data.append("status", formData.status);
      data.append("featured", String(formData.featured));

      // JSON Stringified Payload for Backend Middleware Parser
      data.append("existingImages", JSON.stringify(existingImages));

      const filteredVariations = formData.variations
        .filter((v) => v.option.trim() !== "")
        .map((variation) => ({
          option: variation.option.trim(),
          values: variation.values
            .filter((item) => item.value.trim() !== "")
            .map((item) => ({
              value: item.value.trim(),
              stock: Number(item.stock || 0),
            })),
        }))
        .filter((v) => v.values.length > 0);

      data.append("variations", JSON.stringify(filteredVariations));

      data.append("seo", JSON.stringify(formData.seo));

      // Append image alts array matching the order of new binary uploads
      const imageAlts = newImageFiles.map((item) => item.alt.trim());
      data.append("imageAlts", JSON.stringify(imageAlts));

      // Binary Files
      newImageFiles.forEach((item) => {
        data.append("images", item.file);
      });

      const res = await axiosInstance.put(`/admin/product/edit/update/${slug}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: res.data?.message || "Product updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      router.push("/admin/dashboard/products");
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-sans">
        Loading product information...
      </div>
    );
  }

  const totalImageCount = existingImages.length + newImageFiles.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">Editing: <span className="font-semibold text-slate-700">{formData.name}</span></p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          ← Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Specifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            General Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Short Description *</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Description (Rich Text Output)</label>
            <div className="bg-slate-50 border border-slate-300 rounded-lg overflow-hidden focus-within:bg-white focus-within:border-indigo-600">
              <ReactQuill
                theme="snow"
                value={formData.detailedDescription}
                onChange={handleDetailedDescriptionChange}
                modules={quillModules}
                placeholder="In-depth specifications, build quality, and warranty information..."
                className="text-sm bg-white h-64 border-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price (PKR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min={0}
                step="0.01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Compare Price</label>
              <input
                type="number"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleInputChange}
                min={0}
                step="0.01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min={0}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600"
              >
                <option value="Active">Active</option>
                <option value="Out Of Stock">Out Of Stock</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 accent-indigo-600"
            />
            <label htmlFor="featured" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as Featured Product
            </label>
          </div>
        </div>

        {/* Product Options & Variations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Options & Variations
            </h2>
            <button
              type="button"
              onClick={addVariation}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md transition"
            >
              + Add Option
            </button>
          </div>
          <p className="text-[11px] text-slate-400 -mt-2">
            Variants track name and stock only. Pricing stays global (see Pricing &amp; Inventory above).
          </p>

          {formData.variations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No variants added. This product uses global price and inventory.</p>
          ) : (
            <div className="space-y-4">
              {formData.variations.map((variation, vIdx) => (
                <div key={vIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Option Name (e.g. Size, Color, Material)"
                      value={variation.option}
                      onChange={(e) => updateVariationOption(vIdx, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-medium outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariation(vIdx)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {variation.values.map((val, valIdx) => (
                      <div key={valIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Value (e.g. XL, Red)"
                          value={val.value}
                          onChange={(e) => updateVariationValue(vIdx, valIdx, "value", e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          min="0"
                          value={val.stock}
                          onChange={(e) => updateVariationValue(vIdx, valIdx, "stock", e.target.value)}
                          className="w-24 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariationValue(vIdx, valIdx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addVariationValue(vIdx)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 mt-1"
                  >
                    + Add Value
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Images */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Product Images ({totalImageCount}/{MAX_IMAGES})
              </h2>
              <p className="text-[11px] text-slate-500">Max 6 images supported.</p>
            </div>

            {totalImageCount < MAX_IMAGES && (
              <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1.5">
                {compressing ? "Compressing..." : "+ Select New Images"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={compressing || totalImageCount >= MAX_IMAGES}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Existing Cloudinary Images */}
            {existingImages.map((img, idx) => (
              <div key={`existing-${idx}`} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <img
                  src={img.url}
                  alt={img.alt || "Product image"}
                  className="w-16 h-16 object-cover rounded-md border border-slate-300 bg-white shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block text-[9px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    Existing
                  </span>
                  <input
                    type="text"
                    value={img.alt || ""}
                    onChange={(e) => handleExistingAltChange(idx, e.target.value)}
                    placeholder="Image description for SEO"
                    required
                    maxLength={150}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-200 shrink-0 cursor-pointer transition"
                >
                  Remove
                </button>
              </div>
            ))}

            {/* New Local Compressed Images */}
            {newImageFiles.map((item, idx) => (
              <div key={`new-${idx}`} className="flex gap-3 items-center bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                <img
                  src={item.previewUrl}
                  alt="New product upload"
                  className="w-16 h-16 object-cover rounded-md border border-amber-300 bg-white shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block text-[9px] font-bold text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                    New (Compressed)
                  </span>
                  <input
                    type="text"
                    value={item.alt}
                    onChange={(e) => handleNewAltChange(idx, e.target.value)}
                    placeholder="Image description for SEO"
                    required
                    maxLength={150}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none focus:border-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {item.file?.size ? `${(item.file.size / 1024).toFixed(1)} KB` : ""}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-200 shrink-0 cursor-pointer transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search Engine Optimization (SEO) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Search Engine Optimization (SEO)
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
              <input
                type="text"
                name="title"
                value={formData.seo.title}
                onChange={handleSeoChange}
                maxLength={70}
                placeholder="SEO title (max 70 chars)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400">{formData.seo.title.length}/70 characters</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
              <textarea
                name="description"
                value={formData.seo.description}
                onChange={handleSeoChange}
                maxLength={160}
                rows={2}
                placeholder="SEO description (max 160 chars)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
              />
              <span className="text-[10px] text-slate-400">{formData.seo.description.length}/160 characters</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="Add keyword and press Enter or Add"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.seo.keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Google Search SERP Preview
            </span>
            <div className="bg-white border border-slate-200 rounded-lg p-4 font-sans max-w-xl">
              <div className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">G</span>
                <span className="truncate">https://yourstore.com › products › {formData.slug || "product-slug"}</span>
              </div>
              <div className="text-blue-800 font-medium text-base hover:underline cursor-pointer truncate">
                {formData.seo.title || formData.name || "Product Title Preview"}
              </div>
              <div className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                {formData.seo.description || formData.description || "Add an SEO description or product summary to preview how this listing appears in Google search engine result pages."}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || compressing}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            {submitting ? "Saving Changes..." : "Save Product Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}