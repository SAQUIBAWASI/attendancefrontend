import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
    <div className="min-h-screen p-2 bg-gradient-to-br from-[#000000] to-[#0a0a0a] font-sans">
      <div className="mx-auto max-w-9xl">
        {/* Header Options / Filters Section (Mapped from UserActivity style) */}
        <div className="p-3 mb-3 bg-[#0a0a0a] rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search employee or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#374151] rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <FaTimes
                  className="absolute text-[12px] text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>

            {/* Date Filter */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                Date:
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-6 py-1.5 text-xs border border-[#374151] rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              {dateFilter && (
                <FaTimes
                  className="absolute text-[12px] text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-red-500"
                  onClick={() => setDateFilter("")}
                />
              )}
            </div>

            {/* KM Rate Update */}
            <div className="flex items-center gap-2 border border-[#374151] rounded-lg px-2 h-[30px] bg-[#000000]">
              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap">
                <FaMoneyBillWave className="text-green-500" /> ₹{kmRate}
              </span>
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input
                type="number"
                placeholder="New rate"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-14 bg-transparent border-none text-xs font-bold text-gray-300 focus:ring-0 p-0 placeholder:text-gray-400 placeholder:font-normal"
              />
              <button
                onClick={handleUpdateRate}
                disabled={isUpdatingRate || newRate === kmRate.toString()}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors uppercase tracking-wider"
              >
                {isUpdatingRate ? <FaSync className="animate-spin" /> : 'Set'}
              </button>
              {rateMessage.text && (
                <span className={`text-[9px] font-bold ml-1 ${rateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {rateMessage.text}
                </span>
              )}
            </div>

            {/* Global Sum Stats */}
            <div className="flex items-center gap-2 border border-blue-200 bg-blue-50 rounded-lg px-3 h-[30px]">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Total:</span>
              <span className="text-xs font-black text-blue-700 tabular-nums">₹{totalGlobalSum.toLocaleString()}</span>
            </div>

            {/* Refresh / Clear Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setDateFilter('');
                fetchAllExpenses();
              }}
              className="h-8 px-3 text-xs font-medium text-gray-400 transition bg-[#111111] border border-[#374151] rounded-md hover:bg-[#1f2937] flex items-center gap-1 cursor-pointer"
            >
              <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} /> Sync
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs font-bold">{error}</div>}

        {/* Expenses Table */}
        <div className="mb-6 overflow-hidden bg-[#0a0a0a] rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-[#0a0a0a] shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">EMPLOYEE</th>
                  <th className="py-2 text-center">DESIGNATION</th>
                  <th className="py-2 text-center">TOTAL VISITS</th>
                  <th className="py-2 text-center">TOTAL DISTANCE</th>
                  <th className="py-2 text-center">TOTAL REIMBURSEMENT</th>
                  <th className="py-2 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-[#0a0a0a] divide-y divide-[#1f2937]">
                {loading && expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-xs font-bold text-gray-400 tracking-widest">
                          PROCESSING DATA...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : groupedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-2 text-center">
                      <div className="py-10">
                        <FaMoneyBillWave className="text-gray-300 text-3xl mx-auto mb-2" />
                        <p className="text-gray-500 text-xs font-bold tracking-widest">NO RECORDS FOUND</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  groupedExpenses.map((group, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-[#000000] group"
                    >
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-200">
                            {group.employeeDetails?.name || 'UNKNOWN'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            ID: {group.employeeId}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800">
                          {group.employeeDetails?.role || 'Employee'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#111111] text-gray-300 border border-[#1f2937]">
                          {group.visitCount} Visits
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {group.totalKm} KM
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-200 tabular-nums">
                          ₹{group.totalAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenModal(group)}
                          className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 font-semibold text-[11px] group/btn mx-auto bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                        >
                          <FaEye className="group-hover/btn:scale-110" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Aggregate Details Modal - Sleek Style (AttendanceSummary match) */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-[#1f2937]">
            {/* Header */}
            <div className="px-8 py-6 bg-[#0a0a0a] border-b border-[#1f2937] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {selectedGroup.employeeDetails?.name ? selectedGroup.employeeDetails.name[0].toUpperCase() : 'E'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-200 tracking-tight">{selectedGroup.employeeDetails?.name || 'System User'}</h2>
                  <div className="flex items-center gap-3 mt-1 underline decoration-blue-200 underline-offset-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">ID: {selectedGroup.employeeId}</span>
                    <span className="text-xs font-bold text-gray-400">|</span>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{selectedGroup.employeeDetails?.role || 'Employee'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total visits</p>
                  <p className="text-xl font-bold text-gray-200">{selectedGroup.visitCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reimbursement</p>
                  <p className="text-3xl font-black text-blue-700 tabular-nums">₹{selectedGroup.totalAmount.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#000000] text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-[#1f2937] shadow-sm"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Modal Body - Detailed Table (Sleek Attendance Style) */}
            <div className="flex-1 overflow-y-auto p-0 bg-[#0a0a0a]">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-left border-r border-blue-600/30">Date</th>
                    <th className="px-6 py-4 text-left border-r border-blue-600/30">Purpose of visit</th>
                    <th className="px-6 py-4 text-center border-r border-blue-600/30">KM</th>
                    <th className="px-6 py-4 text-right border-r border-blue-600/30">Rate</th>
                    <th className="px-6 py-4 text-center border-r border-blue-600/30">Outcome</th>
                    <th className="px-6 py-4 text-right border-r border-blue-600/30">Order</th>
                    <th className="px-6 py-4 text-right border-r border-blue-600/30">Upsell</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937] font-medium">
                  {selectedGroup.records.map((rec, i) => (
                    <React.Fragment key={i}>
                      <tr className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium border-r border-gray-50 tracking-tight">
                          {new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-gray-200 border-r border-gray-50">
                          <div className="flex flex-col">
                            <span className="font-semibold">{rec.purpose}</span>
                            {rec.remark && <span className="text-[10px] text-gray-400 mt-1 italic font-medium">{rec.remark}</span>}
                            {rec.stops && rec.stops.length > 0 && (
                              <span className="text-[10px] inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded w-fit font-bold uppercase">
                                {rec.stops.length} Stops
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center border-r border-gray-50 text-blue-600 font-semibold tabular-nums">
                          {rec.km}
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-gray-400 text-xs font-bold whitespace-nowrap">
                          ₹{rec.rateApplied}/km
                        </td>
                        <td className="px-6 py-4 text-center border-r border-gray-50">
                          <span className="text-[10px] font-medium italic text-gray-500 max-w-[150px] truncate block mx-auto" title={rec.outcome}>
                            {rec.stops && rec.stops.length > 0 ? "Multiple Stops" : (rec.outcome ? `"${rec.outcome}"` : '-')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-green-600 tabular-nums font-bold">
                          {rec.orderValue > 0 ? `₹${rec.orderValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right border-r border-gray-50 text-purple-600 tabular-nums font-bold">
                          {rec.upsellValue > 0 ? `₹${rec.upsellValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right bg-blue-50/30 text-blue-900 font-semibold tabular-nums">
                          ₹{rec.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                      
                      {/* Render Stop Sub-rows if they exist */}
                      {rec.stops && rec.stops.length > 0 && rec.stops.map((stop, sIndex) => (
                        <tr key={`stop-${i}-${sIndex}`} className="bg-[#000000]/50 text-xs border-b border-[#1f2937] last:border-b-0">
                           <td className="px-6 py-2 border-r border-[#1f2937]"></td>
                           <td className="px-6 py-2 border-r border-[#1f2937]">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                               <span className="font-semibold text-gray-300">{stop.locationName}</span>
                             </div>
                           </td>
                           <td className="px-6 py-2 text-center border-r border-[#1f2937] text-blue-500 font-medium tabular-nums">
                             {stop.km > 0 ? stop.km : '-'}
                           </td>
                           <td className="px-6 py-2 border-r border-[#1f2937]"></td>
                           <td className="px-6 py-2 text-center border-r border-[#1f2937] text-gray-500 font-medium italic truncate max-w-[150px]" title={stop.outcome}>
                             {stop.outcome || '-'}
                           </td>
                           <td className="px-6 py-2 text-right border-r border-[#1f2937] text-green-600 tabular-nums">
                             {stop.orderValue > 0 ? `₹${stop.orderValue.toLocaleString()}` : '-'}
                           </td>
                           <td className="px-6 py-2 text-right border-r border-[#1f2937] text-purple-600 tabular-nums">
                             {stop.upsellValue > 0 ? `₹${stop.upsellValue.toLocaleString()}` : '-'}
                           </td>
                           <td className="px-6 py-2 bg-blue-50/10"></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {selectedGroup.records.length === 0 && (
                <div className="py-20 text-center text-gray-400 italic font-medium">No individual logs available.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-[#1f2937] bg-[#000000] flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
};

export default AllExpensives;