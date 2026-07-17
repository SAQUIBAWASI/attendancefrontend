import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { FaSearch, FaDownload, FaSync, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { 
  FiList, 
  FiCheckCircle, 
  FiXCircle, 
  FiCalendar, 
  FiTrendingUp,
  FiActivity,
  FiShield,
  FiUsers,
  FiFileText,
  FiFilter
} from "react-icons/fi";
import "../index.css";
import "./EmployeeDashboard.css";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { API_BASE_URL, API_DOMAIN } from "../config";

// --- Components from RecruitmentDashboard ---

const StatCard = ({ icon: Icon, label, value, color, isPercentage }) => {
  const themes = {
    indigo: "border-indigo-500",
    emerald: "border-blue-500",
    amber: "border-amber-500",
    rose: "border-rose-500",
    cyan: "border-cyan-500",
  };
  const currentTheme = themes[color] || themes.indigo;

  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-500 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-700">
        <CountUp end={value} duration={2} separator="," />
        {isPercentage && "%"}
      </div>
    </div>
  );
};

const QualityCard = ({ label, value, total, color }) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  const colorClasses = {
    amber: "bg-amber-50 border-amber-100",
    emerald: "bg-emerald-50 border-emerald-100",
    cyan: "bg-cyan-50 border-cyan-100",
    indigo: "bg-indigo-50 border-indigo-100",
    purple: "bg-purple-50 border-purple-100",
    rose: "bg-rose-50 border-rose-100",
  };

  return (
    <div className={`p-2 px-3 rounded-xl border ${colorClasses[color] || colorClasses.indigo} shadow-sm`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-black text-gray-700">
          <CountUp end={value} duration={1.5} />
        </span>
        <span className="text-[10px] font-bold text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full h-1 bg-white rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            color === 'amber' ? 'bg-amber-500' :
            color === 'emerald' ? 'bg-blue-600' :
            color === 'cyan' ? 'bg-cyan-500' :
            color === 'purple' ? 'bg-purple-500' :
            color === 'rose' ? 'bg-rose-500' :
            'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-xl font-black uppercase tracking-tight">
        <p className="text-gray-900 mb-0.5 leading-none">{data.label}</p>
        <p className="leading-none text-blue-600">Count: {data.val}</p>
      </div>
    );
  }
  return null;
};

// --- Main Page Component ---

const AllMedicalCertificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/medical-certificates/all`);
      if (res.data.success) {
        const data = res.data.data || [];
        setCertificates(data);
        setFilteredCertificates(data);
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Expired", color: "#EF4444", text: "text-red-700", bg: "bg-red-100", border: "border-red-200" };
    if (diffDays <= 30) return { label: "Expiring Next Month", color: "#F87171", text: "text-red-600", bg: "bg-red-50", border: "border-red-100" };
    if (diffDays <= 60) return { label: "Expiring in 2 Months", color: "#FB923C", text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" };
    return { label: "Active", color: "#10B981", text: "text-green-700", bg: "bg-blue-100", border: "border-green-200" };
  };

  const getStats = () => {
    const statsMap = {
      "Expired": { label: "EXPIRED", val: 0, color: "#EF4444" },
      "Expiring Next Month": { label: "NEXT MONTH", val: 0, color: "#F87171" },
      "Expiring in 2 Months": { label: "2 MONTHS", val: 0, color: "#FB923C" },
      "Active": { label: "ACTIVE", val: 0, color: "#10B981" }
    };

    certificates.forEach(c => {
      const info = getStatusInfo(c.expiryDate);
      if (statsMap[info.label]) statsMap[info.label].val++;
    });

    return Object.values(statsMap);
  };

  useEffect(() => {
    let filtered = [...certificates];
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          (c.employeeName || c.candidateName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.employeeId || c.candidateId || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => {
        const info = getStatusInfo(c.expiryDate);
        if (statusFilter === "expired") return info.label === "Expired";
        if (statusFilter === "next_month") return info.label === "Expiring Next Month";
        if (statusFilter === "2_months") return info.label === "Expiring in 2 Months";
        if (statusFilter === "active") return info.label === "Active";
        return true;
      });
    }
    setFilteredCertificates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, certificates]);

  const handleSendReminder = async (cert) => {
    try {
      const recipientId = cert.employeeId || cert.candidateId;
      if (!recipientId) return alert("Recipient ID not found");

      const expiryStr = new Date(cert.expiryDate).toLocaleDateString();
      const message = `RE-UPLOAD REQUIRED: Your medical certificate is expiring on ${expiryStr}. Please upload a new one to maintain compliance.`;

      const res = await axios.post(`${API_BASE_URL}/medical-certificates/remind`, {
        recipientId,
        message
      });

      if (res.data.success) {
        alert(`Reminder sent to ${cert.employeeName || cert.candidateName}`);
      }
    } catch (err) {
      console.error("Failed to send reminder:", err);
      alert("Failed to send reminder. Please try again.");
    }
  };

  const downloadCSV = () => {
    if (filteredCertificates.length === 0) {
      alert("No data available to download!");
      return;
    }
    const headers = ["ID", "Name", "Reg. Date", "Exp. Date", "Status"];
    const csvRows = [
      headers.join(","),
      ...filteredCertificates.map(c => {
        const info = getStatusInfo(c.expiryDate);
        return [
          `"${c.employeeId || c.candidateId || 'N/A'}"`,
          `"${c.employeeName || c.candidateName || 'N/A'}"`,
          `"${new Date(c.registrationDate).toLocaleDateString()}"`,
          `"${new Date(c.expiryDate).toLocaleDateString()}"`,
          `"${info.label}"`
        ].join(",");
      })
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_certificates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchCertificates();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            pageNumbers.push(i);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            pageNumbers.push("...");
        }
    }
    return pageNumbers;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading Analytics...</p>
      </div>
    </div>
  );

  const chartData = getStats();
  const total = certificates.length;

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
           <div className="flex items-center gap-3 flex-wrap">
  <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              Medical <span>Certificates</span>
            </h1>
           {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Monitor and manage employee medical certificate compliance
            </p> */}
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

        {/* Top KPI Stats Grid - 2 per row on mobile */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Critical Risk</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiXCircle className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {chartData[0].val + chartData[1].val}
              </div>
              <div className="emp-dash__stat-meta">expired/30d</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Expiring (60d)</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiCalendar className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {chartData[2].val}
              </div>
              <div className="emp-dash__stat-meta">in 2 months</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Active</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiCheckCircle className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {chartData[3].val}
              </div>
              <div className="emp-dash__stat-meta">compliant</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Monitoring</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {total}
              </div>
              <div className="emp-dash__stat-meta">total records</div>
            </div>

            <div className="emp-dash__stat col-span-2 md:col-span-1">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Compliance Rate</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiShield className="text-purple-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {total > 0 ? ((chartData[3].val / total) * 100).toFixed(1) : 0}%
              </div>
              <div className="emp-dash__stat-meta">active rate</div>
            </div>
          </div>
        )}

        {/* Charts Section - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Compliance Distribution - Bar Chart */}
          <div className="emp-dash__card">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title flex items-center gap-2">
                  <FiActivity className="text-blue-600" /> Compliance Health
                </h3>
                <p className="emp-dash__card-desc">Medical certificate risk levels</p>
              </div>
              <button 
                onClick={fetchCertificates}
                className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                title="Sync Data"
              >
                <FaSync size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="emp-dash__card-body">
              <div className="flex-1 w-full h-[250px] sm:h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        interval={0}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Tooltip content={<StatusTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={30}>
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quality Metrics Breakdown */}
          <div className="emp-dash__card">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title flex items-center gap-2">
                  <FiTrendingUp className="text-blue-600" /> Risk Metrics
                </h3>
                <p className="emp-dash__card-desc">Distribution analysis</p>
              </div>
            </div>
            <div className="emp-dash__card-body">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <QualityCard label="Critical Risk" value={chartData[0].val + chartData[1].val} total={total} color="rose" />
                <QualityCard label="Expiring in 2 Months" value={chartData[2].val} total={total} color="amber" />
                <QualityCard label="Active Status" value={chartData[3].val} total={total} color="emerald" />
                <QualityCard label="Monitoring Health" value={chartData[3].val} total={total} color="indigo" />
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Compliance Rate</span>
                  <span className="font-bold text-blue-700">{total > 0 ? ((chartData[3].val / total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500 font-medium">Immediate Action Required</span>
                  <span className="font-bold text-rose-600">{chartData[0].val + chartData[1].val} Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="emp-dash__card">
          {/* Desktop Header */}
          {/* <div className="hidden sm:flex emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filter Certificates
              </h3>
              <p className="emp-dash__card-desc">Search by name, ID, or filter by status</p>
            </div>
          </div> */}

          {/* Mobile Filter Toggle Button */}
          <div className="sm:hidden flex items-center justify-between p-3 border-b border-gray-100">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600" />
              Filters
              {showMobileFilters ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
            </button>
            <span className="text-xs text-gray-400">
              {filteredCertificates.length} certificates
            </span>
          </div>

          {/* Filter Content - Toggle on Mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
            <div className="emp-dash__card-body bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-grow min-w-[200px]">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search candidate ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 px-3 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none min-w-[140px]"
                >
                  <option value="all">All Certificates</option>
                  <option value="expired">EXPIRED</option>
                  <option value="next_month">NEXT MONTH</option>
                  <option value="2_months">2 MONTHS</option>
                  <option value="active">ACTIVE</option>
                </select>
                <button 
                  onClick={fetchCertificates}
                  className="h-8 px-3 bg-white text-gray-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-300"
                  title="Refresh Data"
                >
                  <FaSync size={12} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={handleReset}
                  className="h-8 px-4 bg-white text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-300"
                >
                  Clear
                </button>
                <button onClick={downloadCSV} className="h-8 px-4 bg-gray-100 text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 ml-auto border border-gray-300">
                  <FaDownload /> Export CSV
                </button>
              </div>

              {/* Active filter chips */}
              {(searchTerm || statusFilter !== "all") && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500 font-medium">Active Filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] font-semibold border border-gray-200">
                      "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-semibold border border-blue-200">
                      {statusFilter.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GAP BETWEEN FILTER CARD AND TABLE */}
        <div className="mt-6"></div>

        {/* Table Card */}
        <div className="emp-dash__card">
          <div className="overflow-x-auto">
            <table className="emp-dash__table min-w-[800px]">
              <thead>
                <tr>
                  <th className="text-center whitespace-nowrap">ID</th>
                  <th className="text-left whitespace-nowrap">Candidate Name</th>
                  <th className="text-center whitespace-nowrap hidden sm:table-cell">Reg. Date</th>
                  <th className="text-center whitespace-nowrap">Exp. Date</th>
                  <th className="text-center whitespace-nowrap">Status</th>
                  <th className="text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentItems.map((c, index) => {
                    const info = getStatusInfo(c.expiryDate);
                    return (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="text-center font-bold text-gray-900 text-xs whitespace-nowrap">
                          {c.employeeId || c.candidateId || "N/A"}
                        </td>
                        <td className="text-left">
                          <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{c.employeeName || c.candidateName || "N/A"}</div>
                        </td>
                        <td className="text-center font-medium text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                          {new Date(c.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="text-center font-bold text-gray-500 text-xs whitespace-nowrap">
                          {new Date(c.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${info.bg} ${info.text} ${info.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: info.color }}></span>
                            {info.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a 
                              href={`${API_DOMAIN}${c.documentUrl ? c.documentUrl.replace(/\\/g, '/').startsWith('/') ? c.documentUrl.replace(/\\/g, '/') : '/' + c.documentUrl.replace(/\\/g, '/') : ''}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              View
                            </a>
                            {info.label !== "Active" && (
                              <button 
                                onClick={() => handleSendReminder(c)}
                                className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                                title="Send Re-upload Reminder"
                              >
                                <FiActivity size={10} />
                                Remind
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredCertificates.length === 0 && (
              <div className="p-10 text-center bg-white text-gray-500 text-xs font-bold uppercase">
                No matching records found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">
                  {filteredCertificates.length > 0 ? indexOfFirstItem + 1 : 0}
                </span>
                <span>to</span>
                <span className="font-semibold text-gray-900">
                  {Math.min(indexOfLastItem, filteredCertificates.length)}
                </span>
                <span>of</span>
                <span className="font-semibold text-gray-900">
                  {filteredCertificates.length}
                </span>
                <span>records</span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                      <span key={index} className="px-2 text-gray-400 text-xs">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllMedicalCertificate;