'use client';

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import imageCompression from "browser-image-compression";
import axiosInstance from "@/lib/axiosInstance.js";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function AddProduct() {
  const fileInputRef = useRef(null);

  const initialFormState = {
    name: "",
    slug: "",
    description: "",
    detailedDescription: "",
    category: "Uncategorized",
    gender: "Unisex",
    price: "",
    comparePrice: "",
    stock: "",
    status: "Active",
    featured: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [imageItems, setImageItems] = useState([]);
  const [variations, setVariations] = useState([]);

  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: [],
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await axiosInstance.get("/general/category/all");
        const data = response.data?.categories || response.data || [];
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  };

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [imageItems]);

  const handleChange = (e) => {
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
    setSeo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);

    if (imageItems.length + files.length > 6) {
      setError("Maximum 6 images are allowed in total");
      return;
    }

    setError("");
    setCompressing(true);

    try {
      const compressionOptions = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedItems = await Promise.all(
        files.map(async (file) => {
          const compressedFile = await imageCompression(file, compressionOptions);
          return {
            file: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
            alt: "",
          };
        })
      );

      setImageItems((prev) => [...prev, ...compressedItems]);
    } catch (err) {
      console.error("Image Compression Error:", err);
      setError("Failed to compress image(s). Please try smaller files.");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateImageAlt = (index, altValue) => {
    setImageItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, alt: altValue } : item))
    );
  };

  const removeImage = (index) => {
    setImageItems((prev) => {
      const itemToRemove = prev[index];
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((_, idx) => idx !== index);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---- Variations: schema only supports { value, stock } per value ----
  // (productModel.js -> variations.values = [{ value, stock }])
  // No per-value price/comparePrice exists in the schema, so it's removed here.
  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      {
        option: "",
        values: [
          {
            value: "",
            stock: "",
          },
        ],
      },
    ]);
  };

  const removeVariation = (variationIndex) => {
    setVariations((prev) => prev.filter((_, i) => i !== variationIndex));
  };

  const updateVariationOption = (variationIndex, value) => {
    setVariations((prev) =>
      prev.map((variation, i) =>
        i === variationIndex ? { ...variation, option: value } : variation
      )
    );
  };

  const addVariationValue = (variationIndex) => {
    setVariations((prev) =>
      prev.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              values: [...variation.values, { value: "", stock: "" }],
            }
          : variation
      )
    );
  };

  const removeVariationValue = (variationIndex, valueIndex) => {
    setVariations((prev) =>
      prev.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              values: variation.values.filter((_, index) => index !== valueIndex),
            }
          : variation
      )
    );
  };

  const updateVariationValue = (variationIndex, valueIndex, field, value) => {
    setVariations((prev) =>
      prev.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              values: variation.values.map((item, index) =>
                index === valueIndex ? { ...item, [field]: value } : item
              ),
            }
          : variation
      )
    );
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim().replace(/,/g, "");
    if (!keyword) return;

    if (!seo.keywords.includes(keyword)) {
      setSeo((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
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

  const removeKeyword = (keyword) => {
    setSeo((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((item) => item !== keyword),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (imageItems.length === 0) {
      setError("Please select at least one product image");
      return;
    }

    if (imageItems.length > 6) {
      setError("Maximum 6 images are allowed");
      return;
    }

    const hasEmptyAlt = imageItems.some((item) => !item.alt.trim());
    if (hasEmptyAlt) {
      setError("Please fill out the Alt Text field for all uploaded images.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("slug", formData.slug || formatSlug(formData.name));
      data.append("description", formData.description.trim());
      data.append("detailedDescription", formData.detailedDescription);
      data.append("category", formData.category || "Uncategorized");
      data.append("gender", formData.gender);
      data.append("price", Number(formData.price || 0));
      if (formData.comparePrice) {
        data.append("comparePrice", Number(formData.comparePrice));
      }
      data.append("stock", Number(formData.stock || 0));
      data.append("status", formData.status);
      data.append("featured", String(formData.featured));

      const imageAltTexts = [];
      imageItems.forEach((item) => {
        data.append("images", item.file);
        imageAltTexts.push(item.alt.trim());
      });

      data.append("imageAlts", JSON.stringify(imageAltTexts));

      if (variations.length > 0) {
        const filteredVariations = variations
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

        if (filteredVariations.length > 0) {
          data.append("variations", JSON.stringify(filteredVariations));
        }
      }

      data.append("seo", JSON.stringify(seo));

      const response = await axiosInstance.post(
        "/admin/product/add-product",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(response.data?.message || "Product added successfully");

      setFormData(initialFormState);
      setImageItems([]);
      setVariations([]);
      setSeo({
        title: "",
        description: "",
        keywords: [],
      });
      setKeywordInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Add Product Error:", err);
      setError(
        err.response?.data?.message || "Failed to add product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure product metadata, variants, pricing, and SEO parameters</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
          <span className="font-bold">Success:</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Title *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Royal Chronograph Watch"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Slug (URL Route) *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="royal-chronograph-watch"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                  />
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800">
                    <span className="font-bold">Warning / Note:</span> Slugs must be <strong>unique</strong> across all store products. Hyphens (`-`) are kept intact for clean SEO URLs.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Short Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="Summary description for catalog listing..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
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

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Product Images & Alt Text (Max 6)
              </h2>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImages}
                  disabled={imageItems.length >= 6 || compressing}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 disabled:opacity-50 cursor-pointer"
                />
                {compressing && (
                  <p className="text-[11px] text-indigo-600 mt-1 font-medium animate-pulse">
                    Compressing image(s) below ~300 KB...
                  </p>
                )}
              </div>

              {imageItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {imageItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-slate-50 border border-slate-200 p-2.5 rounded-lg relative">
                      <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 shrink-0 bg-white">
                        <img src={item.previewUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Alt Text (Image {idx + 1}) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={150}
                          value={item.alt}
                          onChange={(e) => updateImageAlt(idx, e.target.value)}
                          placeholder="Describe image for SEO & accessibility"
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none focus:border-indigo-600"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          {(item.file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Image"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                Variants track name and stock only. Pricing stays global (see Pricing & Stock).
              </p>

              {variations.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No variants added. This product will use global price and inventory.</p>
              ) : (
                <div className="space-y-4">
                  {variations.map((variation, vIdx) => (
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
                          <div key={valIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Value (e.g. XL, Red)"
                              value={val.value}
                              onChange={(e) => updateVariationValue(vIdx, valIdx, "value", e.target.value)}
                              className="sm:col-span-8 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none"
                            />
                            <input
                              type="number"
                              placeholder="Stock"
                              min="0"
                              value={val.stock}
                              onChange={(e) => updateVariationValue(vIdx, valIdx, "stock", e.target.value)}
                              className="sm:col-span-3 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariationValue(vIdx, valIdx)}
                              className="sm:col-span-1 text-red-500 hover:text-red-700 p-1 flex justify-center"
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
                    value={seo.title}
                    onChange={handleSeoChange}
                    maxLength={70}
                    placeholder="SEO title (max 70 chars)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">{seo.title.length}/70 characters</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                  <textarea
                    name="description"
                    value={seo.description}
                    onChange={handleSeoChange}
                    maxLength={160}
                    rows={2}
                    placeholder="SEO description (max 160 chars)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">{seo.description.length}/160 characters</span>
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
                      className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seo.keywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-md">
                        {kw}
                        <button type="button" onClick={() => removeKeyword(kw)} className="text-slate-400 hover:text-slate-600">×</button>
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
                    {seo.title || formData.name || "Product Title Preview"}
                  </div>
                  <div className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {seo.description || formData.description || "Add an SEO description or product summary to preview how this listing appears in Google search engine result pages."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Product Organization
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                {categoriesLoading ? (
                  <div className="text-xs text-slate-400 py-2">Loading categories...</div>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
                  >
                    <option value="Uncategorized">Uncategorized (Default)</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="All">All</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
                >
                  <option value="Active">Active</option>
                  <option value="Out Of Stock">Out Of Stock</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-slate-700">Featured Storefront</label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Pricing & Stock
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Regular Price (PKR / Rs.) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="25000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Compare Price (PKR / Rs.)</label>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="30000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="100"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <button
                type="submit"
                disabled={loading || compressing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition text-xs shadow-sm disabled:opacity-50"
              >
                {loading ? "Publishing Product..." : "Publish Product"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}