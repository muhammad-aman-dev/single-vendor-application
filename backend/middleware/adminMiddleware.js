// src/middleware/adminMiddleware.js

import jwt from "jsonwebtoken";

export const adminAuthCheck = (req, res, next) => {
  try {
    let token = req.cookies?.adminToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Allow both regular admin and super admin
    if (req.user?.role !== "admin" && req.user?.role !== "super admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

// Middleware strictly for Super Admins
export const superAdminAuthCheck = (req, res, next) => {
  adminAuthCheck(req, res, () => {
    if (req.user?.role !== "super admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin privileges required",
      });
    }
    next();
  });
};