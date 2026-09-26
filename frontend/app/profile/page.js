'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import axiosInstance from "@/lib/axiosInstance";
import { 
  Package, 
  RotateCcw, 
  Lock, 
  LogOut, 
  User, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isInitialized } = useSelector((state) => state.auth);

  // Active Tab State
  const [activeTab, setActiveTab] = useState("orders");

  // Data States
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Password Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Auth Guard: Redirect to login if uninitialized or no user
  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/login");
    }
  }, [isInitialized, user, router]);

  // Sync tab with URL hash on mount and hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["orders", "refunds", "security"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch orders or refunds when tabs change
  useEffect(() => {
    if (!user) return;

    const fetchTabData = async () => {
      setLoadingData(true);
      try {
        if (activeTab === "orders") {
          const res = await axiosInstance.get("/order/my");
          setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
        } else if (activeTab === "refunds") {
          const res = await axiosInstance.get("/order/my-refunds");
          setRefunds(res.data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTabData();
  }, [activeTab, user]);

  // Switch tab and update URL hash
  const switchTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      dispatch(logout());
      router.push("/");
    }
  };

  // Handle Password Update / Setup
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPassword.length < 8) {
      setPassError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }

    setPassLoading(true);

    try {
      await axiosInstance.put("/auth/update-password", { newPassword });
      setPassSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-950 text-neutral-400 font-sans text-xs tracking-widest uppercase">
        Verifying Session...
      </div>
    );
  }

  return (
    <main className="min-h-[85vh] max-w-6xl mx-auto px-4 py-8 md:py-12 font-sans relative">
      
      {/* Profile Header Banner */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 md:p-8 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-serif text-xl md:text-2xl font-bold shadow-inner shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-2xl font-bold text-white tracking-wide truncate">
                {user.name || "Valued Patron"}
              </h1>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-neutral-400 tracking-wider mt-0.5 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => switchTab("orders")}
            className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 lg:px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-neutral-800 text-white border border-neutral-700 shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
            }`}
          >
            <Package className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => switchTab("refunds")}
            className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 lg:px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "refunds"
                ? "bg-neutral-800 text-white border border-neutral-700 shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>My Refunds</span>
          </button>

          <button
            onClick={() => switchTab("security")}
            className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 lg:px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "security"
                ? "bg-neutral-800 text-white border border-neutral-700 shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
            }`}
          >
            <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>Security</span>
          </button>
        </div>

        {/* Content Display Area */}
        <div className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 md:p-8 backdrop-blur-md shadow-xl">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === "orders" && (
            <div>
              <div className="mb-6 pb-4 border-b border-neutral-800">
                <h2 className="font-serif text-base md:text-lg font-bold uppercase tracking-widest text-white">Order History</h2>
                <p className="text-xs text-neutral-400 mt-1">Click on any order below to view full details and tracking options.</p>
              </div>

              {loadingData ? (
                <div className="text-center py-12 text-xs text-neutral-500 uppercase tracking-widest">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400 uppercase tracking-widest">No orders recorded yet.</p>
                </div>
              ) : (
                <div className="max-h-120 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {orders.map((order) => {
                    const isCancelled = order.orderStatus === 'cancelled';
                    const isDelivered = order.orderStatus === 'delivered';
                    
                    return (
                      <div 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-neutral-950/60 hover:bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">{order.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isCancelled 
                                ? 'bg-red-950/40 text-red-400 border-red-900/50' 
                                : isDelivered 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                            }`}>
                              {order.orderStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800">
                              {order.paymentMethod.toUpperCase()} ({order.paymentVerification})
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 font-medium">
                            Total: Rs. {order.total?.toLocaleString()} <span className="text-neutral-500 font-normal">({order.items?.length || 1} item{order.items?.length > 1 ? 's' : ''})</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="sm:text-right">
                            <span className="text-[11px] text-neutral-500 font-mono block">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-neutral-600 font-mono block mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:border-neutral-700 transition-all">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REFUNDS */}
          {activeTab === "refunds" && (
  <div>
    <div className="mb-6 pb-4 border-b border-neutral-800">
      <h2 className="font-serif text-base md:text-lg font-bold uppercase tracking-widest text-white">
        Refunded Orders
      </h2>

      <p className="text-xs text-neutral-400 mt-1">
        View your approved refund orders.
      </p>
    </div>

    {loadingData ? (
      <div className="text-center py-12 text-xs text-neutral-500 uppercase tracking-widest">
        Loading refunds...
      </div>
    ) : refunds.length === 0 ? (
      <div className="text-center py-16 space-y-3">
        <RotateCcw className="w-8 h-8 text-neutral-600 mx-auto" />

        <p className="text-xs text-neutral-400 uppercase tracking-widest">
          No refunded orders.
        </p>
      </div>
    ) : (
      <div className="max-h-120 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {refunds.map((refund) => (
          <div
            key={refund._id}
            className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 md:p-5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div>
                <span className="font-mono text-xs text-neutral-400">
                  Order: #{refund.orderNumber}
                </span>

                <p className="text-xs text-white mt-1">
                  Reason: {refund.refundReason || "Not specified"}
                </p>

                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(refund.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
                {refund.refundStatus}
              </span>

            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div>
              <div className="mb-6 pb-4 border-b border-neutral-800">
                <h2 className="font-serif text-base md:text-lg font-bold uppercase tracking-widest text-white">Security & Password</h2>
                <p className="text-xs text-neutral-400 mt-1">Set a manual password or update your existing credentials.</p>
              </div>

              {passError && (
                <div className="mb-6 p-3 rounded-xl text-xs text-red-400 bg-red-950/40 border border-red-800/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="mb-6 p-3 rounded-xl text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Must be at least 8 characters long.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-300 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/40"
                >
                  {passLoading ? "Updating Credentials..." : "Save Password"}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block">Order Details</span>
                <h3 className="font-serif text-lg md:text-xl font-bold text-white tracking-wide mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              
              {/* Status & Date Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-800 text-white border border-neutral-700">
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Payment Method</span>
                  <span className="text-xs font-medium text-neutral-300 mt-1 block uppercase">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentVerification})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">Placed On</span>
                  <span className="text-xs font-mono text-neutral-300 mt-1 block">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Ordered Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-neutral-800 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.name || item.title || "Luxury Timepiece"}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-white shrink-0">
                        Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Contact Info */}
              {selectedOrder.shippingAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shipping Address</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                      {selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recipient Contact</span>
                    </div>
                    <p className="text-xs text-neutral-300">
                      {selectedOrder.shippingAddress.phone || user.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Cost Summary */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Subtotal</span>
                  <span>Rs. {(selectedOrder.subtotal || selectedOrder.total)?.toLocaleString()}</span>
                </div>
                {selectedOrder.shippingFee > 0 && (
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Shipping Fee</span>
                    <span>Rs. {selectedOrder.shippingFee?.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400">Rs. {selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer / Track Button */}
            <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-widest transition-all"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/track?orderId=${selectedOrder.orderNumber}`)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <span>Track Order</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}