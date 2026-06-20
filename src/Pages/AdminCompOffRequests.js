import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaEye, FaSearch, FaExchangeAlt } from "react-icons/fa";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";

const AdminCompOffRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/leaves/all?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (monthFilter) {
        url += `&month=${monthFilter}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setRequests(response.data.requests || []);
        setCounts(response.data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setError("Failed to fetch comp-off requests");
      }
    } catch (err) {
      console.error("Error fetching comp-off requests:", err);
      setError(err.response?.data?.error || "Failed to fetch comp-off requests");
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
    setMonthFilter("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateDisplay = (dateString) => {
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
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
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
        `${API_BASE_URL}/leaves/compoff-status/${selectedRequest._id}`,
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
        `${API_BASE_URL}/leaves/compoff-status/${selectedRequest._id}`,
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

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading comp-off requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">X</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="mx-auto max-w-9xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <FaExchangeAlt className="text-purple-600" />
            Comp-off Requests Management
          </h1>
          <p className="text-sm text-gray-600">Manage all comp-off requests from employees</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FiFileText} label="Total Requests" value={counts.total || 0} color="indigo" />
          <StatCard icon={FiClock} label="Pending" value={counts.pending || 0} color="amber" />
          <StatCard icon={FiCheckCircle} label="Approved" value={counts.approved || 0} color="emerald" />
          <StatCard icon={FiXCircle} label="Rejected" value={counts.rejected || 0} color="rose" />
        </div>

        {/* Filters */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-500 left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or reason..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="month"
              value={monthFilter}
              onChange={handleMonthChange}
              className="px-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
            {(searchTerm || statusFilter || monthFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 border border-white/30 rounded-xl hover:bg-white/70"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-600">
            <span>Showing {requests.length} of {pagination.total || 0} records</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-blue-600">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Employee</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Leave Details</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Extra Day Details</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Status</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Requested On</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request._id} className="hover:bg-white/20 transition-colors">
                      {/* Employee */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-medium text-gray-800">{request.employeeName || "N/A"}</p>
                          <p className="text-[10px] text-gray-500">{request.employeeId || "N/A"}</p>
                        </div>
                      </td>
                      
                      {/* Leave Details */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-0.5 text-xs font-medium capitalize bg-blue-200 text-blue-700 rounded-full">
                            {request.leaveDetails?.leaveType || "N/A"}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {request.leaveDetails?.startDate ? formatDate(request.leaveDetails.startDate) : "N/A"} 
                            {request.leaveDetails?.endDate && request.leaveDetails?.startDate !== request.leaveDetails?.endDate 
                              ? ` - ${formatDate(request.leaveDetails.endDate)}` 
                              : ''}
                            <span className="ml-1 text-gray-400">({request.leaveDetails?.days || 0} days)</span>
                          </p>
                        </div>
                      </td>
                      
                      {/* Extra Day Details */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-medium text-gray-800">
                            {request.extraDayDetails?.day || formatDateDisplay(request.extraDayDate)}
                          </p>
                          <p className="text-[10px] text-green-600 font-semibold">
                            +{request.extraDayDetails?.extraHours || 0} hrs 
                            <span className="text-gray-400 ml-1">({request.extraDayDetails?.totalHours || 8} total hrs)</span>
                          </p>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                          {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "N/A"}
                        </span>
                      </td>
                      
                      {/* Requested On */}
                      <td className="px-3 py-2.5 text-center text-xs text-gray-700">
                        {request.createdAt ? formatDateTime(request.createdAt) : "N/A"}
                      </td>
                      
                      {/* Action */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(request)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <FaTimes size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center text-gray-500">
                      No comp-off requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-white/20 sm:flex-row">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 text-xs bg-white/50 border border-white/30 rounded-lg"
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
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-300 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
                >
                  Prev
                </button>
                {getPageNumbers().map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                      currentPage === page
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-300 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                <FaExchangeAlt className="text-purple-600" /> Request Details
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-500 text-xl hover:text-gray-700">×</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Employee Details</p>
                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedRequest.employeeName}</span></div>
                  <div><span className="text-gray-500">ID:</span> <span className="font-medium">{selectedRequest.employeeId}</span></div>
                </div>
              </div>

              {/* Leave Details */}
              {selectedRequest.leaveDetails && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-800">Leave Details (Comp-off Against)</p>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{selectedRequest.leaveDetails.leaveType}</span></div>
                    <div><span className="text-gray-600">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.leaveDetails.status)}`}>{selectedRequest.leaveDetails.status}</span></div>
                    <div><span className="text-gray-600">Start:</span> <span className="font-medium">{formatDate(selectedRequest.leaveDetails.startDate)}</span></div>
                    <div><span className="text-gray-600">End:</span> <span className="font-medium">{formatDate(selectedRequest.leaveDetails.endDate)}</span></div>
                    <div><span className="text-gray-600">Days:</span> <span className="font-medium">{selectedRequest.leaveDetails.days}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">Reason:</span> <span className="font-medium">{selectedRequest.leaveDetails.reason}</span></div>
                  </div>
                </div>
              )}

              {/* Extra Day Details */}
              {selectedRequest.extraDayDetails && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800">Extra Day Details (Comp-off For)</p>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div><span className="text-gray-600">Date:</span> <span className="font-medium">{selectedRequest.extraDayDetails.day || formatDateDisplay(selectedRequest.extraDayDetails.date)}</span></div>
                    <div><span className="text-gray-600">Total Hours:</span> <span className="font-medium">{selectedRequest.extraDayDetails.totalHours || 8} hrs</span></div>
                    <div><span className="text-gray-600">Extra Hours:</span> <span className="font-medium text-green-600">+{selectedRequest.extraDayDetails.extraHours || 0} hrs</span></div>
                  </div>
                </div>
              )}

              {/* Request Info */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Request Info</p>
                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                  <div><span className="text-gray-500">Requested:</span> <span className="font-medium">{formatDateTime(selectedRequest.createdAt)}</span></div>
                  {selectedRequest.status === "approved" && (
                    <>
                      <div><span className="text-gray-500">Approved By:</span> <span className="font-medium">{selectedRequest.approvedBy || "Admin"}</span></div>
                      <div><span className="text-gray-500">Approved At:</span> <span className="font-medium">{formatDateTime(selectedRequest.approvedAt)}</span></div>
                    </>
                  )}
                  {selectedRequest.status === "rejected" && selectedRequest.rejectedReason && (
                    <div className="col-span-2"><span className="text-gray-500">Rejected Reason:</span> <span className="font-medium text-red-600">{selectedRequest.rejectedReason}</span></div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Reason for Comp-off</p>
                <p className="mt-2 text-sm text-gray-600">{selectedRequest.reason}</p>
              </div>
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t">
              <button onClick={() => setIsViewModalOpen(false)} className="w-full px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="text-xl font-bold text-green-700 mb-4">Approve Comp-off Request</h3>
            <p className="text-gray-600 mb-2">Are you sure you want to approve this comp-off request?</p>
            <div className="p-3 mb-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Employee: <span className="font-medium text-gray-800">{selectedRequest.employeeName}</span></p>
              <p className="text-sm text-gray-500">Leave: <span className="font-medium text-gray-800 capitalize">{selectedRequest.leaveDetails?.leaveType}</span></p>
              <p className="text-sm text-gray-500">Extra Day: <span className="font-medium text-gray-800">{selectedRequest.extraDayDetails?.day || formatDateDisplay(selectedRequest.extraDayDate)}</span></p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsApproveModalOpen(false)} 
                className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmApprove} 
                disabled={actionLoading} 
                className="flex-1 py-2 text-sm text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-700 mb-4">Reject Comp-off Request</h3>
            <p className="text-gray-600 mb-2">Are you sure you want to reject this comp-off request?</p>
            <div className="p-3 mb-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Employee: <span className="font-medium text-gray-800">{selectedRequest.employeeName}</span></p>
              <p className="text-sm text-gray-500">Leave: <span className="font-medium text-gray-800 capitalize">{selectedRequest.leaveDetails?.leaveType}</span></p>
              <p className="text-sm text-gray-500">Extra Day: <span className="font-medium text-gray-800">{selectedRequest.extraDayDetails?.day || formatDateDisplay(selectedRequest.extraDayDate)}</span></p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Please provide reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsRejectModalOpen(false)} 
                className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject} 
                disabled={actionLoading} 
                className="flex-1 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{actionMessage}</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActionMessage("");
                }}
                className="w-full px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors"
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

export default AdminCompOffRequests;