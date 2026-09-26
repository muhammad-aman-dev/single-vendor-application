// src/controllers/auth.controller.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import setAuthCookie from "../utils/setAuthCookie.js";
import transporter from "../config/mailer.js";
import jwt from "jsonwebtoken";



// ===============================
// REGISTER
// ===============================

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: "customer",
      authProvider: "local",
    });

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    // Send Welcome Email
    try {
      await transporter.sendMail({
        from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Welcome to Rebel Watches — Rule Your Time",
        html: `
          <div style="background-color: #121212; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #262626; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8); font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
            <!-- Header -->
            <div style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <h2 style="font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase; margin: 0;">
                Rebel Watches
              </h2>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; color: #737373; margin-top: 6px;">
                Curated Luxury Timepieces
              </div>
            </div>

            <!-- Body Content -->
            <div style="padding: 40px;">
              <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 26px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em; line-height: 1.3;">
                Welcome to the Inner Circle
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 16px;">
                Hello, <strong style="color: #ffffff;">${trimmedName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 24px;">
                Your account has been successfully created. You now have exclusive access to our handpicked collection of precision timepieces, designed for those who command their own schedule.
              </p>

              <!-- Free Shipping Perk Card -->
              <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border: 1px solid #333333; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4d4d4; margin-bottom: 6px; font-weight: 600;">
                  Exclusive Member Perk
                </div>
                <div style="font-size: 16px; font-family: 'Cinzel', Georgia, serif; color: #ffffff; font-weight: 600; margin-bottom: 4px;">
                  Free Shipping on Your First Order
                </div>
                <p style="font-size: 13px; color: #a3a3a3; margin: 0; line-height: 1.4;">
                  Enjoy complimentary delivery nationwide on your inaugural timepiece selection. Applied automatically at checkout.
                </p>
              </div>

              <!-- Featured Collections Card -->
              <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 24px; margin-bottom: 28px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 8px;">
                  Explore Our Masterpieces
                </div>
                <p style="font-size: 14px; color: #d4d4d4; margin-bottom: 20px;">
                  Discover our latest luxury automatic watches, chronograph editions, and limited-release articles.
                </p>
                <a href="${process.env.CLIENT_URL || 'https://rebelwatches.com'}/products" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none;">
                  Browse Collection
                </a>
              </div>

              <p style="margin-bottom: 0; font-size: 13px; color: #737373;">
                If you have any questions or need concierge support, simply reply to this email. We're always here to help.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 40px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center;">
              <p style="font-size: 11px; color: #525252; margin: 0; letter-spacing: 0.05em;">
                &copy; 2026 Rebel Watches. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #525252; margin: 6px 0 0 0; letter-spacing: 0.05em;">
                Precision engineered for those who rule their own time.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Welcome email delivery failed:", emailError);
    }

    // Return sanitized user object
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFreeShippingApplied: user.isFreeShippingApplied,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ===============================
// LOGIN
// ===============================

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google login. Please continue with Google.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFreeShippingApplied: user.isFreeShippingApplied,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ===============================
// LOGOUT
// ===============================

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};


// ===============================
// CURRENT USER
// ===============================

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Don't allow signup if account already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Send email
    await transporter.sendMail({
      from: `"Watch Store" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your Watch Store Verification Code",
      html: `
        <div style="background-color: #121212; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #262626; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8); font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
          <!-- Header -->
          <div style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid #222222;">
            <h2 style="font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase; margin: 0;">
              Rebel Watches
            </h2>
            <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; color: #737373; margin-top: 6px;">
              Curated Luxury Timepieces
            </div>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px;">
            <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 26px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em; line-height: 1.3;">
              Account Verification
            </h1>
            <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 16px;">
              Hello, <strong style="color: #ffffff;">${normalizedEmail}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 24px;">
              You requested access to your Rebel Watches client profile. Use the secure authentication code below to complete your sign-in or verification process.
            </p>

            <!-- Code / Action Box -->
            <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; text-align: center; margin-bottom: 8px;">
                Your Security Code
              </div>
              <div style="background-color: #0a0a0a; border: 1px solid #333333; border-radius: 12px; padding: 20px; text-align: center; letter-spacing: 0.3em; font-size: 32px; font-weight: 700; color: #ffffff; font-family: monospace; margin: 20px 0;">
                ${otp}
              </div>
              <div style="font-size: 11px; text-align: center; color: #666666;">
                This code expires in 10 minutes. Do not share it with anyone.
              </div>
            </div>

            <p style="margin-bottom: 0; font-size: 13px; color: #737373;">
              If you didn't request this verification, you can safely ignore this email. Your account security remains intact.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center;">
            <p style="font-size: 11px; color: #525252; margin: 0; letter-spacing: 0.05em;">
              &copy; 2026 Rebel Watches. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #525252; margin: 6px 0 0 0; letter-spacing: 0.05em;">
              Precision engineered for those who rule their own time.
            </p>
          </div>
        </div>
      `,
    });

    console.log(
      `OTP sent to ${normalizedEmail}: ${otp}`
    );

    return res.status(200).json({
      message: "Verification code sent successfully",
      otp, // Keep this for your current frontend development flow
    });
  } catch (error) {
    console.error("Request OTP error:", error);

    return res.status(500).json({
      message: "Failed to send verification code",
    });
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a temporary JWT containing email & OTP (valid for 10 minutes)
    const resetToken = jwt.sign(
      { email: normalizedEmail, otp }, 
      process.env.JWT_SECRET, 
      { expiresIn: "10m" }
    );

    // Send email via Nodemailer
    await transporter.sendMail({
      from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Password Recovery / Setup Code — Rebel Watches",
      html: `
        <div style="background-color: #121212; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #262626; padding: 40px; font-family: sans-serif; color: #e5e5e5;">
          <h2 style="font-family: serif; color: #ffffff; text-align: center; letter-spacing: 0.2em;">REBEL WATCHES</h2>
          <h3 style="color: #ffffff; text-align: center;">Account Security Request</h3>
          <p style="color: #a3a3a3; text-align: center;">Use the secure code below to set up or reset your account password.</p>
          <div style="background-color: #0a0a0a; border: 1px solid #333333; border-radius: 12px; padding: 20px; text-align: center; letter-spacing: 0.3em; font-size: 32px; font-weight: 700; color: #ffffff; font-family: monospace; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #737373; text-align: center; font-size: 12px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Verification code sent successfully",
      resetToken 
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// RESET / SET PASSWORD
// ===============================
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, resetToken } = req.body;

    if (!email || !otp || !newPassword || !resetToken) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Verify the temporary stateless token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Verification session expired. Please request a new code." });
    }

    if (decoded.email !== email.toLowerCase().trim() || decoded.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Updates existing password OR sets a manual password for Google-authenticated users
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Password successfully configured! You can now log in manually." 
    });
  } catch (error) {
    next(error);
  }
};


export const updatePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // req.user is populated by your authentication middleware (protect/verifyToken)
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Assigning the plain text password will trigger your User model pre-save hash hook
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};