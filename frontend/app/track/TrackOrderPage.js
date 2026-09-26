"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  Calendar,
  CreditCard,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdQuery = searchParams.get("orderId");

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  // Handle manual form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputVal.trim()) return;

    router.push(`/track?orderId=${encodeURIComponent(inputVal.trim())}`);
  };

  // Fetch order status when orderId changes in the URL
  useEffect(() => {
    if (!orderIdQuery) {
      setOrderData(null);
      setError(null);
      return;
    }

    async function fetchOrderStatus() {
      setLoading(true);
      setError(null);
      setOrderData(null);

      try {
        const res = await axiosInstance.get(
          `/order/status/${encodeURIComponent(orderIdQuery)}`
        );

        setOrderData(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Order not found. Please verify your tracking ID."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrderStatus();
  }, [orderIdQuery]);

  // Helper to map order status or payment verification to color & icon
  const getStatusBadge = (status, type = "order") => {
    const lowerStatus = (status || "").toLowerCase();

    if (type === "order") {
      switch (lowerStatus) {
        case "delivered":
        case "received":
          return {
            text: "text-emerald-400",
            bg: "bg-emerald-950/30 border-emerald-900/40",
            icon: (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ),
          };

        case "cancelled":
          return {
            text: "text-red-400",
            bg: "bg-red-950/30 border-red-900/40",
            icon: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
          };

        case "shipped":
          return {
            text: "text-blue-400",
            bg: "bg-blue-950/30 border-blue-900/40",
            icon: <Truck className="w-4 h-4 text-blue-400 shrink-0" />,
          };

        case "packaging":
        default:
          return {
            text: "text-amber-400",
            bg: "bg-amber-950/30 border-amber-900/40",
            icon: <Clock className="w-4 h-4 text-amber-400 shrink-0" />,
          };
      }
    }

    // Payment verification / status
    switch (lowerStatus) {
      case "verified":
        return {
          text: "text-emerald-400",
        };

      case "rejected":
        return {
          text: "text-red-400",
        };

      case "pending":
      default:
        return {
          text: "text-amber-400",
        };
    }
  };

  return (
    <main className="w-full bg-neutral-950 text-neutral-200 min-h-screen selection:bg-neutral-800 selection:text-white font-sans flex flex-col justify-between">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 w-full">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Heading Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400 block inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Rebel Watches Logistics
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Track Your <span className="text-neutral-300">Timepiece</span>
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base max-w-lg mx-auto">
            Enter your order reference code below to check real-time delivery
            and authentication progress.
          </p>
        </div>

        {/* No query parameter -> Show Input Form */}
        {!orderIdQuery && (
          <div className="bg-neutral-900/40 border border-neutral-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label
                  htmlFor="orderId"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
                >
                  Order Reference Number or ID
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                    <Package className="w-5 h-5" />
                  </div>

                  <input
                    type="text"
                    id="orderId"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. ORD-7BA2F0A"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-neutral-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-black/50 active:scale-95 cursor-pointer"
              >
                <span>Track Order</span>
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Query parameter exists -> Show Status Details */}
        {orderIdQuery && (
          <div className="bg-neutral-900/40 border border-neutral-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                  <Package className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest block">
                    Tracking ID
                  </span>

                  <span className="text-white font-mono text-lg font-bold">
                    {orderIdQuery}
                  </span>
                </div>
              </div>

              <Link
                href="/track"
                className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
              >
                Search Another
              </Link>
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-12 text-center space-y-3">
                <Clock className="w-8 h-8 animate-spin mx-auto text-neutral-400" />

                <p className="text-sm text-neutral-400">
                  Retrieving order shipment status...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />

                <div className="text-sm">
                  <p className="font-semibold">Unable to find order</p>

                  <p className="text-neutral-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Order Data */}
            {!loading &&
              orderData &&
              (() => {
                const orderStatusStyle = getStatusBadge(
                  orderData.orderStatus,
                  "order"
                );

                const paymentStatusStyle = getStatusBadge(
                  orderData.paymentVerification,
                  "payment"
                );

                return (
                  <div className="space-y-6 text-left">
                    {/* Order Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/60">
                      {/* Current Status */}
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Current Status
                        </span>

                        <div
                          className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold capitalize ${orderStatusStyle.bg} ${orderStatusStyle.text}`}
                        >
                          {orderStatusStyle.icon}

                          <span>
                            {orderData.orderStatus || "Packaging"}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Payment Method
                        </span>

                        <span className="text-white font-medium text-sm mt-1 uppercase block">
                          {orderData.paymentMethod} (
                          <span
                            className={`font-semibold capitalize ${paymentStatusStyle.text}`}
                          >
                            {orderData.paymentVerification}
                          </span>
                          )
                        </span>
                      </div>

                      {/* Total Amount */}
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <ReceiptText className="w-3.5 h-3.5" />
                          Total Amount
                        </span>

                        <span className="text-white font-mono font-bold text-sm mt-0.5 block">
                          Rs.{" "}
                          {orderData.total?.toLocaleString("en-PK", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Order Date */}
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Order Placed On
                        </span>

                        <span className="text-neutral-300 text-sm mt-0.5 block font-medium">
                          {orderData.createdAt
                            ? new Date(
                                orderData.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Cancelled Banner */}
                    {orderData.orderStatus === "cancelled" && (
                      <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                        <XCircle className="w-5 h-5 shrink-0 text-red-400" />

                        <span>
                          This order has been cancelled. Please contact support
                          if you have any questions.
                        </span>
                      </div>
                    )}

                    {/* Pending Payment Banner */}
                    {orderData.paymentVerification === "pending" &&
                      orderData.paymentMethod === "online" &&
                      orderData.orderStatus !== "cancelled" && (
                        <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-center gap-3 text-amber-200 text-sm">
                          <Clock className="w-5 h-5 shrink-0 text-amber-400" />

                          <span>
                            Your online payment is currently pending
                            verification.
                          </span>
                        </div>
                      )}
                  </div>
                );
              })()}
          </div>
        )}
      </div>
    </main>
  );
}