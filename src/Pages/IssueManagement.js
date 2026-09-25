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
  FaChevronUp,
  FaList
} from 'react-icons/fa';

const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ SEPARATE: view ke liye
  const [selectedIssue, setSelectedIssue] = useState(null);

  // ✅ SEPARATE: edit ke liye (naya state — yahi fix hai)
  const [editingIssue, setEditingIssue] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState(null);

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

    if (filters.priority) result = result.filter(issue => issue.priority === filters.priority);
    if (filters.status) result = result.filter(issue => issue.status === filters.status);
    if (filters.issueType) result = result.filter(issue => issue.issueType === filters.issueType);

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
    setFilters({ priority: '', status: '', issueType: '', searchTerm: '' });
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

  // ============================================
  // ✅ SUBMIT — CREATE + UPDATE (FIXED)
  // ============================================
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

      // ✅ FIXED: editingIssue check karo (selectedIssue nahi)
      if (isEditMode && editingIssue) {
        // ✅ PUT — UPDATE
        const response = await axios.put(
          `${API_BASE_URL}/employees/update-issue/${editingIssue._id}`,
          payload
        );

        if (response.data.success) {
          const updatedIssues = issues.map(issue =>
            issue._id === editingIssue._id ? response.data.data : issue
          );
          setIssues(updatedIssues);
          alert("Issue updated successfully!");
        }
      } else {
        // ✅ POST — CREATE
        const response = await axios.post(
          `${API_BASE_URL}/employees/raise-issue/${employeeId}`,
          payload
        );

        if (response.data.success) {
          setIssues([response.data.data, ...issues]);
          alert("Issue raised successfully!");
        }
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting issue:", error);
      const errMsg = error.response?.data?.message || "Failed to process issue. Please try again.";
      alert(errMsg);
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

  // ✅ Edit — separate state use karo
  const handleEdit = (issue) => {
    setEditingIssue(issue);        // ✅ editing state
    setSelectedIssue(null);        // ✅ view modal band karo
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
    setEditingIssue(null);         // ✅ reset
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
      'Open': { color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'In Progress': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'Resolved': { color: 'bg-green-100 text-green-700 border-green-200' },
      'Closed': { color: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    const statusInfo = statusMap[status] || statusMap['Open'];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status === 'Open' ? 'bg-blue-500' :
          status === 'In Progress' ? 'bg-yellow-500' :
          status === 'Resolved' ? 'bg-green-500' : 'bg-gray-500'
        }`}></span>
        {status || 'Open'}
      </span>
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSortAmountDown className="text-gray-400 opacity-50 text-xs" />;
    return sortConfig.direction === 'asc'
      ? <FaSortAmountUp className="text-blue-600 text-xs" />
      : <FaSortAmountDown className="text-blue-600 text-xs" />;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaList className="text-blue-600" /> My Issues
        </h1>
        <p className="text-sm text-gray-500">Track and manage your reported issues</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FaPlus size={14} /> Raise Issue
          </button>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 relative"
          >
            <FaFilter size={14} /> Filters
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
              <FaTimesCircle size={14} /> Clear
            </button>
          )}
        </div>

        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Total:</span>
          <span className="text-sm font-bold text-blue-600">{filteredIssues.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            placeholder="Search issues by title, description, or employee name..."
          />
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">All</option>
                {priorityLevels.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">All</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={filters.issueType}
                onChange={(e) => handleFilterChange('issueType', e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">All</option>
                {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full h-9 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredIssues.length === 0 && !loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-sm text-gray-500">
            {issues.length === 0 ? 'No issues raised yet.' : 'No issues match your filters.'}
          </p>
          <button
            onClick={() => {
              if (issues.length === 0) { resetForm(); setIsModalOpen(true); }
              else clearFilters();
            }}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {issues.length === 0 ? 'Raise Your First Issue' : 'Clear Filters'}
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaList className="text-blue-600" /> Issues List
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" onClick={() => handleSort('issueTitle')}>
                      <div className="flex items-center gap-1.5">Issue Title {getSortIcon('issueTitle')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" onClick={() => handleSort('issueType')}>
                      <div className="flex items-center justify-center gap-1.5">Type {getSortIcon('issueType')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" onClick={() => handleSort('priority')}>
                      <div className="flex items-center justify-center gap-1.5">Priority {getSortIcon('priority')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-center gap-1.5">Status {getSortIcon('status')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-blue-600" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center justify-center gap-1.5">Date {getSortIcon('createdAt')}</div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 text-sm">{issue.issueTitle}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {issue.issueDescription}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                          {issue.issueType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(issue.priority)}`}>
                          <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${getPriorityDot(issue.priority)}`}></span>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(issue.status)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setSelectedIssue(issue)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                            <FaEye size={14} />
                          </button>
                          <button onClick={() => handleEdit(issue)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
                            <FaEdit size={14} />
                          </button>
                          <button onClick={() => handleDelete(issue._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredIssues.map((issue) => (
              <div key={issue._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(issue.priority)} flex-shrink-0`}></div>
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{issue.issueTitle}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.issueDescription}</p>
                    </div>
                    <button onClick={() => toggleExpand(issue._id)} className="ml-2 p-1 text-gray-400">
                      {expandedIssue === issue._id ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      {issue.issueType}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    {getStatusBadge(issue.status)}
                    <span className="text-[10px] text-gray-400">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setSelectedIssue(issue)} className="flex-1 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5">
                      <FaEye size={12} /> View
                    </button>
                    <button onClick={() => handleEdit(issue)} className="flex-1 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center gap-1.5">
                      <FaEdit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(issue._id)} className="flex-1 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-1.5">
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>

                {expandedIssue === issue._id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-600 py-2 whitespace-pre-wrap">{issue.issueDescription}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Raise/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b z-10">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditMode ? 'Edit Issue' : 'Raise New Issue'}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Employee Name</label>
                  <input
                    name="employeeName"
                    value={formData.employeeName || employeeName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    placeholder="Enter your name"
                    disabled={!!employeeName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                  <input
                    name="department"
                    value={formData.department || department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    placeholder="Enter your department"
                    disabled={!!department}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="issueTitle"
                    value={formData.issueTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    placeholder="Brief title of the issue"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    rows="4"
                    placeholder="Detailed description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Issue Type</label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                  >
                    {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                  >
                    {priorityLevels.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="w-full sm:flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (isEditMode ? 'Update Issue' : 'Raise Issue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" /> Issue Details
              </h3>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Issue Title</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold">
                  {selectedIssue.issueTitle}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {selectedIssue.issueDescription}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">{selectedIssue.employeeName || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">{selectedIssue.department || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Issue Type</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                      {selectedIssue.issueType}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Priority</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {getStatusBadge(selectedIssue.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Raised On</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedIssue.adminRemark && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Admin Remark</label>
                  <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-gray-700">
                    {selectedIssue.adminRemark}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(selectedIssue)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 flex items-center justify-center gap-2"
                >
                  <FaEdit size={14} /> Edit
                </button>
                <button
                  onClick={() => { handleDelete(selectedIssue._id); setSelectedIssue(null); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <FaTrash size={14} /> Delete
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
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

export default IssueManagement;