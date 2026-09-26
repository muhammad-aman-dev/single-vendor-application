"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/lib/axiosInstance";
import { initializeAuth } from "@/store/authSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await axiosInstance.get("/auth/me");

        const user = response.data.user;

        dispatch(initializeAuth(user));
      } catch (error) {
        // No valid JWT/session
        dispatch(initializeAuth(null));
      }
    }

    checkSession();
  }, [dispatch]);

  return null;
}

