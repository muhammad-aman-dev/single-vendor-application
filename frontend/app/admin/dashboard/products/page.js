'use client';

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

export default function ProductList() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [featuredFilter, setFeaturedFilter] = useState("All");

  // Detailed View Modal State
  const [viewProduct, setViewProduct] = useState(null);

  // Sync typed search input with debounced searchTerm state
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Dynamically derive unique categories from fetched product data
  const dynamicCategories = useMemo(() => {
    const categoriesSet = new Set();
    products.forEach((product) => {
      if (product.category) categoriesSet.add(product.category);
    });
    return Array.from(categoriesSet).sort();
  }, [products]);

  // Fetch products with active filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (selectedStatus !== "All") params.append("status", selectedStatus);

      const response = await axiosInstance.get(`/admin/product/admin/all?${params.toString()}`);
      setProducts(response.data?.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Failed to load product catalog.",
        confirmColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side filtering for dynamic category & featured status
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchFeatured =
        featuredFilter === "All" ||
        (featuredFilter === "Featured" && product.featured) ||
        (featuredFilter === "Not Featured" && !product.featured);

      return matchCategory && matchFeatured;
    });
  }, [products, selectedCategory, featuredFilter]);

  // Handle Quick Status Change
  const handleStatusChange = useCallback(async (productId, newStatus) => {
    try {
      await axiosInstance.patch(`/admin/product/status/${productId}`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, status: newStatus } : p))
      );
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Status updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update product status.",
        confirmColor: "#4F46E5",
      });
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Out Of Stock":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Inactive":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store inventory, view detailed specifications, and edit status values
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/add-product")}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name, ID, or slug..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status Filter</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Out Of Stock">Out Of Stock</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category (In Stock)</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
          >
            <option value="All">All Categories ({dynamicCategories.length})</option>
            {dynamicCategories.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Featured</label>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600"
          >
            <option value="All">All Products</option>
            <option value="Featured">Featured Only</option>
            <option value="Not Featured">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-xl max-h-175 overflow-y-auto shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No products match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (PKR)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onStatusChange={handleStatusChange}
                    onView={setViewProduct}
                    router={router}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Details Modal Popup */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {viewProduct.productId}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{viewProduct.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Images Showcase */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Images</span>
              <div className="grid grid-cols-4 gap-2">
                {viewProduct.images?.map((img, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-20">
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* General Grid Information */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Price</span>
                <span className="font-semibold text-slate-800">Rs. {viewProduct.price?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Compare Price</span>
                <span className="font-semibold text-slate-800">
                  {viewProduct.comparePrice ? `Rs. ${viewProduct.comparePrice.toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Category / Gender</span>
                <span className="font-semibold text-slate-800">{viewProduct.category} ({viewProduct.gender})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Stock</span>
                <span className="font-semibold text-slate-800">{viewProduct.stock} units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Featured</span>
                <span className="font-semibold text-slate-800">{viewProduct.featured ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Views / Sales</span>
                <span className="font-semibold text-slate-800">{viewProduct.views} / {viewProduct.salesCount}</span>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Description</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {viewProduct.description}
              </p>
            </div>

            {/* Variations */}
            {viewProduct.variations?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Variations</span>
                <div className="space-y-2">
                  {viewProduct.variations.map((v, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 border border-slate-100">
                      <span className="font-bold text-slate-800">{v.option}:</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {v.values.map((val, valIdx) => (
                          <span key={valIdx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            {val.value} — Rs. {val.price} ({val.stock} in stock)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const slug = viewProduct.slug;
                  setViewProduct(null);
                  router.push(`/admin/dashboard/products/edit-product/${slug}`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component optimized with React.memo to avoid re-rendering entire rows unnecessarily
const ProductRow = memo(function ProductRow({ product, onStatusChange, onView, router, getStatusBadge }) {
  const mainImage = product.images?.[0]?.url || "/placeholder.png";

  return (
    <tr className="hover:bg-slate-50/80 transition">
      {/* Product Name & Thumbnail */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={mainImage}
            alt={product.name}
            className="w-10 h-10 object-cover rounded-md border border-slate-200 bg-slate-50 shrink-0"
          />
          <div>
            <span className="font-semibold text-slate-900 block truncate max-w-50">
              {product.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {product.productId}
            </span>
          </div>
        </div>
      </td>

      {/* Category & Gender */}
      <td className="py-3 px-4">
        <span className="font-medium text-slate-800">{product.category}</span>
        <span className="block text-[10px] text-slate-400">{product.gender}</span>
      </td>

      {/* Pricing */}
      <td className="py-3 px-4 font-medium text-slate-900">
        Rs. {product.price?.toLocaleString()}
        {product.comparePrice > 0 && (
          <span className="block text-[10px] text-slate-400 line-through">
            Rs. {product.comparePrice?.toLocaleString()}
          </span>
        )}
      </td>

      {/* Stock */}
      <td className="py-3 px-4 font-medium">
        {product.stock}
      </td>

      {/* Read-Only Featured Badge */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            product.featured
              ? "bg-amber-50 text-amber-700 border-amber-300"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          <svg
            className={`w-3 h-3 ${
              product.featured ? "fill-amber-500 text-amber-500" : "text-slate-400"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {product.featured ? "Featured" : "Standard"}
        </span>
      </td>

      {/* Status Toggle Selector */}
      <td className="py-3 px-4">
        <select
          value={product.status}
          onChange={(e) => onStatusChange(product._id, e.target.value)}
          className={`text-[11px] font-semibold border rounded-md px-2 py-1 outline-none cursor-pointer ${getStatusBadge(
            product.status
          )}`}
        >
          <option value="Active">Active</option>
          <option value="Out Of Stock">Out Of Stock</option>
          <option value="Inactive">Inactive</option>
        </select>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* View Popup */}
          <button
            type="button"
            onClick={() => onView(product)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
            title="Quick View Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* View on Public Store */}
          <a
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition"
            title="View in Live Store"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Edit Product */}
          <button
            type="button"
            onClick={() => router.push(`/admin/dashboard/products/edit-product/${product.slug}`)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
            title="Edit Product"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
});