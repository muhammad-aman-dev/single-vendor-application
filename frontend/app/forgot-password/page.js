'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";
import { ArrowLeft, Mail, ShieldCheck, Lock, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps: 1 = Email Input, 2 = OTP Verification, 3 = New Password Input
  const [step, setStep] = useState(1);

  // Form States
  const [email, setEmail] = useState("");
  const [userOtp, setUserOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // STEP 1: Request Password Reset OTP
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      
      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
      }

      setStep(2);
      setTimer(60);
      setSuccess("Verification code dispatched to your email inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Navigation & Paste Logic
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split("");
      const newOtp = [...userOtp];
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setUserOtp(newOtp);
      const focusIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const updatedOtp = [...userOtp];
    updatedOtp[index] = cleanValue.slice(-1);
    setUserOtp(updatedOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !userOtp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // STEP 2: Verify OTP (Proceeds to step 3 on success)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const enteredCode = userOtp.join("");
    if (enteredCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setStep(3);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setUserOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setSuccess("A new verification code has been dispatched.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code.");
    }
  };

  // STEP 3: Reset / Set Password Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const otpCode = userOtp.join("");

    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp: otpCode,
        newPassword,
        resetToken,
      });

      setSuccess("Password successfully configured! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl shadow-black/80">
        
        {/* Back to Login Link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="font-serif text-3xl font-extrabold tracking-[0.3em] uppercase text-white group-hover:text-neutral-300 transition-colors">
              Rebel <span className="text-neutral-500 font-light">Watches</span>
            </h1>
          </Link>
          <div className="h-px w-12 bg-neutral-800 mx-auto my-3"></div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.25em] font-sans flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {step === 1 && "Account Recovery • Request Code"}
            {step === 2 && "Security Verification • Enter Code"}
            {step === 3 && "Credentials Setup • New Password"}
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mb-6 p-3 rounded-xl text-xs text-red-400 bg-red-950/40 border border-red-800/50 font-sans">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 rounded-xl text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 font-sans">
            {success}
          </div>
        )}

        {/* ================= STEP 1: ENTER EMAIL ================= */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-lg shadow-black/40"
            >
              {loading ? "Dispatching Code..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* ================= STEP 2: VERIFY OTP CODE ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 text-center font-sans">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2">
                {userOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono text-lg font-bold focus:outline-none focus:border-neutral-500 transition-colors"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 font-sans shadow-lg shadow-black/40"
            >
              Verify Code
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0}
                className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                  timer > 0 ? "text-neutral-600 cursor-not-allowed" : "text-neutral-400 hover:text-white underline underline-offset-4"
                }`}
              >
                {timer > 0 ? `Resend code in ${timer}s` : "Resend Verification Code"}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: SET NEW PASSWORD ================= */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-lg shadow-black/40"
            >
              {loading ? "Configuring Password..." : "Set Password"}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}