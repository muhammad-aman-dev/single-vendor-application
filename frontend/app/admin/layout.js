// app/admin/layout.js
"use client";

import AdminAuth from "./AdminAuth";

export default function AdminLayout({ children }) {
  return <AdminAuth>{children}</AdminAuth>;
}