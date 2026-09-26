'use client';

import { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

export default function RefundRequestManager() {
  const [orderName, setOrderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle Refund Request Submission
  const handleSubmitRefund = async (e) => {
    e.preventDefault();

    if (!orderName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid order name or reference.",
        confirmColor: "#4F46E5",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await axiosInstance.post("/order/request-refund", {
        orderNumber: orderName.trim(),
      });

      Swal.fire({
        icon: "success",
        title: "Request Submitted!",
        text: response.data?.message || "Your refund request has been successfully submitted.",
        timer: 2000,
        showConfirmButton: false,
      });

      setOrderName("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.message || "Something went wrong while requesting the refund.",
        confirmColor: "#4F46E5",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Request Refund</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a request to initiate a refund process for a specific order.
          </p>
        </div>
      </div>

      {/* Refund Request Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Order Details
        </h2>

        <form onSubmit={handleSubmitRefund} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Order Name / Reference *
            </label>
            <input
              type="text"
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="e.g. ORD-98234 or #1042"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Enter the exact name or tracking identifier associated with the target order.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? "Submitting Request..." : "Submit Refund Request"}
          </button>
        </form>
      </div>
    </div>
  );
}