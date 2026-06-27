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
  FaChevronDown,
  FaChevronUp
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
  const [expandedIssue, setExpandedIssue] = useState(null);

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
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employee-issues/${employeeId}`);
      if (response.data.success) {
        setIssues(response.data.data);
        setFilteredIssues(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...issues];

    if (filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase().trim();
      result = result.filter(issue =>
        issue.issueTitle.toLowerCase().includes(search) ||
        issue.issueDescription.toLowerCase().includes(search) ||
        (issue.employeeName && issue.employeeName.toLowerCase().includes(search))
      );
    }

    if (filters.priority) {
      result = result.filter(issue => issue.priority === filters.priority);
    }

    if (filters.status) {
      result = result.filter(issue => issue.status === filters.status);
    }

    if (filters.issueType) {
      result = result.filter(issue => issue.issueType === filters.issueType);
    }

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
        response = await axios.put(`${API_BASE_URL}/employees/update-issue/${selectedIssue._id}`, payload);
        if (response.data.success) {
          const updatedIssues = issues.map(issue =>
            issue._id === selectedIssue._id ? response.data.data : issue
          );
          setIssues(updatedIssues);
          alert("Issue updated successfully!");
        }
      } else {
        response = await axios.post(`${API_BASE_URL}/employees/raise-issue/${employeeId}`, payload);
        if (response.data.success) {
          setIssues([response.data.data, ...issues]);
          alert("Issue raised successfully!");
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

  const toggleExpand = (issueId) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId);
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

  const getPriorityDot = (priority) => {
    const colors = {
      'Low': 'bg-green-500',
      'Medium': 'bg-yellow-500',
      'High': 'bg-orange-500',
      'Critical': 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
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
    if (sortConfig.key !== key) return <FaSortAmountDown className="text-gray-400 opacity-50 text-xs" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortAmountUp className="text-blue-600 text-xs" /> : 
      <FaSortAmountDown className="text-blue-600 text-xs" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <main className="flex-1 p-3 sm:p-4 lg:p-8">
        <div className="w-full p-3 sm:p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-900 whitespace-nowrap">
                  My Issues
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center gap-1.5 sm:gap-2"
                >
                  <FaPlus className="text-xs sm:text-sm" /> 
                  <span className="hidden xs:inline">Raise Issue</span>
                  <span className="xs:hidden">Raise</span>
                </button>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1.5 sm:gap-2 relative"
                >
                  <FaFilter className="text-xs sm:text-sm" />
                  <span className="hidden xs:inline">Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 transition-all flex items-center gap-1"
                  >
                    <FaTimesCircle className="text-xs" /> 
                    <span className="hidden xs:inline">Clear</span>
                  </button>
                )}
              </div>

              <div className="flex items-center">
                <div className="px-2 sm:px-3 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500">Total:</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600">{filteredIssues.length}</span>
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="sm:hidden">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search issues..."
                />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          {isFilterOpen && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="text-left hidden sm:block">
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search..."
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    {priorityLevels.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select
                    value={filters.issueType}
                    onChange={(e) => handleFilterChange('issueType', e.target.value)}
                    className="w-full p-1.5 sm:p-2 border rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All</option>
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {getActiveFilterCount() > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {filters.priority && (
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs">
                      {filters.priority}
                      <button onClick={() => handleFilterChange('priority', '')} className="hover:text-blue-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs">
                      {filters.status}
                      <button onClick={() => handleFilterChange('status', '')} className="hover:text-green-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.issueType && (
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] sm:text-xs">
                      {filters.issueType}
                      <button onClick={() => handleFilterChange('issueType', '')} className="hover:text-purple-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-700 rounded-full text-[10px] sm:text-xs">
                      {filters.searchTerm.length > 15 ? filters.searchTerm.substring(0, 15) + '...' : filters.searchTerm}
                      <button onClick={() => handleFilterChange('searchTerm', '')} className="hover:text-gray-900">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredIssues.length === 0 && !loading ? (
            <div className="text-center py-8 sm:py-12">
              <FaExclamationTriangle className="mx-auto text-3xl sm:text-4xl text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">
                {issues.length === 0 ? 'No issues raised yet.' : 'No issues match your filters.'}
              </p>
              {issues.length === 0 ? (
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Raise Your First Issue
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on Mobile */}
              <div className="hidden md:block overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
                    <tr>
                      <th className="px-3 py-2.5 cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('issueTitle')}>
                        <div className="flex items-center gap-1.5">
                          Issue Title
                          {getSortIcon('issueTitle')}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('issueType')}>
                        <div className="flex items-center justify-center gap-1.5">
                          Type
                          {getSortIcon('issueType')}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('priority')}>
                        <div className="flex items-center justify-center gap-1.5">
                          Priority
                          {getSortIcon('priority')}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('status')}>
                        <div className="flex items-center justify-center gap-1.5">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center cursor-pointer hover:bg-blue-700/30 transition-colors" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center justify-center gap-1.5">
                          Date
                          {getSortIcon('createdAt')}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">{issue.issueTitle}</span>
                            <span className="text-xs text-gray-500 truncate max-w-[180px]">
                              {issue.issueDescription}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                            {issue.issueType}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {getStatusBadge(issue.status)}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-gray-500">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedIssue(issue)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => handleEdit(issue)}
                              className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-100"
                              title="Edit Issue"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(issue._id)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                              title="Delete Issue"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredIssues.map((issue) => (
                  <div key={issue._id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityDot(issue.priority)} flex-shrink-0`}></div>
                            <h4 className="font-bold text-gray-800 text-sm truncate">{issue.issueTitle}</h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.issueDescription}</p>
                        </div>
                        <button
                          onClick={() => toggleExpand(issue._id)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {expandedIssue === issue._id ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium border border-gray-200">
                          {issue.issueType}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        {getStatusBadge(issue.status)}
                        <span className="text-[10px] text-gray-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FaEye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleEdit(issue)}
                          className="flex-1 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FaEdit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(issue._id)}
                          className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <FaTrash size={12} /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded Description */}
                    {expandedIssue === issue._id && (
                      <div className="px-3 pb-3 border-t bg-gray-50">
                        <p className="text-xs text-gray-600 py-2 whitespace-pre-wrap">
                          {issue.issueDescription}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                          <div>
                            <span className="font-medium">Employee:</span> {issue.employeeName || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {issue.department || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              {filteredIssues.length > 0 && !loading && (
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center">
                  Showing {filteredIssues.length} of {issues.length} issues
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Raise/Edit Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-4 sm:p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-700">
                {isEditMode ? 'Edit Issue' : 'Raise New Issue'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Employee Name</label>
                  <input
                    name="employeeName"
                    value={formData.employeeName || employeeName}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter your name"
                    disabled={!!employeeName}
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Department</label>
                  <input
                    name="department"
                    value={formData.department || department}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                    placeholder="Enter your department"
                    disabled={!!department}
                  />
                </div>

                <div className="sm:col-span-2 text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="issueTitle"
                    value={formData.issueTitle}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>

                <div className="sm:col-span-2 text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows="4"
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Issue Type</label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-1.5 sm:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {priorityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-4 sm:p-6 bg-white rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 text-sm max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-700">Issue Details</h3>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-500 hover:text-gray-700 p-1">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2 text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Issue Title</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 font-bold text-sm">
                    {selectedIssue.issueTitle}
                  </div>
                </div>

                <div className="sm:col-span-2 text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Description</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 min-h-[60px] sm:min-h-[80px] text-sm whitespace-pre-wrap">
                    {selectedIssue.issueDescription}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Employee</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 text-sm">
                    {selectedIssue.employeeName || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Department</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 text-sm">
                    {selectedIssue.department || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Issue Type</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Priority</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Status</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs sm:text-sm font-medium text-gray-500">Raised On</label>
                  <div className="w-full p-2 bg-gray-50 border rounded-lg text-gray-700 text-sm">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
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