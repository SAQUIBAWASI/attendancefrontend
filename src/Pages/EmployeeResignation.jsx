import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import {
  FaUserTie, FaCalendarAlt, FaStar, FaEye, FaDownload,
  FaCheckCircle, FaTimesCircle, FaTasks, FaSearch,
  FaFilePdf, FaFileAlt, FaSignOutAlt, FaChevronRight,
  FaArrowLeft, FaFilter, FaSync, FaEnvelope, FaBriefcase, FaUserCircle,
  FaTimes, FaUserGraduate, FaPhone, FaBuilding, FaMoneyBillWave,
  FaCalendarCheck, FaMapMarkerAlt
} from "react-icons/fa";
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiGift, FiActivity, FiFilter } from "react-icons/fi";
import "../index.css";
import "./EmployeeDashboard.css";



const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-700 text-right">
      {value || "N/A"}
    </span>
  </div>
);

const ScoreMini = ({ label, score }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-semibold ${score >= 80
      ? "text-blue-700"
      : score >= 50
        ? "text-yellow-600"
        : "text-red-600"
      }`}>
      {score || 0}
    </p>
  </div>
);

const COLORS = [
  '#10b981', '#059669', '#34D399',
  '#6366F1', '#4F46E5', '#818CF8',
  '#06B6D4', '#0891B2', '#22D3EE',
  '#F59E0B', '#D97706', '#FBBF24',
  '#EF4444', '#DC2626', '#E11D48'
];

const EmployeeResignation = () => {
  const navigate = useNavigate();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  // Chart month filters (Dashboard style)
  const [approvedMonth, setApprovedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rejectedMonth, setRejectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchResignations();
    fetchRoles();

    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/roles/all`);
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/applications/all`);
      const allApps = res.data.applications || [];
      const resignedApps = allApps.filter(app => app.status === "Resigned");
      setResignations(resignedApps);
    } catch (err) {
      console.error("Fetch resignations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await axios.post(`${API_BASE_URL}/applications/resignation-approval`, {
        applicationId: id,
        status
      });
      if (res.data.success) {
        alert(`Resignation ${status} successfully!`);
        setResignations(prev =>
          prev.map(app => (app._id === id ? { ...app, resignationStatus: status } : app))
        );
        if (selectedResignation && selectedResignation._id === id) {
          setSelectedResignation({ ...selectedResignation, resignationStatus: status });
        }
      }
    } catch (err) {
      console.error("Resignation update error:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadResignationPDF = (app) => {
    if (!app) return;
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("RESIGNATION LETTER", 105, 25, { align: "center" });
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Employee: ${app.firstName} ${app.lastName}`, 20, 55);
    doc.text(`Role: ${app.jobId?.role || "N/A"}`, 20, 62);
    doc.text(`Date Filed: ${new Date(app.resignationSentAt).toLocaleDateString()}`, 20, 69);
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 75, 190, 75);
    doc.setFont("helvetica", "normal");
    const letterBody = app.resignationLetter || "No content provided.";
    const splitText = doc.splitTextToSize(letterBody, 170);
    doc.text(splitText, 20, 85);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Timely Health Projects - Human Resources Dept", 105, 285, { align: "center" });
    doc.save(`Resignation_${app.firstName}_${app.lastName}.pdf`);
  };

  const formatDocumentUrl = (filePath) => {
    if (!filePath) return "";
    const relativePath = filePath.includes("uploads")
      ? "uploads/" + filePath.split(/uploads[\/\\]/).pop().replace(/\\/g, "/")
      : filePath.replace(/\\/g, "/");
    return `${API_BASE_URL.replace("/api", "")}/${relativePath}`;
  };

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = resignations.length;
    const approved = resignations.filter(a => a.resignationStatus === "Approved").length;
    const rejected = resignations.filter(a => a.resignationStatus === "Rejected").length;
    const pending = total - approved - rejected;
    return { total, approved, rejected, pending };
  }, [resignations]);

  // ==================== APPROVED CHART DATA (month-wise) ====================
  const approvedChartData = useMemo(() => {
    const [year, month] = approvedMonth.split("-").map(Number);
    const dayMap = {};

    resignations.forEach(app => {
      if (app.resignationStatus !== "Approved") return;
      const date = new Date(app.resignationSentAt || app.createdAt);
      if (isNaN(date)) return;
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month) return;

      const day = date.getDate();
      const label = `${day}`;
      if (!dayMap[day]) dayMap[day] = { day, name: label, count: 0 };
      dayMap[day].count += 1;
    });

    // Fill all days of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(dayMap[d] || { day: d, name: `${d}`, count: 0 });
    }
    return result;
  }, [resignations, approvedMonth]);

  // ==================== REJECTED CHART DATA (month-wise) ====================
  const rejectedChartData = useMemo(() => {
    const [year, month] = rejectedMonth.split("-").map(Number);
    const dayMap = {};

    resignations.forEach(app => {
      if (app.resignationStatus !== "Rejected") return;
      const date = new Date(app.resignationSentAt || app.createdAt);
      if (isNaN(date)) return;
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month) return;

      const day = date.getDate();
      const label = `${day}`;
      if (!dayMap[day]) dayMap[day] = { day, name: label, count: 0 };
      dayMap[day].count += 1;
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(dayMap[d] || { day: d, name: `${d}`, count: 0 });
    }
    return result;
  }, [resignations, rejectedMonth]);

  // ==================== CSV EXPORT for Chart ====================
  const downloadChartCSV = (type) => {
    const isApproved = type === "approved";
    const monthVal = isApproved ? approvedMonth : rejectedMonth;
    const [year, month] = monthVal.split("-").map(Number);
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    const items = resignations.filter(app => {
      const st = app.resignationStatus || "Pending";
      if (isApproved && st !== "Approved") return false;
      if (!isApproved && st !== "Rejected") return false;
      const date = new Date(app.resignationSentAt || app.createdAt);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    if (items.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Name", "Email", "Role", "Filing Date", "Last Working Day", "Status"];
    const rows = items.map(app => [
      `"${app.firstName} ${app.lastName}"`,
      `"${app.email || ''}"`,
      `"${app.jobId?.role || 'N/A'}"`,
      `"${app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : ''}"`,
      `"${app.lastWorkingDay ? new Date(app.lastWorkingDay).toLocaleDateString() : ''}"`,
      `"${app.resignationStatus || 'Pending'}"`
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resignations_${type}_${monthName}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== TOOLTIPS (Dashboard style) ====================
  const ApprovedTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const [y, m] = approvedMonth.split("-").map(Number);
      const monthName = new Date(y, m - 1).toLocaleString('default', { month: 'short' });
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-xl">
          <p className="font-bold text-gray-700 mb-0.5 leading-none">{monthName} {d.name}, {y}</p>
          <p className="leading-none text-blue-700">Approved: {d.count}</p>
        </div>
      );
    }
    return null;
  };

  const RejectedTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const [y, m] = rejectedMonth.split("-").map(Number);
      const monthName = new Date(y, m - 1).toLocaleString('default', { month: 'short' });
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-xl">
          <p className="font-bold text-gray-700 mb-0.5 leading-none">{monthName} {d.name}, {y}</p>
          <p className="leading-none text-red-600">Rejected: {d.count}</p>
        </div>
      );
    }
    return null;
  };

  // ==================== FILTERED TABLE DATA ====================
  const filteredData = resignations.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
      (app.jobId?.role || "").toLowerCase().includes(query) ||
      (app.mobile || "").toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query);

    const matchesRole = roleFilter ? (app.jobId?.role === roleFilter) : true;

    let matchesDate = true;
    if (dateFilter) {
      const appDate = new Date(app.resignationSentAt).toISOString().split('T')[0];
      matchesDate = appDate === dateFilter;
    }

    const matchesStatus = filterStatus === "All" || (app.resignationStatus || "Pending") === filterStatus;

    return matchesSearch && matchesRole && matchesDate && matchesStatus;
  });

  return (
    <div className="emp-dash">

      <main className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div className="flex items-center gap-3 flex-wrap">
  <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              Employee <span>Resignations</span>
            </h1>
           <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Monitor and manage employee resignation requests and approvals.
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="emp-dash__stats">
            <div onClick={() => navigate("/employee-resignation")} className="emp-dash__stat cursor-pointer">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Resignations</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                <CountUp end={stats.total} duration={2} separator="," />
              </div>
              <div className="emp-dash__stat-meta">all time</div>
            </div>

            <div onClick={() => navigate("/approved-resignations")} className="emp-dash__stat cursor-pointer">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Approved</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiCheckCircle className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                <CountUp end={stats.approved} duration={2} separator="," />
              </div>
              <div className="emp-dash__stat-meta">approved requests</div>
            </div>

            <div onClick={() => navigate("/rejected-resignations")} className="emp-dash__stat cursor-pointer">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Rejected</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiXCircle className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                <CountUp end={stats.rejected} duration={2} separator="," />
              </div>
              <div className="emp-dash__stat-meta">rejected requests</div>
            </div>

            <div onClick={() => navigate("/pending-resignations")} className="emp-dash__stat cursor-pointer">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Pending</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiClock className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                <CountUp end={stats.pending} duration={2} separator="," />
              </div>
              <div className="emp-dash__stat-meta">awaiting action</div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="emp-dash__charts-grid">

          {/* Approved Resignations Chart */}
          <div className="emp-dash__card">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Approved Resignations
                </h3>
                <p className="emp-dash__card-desc">Day-wise approved resignations</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={approvedMonth}
                  onChange={(e) => setApprovedMonth(e.target.value)}
                  className="emp-dash__month-input"
                />
                <button
                  onClick={() => downloadChartCSV("approved")}
                  className="px-3 py-2 bg-green-50 text-green-600 font-semibold text-xs rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap flex items-center gap-2"
                  title="Download CSV"
                >
                  <FaDownload className="text-xs" /> CSV
                </button>
              </div>
            </div>
            <div className="emp-dash__card-body">
              <div className="emp-dash__chart-wrap">
                {approvedChartData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={approvedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        interval={1}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ApprovedTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={14}>
                        {approvedChartData.map((entry, index) => (
                          <Cell key={`cell-a-${index}`} fill={entry.count > 0 ? '#10b981' : '#e5e7eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="emp-dash__empty-chart">
                    <FiCheckCircle />
                    <p>No approved resignations this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejected Resignations Chart */}
          <div className="emp-dash__card">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  Rejected Resignations
                </h3>
                <p className="emp-dash__card-desc">Day-wise rejected resignations</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={rejectedMonth}
                  onChange={(e) => setRejectedMonth(e.target.value)}
                  className="emp-dash__month-input"
                />
                <button
                  onClick={() => downloadChartCSV("rejected")}
                  className="px-3 py-2 bg-rose-50 text-rose-600 font-semibold text-xs rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap flex items-center gap-2"
                  title="Download CSV"
                >
                  <FaDownload className="text-xs" /> CSV
                </button>
              </div>
            </div>
            <div className="emp-dash__card-body">
              <div className="emp-dash__chart-wrap">
                {rejectedChartData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rejectedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        interval={1}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<RejectedTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={14}>
                        {rejectedChartData.map((entry, index) => (
                          <Cell key={`cell-r-${index}`} fill={entry.count > 0 ? '#EF4444' : '#e5e7eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="emp-dash__empty-chart">
                    <FiXCircle />
                    <p>No rejected resignations this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filter Resignations
              </h3>
              <p className="emp-dash__card-desc">Search by employee, email, role, or filter by status and date</p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filterStatus === status
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="relative w-[150px]">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear date filter"
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                )}
              </div>

              {/* Searchable Role Filter */}
              <div className="relative w-[180px]" ref={roleDropdownRef}>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FaBriefcase className="text-xs" />
                </div>
                <div
                  className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-ellipsis whitespace-nowrap"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                >
                  {roleFilter || "Select Role"}
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {roleFilter ? (
                    <FaTimes
                      className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                      onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                      title="Clear role filter"
                    />
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                  )}
                </div>

                {isRoleDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <FaUserTie className="absolute left-2 top-2 text-gray-400 text-[10px]" />
                        <input
                          type="text"
                          className="w-full py-1.5 pl-7 pr-3 text-[10px] bg-white border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder="Search roles..."
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      <div
                        className={`px-3 py-1.5 text-[10px] font-semibold cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                      >
                        All Roles
                      </div>
                      {roles
                        .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                        .map((r) => (
                          <div
                            key={r._id}
                            className={`px-3 py-1.5 text-[10px] font-semibold cursor-pointer hover:bg-blue-50 transition-colors ${roleFilter === r.name ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                            onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                          >
                            {r.name}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search employee, email, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear search"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchResignations()}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__table-wrap">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="text-center">Designation</th>
                  <th className="text-center">Contact</th>
                  <th className="text-center">Filing Date</th>
                  <th className="text-center">Last Working Day</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="emp-dash__spinner"></div>
                        <span className="text-sm font-medium text-gray-500">Loading resignations...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaFileAlt className="text-4xl text-gray-300" />
                        <p className="text-gray-500 font-medium">No resignations found</p>
                        <p className="text-gray-400 text-xs">Try adjusting your filters or search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredData.map((app, index) => (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        className="hover:bg-gray-55/60 transition-all group"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              app.resignationStatus === 'Approved' ? 'bg-green-100 text-green-600' :
                              app.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {app.firstName?.[0]}{app.lastName?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {app.firstName} {app.lastName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {app.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.jobId?.role ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {app.jobId?.role || "N/A"}
                          </span>
                        </td>
                        <td className="text-center text-gray-600 font-medium">
                          {app.mobile || 'N/A'}
                        </td>
                        <td className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-800 text-xs">
                              {app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-bold text-xs ${
                              app.lastWorkingDay ? 'text-rose-600' : 'text-gray-400'
                            }`}>
                              {app.lastWorkingDay ? new Date(app.lastWorkingDay).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.resignationStatus === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                            app.resignationStatus === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {(app.resignationStatus || "Pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setSelectedResignation(app); setIsModalOpen(true); }}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-blue-600 hover:bg-blue-50"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>

                            {(app.resignationStatus || "Pending") === "Pending" && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Approved"); }}
                                  className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                                  title="Accept Resignation"
                                >
                                  <FaCheckCircle size={14} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Rejected"); }}
                                  className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                  title="Reject Resignation"
                                >
                                  <FaTimesCircle size={14} />
                                </button>
                              </>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); downloadResignationPDF(app); }}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                              title="Download PDF"
                            >
                              <FaDownload size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{filteredData.length}</span> resignation records
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Approved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Rejected</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Pending</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedResignation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal animate-in fade-in duration-200">
          <div className="emp-dash__modal-panel bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedResignation.resignationStatus === 'Approved' ? 'bg-green-100 text-green-600' :
                  selectedResignation.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {selectedResignation.firstName?.[0]}{selectedResignation.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    {selectedResignation.firstName} {selectedResignation.lastName}
                  </h2>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {selectedResignation.jobId?.role || "Position Not Specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  selectedResignation.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedResignation.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                }`}>
                  {selectedResignation.resignationStatus || 'Pending'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
                >
                  <FaTimesCircle size={14} />
                </button>
              </div>
            </div>

            <div className="emp-dash__modal-body p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-4">
              {/* Resignation Statement */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                  Statement of Resignation
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedResignation.resignationLetter || "No statement provided."}
                </p>
              </div>

              {/* Status & Timing */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-wider border border-gray-200">
                  <FaCalendarAlt className="text-indigo-500 text-[10px]" />
                  Filed on {selectedResignation.resignationSentAt ? new Date(selectedResignation.resignationSentAt).toLocaleDateString() : "Unknown"}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg text-[10px] font-bold text-rose-600 uppercase tracking-wider border border-rose-200">
                  <FaCalendarAlt className="text-rose-500 text-[10px]" />
                  Last Day: {selectedResignation.lastWorkingDay ? new Date(selectedResignation.lastWorkingDay).toLocaleDateString() : "Not Specified"}
                </div>
                {selectedResignation.resignationStatus !== 'Pending' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    selectedResignation.resignationStatus === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {selectedResignation.resignationStatus === 'Approved' ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                    Decision: {selectedResignation.resignationStatus}
                  </div>
                )}
              </div>

              {(selectedResignation.resignationStatus || 'Pending') === 'Pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Approved")}
                    disabled={!!updatingId}
                    className="emp-dash__btn-primary-sm flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle size={12} /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Rejected")}
                    disabled={!!updatingId}
                    className="emp-dash__btn-outline flex items-center justify-center gap-2"
                  >
                    <FaTimesCircle size={12} /> Reject
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <button
                onClick={() => downloadResignationPDF(selectedResignation)}
                className="emp-dash__card-link"
              >
                <FaDownload size={12} /> Download PDF
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="emp-dash__btn-outline w-auto px-4 py-2 mt-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: zoomIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </div>
  );
};

export default EmployeeResignation;
