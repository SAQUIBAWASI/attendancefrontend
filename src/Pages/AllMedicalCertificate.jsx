import React, { useState, useEffect } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { FaSearch, FaDownload, FaSync } from "react-icons/fa";
import { 
  FiList, 
  FiCheckCircle, 
  FiXCircle, 
  FiCalendar, 
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";
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
    emerald: "border-emerald-500",
    amber: "border-amber-500",
    rose: "border-rose-500",
    cyan: "border-cyan-500",
  };
  const currentTheme = themes[color] || themes.indigo;

  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
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
        <span className="text-xl font-black text-gray-800">
          <CountUp end={value} duration={1.5} />
        </span>
        <span className="text-[10px] font-bold text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full h-1 bg-white rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            color === 'amber' ? 'bg-amber-500' :
            color === 'emerald' ? 'bg-emerald-500' :
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
      <div className="px-3 py-2 text-xs bg-white border border-gray-100 rounded-lg shadow-xl font-black uppercase tracking-tight">
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
    return { label: "Active", color: "#10B981", text: "text-green-700", bg: "bg-green-100", border: "border-green-200" };
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
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Analytics...</p>
      </div>
    </div>
  );

  const chartData = getStats();
  const total = certificates.length;

  return (
    <div className="min-h-screen p-2 lg:p-6 bg-gray-50/50">
      <div className="max-w-9xl mx-auto">
        
        {/* 1. Top Summary Stats - Matching RecruitmentDashboard */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={FiXCircle} label="Critical Risk" value={chartData[0].val + chartData[1].val} color="rose" />
          <StatCard icon={FiCalendar} label="Expiring (60d)" value={chartData[2].val} color="amber" />
          <StatCard icon={FiCheckCircle} label="Active" value={chartData[3].val} color="emerald" />
          <StatCard icon={FiActivity} label="Monitoring" value={total} color="indigo" />
          <StatCard icon={FiList} label="Total Records" value={total} color="cyan" />
        </div>

        {/* 2. Charts Section - Matching RecruitmentDashboard layout */}
        <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
          {/* Compliance Distribution - Bar Chart */}
          <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-3 px-2">
              <div>
                <h3 className="text-base font-bold text-gray-800">Compliance Health</h3>
                <p className="text-xs text-gray-500">Medical certificate risk levels</p>
              </div>
              <button 
                onClick={fetchCertificates}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                title="Sync Data"
              >
                <FaSync size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<StatusTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={35}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Quality Metrics Breakdown */}
          <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Risk Metrics</h3>
                <p className="text-xs text-gray-500">Distribution analysis</p>
              </div>
              <FiTrendingUp className="text-2xl text-rose-400 opacity-50" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
              <QualityCard label="Critical Risk (Expired/30d)" value={chartData[0].val + chartData[1].val} total={total} color="rose" />
              <QualityCard label="Expiring in 2 Months" value={chartData[2].val} total={total} color="amber" />
              <QualityCard label="Active Status" value={chartData[3].val} total={total} color="emerald" />
              <QualityCard label="Monitoring Health" value={chartData[3].val} total={total} color="indigo" />
            </div>

            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Compliance Rate</span>
                <span className="font-bold text-emerald-600">{total > 0 ? ((chartData[3].val / total) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500 font-medium">Immediate Action Required</span>
                <span className="font-bold text-rose-600">{chartData[0].val + chartData[1].val} Records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-grow min-w-[240px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
            <input 
              type="text" 
              placeholder="Search Candidate ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-0 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
          >
            <option value="all">All Certificates</option>
            <option value="expired">EXPIRED</option>
            <option value="next_month">NEXT MONTH</option>
            <option value="2_months">2 MONTHS</option>
            <option value="active">ACTIVE</option>
          </select>
          <button 
            onClick={fetchCertificates}
            className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100"
            title="Refresh Data"
          >
            <FaSync size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100"
          >
            Clear
          </button>
          <button onClick={downloadCSV} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 ml-auto">
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Specialized Medical Certificate Table - Kept as requested */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">ID</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Candidate Name</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Reg. Date</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Exp. Date</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((c) => {
                  const info = getStatusInfo(c.expiryDate);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-gray-900 text-xs">
                        {c.employeeId || c.candidateId || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{c.employeeName || c.candidateName || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-500 text-xs text-gray-400">
                        {new Date(c.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-500 text-xs text-red-500">
                        {new Date(c.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${info.bg} ${info.text} ${info.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: info.color }}></span>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a 
                            href={`${API_DOMAIN}${c.documentUrl ? c.documentUrl.replace(/\\/g, '/').startsWith('/') ? c.documentUrl.replace(/\\/g, '/') : '/' + c.documentUrl.replace(/\\/g, '/') : ''}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                          >
                            View
                          </a>
                          {info.label !== "Active" && (
                            <button 
                              onClick={() => handleSendReminder(c)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                              title="Send Re-upload Reminder"
                            >
                              <FiActivity size={10} />
                              Remind
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredCertificates.length === 0 && (
            <div className="p-10 text-center bg-white text-gray-400 text-xs font-bold uppercase">
              No matching records found
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">PAGE {currentPage} OF {totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMedicalCertificate;