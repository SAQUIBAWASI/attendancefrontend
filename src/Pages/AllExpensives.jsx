import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSync,
  FaEye,
  FaInfoCircle,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaBriefcase,
  FaUserTie,
  FaChevronDown,
  FaMapMarkerAlt,
  FaUser,
  FaChevronRight,
  FaCheckCircle,
  FaChevronUp,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { FiFilter, FiCalendar, FiActivity, FiMapPin, FiTrendingUp, FiTrash2 } from 'react-icons/fi';
import '../index.css';
import './EmployeeDashboard.css';

const AllExpensives = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // KM Rate State
  const [kmRate, setKmRate] = useState(0);
  const [newRate, setNewRate] = useState('');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [rateMessage, setRateMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAllExpenses();
    fetchKmRate();
  }, []);

  const fetchKmRate = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/expense/rate`);
      if (res.data.success) {
        setKmRate(res.data.rate);
        setNewRate(res.data.rate.toString());
      }
    } catch (err) {
      console.error("Failed to fetch rate:", err);
    }
  };

  const handleUpdateRate = async () => {
    if (!newRate || isNaN(newRate) || parseFloat(newRate) <= 0) {
      setRateMessage({ text: 'Invalid rate', type: 'error' });
      return;
    }

    setIsUpdatingRate(true);
    setRateMessage({ text: '', type: '' });
    try {
      const res = await axios.put(`${API_BASE_URL}/expense/rate`, { rate: parseFloat(newRate) });
      if (res.data.success) {
        setKmRate(res.data.rate);
        setRateMessage({ text: 'Rate updated!', type: 'success' });
        setTimeout(() => setRateMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setRateMessage({ text: 'Update failed', type: 'error' });
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const fetchAllExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/expense/all`);
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching all expenses:", error);
      setError("Failed to load expense records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit - Open Edit Modal
  const handleEditExpense = (expense) => {
    setEditingExpense({ ...expense });
    setIsEditModalOpen(true);
  };

  // ✅ FINAL FIXED: Handle Edit Submit - Force refresh from server
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updateData = {
        employeeId: editingExpense.employeeId,
        purpose: editingExpense.purpose,
        date: editingExpense.date,
        km: Number(editingExpense.km),
        rateApplied: Number(editingExpense.rateApplied),
        totalAmount: Number(editingExpense.totalAmount),
        orderValue: Number(editingExpense.orderValue) || 0,
        upsellValue: Number(editingExpense.upsellValue) || 0,
        remark: editingExpense.remark || '',
        outcome: editingExpense.outcome || '',
        stops: editingExpense.stops || []
      };

      console.log("📤 Sending update data:", updateData);

      const res = await axios.put(
        `${API_BASE_URL}/expense/edit/${editingExpense._id}`,
        updateData
      );

      console.log("📥 Update response:", res.data);

      if (res.data.success) {
        alert('✅ Expense updated successfully!');
        setIsEditModalOpen(false);
        setEditingExpense(null);
        
        // ✅ FORCE REFRESH FROM SERVER
        await fetchAllExpenses();
        
        // Close modal if open
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedGroup(null);
        }
        
      } else {
        alert('❌ Update failed!');
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete
  const handleDeleteExpense = async (expenseId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete this expense record for ${employeeName || 'Employee'}?`)) {
      setIsDeleting(true);
      try {
        const res = await axios.delete(`${API_BASE_URL}/expense/delete/${expenseId}`);
        if (res.data.success) {
          alert('✅ Expense deleted successfully!');
          await fetchAllExpenses();
          if (isModalOpen) {
            setIsModalOpen(false);
            setSelectedGroup(null);
          }
        }
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert('❌ Delete failed!');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle Edit from Modal
  const handleEditFromModal = (record) => {
    setIsModalOpen(false);
    setSelectedGroup(null);
    handleEditExpense(record);
  };

  // Handle Delete from Modal
  const handleDeleteFromModal = async (record) => {
    await handleDeleteExpense(record._id, selectedGroup?.employeeDetails?.name || 'Employee');
  };

  const handleOpenModal = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // 1. Filter original records
  const filteredRecords = expenses.filter(exp => {
    const query = searchQuery.toLowerCase();
    const empName = (exp.employeeDetails?.name || '').toLowerCase();
    const empId = (exp.employeeId || '').toLowerCase();
    const purpose = (exp.purpose || '').toLowerCase();

    const matchesSearch = empName.includes(query) || empId.includes(query) || purpose.includes(query);

    let matchesDate = true;
    if (dateFilter) {
      const expDate = new Date(exp.date).toISOString().split('T')[0];
      matchesDate = expDate === dateFilter;
    }

    return matchesSearch && matchesDate;
  });

  // 2. Group filtered records by EmployeeId
  const groupedData = filteredRecords.reduce((acc, current) => {
    const empId = current.employeeId;
    if (!acc[empId]) {
      acc[empId] = {
        employeeId: empId,
        employeeDetails: current.employeeDetails,
        records: [],
        totalAmount: 0,
        totalKm: 0,
        visitCount: 0
      };
    }
    acc[empId].records.push(current);
    acc[empId].totalAmount += current.totalAmount || 0;
    acc[empId].totalKm += current.km || 0;
    acc[empId].visitCount += 1;
    return acc;
  }, {});

  const groupedExpenses = Object.values(groupedData).sort((a, b) => b.totalAmount - a.totalAmount);

  const totalGlobalSum = filteredRecords.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('');
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {/* Dashboard Header - Title on Left, Date and Filters on Right */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              Expense <span>Management</span>
            </h1>
          </div>

          {/* Right side: Date + All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[140px]">
              <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[140px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear search"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear date filter"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>

            {/* KM Rate Update */}
            <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2.5 py-1 bg-white whitespace-nowrap">
              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                <FaMoneyBillWave className="text-blue-600 text-[10px]" />
                ₹{kmRate}/km
              </span>
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input
                type="number"
                placeholder="Rate"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-12 bg-transparent border-none text-xs font-bold text-gray-700 focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
              />
              <button
                onClick={handleUpdateRate}
                disabled={isUpdatingRate || newRate === kmRate.toString()}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors uppercase tracking-wider"
              >
                {isUpdatingRate ? <FaSync className="animate-spin" /> : 'Set'}
              </button>
              {rateMessage.text && (
                <span className={`text-[9px] font-bold ${rateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {rateMessage.text}
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setDateFilter('');
                fetchAllExpenses();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaSync className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Clear Filters Button */}
            {(searchQuery || dateFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Expense <span className="text-indigo-600">Management</span>
          </h1>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            <span className="text-xs text-gray-500">
              <strong>{groupedExpenses.length}</strong> employees
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
                    placeholder="Search employee, ID, purpose..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">KM Rate</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                  <span className="text-sm font-bold text-gray-700">₹{kmRate}/km</span>
                  <input
                    type="number"
                    placeholder="New rate"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <button
                    onClick={handleUpdateRate}
                    disabled={isUpdatingRate || newRate === kmRate.toString()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                  >
                    {isUpdatingRate ? <FaSync className="animate-spin" /> : 'Set'}
                  </button>
                </div>
                {rateMessage.text && (
                  <span className={`text-xs font-bold ${rateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {rateMessage.text}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDateFilter('');
                      fetchAllExpenses();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FaSync className="w-4 h-4" />
                    Refresh
                  </button>
                  {(searchQuery || dateFilter) && (
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
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Employees</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiActivity className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {groupedExpenses.length}
              </div>
              <div className="emp-dash__stat-meta">with expenses</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Visits</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiMapPin className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {filteredRecords.length}
              </div>
              <div className="emp-dash__stat-meta">business visits</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Distance</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiMapPin className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {groupedExpenses.reduce((sum, g) => sum + g.totalKm, 0).toLocaleString()}
              </div>
              <div className="emp-dash__stat-meta">kilometers traveled</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Reimbursement</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FaMoneyBillWave className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                ₹{totalGlobalSum.toLocaleString()}
              </div>
              <div className="emp-dash__stat-meta">total amount</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">{error}</div>
        )}

        {/* Table Card */}
        <div className="emp-dash__card">
          <div className="overflow-x-auto">
            <table className="emp-dash__table min-w-[800px]">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Employee</th>
                  <th className="text-center whitespace-nowrap hidden sm:table-cell">Designation</th>
                  <th className="text-center whitespace-nowrap">Total Visits</th>
                  <th className="text-center whitespace-nowrap hidden md:table-cell">Total Distance</th>
                  <th className="text-center whitespace-nowrap">Total Reimbursement</th>
                  <th className="text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="emp-dash__spinner"></div>
                        <span className="text-sm font-medium text-gray-500">Loading expenses...</span>
                      </div>
                    </td>
                  </tr>
                ) : groupedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaMoneyBillWave className="text-4xl text-gray-300" />
                        <p className="text-gray-500 font-medium">No expense records found</p>
                        <p className="text-gray-400 text-xs">Try adjusting your filters or search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {groupedExpenses.map((group, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                        className="hover:bg-gray-50/60 transition-all group"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600 flex-shrink-0">
                              {group.employeeDetails?.name?.[0]?.toUpperCase() || 'E'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-xs">
                                {group.employeeDetails?.name || 'UNKNOWN'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                ID: {group.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center hidden sm:table-cell">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                            {group.employeeDetails?.role || 'Employee'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                            {group.visitCount} Visits
                          </span>
                        </td>
                        <td className="text-center hidden md:table-cell">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                            {group.totalKm} KM
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                            ₹{group.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenModal(group)}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-blue-600 hover:bg-blue-50"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (group.records && group.records.length > 0) {
                                  handleEditExpense(group.records[0]);
                                }
                              }}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-green-600 hover:bg-green-50"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (group.records && group.records.length > 0) {
                                  handleDeleteExpense(
                                    group.records[0]._id,
                                    group.employeeDetails?.name || 'Employee'
                                  );
                                }
                              }}
                              disabled={isDeleting}
                              className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && groupedExpenses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing <span className="text-gray-900 font-bold">{groupedExpenses.length}</span> employees with expenses
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Total: ₹{totalGlobalSum.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal - With Edit and Delete options for individual records */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 emp-dash-modal animate-in fade-in duration-200">
          <div className="emp-dash__modal-panel bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-600 flex-shrink-0">
                  {selectedGroup.employeeDetails?.name?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {selectedGroup.employeeDetails?.name || 'System User'}
                  </h2>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    ID: {selectedGroup.employeeId} • {selectedGroup.employeeDetails?.role || 'Employee'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Visits</p>
                  <p className="text-sm font-bold text-gray-900">{selectedGroup.visitCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reimbursement</p>
                  <p className="text-lg font-black text-blue-700 tabular-nums">₹{selectedGroup.totalAmount.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            <div className="emp-dash__modal-body overflow-y-auto p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-100 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-3 py-3 text-left border-r border-gray-200 whitespace-nowrap">Date</th>
                      <th className="px-3 py-3 text-left border-r border-gray-200 whitespace-nowrap">Purpose</th>
                      <th className="px-3 py-3 text-center border-r border-gray-200 whitespace-nowrap">KM</th>
                      <th className="px-3 py-3 text-right border-r border-gray-200 whitespace-nowrap hidden sm:table-cell">Rate</th>
                      <th className="px-3 py-3 text-center border-r border-gray-200 whitespace-nowrap hidden md:table-cell">Outcome</th>
                      <th className="px-3 py-3 text-right border-r border-gray-200 whitespace-nowrap hidden lg:table-cell">Order</th>
                      <th className="px-3 py-3 text-right border-r border-gray-200 whitespace-nowrap hidden lg:table-cell">Upsell</th>
                      <th className="px-3 py-3 text-right whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium">
                    {selectedGroup.records.map((rec, i) => (
                      <React.Fragment key={i}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3 whitespace-nowrap text-gray-500 text-xs border-r border-gray-100">
                            {new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-3 text-gray-900 border-r border-gray-100">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{rec.purpose}</span>
                              {rec.remark && <span className="text-[10px] text-gray-500 mt-1 italic">{rec.remark}</span>}
                              {rec.stops && rec.stops.length > 0 && (
                                <span className="text-[9px] inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded w-fit font-bold uppercase">
                                  {rec.stops.length} Stops
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center border-r border-gray-100 text-blue-600 font-semibold tabular-nums text-xs">
                            {rec.km}
                          </td>
                          <td className="px-3 py-3 text-right border-r border-gray-100 text-gray-500 text-[10px] font-bold whitespace-nowrap hidden sm:table-cell">
                            ₹{rec.rateApplied}/km
                          </td>
                          <td className="px-3 py-3 text-center border-r border-gray-100 hidden md:table-cell">
                            <span className="text-[10px] font-medium italic text-gray-500 max-w-[120px] truncate block mx-auto" title={rec.outcome}>
                              {rec.stops && rec.stops.length > 0 ? "Multiple Stops" : (rec.outcome ? `"${rec.outcome}"` : '-')}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right border-r border-gray-100 text-blue-700 tabular-nums font-bold text-xs hidden lg:table-cell">
                            {rec.orderValue > 0 ? `₹${rec.orderValue.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-3 text-right border-r border-gray-100 text-purple-600 tabular-nums font-bold text-xs hidden lg:table-cell">
                            {rec.upsellValue > 0 ? `₹${rec.upsellValue.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-3 text-right bg-blue-50/30 text-blue-900 font-semibold tabular-nums text-xs flex items-center justify-end gap-2">
                            <span>₹{rec.totalAmount.toLocaleString()}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleEditFromModal(rec)}
                                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                                title="Edit this record"
                              >
                                <FaEdit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteFromModal(rec)}
                                disabled={isDeleting}
                                className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                                title="Delete this record"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Render Stop Sub-rows if they exist */}
                        {rec.stops && rec.stops.length > 0 && rec.stops.map((stop, sIndex) => (
                          <tr key={`stop-${i}-${sIndex}`} className="bg-gray-50/50 text-[10px] border-b border-gray-100 last:border-b-0">
                             <td className="px-3 py-2 border-r border-gray-200"></td>
                             <td className="px-3 py-2 border-r border-gray-200">
                               <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                 <span className="font-semibold text-gray-700 text-xs">{stop.locationName}</span>
                               </div>
                             </td>
                             <td className="px-3 py-2 text-center border-r border-gray-200 text-blue-600 font-medium tabular-nums">
                               {stop.km > 0 ? stop.km : '-'}
                             </td>
                             <td className="px-3 py-2 border-r border-gray-200 hidden sm:table-cell"></td>
                             <td className="px-3 py-2 text-center border-r border-gray-200 text-gray-500 font-medium italic truncate max-w-[120px] hidden md:table-cell" title={stop.outcome}>
                               {stop.outcome || '-'}
                             </td>
                             <td className="px-3 py-2 text-right border-r border-gray-200 text-blue-700 tabular-nums hidden lg:table-cell">
                               {stop.orderValue > 0 ? `₹${stop.orderValue.toLocaleString()}` : '-'}
                             </td>
                             <td className="px-3 py-2 text-right border-r border-gray-200 text-purple-600 tabular-nums hidden lg:table-cell">
                               {stop.upsellValue > 0 ? `₹${stop.upsellValue.toLocaleString()}` : '-'}
                             </td>
                             <td className="px-3 py-2 bg-blue-50/10"></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedGroup.records.length === 0 && (
                <div className="py-20 text-center text-gray-500 italic font-medium text-sm">No individual logs available.</div>
              )}
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="emp-dash__btn-outline w-auto px-4 py-2 mt-0 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Edit Expense Record</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editingExpense.employeeId || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingExpense.date ? new Date(editingExpense.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={editingExpense.purpose || ''}
                  onChange={(e) => setEditingExpense({...editingExpense, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">KM</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingExpense.km || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, km: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rate Applied</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingExpense.rateApplied || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, rateApplied: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.totalAmount || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, totalAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Outcome</label>
                <input
                  type="text"
                  value={editingExpense.outcome || ''}
                  onChange={(e) => setEditingExpense({...editingExpense, outcome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Order Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.orderValue || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, orderValue: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upsell Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.upsellValue || ''}
                    onChange={(e) => setEditingExpense({...editingExpense, upsellValue: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Remark</label>
                <textarea
                  value={editingExpense.remark || ''}
                  onChange={(e) => setEditingExpense({...editingExpense, remark: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <FaSync className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpensives;