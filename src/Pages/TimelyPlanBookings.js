// TimelyPlanBookings.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaSearch, FaFilter, FaTimes, FaEye, FaCheckCircle, FaClock,
  FaTimesCircle, FaDownload, FaCrown, FaBuilding, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaRupeeSign,
  FaCreditCard, FaUniversity, FaPercentage, FaGift, FaUsers,
  FaBoxOpen, FaSyncAlt, FaChevronDown, FaChevronUp, FaCopy, FaExternalLinkAlt
} from "react-icons/fa";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const PLAN_STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "All", label: "All Payment" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "N/A"; }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  } catch { return "N/A"; }
};

const getPlanStatusColors = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "expired") return "bg-red-50 text-red-700 border-red-200";
  if (s === "cancelled") return "bg-gray-100 text-gray-600 border-gray-300";
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const getPaymentStatusColors = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "failed") return "bg-red-50 text-red-700 border-red-200";
  if (s === "refunded") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const TimelyPlanBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/timely-clients/allbookings`);
      if (res.data?.success) {
        setBookings(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching plan bookings:", err);
      setError(err.response?.data?.message || "Failed to load plan bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const isDateInRange = (dateStr, from, to) => {
    if (!from && !to) return true;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (from && to) {
      const f = new Date(from); f.setHours(0, 0, 0, 0);
      const t = new Date(to); t.setHours(23, 59, 59, 999);
      return d >= f && d <= t;
    }
    if (from) { const f = new Date(from); f.setHours(0, 0, 0, 0); return d >= f; }
    if (to) { const t = new Date(to); t.setHours(23, 59, 59, 999); return d <= t; }
    return true;
  };

  // Filter
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (planStatusFilter !== "All" && (b.status || "").toLowerCase() !== planStatusFilter.toLowerCase()) return false;
      if (paymentStatusFilter !== "All" && (b.paymentStatus || "").toLowerCase() !== paymentStatusFilter.toLowerCase()) return false;
      if (!isDateInRange(b.paidAt || b.createdAt, fromDate, toDate)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m =
          (b.fullName || "").toLowerCase().includes(q) ||
          (b.workEmail || "").toLowerCase().includes(q) ||
          (b.mobileNumber || "").toLowerCase().includes(q) ||
          (b.organizationName || "").toLowerCase().includes(q) ||
          (b.planName || "").toLowerCase().includes(q) ||
          (b.clientId || "").toLowerCase().includes(q) ||
          (b.transactionId || "").toLowerCase().includes(q) ||
          (b.generatedReferralCode || "").toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [bookings, planStatusFilter, paymentStatusFilter, fromDate, toDate, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) => (b.status || "").toLowerCase() === "active").length;
    const paid = bookings.filter((b) => (b.paymentStatus || "").toLowerCase() === "paid").length;
    const totalRevenue = bookings
      .filter((b) => (b.paymentStatus || "").toLowerCase() === "paid")
      .reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
    const totalBase = bookings
      .filter((b) => (b.paymentStatus || "").toLowerCase() === "paid")
      .reduce((s, b) => s + (Number(b.baseAmount) || 0), 0);
    const totalGST = bookings
      .filter((b) => (b.paymentStatus || "").toLowerCase() === "paid")
      .reduce((s, b) => s + (Number(b.gstAmount) || 0), 0);
    return { total, active, paid, totalRevenue, totalBase, totalGST };
  }, [bookings]);

  const hasActiveFilters =
    searchQuery !== "" || planStatusFilter !== "All" ||
    paymentStatusFilter !== "All" || fromDate !== "" || toDate !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setPlanStatusFilter("All");
    setPaymentStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = () => {
    if (!filteredBookings.length) return;
    const headers = [
      "#", "Full Name", "Work Email", "Mobile", "Organization", "Company Size",
      "Industry", "Address", "PAN", "Plan Name", "Base Amount", "GST", "Total",
      "Payment Status", "Payment Method", "Transaction ID", "Order ID",
      "Client ID", "Referral Code", "Valid From", "Valid Till", "Status",
      "Paid At", "Created At"
    ];
    const rows = filteredBookings.map((b, i) => [
      i + 1,
      `"${(b.fullName || "").replace(/"/g, '""')}"`,
      `"${b.workEmail || ""}"`,
      `"${b.mobileNumber || ""}"`,
      `"${(b.organizationName || "").replace(/"/g, '""')}"`,
      `"${b.companySize || ""}"`,
      `"${b.industryType || ""}"`,
      `"${(b.address || "").replace(/"/g, '""')}"`,
      `"${b.panNumber || ""}"`,
      `"${b.planName || ""}"`,
      b.baseAmount || 0,
      b.gstAmount || 0,
      b.totalAmount || 0,
      `"${b.paymentStatus || ""}"`,
      `"${b.paymentMethod || ""}"`,
      `"${b.transactionId || ""}"`,
      `"${b.razorpayOrderId || ""}"`,
      `"${b.clientId || ""}"`,
      `"${b.generatedReferralCode || ""}"`,
      `"${formatDate(b.validFrom)}"`,
      `"${formatDate(b.validTill)}"`,
      `"${b.status || ""}"`,
      `"${formatDateTime(b.paidAt)}"`,
      `"${formatDateTime(b.createdAt)}"`,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TimelyPlanBookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ═══ HEADER DESKTOP ═══ */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            Timely <span>Plan Bookings</span>
          </h1>
        </div>

        {/* ═══ FILTER BAR DESKTOP ═══ */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap mb-6">
          <div className="relative min-w-[130px]">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search name, email, org, txn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[240px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select value={planStatusFilter} onChange={(e) => setPlanStatusFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
            {PLAN_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
            {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-1 px-2 h-8 border border-gray-300 bg-white rounded-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">DATE:</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
            <span className="text-gray-400 text-xs">–</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
          </div>

          <button onClick={fetchBookings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Refresh">
            <FaSyncAlt className="w-3 h-3" />
          </button>

          <button onClick={downloadCSV} disabled={!filteredBookings.length}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm disabled:opacity-50">
            <FaDownload className="w-3 h-3" /> Export CSV
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FaTimes className="w-3 h-3 text-red-500" /> Clear
            </button>
          )}
        </div>

        {/* ═══ MOBILE HEADER ═══ */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">
              Timely <span className="text-indigo-600">Plan Bookings</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaCrown className="w-3 h-3 text-purple-600" />
              <span>{filteredBookings.length} bookings</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={downloadCSV} disabled={!filteredBookings.length}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50">
              <FaDownload className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <FaFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* ═══ MOBILE FILTERS ═══ */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, email, org, txn..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={planStatusFilter} onChange={(e) => setPlanStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {PLAN_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date Range (Paid / Created)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  <FaTimes className="w-4 h-4 text-red-500" /> Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* ═══ STATS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bookings</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaCrown className="text-purple-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all plan purchases</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Plans</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle className="text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle className="text-green-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-green-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">successful payments</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaRupeeSign className="text-blue-700" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">
              Base ₹{stats.totalBase.toLocaleString()} + GST ₹{stats.totalGST.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center">
              <FaSyncAlt className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading plan bookings...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <FaTimesCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <button onClick={fetchBookings}
                className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5">
                <FaSyncAlt className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center">
              <FaBoxOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Plan Bookings Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {bookings.length === 0 ? "No plan purchases yet." : "No records match your filters."}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ═══ DESKTOP TABLE ═══ */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: "center" }}>#</th>
                      <th>Customer</th>
                      <th>Organization</th>
                      <th>Plan</th>
                      <th style={{ textAlign: "center" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Payment</th>
                      <th style={{ textAlign: "center" }}>Method</th>
                      <th style={{ textAlign: "center" }}>Validity</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Paid On</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, idx) => (
                      <tr key={b._id || idx} className="hover:bg-blue-50/40">
                        <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{idx + 1}</td>

                        {/* Customer */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                              {(b.fullName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-xs truncate max-w-[150px]">
                                {b.fullName || "N/A"}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                {b.workEmail || "—"}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {b.mobileNumber || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold text-gray-800 truncate max-w-[180px]"
                            title={b.organizationName}>
                            {b.organizationName || "N/A"}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <FaBuilding className="text-[9px]" />
                            {b.industryType || "—"} {b.companySize ? `· ${b.companySize}` : ""}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                            <FaCrown className="w-2.5 h-2.5" />
                            {b.planName || "N/A"}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {b.planSnapshot?.validity} {b.planSnapshot?.validityUnit || ""}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-800">
                            ₹{(Number(b.totalAmount) || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Base ₹{b.baseAmount || 0} + GST ₹{b.gstAmount || 0}
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getPaymentStatusColors(b.paymentStatus)}`}>
                            {b.paymentStatus === "paid" ? <FaCheckCircle className="w-2.5 h-2.5" /> : <FaClock className="w-2.5 h-2.5" />}
                            {b.paymentStatus || "N/A"}
                          </span>
                        </td>

                        {/* Method */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-slate-50 text-slate-700 border border-slate-200">
                            <FaCreditCard className="w-2.5 h-2.5" />
                            {b.paymentMethod || "—"}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-[10px] font-semibold text-gray-700">
                            {formatDate(b.validFrom)}
                          </div>
                          <div className="text-[10px] text-gray-400">↓</div>
                          <div className="text-[10px] font-semibold text-gray-700">
                            {formatDate(b.validTill)}
                          </div>
                        </td>

                        {/* Plan Status */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getPlanStatusColors(b.status)}`}>
                            {b.status || "N/A"}
                          </span>
                        </td>

                        {/* Paid On */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-[10px] font-semibold text-slate-700">
                            {formatDate(b.paidAt || b.createdAt)}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {b.paidAt ? new Date(b.paidAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleView(b)}
                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                            title="View Details">
                            <FaEye className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ═══ MOBILE CARD VIEW ═══ */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <div key={b._id} className="p-4 hover:bg-gray-50/60 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {(b.fullName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {b.fullName || "N/A"}
                          </h4>
                          <span className="text-[11px] text-gray-500 truncate block">
                            {b.workEmail || "—"}
                          </span>
                          <span className="text-[11px] text-gray-400">{b.mobileNumber || "—"}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${getPlanStatusColors(b.status)}`}>
                        {b.status || "N/A"}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-700 mb-2 truncate">
                      <FaBuilding className="inline text-[9px] mr-1" />
                      {b.organizationName || "N/A"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div>
                        <span className="text-gray-400">Plan:</span>{" "}
                        <span className="font-semibold text-purple-700">{b.planName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Amount:</span>{" "}
                        <span className="font-bold text-gray-800">₹{b.totalAmount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Method:</span>{" "}
                        <span className="font-medium uppercase">{b.paymentMethod || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Valid Till:</span>{" "}
                        <span className="font-medium">{formatDate(b.validTill)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getPaymentStatusColors(b.paymentStatus)}`}>
                        <FaCheckCircle className="w-2.5 h-2.5" />
                        {b.paymentStatus || "N/A"}
                      </span>
                      <button
                        onClick={() => handleView(b)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5">
                        <FaEye className="text-[10px]" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-1 pt-3 text-xs text-gray-500 font-medium border-t border-gray-100 mt-2">
                <span>
                  Showing <span className="text-gray-900 font-bold">{filteredBookings.length}</span> of{" "}
                  <span className="text-gray-900 font-bold">{bookings.length}</span> bookings
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <FaCrown className="text-[10px]" /> Timely Plans
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ═══ DETAIL MODAL ═══ */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Plan Booking Details</h3>
                  <p className="text-xs text-gray-600">
                    {selectedBooking.fullName} · {selectedBooking.clientId || "—"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowDetailModal(false); setSelectedBooking(null); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/70">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Row */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${getPlanStatusColors(selectedBooking.status)}`}>
                  Plan: {selectedBooking.status || "N/A"}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${getPaymentStatusColors(selectedBooking.paymentStatus)}`}>
                  Payment: {selectedBooking.paymentStatus || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  <FaCrown className="w-3 h-3" />
                  {selectedBooking.planName || "N/A"}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaUsers className="text-blue-600" /> Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <InfoRow icon={<FaUsers />} label="Full Name" value={selectedBooking.fullName} />
                  <InfoRow icon={<FaEnvelope />} label="Work Email" value={selectedBooking.workEmail} />
                  <InfoRow icon={<FaPhone />} label="Mobile" value={selectedBooking.mobileNumber} />
                  <InfoRow icon={<FaIdCard />} label="PAN Number" value={selectedBooking.panNumber} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={selectedBooking.address} full />
                </div>
              </div>

              {/* Organization */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaBuilding className="text-indigo-600" /> Organization
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                  <InfoRow icon={<FaBuilding />} label="Organization" value={selectedBooking.organizationName} full />
                  <InfoRow icon={<FaUsers />} label="Company Size" value={selectedBooking.companySize} />
                  <InfoRow icon={<FaBoxOpen />} label="Industry" value={selectedBooking.industryType} />
                </div>
              </div>

              {/* Plan */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCrown className="text-purple-600" /> Plan Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                  <InfoRow icon={<FaCrown />} label="Plan Name" value={selectedBooking.planName} />
                  <InfoRow icon={<FaClock />} label="Validity" value={`${selectedBooking.planSnapshot?.validity || "—"} ${selectedBooking.planSnapshot?.validityUnit || ""}`} />
                  <InfoRow icon={<FaCalendarAlt />} label="Valid From" value={formatDate(selectedBooking.validFrom)} />
                  <InfoRow icon={<FaCalendarAlt />} label="Valid Till" value={formatDate(selectedBooking.validTill)} />
                </div>

                {Array.isArray(selectedBooking.accessibleProducts) && selectedBooking.accessibleProducts.length > 0 && (
                  <div className="mt-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700 uppercase mb-2">
                      Accessible Products ({selectedBooking.accessibleProducts.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBooking.accessibleProducts.map((p, i) => (
                        <span key={p._id || i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-purple-700 border border-purple-200">
                          <FaBoxOpen className="w-2.5 h-2.5" /> {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCreditCard className="text-emerald-600" /> Payment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <InfoRow icon={<FaRupeeSign />} label="Base Amount" value={`₹${selectedBooking.baseAmount || 0}`} />
                  <InfoRow icon={<FaPercentage />} label="GST Amount" value={`₹${selectedBooking.gstAmount || 0}`} />
                  <InfoRow icon={<FaRupeeSign />} label="Total Amount" value={`₹${selectedBooking.totalAmount || 0}`} valueClass="font-extrabold text-emerald-700" />
                  <InfoRow icon={<FaCreditCard />} label="Payment Method" value={selectedBooking.paymentMethod} />
                  <InfoRow icon={<FaCalendarAlt />} label="Paid At" value={formatDateTime(selectedBooking.paidAt)} />
                  <InfoRow icon={<FaCalendarAlt />} label="Created At" value={formatDateTime(selectedBooking.createdAt)} />
                  <InfoRow
                    icon={<FaIdCard />}
                    label="Transaction ID"
                    value={selectedBooking.transactionId}
                    copyable
                    onCopy={() => copyToClipboard(selectedBooking.transactionId)}
                    full
                  />
                  <InfoRow
                    icon={<FaUniversity />}
                    label="Razorpay Order ID"
                    value={selectedBooking.razorpayOrderId}
                    copyable
                    onCopy={() => copyToClipboard(selectedBooking.razorpayOrderId)}
                    full
                  />
                </div>
              </div>

              {/* Referral & Client */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaGift className="text-amber-600" /> Referral & Client
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <InfoRow
                    icon={<FaGift />}
                    label="Generated Referral Code"
                    value={selectedBooking.generatedReferralCode}
                    copyable
                    onCopy={() => copyToClipboard(selectedBooking.generatedReferralCode)}
                  />
                  <InfoRow
                    icon={<FaGift />}
                    label="Referral Code Used"
                    value={selectedBooking.referralCode || "—"}
                  />
                  <InfoRow
                    icon={<FaIdCard />}
                    label="Client ID"
                    value={selectedBooking.clientId}
                    copyable
                    onCopy={() => copyToClipboard(selectedBooking.clientId)}
                  />
                  <InfoRow
                    icon={<FaIdCard />}
                    label="Client Ref"
                    value={selectedBooking.client}
                    copyable
                    onCopy={() => copyToClipboard(selectedBooking.client)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end gap-2">
              <button onClick={() => { setShowDetailModal(false); setSelectedBooking(null); }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Info row sub-component ──
const InfoRow = ({ icon, label, value, full, copyable, onCopy, valueClass = "" }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
      <span className="text-gray-400">{icon}</span> {label}
    </div>
    <div className="flex items-center gap-2 min-w-0">
      <span className={`text-xs text-gray-800 truncate ${valueClass}`}>
        {value || "—"}
      </span>
      {copyable && value && (
        <button onClick={onCopy}
          className="text-gray-400 hover:text-blue-600 flex-shrink-0"
          title="Copy">
          <FaCopy className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

export default TimelyPlanBookings;