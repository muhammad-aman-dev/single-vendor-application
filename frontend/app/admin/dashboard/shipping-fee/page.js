"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

export default function ShippingManager() {
  const [shipping, setShipping] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [fee, setFee] = useState("");

  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [updating, setUpdating] = useState(false);

  // ==========================================
  // Fetch all shipping configurations
  // ==========================================

  const fetchShipping = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/admin/pror/all-shipping");

      const data = response.data?.shipping || response.data || [];

      setShipping(data);
    } catch (err) {
      console.error("Failed to fetch shipping:", err);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          err.response?.data?.message ||
          "Failed to load shipping configurations.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipping();
  }, []);

  // ==========================================
  // Add Shipping
  // ==========================================

  const handleAddShipping = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a shipping name.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (fee === "" || Number(fee) < 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid shipping fee.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setAdding(true);

      const response = await axiosInstance.post("/admin/pror/create-shipping", {
        name: name.trim(),
        fee: Number(fee),
      });

      Swal.fire({
        icon: "success",
        title: "Added!",
        text:
          response.data?.message ||
          "Shipping configuration created successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      setName("");
      setFee("");

      fetchShipping();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text:
          err.response?.data?.message ||
          "Something went wrong while creating shipping.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setAdding(false);
    }
  };

  // ==========================================
  // Start Editing
  // ==========================================

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditFee(item.fee);
  };

  // ==========================================
  // Cancel Editing
  // ==========================================

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditFee("");
  };

  // ==========================================
  // Update Shipping
  // ==========================================

  const handleUpdateShipping = async (id) => {
    if (!editName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Shipping name cannot be empty.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (editFee === "" || Number(editFee) < 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid shipping fee.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setUpdating(true);

      const response = await axiosInstance.put(`/admin/pror/update-shipping/${id}`, {
        name: editName.trim(),
        fee: Number(editFee),
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text:
          response.data?.message ||
          "Shipping configuration updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      handleCancelEdit();
      fetchShipping();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err.response?.data?.message ||
          "Failed to update shipping configuration.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // Delete Shipping
  // ==========================================

  const handleDeleteShipping = async (id, shippingName) => {
    const result = await Swal.fire({
      title: `Delete "${shippingName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();

      const response = await axiosInstance.delete(
        `/admin/pror/del-shipping/${id}`
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text:
          response.data?.message ||
          "Shipping configuration deleted successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      fetchShipping();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text:
          err.response?.data?.message ||
          "Failed to delete shipping configuration.",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  // ==========================================
  // Activate Shipping
  // ==========================================

  const handleActivateShipping = async (id, shippingName) => {
    const result = await Swal.fire({
      title: `Activate "${shippingName}"?`,
      text: "The currently active shipping configuration will be deactivated.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, activate",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();

      const response = await axiosInstance.patch(
        `/admin/pror/activate-shipping/${id}/activate`
      );

      Swal.fire({
        icon: "success",
        title: "Activated!",
        text:
          response.data?.message ||
          "Shipping configuration activated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      fetchShipping();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Activation Failed",
        text:
          err.response?.data?.message ||
          "Failed to activate shipping configuration.",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Shipping Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Manage shipping fees and select the active shipping configuration.
          </p>
        </div>

        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Total: {shipping.length} Shipping
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Add Shipping */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-6">

            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Add Shipping
            </h2>

            <form onSubmit={handleAddShipping} className="space-y-3">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Shipping Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Shipping"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              {/* Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Shipping Fee *
                </label>

                <input
                  type="number"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {adding ? "Adding..." : "+ Create Shipping"}
              </button>

            </form>
          </div>
        </div>

        {/* Shipping List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">

            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Shipping Configurations
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading shipping configurations...
              </div>
            ) : shipping.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No shipping configurations found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {shipping.map((item) => (
                  <div
                    key={item._id}
                    className="py-4 px-2 hover:bg-slate-50 rounded-lg transition"
                  >

                    {editingId === item._id ? (

                      // ==========================
                      // EDIT MODE
                      // ==========================

                      <div className="space-y-3">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Name
                            </label>

                            <input
                              type="text"
                              value={editName}
                              onChange={(e) =>
                                setEditName(e.target.value)
                              }
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                              Fee
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={editFee}
                              onChange={(e) =>
                                setEditFee(e.target.value)
                              }
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                          </div>

                        </div>

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              handleUpdateShipping(item._id)
                            }
                            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                          >
                            {updating ? "Saving..." : "Save Changes"}
                          </button>

                        </div>

                      </div>

                    ) : (

                      // ==========================
                      // NORMAL MODE
                      // ==========================

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          {/* Status */}
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />

                          <div>
                            <div className="flex items-center gap-2">

                              <h3 className="text-sm font-semibold text-slate-800">
                                {item.name}
                              </h3>

                              {item.isActive && (
                                <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              )}

                            </div>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Added:{" "}
                              {new Date(
                                item.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <span className="text-sm font-bold text-slate-900 mr-2">
                            {item.fee}
                          </span>

                          {!item.isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActivateShipping(
                                  item._id,
                                  item.name
                                )
                              }
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteShipping(
                                item._id,
                                item.name
                              )
                            }
                            className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>

                            Delete
                          </button>

                        </div>

                      </div>
                    )}
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
