// src/routes/auth.routes.js

import express from "express";
import passport from "passport";

import {
  register,
  login,
  logout,
  getMe, 
  requestOtp, 
  forgotPassword,
  resetPassword, 
  updatePassword} from "../controllers/authController.js"

import { userAuthCheck } from "../middleware/authMiddleware.js";

import generateToken from "../utils/generateToken.js";
import setAuthCookie from "../utils/setAuthCookie.js";
import { adminAuthCheck, superAdminAuthCheck } from "../middleware/adminMiddleware.js";
import { loginAdmin, logoutAdmin, getAllAdmins, createAdmin, deleteAdmin, changeAdminPassword } from "../controllers/adminController.js";

const authRouter = express.Router(); 


// ===============================
// MANUAL AUTH
// ===============================

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/request-otp", requestOtp);

authRouter.post("/logout", logout);

authRouter.get("/me", userAuthCheck, getMe);

authRouter.get("/admin", adminAuthCheck, getMe);
authRouter.post("/admin/login", loginAdmin);
authRouter.post("/admin/logout", logoutAdmin);
authRouter.put("/admin/change-password", adminAuthCheck, changeAdminPassword);

authRouter.get("/admin/manage", superAdminAuthCheck, getAllAdmins);
authRouter.post("/admin/create", superAdminAuthCheck, createAdmin);
authRouter.delete("/admin/:id", superAdminAuthCheck, deleteAdmin);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.put("/update-password", userAuthCheck, updatePassword);

authRouter.get(
  "/google",
  (req, res, next) => {
    const redirect = req.query.redirect || "/";

    res.cookie("googleRedirect", redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });

    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  }
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      `${process.env.CLIENT_URL}/login?error=google`,
  }),

  async (req, res) => {
    try {
      const token = generateToken(req.user._id);

      setAuthCookie(res, token);

      const redirect = req.cookies.googleRedirect || "/";

      res.clearCookie("googleRedirect");

      // Only allow internal paths
      const safeRedirect =
        redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/";

      res.redirect(`${process.env.CLIENT_URL}${safeRedirect}`);
    } catch (error) {
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=google`
      );
    }
  }
);

export default authRouter;