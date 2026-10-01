import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["All", "New", "Contacted", "Converted", "Rejected"];

const STATUS_META = {
  New:       { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Contacted: { bg: "#fef9c3", color: "#92400e", dot: "#f59e0b" },
  Converted: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  Rejected:  { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
};

const ITEMS_OPTIONS = [5, 10, 20, 50];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DigitalLeads() {
  // Data
  const [allLeads, setAllLeads]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // Filters
  const [searchTerm, setSearchTerm]           = useState("");
  const [statusFilter, setStatusFilter]       = useState("All");
  const [showStatusDrop, setShowStatusDrop]   = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const statusRef = useRef(null);

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const s = localStorage.getItem("digitalLeads_itemsPerPage");
    return s ? parseInt(s, 10) : 10;
  });

  // Row actions
  const [updatingId, setUpdatingId]       = useState(null);
  const [deletingId, setDeletingId]       = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ── Click-outside for status dropdown ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target))
        setShowStatusDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch all leads ──────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch in pages until exhausted (backend returns max 20 per page)
      let page = 1, collected = [];
      while (true) {
        const res = await axios.get(`${API_BASE_URL}/consultation-leads`, {
          params: { page, limit: 100 },
        });
        if (!res.data?.success) break;
        const batch = res.data.data || [];
        collected = [...collected, ...batch];
        if (page >= (res.data.pages || 1)) break;
        page++;
      }
      setAllLeads(collected);
    } catch (err) {
      console.error("fetchLeads:", err);
      setError(err?.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Apply filters ────────────────────────────────────────────────────────────
  useEffect(() => {
    let data = [...allLeads];
    if (statusFilter !== "All")
      data = data.filter((l) => l.status === statusFilter);
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase().trim();
      data = data.filter(
        (l) =>
          l.name?.toLowerCase().includes(t) ||
          l.businessName?.toLowerCase().includes(t) ||
          l.phone?.includes(t) ||
          l.email?.toLowerCase().includes(t) ||
          l.lookingFor?.toLowerCase().includes(t)
      );
    }
    setFiltered(data);
    setCurrentPage(1);
  }, [allLeads, statusFilter, searchTerm]);

  // ── Pagination helpers ───────────────────────────────────────────────────────
  const totalPages       = Math.ceil(filtered.length / itemsPerPage);
  const indexOfFirst     = (currentPage - 1) * itemsPerPage;
  const indexOfLast      = indexOfFirst + itemsPerPage;
  const currentRecords   = filtered.slice(indexOfFirst, indexOfLast);

  const getPageNumbers = () => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2))
        nums.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3)
        nums.push("...");
    }
    return nums;
  };

  const handleItemsPerPage = (e) => {
    const v = Number(e.target.value);
    setItemsPerPage(v);
    localStorage.setItem("digitalLeads_itemsPerPage", String(v));
    setCurrentPage(1);
  };

  // ── Status update ────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/consultation-leads/${id}/status`,
        { status: newStatus }
      );
      if (res.data?.success)
        setAllLeads((prev) =>
          prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
        );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await axios.delete(`${API_BASE_URL}/consultation-leads/${id}`);
      if (res.data?.success)
        setAllLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete lead.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    if (!filtered.length) { alert("No data to export!"); return; }
    const headers = ["#","Name","Business","Phone","Email","Business Type","Looking For","Status","Submitted At"];
    const rows = filtered.map((l, i) => [
      i + 1,
      `"${l.name}"`,
      `"${l.businessName}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.businessType}"`,
      `"${l.lookingFor}"`,
      l.status,
      `"${formatDate(l.createdAt)}"`,
    ].join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `digital_leads_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Clear filters ─────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return (
      new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    );
  };

  // KPI counts
  const countNew       = allLeads.filter((l) => l.status === "New").length;
  const countContacted = allLeads.filter((l) => l.status === "Contacted").length;
  const countConverted = allLeads.filter((l) => l.status === "Converted").length;
  const countRejected  = allLeads.filter((l) => l.status === "Rejected").length;

  const filtersActive = statusFilter !== "All" || searchTerm;

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading digital leads…</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="emp-dash">
        <main className="grid place-items-center min-h-[60vh] p-4">
          <div className="emp-dash__card max-w-[520px] w-full">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load leads</h3>
                <p className="emp-dash__card-desc text-red-600 mt-1">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={fetchLeads}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* ── Desktop Header ─────────────────────────────────────────────── */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Digital <span>Leads</span>
            </h1>
          </div>

          {/* Right-side filters */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Search */}
            <div className="relative min-w-[140px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[140px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Status dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setShowStatusDrop((v) => !v)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  statusFilter !== "All"
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiFilter className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[90px]">{statusFilter === "All" ? "Status" : statusFilter}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showStatusDrop && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[160px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: statusRef.current ? statusRef.current.getBoundingClientRect().bottom + 4 : "auto",
                    left: statusRef.current ? statusRef.current.getBoundingClientRect().left : "auto",
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <div
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowStatusDrop(false); }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                        statusFilter === s ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear filters */}
            {filtersActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={fetchLeads}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className="w-3 h-3" />
              Refresh
            </button>

            {/* Export */}
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
            >
              <FiDownload className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        {/* ── Mobile Header ──────────────────────────────────────────────── */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Digital <span className="text-indigo-600">Leads</span>
          </h1>
          <span className="text-xs text-gray-500 font-medium">
            <strong className="text-gray-800">{allLeads.length}</strong> total
          </span>
        </div>

        {/* ── Mobile Filters Toggle ──────────────────────────────────────── */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">
              <strong>{filtered.length}</strong> records
            </span>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Name, business, email…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Status select */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                <button
                  onClick={downloadCSV}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                >
                  <FiDownload className="w-4 h-4" /> Export
                </button>
                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FiTrash2 className="w-4 h-4" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("All")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Leads</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div>
            </div>
            <div className="emp-dash__stat-value">{allLeads.length}</div>
            <div className="emp-dash__stat-meta">all time</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("New")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">New</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <span style={{ fontSize: 14 }}>🆕</span>
              </div>
            </div>
            <div className="emp-dash__stat-value">{countNew}</div>
            <div className="emp-dash__stat-meta">awaiting contact</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("Contacted")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Contacted</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <span style={{ fontSize: 14 }}>📞</span>
              </div>
            </div>
            <div className="emp-dash__stat-value">{countContacted}</div>
            <div className="emp-dash__stat-meta">in progress</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("Converted")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Converted</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <span style={{ fontSize: 14 }}>✅</span>
              </div>
            </div>
            <div className="emp-dash__stat-value">{countConverted}</div>
            <div className="emp-dash__stat-meta">won</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1 cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("Rejected")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Rejected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <span style={{ fontSize: 14 }}>❌</span>
              </div>
            </div>
            <div className="emp-dash__stat-value">{countRejected}</div>
            <div className="emp-dash__stat-meta">not interested</div>
          </div>
        </div>

        {/* ── Table Card ─────────────────────────────────────────────────── */}
        <div className="emp-dash__card">
          {filtered.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">📭</div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No leads found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                No records match the selected filters.
              </p>
              {filtersActive && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Business</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Business Type</th>
                      <th>Looking For</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Submitted At</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((lead, idx) => {
                      const meta = STATUS_META[lead.status] || {};
                      return (
                        <tr key={lead._id} className="transition-colors hover:bg-slate-50/50">

                          {/* # */}
                          <td className="px-3 py-3 text-center text-[11px] font-semibold text-slate-500">
                            {indexOfFirst + idx + 1}
                          </td>

                          {/* Name */}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner flex-shrink-0">
                                {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                                {lead.name}
                              </span>
                            </div>
                          </td>

                          {/* Business */}
                          <td className="px-3 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                            {lead.businessName}
                          </td>

                          {/* Phone */}
                          <td className="px-3 py-3 text-xs whitespace-nowrap">
                            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-medium">
                              {lead.phone}
                            </a>
                          </td>

                          {/* Email */}
                          <td className="px-3 py-3 text-xs whitespace-nowrap">
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                              {lead.email}
                            </a>
                          </td>

                          {/* Business Type */}
                          <td className="px-3 py-3 text-[11px] text-slate-600 whitespace-nowrap">
                            {lead.businessType}
                          </td>

                          {/* Looking For */}
                          <td className="px-3 py-3 text-[11px] text-slate-600 whitespace-nowrap">
                            {lead.lookingFor}
                          </td>

                          {/* Status dropdown */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <select
                              value={lead.status}
                              disabled={updatingId === lead._id}
                              onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                              style={{
                                backgroundColor: meta.bg || "#f1f5f9",
                                color: meta.color || "#0f172a",
                                border: "none",
                                borderRadius: 20,
                                padding: "3px 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                outline: "none",
                                opacity: updatingId === lead._id ? 0.6 : 1,
                              }}
                            >
                              {["New", "Contacted", "Converted", "Rejected"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {updatingId === lead._id && (
                              <span className="block text-[10px] text-gray-400 mt-0.5">saving…</span>
                            )}
                          </td>

                          {/* Submitted At */}
                          <td className="px-3 py-3 text-center text-[11px] text-slate-500 whitespace-nowrap">
                            {formatDateTime(lead.createdAt)}
                          </td>

                          {/* Delete */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {confirmDeleteId === lead._id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleDelete(lead._id)}
                                  disabled={deletingId === lead._id}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-sm disabled:opacity-60"
                                >
                                  {deletingId === lead._id ? "…" : "Yes, delete"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(lead._id)}
                                className="flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all"
                              >
                                <FiTrash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ──────────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
                {/* Left: per-page + count */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPage}
                      className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                    >
                      {ITEMS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Showing{" "}
                    <strong className="text-gray-800">{indexOfFirst + 1}–{Math.min(indexOfLast, filtered.length)}</strong>{" "}
                    of <strong className="text-gray-800">{filtered.length}</strong> records
                  </div>
                </div>

                {/* Right: page buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === 1
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((pg, i) => (
                    <button
                      key={i}
                      onClick={() => typeof pg === "number" && setCurrentPage(pg)}
                      disabled={pg === "..."}
                      className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                        pg === "..."
                          ? "text-gray-400 bg-transparent border-transparent cursor-default"
                          : currentPage === pg
                          ? "text-white bg-blue-600 border-blue-600 shadow-sm"
                          : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === totalPages
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => !deletingId && setConfirmDeleteId(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            >
              <FaTimes className="text-gray-500 text-sm" />
            </button>
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Delete Lead?</h3>
              <p className="text-xs text-gray-500 mb-5">
                This action cannot be undone. The lead record will be permanently removed.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={!!deletingId}
                  className="px-5 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-sm disabled:opacity-60"
                >
                  {deletingId ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes fade-in  { from { opacity: 0; }                          to { opacity: 1; } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.9) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fade-in  { animation: fade-in  0.25s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s  ease-out; }
      `}</style>
    </div>
  );
}