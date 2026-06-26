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
  FaEdit
} from 'react-icons/fa';
import { FiFilter, FiCalendar, FiActivity, FiMapPin, FiTrendingUp } from 'react-icons/fi';
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

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Expense <span>Management</span>
            </h1>
            <p className="emp-dash__subtitle">
              Monitor and manage employee travel expenses and reimbursements.
            </p>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>
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
        {!loading && (
          <div className="emp-dash__stats">
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

        {/* Filters Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filter Expenses
              </h3>
              <p className="emp-dash__card-desc">Search by employee, ID, purpose, or filter by date</p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">

              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search employee, ID, purpose..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              </div>

              {/* Date Filter */}
              <div className="relative w-[150px]">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
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
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap">
                  <FaMoneyBillWave className="text-blue-600" /> ₹{kmRate}/km
                </span>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <input
                  type="number"
                  placeholder="New rate"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-16 bg-transparent border-none text-xs font-bold text-gray-700 focus:ring-0 p-0 placeholder:text-gray-500 placeholder:font-normal"
                />
                <button
                  onClick={handleUpdateRate}
                  disabled={isUpdatingRate || newRate === kmRate.toString()}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 disabled:text-gray-500 transition-colors uppercase tracking-wider"
                >
                  {isUpdatingRate ? <FaSync className="animate-spin" /> : 'Set'}
                </button>
                {rateMessage.text && (
                  <span className={`text-[9px] font-bold ml-1 ${rateMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
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
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">{error}</div>
        )}

        {/* Table Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__table-wrap">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="text-center">Designation</th>
                  <th className="text-center">Total Visits</th>
                  <th className="text-center">Total Distance</th>
                  <th className="text-center">Total Reimbursement</th>
                  <th className="text-right">Actions</th>
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
                        className="hover:bg-gray-55/60 transition-all group"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">
                              {group.employeeDetails?.name?.[0]?.toUpperCase() || 'E'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {group.employeeDetails?.name || 'UNKNOWN'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                ID: {group.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                            {group.employeeDetails?.role || 'Employee'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            {group.visitCount} Visits
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {group.totalKm} KM
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-bold text-gray-900 tabular-nums">
                            ₹{group.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleOpenModal(group)}
                            className="p-2 rounded-lg transition-all transform hover:scale-110 shadow-sm border border-gray-200 bg-white text-blue-600 hover:bg-blue-50"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
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
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
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

      {/* Detail Modal */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal animate-in fade-in duration-200">
          <div className="emp-dash__modal-panel bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-600">
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
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left border-r border-gray-200">Date</th>
                    <th className="px-4 py-3 text-left border-r border-gray-200">Purpose</th>
                    <th className="px-4 py-3 text-center border-r border-gray-200">KM</th>
                    <th className="px-4 py-3 text-right border-r border-gray-200">Rate</th>
                    <th className="px-4 py-3 text-center border-r border-gray-200">Outcome</th>
                    <th className="px-4 py-3 text-right border-r border-gray-200">Order</th>
                    <th className="px-4 py-3 text-right border-r border-gray-200">Upsell</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  {selectedGroup.records.map((rec, i) => (
                    <React.Fragment key={i}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs border-r border-gray-100">
                          {new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-gray-900 border-r border-gray-100">
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
                        <td className="px-4 py-3 text-center border-r border-gray-100 text-blue-600 font-semibold tabular-nums text-xs">
                          {rec.km}
                        </td>
                        <td className="px-4 py-3 text-right border-r border-gray-100 text-gray-500 text-[10px] font-bold whitespace-nowrap">
                          ₹{rec.rateApplied}/km
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span className="text-[10px] font-medium italic text-gray-500 max-w-[120px] truncate block mx-auto" title={rec.outcome}>
                            {rec.stops && rec.stops.length > 0 ? "Multiple Stops" : (rec.outcome ? `"${rec.outcome}"` : '-')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right border-r border-gray-100 text-blue-700 tabular-nums font-bold text-xs">
                          {rec.orderValue > 0 ? `₹${rec.orderValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right border-r border-gray-100 text-purple-600 tabular-nums font-bold text-xs">
                          {rec.upsellValue > 0 ? `₹${rec.upsellValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right bg-blue-50/30 text-blue-900 font-semibold tabular-nums text-xs">
                          ₹{rec.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                      
                      {/* Render Stop Sub-rows if they exist */}
                      {rec.stops && rec.stops.length > 0 && rec.stops.map((stop, sIndex) => (
                        <tr key={`stop-${i}-${sIndex}`} className="bg-gray-50/50 text-[10px] border-b border-gray-100 last:border-b-0">
                           <td className="px-4 py-2 border-r border-gray-200"></td>
                           <td className="px-4 py-2 border-r border-gray-200">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                               <span className="font-semibold text-gray-700">{stop.locationName}</span>
                             </div>
                           </td>
                           <td className="px-4 py-2 text-center border-r border-gray-200 text-blue-600 font-medium tabular-nums">
                             {stop.km > 0 ? stop.km : '-'}
                           </td>
                           <td className="px-4 py-2 border-r border-gray-200"></td>
                           <td className="px-4 py-2 text-center border-r border-gray-200 text-gray-500 font-medium italic truncate max-w-[120px]" title={stop.outcome}>
                             {stop.outcome || '-'}
                           </td>
                           <td className="px-4 py-2 text-right border-r border-gray-200 text-blue-700 tabular-nums">
                             {stop.orderValue > 0 ? `₹${stop.orderValue.toLocaleString()}` : '-'}
                           </td>
                           <td className="px-4 py-2 text-right border-r border-gray-200 text-purple-600 tabular-nums">
                             {stop.upsellValue > 0 ? `₹${stop.upsellValue.toLocaleString()}` : '-'}
                           </td>
                           <td className="px-4 py-2 bg-blue-50/10"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {selectedGroup.records.length === 0 && (
                <div className="py-20 text-center text-gray-500 italic font-medium text-sm">No individual logs available.</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="emp-dash__btn-outline w-auto px-4 py-2 mt-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllExpensives;