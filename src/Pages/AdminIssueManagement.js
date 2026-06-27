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
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Issue <span>Management</span>
            </h1>
            <p className="emp-dash__subtitle">
              View and manage employee issues, track status, and add remarks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllIssues}
              className="emp-dash__card-link"
            >
              <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Issues</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaClipboardList />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">in system</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Open</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.open}</div>
            <div className="emp-dash__stat-meta">awaiting action</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">In Progress</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FaSpinner />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.inProgress}</div>
            <div className="emp-dash__stat-meta">being worked on</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Resolved</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.resolved}</div>
            <div className="emp-dash__stat-meta">completed</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Closed</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FaTimesCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.closed}</div>
            <div className="emp-dash__stat-meta">archived</div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Filters</h3>
              <p className="emp-dash__card-desc">Filter issues by various criteria</p>
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="emp-dash__card-link"
            >
              {isFilterOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {isFilterOpen && (
            <div className="emp-dash__card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="emp-dash__month-input w-full pl-8"
                      placeholder="Search issues..."
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={filters.employeeId}
                    onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                    className="emp-dash__month-input w-full"
                    placeholder="e.g., TH029"
                  />
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="emp-dash__month-input w-full"
                  >
                    <option value="">All Priorities</option>
                    {priorityLevels.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="emp-dash__month-input w-full"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Issue Type</label>
                  <select
                    value={filters.issueType}
                    onChange={(e) => handleFilterChange('issueType', e.target.value)}
                    className="emp-dash__month-input w-full"
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
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] border border-indigo-200">
                      Employee: {filters.employeeId}
                      <button onClick={() => handleFilterChange('employeeId', '')} className="hover:text-indigo-900">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {filters.priority && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">
                      Priority: {filters.priority}
                      <button onClick={() => handleFilterChange('priority', '')} className="hover:text-blue-900">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] border border-green-200">
                      Status: {filters.status}
                      <button onClick={() => handleFilterChange('status', '')} className="hover:text-green-900">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {filters.issueType && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] border border-purple-200">
                      Type: {filters.issueType}
                      <button onClick={() => handleFilterChange('issueType', '')} className="hover:text-purple-900">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] border border-gray-200">
                      Search: {filters.searchTerm}
                      <button onClick={() => handleFilterChange('searchTerm', '')} className="hover:text-gray-900">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="emp-dash__btn-outline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Issues Table Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">All Issues</h3>
              <p className="emp-dash__card-desc">Detailed list of all employee issues</p>
            </div>
          </div>
          {filteredIssues.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center">
              <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {issues.length === 0 ? 'No issues found.' : 'No issues match your filters.'}
              </p>
              <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                {issues.length === 0 ? 'There are no issues in the system yet.' : 'Try adjusting your filter criteria to see more results.'}
              </p>
              {issues.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="emp-dash__btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('issueTitle')} className="cursor-pointer hover:bg-gray-200">
                        Issue {getSortIcon('issueTitle')}
                      </th>
                      <th onClick={() => handleSort('employeeId')} className="cursor-pointer hover:bg-gray-200">
                        Employee {getSortIcon('employeeId')}
                      </th>
                      <th onClick={() => handleSort('issueType')} className="cursor-pointer hover:bg-gray-200">
                        Type {getSortIcon('issueType')}
                      </th>
                      <th onClick={() => handleSort('priority')} className="cursor-pointer hover:bg-gray-200">
                        Priority {getSortIcon('priority')}
                      </th>
                      <th onClick={() => handleSort('status')} className="cursor-pointer hover:bg-gray-200">
                        Status {getSortIcon('status')}
                      </th>
                      <th onClick={() => handleSort('createdAt')} className="cursor-pointer hover:bg-gray-200">
                        Date {getSortIcon('createdAt')}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue._id}>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{issue.issueTitle}</span>
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
                        <td>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{issue.employeeId || 'N/A'}</span>
                            <span className="text-xs text-gray-500">{issue.employeeName || ''}</span>
                          </div>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                            {issue.issueType}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td>
                          {getStatusBadge(issue.status)}
                        </td>
                        <td>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedIssue(issue)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                              title="View Details"
                            >
                              <FaEye size={12} />
                            </button>
                            <button
                              onClick={() => handleUpdateClick(issue)}
                              className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100"
                              title="Update Issue"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(issue._id)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                              title="Delete Issue"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center">
                          <div className="emp-dash__spinner mx-auto"></div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredIssues.length > 0 && !loading && (
                <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                  Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> issues
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Update Issue Modal */}
      {isUpdateModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 emp-dash-modal">
          <div className="w-full max-w-lg emp-dash__modal-panel">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Update Issue</h3>
                <p className="emp-dash__card-desc">Update issue status and add admin remarks</p>
              </div>
              <button 
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedIssue(null);
                  setUpdateForm({ status: 'Open', adminRemark: '' });
                }} 
                className="emp-dash__card-link"
              >
                <FaTimes />
              </button>
            </div>

            <div className="emp-dash__card-body emp-dash__modal-body">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
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

              <form onSubmit={handleUpdateSubmit} className="space-y-3">
                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="emp-dash__month-input w-full"
                    required
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Admin Remark</label>
                  <textarea
                    value={updateForm.adminRemark}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, adminRemark: e.target.value }))}
                    className="emp-dash__month-input w-full"
                    rows="3"
                    placeholder="Add admin remark or resolution notes..."
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateModalOpen(false);
                      setSelectedIssue(null);
                      setUpdateForm({ status: 'Open', adminRemark: '' });
                    }}
                    className="emp-dash__btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="emp-dash__btn-primary-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="emp-dash__spinner inline-block w-3 h-3 mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave size={10} /> Update Issue
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssue && !isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 emp-dash-modal">
          <div className="w-full max-w-2xl emp-dash__modal-panel">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Issue Details</h3>
                <p className="emp-dash__card-desc">View complete issue information</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="emp-dash__card-link">
                <FaTimes />
              </button>
            </div>

            <div className="emp-dash__card-body emp-dash__modal-body space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Issue Title</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold text-xs">
                    {selectedIssue.issueTitle}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Description</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 min-h-[60px] text-xs">
                    {selectedIssue.issueDescription}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Employee ID</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium text-xs">
                    {selectedIssue.employeeId || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Employee Name</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs">
                    {selectedIssue.employeeName || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Department</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs">
                    {selectedIssue.department || 'N/A'}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Issue Type</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium border border-gray-200">
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Priority</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Raised On</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Last Updated</label>
                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs">
                    {new Date(selectedIssue.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Admin Remark</label>
                  <div className="w-full p-2 bg-purple-50 border border-purple-200 rounded-lg text-gray-700 min-h-[40px] text-xs">
                    {selectedIssue.adminRemark || 'No admin remark yet.'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    handleUpdateClick(selectedIssue);
                  }}
                  className="emp-dash__btn-primary-sm"
                >
                  <FaEdit size={10} /> Update Issue
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="emp-dash__btn-outline"
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