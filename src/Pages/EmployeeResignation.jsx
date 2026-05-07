import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import CountUp from "react-countup";
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
import { FiUsers, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";



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
      ? "text-green-600"
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
          <p className="leading-none text-green-600">Approved: {d.count}</p>
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
    <div className="p-3 mx-auto bg-white rounded-lg shadow-md max-w-9xl min-h-screen">

      {/* ==================== STATUS CARDS ==================== */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        <div onClick={() => navigate("/employee-resignation")} className="bg-white rounded-lg p-3 shadow-sm border-t-4 border-indigo-500 cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers className="text-gray-500 text-base flex-shrink-0" />
            <div className="text-sm font-medium text-gray-700">Total</div>
          </div>
          <div className="text-sm font-bold text-gray-700">
            <CountUp end={stats.total} duration={2} separator="," />
          </div>
        </div>
        <div onClick={() => navigate("/approved-resignations")} className="bg-white rounded-lg p-3 shadow-sm border-t-4 border-green-500 cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-gray-500 text-base flex-shrink-0" />
            <div className="text-sm font-medium text-gray-700">Approved</div>
          </div>
          <div className="text-sm font-bold">
            <CountUp end={stats.approved} duration={2} separator="," />
          </div>
        </div>
        <div onClick={() => navigate("/rejected-resignations")} className="bg-white rounded-lg p-3 shadow-sm border-t-4 border-rose-500 cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiXCircle className="text-gray-500 text-base flex-shrink-0" />
            <div className="text-sm font-medium text-gray-700">Rejected</div>
          </div>
          <div className="text-sm font-bold">
            <CountUp end={stats.rejected} duration={2} separator="," />
          </div>
        </div>
        <div onClick={() => navigate("/pending-resignations")} className="bg-white rounded-lg p-3 shadow-sm border-t-4 border-amber-500 cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiClock className="text-gray-500 text-base flex-shrink-0" />
            <div className="text-sm font-medium text-gray-700">Pending</div>
          </div>
          <div className="text-sm font-bold">
            <CountUp end={stats.pending} duration={2} separator="," />
          </div>
        </div>
      </div>

      {/* ==================== TWO CHARTS (Dashboard Style) ==================== */}
      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">

        {/* Approved Resignations Chart */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-700">Approved Resignations</h3>
              <p className="text-xs text-gray-500">Day-wise approved resignations</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={approvedMonth}
                onChange={(e) => setApprovedMonth(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-600"
              />
              <button
                onClick={() => downloadChartCSV("approved")}
                className="font-bold text-green-600 transition-colors text-xs hover:text-green-800 whitespace-nowrap flex items-center gap-1"
                title="Download CSV"
              >
                <FaDownload className="text-[10px]" /> CSV
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
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
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
                <FiCheckCircle className="w-8 h-8 mb-2 opacity-20" />
                <p>No approved resignations this month</p>
              </div>
            )}
          </div>
        </div>

        {/* Rejected Resignations Chart */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-700">Rejected Resignations</h3>
              <p className="text-xs text-gray-500">Day-wise rejected resignations</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={rejectedMonth}
                onChange={(e) => setRejectedMonth(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
              />
              <button
                onClick={() => downloadChartCSV("rejected")}
                className="font-bold text-rose-600 transition-colors text-xs hover:text-rose-800 whitespace-nowrap flex items-center gap-1"
                title="Download CSV"
              >
                <FaDownload className="text-[10px]" /> CSV
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
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
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
                <FiXCircle className="w-8 h-8 mb-2 opacity-20" />
                <p>No rejected resignations this month</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== FILTER BAR ==================== */}
      <div className="flex flex-col gap-4 mb-4 xl:flex-row xl:items-center xl:justify-between">
        <div></div>

        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mr-2">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-500"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              className="w-full appearance-none bg-white py-2 px-4 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm sm:w-40"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => setDateFilter("")}
                title="Clear date filter"
              >
                <FaTimes className="text-[12px]" />
              </div>
            )}
          </div>

          {/* Searchable Role Filter */}
          <div className="relative w-full sm:w-56" ref={roleDropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 z-10">
              <FaBriefcase className="text-sm" />
            </div>
            <div
              className="w-full bg-white py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all hover:bg-gray-50 cursor-pointer shadow-sm relative overflow-hidden text-ellipsis whitespace-nowrap"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            >
              {roleFilter || "Select Role"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
              {roleFilter ? (
                <FaTimes
                  className="text-[12px] text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); setRoleFilter(""); }}
                  title="Clear role filter"
                />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
              )}
            </div>

            {isRoleDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <FaUserTie className="absolute left-2.5 top-2.5 text-gray-500 text-xs" />
                    <input
                      type="text"
                      className="w-full py-1.5 pl-8 pr-4 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search roles..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  <div
                    className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${!roleFilter ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}
                    onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); setRoleSearchQuery(""); }}
                  >
                    All Roles
                  </div>
                  {roles
                    .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                    .map((r) => (
                      <div
                        key={r._id}
                        className={`px-4 py-2 text-xs font-bold cursor-pointer hover:bg-indigo-50 transition-colors ${roleFilter === r.name ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}
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
          <div className="relative w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="Search employee, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FaSearch className="text-sm" />
            </div>
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FaTimes
                  className="text-[12px] text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => fetchResignations()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
            title="Refresh"
          >
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================== TABLE (Unchanged) ==================== */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading Resignations...</div>
        ) : filteredData.length > 0 ? (
          <table className="min-w-full">
            <thead className="text-left text-sm text-white bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="py-3 px-4 text-center">Employee Name</th>
                <th className="py-3 px-4 text-center">Designation</th>
                <th className="py-3 px-4 text-center">Contact</th>
                <th className="py-3 px-4 text-center">Filing Date</th>
                <th className="py-3 px-4 text-center">Last Working Day</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((app) => (
                <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="font-bold text-gray-700">{app.firstName} {app.lastName}</div>
                    <div className="text-[10px] text-gray-500">{app.email}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                      {app.jobId?.role || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center text-gray-500">
                    {app.mobile}
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                      <FaCalendarAlt className="text-[8px]" />
                      {app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 rounded text-[10px] font-bold text-red-600">
                      <FaCalendarAlt className="text-[8px]" />
                      {app.lastWorkingDay ? new Date(app.lastWorkingDay).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {(app.resignationStatus || "Pending").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => { setSelectedResignation(app); setIsModalOpen(true); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <FaEye size={16} className="group-hover:scale-110 transition-transform" />
                      </button>

                      {(app.resignationStatus || "Pending") === "Pending" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Approved"); }}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors group"
                            title="Accept Resignation"
                          >
                            <FaCheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(app._id, "Rejected"); }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
                            title="Reject Resignation"
                          >
                            <FaTimesCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); downloadResignationPDF(app); }}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Download PDF"
                      >
                        <FaDownload size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FaFileAlt className="mx-auto mb-4 text-gray-700" size={48} />
            <p className="font-medium">No resignations found</p>
          </div>
        )}
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {isModalOpen && selectedResignation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-700">
                  {selectedResignation.firstName} {selectedResignation.lastName}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-blue-600">
                  {selectedResignation.jobId?.role || "Position Not Specified"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${selectedResignation.resignationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedResignation.resignationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                  {selectedResignation.resignationStatus || 'Pending'}
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <FaTimesCircle size={18} />
                </button>
              </div>
            </div>

            <div className="p-8 pt-4 max-h-[75vh] overflow-y-auto no-scrollbar space-y-8">
              {/* Sleek Prominent Resignation Content */}
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <FaFileAlt className="text-red-500 text-xl" />
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-[2rem] border border-gray-200 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                    Statement of Resignation
                  </h3>

                  <div className="text-base text-slate-700 font-medium leading-relaxed italic relative">
                    <span className="text-3xl text-red-100 absolute -top-3 -left-3 select-none">"</span>
                    <span className="relative z-10">{selectedResignation.resignationLetter || "No statement provided."}</span>
                  </div>
                </div>
              </div>

              {/* Status & Timing Context Badge */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-gray-200/50">
                  <FaCalendarAlt className="text-red-400" />
                  Filed on {selectedResignation.resignationSentAt ? new Date(selectedResignation.resignationSentAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown Date"}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100">
                  <FaCalendarAlt className="text-red-400" />
                  Last Day: {selectedResignation.lastWorkingDay ? new Date(selectedResignation.lastWorkingDay).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Specified"}
                </div>
                {selectedResignation.resignationStatus !== 'Pending' && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${selectedResignation.resignationStatus === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {selectedResignation.resignationStatus === 'Approved' ? <FaCheckCircle /> : <FaTimesCircle />}
                    Decision: {selectedResignation.resignationStatus}
                  </div>
                )}
              </div>

              {(selectedResignation.resignationStatus || 'Pending') === 'Pending' && (
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Approved")}
                    disabled={!!updatingId}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-[0.1em] rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2 group transform hover:-translate-y-1"
                  >
                    <FaCheckCircle className="text-base group-hover:scale-110 transition-transform" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedResignation._id, "Rejected")}
                    disabled={!!updatingId}
                    className="flex-1 py-4 bg-white border border-gray-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-900 text-xs font-black uppercase tracking-[0.1em] rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group transform hover:-translate-y-1"
                  >
                    <FaTimesCircle className="text-base group-hover:scale-110 transition-transform text-red-500" />
                    Reject Request
                  </button>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
              <button
                onClick={() => downloadResignationPDF(selectedResignation)}
                className="text-[10px] font-black text-gray-500 hover:text-red-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
              >
                <FaDownload className="text-xs group-hover:animate-bounce" /> Archive PDF
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: zoomIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}} />
    </div>
  );
};

export default EmployeeResignation;
