import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClipboardList,
  FaPlus,
  FaEye,
  FaTrash,
  FaEdit,
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaTimesCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaComment,
  FaSave,
  FaArrowLeft,
  FaSync
} from 'react-icons/fa';

const AdminIssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    issueType: '',
    searchTerm: '',
    employeeId: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Update form data
  const [updateForm, setUpdateForm] = useState({
    status: 'Open',
    adminRemark: ''
  });

  const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const issueTypes = ['Technical', 'HR', 'Facility', 'IT Support', 'Finance', 'Other'];
  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    fetchAllIssues();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [issues, filters, sortConfig]);

  const fetchAllIssues = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-all-issues`);
      if (response.data.success) {
        setIssues(response.data.data || []);
        setFilteredIssues(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      alert("Failed to fetch issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...issues];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase().trim();
      result = result.filter(issue =>
        issue.issueTitle.toLowerCase().includes(search) ||
        issue.issueDescription.toLowerCase().includes(search) ||
        (issue.employeeName && issue.employeeName.toLowerCase().includes(search)) ||
        (issue.employeeId && issue.employeeId.toLowerCase().includes(search))
      );
    }

    // Apply employee ID filter
    if (filters.employeeId.trim()) {
      const empId = filters.employeeId.trim().toLowerCase();
      result = result.filter(issue =>
        issue.employeeId && issue.employeeId.toLowerCase().includes(empId)
      );
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(issue => issue.priority === filters.priority);
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(issue => issue.status === filters.status);
    }

    // Apply issue type filter
    if (filters.issueType) {
      result = result.filter(issue => issue.issueType === filters.issueType);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredIssues(result);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      priority: '',
      status: '',
      issueType: '',
      searchTerm: '',
      employeeId: ''
    });
    setSortConfig({ key: 'createdAt', direction: 'desc' });
    setIsFilterOpen(false);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priority) count++;
    if (filters.status) count++;
    if (filters.issueType) count++;
    if (filters.searchTerm.trim()) count++;
    if (filters.employeeId.trim()) count++;
    return count;
  };

  const handleUpdateClick = (issue) => {
    setSelectedIssue(issue);
    setUpdateForm({
      status: issue.status || 'Open',
      adminRemark: issue.adminRemark || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedIssue) return;

    setSubmitting(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/employees/update-issue/${selectedIssue._id}`,
        updateForm
      );

      if (response.data.success) {
        // Update the issue in the list
        const updatedIssues = issues.map(issue =>
          issue._id === selectedIssue._id ? response.data.data : issue
        );
        setIssues(updatedIssues);
        alert("Issue updated successfully!");
        setIsUpdateModalOpen(false);
        setSelectedIssue(null);
        setUpdateForm({ status: 'Open', adminRemark: '' });
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("Failed to update issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/employees/delete-issue/${issueId}`);
      if (response.data.success) {
        setIssues(issues.filter(issue => issue._id !== issueId));
        alert("Issue deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Failed to delete issue. Please try again.");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-green-100 text-green-700 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Critical': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Open': { icon: FaClock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'In Progress': { icon: FaSpinner, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'Resolved': { icon: FaCheckCircle, color: 'bg-green-100 text-green-700 border-green-200' },
      'Closed': { icon: FaTimes, color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    const statusInfo = statusMap[status] || statusMap['Open'];
    const Icon = statusInfo.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo.color}`}>
        <Icon size={10} /> {status || 'Open'}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Open': <FaUserClock className="text-blue-500" />,
      'In Progress': <FaSpinner className="text-yellow-500 animate-spin" />,
      'Resolved': <FaUserCheck className="text-green-500" />,
      'Closed': <FaUserTimes className="text-gray-500" />
    };
    return icons[status] || <FaUserClock className="text-blue-500" />;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSortAmountDown className="text-gray-400 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortAmountUp className="text-blue-600" /> : 
      <FaSortAmountDown className="text-blue-600" />;
  };

  const getStatusStats = () => {
    const stats = {
      total: issues.length,
      open: issues.filter(i => i.status === 'Open').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      resolved: issues.filter(i => i.status === 'Resolved').length,
      closed: issues.filter(i => i.status === 'Closed').length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Issue <span className="text-blue-600">Management</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and manage employee issues and requests
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
            <FaCalendarAlt className="text-blue-600" />
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
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Issues</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FaClipboardList className="text-base" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="mt-1 text-xs text-gray-500">all issues</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Open</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <FaClock className="text-base" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
              <div className="mt-1 text-xs text-gray-500">awaiting action</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">In Progress</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FaSpinner className="text-base" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="mt-1 text-xs text-gray-500">being worked on</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Resolved</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FaCheckCircle className="text-base" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
              <div className="mt-1 text-xs text-gray-500">completed</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Closed</span>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <FaTimesCircle className="text-base" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.closed}</div>
              <div className="mt-1 text-xs text-gray-500">archived</div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FaFilter className="text-blue-600" /> Filters &amp; Actions
                </h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isFilterOpen ? <FaTimesCircle /> : <FaFilter />} {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button
                  onClick={fetchAllIssues}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">

                  {/* Search */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Search</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaSearch className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Search issues..."
                      />
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Employee ID</label>
                    <input
                      type="text"
                      value={filters.employeeId}
                      onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                      className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g., TH029"
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Priorities</option>
                      {priorityLevels.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Issue Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Issue Type</label>
                    <select
                      value={filters.issueType}
                      onChange={(e) => handleFilterChange('issueType', e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      {issueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
                  <div className="text-xs text-gray-500 font-medium">
                    Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> issues
                  </div>
                  <div className="flex gap-2">
                    {getActiveFilterCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <FaTimesCircle /> Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Issues Container */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" /> All Issues
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage and track employee issues</p>
              </div>
            </div>

            {filteredIssues.length === 0 && !loading ? (
              <div className="py-12 text-center text-sm text-gray-500 font-medium">
                {issues.length === 0 ? 'No issues found.' : 'No issues match your filters.'}
                {issues.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
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
                        <th style={{ color: 'black' }} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('issueTitle')}>
                          <div className="flex items-center gap-2">Issue {getSortIcon('issueTitle')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('employeeId')}>
                          <div className="flex items-center gap-2">Employee {getSortIcon('employeeId')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('issueType')}>
                          <div className="flex items-center justify-center gap-2">Type {getSortIcon('issueType')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('priority')}>
                          <div className="flex items-center justify-center gap-2">Priority {getSortIcon('priority')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                          <div className="flex items-center justify-center gap-2">Status {getSortIcon('status')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                          <div className="flex items-center justify-center gap-2">Date {getSortIcon('createdAt')}</div>
                        </th>
                        <th style={{ color: 'black' }} className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs">
                      {filteredIssues.map((issue) => (
                        <tr key={issue._id} className="hover:bg-gray-50 transition-all">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{issue.issueTitle}</span>
                              <span className="text-gray-500 truncate max-w-[180px]">{issue.issueDescription}</span>
                              {issue.adminRemark && (
                                <span className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1">
                                  <FaComment size={8} /> Admin: {issue.adminRemark}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{issue.employeeId || 'N/A'}</span>
                              <span className="text-gray-500">{issue.employeeName || ''}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                              {issue.issueType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(issue.status)}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedIssue(issue)}
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                                title="View Details"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateClick(issue)}
                                className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-all shadow-sm"
                                title="Update Issue"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(issue._id)}
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all shadow-sm"
                                title="Delete Issue"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {loading && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                              <p className="text-gray-500 text-xs font-medium">Loading issues...</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>


      {/* Update Issue Modal */}
      {isUpdateModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaEdit className="text-blue-600" /> Update Issue
              </h3>
              <button 
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedIssue(null);
                  setUpdateForm({ status: 'Open', adminRemark: '' });
                }} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Employee</span>
                  <div className="font-semibold text-gray-800">{selectedIssue.employeeId || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Title</span>
                  <div className="font-semibold text-gray-800 truncate">{selectedIssue.issueTitle}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-xs"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="text-left">
                <label className="block mb-1.5 text-xs font-semibold text-gray-700">Admin Remark</label>
                <textarea
                  value={updateForm.adminRemark}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, adminRemark: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-xs"
                  rows="3"
                  placeholder="Add admin remark or resolution notes..."
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedIssue(null);
                    setUpdateForm({ status: 'Open', adminRemark: '' });
                  }}
                  className="flex-1 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-3 h-3" /> Update Issue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssue && !isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-3 border-b border-gray-100 z-10">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Issue Details
              </h3>
              <button onClick={() => setSelectedIssue(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Title</label>
                  <div className="w-full p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-gray-800 font-bold">
                    {selectedIssue.issueTitle}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[60px]">
                    {selectedIssue.issueDescription}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee ID</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-semibold">
                    {selectedIssue.employeeId || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee Name</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedIssue.employeeName || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {selectedIssue.department || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Type</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold border border-gray-200">
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Raised On</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Updated</label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {new Date(selectedIssue.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin Remark</label>
                  <div className="w-full p-2.5 bg-purple-50/50 border border-purple-100 rounded-lg text-gray-700 min-h-[50px]">
                    {selectedIssue.adminRemark || 'No admin remark yet.'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    handleUpdateClick(selectedIssue);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  <FaEdit className="w-3 h-3" /> Update Issue
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminIssueManagement;