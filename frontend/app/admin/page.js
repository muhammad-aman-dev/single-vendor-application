"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export default function AdminEntryPage() {
  const router = useRouter();
  const { isAdminLoggedIn } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    if (isAdminLoggedIn) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [isAdminLoggedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-sm">
      Checking Admin Status...
    </div>
  );
}