'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { login } from "@/store/authSlice"; 
import axiosInstance from "@/lib/axiosInstance";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Form & Flow State
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [step, setStep] = useState(1); // 1: Form, 2: Inline OTP
  const [receivedOtp, setReceivedOtp] = useState("");
  const [userOtp, setUserOtp] = useState(["", "", "", "", "", ""]);

  // UI State
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

  // STEP 1: Request OTP from backend
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/request-otp", { email: formData.email });
      setReceivedOtp(res.data.otp);
      setStep(2);
      setTimer(60);
      setSuccess("Verification code sent. Please check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code.");
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

  // STEP 2: Verify OTP and Execute Signup
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const enteredCode = userOtp.join("");
    if (enteredCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (enteredCode !== String(receivedOtp)) {
      setError("Invalid verification code. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/register", formData);
      
      dispatch(login(res.data.user));
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError("");
    setSuccess("");

    try {
      const res = await axiosInstance.post("/auth/request-otp", { email: formData.email });
      setReceivedOtp(res.data.otp);
      setUserOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setSuccess("A new verification code has been dispatched.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl shadow-black/80">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="font-serif text-3xl font-extrabold tracking-[0.3em] uppercase text-white group-hover:text-neutral-300 transition-colors">
              Rebel <span className="text-neutral-500 font-light">Watches</span>
            </h1>
          </Link>
          <div className="h-px w-12 bg-neutral-800 mx-auto my-3"></div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.25em] font-sans">
            {step === 1 ? "Precision Timekeeping • Join the Circle" : `Verification sent to ${formData.email}`}
          </p>
        </div>

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

        {step === 1 ? (
          /* STEP 1: Registration Credentials */
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-sans">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 font-sans transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="shimmer-button w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-lg shadow-black/40"
            >
              {loading ? "Requesting Passcode..." : "Request Access Code"}
            </button>
          </form>
        ) : (
          /* STEP 2: Dark OTP Verification */
          <form onSubmit={handleVerifyAndSignup}>
            <div className="flex justify-between gap-2 mb-8">
              {userOtp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-13 text-center bg-neutral-900/80 border border-neutral-800 rounded-xl text-base font-bold font-mono text-white focus:outline-none focus:border-neutral-500 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || userOtp.join("").length !== 6}
              className="shimmer-button w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-lg shadow-black/40 mb-4"
            >
              {loading ? "Authenticating..." : "Verify & Complete Signup"}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80 font-sans">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-semibold transition-colors"
              >
                ← Edit Details
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timer > 0}
                className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-semibold disabled:opacity-40 transition-colors"
              >
                {timer > 0 ? `Resend Code in ${timer}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800/80"></div>
          </div>
          <span className="relative bg-neutral-950 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 font-sans">
            Or
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-bold tracking-wider uppercase py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 font-sans"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center border-t border-neutral-800/80 pt-6">
          <Link
            href="/login"
            className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-semibold underline underline-offset-4 transition-colors font-sans"
          >
            Already a member? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}