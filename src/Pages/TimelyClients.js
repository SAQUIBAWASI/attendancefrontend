// TimelyClients.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaSearch, FaFilter, FaTimes, FaEye, FaCheckCircle, FaClock,
  FaTimesCircle, FaDownload, FaCrown, FaBuilding, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaRupeeSign,
  FaCreditCard, FaUniversity, FaPercentage, FaGift, FaUsers,
  FaBoxOpen, FaSyncAlt, FaCopy, FaUserPlus, FaUserCheck, FaUserTimes,
  FaKey, FaGlobe, FaBriefcase, FaLayerGroup, FaEdit, FaTrashAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_EDIT_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const VERIFIED_OPTIONS = [
  { value: "All", label: "All Verification" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
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

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch { return ""; }
};

const getStatusColors = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "inactive") return "bg-gray-100 text-gray-600 border-gray-300";
  if (s === "expired") return "bg-red-50 text-red-700 border-red-200";
  if (s === "cancelled") return "bg-gray-100 text-gray-600 border-gray-300";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const TimelyClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // View Modal
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/timely-clients/getallclients`);
      if (res.data?.success) {
        setClients(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error("Error fetching timely clients:", err);
      setError(err.response?.data?.message || "Failed to load clients");
      setClients([]);
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

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (statusFilter !== "All" && (c.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (verifiedFilter !== "All") {
        const isVerified = c.isEmailVerified === true;
        if (verifiedFilter === "verified" && !isVerified) return false;
        if (verifiedFilter === "unverified" && isVerified) return false;
      }

      if (!isDateInRange(c.createdAt, fromDate, toDate)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m =
          (c.name || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          (c.organisationName || "").toLowerCase().includes(q) ||
          (c.planName || "").toLowerCase().includes(q) ||
          (c.clientId || "").toLowerCase().includes(q) ||
          (c.referralCode || "").toLowerCase().includes(q) ||
          (c.location || "").toLowerCase().includes(q) ||
          (c.industryType || "").toLowerCase().includes(q);
        if (!m) return false;
      }
      return true;
    });
  }, [clients, statusFilter, verifiedFilter, fromDate, toDate, searchQuery]);

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => (c.status || "").toLowerCase() === "active").length;
    const inactive = clients.filter((c) => (c.status || "").toLowerCase() === "inactive").length;
    const verified = clients.filter((c) => c.isEmailVerified === true).length;
    const unverified = total - verified;
    const totalProducts = clients.reduce(
      (s, c) => s + (Array.isArray(c.accessibleProducts) ? c.accessibleProducts.length : 0),
      0
    );
    return { total, active, inactive, verified, unverified, totalProducts };
  }, [clients]);

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" ||
    verifiedFilter !== "All" || fromDate !== "" || toDate !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setVerifiedFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      organisationName: client.organisationName || "",
      location: client.location || "",
      address: client.address || "",
      industryType: client.industryType || "",
      companySize: client.companySize || "",
      panNumber: client.panNumber || "",
      clientId: client.clientId || "",
      referralCode: client.referralCode || "",
      planName: client.planName || "",
      validFrom: formatDateForInput(client.validFrom),
      validTill: formatDateForInput(client.validTill),
      status: client.status || "active",
      isEmailVerified: client.isEmailVerified === true,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!formData.name.trim()) { showToast("Name is required", "error"); return; }
    if (!formData.email.trim()) { showToast("Email is required", "error"); return; }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        organisationName: formData.organisationName.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        industryType: formData.industryType.trim(),
        companySize: formData.companySize,
        panNumber: formData.panNumber.trim(),
        clientId: formData.clientId.trim(),
        referralCode: formData.referralCode.trim(),
        planName: formData.planName.trim(),
        validFrom: formData.validFrom || null,
        validTill: formData.validTill || null,
        status: formData.status,
        isEmailVerified: formData.isEmailVerified,
      };

      const res = await axios.put(
        `${API_BASE_URL}/timely-clients/updateclient/${editingClient._id}`,
        payload
      );

      if (res?.data?.success) {
        showToast(`✅ Client "${formData.name}" updated successfully!`, "success");
        setShowEditModal(false);
        setEditingClient(null);
        setFormData({});
        await fetchClients();
      } else {
        showToast(res.data?.message || "Failed to update client", "error");
      }
    } catch (err) {
      console.error("Update client error:", err);
      showToast(err.response?.data?.message || "Failed to update client", "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (client) => {
    setDeletingClient(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/timely-clients/deleteclient/${deletingClient._id}`
      );

      if (res?.data?.success || res?.status === 200) {
        showToast(`✅ Client "${deletingClient.name}" deleted successfully!`, "success");
        setShowDeleteModal(false);
        setDeletingClient(null);
        await fetchClients();
      } else {
        showToast(res.data?.message || "Failed to delete client", "error");
      }
    } catch (err) {
      console.error("Delete client error:", err);
      showToast(err.response?.data?.message || "Failed to delete client", "error");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "info");
  };

  const downloadCSV = () => {
    if (!filteredClients.length) return;
    const headers = [
      "#", "Name", "Email", "Phone", "Organisation", "Location", "Address",
      "Industry", "Company Size", "PAN", "Client ID", "Referral Code",
      "Plan Name", "Accessible Products", "Valid From", "Valid Till",
      "Email Verified", "Status", "Created At"
    ];
    const rows = filteredClients.map((c, i) => [
      i + 1,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${(c.organisationName || "").replace(/"/g, '""')}"`,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
      `"${c.industryType || ""}"`,
      `"${c.companySize || ""}"`,
      `"${c.panNumber || ""}"`,
      `"${c.clientId || ""}"`,
      `"${c.referralCode || ""}"`,
      `"${c.planName || ""}"`,
      `"${(c.accessibleProducts || []).map((p) => p.name).join("; ")}"`,
      `"${formatDate(c.validFrom)}"`,
      `"${formatDate(c.validTill)}"`,
      `"${c.isEmailVerified ? "Yes" : "No"}"`,
      `"${c.status || ""}"`,
      `"${formatDateTime(c.createdAt)}"`,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TimelyClients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredClients.length} clients to CSV!`, "success");
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FaTimesCircle className="w-5 h-5" /> : <FaCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* ═══ HEADER DESKTOP ═══ */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            Timely <span>Clients</span>
          </h1>
        </div>

        {/* ═══ FILTER BAR DESKTOP ═══ */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap mb-6">
          <div className="relative min-w-[130px]">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search name, email, org, client ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[260px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
            {VERIFIED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-1 px-2 h-8 border border-gray-300 bg-white rounded-lg">
            <span className="text-[9px] font-bold text-gray-500 uppercase whitespace-nowrap">CREATED:</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
            <span className="text-gray-400 text-xs">–</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-[105px] h-6 px-1 text-[11px] border-0 bg-transparent text-gray-900 rounded focus:outline-none" />
          </div>

          <button onClick={fetchClients}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Refresh">
            <FaSyncAlt className="w-3 h-3" />
          </button>

          <button onClick={downloadCSV} disabled={!filteredClients.length}
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
              Timely <span className="text-indigo-600">Clients</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaUserCheck className="w-3 h-3 text-purple-600" />
              <span>{filteredClients.length} clients</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={downloadCSV} disabled={!filteredClients.length}
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
                    placeholder="Name, email, org, client ID..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {VERIFIED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Created Date</label>
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
              <span className="emp-dash__stat-label">Total Clients</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaUsers className="text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all clients</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaUserCheck className="text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Verified</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle className="text-green-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-green-600">{stats.verified}</div>
            <div className="emp-dash__stat-meta">{stats.unverified} unverified</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Accessible Products</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaLayerGroup className="text-purple-700" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-700">{stats.totalProducts}</div>
            <div className="emp-dash__stat-meta">across all clients</div>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center">
              <FaSyncAlt className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <FaTimesCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <button onClick={fetchClients}
                className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5">
                <FaSyncAlt className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-12 text-center">
              <FaBoxOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Clients Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {clients.length === 0 ? "No clients yet." : "No records match your filters."}
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
                      <th>Client</th>
                      <th>Organization</th>
                      <th>Plan</th>
                      <th style={{ textAlign: "center" }}>Client ID</th>
                      <th style={{ textAlign: "center" }}>Products</th>
                      <th style={{ textAlign: "center" }}>Validity</th>
                      <th style={{ textAlign: "center" }}>Verified</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Created</th>
                      <th style={{ textAlign: "right", minWidth: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c, idx) => (
                      <tr key={c._id || idx} className="hover:bg-blue-50/40">
                        <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{idx + 1}</td>

                        {/* Client */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                              {(c.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-xs truncate max-w-[150px]">
                                {c.name || "N/A"}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                {c.email || "—"}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {c.phone || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold text-gray-800 truncate max-w-[180px]"
                            title={c.organisationName}>
                            {c.organisationName || "N/A"}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <FaBuilding className="text-[9px]" />
                            {c.industryType || "—"} {c.companySize ? `· ${c.companySize}` : ""}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="text-[9px]" />
                            {c.location || "—"}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                            <FaCrown className="w-2.5 h-2.5" />
                            {c.planName || "N/A"}
                          </span>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {c.referralCode ? `Code: ${c.referralCode}` : "—"}
                          </div>
                        </td>

                        {/* Client ID */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                            <FaIdCard className="w-2.5 h-2.5" />
                            {c.clientId || "—"}
                          </span>
                        </td>

                        {/* Products */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <FaLayerGroup className="w-2.5 h-2.5" />
                            {(c.accessibleProducts || []).length}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-[10px] font-semibold text-gray-700">
                            {formatDate(c.validFrom)}
                          </div>
                          <div className="text-[10px] text-gray-400">↓</div>
                          <div className="text-[10px] font-semibold text-gray-700">
                            {formatDate(c.validTill)}
                          </div>
                        </td>

                        {/* Verified */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {c.isEmailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <FaCheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border bg-amber-50 text-amber-700 border-amber-200">
                              <FaClock className="w-2.5 h-2.5" /> Unverified
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColors(c.status)}`}>
                            {c.status || "N/A"}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-[10px] font-semibold text-slate-700">
                            {formatDate(c.createdAt)}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                          </div>
                        </td>

                        {/* ✅ DIRECT ACTION ICONS — No 3-dot dropdown */}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleView(c)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                              title="View Details">
                              <FaEye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors"
                              title="Edit Client">
                              <FaEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(c)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                              title="Delete Client">
                              <FaTrashAlt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ═══ MOBILE CARD VIEW ═══ */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredClients.map((c) => (
                  <div key={c._id} className="p-4 hover:bg-gray-50/60 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {(c.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {c.name || "N/A"}
                          </h4>
                          <span className="text-[11px] text-gray-500 truncate block">
                            {c.email || "—"}
                          </span>
                          <span className="text-[11px] text-gray-400">{c.phone || "—"}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${getStatusColors(c.status)}`}>
                        {c.status || "N/A"}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-700 mb-2 truncate">
                      <FaBuilding className="inline text-[9px] mr-1" />
                      {c.organisationName || "N/A"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div>
                        <span className="text-gray-400">Plan:</span>{" "}
                        <span className="font-semibold text-purple-700">{c.planName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Client ID:</span>{" "}
                        <span className="font-bold text-gray-800">{c.clientId || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Location:</span>{" "}
                        <span className="font-medium">{c.location || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Products:</span>{" "}
                        <span className="font-medium">{(c.accessibleProducts || []).length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Valid Till:</span>{" "}
                        <span className="font-medium">{formatDate(c.validTill)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${c.isEmailVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {c.isEmailVerified ? <FaCheckCircle className="w-2.5 h-2.5" /> : <FaClock className="w-2.5 h-2.5" />}
                        {c.isEmailVerified ? "Verified" : "Unverified"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleView(c)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                          title="View">
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors"
                          title="Edit">
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                          title="Delete">
                          <FaTrashAlt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-1 pt-3 text-xs text-gray-500 font-medium border-t border-gray-100 mt-2">
                <span>
                  Showing <span className="text-gray-900 font-bold">{filteredClients.length}</span> of{" "}
                  <span className="text-gray-900 font-bold">{clients.length}</span> clients
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <FaCrown className="text-[10px]" /> Timely Clients
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ═══ VIEW DETAIL MODAL ═══ */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                  <FaUsers />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Client Details</h3>
                  <p className="text-xs text-gray-600">
                    {selectedClient.name} · {selectedClient.clientId || "—"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowDetailModal(false); setSelectedClient(null); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/70">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${getStatusColors(selectedClient.status)}`}>
                  Status: {selectedClient.status || "N/A"}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${selectedClient.isEmailVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {selectedClient.isEmailVerified ? <FaCheckCircle className="w-3 h-3" /> : <FaClock className="w-3 h-3" />}
                  {selectedClient.isEmailVerified ? "Verified" : "Unverified"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  <FaCrown className="w-3 h-3" />
                  {selectedClient.planName || "N/A"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaUsers className="text-blue-600" /> Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <InfoRow icon={<FaUsers />} label="Full Name" value={selectedClient.name} />
                  <InfoRow icon={<FaEnvelope />} label="Email" value={selectedClient.email} />
                  <InfoRow icon={<FaPhone />} label="Phone" value={selectedClient.phone} />
                  <InfoRow icon={<FaIdCard />} label="PAN Number" value={selectedClient.panNumber} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Location" value={selectedClient.location} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={selectedClient.address} full />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaBuilding className="text-indigo-600" /> Organization
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                  <InfoRow icon={<FaBuilding />} label="Organisation" value={selectedClient.organisationName} full />
                  <InfoRow icon={<FaUsers />} label="Company Size" value={selectedClient.companySize} />
                  <InfoRow icon={<FaBriefcase />} label="Industry" value={selectedClient.industryType} />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCrown className="text-purple-600" /> Plan Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                  <InfoRow icon={<FaCrown />} label="Plan Name" value={selectedClient.planName} />
                  <InfoRow icon={<FaLayerGroup />} label="Products Count" value={String((selectedClient.accessibleProducts || []).length)} />
                  <InfoRow icon={<FaCalendarAlt />} label="Valid From" value={formatDate(selectedClient.validFrom)} />
                  <InfoRow icon={<FaCalendarAlt />} label="Valid Till" value={formatDate(selectedClient.validTill)} />
                </div>

                {Array.isArray(selectedClient.accessibleProducts) && selectedClient.accessibleProducts.length > 0 && (
                  <div className="mt-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-700 uppercase mb-2">
                      Accessible Products ({selectedClient.accessibleProducts.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClient.accessibleProducts.map((p, i) => (
                        <span key={p._id || i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-purple-700 border border-purple-200">
                          <FaBoxOpen className="w-2.5 h-2.5" /> {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaIdCard className="text-emerald-600" /> Credentials & Referral
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <InfoRow icon={<FaIdCard />} label="Client ID" value={selectedClient.clientId}
                    copyable onCopy={() => copyToClipboard(selectedClient.clientId)} />
                  <InfoRow icon={<FaGift />} label="Referral Code" value={selectedClient.referralCode}
                    copyable onCopy={() => copyToClipboard(selectedClient.referralCode)} />
                  <InfoRow icon={<FaLayerGroup />} label="Plan ID" value={selectedClient.planId}
                    copyable onCopy={() => copyToClipboard(selectedClient.planId)} />
                  <InfoRow icon={<FaCreditCard />} label="Booking ID" value={selectedClient.booking}
                    copyable onCopy={() => copyToClipboard(selectedClient.booking)} />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaClock className="text-amber-600" /> Activity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <InfoRow icon={<FaCalendarAlt />} label="Created At" value={formatDateTime(selectedClient.createdAt)} />
                  <InfoRow icon={<FaCalendarAlt />} label="Updated At" value={formatDateTime(selectedClient.updatedAt)} />
                  <InfoRow icon={<FaGlobe />} label="Last Login" value={formatDateTime(selectedClient.lastLogin)} full />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between gap-2">
              <button
                onClick={() => { setShowDetailModal(false); openEditModal(selectedClient); }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5">
                <FaEdit className="w-3 h-3" /> Edit Client
              </button>
              <button onClick={() => { setShowDetailModal(false); setSelectedClient(null); }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                  <FaEdit />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Edit Client</h3>
                  <p className="text-xs text-gray-600">
                    {editingClient.name} · {editingClient.clientId || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingClient(null); setFormData({}); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/70">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaUsers className="text-blue-600" /> Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Full Name *</label>
                    <input type="text" name="name" value={formData.name || ""} onChange={handleEditInputChange}
                      placeholder="Enter full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Email *</label>
                    <input type="email" name="email" value={formData.email || ""} onChange={handleEditInputChange}
                      placeholder="Enter email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Phone</label>
                    <input type="tel" name="phone" value={formData.phone || ""} onChange={handleEditInputChange}
                      placeholder="Enter phone"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">PAN Number</label>
                    <input type="text" name="panNumber" value={formData.panNumber || ""} onChange={handleEditInputChange}
                      placeholder="Enter PAN"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Location</label>
                    <input type="text" name="location" value={formData.location || ""} onChange={handleEditInputChange}
                      placeholder="City, State"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Address</label>
                    <textarea name="address" value={formData.address || ""} onChange={handleEditInputChange}
                      placeholder="Full address" rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaBuilding className="text-indigo-600" /> Organization
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Organisation</label>
                    <input type="text" name="organisationName" value={formData.organisationName || ""} onChange={handleEditInputChange}
                      placeholder="Organisation name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Company Size</label>
                    <input type="text" name="companySize" value={formData.companySize || ""} onChange={handleEditInputChange}
                      placeholder="e.g. 11-50"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Industry Type</label>
                    <input type="text" name="industryType" value={formData.industryType || ""} onChange={handleEditInputChange}
                      placeholder="e.g. IT"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCrown className="text-purple-600" /> Plan Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Plan Name</label>
                    <input type="text" name="planName" value={formData.planName || ""} onChange={handleEditInputChange}
                      placeholder="Plan name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Status</label>
                    <select name="status" value={formData.status || "active"} onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                      {STATUS_EDIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Valid From</label>
                    <input type="date" name="validFrom" value={formData.validFrom || ""} onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Valid Till</label>
                    <input type="date" name="validTill" value={formData.validTill || ""} onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="isEmailVerified" checked={formData.isEmailVerified || false} onChange={handleEditInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-xs font-bold text-gray-700">Email Verified</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaIdCard className="text-emerald-600" /> Credentials & Referral
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Client ID</label>
                    <input type="text" name="clientId" value={formData.clientId || ""} onChange={handleEditInputChange}
                      placeholder="Client ID"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Referral Code</label>
                    <input type="text" name="referralCode" value={formData.referralCode || ""} onChange={handleEditInputChange}
                      placeholder="Referral code"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button"
                  onClick={() => { setShowEditModal(false); setEditingClient(null); setFormData({}); }}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                  {saving ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaCheckCircle className="w-3.5 h-3.5" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {showDeleteModal && deletingClient && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete Client?</h3>
                <p className="text-xs text-gray-600 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {(deletingClient.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{deletingClient.name || "N/A"}</div>
                    <div className="text-[11px] text-gray-500 truncate">{deletingClient.email || "—"}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Client ID</span>
                    <span className="font-bold text-gray-800">{deletingClient.clientId || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-semibold text-purple-700">{deletingClient.planName || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organisation</span>
                    <span className="font-medium text-gray-800 truncate max-w-[180px]">{deletingClient.organisationName || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[11px] text-red-800 leading-relaxed">
                  <b>⚠️ Warning:</b> Deleting this client will <b>permanently remove</b> all their data from the system. This action <b>cannot be reversed</b>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingClient(null); }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50">
                {deleting ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaTrashAlt className="w-3.5 h-3.5" />}
                {deleting ? "Deleting..." : "Yes, Delete"}
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

export default TimelyClients;