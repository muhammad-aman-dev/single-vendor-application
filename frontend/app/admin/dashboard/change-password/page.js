'use client';

import { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all password fields.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "New password must be at least 8 characters long.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Mismatch",
        text: "New passwords do not match.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.put("/auth/admin/change-password", {
        currentPassword,
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Updated!",
        text: response.data?.message || "Your password has been changed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update password.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Change Password</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update your secure account password regularly to protect store data
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Password *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}