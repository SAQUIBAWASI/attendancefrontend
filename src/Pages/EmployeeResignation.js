import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API_BASE_URL } from "../config";
import {
  FaUserTie, FaCalendarAlt, FaEye, FaDownload,
  FaCheckCircle, FaTimesCircle, FaSearch,
  FaFileAlt, FaFilter, FaSync, FaBriefcase,
  FaTimes, FaList, FaChevronDown, FaChevronUp,
  FaSortAmountDown, FaSortAmountUp, FaClock,
  FaExclamationTriangle, FaInfoCircle
} from "react-icons/fa";

const EmployeeResignation = () => {
  const [resignations, setResignations] = useState([]);
  const [filteredResignations, setFilteredResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const roleDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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
      const res = await axios.get(`${API_BASE_URL}/jobs/all`);
      if (res.data.success) {
        const jobData = res.data.data || res.data.jobPosts || [];
        const roleNames = Array.from(new Set(jobData.map(job => job.role))).filter(Boolean);
        const uniqueRoles = roleNames.map((name, index) => ({ _id: index, name }));
        setRoles(uniqueRoles);
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
      setFilteredResignations(resignedApps);
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

  const applyFiltersAndSort = () => {
    let result = [...resignations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app =>
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(query) ||
        (app.jobId?.role || "").toLowerCase().includes(query) ||
        (app.mobile || "").toLowerCase().includes(query) ||
        (app.email || "").toLowerCase().includes(query)
      );
    }

    if (roleFilter) {
      result = result.filter(app => app.jobId?.role === roleFilter);
    }

    if (dateFilter) {
      result = result.filter(app => {
        const appDate = new Date(app.resignationSentAt).toISOString().split('T')[0];
        return appDate === dateFilter;
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(app => (app.resignationStatus || "Pending") === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key] || a.resignationSentAt;
      let bVal = b[sortConfig.key] || b.resignationSentAt;

      if (sortConfig.key === 'createdAt' || sortConfig.key === 'resignationSentAt') {
        aVal = new Date(aVal || a.resignationSentAt).getTime();
        bVal = new Date(bVal || b.resignationSentAt).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredResignations(result);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [resignations, searchQuery, roleFilter, dateFilter, statusFilter, sortConfig]);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setDateFilter("");
    setStatusFilter("All");
    setSortConfig({ key: 'createdAt', direction: 'desc' });
    setShowMobileFilters(false);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSortAmountDown className="text-gray-400 opacity-50 text-xs" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortAmountUp className="text-blue-600 text-xs" /> : 
      <FaSortAmountDown className="text-blue-600 text-xs" />;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (roleFilter) count++;
    if (dateFilter) count++;
    if (statusFilter !== "All") count++;
    return count;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Approved': { color: 'bg-green-100 text-green-700 border-green-200' },
      'Rejected': { color: 'bg-red-100 text-red-700 border-red-200' },
      'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    };
    const info = statusMap[status] || statusMap['Pending'];
    return (
      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${info.color}`}>
        {status || 'Pending'}
      </span>
    );
  };

  // Stats
  const stats = {
    total: resignations.length,
    pending: resignations.filter(r => (r.resignationStatus || "Pending") === "Pending").length,
    approved: resignations.filter(r => r.resignationStatus === "Approved").length,
    rejected: resignations.filter(r => r.resignationStatus === "Rejected").length
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResignations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResignations.length / itemsPerPage);

  const handlePageClick = (page) => setCurrentPage(page);
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaList className="text-blue-600" />
            Resignation Requests
          </h1>
          <p className="text-sm text-gray-500">Review and manage employee resignation applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Total:</span>
            <span className="text-sm font-bold text-blue-600">{filteredResignations.length}</span>
          </div>
          <button
            onClick={() => fetchResignations()}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FaList className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="mt-1 text-xs text-gray-500">all resignations</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
              <FaClock className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="mt-1 text-xs text-gray-500">awaiting review</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
              <FaCheckCircle className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          <div className="mt-1 text-xs text-gray-500">approved</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FaTimesCircle className="text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
          <div className="mt-1 text-xs text-gray-500">rejected</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full mb-3">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          placeholder="Search by employee name, role, email, or mobile..."
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <FaFilter size={14} />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-all flex items-center gap-1"
          >
            <FaTimesCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filter Bar - Toggle */}
      {showMobileFilters && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="relative" ref={roleDropdownRef}>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <div className="relative">
                <div
                  className="w-full bg-white h-9 px-3 pr-10 text-sm text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer flex items-center justify-between"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                >
                  <span>{roleFilter || "Select Role"}</span>
                  <FaChevronDown size={12} className="text-gray-400" />
                </div>
                {roleFilter && (
                  <button
                    onClick={() => setRoleFilter("")}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
                {isRoleDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${!roleFilter ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}
                      onClick={() => { setRoleFilter(""); setIsRoleDropdownOpen(false); }}
                    >
                      All Roles
                    </div>
                    {roles
                      .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                      .map((r) => (
                        <div
                          key={r._id}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${roleFilter === r.name ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}
                          onClick={() => { setRoleFilter(r.name); setIsRoleDropdownOpen(false); }}
                        >
                          {r.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full h-9 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              {statusFilter !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("All")} className="hover:text-blue-900">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {roleFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Role: {roleFilter}
                  <button onClick={() => setRoleFilter("")} className="hover:text-purple-900">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Date: {new Date(dateFilter).toLocaleDateString()}
                  <button onClick={() => setDateFilter("")} className="hover:text-green-900">
                    <FaTimes size={10} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* TABLE - FORCE SHOW ON MOBILE WITH INLINE STYLE */}
      <div style={{ display: 'block' }}>
        {filteredResignations.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">
              {resignations.length === 0 ? 'No resignations found.' : 'No resignations match your filters.'}
            </p>
            {resignations.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaList className="text-blue-600" /> Resignation Requests
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => handleSort('firstName')}>
                      <div className="flex items-center gap-1.5">Employee {getSortIcon('firstName')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => handleSort('jobId.role')}>
                      <div className="flex items-center justify-center gap-1.5">Role {getSortIcon('jobId.role')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => handleSort('resignationSentAt')}>
                      <div className="flex items-center justify-center gap-1.5">Date {getSortIcon('resignationSentAt')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap" onClick={() => handleSort('resignationStatus')}>
                      <div className="flex items-center justify-center gap-1.5">Status {getSortIcon('resignationStatus')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 text-sm">{app.firstName} {app.lastName}</div>
                        <div className="text-xs text-gray-500">{app.mobile}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap">
                          {app.jobId?.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500 whitespace-nowrap">
                        {app.resignationSentAt ? new Date(app.resignationSentAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(app.resignationStatus || "Pending")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setSelectedResignation(app); setIsModalOpen(true); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          {(app.resignationStatus || "Pending") === "Pending" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(app._id, "Approved")}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <FaCheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app._id, "Rejected")}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <FaTimesCircle size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => downloadResignationPDF(app)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <FaDownload size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center">
                        <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResignations.length > 0 && !loading && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>Showing</span>
                  <span className="font-semibold text-gray-900">
                    {filteredResignations.length > 0 ? indexOfFirstItem + 1 : 0}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-gray-900">
                    {Math.min(indexOfLastItem, filteredResignations.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-gray-900">
                    {filteredResignations.length}
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
                    onClick={handlePrevPage}
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
                          onClick={() => handlePageClick(page)}
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
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedResignation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Resignation Details
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee Name</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold">
                    {selectedResignation.firstName} {selectedResignation.lastName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedResignation.jobId?.role || "N/A"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedResignation.email || "N/A"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mobile</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedResignation.mobile || "N/A"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date Filed</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedResignation.resignationSentAt ? new Date(selectedResignation.resignationSentAt).toLocaleString() : "N/A"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {getStatusBadge(selectedResignation.resignationStatus || "Pending")}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Resignation Letter</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[80px] whitespace-pre-wrap">
                    {selectedResignation.resignationLetter || "No letter provided"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {(selectedResignation.resignationStatus || "Pending") === "Pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedResignation._id, "Approved");
                        setIsModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedResignation._id, "Rejected");
                        setIsModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle size={14} /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => downloadResignationPDF(selectedResignation)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FaDownload size={14} /> Download PDF
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeResignation;