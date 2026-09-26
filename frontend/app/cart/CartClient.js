"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { removeFromCart, updateQuantity, clearCart } from "@/store/cartSlice";
import { login } from "@/store/authSlice";
import axiosInstance from "@/lib/axiosInstance";

export default function CartClient() {
  const router = useRouter();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);
  const cartInitialized = useSelector((state) => state.cart.initialized);
  const cartSyncing = useSelector((state) => state.cart.syncing);

  const user = useSelector((state) => state.auth.user);

  const shippingFee = useSelector((state) => state.shipping.fee);

  const shippingInitialized = useSelector(
    (state) => state.shipping.initialized
  );

  const shippingLoading = useSelector((state) => state.shipping.loading);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authMode, setAuthMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [signupStep, setSignupStep] = useState(1);

  const [receivedOtp, setReceivedOtp] = useState("");

  const [userOtp, setUserOtp] = useState(["", "", "", "", "", ""]);

  const [signupError, setSignupError] = useState("");

  const [signupSuccess, setSignupSuccess] = useState("");

  const [signupLoading, setSignupLoading] = useState(false);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState(1);

  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [orderLoading, setOrderLoading] = useState(false);

  const [orderError, setOrderError] = useState("");

  const [placedOrder, setPlacedOrder] = useState(null);

  const idempotencyKeyRef = useRef(null);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [items]);

  const hasFreeShipping =
    Boolean(user?.isFreeShippingApplied) && Number(shippingFee || 0) > 0;

  const appliedShippingFee = hasFreeShipping ? 0 : Number(shippingFee || 0);

  const codFee = paymentMethod === "cod" ? 100 : 0;

  const grandTotal = subtotal + appliedShippingFee + codFee;

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuantityChange = (item, quantity) => {
    dispatch(
      updateQuantity({
        productId: item.productId,
        variations: item.variations || {},
        quantity,
        stock: item.stock,
      })
    );
  };

  const handleCheckoutClick = (e) => {
    e.preventDefault();

    if (!shippingInitialized || shippingLoading) {
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setShippingForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || "",
    }));

    setShowCheckoutModal(true);
    setCheckoutStep(1);
    setOrderError("");
  };

  const handleModalLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", loginForm);

      dispatch(login(res.data.user));

      setShowAuthModal(false);

      setShippingForm((prev) => ({
        ...prev,
        fullName: res.data.user?.name || "",
      }));

      setShowCheckoutModal(true);
      setCheckoutStep(1);
      setOrderError("");
    } catch (err) {
      setLoginError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    setSignupError("");
    setSignupSuccess("");
    setSignupLoading(true);

    try {
      const res = await axiosInstance.post("/auth/request-otp", {
        email: signupForm.email,
      });

      setReceivedOtp(res.data.otp);
      setSignupStep(2);
      setSignupSuccess("Verification code sent to your email.");
    } catch (err) {
      setSignupError(
        err.response?.data?.message || "Failed to send verification code."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();

    setSignupError("");

    const enteredCode = userOtp.join("");

    if (enteredCode.length !== 6) {
      setSignupError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (enteredCode !== String(receivedOtp)) {
      setSignupError("Invalid verification code. Please check and try again.");
      return;
    }

    setSignupLoading(true);

    try {
      const res = await axiosInstance.post("/auth/register", signupForm);

      dispatch(login(res.data.user));

      setShowAuthModal(false);

      setShippingForm((prev) => ({
        ...prev,
        fullName: res.data.user?.name || signupForm.name,
      }));

      setShowCheckoutModal(true);
      setCheckoutStep(1);
      setOrderError("");
    } catch (err) {
      setSignupError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=/cart`;
  };

const handlePlaceOrder = async (e) => {
  e.preventDefault();

  setOrderError("");

  if (!shippingInitialized || shippingLoading) {
    setOrderError(
      "Shipping information is still loading. Please try again."
    );
    return;
  }

  if (!items.length) {
    setOrderError("Your cart is empty.");
    return;
  }

  /*
    Generate the idempotency key only once.

    If the request fails because of a network problem,
    clicking "Confirm & Place Order" again will reuse
    the same key instead of creating another order.
  */
  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = crypto.randomUUID();
  }

  setOrderLoading(true);

  try {
    const orderPayload = {
      items: items.map((item) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variations: item.variations || {},
        image: item.image,
      })),

      shippingAddress: shippingForm,

      paymentMethod,

      subtotal,

      shippingFee: appliedShippingFee,

      fee: codFee,

      total: grandTotal,

      /*
        Send the same key on retries.
      */
      idempotencyKey: idempotencyKeyRef.current,
    };

    const res = await axiosInstance.post(
      "/order/create-order",
      orderPayload
    );

    /*
      The backend now always returns the real
      order on successful creation or retry.

      No fake order ID fallback is needed.
    */
    setPlacedOrder(res.data.order);

    setCheckoutStep(2);

    dispatch(clearCart());

    /*
      The order is successfully completed,
      so this key is no longer needed.
    */
    idempotencyKeyRef.current = null;
  } catch (err) {
    /*
      If there is no response, the request may have
      reached the server but the response was lost.

      Keep the idempotency key so the user can safely
      retry with the same key.
    */
    if (!err.response) {
      setOrderError(
        "Connection issue — we're not sure your order went through. Tap 'Confirm & Place Order' again, it's safe to retry."
      );
    } else {
      setOrderError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    }
  } finally {
    setOrderLoading(false);
  }
};


  if (!cartInitialized || cartSyncing) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center px-4 bg-neutral-950 text-white selection:bg-neutral-900 selection:text-white">
        <div className="text-center max-w-md mx-auto p-6 sm:p-10 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl shadow-2xl shadow-black/80 relative overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 212, 146, 0.08)",
            }}
          />

          <div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner"
            style={{
              color: "#00d492",
            }}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-neutral-700 border-t-[#00d492] animate-spin" />
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-neutral-100">
            Checking Your Vault
          </h1>

          <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-sans">
            Checking your cart...
          </p>
        </div>
      </main>
    );
  }

  if (!items.length && !placedOrder) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center px-4 bg-neutral-950 text-white selection:bg-neutral-900 selection:text-white">
        <div className="text-center max-w-md mx-auto p-6 sm:p-10 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl shadow-2xl shadow-black/80 relative overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 212, 146, 0.08)",
            }}
          />

          <div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner"
            style={{
              color: "#00d492",
            }}
          >
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-neutral-100">
            Your Vault is Empty
          </h1>

          <p className="mt-3 text-xs text-neutral-400 leading-relaxed font-sans">
            Your collection awaits. Discover precision luxury timepieces crafted
            for distinction.
          </p>

          <Link
            href="/collections"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 bg-neutral-950 text-white min-h-[90vh] selection:bg-neutral-900 selection:text-white">
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800/80 pb-6 gap-4">
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono"
            style={{
              color: "#00d492",
            }}
          >
            Secure Vault
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-[0.15em] uppercase mt-1 text-neutral-100">
            Shopping Cart
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 px-4 py-2.5 rounded-xl shadow-sm backdrop-blur-md self-start sm:self-auto">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: "#00d492",
            }}
          />

          <p className="text-xs text-neutral-300 font-sans tracking-wide">
            <strong className="text-white font-mono font-bold">
              {items.length}
            </strong>{" "}
            {items.length === 1 ? "Masterpiece" : "Masterpieces"} Selected
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${JSON.stringify(item.variations || {})}`}
              className="group relative flex flex-col sm:flex-row gap-5 sm:gap-6 border border-neutral-800/80 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-neutral-700 p-4 sm:p-6 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-xl"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative aspect-4/3 sm:aspect-square w-full sm:w-32 shrink-0 overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center p-3 group-hover:border-neutral-700 transition-colors shadow-inner"
              >
                {item.image ? (
                  <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src={item.image}
                      alt={item.name || "Product"}
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-cover sm:object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-neutral-600">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-sm sm:text-base font-bold tracking-wide text-neutral-100 transition-colors line-clamp-2"
                    >
                      <span className="hover:text-[#00d492]">{item.name}</span>
                    </Link>

                    {item.variations &&
                      Object.keys(item.variations).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(item.variations).map(
                            ([option, value]) => (
                              <span
                                key={option}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-sans shadow-sm"
                              >
                                <span className="text-neutral-400 capitalize">
                                  {option}:
                                </span>

                                <span className="font-semibold text-white">
                                  {value}
                                </span>
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  <p
                    className="shrink-0 font-mono text-base font-bold tracking-tight"
                    style={{
                      color: "#00d492",
                    }}
                  >
                    {formatPKR(
                      Number(item.price || 0) * Number(item.quantity || 0)
                    )}
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 flex items-center justify-between pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-3.5 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                    >
                      −
                    </button>

                    <span className="min-w-10 text-center text-xs font-bold font-mono text-white">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                      disabled={item.quantity >= Number(item.stock || 0)}
                      className="px-3.5 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          variations: item.variations || {},
                        })
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 212, 146, 0.08)",
            }}
          />

          <h2 className="font-serif text-lg font-bold tracking-wider text-neutral-100 uppercase pb-4 border-b border-neutral-800">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 font-sans text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>

              <span className="font-mono text-neutral-200 font-medium">
                {formatPKR(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-neutral-400">
              <span>Shipping & Handling</span>

              {!shippingInitialized || shippingLoading ? (
                <span className="text-neutral-500">Loading...</span>
              ) : hasFreeShipping ? (
                <span
                  className="font-mono font-bold"
                  style={{
                    color: "#00d492",
                  }}
                >
                  FREE
                </span>
              ) : (
                <span className="font-mono text-neutral-200 font-medium">
                  {formatPKR(appliedShippingFee)}
                </span>
              )}
            </div>

            <div className="border-t border-neutral-800 pt-5 mt-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold uppercase tracking-widest text-neutral-200 text-xs">
                  Estimated Total
                </span>

                <span
                  className="font-mono text-lg font-bold"
                  style={{
                    color: "#00d492",
                  }}
                >
                  {formatPKR(subtotal + appliedShippingFee)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            disabled={!shippingInitialized || shippingLoading}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-neutral-100 hover:bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 transition-all shadow-xl shadow-white/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!shippingInitialized || shippingLoading
              ? "Loading Shipping..."
              : "Proceed to Secure Checkout"}
          </button>

          <Link
            href="/shop"
            className="mt-3.5 flex w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 hover:text-white transition-all shadow-inner"
          >
            Continue Shopping
          </Link>

          <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-center gap-4 text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            <span>🔒 Encrypted Vault</span>
            <span>•</span>
            <span>Verified Authentic</span>
          </div>
        </aside>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-10 shadow-2xl shadow-black/80 my-auto">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-neutral-400 hover:text-white text-base font-bold bg-neutral-900 hover:bg-neutral-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-neutral-800"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-extrabold tracking-[0.2em] uppercase text-white">
                Rebel{" "}
                <span
                  className="font-light"
                  style={{
                    color: "#00d492",
                  }}
                >
                  Watches
                </span>
              </h2>

              <p className="text-[10px] text-neutral-400 uppercase tracking-[0.25em] mt-2 font-mono">
                Authentication Required to Secure Order
              </p>
            </div>

            <div className="flex rounded-xl bg-neutral-900 p-1.5 mb-6 border border-neutral-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setLoginError("");
                }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  authMode === "login"
                    ? "bg-neutral-800 text-white shadow-md border border-neutral-700/60"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setSignupError("");
                }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  authMode === "signup"
                    ? "bg-neutral-800 text-white shadow-md border border-neutral-700/60"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Join Circle
              </button>
            </div>

            {authMode === "login" && (
              <div>
                {loginError && (
                  <div className="mb-5 p-3.5 rounded-xl text-xs text-red-400 bg-red-950/40 border border-red-800/50">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleModalLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-mono">
                      Email Address
                    </label>

                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors shadow-inner"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-mono">
                      Password
                    </label>

                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors shadow-inner"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full mt-2 bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {loginLoading ? "Authenticating..." : "Sign In & Proceed"}
                  </button>
                </form>
              </div>
            )}

            {authMode === "signup" && (
              <div>
                {signupError && (
                  <div className="mb-5 p-3.5 rounded-xl text-xs text-red-400 bg-red-950/40 border border-red-800/50">
                    {signupError}
                  </div>
                )}

                {signupSuccess && (
                  <div className="mb-5 p-3.5 rounded-xl text-xs bg-emerald-950/40 border border-emerald-800/50">
                    <span
                      style={{
                        color: "#00d492",
                      }}
                    >
                      {signupSuccess}
                    </span>
                  </div>
                )}

                {signupStep === 1 ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-mono">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={signupForm.name}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors shadow-inner"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-mono">
                        Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={signupForm.email}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors shadow-inner"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5 font-mono">
                        Password
                      </label>

                      <input
                        type="password"
                        required
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors shadow-inner"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full mt-2 bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {signupLoading
                        ? "Sending Code..."
                        : "Request Access Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                    <div className="text-center mb-2">
                      <p className="text-xs text-neutral-400 font-sans">
                        Enter the 6-digit verification code sent to your email.
                      </p>
                    </div>

                    <div className="flex justify-between gap-1.5 sm:gap-2">
                      {userOtp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");

                            const newOtp = [...userOtp];

                            newOtp[index] = val;

                            setUserOtp(newOtp);

                            if (val && index < 5) {
                              document
                                .getElementById(`otp-${index + 1}`)
                                ?.focus();
                            }
                          }}
                          id={`otp-${index}`}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-base sm:text-lg font-bold font-mono text-white focus:outline-none shadow-inner"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading || userOtp.join("").length !== 6}
                      className="w-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {signupLoading ? "Verifying..." : "Verify & Checkout"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="w-full text-center text-xs text-neutral-400 hover:text-white uppercase tracking-wider pt-1 transition-colors"
                    >
                      ← Edit Account Details
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>

              <span className="relative bg-neutral-950 px-4 text-[10px] uppercase tracking-widest text-neutral-500 font-bold font-mono">
                Or Connect With
              </span>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold tracking-wider uppercase py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:border-neutral-700 shadow-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-10 shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto my-auto">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-neutral-400 hover:text-white text-base font-bold bg-neutral-900 hover:bg-neutral-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-neutral-800"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono"
                style={{
                  color: "#00d492",
                }}
              >
                Secure Transaction
              </span>

              <h2 className="font-serif text-2xl font-extrabold tracking-[0.15em] uppercase text-white mt-1">
                {checkoutStep === 1
                  ? "Shipping & Delivery"
                  : "Order Confirmation"}
              </h2>
            </div>

            {orderError && (
              <div className="mb-6 p-4 rounded-xl text-xs text-red-400 bg-red-950/40 border border-red-800/50">
                {orderError}
              </div>
            )}

            {checkoutStep === 1 ? (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-mono border-b border-neutral-800 pb-2">
                    1. Destination Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-mono">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingForm.fullName}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none shadow-inner"
                        placeholder="Muhammad Aman"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-mono">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        required
                        value={shippingForm.phone}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none shadow-inner"
                        placeholder="03001234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-mono">
                      Street Address
                    </label>

                    <input
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none shadow-inner"
                      placeholder="House #123, Street #4, Area"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-mono">
                        City
                      </label>

                      <input
                        type="text"
                        required
                        value={shippingForm.city}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            city: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none shadow-inner"
                        placeholder="Multan"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 font-mono">
                        Postal Code (Optional)
                      </label>

                      <input
                        type="text"
                        value={shippingForm.postalCode}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none shadow-inner"
                        placeholder="60000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-300 font-mono border-b border-neutral-800 pb-2">
                    2. Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod("cod")}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        paymentMethod === "cod"
                          ? "bg-neutral-900/80 shadow-lg"
                          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                      }`}
                      style={{
                        borderColor:
                          paymentMethod === "cod" ? "#00d492" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                          Cash on Delivery
                        </span>

                        <span className="w-4 h-4 rounded-full border flex items-center justify-center">
                          {paymentMethod === "cod" && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: "#00d492",
                              }}
                            />
                          )}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                        Pay cash upon delivery. Includes an extra{" "}
                        <strong
                          className="font-mono"
                          style={{
                            color: "#00d492",
                          }}
                        >
                          PKR 100
                        </strong>{" "}
                        handling fee.
                      </p>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("online")}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        paymentMethod === "online"
                          ? "bg-neutral-900/80 shadow-lg"
                          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                      }`}
                      style={{
                        borderColor:
                          paymentMethod === "online" ? "#00d492" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                          Bank Transfer
                        </span>

                        <span className="w-4 h-4 rounded-full border flex items-center justify-center">
                          {paymentMethod === "online" && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: "#00d492",
                              }}
                            />
                          )}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                        Transfer via online banking and send your payment
                        receipt to WhatsApp.
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "online" && (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider font-mono"
                          style={{
                            color: "#00d492",
                          }}
                        >
                          Official Bank Details
                        </span>

                        <span className="text-[10px] text-neutral-400 font-mono">
                          Faysal Bank
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px] text-neutral-300">
                        <div className="flex justify-between gap-4">
                          <span className="text-neutral-500">Bank Name:</span>

                          <span className="text-white font-bold text-right">
                            Faysal Bank
                          </span>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-neutral-500">
                            Account Title:
                          </span>

                          <span className="text-white font-bold text-right">
                            UMAIR RAZA
                          </span>
                        </div>

{/*<div className="flex justify-between gap-4">
                          <span className="text-neutral-500">
                            Account Number:
                          </span>

                          <span className="text-white font-bold text-right">
                            0104-0105928371
                          </span>
                        </div>*/}

                        <div className="flex justify-between gap-4">
                          <span className="text-neutral-500">IBAN:</span>

                          <span className="text-white font-bold text-right">
                            PK35FAYS3451301000010471
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-800">
                        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                          Please{" "}
                          <span className="text-white font-medium">
                            place your order first
                          </span>{" "}
                          to secure your items and prevent any processing
                          errors. Once your order is successfully created,
                          quickly transfer the amount via online banking, save
                          the bank details, and share your payment receipt on
                          WhatsApp for instant admin verification.
                        </p>

                        <a
                          href="https://wa.me/923036130778"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block font-mono text-sm font-bold"
                          style={{
                            color: "#00d492",
                          }}
                        >
                          +92 303 6130778
                        </a>
                      </div>

                      <p className="text-[10px] text-neutral-400 font-sans italic pt-1">
                        Transfer the grand total to the account above before
                        confirmation.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between text-neutral-400">
                    <span>Products Subtotal</span>

                    <span className="font-mono text-neutral-200">
                      {formatPKR(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Shipping & Handling</span>

                    <span
                      className="font-mono"
                      style={{
                        color: "#00d492",
                      }}
                    >
                      {hasFreeShipping ? "FREE" : formatPKR(appliedShippingFee)}
                    </span>
                  </div>

                  {codFee > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span>COD Handling Fee</span>

                      <span
                        className="font-mono"
                        style={{
                          color: "#00d492",
                        }}
                      >
                        {formatPKR(codFee)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-neutral-800 pt-2.5 flex justify-between items-baseline font-bold">
                    <span className="text-white uppercase tracking-widest text-[11px]">
                      Total Payable
                    </span>

                    <span
                      className="font-mono text-base"
                      style={{
                        color: "#00d492",
                      }}
                    >
                      {formatPKR(grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
                >
                  {orderLoading ? "Placing Order..." : "Confirm & Place Order"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div
                  className="w-16 h-16 mx-auto rounded-full border flex items-center justify-center shadow-inner"
                  style={{
                    backgroundColor: "rgba(0, 212, 146, 0.1)",
                    borderColor: "rgba(0, 212, 146, 0.3)",
                    color: "#00d492",
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider">
                    Order Placed Successfully!
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 font-mono">
                    Order ID:{" "}
                    <span
                      className="font-bold"
                      style={{
                        color: "#00d492",
                      }}
                    >
                      {placedOrder?.orderNumber || "Check Your Mail"}
                    </span>
                  </p>
                </div>

                {paymentMethod === "online" ? (
                  <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-left space-y-4">
                    <p
                      className="text-xs font-bold uppercase tracking-wider font-mono"
                      style={{
                        color: "#00d492",
                      }}
                    >
                      Payment Receipt Required
                    </p>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Please transfer{" "}
                      <strong className="text-white font-mono">
                      {formatPKR(Number(placedOrder?.total || 0))}
                      </strong>{" "}
                      to our official bank account and send the payment receipt
                      to our WhatsApp number.
                    </p>

                    <div className="space-y-2.5 bg-neutral-950 p-3.5 sm:p-4 rounded-xl border border-neutral-800/80 font-mono text-[11px] overflow-x-auto">
                      <div className="flex justify-between border-b border-neutral-900 pb-2 gap-4">
                        <span className="text-neutral-400">Bank Name:</span>

                        <span className="text-white font-bold text-right">
                          Faysal Bank
                        </span>
                      </div>

                      <div className="flex justify-between border-b border-neutral-900 pb-2 gap-4">
                        <span className="text-neutral-400">Account Title:</span>

                        <span className="text-white font-bold text-right">
                          UMAIR RAZA
                        </span>
                      </div>

{/*<div className="flex justify-between border-b border-neutral-900 pb-2 gap-4">
                        <span className="text-neutral-400">
                          Account Number:
                        </span>

                        <span className="text-white font-bold text-right">
                          0104-0105928371
                        </span>
                      </div>*/}

                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-400">IBAN:</span>

                        <span className="text-white font-bold text-right">
                          PK35FAYS3451301000010471
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                        WhatsApp Receipt Number
                      </p>

                      <p
                        className="mt-1 text-lg font-bold font-mono"
                        style={{
                          color: "#00d492",
                        }}
                      >
                        +92 303 6130778
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/923036130778?text=${encodeURIComponent(
                        `Hello Rebel Watches, I have placed order ${
                          placedOrder?.orderNumber || ""
                        } and here is my payment receipt.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                      style={{
                        backgroundColor: "#00d492",
                      }}
                    >
                      💬 Send Receipt to WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-left space-y-2">
                    <p
                      className="text-xs font-bold uppercase tracking-wider font-mono"
                      style={{
                        color: "#00d492",
                      }}
                    >
                      Cash on Delivery Notice
                    </p>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Your order has been confirmed with COD. Please keep exact
                      cash of{" "}
                      <strong className="text-white font-mono">
                      {formatPKR(Number(placedOrder?.total || 0))}
                      </strong>{" "}
                      ready upon delivery.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setPlacedOrder(null);
                    window.location.href = "/";
                  }}
                  className="w-full bg-neutral-100 hover:bg-white text-neutral-950 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
