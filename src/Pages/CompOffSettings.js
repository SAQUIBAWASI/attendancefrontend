import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaEye, FaSearch, FaExchangeAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { 
  FiFileText, FiClock, FiCheckCircle, FiXCircle, 
  FiCalendar, FiFilter, FiList, FiTrash2, FiRefreshCw,
  FiInfo, FiEdit, FiSave, FiX, FiPlus
} from "react-icons/fi";
import { API_BASE_URL } from "../config";

const CompOffSettings = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // ✅ Month filter - default to current month
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('compOffSettings_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch requests with comp-off filter
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_BASE_URL}/leaves/all?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      // ✅ Always send month filter
      if (monthFilter) {
        url += `&month=${monthFilter}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        const allRequests = response.data.requests || [];
        
        // Filter comp-off requests
        const compOffRequests = allRequests.filter(req => {
          return req.isCompOff === true || 
                 req.compOffRequest === true || 
                 req.leaveType === 'comp-off' ||
                 req.leaveType === 'Comp-off' ||
                 req.leaveType === 'comp_off' ||
                 req.leaveType === 'Comp-Off' ||
                 req.leaveDetails?.leaveType === 'comp-off' ||
                 req.leaveDetails?.leaveType === 'Comp-off' ||
                 req.leaveDetails?.leaveType === 'comp_off' ||
                 req.leaveDetails?.isCompOff === true ||
                 (req.reason && req.reason.toLowerCase().includes('comp-off')) ||
                 (req.reason && req.reason.toLowerCase().includes('comp off'));
        });
        
        setRequests(compOffRequests);
        setCounts({
          total: compOffRequests.length,
          pending: compOffRequests.filter(r => r.status === 'pending').length,
          approved: compOffRequests.filter(r => r.status === 'approved').length,
          rejected: compOffRequests.filter(r => r.status === 'rejected').length
        });
        setPagination({
          page: currentPage,
          limit: itemsPerPage,
          total: compOffRequests.length,
          totalPages: Math.ceil(compOffRequests.length / itemsPerPage)
        });
      } else {
        setError("Failed to fetch comp-off settings");
      }
    } catch (err) {
      console.error("Error fetching comp-off settings:", err);
      setError(err.response?.data?.error || "Failed to fetch comp-off settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, itemsPerPage, statusFilter, monthFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchRequests();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    // ✅ Reset to current month
    const now = new Date();
    setMonthFilter(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setCurrentPage(1);
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  const handleCardClick = (filterType) => {
    if (filterType === 'total') {
      setStatusFilter('');
      setCurrentPage(1);
    } else if (filterType === 'pending') {
      setStatusFilter('pending');
      setCurrentPage(1);
    } else if (filterType === 'approved') {
      setStatusFilter('approved');
      setCurrentPage(1);
    } else if (filterType === 'rejected') {
      setStatusFilter('rejected');
      setCurrentPage(1);
    }
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      approved: "bg-green-100 text-green-800 border border-green-200",
      rejected: "bg-red-100 text-red-800 border border-red-200"
    };
    return styles[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/leaves/updateleaves/${selectedRequest._id}`,
        {
          status: "approved"
        }
      );
      
      if (response.data && response.data.success) {
        setActionMessage("Comp-off request approved successfully!");
        setShowSuccessModal(true);
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert("Failed to approve comp-off request");
      }
    } catch (err) {
      console.error("Error approving comp-off:", err);
      alert(err.response?.data?.error || "Failed to approve comp-off request");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/leaves/updateleaves/${selectedRequest._id}`,
        {
          status: "rejected",
          rejectedReason: rejectReason
        }
      );
      
      if (response.data && response.data.success) {
        setActionMessage("Comp-off request rejected successfully!");
        setShowSuccessModal(true);
        setIsRejectModalOpen(false);
        setSelectedRequest(null);
        setRejectReason("");
        fetchRequests();
      } else {
        alert("Failed to reject comp-off request");
      }
    } catch (err) {
      console.error("Error rejecting comp-off:", err);
      alert(err.response?.data?.error || "Failed to reject comp-off request");
    } finally {
      setActionLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = pagination.totalPages || 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    localStorage.setItem('compOffSettings_itemsPerPage', String(limit));
  };

  // ✅ Get default month
  const getDefaultMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const isDefaultMonth = monthFilter === getDefaultMonth();
  
  // ✅ Check if any filter is active (excluding default month)
  const hasActiveFilters = searchTerm || statusFilter || !isDefaultMonth;

  // ✅ Get status label for display
  const getStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Pending',
      approved: '✅ Approved',
      rejected: '❌ Rejected'
    };
    return labels[status] || status;
  };

  // ✅ Format month for display
  const formatMonthDisplay = (monthValue) => {
    if (!monthValue) return '';
    const [year, month] = monthValue.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Get filter summary for display
  const getFilterSummary = () => {
    const parts = [];
    if (searchTerm) {
      parts.push(`Search: "${searchTerm}"`);
    }
    if (statusFilter) {
      parts.push(`Status: ${getStatusLabel(statusFilter)}`);
    }
    // ✅ Always show month
    if (monthFilter) {
      parts.push(`Month: ${formatMonthDisplay(monthFilter)}`);
    }
    return parts;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading comp-off settings...</p>
        </div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">X</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button 
            onClick={fetchRequests} 
            className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Dashboard Header - Title on Left, Date and Filters on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Comp-off <span className="text-purple-600">Settings</span>
            </h1>
          </div>

          {/* Right side: Date + All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[150px]">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-sm" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-[150px] pl-9 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="h-8 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Month Filter - default current month */}
            <input
              type="month"
              value={monthFilter}
              onChange={handleMonthChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-[130px] h-8 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />

            {/* Refresh Button */}
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header - Only Title and Date */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Comp-off <span className="text-purple-600">Settings</span>
            </h1>
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-purple-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">
              <strong>{requests.length}</strong> records
            </span>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={handleMonthChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top KPI Stats Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div 
            className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === '' ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
            onClick={() => handleCardClick('total')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Records</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FiList className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{counts.total || 0}</div>
            <div className="mt-1 text-xs text-gray-500">total records</div>
          </div>

          <div 
            className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === 'pending' ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
            onClick={() => handleCardClick('pending')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FiClock className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{counts.pending || 0}</div>
            <div className="mt-1 text-xs text-gray-500">awaiting review</div>
          </div>

          <div 
            className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === 'approved' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
            onClick={() => handleCardClick('approved')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FiCheckCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{counts.approved || 0}</div>
            <div className="mt-1 text-xs text-gray-500">approved records</div>
          </div>

          <div 
            className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === 'rejected' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
            onClick={() => handleCardClick('rejected')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                <FiXCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{counts.rejected || 0}</div>
            <div className="mt-1 text-xs text-gray-500">rejected records</div>
          </div>
        </div>

        {/* ✅ Active Filter Indicator - Shows which filter is active */}
        <div className="mb-4 flex flex-wrap items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-xs">
          <span className="font-semibold text-purple-700">📅 Current Filters:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {getFilterSummary().map((item, index) => (
              <span key={index} className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium">
                {item}
              </span>
            ))}
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="ml-auto text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
            >
              <FiTrash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Main Records Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiList className="text-purple-600" /> Comp-off Settings List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage and configure comp-off settings</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-base font-semibold text-gray-700">No comp-off records found</p>
              <p className="text-sm text-gray-500 mt-1">
                {hasActiveFilters ? 'Try clearing filters' : 'No comp-off requests available'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Employee</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Leave Details</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Extra Day</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Status</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Requested On</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {requests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50 transition-all">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{request.employeeName || "N/A"}</div>
                          <div className="text-xs text-gray-500">{request.employeeId || "N/A"}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="px-2 py-0.5 text-xs font-medium capitalize bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                              {request.leaveType || request.leaveDetails?.leaveType || "Comp-off"}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {request.startDate ? formatDate(request.startDate) : request.leaveDetails?.startDate ? formatDate(request.leaveDetails.startDate) : "N/A"} 
                              {request.endDate && request.startDate !== request.endDate 
                                ? ` - ${formatDate(request.endDate)}` 
                                : request.leaveDetails?.endDate && request.leaveDetails?.startDate !== request.leaveDetails?.endDate
                                ? ` - ${formatDate(request.leaveDetails.endDate)}`
                                : ''}
                              <span className="ml-1 text-gray-400">({request.days || request.leaveDetails?.days || 0} days)</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-medium text-gray-900">
                            {request.extraDayDetails?.day || formatDate(request.extraDayDate)}
                          </div>
                          <div className="text-xs text-green-600 font-semibold">
                            +{request.extraDayDetails?.extraHours || 0} hrs 
                            <span className="text-gray-400 ml-1">({request.extraDayDetails?.totalHours || 8} total hrs)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                            {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {request.createdAt ? formatDateTime(request.createdAt) : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(request)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>
                            {request.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-all shadow-sm"
                                  title="Approve"
                                >
                                  <FaCheck size={14} />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all shadow-sm"
                                  title="Reject"
                                >
                                  <FaTimes size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {requests.map((request) => (
                  <div key={request._id} className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.employeeName || "N/A"}</h4>
                        <span className="text-xs text-gray-500">{request.employeeId || "N/A"}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600">
                      <div><span className="text-gray-400">Leave Type:</span> <span className="font-medium capitalize">{request.leaveType || request.leaveDetails?.leaveType || "Comp-off"}</span></div>
                      <div><span className="text-gray-400">Days:</span> <span className="font-medium">{request.days || request.leaveDetails?.days || 0}</span></div>
                      <div><span className="text-gray-400">Date:</span> <span className="font-medium">{request.startDate ? formatDate(request.startDate) : request.leaveDetails?.startDate ? formatDate(request.leaveDetails.startDate) : "N/A"}</span></div>
                      <div><span className="text-gray-400">Extra Day:</span> <span className="font-medium">{request.extraDayDetails?.day || formatDate(request.extraDayDate)}</span></div>
                      <div><span className="text-gray-400">Extra Hours:</span> <span className="font-semibold text-green-600">+{request.extraDayDetails?.extraHours || 0} hrs</span></div>
                      <div><span className="text-gray-400">Requested:</span> <span className="font-medium">{request.createdAt ? formatDateTime(request.createdAt) : "N/A"}</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleView(request)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-all"
                      >
                        View Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-gray-500">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Previous
              </button>
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    currentPage === page
                      ? "text-white bg-purple-600 border-purple-600 shadow-sm"
                      : "text-purple-600 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiList className="text-purple-600" /> Record Details
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiList className="text-purple-600" /> Employee Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ID:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeId}</span></div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiFileText className="text-green-600" /> Leave Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveType || selectedRequest.leaveDetails?.leaveType || "Comp-off"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Start:</span> <span className="font-medium text-gray-900">{selectedRequest.startDate ? formatDate(selectedRequest.startDate) : selectedRequest.leaveDetails?.startDate ? formatDate(selectedRequest.leaveDetails.startDate) : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">End:</span> <span className="font-medium text-gray-900">{selectedRequest.endDate ? formatDate(selectedRequest.endDate) : selectedRequest.leaveDetails?.endDate ? formatDate(selectedRequest.leaveDetails.endDate) : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Days:</span> <span className="font-medium text-gray-900">{selectedRequest.days || selectedRequest.leaveDetails?.days || 0}</span></div>
                  <div className="flex justify-between col-span-2"><span className="text-gray-500">Reason:</span> <span className="font-medium text-gray-900">{selectedRequest.reason || selectedRequest.leaveDetails?.reason || "N/A"}</span></div>
                </div>
              </div>

              {/* Extra Day Details */}
              {selectedRequest.extraDayDetails && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="text-blue-600" /> Extra Day Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails.day || formatDate(selectedRequest.extraDayDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Hours:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails.totalHours || 8} hrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Extra Hours:</span> <span className="font-medium text-green-600">+{selectedRequest.extraDayDetails.extraHours || 0} hrs</span></div>
                  </div>
                </div>
              )}

              {/* Request Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-purple-600" /> Request Info
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Requested:</span> <span className="font-medium text-gray-900">{formatDateTime(selectedRequest.createdAt)}</span></div>
                  {selectedRequest.status === "approved" && (
                    <>
                      <div className="flex justify-between"><span className="text-gray-500">Approved By:</span> <span className="font-medium text-gray-900">{selectedRequest.approvedBy || "Admin"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Approved At:</span> <span className="font-medium text-gray-900">{formatDateTime(selectedRequest.approvedAt)}</span></div>
                    </>
                  )}
                  {selectedRequest.status === "rejected" && selectedRequest.rejectedReason && (
                    <div className="flex justify-between col-span-2"><span className="text-gray-500">Rejected Reason:</span> <span className="font-medium text-red-600">{selectedRequest.rejectedReason}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Approve Request
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to approve this comp-off request?</p>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Leave:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveType || selectedRequest.leaveDetails?.leaveType || "Comp-off"}</span></div>
                  <div className="flex justify-between col-span-2"><span className="text-gray-500">Extra Day:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails?.day || formatDate(selectedRequest.extraDayDate)}</span></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setIsApproveModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmApprove} 
                  disabled={actionLoading} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiXCircle className="text-red-600" /> Reject Request
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to reject this comp-off request?</p>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Leave:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveType || selectedRequest.leaveDetails?.leaveType || "Comp-off"}</span></div>
                  <div className="flex justify-between col-span-2"><span className="text-gray-500">Extra Day:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails?.day || formatDate(selectedRequest.extraDayDate)}</span></div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Please provide reason for rejection..."
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setIsRejectModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReject} 
                  disabled={actionLoading} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{actionMessage}</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActionMessage("");
                }}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompOffSettings;