"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";

const ORDER_STATUSES = [
  "packaging",
  "shipped",
  "delivered",
  "received",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "verified", "rejected"];

const REFUND_STATUSES = [
  "none",
  "pending",
  "approved",
  "rejected",
  "processed",
];

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatCurrency = (value) => {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
};

const showLoadingAlert = (title = "Updating...") => {
    Swal.fire({
      title,
      text: "Please wait while we save the changes.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "packaging":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "received":
      return "bg-green-50 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    case "verified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "processed":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingRefund, setUpdatingRefund] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/order/${orderId}`);

      if (response.data?.success) {
        setOrder(response.data.order);
      } else {
        throw new Error(response.data?.message || "Failed to load order.");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Order",
        text: error.response?.data?.message || "Unable to load order details.",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        router.push("/admin/dashboard/orders");
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateOrderStatus = async (newStatus) => {
    if (!order || newStatus === order.orderStatus) return;

    if (
      newStatus === "cancelled" &&
      ["delivered", "received"].includes(order.orderStatus)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Cancel Order",
        text: "Delivered or received orders cannot be cancelled.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (order.orderStatus === "cancelled") {
      Swal.fire({
        icon: "warning",
        title: "Order Already Cancelled",
        text: "A cancelled order cannot be updated.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    if (newStatus === "cancelled") {
      const result = await Swal.fire({
        icon: "warning",
        title: "Cancel this order?",
        text: "Stock will be restored when the order is cancelled.",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, cancel order",
        cancelButtonText: "Keep order",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;
    }

    try {
      setUpdatingStatus(true);

      showLoadingAlert("Updating order status...");

      const response = await axiosInstance.patch(`/order/${order._id}/status`, {
        orderStatus: newStatus,
      });

      setOrder((prev) => ({
        ...prev,
        ...(response.data?.order || {}),
        orderStatus: response.data?.order?.orderStatus || newStatus,
      }));

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: response.data?.message || "Order status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);

      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Failed to update order status.",
        confirmButtonColor: "#4F46E5",
      });

      fetchOrder();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updatePaymentVerification = async (newStatus) => {
    if (!order || newStatus === order.paymentVerification) return;

    if (newStatus === "rejected") {
      const result = await Swal.fire({
        icon: "warning",
        title: "Reject payment?",
        text: "Rejecting the payment will cancel the order and restore stock.",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, reject payment",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setUpdatingPayment(true);

      showLoadingAlert("Updating payment verification...");

      const response = await axiosInstance.patch(
        `/order/${order._id}/payment-verification`,
        {
          paymentVerification: newStatus,
        }
      );

      setOrder((prev) => ({
        ...prev,
        ...(response.data?.order || {}),
        paymentVerification:
          response.data?.order?.paymentVerification || newStatus,
      }));

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Payment Updated",
        text:
          response.data?.message ||
          "Payment verification updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update payment:", error);

      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Payment Update Failed",
        text:
          error.response?.data?.message ||
          "Failed to update payment verification.",
        confirmButtonColor: "#4F46E5",
      });

      fetchOrder();
    } finally {
      setUpdatingPayment(false);
    }
  };

  const updateRefundStatus = async (newStatus) => {
    if (!order || newStatus === order.refundStatus) return;

    if (newStatus !== "none" && !order.refundRequested) {
      Swal.fire({
        icon: "warning",
        title: "No Refund Request",
        text: "This order does not have a refund request.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    let confirmText = "";

    if (newStatus === "approved") {
      confirmText = "Approve the customer's refund request?";
    }

    if (newStatus === "rejected") {
      confirmText = "Reject the customer's refund request?";
    }

    if (newStatus === "processed") {
      confirmText = "Mark this refund as processed?";
    }

    if (confirmText) {
      const result = await Swal.fire({
        icon: "warning",
        title: `${formatLabel(newStatus)} refund?`,
        text: confirmText,
        showCancelButton: true,
        confirmButtonColor: newStatus === "rejected" ? "#DC2626" : "#4F46E5",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;
    }

    try {
      setUpdatingRefund(true);

      showLoadingAlert("Updating refund status...");

      const response = await axiosInstance.patch(`/order/${order._id}/refund`, {
        refundStatus: newStatus,
      });

      setOrder((prev) => ({
        ...prev,
        ...(response.data?.order || {}),
        refundStatus: response.data?.order?.refundStatus || newStatus,
      }));

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Refund Updated",
        text: response.data?.message || "Refund status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update refund:", error);

      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Refund Update Failed",
        text: error.response?.data?.message || "Failed to update refund.",
        confirmButtonColor: "#4F46E5",
      });

      fetchOrder();
    } finally {
      setUpdatingRefund(false);
    }
  };

  const escapeHtml = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getVariationText = (variations) => {
    if (!variations || typeof variations !== "object") {
      return "";
    }

    return Object.entries(variations)
      .map(([key, value]) => `${formatLabel(key)}: ${value}`)
      .join(" • ");
  };

  const handlePrintPackingSlip = () => {
    if (!order) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      Swal.fire({
        icon: "warning",
        title: "Popup Blocked",
        text: "Please allow popups for this website to open the packing slip.",
        confirmButtonColor: "#4F46E5",
      });

      return;
    }

    const itemsHtml = order.items
      .map((item, index) => {
        const variationText = getVariationText(item.variations);

        return `
          <tr>
            <td class="center">${index + 1}</td>
            <td>
              <div class="product-name">
                ${escapeHtml(item.name)}
              </div>

              ${
                variationText
                  ? `<div class="variation">
                      ${escapeHtml(variationText)}
                    </div>`
                  : ""
              }
            </td>

            <td class="center">
              ${escapeHtml(item.quantity)}
            </td>

            <td class="right">
              Rs. ${Number(item.price || 0).toLocaleString("en-PK")}
            </td>

            <td class="right">
              Rs. ${(
                Number(item.price || 0) * Number(item.quantity || 0)
              ).toLocaleString("en-PK")}
            </td>
          </tr>
        `;
      })
      .join("");

    const address = order.shippingAddress || {};

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip - ${escapeHtml(order.orderNumber)}</title>

          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: white;
              font-size: 13px;
            }

            .page {
              max-width: 900px;
              margin: 0 auto;
            }

            .top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #111827;
              padding-bottom: 18px;
              margin-bottom: 22px;
            }

            .brand {
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }

            .title {
              font-size: 18px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 5px;
            }

            .muted {
              color: #6b7280;
            }

            .section {
              margin-bottom: 24px;
            }

            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 7px;
              margin-bottom: 10px;
            }

            .address {
              line-height: 1.7;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 28px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th {
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              background: #f3f4f6;
              border-top: 1px solid #d1d5db;
              border-bottom: 1px solid #d1d5db;
              padding: 9px 8px;
            }

            td {
              border-bottom: 1px solid #e5e7eb;
              padding: 11px 8px;
              vertical-align: top;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .product-name {
              font-weight: 600;
            }

            .variation {
              margin-top: 4px;
              color: #6b7280;
              font-size: 11px;
            }

            .totals {
              width: 320px;
              margin-left: auto;
              margin-top: 18px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }

            .grand-total {
              border-top: 2px solid #111827;
              margin-top: 6px;
              padding-top: 10px;
              font-size: 15px;
              font-weight: 800;
            }

            .footer {
              border-top: 1px solid #d1d5db;
              margin-top: 35px;
              padding-top: 15px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
            }

            @page {
  size: auto;
  margin: 0;
}

@media print {
  body {
    padding: 12mm;
  }

  .no-print {
    display: none !important;
  }
}

            @media (max-width: 650px) {
              body {
                padding: 15px;
              }

              .grid {
                grid-template-columns: 1fr;
                gap: 18px;
              }

              .totals {
                width: 100%;
              }

              .top {
                flex-direction: column;
                gap: 15px;
              }
            }
          </style>
        </head>

        <body>
          <div class="page">

            <div class="top">
              <div>
                <div class="brand">REBEL WATCHES</div>
                <div class="muted">
                  Packing Slip
                </div>
              </div>

              <div>
                <div class="title">
                  ${escapeHtml(order.orderNumber)}
                </div>

                <div class="muted">
                  ${escapeHtml(formatDate(order.createdAt))}
                </div>
              </div>
            </div>

            <div class="grid section">

              <div>
                <div class="section-title">
                  Ship To
                </div>

                <div class="address">
                  <strong>
                    ${escapeHtml(address.fullName)}
                  </strong>
                  <br />

                  ${escapeHtml(address.address)}
                  <br />

                  ${escapeHtml(address.city)}
                  ${
                    address.postalCode
                      ? `, ${escapeHtml(address.postalCode)}`
                      : ""
                  }

                  <br />

                  Phone:
                  ${escapeHtml(address.phone)}
                </div>
              </div>

              <div>
                <div class="section-title">
                  Order Information
                </div>

                <div class="address">
                  <strong>Order:</strong>
                  ${escapeHtml(order.orderNumber)}
                  <br />

                  <strong>Payment:</strong>
                  ${escapeHtml(formatLabel(order.paymentMethod))}

                  <br />

                  <strong>Customer:</strong>
                  ${escapeHtml(order.user?.name || address.fullName)}

                  ${
                    order.user?.email
                      ? `<br />
                         <strong>Email:</strong>
                         ${escapeHtml(order.user.email)}`
                      : ""
                  }
                </div>
              </div>

            </div>

            <div class="section">

              <div class="section-title">
                Items
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 45px;">#</th>
                    <th>Product</th>
                    <th style="width: 70px;">Qty</th>
                    <th style="width: 100px;" class="right">
                      Price
                    </th>
                    <th style="width: 110px;" class="right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="totals">

                <div class="total-row">
                  <span>Subtotal</span>
                  <strong>
                    Rs. ${Number(order.subtotal || 0).toLocaleString("en-PK")}
                  </strong>
                </div>

                <div class="total-row">
                  <span>Shipping</span>
                  <strong>
                    Rs. ${Number(order.shippingFee || 0).toLocaleString(
                      "en-PK"
                    )}
                  </strong>
                </div>

                ${
                  Number(order.codFee || 0) > 0
                    ? `
                      <div class="total-row">
                        <span>COD Fee</span>
                        <strong>
                          Rs. ${Number(order.codFee || 0).toLocaleString(
                            "en-PK"
                          )}
                        </strong>
                      </div>
                    `
                    : ""
                }

                <div class="total-row">
                  <span>Fee</span>
                  <strong>
                    Rs. ${Number(order.fee || 0).toLocaleString("en-PK")}
                  </strong>
                </div>

                <div class="total-row grand-total">
                  <span>Total</span>
                  <span>
                    Rs. ${Number(order.total || 0).toLocaleString("en-PK")}
                  </span>
                </div>

              </div>

            </div>

            <div class="footer">
              Thank you for shopping with Rebel Watches.
            </div>

          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-6xl">
        <div className="border-b border-slate-200 pb-4">
          <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-72 bg-slate-100 rounded mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse"
            >
              <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
              <div className="h-3 w-full bg-slate-100 rounded mb-3" />
              <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isLocked = order.orderStatus === "cancelled";

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/orders")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 cursor-pointer"
          >
            ← Back to Orders
          </button>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Order Details
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            {order.orderNumber} • {formatDate(order.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintPackingSlip}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
        >
          <span>🖨</span>
          Print Packing Slip
        </button>
      </div>

      {/* Top information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Customer</h2>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Name
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {order.user?.name || order.shippingAddress?.fullName || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Email
              </p>

              <p className="text-xs text-slate-600 mt-0.5 break-all">
                {order.user?.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Phone
              </p>

              <p className="text-xs text-slate-600 mt-0.5">
                {order.shippingAddress?.phone || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Shipping Address
          </h2>

          <div className="text-xs text-slate-600 leading-6">
            <p className="font-semibold text-slate-800">
              {order.shippingAddress?.fullName || "—"}
            </p>

            <p>{order.shippingAddress?.address || "—"}</p>

            <p>
              {order.shippingAddress?.city || "—"}
              {order.shippingAddress?.postalCode
                ? `, ${order.shippingAddress.postalCode}`
                : ""}
            </p>

            <p>Phone: {order.shippingAddress?.phone || "—"}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Payment</h2>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Method
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {formatLabel(order.paymentMethod)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
                Verification
              </p>

              <select
                value={order.paymentVerification}
                onChange={(e) => updatePaymentVerification(e.target.value)}
                disabled={updatingPayment || order.orderStatus === "cancelled"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Order Status</h2>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage the current order progress.
              </p>
            </div>

            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusClasses(
                order.orderStatus
              )}`}
            >
              {formatLabel(order.orderStatus)}
            </span>
          </div>

          <select
            value={order.orderStatus}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updatingStatus || isLocked}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {ORDER_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
                disabled={
                  order.orderStatus !== "cancelled" &&
                  ["delivered", "received"].includes(order.orderStatus) &&
                  status === "cancelled"
                }
              >
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Refund</h2>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Manage refund requests for this order.
              </p>
            </div>

            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${getStatusClasses(
                order.refundStatus
              )}`}
            >
              {formatLabel(order.refundStatus)}
            </span>
          </div>

          {order.refundRequested ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Requested Amount
                </p>

                <p className="text-sm font-bold text-slate-900 mt-1">
                  {formatCurrency(order.refundAmount)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Stock Restored
                </p>

                <p className="text-sm font-bold text-slate-900 mt-1">
                  {order.stockRestored ? "Yes" : "No"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500">
                No refund has been requested for this order.
              </p>
            </div>
          )}

          {order.refundRequested && (
            <select
              value={order.refundStatus}
              onChange={(e) => updateRefundStatus(e.target.value)}
              disabled={updatingRefund}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {REFUND_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          )}

          {order.refundReason && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Customer Reason
              </p>

              <p className="text-xs text-slate-600 mt-1 leading-5">
                {order.refundReason}
              </p>
            </div>
          )}

          {order.refundNote && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Admin Note
              </p>

              <p className="text-xs text-slate-600 mt-1 leading-5">
                {order.refundNote}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Order Items</h2>

            <p className="text-[11px] text-slate-500 mt-0.5">
              {order.items?.length || 0} product line
              {order.items?.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            {order.items?.reduce(
              (total, item) => total + Number(item.quantity || 0),
              0
            )}{" "}
            Units
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-[10px] uppercase tracking-wide font-bold text-slate-400 pb-3 pr-4">
                  Product
                </th>

                <th className="text-center text-[10px] uppercase tracking-wide font-bold text-slate-400 pb-3 px-4">
                  Qty
                </th>

                <th className="text-right text-[10px] uppercase tracking-wide font-bold text-slate-400 pb-3 px-4">
                  Price
                </th>

                <th className="text-right text-[10px] uppercase tracking-wide font-bold text-slate-400 pb-3 pl-4">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items?.map((item, index) => {
                const variationText = getVariationText(item.variations);

                return (
                  <tr
                    key={`${item.product?._id || item.product}-${index}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {item.image || item.product?.images?.[0] ? (
                          <img
                            src={item.image || item.product?.images?.[0]}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
                            No Image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {item.name}
                          </p>

                          {variationText && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              {variationText}
                            </p>
                          )}

                          {item.product?.productId && (
                            <p className="text-[9px] text-slate-400 mt-1">
                              ID: {item.product.productId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="text-xs text-slate-600">
                        {formatCurrency(item.price)}
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-right">
                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {order.items?.map((item, index) => {
            const variationText = getVariationText(item.variations);

            return (
              <div
                key={`${item.product?._id || item.product}-${index}`}
                className="border border-slate-200 rounded-lg p-3"
              >
                <div className="flex gap-3">
                  {item.image || item.product?.images?.[0] ? (
                    <img
                      src={item.image || item.product?.images?.[0]}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>

                    {variationText && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        {variationText}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-500">
                        Qty:{" "}
                        <strong className="text-slate-700">
                          {item.quantity}
                        </strong>
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order totals */}
      <div className="flex justify-end">
        <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Subtotal</span>

              <span className="font-medium text-slate-700">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Shipping Fee</span>

              <span className="font-medium text-slate-700">
                {formatCurrency(order.shippingFee)}
              </span>
            </div>

            {Number(order.codFee || 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">COD Fee</span>

                <span className="font-medium text-slate-700">
                  {formatCurrency(order.codFee)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Fee</span>

              <span className="font-medium text-slate-700">
                {formatCurrency(order.fee)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between">
              <span className="text-sm font-bold text-slate-900">Total</span>

              <span className="text-base font-bold text-indigo-700">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
