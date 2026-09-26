// app/(admin)/admin/dashboard/page.js
"use client";

import { useSelector } from "react-redux";

export default function DashboardHome() {
  const { adminUser } = useSelector((state) => state.adminAuth);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {adminUser?.name || "Admin"}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your online store is currently <span className="text-emerald-600 font-semibold">Live</span> and operational.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Store Status</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">Active</p>
        </div>
      </div>
    </div>
  );
}