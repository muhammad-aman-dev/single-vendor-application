import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import Shipping from "../models/Shipping.js";
import bcrypt from "bcryptjs";

// ===============================
// ADMIN LOGIN
// ===============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      username: email.trim().toLowerCase(),
    }).select("+password");

    // Admin not found
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check active status
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is disabled",
      });
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Create JWT
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("adminToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
});

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// ADMIN LOGOUT
// ===============================
export const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const createShipping = async (req, res) => {
  try {
    const { name, fee } = req.body;
    if (!name || fee === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Name and fee are required" });
    }
    const shipping = await Shipping.create({ name, fee, isActive: false });
    return res.status(201).json({
      success: true,
      message: "Shipping created successfully",
      shipping,
    });
  } catch (error) {
    console.error("Create shipping error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create shipping" });
  }
};
export const getAllShipping = async (req, res) => {
  try {
    const shipping = await Shipping.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, shipping });
  } catch (error) {
    console.error("Get all shipping error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get shipping configurations",
    });
  }
};
export const updateShipping = async (req, res) => {
  try {
    const { name, fee } = req.body;
    const shipping = await Shipping.findById(req.params.id);
    if (!shipping) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping configuration not found" });
    }
    if (name !== undefined) {
      shipping.name = name;
    }
    if (fee !== undefined) {
      shipping.fee = fee;
    }
    await shipping.save();
    return res.status(200).json({
      success: true,
      message: "Shipping updated successfully",
      shipping,
    });
  } catch (error) {
    console.error("Update shipping error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update shipping" });
  }
};
export const deleteShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findById(req.params.id);

    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: "Shipping configuration not found",
      });
    }

    const totalShipping = await Shipping.countDocuments();

    if (totalShipping <= 1) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete the last shipping configuration.",
      });
    }

    const wasActive = shipping.isActive;

    await Shipping.findByIdAndDelete(req.params.id);

    if (wasActive) {
      const nextShipping = await Shipping.findOne().sort({
        createdAt: -1,
      });

      if (nextShipping) {
        nextShipping.isActive = true;
        await nextShipping.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Shipping deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipping error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete shipping",
    });
  }
};
export const activateShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findById(req.params.id);
    if (!shipping) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping configuration not found" });
    }
    await Shipping.updateMany(
      { _id: { $ne: shipping._id }, isActive: true },
      { $set: { isActive: false } }
    );
    shipping.isActive = true;
    await shipping.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Shipping activated successfully",
        shipping,
      });
  } catch (error) {
    console.error("Activate shipping error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to activate shipping" });
  }
};
export const getActiveShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ isActive: true }).select(
      "name fee"
    );
    if (!shipping) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping fee is not configured" });
    }
    return res.status(200).json({ success: true, shipping });
  } catch (error) {
    console.error("Get active shipping error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get shipping fee" });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ username: username.trim().toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role: role === "super admin" ? "super admin" : "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        username: newAdmin.username,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself (comparing logged-in admin ID with target ID)
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active admin account.",
      });
    }

    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
    });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const admin = await Admin.findById(req.user.id).select("+password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};
