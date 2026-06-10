import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt, FaEye, FaInfoCircle } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";

const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [publicHolidays, setPublicHolidays] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal & Form State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "casual",
    startDate: "",
    endDate: "",
    days: 0,
    reason: "",
  });

  // Permission Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);

  // Comp-off Request Modal State
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [submittingCompOff, setSubmittingCompOff] = useState(false);
  const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
  const [compOffRequestData, setCompOffRequestData] = useState({
    workDate: "",
    reason: ""
  });

  // Comp-off summary data from API
  const [compOffSummary, setCompOffSummary] = useState({
    totalCompOff: 0,
    usedCompOffCount: 0,
    remainingCompOffCount: 0,
    records: [],
    validityFrom: null,
    validityTo: null,
    isValidPeriod: false,
    status: "inactive"
  });
  
  // Track which leaves already have comp-off requests
  const [compOffRequests, setCompOffRequests] = useState([]);
  
  // Maximum comp-off requests allowed (from API or default)
  const [maxCompOffRequests, setMaxCompOffRequests] = useState(2);
  
  // Comp-off Requests Modal State
  const [isCompOffRequestsModalOpen, setIsCompOffRequestsModalOpen] = useState(false);

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId = null;
    let employeeName = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.employeeName || employeeData.name;
    } catch (err) {
      setError("❌ Invalid employee data in localStorage.");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("❌ Employee ID not found in employeeData.");
      setLoading(false);
      return;
    }

    setLeaveFormData(prev => ({
      ...prev,
      employeeId: employeeId,
      employeeName: employeeName
    }));

    fetchLeaves(employeeId);
    fetchLeaveBalances(employeeId);
    fetchCompOffSummary(employeeId);
    fetchPublicHolidays();
  }, []);

  // Fetch public holidays
  const fetchPublicHolidays = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/holidays/all`);
      setPublicHolidays(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching public holidays:", err);
    }
  };

  // Fetch leave balances
  const fetchLeaveBalances = async (employeeId) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/leaves/balances/${employeeId}`);
      if (resp.data && resp.data.success) {
        setLeaveBalances(resp.data.balances);
      }
    } catch (err) {
      console.error("Error fetching leave balances:", err);
    }
  };

  // Fetch leaves
  const fetchLeaves = async (employeeId) => {
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
      );

      if (resp.data && resp.data.success) {
        const sortedLeaves = (resp.data.records || []).sort((a, b) => 
          new Date(b.startDate) - new Date(a.startDate)
        );
        setLeaves(sortedLeaves);
        setFilteredLeaves(sortedLeaves);
      } else {
        setError("❌ Unexpected API response.");
      }
    } catch (err) {
      setError("❌ Failed to fetch leaves.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comp-off summary from API
  const fetchCompOffSummary = async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/employee/${employeeId}`);
      if (response.data && response.data.success) {
        setCompOffSummary({
          totalCompOff: response.data.totalCompOff || 0,
          usedCompOffCount: response.data.usedCompOffCount || 0,
          remainingCompOffCount: response.data.remainingCompOffCount || 0,
          records: response.data.records || [],
          validityFrom: response.data.validityFrom || null,
          validityTo: response.data.validityTo || null,
          isValidPeriod: response.data.isValidPeriod || false,
          status: response.data.status || "inactive"
        });
        
        if (response.data.totalCompOff) {
          setMaxCompOffRequests(response.data.totalCompOff);
        }
        
        setCompOffRequests(response.data.records || []);
      }
    } catch (error) {
      console.error("Error fetching comp-off summary:", error);
      setCompOffSummary({
        totalCompOff: 2,
        usedCompOffCount: 0,
        remainingCompOffCount: 2,
        records: [],
        validityFrom: null,
        validityTo: null,
        isValidPeriod: false,
        status: "inactive"
      });
      setCompOffRequests([]);
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if leave already has pending comp-off request
  const hasPendingCompOffRequest = (leaveId) => {
    return compOffRequests.some(req => 
      req.originalLeaveId?._id === leaveId && req.status === "pending"
    );
  };

  // Check if leave already has approved comp-off
  const hasApprovedCompOff = (leaveId) => {
    return compOffRequests.some(req => 
      req.originalLeaveId?._id === leaveId && req.status === "approved"
    );
  };
  
  // Check if employee can request more comp-offs
  const canRequestCompOff = (employeeId) => {
    const pendingRequests = compOffRequests.filter(req => 
      req.employeeId === employeeId && req.status === "pending"
    ).length;
    
    const approvedRequests = compOffRequests.filter(req => 
      req.employeeId === employeeId && req.status === "approved"
    ).length;
    
    const totalRequests = pendingRequests + approvedRequests;
    const remainingAllowed = compOffSummary.remainingCompOffCount;
    const isPeriodValid = compOffSummary.isValidPeriod && compOffSummary.status === "active";
    
    return {
      allowed: totalRequests < maxCompOffRequests && remainingAllowed > 0 && isPeriodValid,
      pending: pendingRequests,
      approved: approvedRequests,
      remaining: remainingAllowed,
      total: totalRequests,
      totalAllowed: maxCompOffRequests,
      isPeriodValid: isPeriodValid
    };
  };

  // Open Comp-off Request Modal
  const openCompOffRequestModal = (leave) => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeId = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      alert("❌ Employee data error");
      return;
    }
    
    const requestStatus = canRequestCompOff(employeeId);
    
    if (!requestStatus.allowed) {
      if (!requestStatus.isPeriodValid) {
        alert(`❌ Comp-off request period is not active.\n\n📅 Validity Period: ${formatDateDisplay(compOffSummary.validityFrom)} to ${formatDateDisplay(compOffSummary.validityTo)}\n\nPlease contact admin for more information.`);
      } else {
        alert(`❌ You have reached the maximum limit of ${maxCompOffRequests} comp-off request(s).\n\n📊 Current Status:\n• Total Allowed: ${maxCompOffRequests}\n• Pending: ${requestStatus.pending}\n• Approved: ${requestStatus.approved}\n• Remaining: ${requestStatus.remaining}\n• Total Used: ${requestStatus.total}\n\nPlease wait for existing requests to be processed before submitting new ones.`);
      }
      return;
    }
    
    setSelectedLeaveForCompOff(leave);
    setCompOffRequestData({
      workDate: "",
      reason: `Comp-off request for leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`
    });
    setIsCompOffModalOpen(true);
  };

  // Handle Comp-off Request Submit
  const handleCompOffRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCompOff(true);

    if (!compOffRequestData.workDate) {
      alert("❌ Please select work date");
      setSubmittingCompOff(false);
      return;
    }

    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeId = "";
    let employeeName = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.employeeName || employeeData.name;
    } catch (err) {
      alert("❌ Employee data error");
      setSubmittingCompOff(false);
      return;
    }
    
    const requestStatus = canRequestCompOff(employeeId);
    if (!requestStatus.allowed) {
      alert(`❌ You have reached the maximum limit of ${maxCompOffRequests} comp-off requests.`);
      setIsCompOffModalOpen(false);
      setSubmittingCompOff(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/comp-off-requests`, {
        employeeId: employeeId,
        employeeName: employeeName,
        originalLeaveId: selectedLeaveForCompOff._id,
        workDate: compOffRequestData.workDate,
        reason: compOffRequestData.reason,
        status: "pending"
      });

      if (response.status === 201) {
        alert("✅ Comp-off request submitted successfully!");
        setIsCompOffModalOpen(false);
        setSelectedLeaveForCompOff(null);
        fetchCompOffSummary(employeeId);
      }
    } catch (error) {
      console.error("Error submitting comp-off:", error);
      alert(error.response?.data?.error || "❌ Failed to submit comp-off request");
    } finally {
      setSubmittingCompOff(false);
    }
  };

  // Handle Permission Submit
  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try {
      if (rawData) employeeData = JSON.parse(rawData);
    } catch (e) { }

    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
    const durationNum = parseInt(permissionForm.duration);

    if (!id) {
      alert("❌ Employee ID not found. Please log out and log in again.");
      setPermissionLoading(false);
      return;
    }
    if (!permissionForm.reason || isNaN(durationNum)) {
      alert("❌ Please provide a valid reason and duration.");
      setPermissionLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/permissions/request`, {
        employeeId: id,
        employeeName: name,
        reason: permissionForm.reason,
        duration: durationNum,
      });
      if (res.status === 201) {
        alert("✅ Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setPermissionLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = leaves;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leaveType?.toLowerCase().includes(term) ||
        leave.reason?.toLowerCase().includes(term) ||
        leave.status?.toLowerCase().includes(term)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(leave => {
        const leaveDate = new Date(leave.startDate).toISOString().split("T")[0];
        return leaveDate === selectedDate;
      });
    }

    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(leave => {
        const d = new Date(leave.startDate);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedMonth, leaves]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedMonth("");
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        if (updated.startDate && updated.endDate) {
          const start = new Date(updated.startDate);
          const end = new Date(updated.endDate);
          const diffTime = end - start;
          const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
          updated.days = diffDays;
        }
      }
      return updated;
    });
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

    if (!id) {
      alert("❌ Employee details missing. Please re-login.");
      setSubmittingLeave(false);
      return;
    }

    const payload = {
      ...leaveFormData,
      employeeId: id,
      employeeName: name
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
      if (response.status === 201) {
        alert("✅ Leave application submitted successfully!");
        setLeaveFormData({
          employeeId: id,
          employeeName: name,
          leaveType: "casual",
          startDate: "",
          endDate: "",
          days: 0,
          reason: "",
        });
        setIsLeaveModalOpen(false);
        fetchLeaves(id);
      }
    } catch (error) {
      alert(error.response?.data?.message || "❌ Failed to submit leave application.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getCurrentEmployeeId = () => {
    try {
      const employeeDataRaw = localStorage.getItem("employeeData");
      if (employeeDataRaw) {
        const employeeData = JSON.parse(employeeDataRaw);
        return employeeData.employeeId;
      }
    } catch(e) {}
    return null;
  };
  
  const employeeId = getCurrentEmployeeId();
  const requestStatus = employeeId ? canRequestCompOff(employeeId) : { remaining: maxCompOffRequests, pending: 0, approved: 0, totalAllowed: maxCompOffRequests, isPeriodValid: false };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-9xl">
        
        {/* Glassmorphism Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-5">
          <div className="relative overflow-hidden bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full -mr-10 -mt-10"></div>
            <FiFileText className="text-2xl text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{leaves.length}</p>
            <p className="text-xs text-gray-600 font-medium">Total Leaves</p>
          </div>
          <div className="relative overflow-hidden bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
            <FiCheckCircle className="text-2xl text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{leaves.filter(l => l.status === "approved").length}</p>
            <p className="text-xs text-gray-600 font-medium">Approved</p>
          </div>
          <div className="relative overflow-hidden bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 rounded-full -mr-10 -mt-10"></div>
            <FiClock className="text-2xl text-amber-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{leaves.filter(l => l.status === "pending").length}</p>
            <p className="text-xs text-gray-600 font-medium">Pending</p>
          </div>
          <div className="relative overflow-hidden bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/20 rounded-full -mr-10 -mt-10"></div>
            <FiXCircle className="text-2xl text-rose-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{leaves.filter(l => l.status === "rejected").length}</p>
            <p className="text-xs text-gray-600 font-medium">Rejected</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full -mr-10 -mt-10"></div>
            <FaExchangeAlt className="text-2xl text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{requestStatus.pending + requestStatus.approved}/{maxCompOffRequests}</p>
            <p className="text-xs text-gray-600 font-medium">Comp-off</p>
          </div>
        </div>

        {/* Leave Balances Glass Cards */}
        {leaveBalances && (
          <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
            <div className="bg-white/20 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-3">
              <p className="text-xs text-gray-600 font-medium">Casual Leave</p>
              <p className="text-xl font-bold text-gray-800">{leaveBalances?.CL?.available || 0} <span className="text-xs font-normal text-gray-500">/ {leaveBalances?.CL?.total || 0}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${((leaveBalances?.CL?.used || 0) / (leaveBalances?.CL?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-3">
              <p className="text-xs text-gray-600 font-medium">Sick Leave</p>
              <p className="text-xl font-bold text-gray-800">{leaveBalances?.SL?.available || 0} <span className="text-xs font-normal text-gray-500">/ {leaveBalances?.SL?.total || 0}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${((leaveBalances?.SL?.used || 0) / (leaveBalances?.SL?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-3">
              <p className="text-xs text-gray-600 font-medium">Earned Leave</p>
              <p className="text-xl font-bold text-gray-800">{leaveBalances?.EL?.available || 0} <span className="text-xs font-normal text-gray-500">/ {leaveBalances?.EL?.total || 0}</span></p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${((leaveBalances?.EL?.used || 0) / (leaveBalances?.EL?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-3">
              <p className="text-xs text-gray-600 font-medium">Public Holidays</p>
              <p className="text-xl font-bold text-gray-800">{publicHolidays.length}</p>
              <p className="text-[10px] text-gray-500">{publicHolidays.filter(h => h.type === "National Holiday").length} National</p>
            </div>
          </div>
        )}

        {/* Comp-off Summary Glass Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-4 mb-5">
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-400/20 rounded-full -ml-20 -mt-20"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/20 rounded-full -mr-20 -mb-20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <FaExchangeAlt className="text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Comp-off Summary</h3>
            </div>
            <button
              onClick={() => setIsCompOffRequestsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all border border-purple-200"
            >
              <FaEye size={12} /> View Requests ({compOffRequests.length})
            </button>
          </div>
          
          {/* Validity Period Info */}
          {compOffSummary.validityFrom && compOffSummary.validityTo && (
            <div className={`mt-3 p-2 rounded-xl flex items-center gap-2 ${compOffSummary.isValidPeriod && compOffSummary.status === "active" ? 'bg-green-500/20 border border-green-300' : 'bg-red-500/20 border border-red-300'}`}>
              <FaInfoCircle className={`${compOffSummary.isValidPeriod && compOffSummary.status === "active" ? 'text-green-600' : 'text-red-600'}`} size={14} />
              <div className="flex-1">
                <p className="text-[10px] font-medium text-gray-600">Validity Period</p>
                <p className="text-xs font-semibold text-gray-800">
                  {formatDateDisplay(compOffSummary.validityFrom)} — {formatDateDisplay(compOffSummary.validityTo)}
                </p>
              </div>
              <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${compOffSummary.isValidPeriod && compOffSummary.status === "active" ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {compOffSummary.isValidPeriod && compOffSummary.status === "active" ? 'ACTIVE' : 'EXPIRED'}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl py-2">
              <div className="text-2xl font-bold text-purple-700">{compOffSummary.totalCompOff || 0}</div>
              <div className="text-[10px] text-gray-600">Total Allowed</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl py-2">
              <div className="text-2xl font-bold text-orange-600">{compOffSummary.usedCompOffCount || 0}</div>
              <div className="text-[10px] text-gray-600">Used / Pending</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl py-2">
              <div className="text-2xl font-bold text-green-600">{compOffSummary.remainingCompOffCount || 0}</div>
              <div className="text-[10px] text-gray-600">Remaining</div>
            </div>
          </div>
          
          {!requestStatus.isPeriodValid && (
            <div className="mt-3 text-[10px] text-red-600 bg-red-500/20 p-2 rounded-xl text-center">
              ⚠️ Comp-off requests are currently disabled. Validity period is {compOffSummary.isValidPeriod ? 'active but setting is inactive' : 'expired'}.
            </div>
          )}
        </div>

        {/* Glassmorphism Filters Section */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search by type, reason, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-3 py-2 text-sm bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <FaPlus className="text-xs" /> Apply Leave
            </button>

            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              <FaShieldAlt className="text-xs" /> Apply Permission
            </button>

            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
            </span>
            {filteredLeaves.length !== leaves.length && (
              <span className="font-semibold text-orange-600">🔍 Filters applied</span>
            )}
          </div>
        </div>

        {/* Glassmorphism Table Section with Original Green to Blue Gradient */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          {filteredLeaves.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
                {leaves.length === 0 ? "No leave records found." : "No records match your filters."}
              </p>
              {leaves.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Leave Type</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Start Date</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">End Date</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Days</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Reason</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Status</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Approved By</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Comp-off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {currentRecords.map((leave, index) => {
                      const hasPending = hasPendingCompOffRequest(leave._id);
                      const hasApproved = hasApprovedCompOff(leave._id);
                      
                      return (
                        <tr key={leave._id || index} className="hover:bg-white/20 transition-all duration-200">
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2 py-1 text-xs font-medium text-gray-700 capitalize bg-white/50 backdrop-blur-sm rounded-full">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center text-xs text-gray-700">{formatDate(leave.startDate)}</td>
                          <td className="px-3 py-2.5 text-center text-xs text-gray-700">{formatDate(leave.endDate)}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasApproved ? 'bg-purple-200 text-purple-700' : 'bg-blue-200 text-blue-700'}`}>
                              {leave.days}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center max-w-[150px]">
                            <span className="block text-xs text-gray-600 truncate">{leave.reason}</span>
                           </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              leave.status === "approved"
                                ? "bg-emerald-200 text-emerald-700 border border-emerald-300"
                                : leave.status === "rejected"
                                ? "bg-red-200 text-red-700 border border-red-300"
                                : "bg-amber-200 text-amber-700 border border-amber-300 animate-pulse"
                            }`}>
                              {leave.status}
                            </span>
                           </td>
                          <td className="px-3 py-2.5 text-center">
                            {leave.approvedBy ? (
                              <div className="text-xs">
                                <span className="font-semibold text-gray-700">{leave.approvedBy}</span>
                                <span className="block text-gray-500 text-[10px]">({leave.approvedByRole || 'Admin'})</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                           </td>
                          <td className="px-3 py-2.5 text-center">
                            {(leave.status === "approved" || leave.status === "manager_approved") ? (
                              hasApproved ? (
                                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-200 rounded-full">✅ Converted</span>
                              ) : hasPending ? (
                                <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-200 rounded-full">⏳ Requested</span>
                              ) : (
                                <button
                                  onClick={() => openCompOffRequestModal(leave)}
                                  disabled={!requestStatus.allowed}
                                  className={`flex items-center gap-1 px-2 py-1 mx-auto text-xs text-white transition rounded-xl ${
                                    requestStatus.allowed 
                                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg" 
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                  title={!requestStatus.allowed ? (requestStatus.isPeriodValid ? `Maximum ${maxCompOffRequests} comp-off requests reached` : "Comp-off validity period expired") : "Request comp-off for this leave"}
                                >
                                  <FaExchangeAlt size={10} /> Request
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                           </td>
                         </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLeaves.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-white/20 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">Show:</label>
                      <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of <strong>{filteredLeaves.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg"}`}>← Prev</button>
                    {getPageNumbers().map((page, index) => (
                      <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[32px] ${page === "..." ? "bg-gray-200 text-gray-500 cursor-default" : currentPage === page ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg" : "bg-white/50 text-gray-700 hover:bg-white/70"}`}>{page}</button>
                    ))}
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg"}`}>Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Glassmorphism Modals */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Apply for Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Leave Type</label>
                <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
                  <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
                  <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
                <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 text-sm bg-gray-100 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" rows="3" required></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Permission Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Request Permission</h3>
              <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handlePermissionSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea required className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-400" rows="3" value={permissionForm.reason} onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })} placeholder="Why do you need permission?"></textarea>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Duration (minutes)</label>
                <input type="number" required min="1" className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-400" value={permissionForm.duration} onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })} placeholder="e.g. 30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={permissionLoading} className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700">{permissionLoading ? "Submitting..." : "Request Permission"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comp-off Request Modal */}
      {isCompOffModalOpen && selectedLeaveForCompOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-700">Request Comp-off</h3>
              <button onClick={() => setIsCompOffModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-2 mb-3 rounded-xl bg-blue-100/50">
              <p className="text-xs text-gray-500">Leave Details</p>
              <p className="text-sm font-medium text-gray-800">{selectedLeaveForCompOff.leaveType} Leave</p>
              <p className="text-[11px] text-gray-500">{formatDate(selectedLeaveForCompOff.startDate)} - {formatDate(selectedLeaveForCompOff.endDate)}</p>
            </div>
            <div className="p-2 mb-3 rounded-xl bg-orange-100/50">
              <p className="text-[11px] text-orange-700 leading-snug"><strong>Limit:</strong> Max {maxCompOffRequests} | Used {requestStatus.total}<br />Remaining: {requestStatus.remaining}</p>
            </div>
            <form onSubmit={handleCompOffRequestSubmit} className="space-y-2">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Work Date *</label>
                <input name="workDate" type="date" value={compOffRequestData.workDate} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, workDate: e.target.value })} className="w-full p-2 text-xs bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400" required />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Reason</label>
                <textarea name="reason" value={compOffRequestData.reason} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, reason: e.target.value })} rows="2" className="w-full p-2 text-xs bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400" placeholder="Optional..."></textarea>
              </div>
              <div className="p-2 rounded-xl bg-purple-100/50">
                <p className="text-[11px] text-purple-700">Approval required before conversion to comp-off.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsCompOffModalOpen(false)} className="flex-1 py-2 text-xs text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={submittingCompOff} className="flex-1 py-2 text-xs text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:from-purple-600 hover:to-blue-600">{submittingCompOff ? "Submitting..." : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comp-off Requests List Modal */}
      {isCompOffRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-auto bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white/20 backdrop-blur-md border-b border-white/30">
              <div>
                <h3 className="text-lg font-bold text-purple-700">Comp-off Requests</h3>
                <p className="text-xs text-gray-600">Total: {compOffRequests.length} | Pending: {requestStatus.pending} | Approved: {requestStatus.approved}</p>
              </div>
              <button onClick={() => setIsCompOffRequestsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-4">
              {compOffRequests.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No comp-off requests found.</div>
              ) : (
                <div className="space-y-3">
                  {compOffRequests.map((request, idx) => (
                    <div key={request._id} className="p-3 bg-white/30 backdrop-blur-sm rounded-xl border border-white/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            request.status === "pending" ? "bg-yellow-200 text-yellow-700" : request.status === "approved" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                          }`}>{request.status}</span>
                          <span className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {request.count && <span className="text-xs font-medium text-purple-600">{request.count} day(s)</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-500">Leave Type:</span> <span className="ml-1 font-medium capitalize">{request.originalLeaveId?.leaveType || '-'}</span></div>
                        <div><span className="text-gray-500">Work Date:</span> <span className="ml-1 font-medium">{request.workDate ? formatDate(request.workDate) : '-'}</span></div>
                        <div><span className="text-gray-500">Leave Period:</span> <span className="ml-1 font-medium">{request.originalLeaveId?.startDate ? formatDate(request.originalLeaveId.startDate) : '-'}{request.originalLeaveId?.endDate ? ` - ${formatDate(request.originalLeaveId.endDate)}` : ''}</span></div>
                        <div><span className="text-gray-500">Converted:</span> <span className={`ml-1 font-medium ${request.convertedToCompOff ? 'text-green-600' : 'text-gray-500'}`}>{request.convertedToCompOff ? 'Yes' : 'No'}</span></div>
                      </div>
                      {request.reason && <div className="mt-2 text-xs"><span className="text-gray-500">Reason:</span><p className="mt-0.5 text-gray-700">{request.reason}</p></div>}
                      {request.approvedBy && <div className="mt-2 text-xs text-gray-500">Approved by: {request.approvedBy}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 p-4 bg-white/20 backdrop-blur-md border-t border-white/30">
              <button onClick={() => setIsCompOffRequestsModalOpen(false)} className="w-full px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:from-purple-600 hover:to-blue-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;