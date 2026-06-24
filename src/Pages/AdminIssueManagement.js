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
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full p-6 bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <FaClipboardList className="text-blue-600" />
                All Issues
              </h2>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 relative"
              >
                <FaFilter />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-all flex items-center gap-1"
                >
                  <FaTimesCircle /> Clear
                </button>
              )}
              <button
                onClick={fetchAllIssues}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all flex items-center gap-1"
              >
                <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Total:</span>
              <span className="text-lg font-bold text-blue-600">{stats.total}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaClipboardList className="text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total</span>
              </div>
              <span className="text-xl font-bold text-blue-700">{stats.total}</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaClock className="text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Open</span>
              </div>
              <span className="text-xl font-bold text-blue-700">{stats.open}</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">In Progress</span>
              </div>
              <span className="text-xl font-bold text-yellow-700">{stats.inProgress}</span>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm font-medium text-green-600">Resolved</span>
              </div>
              <span className="text-xl font-bold text-green-700">{stats.resolved}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaTimesCircle className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Closed</span>
              </div>
              <span className="text-xl font-bold text-gray-700">{stats.closed}</span>
            </div>
          </div>

          {/* Filter Bar */}
          {isFilterOpen && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-left">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search issues..."
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={filters.employeeId}
                    onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., TH029"
                  />
                </div>

                <div className="text-left">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Priorities</option>
                    {priorityLevels.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Issue Type</label>
                  <select
                    value={filters.issueType}
                    onChange={(e) => handleFilterChange('issueType', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Types</option>
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {getActiveFilterCount() > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {filters.employeeId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      Employee: {filters.employeeId}
                      <button onClick={() => handleFilterChange('employeeId', '')} className="hover:text-indigo-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.priority && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Priority: {filters.priority}
                      <button onClick={() => handleFilterChange('priority', '')} className="hover:text-blue-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Status: {filters.status}
                      <button onClick={() => handleFilterChange('status', '')} className="hover:text-green-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.issueType && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Type: {filters.issueType}
                      <button onClick={() => handleFilterChange('issueType', '')} className="hover:text-purple-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                      Search: {filters.searchTerm}
                      <button onClick={() => handleFilterChange('searchTerm', '')} className="hover:text-gray-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Issues Table */}
          {filteredIssues.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">
                {issues.length === 0 ? 'No issues found.' : 'No issues match your filters.'}
              </p>
              {issues.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full">
                <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('issueTitle')}>
                      <div className="flex items-center gap-2">
                        Issue
                        {getSortIcon('issueTitle')}
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('employeeId')}>
                      <div className="flex items-center gap-2">
                        Employee
                        {getSortIcon('employeeId')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('issueType')}>
                      <div className="flex items-center justify-center gap-2">
                        Type
                        {getSortIcon('issueType')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('priority')}>
                      <div className="flex items-center justify-center gap-2">
                        Priority
                        {getSortIcon('priority')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center gap-2">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center justify-center gap-2">
                        Date
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700">{issue.issueTitle}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {issue.issueDescription}
                          </span>
                          {issue.adminRemark && (
                            <span className="text-[10px] text-blue-600 mt-0.5 flex items-center gap-1">
                              <FaComment size={8} /> Admin: {issue.adminRemark}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{issue.employeeId || 'N/A'}</span>
                          <span className="text-xs text-gray-500">{issue.employeeName || ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                          {issue.issueType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(issue.status)}
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleUpdateClick(issue)}
                            className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100"
                            title="Update Issue"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(issue._id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                            title="Delete Issue"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {filteredIssues.length > 0 && !loading && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>
          )}
        </div>
      </main>

      {/* Update Issue Modal */}
      {isUpdateModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <FaEdit className="text-purple-600" />
                Update Issue
              </h3>
              <button 
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedIssue(null);
                  setUpdateForm({ status: 'Open', adminRemark: '' });
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Employee:</span>
                  <span className="font-medium text-gray-700 ml-1">{selectedIssue.employeeId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Title:</span>
                  <span className="font-medium text-gray-700 ml-1 truncate">{selectedIssue.issueTitle}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="text-left">
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="text-left">
                <label className="block mb-1 text-sm font-medium text-gray-700">Admin Remark</label>
                <textarea
                  value={updateForm.adminRemark}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, adminRemark: e.target.value }))}
                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Add admin remark or resolution notes..."
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedIssue(null);
                    setUpdateForm({ status: 'Open', adminRemark: '' });
                  }}
                  className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Update Issue
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Issue Details
              </h3>
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
                  <label className="block mb-1 text-sm font-medium text-gray-500">Employee ID</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 font-medium">
                    {selectedIssue.employeeId || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Employee Name</label>
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
                  <div className="w-full p-2 bg-gray-50 border rounded-lg">
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

                <div className="text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    {new Date(selectedIssue.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-sm font-medium text-gray-500">Admin Remark</label>
                  <div className="w-full p-2 bg-purple-50 border border-purple-200 rounded-lg text-gray-700 min-h-[50px]">
                    {selectedIssue.adminRemark || 'No admin remark yet.'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    handleUpdateClick(selectedIssue);
                  }}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <FaEdit /> Update Issue
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
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

export default AdminIssueManagement;