import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { FaEye, FaCheck, FaTimes, FaTrash, FaSearch, FaDownload, FaBuilding, FaUserTag } from 'react-icons/fa';
import { FiCalendar, FiCheckCircle, FiClock, FiDownload, FiFilter, FiList, FiTrash2, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ClaimedOTManagement.css';

const API_BASE_URL = 'http://localhost:5001';

export default function ClaimedOTManagement() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalClaims: 0,
    totalOTHours: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    employeeId: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Status update states
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'approved',
    rejectedReason: '',
    notes: ''
  });

  // Multiplier states per claim
  const [multipliers, setMultipliers] = useState({});

  // Toast notification state
  const [saveStatus, setSaveStatus] = useState('');
  const saveStatusTimeoutRef = React.useRef(null);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const showSaveStatus = (msg) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch claims
  useEffect(() => {
    fetchClaims();
  }, [currentPage, filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/employees/allotclaimed?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (filters.status !== 'all') url += `&status=${filters.status}`;
      if (filters.employeeId) url += `&employeeId=${filters.employeeId}`;
      if (filters.fromDate) url += `&fromDate=${filters.fromDate}`;
      if (filters.toDate) url += `&toDate=${filters.toDate}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setClaims(data.claims || []);
        setSummary(data.summary || {});
        
        // Extract unique departments and designations
        const depts = new Set();
        const designations = new Set();
        data.claims.forEach(claim => {
          if (claim.employeeDetails?.department) depts.add(claim.employeeDetails.department);
          if (claim.employeeDetails?.designation || claim.employeeDetails?.role) {
            designations.add(claim.employeeDetails.designation || claim.employeeDetails.role);
          }
        });
        setUniqueDepartments(Array.from(depts).sort());
        setUniqueDesignations(Array.from(designations).sort());
        
        // Initialize multipliers from localStorage
        const initialMultipliers = {};
        data.claims.forEach(claim => {
          const key = `otMultiplier_${claim._id}`;
          const saved = localStorage.getItem(key);
          initialMultipliers[claim._id] = saved ? parseFloat(saved) : 2;
        });
        setMultipliers(initialMultipliers);
      } else {
        setError(data.message || 'Failed to fetch claims');
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Error fetching claims');
      toast.error('Failed to load OT claims');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      employeeId: '',
      fromDate: '',
      toDate: '',
      search: ''
    });
    setFilterDepartment('');
    setFilterDesignation('');
    setCurrentPage(1);
  };

  // Calculate OT Amount (returns number - rounded to 2 decimal places)
  const calculateOTAmountNumber = (claim) => {
    const salaryPerMonth = claim.employeeDetails?.salaryPerMonth || 0;
    const otHours = claim.otHours || 0;
    const multiplier = multipliers[claim._id] || 2;
    
    if (!salaryPerMonth || !otHours) return 0;
    
    const dailySalary = salaryPerMonth / 26;
    const hourlyRate = dailySalary / 8;
    const otAmount = hourlyRate * multiplier * otHours;
    
    // Round to 2 decimal places
    return Math.round(otAmount * 100) / 100;
  };

  // Calculate OT Amount (returns formatted string)
  const calculateOTAmount = (claim) => {
    const amount = calculateOTAmountNumber(claim);
    return `₹${amount.toFixed(2)}`;
  };

  // Get multiplier value
  const getMultiplier = (claimId) => {
    return multipliers[claimId] || 2;
  };

  // Handle multiplier change
  const handleMultiplierChange = (claimId, value) => {
    const multiplier = parseFloat(value);
    setMultipliers(prev => ({ ...prev, [claimId]: multiplier }));
    localStorage.setItem(`otMultiplier_${claimId}`, multiplier);
  };

  // Export CSV
  const exportCSV = () => {
    if (claims.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Date',
      'OT Hours',
      'Multiplier',
      'OT Amount',
      'Reason',
      'Status',
      'Approved By',
      'Approved At'
    ];

    const rows = claims.map(claim => [
      claim.employeeId || '',
      claim.employeeName || '',
      claim.employeeDetails?.department || '',
      formatDate(claim.date) || '',
      claim.otHours || 0,
      `${getMultiplier(claim._id)}x`,
      calculateOTAmount(claim),
      claim.reason || '',
      claim.status || '',
      claim.approvedBy || '',
      claim.approvedAt ? formatDate(claim.approvedAt) : ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `OT_Claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSaveStatus('✅ CSV exported successfully!');
  };

  // Handle status update with OT amount and multiplier
  const handleStatusUpdate = async () => {
    try {
      // Calculate OT amount for the selected claim (rounded to 2 decimal places)
      const otAmount = calculateOTAmountNumber(selectedClaim);
      const multiplier = getMultiplier(selectedClaim._id);

      const payload = {
        status: statusUpdate.status,
        rejectedReason: statusUpdate.status === 'rejected' ? statusUpdate.rejectedReason : undefined,
        notes: statusUpdate.notes || undefined,
        otAmount: otAmount,
        multiplier: multiplier
      };

      const response = await fetch(`${API_BASE_URL}/api/employees/update-otclaimedstatus/${selectedClaim._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus(`✅ Claim ${statusUpdate.status} successfully! OT Amount: ₹${otAmount.toFixed(2)} at ${multiplier}x`);
        setShowStatusModal(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/delete-claim/${selectedClaim._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus('✅ Claim deleted successfully!');
        setShowDeleteModal(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(data.message || 'Failed to delete claim');
      }
    } catch (error) {
      console.error('Error deleting claim:', error);
      toast.error('Error deleting claim');
    }
  };

  const handleBulkAction = async (action, status) => {
    if (selectedClaims.length === 0) {
      toast.warning('Please select at least one claim');
      return;
    }

    try {
      let url = '';
      let body = {};

      if (action === 'status') {
        // Calculate total OT amount for selected claims (rounded to 2 decimal places)
        const selectedClaimsData = claims.filter(c => selectedClaims.includes(c._id));
        const totalOTAmount = selectedClaimsData.reduce((sum, claim) => {
          return sum + calculateOTAmountNumber(claim);
        }, 0);
        const multipliersData = {};
        selectedClaimsData.forEach(claim => {
          multipliersData[claim._id] = getMultiplier(claim._id);
        });

        url = `${API_BASE_URL}/api/employees/bulk-update-status`;
        body = {
          claimIds: selectedClaims,
          status: status,
          ...(status === 'rejected' && { rejectedReason: 'Bulk rejection' }),
          otAmount: Math.round(totalOTAmount * 100) / 100,
          multipliers: multipliersData
        };
      } else if (action === 'delete') {
        url = `${API_BASE_URL}/api/employees/bulk-delete`;
        body = { claimIds: selectedClaims };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus(`✅ ${data.message}`);
        setSelectedClaims([]);
        setSelectAll(false);
        setShowBulkActionModal(false);
        fetchClaims();
      } else {
        toast.error(data.message || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Error performing bulk action');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(claims.map(c => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectClaim = (claimId) => {
    if (selectedClaims.includes(claimId)) {
      setSelectedClaims(selectedClaims.filter(id => id !== claimId));
    } else {
      setSelectedClaims([...selectedClaims, claimId]);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = {
      pending: '🟡 Pending',
      approved: '🟢 Approved',
      rejected: '🔴 Rejected'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const total = summary.totalPages || 1;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(total, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading OT Claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Toast notification */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes('✅') ? 'bg-green-600 border-l-4 border-green-700' : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              OT <span className="text-blue-600">Claims</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and approve employee overtime claims
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
            <FiCalendar className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
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
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Claims</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiList className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={summary.totalClaims || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">total OT claims</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Hours</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <FiClock className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={summary.totalOTHours || 0} duration={1} decimals={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">total overtime hours</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FiClock className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={summary.pendingCount || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">awaiting approval</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FiCheckCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={summary.approvedCount || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">approved claims</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filters &amp; Actions
              </h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportCSV}
                disabled={claims.length === 0}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="text-xs" /> Export CSV ({claims.length})
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
              
              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Search Employee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="employeeId"
                    placeholder="Search ID or Name..."
                    value={filters.employeeId}
                    onChange={handleFilterChange}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex flex-col gap-1.5 relative" ref={departmentFilterRef}>
                <label className="text-xs font-medium text-gray-600">Department</label>
                <button
                  onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                  className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
                    filterDepartment 
                      ? 'border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FaBuilding className="text-gray-400" />
                    {filterDepartment || 'All Departments'}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                
                {showDepartmentFilter && (
                  <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div 
                      onClick={() => {
                        setFilterDepartment('');
                        setShowDepartmentFilter(false);
                      }}
                      className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                    >
                      All Departments
                    </div>
                    {uniqueDepartments.map(dept => (
                      <div 
                        key={dept}
                        onClick={() => {
                          setFilterDepartment(dept);
                          setShowDepartmentFilter(false);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
                          filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Designation Filter */}
              <div className="flex flex-col gap-1.5 relative" ref={designationFilterRef}>
                <label className="text-xs font-medium text-gray-600">Designation</label>
                <button
                  onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                  className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
                    filterDesignation 
                      ? 'border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FaUserTag className="text-gray-400" />
                    {filterDesignation || 'All Designations'}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                
                {showDesignationFilter && (
                  <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div 
                      onClick={() => {
                        setFilterDesignation('');
                        setShowDesignationFilter(false);
                      }}
                      className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                    >
                      All Designations
                    </div>
                    {uniqueDesignations.map(des => (
                      <div 
                        key={des}
                        onClick={() => {
                          setFilterDesignation(des);
                          setShowDesignationFilter(false);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
                          filterDesignation === des ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {des}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* From Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">To Date</label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
              <div className="text-xs text-gray-500 font-medium">
                Showing <strong>{claims.length}</strong> claims
              </div>
              <div className="flex gap-2">
                {(filters.status !== 'all' || filters.employeeId || filters.fromDate || filters.toDate || filterDepartment || filterDesignation) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <FiTrash2 /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedClaims.length > 0 && (
          <div className="p-4 mb-6 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <FiList className="text-blue-600" />
              {selectedClaims.length} claims selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkActionModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                Bulk Actions
              </button>
              <button
                onClick={() => setSelectedClaims([])}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Main Claims Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiList className="text-blue-600" /> OT Claims List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage and approve employee overtime claims</p>
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              No OT claims found matching current filter values.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Employee</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Date</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">OT Hours</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Multiplier</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">OT Amount</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Reason</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Status</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {claims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-gray-50 transition-all">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedClaims.includes(claim._id)}
                            onChange={() => handleSelectClaim(claim._id)}
                            className="w-4 h-4 rounded border-gray-300"
                            disabled={claim.status !== 'pending'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{claim.employeeName}</span>
                            <span className="text-gray-500">{claim.employeeId}</span>
                            <span className="text-gray-400 text-[10px]">{claim.employeeDetails?.department || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-gray-900">{formatDate(claim.date)}</div>
                          <div className="text-gray-500 text-[10px]">{formatTime(claim.date)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-orange-600">{claim.otHours}h</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={getMultiplier(claim._id)}
                            onChange={(e) => handleMultiplierChange(claim._id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900"
                          >
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                            <option value={2.5}>2.5x</option>
                            <option value={3}>3x</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-green-600">
                            {calculateOTAmount(claim)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="max-w-[150px] text-gray-600 truncate">
                            {claim.reason || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(claim.status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowDetailsModal(true);
                              }}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            {claim.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setStatusUpdate({ status: 'approved', rejectedReason: '', notes: '' });
                                    setShowStatusModal(true);
                                  }}
                                  className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-all shadow-sm"
                                  title="Update Status"
                                >
                                  <FaCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all shadow-sm"
                                  title="Delete"
                                >
                                  <FaTrash className="w-4 h-4" />
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
            </>
          )}
        </div>

            {/* Pagination */}
            {claims.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-2 pb-4 sm:flex-row px-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="p-2 text-sm border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-500">entries</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-1 text-sm border rounded-lg ${
                        currentPage === page
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(summary.totalPages || 1, p + 1))}
                    disabled={currentPage === (summary.totalPages || 1)}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === (summary.totalPages || 1)
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        

      {/* ==================== MODALS ==================== */}

      {/* Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 bg-white border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Claim Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedClaim(null);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-2 font-semibold text-gray-700">Employee Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedClaim.employeeName}</div>
                  <div><span className="font-medium">ID:</span> {selectedClaim.employeeId}</div>
                  <div><span className="font-medium">Department:</span> {selectedClaim.employeeDetails?.department || 'N/A'}</div>
                  <div><span className="font-medium">Email:</span> {selectedClaim.employeeDetails?.email || 'N/A'}</div>
                  <div><span className="font-medium">Salary/Month:</span> ₹{selectedClaim.employeeDetails?.salaryPerMonth?.toLocaleString() || '0'}</div>
                </div>
              </div>

              {/* Claim Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="mb-2 font-semibold text-gray-700">Claim Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Date:</span> {formatDate(selectedClaim.date)}</div>
                  <div><span className="font-medium">OT Hours:</span> <span className="font-bold text-orange-600">{selectedClaim.otHours}h</span></div>
                  <div><span className="font-medium">Multiplier:</span> {getMultiplier(selectedClaim._id)}x</div>
                  <div><span className="font-medium">OT Amount:</span> <span className="font-bold text-green-600">{calculateOTAmount(selectedClaim)}</span></div>
                  <div className="col-span-2"><span className="font-medium">Reason:</span> {selectedClaim.reason}</div>
                  <div className="col-span-2"><span className="font-medium">Status:</span> {getStatusBadge(selectedClaim.status)}</div>
                  {selectedClaim.status === 'approved' && (
                    <>
                      <div><span className="font-medium">Approved By:</span> {selectedClaim.approvedBy || 'Admin'}</div>
                      <div><span className="font-medium">Approved At:</span> {formatDate(selectedClaim.approvedAt)}</div>
                    </>
                  )}
                  {selectedClaim.status === 'rejected' && (
                    <div className="col-span-2">
                      <span className="font-medium">Rejected Reason:</span> {selectedClaim.rejectedReason || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Info */}
              {selectedClaim.attendanceDetails && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-2 font-semibold text-gray-700">Attendance Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Check In:</span> {formatTime(selectedClaim.attendanceDetails.checkInTime)}</div>
                    <div><span className="font-medium">Check Out:</span> {formatTime(selectedClaim.attendanceDetails.checkOutTime)}</div>
                    <div><span className="font-medium">Total Hours:</span> {selectedClaim.attendanceDetails.totalHours}h</div>
                    <div><span className="font-medium">Assigned Shift:</span> {selectedClaim.attendanceDetails.assignedShiftHours}h</div>
                    <div><span className="font-medium">Location:</span> {selectedClaim.attendanceDetails.onsite ? '🏢 Onsite' : '🏠 Remote'}</div>
                    <div><span className="font-medium">Distance:</span> {(selectedClaim.attendanceDetails.distance / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedClaim.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowStatusModal(true);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve/Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-2xl">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Update Claim Status</h2>
              <p className="text-sm text-gray-500">
                {selectedClaim.employeeName} - {formatDate(selectedClaim.date)}
              </p>
              <p className="text-sm text-green-600 font-medium">
                OT Amount: {calculateOTAmount(selectedClaim)} at {getMultiplier(selectedClaim._id)}x
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 mt-1 border rounded-lg"
                >
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              {statusUpdate.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <textarea
                    value={statusUpdate.rejectedReason}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, rejectedReason: e.target.value }))}
                    placeholder="Why is this claim being rejected?"
                    className="w-full p-2 mt-1 border rounded-lg"
                    rows="3"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes..."
                  className="w-full p-2 mt-1 border rounded-lg"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedClaim(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-2xl">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-red-600">Delete Claim</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete this OT claim?
              </p>
              <div className="p-3 mt-4 bg-gray-50 rounded-lg">
                <p><span className="font-medium">Employee:</span> {selectedClaim.employeeName}</p>
                <p><span className="font-medium">Date:</span> {formatDate(selectedClaim.date)}</p>
                <p><span className="font-medium">OT Hours:</span> {selectedClaim.otHours}h</p>
                <p><span className="font-medium">Multiplier:</span> {getMultiplier(selectedClaim._id)}x</p>
                <p><span className="font-medium">OT Amount:</span> {calculateOTAmount(selectedClaim)}</p>
                <p><span className="font-medium">Reason:</span> {selectedClaim.reason}</p>
              </div>
              <p className="mt-3 text-sm text-red-600">
                ⚠️ This action cannot be undone. Only pending claims can be deleted.
              </p>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClaim(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-2xl">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Bulk Actions</h2>
              <p className="text-sm text-gray-500">{selectedClaims.length} claims selected</p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => handleBulkAction('status', 'approved')}
                className="w-full p-3 text-left text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <FaCheck className="inline mr-2" /> Approve All
              </button>
              <button
                onClick={() => handleBulkAction('status', 'rejected')}
                className="w-full p-3 text-left text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <FaTimes className="inline mr-2" /> Reject All
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedClaims.length} claims?`)) {
                    handleBulkAction('delete', null);
                  }
                }}
                className="w-full p-3 text-left text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <FaTrash className="inline mr-2" /> Delete All
              </button>

              <button
                onClick={() => {
                  setShowBulkActionModal(false);
                }}
                className="w-full p-2 mt-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}