"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "packaging", label: "Packaging" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const REFUND_STATUSES = [
  { value: "all", label: "All Refunds" },
  { value: "none", label: "No Refund" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "processed", label: "Processed" },
];

const PAYMENT_METHODS = [
  { value: "all", label: "All Methods" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "online", label: "Online Payment" },
];

const formatCurrency = (value) => {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const capitalize = (value) => {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
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
      return "bg-indigo-50 text-indigo-700 border-indigo-200";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getPaymentClasses = (status) => {
  switch (status) {
    case "verified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getRefundClasses = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "approved":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "processed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("packaging");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [refundStatus, setRefundStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const Router = useRouter();

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/order/orders");

      const data = response.data?.orders || [];

      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Orders",
        text:
          error.response?.data?.message ||
          "Something went wrong while loading orders.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      /* -------------------------
         SEARCH
      ------------------------- */

      if (query) {
        const orderNumber = String(order.orderNumber || "").toLowerCase();

        const customerName = String(
          order.user?.name || order.shippingAddress?.fullName || ""
        ).toLowerCase();

        const customerEmail = String(order.user?.email || "").toLowerCase();

        const phone = String(
          order.shippingAddress?.phone || ""
        ).toLowerCase();

        const matchesSearch =
          orderNumber.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          phone.includes(query);

        if (!matchesSearch) {
          return false;
        }
      }

      /* -------------------------
         ORDER STATUS
      ------------------------- */

      if (
        orderStatus !== "all" &&
        order.orderStatus !== orderStatus
      ) {
        return false;
      }

      /* -------------------------
         PAYMENT STATUS
      ------------------------- */

      if (
        paymentStatus !== "all" &&
        order.paymentVerification !== paymentStatus
      ) {
        return false;
      }

      /* -------------------------
         REFUND STATUS
      ------------------------- */

      if (
        refundStatus !== "all" &&
        order.refundStatus !== refundStatus
      ) {
        return false;
      }

      /* -------------------------
         PAYMENT METHOD
      ------------------------- */

      if (
        paymentMethod !== "all" &&
        order.paymentMethod !== paymentMethod
      ) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    search,
    orderStatus,
    paymentStatus,
    refundStatus,
    paymentMethod,
  ]);

  const clearFilters = () => {
    setSearch("");
    setOrderStatus("all");
    setPaymentStatus("all");
    setRefundStatus("all");
    setPaymentMethod("all");
  };

  const hasFilters =
    search ||
    orderStatus !== "all" ||
    paymentStatus !== "all" ||
    refundStatus !== "all" ||
    paymentMethod !== "all";

  const handleUpdateOrderStatus = async (order, newStatus) => {
    if (newStatus === order.orderStatus) {
      return;
    }

    if (
      newStatus === "cancelled" &&
      !["delivered", "received", "cancelled"].includes(order.orderStatus)
    ) {
      const result = await Swal.fire({
        title: "Cancel this order?",
        text: "The order stock will be restored. This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, cancel order",
        cancelButtonText: "Keep Order",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setUpdating(true);

      showLoadingAlert("Updating order status...");

      const response = await axiosInstance.patch(
        `/order/${order._id}/status`,
        {
          orderStatus: newStatus,
        }
      );

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Order status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedOrder(response.data?.order || null);

      await fetchOrders();
    } catch (error) {

      Swal.close();  
      
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Failed to update order status.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentVerification = async (
    order,
    newVerification
  ) => {
    if (newVerification === order.paymentVerification) {
      return;
    }

    if (newVerification === "rejected") {
      const result = await Swal.fire({
        title: "Reject payment?",
        text: "The order will be cancelled and its stock will be restored.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Reject Payment",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      setUpdating(true);

      showLoadingAlert("Updating payment verification...");

      const response = await axiosInstance.patch(
        `/order/${order._id}/payment-verification`,
        {
          paymentVerification: newVerification,
        }
      );

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Payment verification updated.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedOrder(response.data?.order || null);

      await fetchOrders();
    } catch (error) {

    Swal.close();

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Failed to update payment verification.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundUpdate = async (order, newRefundStatus) => {
    if (newRefundStatus === order.refundStatus) {
      return;
    }

    try {
      setUpdating(true);

      showLoadingAlert("Updating refund status...");

      const response = await axiosInstance.patch(
        `/order/${order._id}/refund`,
        {
          refundStatus: newRefundStatus,
        }
      );
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Refund Updated",
        text:
          response.data?.message ||
          "Refund status updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedOrder(response.data?.order || null);

      await fetchOrders();
    } catch (error) {
    Swal.close();  
      Swal.fire({
        icon: "error",
        title: "Refund Update Failed",
        text:
          error.response?.data?.message ||
          "Failed to update refund.",
        confirmButtonColor: "#4F46E5",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openPrintPage = (order) => {
    // window.open(
    //   `/admin/dashboard/orders/${order._id}`,
    //   "_blank",
    //   "noopener,noreferrer"
    // );

    Router.push(`/admin/dashboard/orders/${order._id}`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Order Management
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage orders, payments, refunds, and packing slips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Total: {orders.length}
          </span>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Showing: {filteredOrders.length}
          </span>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {ORDER_STATUSES.map((status) => {
            const count =
              status.value === "all"
                ? orders.length
                : orders.filter(
                    (order) =>
                      order.orderStatus === status.value
                  ).length;

            const active = orderStatus === status.value;

            return (
              <button
                key={status.value}
                type="button"
                onClick={() => setOrderStatus(status.value)}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {status.label}

                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          {/* SEARCH */}
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Search
            </label>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order number, customer, email, phone..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* PAYMENT */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Payment
            </label>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* REFUND */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Refund
            </label>

            <select
              value={refundStatus}
              onChange={(e) => setRefundStatus(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
            >
              {REFUND_STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600"
            >
              {PAYMENT_METHODS.map((method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ORDERS */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-sm font-semibold text-slate-600">
              No orders found
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your filters or search query.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden max-h-144 overflow-auto lg:block">
              <table className="w-full min-w-262.5">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Order
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* ORDER */}
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          #{order.orderNumber}
                        </div>

                        <div className="mt-1 text-[10px] text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-4">
                        <div className="text-xs font-semibold text-slate-800">
                          {order.shippingAddress?.fullName ||
                            order.user?.name ||
                            "Unknown"}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {order.user?.email || "No email"}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {order.shippingAddress?.phone || "No phone"}
                        </div>
                      </td>

                      {/* ITEMS */}
                      <td className="px-4 py-4">
                        <div className="text-xs font-semibold text-slate-700">
                          {order.items?.length || 0}{" "}
                          {order.items?.length === 1
                            ? "line"
                            : "lines"}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {order.items?.reduce(
                            (total, item) =>
                              total + Number(item.quantity || 0),
                            0
                          )}{" "}
                          units
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="px-4 py-4">
                        <div className="text-xs font-bold text-slate-900">
                          {formatCurrency(order.total)}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : "Online"}
                        </div>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getPaymentClasses(
                            order.paymentVerification
                          )}`}
                        >
                          {capitalize(
                            order.paymentVerification
                          )}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                            order.orderStatus
                          )}`}
                        >
                          {capitalize(order.orderStatus)}
                        </span>

                        {order.refundStatus !== "none" && (
                          <div className="mt-1">
                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-semibold ${getRefundClasses(
                                order.refundStatus
                              )}`}
                            >
                              Refund:{" "}
                              {capitalize(order.refundStatus)}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openPrintPage(order)
                            }
                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                          >
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-900">
                        #{order.orderNumber}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                        order.orderStatus
                      )}`}
                    >
                      {capitalize(order.orderStatus)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Customer
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-800">
                        {order.shippingAddress?.fullName ||
                          order.user?.name ||
                          "Unknown"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Total
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Payment
                      </div>

                      <div className="mt-1">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-semibold ${getPaymentClasses(
                            order.paymentVerification
                          )}`}
                        >
                          {capitalize(
                            order.paymentVerification
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Method
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        {order.paymentMethod === "cod"
                          ? "COD"
                          : "Online"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                      className="flex-1 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      View Order
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openPrintPage(order)
                      }
                      className="flex-1 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  #{selectedOrder.orderNumber}
                </div>

                <div className="mt-0.5 text-[10px] text-slate-400">
                  {formatDateTime(selectedOrder.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openPrintPage(selectedOrder)
                  }
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Close
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="max-h-[calc(92vh-75px)] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* CUSTOMER */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </h3>

                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        Name
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {selectedOrder.shippingAddress
                          ?.fullName ||
                          selectedOrder.user?.name ||
                          "Unknown"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">
                        Email
                      </div>

                      <div className="break-all text-xs font-semibold text-slate-800">
                        {selectedOrder.user?.email ||
                          "No email"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400">
                        Phone
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {selectedOrder.shippingAddress?.phone ||
                          "No phone"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Delivery Address
                  </h3>

                  <div className="mt-3 text-xs leading-6 text-slate-700">
                    <div className="font-semibold text-slate-900">
                      {selectedOrder.shippingAddress
                        ?.fullName}
                    </div>

                    <div>
                      {selectedOrder.shippingAddress?.address}
                    </div>

                    <div>
                      {selectedOrder.shippingAddress?.city}

                      {selectedOrder.shippingAddress
                        ?.postalCode
                        ? `, ${selectedOrder.shippingAddress.postalCode}`
                        : ""}
                    </div>

                    <div>
                      {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Payment
                  </h3>

                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        Method
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {selectedOrder.paymentMethod ===
                        "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-[10px] text-slate-400">
                        Verification
                      </div>

                      <select
                        value={
                          selectedOrder.paymentVerification
                        }
                        disabled={updating}
                        onChange={(e) =>
                          handlePaymentVerification(
                            selectedOrder,
                            e.target.value
                          )
                        }
                        className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-indigo-600"
                      >
                        {PAYMENT_STATUSES.filter(
                          (item) =>
                            item.value !== "all"
                        ).map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Order Items
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map(
                    (item, index) => {
                      const variations =
                        item.variations &&
                        typeof item.variations ===
                          "object"
                          ? Object.entries(
                              item.variations
                            )
                          : [];

                      const itemTotal =
                        Number(item.price || 0) *
                        Number(item.quantity || 0);

                      return (
                        <div
                          key={`${item.product?._id || item.product}-${index}`}
                          className="flex gap-3 p-4"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[9px] text-slate-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-900">
                              {item.name}
                            </div>

                            {variations.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {variations.map(
                                  ([option, value]) => (
                                    <span
                                      key={`${option}-${value}`}
                                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-600"
                                    >
                                      {option}: {value}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                            <div className="mt-2 text-[10px] text-slate-400">
                              {formatCurrency(item.price)} ×{" "}
                              {item.quantity}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xs font-bold text-slate-900">
                              {formatCurrency(itemTotal)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* TOTALS + ACTIONS */}
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* STATUS */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Order Status
                  </h3>

                  <div className="mt-3">
                    <select
                      value={selectedOrder.orderStatus}
                      disabled={
                        updating ||
                        selectedOrder.orderStatus ===
                          "cancelled"
                      }
                      onChange={(e) =>
                        handleUpdateOrderStatus(
                          selectedOrder,
                          e.target.value
                        )
                      }
                      className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-600"
                    >
                      {ORDER_STATUSES.filter(
                        (item) => item.value !== "all"
                      ).map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 text-[10px] text-slate-400">
                      Current status
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {capitalize(
                        selectedOrder.orderStatus
                      )}
                    </span>
                  </div>
                </div>

                {/* TOTALS */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Order Summary
                  </h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatCurrency(
                          selectedOrder.subtotal
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Shipping
                      </span>

                      <span className="font-semibold text-slate-800">
                        {Number(
                          selectedOrder.shippingFee || 0
                        ) === 0
                          ? "FREE"
                          : formatCurrency(
                              selectedOrder.shippingFee
                            )}
                      </span>
                    </div>

                    {Number(selectedOrder.codFee || 0) >
                      0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          COD Fee
                        </span>

                        <span className="font-semibold text-slate-800">
                          {formatCurrency(
                            selectedOrder.codFee
                          )}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">
                          Total
                        </span>

                        <span className="text-base font-bold text-slate-900">
                          {formatCurrency(
                            selectedOrder.total
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* REFUND */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Refund
                    </h3>

                    {selectedOrder.refundRequested && (
                      <div className="mt-2 space-y-1 text-xs">
                        <div>
                          <span className="text-slate-400">
                            Amount:
                          </span>{" "}
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(
                              selectedOrder.refundAmount
                            )}
                          </span>
                        </div>

                        {selectedOrder.refundReason && (
                          <div>
                            <span className="text-slate-400">
                              Reason:
                            </span>{" "}
                            <span className="text-slate-700">
                              {selectedOrder.refundReason}
                            </span>
                          </div>
                        )}

                        {selectedOrder.refundNote && (
                          <div>
                            <span className="text-slate-400">
                              Note:
                            </span>{" "}
                            <span className="text-slate-700">
                              {selectedOrder.refundNote}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <select
                    value={selectedOrder.refundStatus}
                    disabled={updating}
                    onChange={(e) =>
                      handleRefundUpdate(
                        selectedOrder,
                        e.target.value
                      )
                    }
                    className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-600 sm:w-48"
                  >
                    {REFUND_STATUSES.filter(
                      (item) => item.value !== "all"
                    ).map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
