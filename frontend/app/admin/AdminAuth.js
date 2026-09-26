"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { loginAdmin, logoutAdmin } from "@/store/adminAuthSlice";

export default function AdminAuth({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const { isAdminLoggedIn } = useSelector((state) => state.adminAuth);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await axiosInstance.get("/auth/admin");
        const user = response.data.user;

        if (user) {
          dispatch(loginAdmin(user));
        } else {
          dispatch(logoutAdmin());
        }
      } catch (error) {
        dispatch(logoutAdmin());
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [dispatch]);

  // Handle Redirection Flow
  useEffect(() => {
    if (!loading) {
      if (!isAdminLoggedIn && !isLoginPage) {
        router.replace("/admin/login");
      } else if (isAdminLoggedIn && isLoginPage) {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAdminLoggedIn, loading, isLoginPage, router]);

  // Show dark loader while verifying backend session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
        Verifying Admin Access...
      </div>
    );
  }

  return <>{children}</>;
}