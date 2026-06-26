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
  FaSync
} from 'react-icons/fa';

const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    issueType: '',
    searchTerm: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    issueTitle: '',
    issueDescription: '',
    issueType: 'Technical',
    priority: 'Medium'
  });

  const employeeId = localStorage.getItem('employeeId');
  const employeeName = localStorage.getItem('employeeName') || '';
  const department = localStorage.getItem('department') || '';

  const issueTypes = ['Technical', 'HR', 'Facility', 'IT Support', 'Finance', 'Other'];
  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [issues, filters, sortConfig]);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!employeeId) {
        setError("Employee ID not found. Please login again.");
        setIssues([]);
        setFilteredIssues([]);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/employees/get-employee-issues/${employeeId}`);
      if (response.data.success) {
        setIssues(response.data.data || []);
        setFilteredIssues(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch issues");
        setIssues([]);
        setFilteredIssues([]);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      setError("Failed to load issues. Please check your connection.");
      setIssues([]);
      setFilteredIssues([]);
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
        (issue.employeeName && issue.employeeName.toLowerCase().includes(search))
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

      if (sortConfig.key === 'createdAt') {
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
      searchTerm: ''
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
    return count;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.issueTitle || !formData.issueDescription) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        employeeName: employeeName || formData.employeeName,
        department: department || formData.department
      };

      let response;
      if (isEditMode && selectedIssue) {
        // Try API call first, fallback to mock
        try {
          response = await axios.put(`${API_BASE_URL}/employees/update-issue/${selectedIssue._id}`, payload);
          if (response.data.success) {
            const updatedIssues = issues.map(issue =>
              issue._id === selectedIssue._id ? response.data.data : issue
            );
            setIssues(updatedIssues);
            alert("Issue updated successfully!");
          }
        } catch (apiError) {
          console.warn("API not available, using mock update:", apiError);
          // Mock update
          const updatedIssues = issues.map(issue =>
            issue._id === selectedIssue._id ? { ...issue, ...payload } : issue
          );
          setIssues(updatedIssues);
          alert("Issue updated successfully! (Mock Mode)");
        }
      } else {
        // Try API call first, fallback to mock
        try {
          response = await axios.post(`${API_BASE_URL}/employees/raise-issue/${employeeId}`, payload);
          if (response.data.success) {
            setIssues([response.data.data, ...issues]);
            alert("Issue raised successfully!");
          }
        } catch (apiError) {
          console.warn("API not available, using mock creation:", apiError);
          // Mock creation
          const mockIssue = {
            _id: Date.now().toString(),
            ...payload,
            status: 'Open',
            createdAt: new Date().toISOString()
          };
          setIssues([mockIssue, ...issues]);
          alert("Issue raised successfully! (Mock Mode - Backend not connected)");
        }
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting issue:", error);
      alert("Failed to process issue. Please try again.");
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

  const handleEdit = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      employeeName: issue.employeeName || '',
      department: issue.department || '',
      issueTitle: issue.issueTitle || '',
      issueDescription: issue.issueDescription || '',
      issueType: issue.issueType || 'Technical',
      priority: issue.priority || 'Medium'
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeName: '',
      department: '',
      issueTitle: '',
      issueDescription: '',
      issueType: 'Technical',
      priority: 'Medium'
    });
    setIsEditMode(false);
    setSelectedIssue(null);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              My <span className="text-blue-600">Issues</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Raise and track your issues and requests
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

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading issues...</p>
            </div>
          </div>
        ) : (
          <div className="w-full p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" /> My Issues
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage and track your issues</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FaPlus /> Raise Issue
                </button>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isFilterOpen ? <FaTimesCircle /> : <FaFilter />} {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button
                  onClick={fetchIssues}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
                <button
                  onClick={fetchIssues}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Filter Bar */}
            {isFilterOpen && (
              <div className="mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
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

          {filteredIssues.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">
                {issues.length === 0 ? 'No issues raised yet.' : 'No issues match your filters.'}
              </p>
              {issues.length === 0 ? (
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Raise Your First Issue
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th style={{ color: 'black' }} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('issueTitle')}>
                      <div className="flex items-center gap-2">Issue {getSortIcon('issueTitle')}</div>
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
                            onClick={() => handleEdit(issue)}
                            className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-all shadow-sm"
                            title="Edit Issue"
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
                      <td colSpan="6" className="p-8 text-center">
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
          )}

          {/* Pagination or Summary */}
          {filteredIssues.length > 0 && !loading && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>
          )}
          </div>
        )}
      </div>

      {/* Raise/Edit Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-8 bg-white border border-blue-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaPlus className="text-blue-600" /> {isEditMode ? 'Edit Issue' : 'Raise New Issue'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Employee Name</label>
                  <input
                    name="employeeName"
                    value={formData.employeeName || employeeName}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all text-xs"
                    placeholder="Enter your name"
                    disabled={!!employeeName}
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Department</label>
                  <input
                    name="department"
                    value={formData.department || department}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition-all text-xs"
                    placeholder="Enter your department"
                    disabled={!!department}
                  />
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Issue Title <span className="text-red-500">*</span></label>
                  <input
                    name="issueTitle"
                    value={formData.issueTitle}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Issue Description <span className="text-red-500">*</span></label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-xs"
                    rows="4"
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Issue Type</label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-xs"
                  >
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-2 text-xs font-semibold text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-xs"
                  >
                    {priorityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    isEditMode ? 'Update Issue' : 'Raise Issue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-700">Issue Details</h3>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Issue Title</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 font-bold">
                    {selectedIssue.issueTitle}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Description</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 min-h-[80px]">
                    {selectedIssue.issueDescription}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Employee</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    {selectedIssue.employeeName || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Department</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    {selectedIssue.department || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Issue Type</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Priority</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Status</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Raised On</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueManagement;