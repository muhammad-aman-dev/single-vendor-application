'use client';

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";
import { useSelector } from "react-redux";

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const { adminUser } = useSelector((state) => state.adminAuth);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/admin/manage");
      const data = response.data?.admins || response.data || [];
      setAdmins(data);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Failed to load admin accounts.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add Admin Handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!name.trim() || !username.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Password must be at least 8 characters long.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    try {
      setAdding(true);
      const response = await axiosInstance.post("/auth/admin/create", {
        name: name.trim(),
        username: username.trim(),
        password,
        role,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data?.message || "Admin created successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      setName("");
      setUsername("");
      setPassword("");
      setRole("admin");
      fetchAdmins();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to Create",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setAdding(false);
    }
  };

  // Delete Admin Handler
  const handleRemoveAdmin = async (id, adminName) => {
    const result = await Swal.fire({
      title: `Delete Admin "${adminName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        Swal.showLoading();
        const response = await axiosInstance.delete(`/auth/admin/${id}`);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data?.message || "Admin removed successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        fetchAdmins();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: err.response?.data?.message || "Failed to remove admin.",
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Admins</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage administrative accounts and roles (Super Admin restricted)
          </p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
          Total: {admins.length} Admins
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Admin Form Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-6">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Add New Admin
            </h2>

            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username/Email *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                >
                  <option value="admin">Admin</option>
                  <option value="super admin">Super Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2 rounded-lg transition text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {adding ? "Creating..." : "+ Create Admin"}
              </button>
            </form>
          </div>
        </div>

        {/* Admins List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Existing Admins
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading admins...</div>
            ) : admins.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No admins found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {admins.map((adm) => (
                  <div
                    key={adm._id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-lg transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">{adm.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase ${adm.role === 'super admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600'}`}>
                          {adm.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{adm.username}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Added: {new Date(adm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {adminUser.username!==adm.username && <button
                      type="button"
                      onClick={() => handleRemoveAdmin(adm._id, adm.name)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>}
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