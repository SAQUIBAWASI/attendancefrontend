// TimelyPlans.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaSearch, FaFilter, FaTimes, FaCheckCircle, FaClock, FaTimesCircle,
  FaDownload, FaCrown, FaSyncAlt, FaPlus, FaEdit, FaTrashAlt, FaEye,
  FaExclamationTriangle, FaBoxOpen, FaToggleOn, FaToggleOff,
  FaLayerGroup, FaRupeeSign, FaPercentage, FaCalendarAlt, FaList,
  FaMinusCircle, FaPlusCircle, FaSave, FaCheck
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const VALIDITY_UNIT_OPTIONS = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

const STATUS_EDIT_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
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

const getStatusColors = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "inactive") return "bg-gray-100 text-gray-600 border-gray-300";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const EMPTY_PLAN = {
  planName: "",
  description: "",
  products: [],
  price: "",
  discount: "",
  validity: "",
  validityUnit: "months",
  status: "active",
};

const TimelyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // View Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPlan, setViewingPlan] = useState(null);

  // Add/Edit Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_PLAN });
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle loading
  const [togglingId, setTogglingId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/timely-plans/getalltimelyplans`);
      if (res.data?.success) {
        setPlans(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setPlans(res.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.message || "Failed to load plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── FILTERS ───
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter !== "All" && (p.status || "").toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const m =
          (p.planName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.products || []).some((prod) => (prod.productName || "").toLowerCase().includes(q));
        if (!m) return false;
      }
      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  // ─── STATS ───
  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p) => (p.status || "").toLowerCase() === "active").length;
    const inactive = total - active;
    const totalProducts = plans.reduce((s, p) => s + (Array.isArray(p.products) ? p.products.length : 0), 0);
    return { total, active, inactive, totalProducts };
  }, [plans]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  // ─── VIEW MODAL ───
  const openViewModal = (plan) => {
    setViewingPlan(plan);
    setShowViewModal(true);
  };

  // ─── ADD / EDIT MODAL ───
  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({ ...EMPTY_PLAN });
    setShowFormModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName || "",
      description: plan.description || "",
      products: Array.isArray(plan.products)
        ? plan.products.map((p) => ({
            productName: p.productName || "",
            features: Array.isArray(p.features) ? [...p.features] : [],
          }))
        : [],
      price: plan.price ?? "",
      discount: plan.discount ?? "",
      validity: plan.validity ?? "",
      validityUnit: plan.validityUnit || "months",
      status: plan.status || "active",
    });
    setShowFormModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Product row handlers ───
  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { productName: "", features: [""] }],
    }));
  };

  const handleRemoveProduct = (pIdx) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== pIdx),
    }));
  };

  const handleProductNameChange = (pIdx, value) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === pIdx ? { ...p, productName: value } : p)),
    }));
  };

  const handleAddFeature = (pIdx) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === pIdx ? { ...p, features: [...p.features, ""] } : p
      ),
    }));
  };

  const handleRemoveFeature = (pIdx, fIdx) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === pIdx ? { ...p, features: p.features.filter((_, j) => j !== fIdx) } : p
      ),
    }));
  };

  const handleFeatureChange = (pIdx, fIdx, value) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === pIdx
          ? { ...p, features: p.features.map((f, j) => (j === fIdx ? value : f)) }
          : p
      ),
    }));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();

    if (!formData.planName.trim()) { showToast("Plan name is required", "error"); return; }
    if (formData.price === "" || isNaN(Number(formData.price))) { showToast("Valid price is required", "error"); return; }
    if (formData.validity === "" || isNaN(Number(formData.validity))) { showToast("Valid validity is required", "error"); return; }

    const sanitizedProducts = formData.products
      .filter((p) => p.productName && p.productName.trim())
      .map((p) => ({
        productName: p.productName.trim(),
        features: (p.features || []).filter((f) => f && f.trim()).map((f) => f.trim()),
      }));

    const payload = {
      planName: formData.planName.trim(),
      description: (formData.description || "").trim(),
      products: sanitizedProducts,
      price: Number(formData.price),
      discount: Number(formData.discount) || 0,
      validity: Number(formData.validity),
      validityUnit: formData.validityUnit || "months",
      status: formData.status || "active",
    };

    setSaving(true);
    try {
      let res;
      if (editingPlan) {
        res = await axios.put(`${API_BASE_URL}/timely-plans/updatetimelyplan/${editingPlan._id}`, payload);
      } else {
        res = await axios.post(`${API_BASE_URL}/timely-plans/addtimelyplan`, payload);
      }

      if (res?.data?.success) {
        showToast(
          editingPlan
            ? `✅ Plan "${payload.planName}" updated successfully!`
            : `✅ Plan "${payload.planName}" created successfully!`,
          "success"
        );
        setShowFormModal(false);
        setEditingPlan(null);
        setFormData({ ...EMPTY_PLAN });
        await fetchPlans();
      } else {
        showToast(res.data?.message || "Failed to save plan", "error");
      }
    } catch (err) {
      console.error("Save plan error:", err);
      showToast(err.response?.data?.message || "Failed to save plan", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── DELETE ───
  const openDeleteModal = (plan) => {
    setDeletingPlan(plan);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/timely-plans/deletetimelyplan/${deletingPlan._id}`);
      if (res?.data?.success || res?.status === 200) {
        showToast(`✅ Plan "${deletingPlan.planName}" deleted successfully!`, "success");
        setShowDeleteModal(false);
        setDeletingPlan(null);
        await fetchPlans();
      } else {
        showToast(res.data?.message || "Failed to delete plan", "error");
      }
    } catch (err) {
      console.error("Delete plan error:", err);
      showToast(err.response?.data?.message || "Failed to delete plan", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─── TOGGLE STATUS ───
  const handleToggleStatus = async (plan) => {
    if (!plan) return;
    setTogglingId(plan._id);
    try {
      const res = await axios.put(`${API_BASE_URL}/timely-plans/toggle-status/${plan._id}`);
      if (res?.data?.success) {
        const newStatus = res.data?.data?.status || (plan.status === "active" ? "inactive" : "active");
        showToast(`✅ Plan marked as ${newStatus}!`, "success");
        await fetchPlans();
      } else {
        showToast(res.data?.message || "Failed to toggle status", "error");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      showToast(err.response?.data?.message || "Failed to toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // ─── CSV ───
  const downloadCSV = () => {
    if (!filteredPlans.length) return;
    const headers = [
      "#", "Plan Name", "Description", "Price", "Discount", "Validity",
      "Validity Unit", "Products Count", "Products", "Status", "Created At"
    ];
    const rows = filteredPlans.map((p, i) => [
      i + 1,
      `"${(p.planName || "").replace(/"/g, '""')}"`,
      `"${(p.description || "").replace(/"/g, '""')}"`,
      p.price || 0,
      p.discount || 0,
      p.validity || 0,
      `"${p.validityUnit || ""}"`,
      (p.products || []).length,
      `"${(p.products || []).map((pr) => pr.productName).join("; ")}"`,
      `"${p.status || ""}"`,
      `"${formatDate(p.createdAt)}"`,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TimelyPlans_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredPlans.length} plans to CSV!`, "success");
  };

  const fmt = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

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
            Timely <span>Plans</span>
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
              <FaPlus className="w-3 h-3" /> Add Plan
            </button>
          </div>
        </div>

        {/* ═══ FILTER BAR DESKTOP ═══ */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap mb-6">
          <div className="relative min-w-[130px]">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search plan, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[240px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button onClick={fetchPlans}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
            title="Refresh">
            <FaSyncAlt className="w-3 h-3" />
          </button>

          <button onClick={downloadCSV} disabled={!filteredPlans.length}
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
              Timely <span className="text-indigo-600">Plans</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaCrown className="w-3 h-3 text-purple-600" />
              <span>{filteredPlans.length} plans</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={openAddModal}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg">
              <FaPlus className="w-3 h-3" /> Add
            </button>
            <button onClick={downloadCSV} disabled={!filteredPlans.length}
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
                    placeholder="Search plan, product..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
              <span className="emp-dash__stat-label">Total Plans</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaCrown className="text-purple-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all plans</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle className="text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Inactive</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaTimesCircle className="text-gray-500" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-gray-500">{stats.inactive}</div>
            <div className="emp-dash__stat-meta">disabled plans</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Products</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaLayerGroup className="text-blue-700" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">{stats.totalProducts}</div>
            <div className="emp-dash__stat-meta">across all plans</div>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center">
              <FaSyncAlt className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <FaTimesCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <button onClick={fetchPlans}
                className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5">
                <FaSyncAlt className="w-3 h-3" /> Retry
              </button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-12 text-center">
              <FaBoxOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Plans Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {plans.length === 0 ? "Create your first plan to get started." : "No records match your filters."}
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Clear Filters
                </button>
              ) : (
                <button onClick={openAddModal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg inline-flex items-center gap-1.5">
                  <FaPlus className="w-3 h-3" /> Add Plan
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
                      <th>Plan</th>
                      <th>Description</th>
                      <th style={{ textAlign: "center" }}>Products</th>
                      <th style={{ textAlign: "center" }}>Pricing</th>
                      <th style={{ textAlign: "center" }}>Validity</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Created</th>
                      <th style={{ textAlign: "right", minWidth: 200 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((p, idx) => (
                      <tr key={p._id || idx} className="hover:bg-blue-50/40">
                        <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{idx + 1}</td>

                        {/* Plan */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                              <FaCrown className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-xs truncate max-w-[180px]">
                                {p.planName || "N/A"}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                ID: {String(p._id || "").slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-3 py-3">
                          <div className="text-[11px] text-gray-600 max-w-[280px] line-clamp-2 leading-snug"
                            title={p.description}>
                            {p.description || "—"}
                          </div>
                        </td>

                        {/* Products */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <FaLayerGroup className="w-2.5 h-2.5" />
                            {(p.products || []).length}
                          </span>
                          {(p.products || []).length > 0 && (
                            <div className="text-[9px] text-gray-400 mt-1 max-w-[160px] truncate mx-auto"
                              title={(p.products || []).map((pr) => pr.productName).join(", ")}>
                              {(p.products || []).map((pr) => pr.productName).join(", ")}
                            </div>
                          )}
                        </td>

                        {/* Pricing */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-xs font-bold text-emerald-700">{fmt(p.price)}</div>
                          {Number(p.discount) > 0 && (
                            <div className="text-[10px] text-red-600 font-semibold">
                              − {fmt(p.discount)} off
                            </div>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                            <FaCalendarAlt className="w-2.5 h-2.5" />
                            {p.validity} {p.validityUnit || ""}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColors(p.status)}`}>
                            {p.status || "N/A"}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="text-[10px] font-semibold text-slate-700">
                            {formatDate(p.createdAt)}
                          </div>
                        </td>

                        {/* ✅ ACTIONS — View + Toggle + Edit + Delete */}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openViewModal(p)}
                              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors"
                              title="View Plan Details">
                              <FaEye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(p)}
                              disabled={togglingId === p._id}
                              className={`p-2 rounded-lg border transition-colors disabled:opacity-50 ${
                                (p.status || "").toLowerCase() === "active"
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
                                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-300"
                              }`}
                              title={p.status === "active" ? "Deactivate Plan" : "Activate Plan"}>
                              {togglingId === p._id
                                ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                                : (p.status || "").toLowerCase() === "active"
                                  ? <FaToggleOn className="w-4 h-4" />
                                  : <FaToggleOff className="w-4 h-4" />
                              }
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                              title="Edit Plan">
                              <FaEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(p)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                              title="Delete Plan">
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
                {filteredPlans.map((p) => (
                  <div key={p._id} className="p-4 hover:bg-gray-50/60 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                          <FaCrown className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {p.planName || "N/A"}
                          </h4>
                          <span className="text-[10px] text-gray-400 block">
                            ID: {String(p._id || "").slice(-8)}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${getStatusColors(p.status)}`}>
                        {p.status || "N/A"}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 mb-3 line-clamp-2">
                      {p.description || "—"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div>
                        <span className="text-gray-400">Price:</span>{" "}
                        <span className="font-bold text-emerald-700">{fmt(p.price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Discount:</span>{" "}
                        <span className="font-medium text-red-600">{fmt(p.discount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Validity:</span>{" "}
                        <span className="font-medium">{p.validity} {p.validityUnit || ""}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Products:</span>{" "}
                        <span className="font-medium">{(p.products || []).length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={togglingId === p._id}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          (p.status || "").toLowerCase() === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        } disabled:opacity-50`}>
                        {togglingId === p._id
                          ? <FiRefreshCw className="w-2.5 h-2.5 animate-spin" />
                          : (p.status || "").toLowerCase() === "active"
                            ? <FaToggleOn className="w-3 h-3" />
                            : <FaToggleOff className="w-3 h-3" />
                        }
                        {p.status || "N/A"}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openViewModal(p)}
                          className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors"
                          title="View">
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                          title="Edit">
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
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
                  Showing <span className="text-gray-900 font-bold">{filteredPlans.length}</span> of{" "}
                  <span className="text-gray-900 font-bold">{plans.length}</span> plans
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <FaCrown className="text-[10px]" /> Timely Plans
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ═══ VIEW PLAN DETAILS MODAL ═══ */}
      {showViewModal && viewingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Plan Details</h3>
                  <p className="text-xs text-gray-600">
                    {viewingPlan.planName} · ID: {String(viewingPlan._id || "").slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setViewingPlan(null); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/70">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Status Row */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${getStatusColors(viewingPlan.status)}`}>
                  Status: {viewingPlan.status || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FaRupeeSign className="w-3 h-3" />
                  {fmt(viewingPlan.price)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <FaLayerGroup className="w-3 h-3" />
                  {(viewingPlan.products || []).length} Products
                </span>
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCrown className="text-purple-600" /> Plan Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <PlanInfoRow icon={<FaCrown />} label="Plan Name" value={viewingPlan.planName} />
                  <PlanInfoRow
                    icon={<FaCalendarAlt />}
                    label="Created At"
                    value={formatDateTime(viewingPlan.createdAt)}
                  />
                  <PlanInfoRow
                    icon={<FaCalendarAlt />}
                    label="Updated At"
                    value={formatDateTime(viewingPlan.updatedAt)}
                  />
                  <PlanInfoRow
                    icon={<FaIdCardIcon />}
                    label="Plan ID"
                    value={String(viewingPlan._id || "")}
                    full
                  />
                  <PlanInfoRow
                    icon={<FaList />}
                    label="Description"
                    value={viewingPlan.description || "—"}
                    full
                  />
                </div>
              </div>

              {/* Pricing & Validity */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaRupeeSign className="text-emerald-600" /> Pricing & Validity
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold text-emerald-700 uppercase mb-1">Price</div>
                    <div className="text-base font-extrabold text-emerald-800">{fmt(viewingPlan.price)}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold text-red-700 uppercase mb-1">Discount</div>
                    <div className="text-base font-extrabold text-red-700">{fmt(viewingPlan.discount)}</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold text-indigo-700 uppercase mb-1">Validity</div>
                    <div className="text-base font-extrabold text-indigo-800">
                      {viewingPlan.validity} {viewingPlan.validityUnit || ""}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <div className="text-[9px] font-bold text-blue-700 uppercase mb-1">Final Price</div>
                    <div className="text-base font-extrabold text-blue-800">
                      {fmt(Math.max(0, (Number(viewingPlan.price) || 0) - (Number(viewingPlan.discount) || 0)))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products & Features */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaLayerGroup className="text-indigo-600" /> Products & Features ({viewingPlan.products?.length || 0})
                </h4>

                {!viewingPlan.products || viewingPlan.products.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                    No products in this plan
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewingPlan.products.map((prod, pIdx) => (
                      <div key={prod._id || pIdx} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            {pIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-indigo-900 text-sm">
                              {prod.productName || "Unnamed Product"}
                            </div>
                            <div className="text-[10px] text-indigo-600 font-semibold">
                              {(prod.features || []).length} features included
                            </div>
                          </div>
                          <FaLayerGroup className="text-indigo-500 flex-shrink-0" />
                        </div>

                        {Array.isArray(prod.features) && prod.features.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-9">
                            {prod.features.map((feat, fIdx) => (
                              <div key={fIdx}
                                className="flex items-start gap-2 text-[11px] text-gray-700">
                                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0 w-2.5 h-2.5" />
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between gap-2 flex-wrap">
              <button
                onClick={() => { setShowViewModal(false); openEditModal(viewingPlan); }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5">
                <FaEdit className="w-3 h-3" /> Edit Plan
              </button>
              <button
                onClick={() => { setShowViewModal(false); setViewingPlan(null); }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD / EDIT PLAN MODAL ═══ */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className={`sticky top-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 ${editingPlan ? "bg-gradient-to-r from-blue-50 to-indigo-50" : "bg-gradient-to-r from-emerald-50 to-teal-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center ${editingPlan ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
                  {editingPlan ? <FaEdit /> : <FaPlus />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {editingPlan ? "Edit Plan" : "Add New Plan"}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {editingPlan ? editingPlan.planName : "Fill in plan details"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowFormModal(false); setEditingPlan(null); setFormData({ ...EMPTY_PLAN }); }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/70">
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-5">

              {/* Basic Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaCrown className="text-purple-600" /> Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Plan Name *</label>
                    <input type="text" name="planName" value={formData.planName} onChange={handleInputChange}
                      placeholder="e.g. Premium Plan"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                      placeholder="Plan description..." rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Pricing & Validity */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaRupeeSign className="text-emerald-600" /> Pricing & Validity
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Price (₹) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                      placeholder="499" min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Discount (₹)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange}
                      placeholder="0" min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Validity *</label>
                    <input type="number" name="validity" value={formData.validity} onChange={handleInputChange}
                      placeholder="1" min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Unit</label>
                    <select name="validityUnit" value={formData.validityUnit} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                      {VALIDITY_UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
                      {STATUS_EDIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <FaLayerGroup className="text-indigo-600" /> Products & Features ({formData.products.length})
                  </h4>
                  <button type="button" onClick={handleAddProduct}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
                    <FaPlusCircle className="w-3 h-3" /> Add Product
                  </button>
                </div>

                {formData.products.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                    No products added yet. Click "Add Product" to start.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.products.map((prod, pIdx) => (
                      <div key={pIdx} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {pIdx + 1}
                          </span>
                          <input type="text" value={prod.productName}
                            onChange={(e) => handleProductNameChange(pIdx, e.target.value)}
                            placeholder="Product name (e.g. Payroll)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none" />
                          <button type="button" onClick={() => handleRemoveProduct(pIdx)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                            title="Remove Product">
                            <FaTrashAlt className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="pl-8 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase">
                              Features ({prod.features.length})
                            </span>
                            <button type="button" onClick={() => handleAddFeature(pIdx)}
                              className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                              <FaPlusCircle className="w-2.5 h-2.5" /> Add Feature
                            </button>
                          </div>
                          {prod.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <input type="text" value={feat}
                                onChange={(e) => handleFeatureChange(pIdx, fIdx, e.target.value)}
                                placeholder="Feature description"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none" />
                              <button type="button" onClick={() => handleRemoveFeature(pIdx, fIdx)}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                                title="Remove Feature">
                                <FaMinusCircle className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button"
                  onClick={() => { setShowFormModal(false); setEditingPlan(null); setFormData({ ...EMPTY_PLAN }); }}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${editingPlan ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  {saving ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FaSave className="w-3.5 h-3.5" />}
                  {saving ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {showDeleteModal && deletingPlan && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete Plan?</h3>
                <p className="text-xs text-gray-600 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <FaCrown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{deletingPlan.planName || "N/A"}</div>
                    <div className="text-[10px] text-gray-400">ID: {String(deletingPlan._id || "").slice(-8)}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price</span>
                    <span className="font-bold text-emerald-700">{fmt(deletingPlan.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Validity</span>
                    <span className="font-medium text-gray-800">{deletingPlan.validity} {deletingPlan.validityUnit || ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Products</span>
                    <span className="font-medium text-indigo-700">{(deletingPlan.products || []).length}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[11px] text-red-800 leading-relaxed">
                  <b>⚠️ Warning:</b> Deleting this plan will <b>permanently remove</b> it from the system. Clients using this plan may be affected. This action <b>cannot be reversed</b>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingPlan(null); }}
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

// ── Plan Info Row sub-component ──
const PlanInfoRow = ({ icon, label, value, full, valueClass = "" }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
      <span className="text-gray-400">{icon}</span> {label}
    </div>
    <div className="text-xs text-gray-800 break-words leading-snug">
      {value || "—"}
    </div>
  </div>
);

// Simple ID icon
const FaIdCardIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 576 512" fill="currentColor">
    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 256h64c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16c0-44.2 35.8-80 80-80zm-32-96a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm256-32H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
  </svg>
);

export default TimelyPlans;