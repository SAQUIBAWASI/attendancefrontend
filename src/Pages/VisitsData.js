// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { API_BASE_URL } from '../config';
// import {
//   FaPhone,
//   FaLink,
//   FaMapMarkerAlt,
//   FaSearch,
//   FaTimes,
//   FaTimesCircle,
//   FaSync,
//   FaEye,
//   FaCheckCircle,
//   FaTrash,
//   FaDownload,
// } from 'react-icons/fa';
// import { FiFilter, FiCalendar, FiActivity, FiTrendingUp, FiTarget } from 'react-icons/fi';
// import '../index.css';
// import './EmployeeDashboard.css';

// // FiTarget aliased for semantic clarity
// const FiBullseye = FiTarget;

// const VisitsData = () => {
//   const [callRecords, setCallRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Month filter (default = current month)
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   // Search across summary table
//   const [searchQuery, setSearchQuery] = useState('');

//   // Detail modal state
//   const [showModal, setShowModal] = useState(false);
//   const [modalEmployee, setModalEmployee] = useState(null);
//   const [modalRecords, setModalRecords] = useState([]);

//   // ── Set Target modal state ────────────────────────────────────────────────────
//   const [showTargetModal, setShowTargetModal] = useState(false);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [empLoading, setEmpLoading] = useState(false);
//   const [targetForm, setTargetForm] = useState({
//     employeeId: '',
//     employeeName: '',
//     month: new Date().toISOString().slice(0, 7),
//     target: '',
//   });
//   const [targetSubmitting, setTargetSubmitting] = useState(false);
//   const [targetSuccess, setTargetSuccess] = useState('');
//   const [targetError, setTargetError] = useState('');

//   // Existing targets for selected month
//   const [existingTargets, setExistingTargets] = useState([]);
//   const [targetsLoading, setTargetsLoading] = useState(false);
//   const [viewTargetsMonth, setViewTargetsMonth] = useState(new Date().toISOString().slice(0, 7));

//   useEffect(() => {
//     fetchAllCallData();
//   }, []);

//   const fetchAllCallData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${API_BASE_URL}/call-data/all`);
//       if (res.data.success) {
//         setCallRecords(res.data.data);
//       }
//     } catch (err) {
//       console.error('Error fetching calls data:', err);
//       setError('Failed to load visit records. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch employees for dropdown
//   const fetchEmployees = useCallback(async () => {
//     setEmpLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
//       setAllEmployees(list);
//     } catch (err) {
//       console.error('Error fetching employees:', err);
//     } finally {
//       setEmpLoading(false);
//     }
//   }, []);

//   // Fetch existing targets for a given month
//   const fetchTargets = useCallback(async (month) => {
//     setTargetsLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/visit-targets/all?month=${month}`);
//       if (res.data.success) setExistingTargets(res.data.data);
//     } catch (err) {
//       console.error('Error fetching targets:', err);
//     } finally {
//       setTargetsLoading(false);
//     }
//   }, []);

//   const openTargetModal = () => {
//     setShowTargetModal(true);
//     setTargetSuccess('');
//     setTargetError('');
//     setTargetForm({
//       employeeId: '',
//       employeeName: '',
//       month: new Date().toISOString().slice(0, 7),
//       target: '',
//     });
//     setViewTargetsMonth(new Date().toISOString().slice(0, 7));
//     fetchEmployees();
//     fetchTargets(new Date().toISOString().slice(0, 7));
//   };

//   const closeTargetModal = () => {
//     setShowTargetModal(false);
//     setTargetSuccess('');
//     setTargetError('');
//   };

//   const handleTargetFormChange = (e) => {
//     const { name, value } = e.target;
//     if (name === 'employeeId') {
//       const emp = allEmployees.find((em) => em.employeeId === value);
//       setTargetForm((prev) => ({
//         ...prev,
//         employeeId: value,
//         employeeName: emp?.name || '',
//       }));
//     } else {
//       setTargetForm((prev) => ({ ...prev, [name]: value }));
//       if (name === 'month') fetchTargets(value);
//     }
//   };

//   const handleTargetSubmit = async (e) => {
//     e.preventDefault();
//     setTargetSuccess('');
//     setTargetError('');

//     if (!targetForm.employeeId || !targetForm.month || !targetForm.target) {
//       setTargetError('Please fill in all fields.');
//       return;
//     }
//     if (Number(targetForm.target) < 1) {
//       setTargetError('Target must be at least 1.');
//       return;
//     }

//     setTargetSubmitting(true);
//     try {
//       const res = await axios.post(`${API_BASE_URL}/visit-targets/set`, {
//         employeeId: targetForm.employeeId,
//         employeeName: targetForm.employeeName,
//         month: targetForm.month,
//         target: Number(targetForm.target),
//       });
//       if (res.data.success) {
//         setTargetSuccess(`Target of ${targetForm.target} visits assigned to ${targetForm.employeeName || targetForm.employeeId} for ${getMonthLabel(targetForm.month)}.`);
//         setTargetForm((prev) => ({ ...prev, employeeId: '', employeeName: '', target: '' }));
//         fetchTargets(targetForm.month);
//       } else {
//         setTargetError(res.data.message || 'Failed to assign target.');
//       }
//     } catch (err) {
//       console.error('Target submit error:', err);
//       setTargetError('Server error. Please try again.');
//     } finally {
//       setTargetSubmitting(false);
//     }
//   };

//   const handleDeleteTarget = async (id) => {
//     if (!window.confirm('Delete this target?')) return;
//     try {
//       await axios.delete(`${API_BASE_URL}/visit-targets/delete/${id}`);
//       setExistingTargets((prev) => prev.filter((t) => t._id !== id));
//     } catch (err) {
//       console.error('Delete target error:', err);
//     }
//   };

//   // ─── Filter records by selected month ────────────────────────────────────────
//   const recordsForMonth = callRecords.filter((rec) => {
//     if (!selectedMonth) return true;
//     const recMonth = new Date(rec.createdAt).toISOString().slice(0, 7);
//     return recMonth === selectedMonth;
//   });

//   // ─── Group by employee → build summary rows ───────────────────────────────────
//   const employeeSummaryMap = {};
//   recordsForMonth.forEach((rec) => {
//     const empId = rec.employeeId || 'UNKNOWN';
//     const empName = rec.employeeDetails?.name || 'UNKNOWN';
//     if (!employeeSummaryMap[empId]) {
//       employeeSummaryMap[empId] = { empId, empName, visits: 0 };
//     }
//     employeeSummaryMap[empId].visits += 1;
//   });
//   const employeeSummary = Object.values(employeeSummaryMap);

//   // ─── Apply search filter on summary ──────────────────────────────────────────
//   const filteredSummary = employeeSummary.filter((row) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       row.empId.toLowerCase().includes(q) || row.empName.toLowerCase().includes(q)
//     );
//   });

//   // ─── KPI stats ────────────────────────────────────────────────────────────────
//   const totalVisits = recordsForMonth.length;
//   const pendingVisits = recordsForMonth.filter((r) => r.status === 'Pending').length;
//   const leadVisits = recordsForMonth.filter((r) => r.status === 'Lead').length;
//   const rejectedVisits = recordsForMonth.filter((r) => r.status === 'Rejected').length;

//   // ─── Open detail modal ────────────────────────────────────────────────────────
//   const handleView = (empId, empName) => {
//     const records = recordsForMonth
//       .filter((r) => (r.employeeId || 'UNKNOWN') === empId)
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     setModalEmployee({ empId, empName });
//     setModalRecords(records);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setModalEmployee(null);
//     setModalRecords([]);
//   };

//   // ─── Helpers ──────────────────────────────────────────────────────────────────
//   const getMonthLabel = (month) => {
//     try {
//       if (month) {
//         return new Date(`${month}-01`).toLocaleDateString('en-IN', {
//           month: 'long',
//           year: 'numeric',
//         });
//       }
//       return 'All Time';
//     } catch {
//       return month;
//     }
//   };

//   const getPeriodLabel = () => getMonthLabel(selectedMonth);

//   // Download filtered data as CSV
//   const handleDownload = () => {
//     const dataToDownload = filteredSummary.map(emp => ({
//       'Employee ID': emp.employeeId,
//       'Employee Name': emp.employeeName,
//       'Total Visits': emp.total,
//       'Pending': emp.pending,
//       'Leads': emp.leads,
//       'Rejected': emp.rejected
//     }));

//     const headers = Object.keys(dataToDownload[0] || {});
//     const csvContent = [
//       headers.join(','),
//       ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `visit-summary-${selectedMonth || 'all'}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Download modal data as CSV
//   const handleModalDownload = () => {
//     const dataToDownload = modalRecords.map(rec => ({
//       'Date': new Date(rec.createdAt).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       }),
//       'Center Name': rec.centerName,
//       'Client Name': rec.clientName,
//       'Contact': rec.contact,
//       'Address': rec.address,
//       'Google Maps Link': rec.addressLink || '',
//       'Employee Current Location': rec.employeeLocation?.mapsLink || '',
//       'Employee Latitude': rec.employeeLocation?.latitude ?? '',
//       'Employee Longitude': rec.employeeLocation?.longitude ?? '',
//       'Status': rec.status,
//       'Remarks': rec.remarks || ''
//     }));

//     const headers = Object.keys(dataToDownload[0] || {});
//     const csvContent = [
//       headers.join(','),
//       ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `visit-details-${modalEmployee.empName}-${selectedMonth || 'all'}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="emp-dash">
//       <main className="p-4 sm:p-6 lg:p-8">

//         {/* ── Header ── */}
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">
//               Visits &amp; Calls <span>Summary</span>
//             </h1>
//             <p className="emp-dash__subtitle">
//               Employee-wise visit counts and detailed records for the selected month.
//             </p>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
//             {/* Set Target Button */}
//             <button
//               onClick={openTargetModal}
//               style={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '0.45rem',
//                 padding: '0.5rem 1.1rem',
//                 fontSize: '0.82rem',
//                 fontWeight: 700,
//                 color: '#fff',
//                 background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
//                 border: 'none',
//                 borderRadius: '10px',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 12px rgba(124,58,237,0.28)',
//                 transition: 'transform 0.15s, box-shadow 0.15s',
//                 letterSpacing: '0.01em',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform = 'translateY(-1px)';
//                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.38)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = '';
//                 e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.28)';
//               }}
//             >
//               <FiBullseye style={{ fontSize: '0.95rem' }} />
//               Set Target
//             </button>

//             <div className="emp-dash__date-pill">
//               <FiCalendar />
//               <span>{getPeriodLabel()}</span>
//             </div>
//           </div>
//         </div>

//         {/* ── KPI Stats ── */}
//         {!loading && (
//           <div className="emp-dash__stats">
//             <Link to="/total-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Total Visits</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                   <FaPhone className="text-blue-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">{totalVisits}</div>
//               <div className="emp-dash__stat-meta">this month</div>
//             </Link>

//             <Link to="/pending-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Pending</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                   <FiActivity className="text-yellow-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">{pendingVisits}</div>
//               <div className="emp-dash__stat-meta">needs follow-up</div>
//             </Link>

//             <Link to="/leads" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Leads</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                   <FiTrendingUp className="text-green-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">{leadVisits}</div>
//               <div className="emp-dash__stat-meta">positive outcomes</div>
//             </Link>

//             <Link to="/rejected-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Rejected</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
//                   <FaTimesCircle className="text-red-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">{rejectedVisits}</div>
//               <div className="emp-dash__stat-meta">not interested</div>
//             </Link>
//           </div>
//         )}

//         {/* ── Filters Card ── */}
//         <div className="emp-dash__card mb-6">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title flex items-center gap-2">
//                 <FiFilter className="text-blue-600" /> Filters &amp; Actions
//               </h3>
//               <p className="emp-dash__card-desc">
//                 Filter by month and search by Employee ID or Name.
//               </p>
//             </div>
//           </div>
//           <div className="emp-dash__card-body bg-gray-50/50">
//             <div className="flex flex-wrap items-end gap-4">

//               {/* Search */}
//               <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
//                 <label className="text-xs font-medium text-gray-600">Search Employee</label>
//                 <div className="relative">
//                   <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
//                   <input
//                     type="text"
//                     placeholder="Search ID or Name..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                   />
//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery('')}
//                       className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
//                     >
//                       <FaTimes className="text-[10px]" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Month Picker */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Month</label>
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
//                 />
//               </div>

//               {/* Refresh */}
//               <button
//                 onClick={() => {
//                   setSearchQuery('');
//                   setSelectedMonth(new Date().toISOString().slice(0, 7));
//                   fetchAllCallData();
//                 }}
//                 className="h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
//                 title="Refresh"
//               >
//                 <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>

//               {/* Download */}
//               <button
//                 onClick={handleDownload}
//                 disabled={filteredSummary.length === 0}
//                 className="h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
//                 title="Download CSV"
//               >
//                 <FaDownload className="text-[10px]" />
//                 Download
//               </button>
//             </div>

//             <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-500 font-medium">
//               Showing <strong className="text-gray-800">{filteredSummary.length}</strong> of{' '}
//               <strong className="text-gray-800">{employeeSummary.length}</strong> employees
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">
//             {error}
//           </div>
//         )}

//         {/* ── Summary Table ── */}
//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Employee Visit Summary</h3>
//               <p className="emp-dash__card-desc">
//                 Click <strong>View</strong> to see detailed visit records for that employee.
//               </p>
//             </div>
//           </div>

//           <div className="emp-dash__table-wrap overflow-x-auto">
//             <table className="emp-dash__table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Emp ID</th>
//                   <th>Name</th>
//                   <th style={{ textAlign: 'center' }}>No. of Visits</th>
//                   <th style={{ textAlign: 'center' }}>View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && callRecords.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="py-10 text-center">
//                       <div className="flex flex-col items-center justify-center gap-3">
//                         <div className="emp-dash__spinner"></div>
//                         <span className="text-sm font-medium text-gray-500">Loading visit records...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filteredSummary.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="py-12 text-center">
//                       <div className="flex flex-col items-center justify-center gap-2">
//                         <FaPhone className="text-4xl text-gray-300" />
//                         <p className="text-gray-500 font-medium">No records found</p>
//                         <p className="text-gray-400 text-xs">
//                           Try adjusting the month filter or search query
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   <AnimatePresence>
//                     {filteredSummary.map((row, idx) => (
//                       <motion.tr
//                         key={row.empId}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: Math.min(idx * 0.03, 0.5) }}
//                         className="hover:bg-gray-50/60 transition-all group"
//                       >
//                         {/* # */}
//                         <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>

//                         {/* Emp ID */}
//                         <td className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">
//                           {row.empId}
//                         </td>

//                         {/* Name */}
//                         <td>
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-inner">
//                               {row.empName?.[0]?.toUpperCase() || 'E'}
//                             </div>
//                             <span className="font-semibold text-gray-900 text-xs whitespace-nowrap group-hover:text-blue-600 transition-colors">
//                               {row.empName}
//                             </span>
//                           </div>
//                         </td>

//                         {/* No. of Visits */}
//                         <td className="text-center whitespace-nowrap">
//                           <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
//                             {row.visits}
//                           </span>
//                         </td>

//                         {/* View Button */}
//                         <td className="text-center whitespace-nowrap">
//                           <button
//                             onClick={() => handleView(row.empId, row.empName)}
//                             className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm"
//                           >
//                             <FaEye className="text-[11px]" />
//                             View
//                           </button>
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </AnimatePresence>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer count */}
//           {!loading && filteredSummary.length > 0 && (
//             <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
//               <p className="text-xs font-semibold text-gray-500">
//                 Showing{' '}
//                 <span className="text-gray-900 font-bold">{filteredSummary.length}</span> employees
//                 for <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
//               </p>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* ══════════════════════════════════════════════════════════════════════════
//            ── Set Target Modal ──
//       ══════════════════════════════════════════════════════════════════════════ */}
//       <AnimatePresence>
//         {showTargetModal && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               key="target-backdrop"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={closeTargetModal}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
//             />

//             {/* Modal Panel */}
//             <motion.div
//               key="target-modal"
//               initial={{ opacity: 0, scale: 0.95, y: 24 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 24 }}
//               transition={{ duration: 0.22, ease: 'easeOut' }}
//               className="fixed inset-0 z-[201] flex items-center justify-center p-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div
//                 className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
//                 style={{ maxWidth: '560px', maxHeight: '90vh' }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {/* Modal Header */}
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     padding: '1.1rem 1.4rem',
//                     background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
//                   }}
//                 >
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                     <div
//                       style={{
//                         width: '2rem',
//                         height: '2rem',
//                         borderRadius: '8px',
//                         background: 'rgba(255,255,255,0.18)',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <FiBullseye style={{ color: '#fff', fontSize: '1rem' }} />
//                     </div>
//                     <div>
//                       <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
//                         Set Visit Target
//                       </h2>
//                       <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', margin: 0 }}>
//                         Assign monthly visit targets to employees
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={closeTargetModal}
//                     style={{
//                       width: '2rem',
//                       height: '2rem',
//                       borderRadius: '50%',
//                       background: 'rgba(255,255,255,0.18)',
//                       border: 'none',
//                       cursor: 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: '#fff',
//                       fontSize: '0.85rem',
//                       transition: 'background 0.15s',
//                     }}
//                     onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
//                     onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
//                   >
//                     <FaTimes />
//                   </button>
//                 </div>

//                 {/* Modal Body — scrollable */}
//                 <div style={{ overflowY: 'auto', flex: 1 }}>
//                   {/* ── Assign Form ── */}
//                   <form onSubmit={handleTargetSubmit} style={{ padding: '1.25rem 1.4rem' }}>
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

//                       {/* Employee Select */}
//                       <div>
//                         <label
//                           style={{
//                             display: 'block',
//                             fontSize: '0.75rem',
//                             fontWeight: 600,
//                             color: '#374151',
//                             marginBottom: '0.4rem',
//                           }}
//                         >
//                           Select Employee <span style={{ color: '#ef4444' }}>*</span>
//                         </label>
//                         {empLoading ? (
//                           <div
//                             style={{
//                               padding: '0.6rem 0.9rem',
//                               background: '#f3f4f6',
//                               borderRadius: '8px',
//                               fontSize: '0.78rem',
//                               color: '#6b7280',
//                             }}
//                           >
//                             Loading employees...
//                           </div>
//                         ) : (
//                           <select
//                             name="employeeId"
//                             value={targetForm.employeeId}
//                             onChange={handleTargetFormChange}
//                             required
//                             style={{
//                               width: '100%',
//                               padding: '0.55rem 0.85rem',
//                               fontSize: '0.82rem',
//                               border: '1.5px solid #d1d5db',
//                               borderRadius: '8px',
//                               background: '#fff',
//                               color: '#111827',
//                               outline: 'none',
//                               cursor: 'pointer',
//                               appearance: 'auto',
//                             }}
//                           >
//                             <option value="">— Select Employee —</option>
//                             {allEmployees.map((emp) => (
//                               <option key={emp._id || emp.employeeId} value={emp.employeeId}>
//                                 {emp.employeeId} — {emp.name}
//                               </option>
//                             ))}
//                           </select>
//                         )}
//                       </div>

//                       {/* Month */}
//                       <div>
//                         <label
//                           style={{
//                             display: 'block',
//                             fontSize: '0.75rem',
//                             fontWeight: 600,
//                             color: '#374151',
//                             marginBottom: '0.4rem',
//                           }}
//                         >
//                           Target Month <span style={{ color: '#ef4444' }}>*</span>
//                         </label>
//                         <input
//                           type="month"
//                           name="month"
//                           value={targetForm.month}
//                           onChange={handleTargetFormChange}
//                           required
//                           style={{
//                             width: '100%',
//                             padding: '0.55rem 0.85rem',
//                             fontSize: '0.82rem',
//                             border: '1.5px solid #d1d5db',
//                             borderRadius: '8px',
//                             background: '#fff',
//                             color: '#111827',
//                             outline: 'none',
//                             boxSizing: 'border-box',
//                           }}
//                         />
//                       </div>

//                       {/* Target Number */}
//                       <div>
//                         <label
//                           style={{
//                             display: 'block',
//                             fontSize: '0.75rem',
//                             fontWeight: 600,
//                             color: '#374151',
//                             marginBottom: '0.4rem',
//                           }}
//                         >
//                           Visit Target (count) <span style={{ color: '#ef4444' }}>*</span>
//                         </label>
//                         <input
//                           type="number"
//                           name="target"
//                           value={targetForm.target}
//                           onChange={handleTargetFormChange}
//                           min="1"
//                           placeholder="e.g. 30"
//                           required
//                           style={{
//                             width: '100%',
//                             padding: '0.55rem 0.85rem',
//                             fontSize: '0.82rem',
//                             border: '1.5px solid #d1d5db',
//                             borderRadius: '8px',
//                             background: '#fff',
//                             color: '#111827',
//                             outline: 'none',
//                             boxSizing: 'border-box',
//                           }}
//                         />
//                       </div>

//                       {/* Feedback messages */}
//                       {targetError && (
//                         <div
//                           style={{
//                             padding: '0.6rem 0.9rem',
//                             background: '#fee2e2',
//                             border: '1px solid #fca5a5',
//                             borderRadius: '8px',
//                             color: '#b91c1c',
//                             fontSize: '0.78rem',
//                             fontWeight: 600,
//                           }}
//                         >
//                           {targetError}
//                         </div>
//                       )}
//                       {targetSuccess && (
//                         <div
//                           style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '0.4rem',
//                             padding: '0.6rem 0.9rem',
//                             background: '#dcfce7',
//                             border: '1px solid #86efac',
//                             borderRadius: '8px',
//                             color: '#15803d',
//                             fontSize: '0.78rem',
//                             fontWeight: 600,
//                           }}
//                         >
//                           <FaCheckCircle />
//                           {targetSuccess}
//                         </div>
//                       )}

//                       {/* Submit */}
//                       <button
//                         type="submit"
//                         disabled={targetSubmitting}
//                         style={{
//                           width: '100%',
//                           padding: '0.65rem',
//                           background: targetSubmitting
//                             ? '#a5b4fc'
//                             : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
//                           color: '#fff',
//                           fontWeight: 700,
//                           fontSize: '0.85rem',
//                           border: 'none',
//                           borderRadius: '10px',
//                           cursor: targetSubmitting ? 'not-allowed' : 'pointer',
//                           transition: 'opacity 0.15s',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '0.5rem',
//                         }}
//                       >
//                         <FiBullseye />
//                         {targetSubmitting ? 'Assigning...' : 'Assign Target'}
//                       </button>
//                     </div>
//                   </form>

//                   {/* ── Existing Targets Table ── */}
//                   <div
//                     style={{
//                       borderTop: '1px solid #e5e7eb',
//                       padding: '1rem 1.4rem 1.4rem',
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                         marginBottom: '0.75rem',
//                         flexWrap: 'wrap',
//                         gap: '0.5rem',
//                       }}
//                     >
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <h4
//                           style={{
//                             fontSize: '0.82rem',
//                             fontWeight: 700,
//                             color: '#374151',
//                             margin: 0,
//                           }}
//                         >
//                           Targets for{' '}
//                           <span style={{ color: '#4f46e5' }}>{getMonthLabel(viewTargetsMonth)}</span>
//                         </h4>
//                       </div>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <input
//                           type="month"
//                           value={viewTargetsMonth}
//                           onChange={(e) => {
//                             setViewTargetsMonth(e.target.value);
//                             fetchTargets(e.target.value);
//                           }}
//                           onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                           style={{
//                             padding: '0.35rem 0.6rem',
//                             fontSize: '0.75rem',
//                             border: '1px solid #d1d5db',
//                             borderRadius: '6px',
//                             background: '#fff',
//                             color: '#111827',
//                             outline: 'none',
//                             cursor: 'pointer',
//                           }}
//                         />
//                         {targetsLoading && (
//                           <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Loading...</span>
//                         )}
//                       </div>
//                     </div>

//                     {existingTargets.length === 0 ? (
//                       <div
//                         style={{
//                           textAlign: 'center',
//                           padding: '1.5rem',
//                           background: '#f9fafb',
//                           borderRadius: '10px',
//                           color: '#9ca3af',
//                           fontSize: '0.78rem',
//                         }}
//                       >
//                         <FiBullseye style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block', margin: '0 auto 0.4rem' }} />
//                         No targets set for this month yet.
//                       </div>
//                     ) : (
//                       <div style={{ overflowX: 'auto' }}>
//                         <table
//                           style={{
//                             width: '100%',
//                             borderCollapse: 'collapse',
//                             fontSize: '0.78rem',
//                           }}
//                         >
//                           <thead>
//                             <tr style={{ background: '#f3f4f6' }}>
//                               <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderRadius: '6px 0 0 6px' }}>
//                                 Emp ID
//                               </th>
//                               <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>
//                                 Name
//                               </th>
//                               <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>
//                                 Target
//                               </th>
//                               <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>
//                                 Progress
//                               </th>
//                               <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151', borderRadius: '0 6px 6px 0' }}>
//                                 Action
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {existingTargets.map((t) => (
//                               <tr
//                                 key={t._id}
//                                 style={{ borderBottom: '1px solid #f3f4f6' }}
//                               >
//                                 <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600, color: '#1e293b' }}>
//                                   {t.employeeId}
//                                 </td>
//                                 <td style={{ padding: '0.45rem 0.65rem', color: '#374151' }}>
//                                   {t.employeeName || '—'}
//                                 </td>
//                                 <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
//                                   <span
//                                     style={{
//                                       padding: '0.2rem 0.65rem',
//                                       background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
//                                       color: '#4f46e5',
//                                       borderRadius: '20px',
//                                       fontWeight: 700,
//                                       fontSize: '0.78rem',
//                                     }}
//                                   >
//                                     {t.target} visits
//                                   </span>
//                                 </td>
//                                 <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
//                                   {(() => {
//                                     const completedVisits = callRecords.filter(
//                                       (r) => r.employeeId === t.employeeId &&
//                                       new Date(r.createdAt).toISOString().slice(0, 7) === viewTargetsMonth
//                                     ).length;
//                                     const progress = Math.min((completedVisits / t.target) * 100, 100);
//                                     const isCompleted = completedVisits >= t.target;
//                                     return (
//                                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
//                                         <div style={{ 
//                                           width: '80px', 
//                                           height: '6px', 
//                                           background: '#e5e7eb', 
//                                           borderRadius: '3px', 
//                                           overflow: 'hidden' 
//                                         }}>
//                                           <div style={{ 
//                                             width: `${progress}%`, 
//                                             height: '100%', 
//                                             background: isCompleted ? '#10b981' : '#4f46e5',
//                                             transition: 'width 0.3s ease' 
//                                           }} />
//                                         </div>
//                                         <span style={{ 
//                                           fontSize: '0.7rem', 
//                                           fontWeight: 600, 
//                                           color: isCompleted ? '#10b981' : '#4f46e5' 
//                                         }}>
//                                           {completedVisits}/{t.target}
//                                         </span>
//                                       </div>
//                                     );
//                                   })()}
//                                 </td>
//                                 <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
//                                   <button
//                                     onClick={() => handleDeleteTarget(t._id)}
//                                     title="Delete target"
//                                     style={{
//                                       background: 'none',
//                                       border: 'none',
//                                       cursor: 'pointer',
//                                       color: '#ef4444',
//                                       padding: '0.25rem',
//                                       borderRadius: '4px',
//                                       transition: 'background 0.15s',
//                                     }}
//                                     onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
//                                     onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
//                                   >
//                                     <FaTrash style={{ fontSize: '0.78rem' }} />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Modal Footer */}
//                 <div
//                   style={{
//                     display: 'flex',
//                     justifyContent: 'flex-end',
//                     padding: '0.85rem 1.4rem',
//                     borderTop: '1px solid #e5e7eb',
//                     background: '#f9fafb',
//                   }}
//                 >
//                   <button
//                     onClick={closeTargetModal}
//                     style={{
//                       padding: '0.5rem 1.25rem',
//                       fontSize: '0.82rem',
//                       fontWeight: 600,
//                       color: '#374151',
//                       background: '#fff',
//                       border: '1.5px solid #d1d5db',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       transition: 'background 0.15s',
//                     }}
//                     onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
//                     onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* ── Detail Modal ── */}
//       <AnimatePresence>
//         {showModal && modalEmployee && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               key="backdrop"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={closeModal}
//               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
//             />

//             {/* Modal Panel */}
//             <motion.div
//               key="modal"
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               transition={{ duration: 0.2 }}
//               className="fixed inset-0 z-[201] flex items-center justify-center p-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div
//                 className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {/* Modal Header */}
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
//                   <div>
//                     <h2 className="text-white font-bold text-base">
//                       {modalEmployee.empName} — Visit Details
//                     </h2>
//                     <p className="text-blue-100 text-xs mt-0.5">
//                       {getPeriodLabel()} &nbsp;·&nbsp;{' '}
//                       <span className="font-semibold">{modalRecords.length} visit{modalRecords.length !== 1 ? 's' : ''}</span>
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={handleModalDownload}
//                       disabled={modalRecords.length === 0}
//                       className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                       title="Download CSV"
//                     >
//                       <FaDownload className="text-sm" />
//                     </button>
//                     <button
//                       onClick={closeModal}
//                       className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
//                     >
//                       <FaTimes className="text-sm" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Modal Stats Bar */}
//                 <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 border-b border-gray-100">
//                   {[
//                     { label: 'Total', value: modalRecords.length, color: 'text-blue-600' },
//                     { label: 'Pending', value: modalRecords.filter((r) => r.status === 'Pending').length, color: 'text-amber-600' },
//                     { label: 'Lead', value: modalRecords.filter((r) => r.status === 'Lead').length, color: 'text-green-600' },
//                     { label: 'Rejected', value: modalRecords.filter((r) => r.status === 'Rejected').length, color: 'text-red-600' },
//                   ].map((s) => (
//                     <div key={s.label} className="flex items-center gap-1.5">
//                       <span className="text-xs text-gray-500">{s.label}:</span>
//                       <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Modal Table */}
//                 <div className="overflow-auto flex-1">
//                   {modalRecords.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-16 gap-3">
//                       <FaPhone className="text-4xl text-gray-300" />
//                       <p className="text-gray-500 font-medium text-sm">No visit records for this period</p>
//                     </div>
//                   ) : (
//                     <table className="emp-dash__table">
//                       <thead>
//                         <tr>
//                           <th>#</th>
//                           <th>Date</th>
//                           <th>Center Name</th>
//                           <th>Client &amp; Contact</th>
//                           <th>Address &amp; Location</th>
//                           <th style={{ textAlign: 'center' }}>Status</th>
//                           <th>Remarks</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {modalRecords.map((rec, idx) => (
//                           <tr key={rec._id || idx} className="hover:bg-gray-50/60 transition-all">
//                             <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>
//                             <td className="whitespace-nowrap">
//                               <span className="text-xs font-semibold text-gray-700">
//                                 {new Date(rec.createdAt).toLocaleDateString('en-IN', {
//                                   day: '2-digit',
//                                   month: 'short',
//                                   year: 'numeric',
//                                 })}
//                               </span>
//                             </td>
//                             <td>
//                               <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">
//                                 {rec.centerName}
//                               </span>
//                             </td>
//                             <td>
//                               <div className="flex flex-col">
//                                 <span className="text-xs text-gray-900 font-medium">{rec.clientName}</span>
//                                 <span className="text-[10px] text-gray-400">{rec.contact}</span>
//                               </div>
//                             </td>
//                             <td>
//                               <div className="flex flex-col gap-1 max-w-[220px]">
//                                 <div className="flex items-center gap-1.5">
//                                   <span
//                                     className="text-xs text-gray-600 truncate"
//                                     title={rec.address}
//                                   >
//                                     {rec.address}
//                                   </span>
//                                   {rec.addressLink && (
//                                     <a
//                                       href={rec.addressLink}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="text-blue-600 hover:text-blue-800 flex-shrink-0"
//                                       title="Open client address in Google Maps"
//                                       onClick={(e) => e.stopPropagation()}
//                                     >
//                                       <FaLink size={10} />
//                                     </a>
//                                   )}
//                                 </div>
//                                 {rec.employeeLocation?.mapsLink && (
//                                   <a
//                                     href={rec.employeeLocation.mapsLink}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
//                                     title={
//                                       rec.employeeLocation?.latitude != null && rec.employeeLocation?.longitude != null
//                                         ? `Employee current location: ${rec.employeeLocation.latitude}, ${rec.employeeLocation.longitude}`
//                                         : 'Open employee current location'
//                                     }
//                                     onClick={(e) => e.stopPropagation()}
//                                   >
//                                     <FaMapMarkerAlt size={9} />
//                                     Employee location
//                                   </a>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="text-center whitespace-nowrap">
//                               <span
//                                 style={{
//                                   padding: '0.2rem 0.55rem',
//                                   borderRadius: '6px',
//                                   fontSize: '0.7rem',
//                                   fontWeight: 700,
//                                   backgroundColor:
//                                     rec.status === 'Pending'
//                                       ? '#fef0c7'
//                                       : rec.status === 'Lead'
//                                       ? '#e0f2fe'
//                                       : '#fee4e2',
//                                   color:
//                                     rec.status === 'Pending'
//                                       ? '#b54708'
//                                       : rec.status === 'Lead'
//                                       ? '#0369a1'
//                                       : '#b42318',
//                                 }}
//                               >
//                                 {rec.status}
//                               </span>
//                             </td>
//                             <td>
//                               <span
//                                 className="text-xs text-gray-500 line-clamp-2 max-w-[180px]"
//                                 title={rec.remarks}
//                               >
//                                 {rec.remarks || '—'}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>

//                 {/* Modal Footer */}
//                 <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
//                   <p className="text-xs text-gray-500">
//                     Employee ID:{' '}
//                     <span className="font-bold text-gray-800">{modalEmployee.empId}</span>
//                   </p>
//                   <button
//                     onClick={closeModal}
//                     className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default VisitsData;




import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  FaPhone,
  FaLink,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaSync,
  FaEye,
  FaCheckCircle,
  FaTrash,
  FaDownload,
} from 'react-icons/fa';
import { FiFilter, FiCalendar, FiActivity, FiTrendingUp, FiTarget } from 'react-icons/fi';
import '../index.css';
import './EmployeeDashboard.css';

// FiTarget aliased for semantic clarity
const FiBullseye = FiTarget;

const VisitsData = () => {
  const [callRecords, setCallRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Month filter (default = current month)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Search across summary table
  const [searchQuery, setSearchQuery] = useState('');

  // Detail modal state
  const [showModal, setShowModal] = useState(false);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [modalRecords, setModalRecords] = useState([]);

  // ── Set Target modal state ────────────────────────────────────────────────────
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [targetForm, setTargetForm] = useState({
    employeeId: '',
    employeeName: '',
    month: new Date().toISOString().slice(0, 7),
    target: '',
  });
  const [targetSubmitting, setTargetSubmitting] = useState(false);
  const [targetSuccess, setTargetSuccess] = useState('');
  const [targetError, setTargetError] = useState('');

  // Existing targets for selected month
  const [existingTargets, setExistingTargets] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [viewTargetsMonth, setViewTargetsMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchAllCallData();
  }, []);

  const fetchAllCallData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/call-data/all`);
      if (res.data.success) {
        setCallRecords(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching calls data:', err);
      setError('Failed to load visit records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAllEmployees(list);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setEmpLoading(false);
    }
  }, []);

  // Fetch existing targets for a given month
  const fetchTargets = useCallback(async (month) => {
    setTargetsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/visit-targets/all?month=${month}`);
      if (res.data.success) setExistingTargets(res.data.data);
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setTargetsLoading(false);
    }
  }, []);

  const openTargetModal = () => {
    setShowTargetModal(true);
    setTargetSuccess('');
    setTargetError('');
    setTargetForm({
      employeeId: '',
      employeeName: '',
      month: new Date().toISOString().slice(0, 7),
      target: '',
    });
    setViewTargetsMonth(new Date().toISOString().slice(0, 7));
    fetchEmployees();
    fetchTargets(new Date().toISOString().slice(0, 7));
  };

  const closeTargetModal = () => {
    setShowTargetModal(false);
    setTargetSuccess('');
    setTargetError('');
  };

  const handleTargetFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'employeeId') {
      const emp = allEmployees.find((em) => em.employeeId === value);
      setTargetForm((prev) => ({
        ...prev,
        employeeId: value,
        employeeName: emp?.name || '',
      }));
    } else {
      setTargetForm((prev) => ({ ...prev, [name]: value }));
      if (name === 'month') fetchTargets(value);
    }
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    setTargetSuccess('');
    setTargetError('');

    if (!targetForm.employeeId || !targetForm.month || !targetForm.target) {
      setTargetError('Please fill in all fields.');
      return;
    }
    if (Number(targetForm.target) < 1) {
      setTargetError('Target must be at least 1.');
      return;
    }

    setTargetSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/visit-targets/set`, {
        employeeId: targetForm.employeeId,
        employeeName: targetForm.employeeName,
        month: targetForm.month,
        target: Number(targetForm.target),
      });
      if (res.data.success) {
        setTargetSuccess(`Target of ${targetForm.target} visits assigned to ${targetForm.employeeName || targetForm.employeeId} for ${getMonthLabel(targetForm.month)}.`);
        setTargetForm((prev) => ({ ...prev, employeeId: '', employeeName: '', target: '' }));
        fetchTargets(targetForm.month);
      } else {
        setTargetError(res.data.message || 'Failed to assign target.');
      }
    } catch (err) {
      console.error('Target submit error:', err);
      setTargetError('Server error. Please try again.');
    } finally {
      setTargetSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id) => {
    if (!window.confirm('Delete this target?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/visit-targets/delete/${id}`);
      setExistingTargets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Delete target error:', err);
    }
  };

  // ─── Filter records by selected month ────────────────────────────────────────
  const recordsForMonth = callRecords.filter((rec) => {
    if (!selectedMonth) return true;
    const recMonth = new Date(rec.createdAt).toISOString().slice(0, 7);
    return recMonth === selectedMonth;
  });

  // ─── Group by employee → build summary rows ───────────────────────────────────
  const employeeSummaryMap = {};
  recordsForMonth.forEach((rec) => {
    const empId = rec.employeeId || 'UNKNOWN';
    const empName = rec.employeeDetails?.name || 'UNKNOWN';
    if (!employeeSummaryMap[empId]) {
      employeeSummaryMap[empId] = { empId, empName, visits: 0 };
    }
    employeeSummaryMap[empId].visits += 1;
  });
  const employeeSummary = Object.values(employeeSummaryMap);

  // ─── Apply search filter on summary ──────────────────────────────────────────
  const filteredSummary = employeeSummary.filter((row) => {
    const q = searchQuery.toLowerCase();
    return (
      row.empId.toLowerCase().includes(q) || row.empName.toLowerCase().includes(q)
    );
  });

  // ─── KPI stats ────────────────────────────────────────────────────────────────
  const totalVisits = recordsForMonth.length;
  const pendingVisits = recordsForMonth.filter((r) => r.status === 'Pending').length;
  const leadVisits = recordsForMonth.filter((r) => r.status === 'Lead').length;
  const rejectedVisits = recordsForMonth.filter((r) => r.status === 'Rejected').length;

  // ─── Open detail modal ────────────────────────────────────────────────────────
  const handleView = (empId, empName) => {
    const records = recordsForMonth
      .filter((r) => (r.employeeId || 'UNKNOWN') === empId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setModalEmployee({ empId, empName });
    setModalRecords(records);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalEmployee(null);
    setModalRecords([]);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getMonthLabel = (month) => {
    try {
      if (month) {
        return new Date(`${month}-01`).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        });
      }
      return 'All Time';
    } catch {
      return month;
    }
  };

  const getPeriodLabel = () => getMonthLabel(selectedMonth);

  // Download filtered data as CSV
  const handleDownload = () => {
    const dataToDownload = filteredSummary.map(emp => ({
      'Employee ID': emp.employeeId,
      'Employee Name': emp.employeeName,
      'Total Visits': emp.visits,



    }));

    const headers = Object.keys(dataToDownload[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visit-summary-${selectedMonth || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download modal data as CSV
  const handleModalDownload = () => {
    const dataToDownload = modalRecords.map(rec => ({
      'Date': new Date(rec.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      'Center Name': rec.centerName,
      'Client Name': rec.clientName,
      'Contact': rec.contact,
      'Address': rec.address,
      'Google Maps Link': rec.addressLink || '',
      'Employee Current Location': rec.employeeLocation?.mapsLink || '',
      'Employee Latitude': rec.employeeLocation?.latitude ?? '',
      'Employee Longitude': rec.employeeLocation?.longitude ?? '',
      'Status': rec.status,
      'Remarks': rec.remarks || ''
    }));

    const headers = Object.keys(dataToDownload[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToDownload.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visit-details-${modalEmployee.empName}-${selectedMonth || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">

        {/* ── Header ── */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Visits &amp; Calls <span>Summary</span>
            </h1>
            <p className="emp-dash__subtitle">
              Employee-wise visit counts and detailed records for the selected month.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Set Target Button */}
            <button
              onClick={openTargetModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(124,58,237,0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.38)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.28)';
              }}
            >
              <FiBullseye style={{ fontSize: '0.95rem' }} />
              Set Target
            </button>

            <div className="emp-dash__date-pill">
              <FiCalendar />
              <span>{getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {/* ── KPI Stats ── */}
        {!loading && (
          <div className="emp-dash__stats">
            <Link to="/total-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Visits</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FaPhone className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{totalVisits}</div>
              <div className="emp-dash__stat-meta">this month</div>
            </Link>

            <Link to="/pending-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Pending</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiActivity className="text-yellow-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{pendingVisits}</div>
              <div className="emp-dash__stat-meta">needs follow-up</div>
            </Link>

            <Link to="/leads" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Leads</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiTrendingUp className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{leadVisits}</div>
              <div className="emp-dash__stat-meta">positive outcomes</div>
            </Link>

            <Link to="/rejected-visits" className="emp-dash__stat" style={{ textDecoration:'none', cursor:'pointer' }}>
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Rejected</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FaTimesCircle className="text-red-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">{rejectedVisits}</div>
              <div className="emp-dash__stat-meta">not interested</div>
            </Link>
          </div>
        )}

        {/* ── Filters Card ── */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filters &amp; Actions
              </h3>
              <p className="emp-dash__card-desc">
                Filter by month and search by Employee ID or Name.
              </p>
            </div>
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            {/* Desktop Filters - Hidden on Mobile */}
            <div className="hidden md:flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-gray-600">Search Employee</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Month Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMonth(new Date().toISOString().slice(0, 7));
                  fetchAllCallData();
                }}
                className="h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                title="Refresh"
              >
                <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={filteredSummary.length === 0}
                className="h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download CSV"
              >
                <FaDownload className="text-[10px]" />
                Download
              </button>
            </div>

            {/* Mobile Filters - Visible only on Mobile */}
            <div className="md:hidden flex flex-col gap-3">
              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Search Employee</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Month Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full h-9 px-3 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Refresh */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-600">&nbsp;</label>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMonth(new Date().toISOString().slice(0, 7));
                      fetchAllCallData();
                    }}
                    className="w-full h-9 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                    title="Refresh"
                  >
                    <FaSync className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={filteredSummary.length === 0}
                className="w-full h-9 px-3 text-xs font-semibold text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download CSV"
              >
                <FaDownload className="text-[10px]" />
                Download CSV
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200/50 text-xs text-gray-500 font-medium">
              Showing <strong className="text-gray-800">{filteredSummary.length}</strong> of{' '}
              <strong className="text-gray-800">{employeeSummary.length}</strong> employees
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-xs font-bold">
            {error}
          </div>
        )}

        {/* ── Summary Table ── */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Employee Visit Summary</h3>
              <p className="emp-dash__card-desc">
                Click <strong>View</strong> to see detailed visit records for that employee.
              </p>
            </div>
          </div>

          <div className="emp-dash__table-wrap visits-summary-table-wrap overflow-x-auto">
            <div className="sm:hidden px-4 pt-3 text-[11px] font-medium text-gray-500">
              Swipe left or right to see the full table.
            </div>
              <table className="emp-dash__table visits-summary-table">
                <thead>
















                  <tr>
                    <th>#</th>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th style={{ textAlign: 'center' }}>No. of Visits</th>
                    <th style={{ textAlign: 'center' }}>View</th>




                  </tr>
                </thead>
                <tbody>
                  {loading && callRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="emp-dash__spinner"></div>
                          <span className="text-sm font-medium text-gray-500">Loading visit records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSummary.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FaPhone className="text-4xl text-gray-300" />
                          <p className="text-gray-500 font-medium">No records found</p>
                          <p className="text-gray-400 text-xs">
                            Try adjusting the month filter or search query
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredSummary.map((row, idx) => (
                        <motion.tr
                          key={row.empId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                          className="hover:bg-gray-50/60 transition-all group"
                        >
                          <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>
                          <td className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">
                            {row.empId}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-inner">
                                {row.empName?.[0]?.toUpperCase() || 'E'}
                              </div>
                              <span className="font-semibold text-gray-900 text-xs whitespace-nowrap group-hover:text-blue-600 transition-colors">
                                {row.empName}
                              </span>
                            </div>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {row.visits}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <button
                              onClick={() => handleView(row.empId, row.empName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm"
                            >
                              <FaEye className="text-[11px]" />
                              View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>










          </div>

          {/* Footer count */}
          {!loading && filteredSummary.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500">
                Showing{' '}
                <span className="text-gray-900 font-bold">{filteredSummary.length}</span> employees
                for <span className="text-blue-600 font-bold">{getPeriodLabel()}</span>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════════
           ── Set Target Modal ──
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showTargetModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="target-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTargetModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />

            {/* Modal Panel */}
            <motion.div
              key="target-modal"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
                style={{ maxWidth: '560px', maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.4rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FiBullseye style={{ color: '#fff', fontSize: '1rem' }} />
                    </div>
                    <div>
                      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                        Set Visit Target
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', margin: 0 }}>
                        Assign monthly visit targets to employees
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeTargetModal}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.85rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Modal Body — scrollable */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {/* ── Assign Form ── */}
                  <form onSubmit={handleTargetSubmit} style={{ padding: '1.25rem 1.4rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                      {/* Employee Select */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '0.4rem',
                          }}
                        >
                          Select Employee <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        {empLoading ? (
                          <div
                            style={{
                              padding: '0.6rem 0.9rem',
                              background: '#f3f4f6',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              color: '#6b7280',
                            }}
                          >
                            Loading employees...
                          </div>
                        ) : (
                          <select
                            name="employeeId"
                            value={targetForm.employeeId}
                            onChange={handleTargetFormChange}
                            required
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.85rem',
                              fontSize: '0.82rem',
                              border: '1.5px solid #d1d5db',
                              borderRadius: '8px',
                              background: '#fff',
                              color: '#111827',
                              outline: 'none',
                              cursor: 'pointer',
                              appearance: 'auto',
                            }}
                          >
                            <option value="">— Select Employee —</option>
                            {allEmployees.map((emp) => (
                              <option key={emp._id || emp.employeeId} value={emp.employeeId}>
                                {emp.employeeId} — {emp.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Month */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '0.4rem',
                          }}
                        >
                          Target Month <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="month"
                          name="month"
                          value={targetForm.month}
                          onChange={handleTargetFormChange}
                          required
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.85rem',
                            fontSize: '0.82rem',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#fff',
                            color: '#111827',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {/* Target Number */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '0.4rem',
                          }}
                        >
                          Visit Target (count) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="number"
                          name="target"
                          value={targetForm.target}
                          onChange={handleTargetFormChange}
                          min="1"
                          placeholder="e.g. 30"
                          required
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.85rem',
                            fontSize: '0.82rem',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '8px',
                            background: '#fff',
                            color: '#111827',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {/* Feedback messages */}
                      {targetError && (
                        <div
                          style={{
                            padding: '0.6rem 0.9rem',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            color: '#b91c1c',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {targetError}
                        </div>
                      )}
                      {targetSuccess && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.6rem 0.9rem',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            borderRadius: '8px',
                            color: '#15803d',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <FaCheckCircle />
                          {targetSuccess}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={targetSubmitting}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          background: targetSubmitting
                            ? '#a5b4fc'
                            : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: targetSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'opacity 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <FiBullseye />
                        {targetSubmitting ? 'Assigning...' : 'Assign Target'}
                      </button>
                    </div>
                  </form>

                  {/* ── Existing Targets Table ── */}
                  <div
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      padding: '1rem 1.4rem 1.4rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#374151',
                            margin: 0,
                          }}
                        >
                          Targets for{' '}
                          <span style={{ color: '#4f46e5' }}>{getMonthLabel(viewTargetsMonth)}</span>
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="month"
                          value={viewTargetsMonth}
                          onChange={(e) => {
                            setViewTargetsMonth(e.target.value);
                            fetchTargets(e.target.value);
                          }}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#111827',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        {targetsLoading && (
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Loading...</span>
                        )}
                      </div>
                    </div>

                    {existingTargets.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '1.5rem',
                          background: '#f9fafb',
                          borderRadius: '10px',
                          color: '#9ca3af',
                          fontSize: '0.78rem',
                        }}
                      >
                        <FiBullseye style={{ fontSize: '1.5rem', marginBottom: '0.4rem', display: 'block', margin: '0 auto 0.4rem' }} />
                        No targets set for this month yet.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.78rem',
                          }}
                        >
                          <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                              <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderRadius: '6px 0 0 6px' }}>
                                Emp ID
                              </th>
                              <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                                Name
                              </th>
                              <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                                Target
                              </th>
                              <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                                Progress
                              </th>
                              <th style={{ padding: '0.45rem 0.65rem', textAlign: 'center', fontWeight: 700, color: '#374151', borderRadius: '0 6px 6px 0' }}>
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {existingTargets.map((t) => (
                              <tr
                                key={t._id}
                                style={{ borderBottom: '1px solid #f3f4f6' }}
                              >
                                <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600, color: '#1e293b' }}>
                                  {t.employeeId}
                                </td>
                                <td style={{ padding: '0.45rem 0.65rem', color: '#374151' }}>
                                  {t.employeeName || '—'}
                                </td>
                                <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
                                  <span
                                    style={{
                                      padding: '0.2rem 0.65rem',
                                      background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)',
                                      color: '#4f46e5',
                                      borderRadius: '20px',
                                      fontWeight: 700,
                                      fontSize: '0.78rem',
                                    }}
                                  >
                                    {t.target} visits
                                  </span>
                                </td>
                                <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
                                  {(() => {
                                    const completedVisits = callRecords.filter(
                                      (r) => r.employeeId === t.employeeId &&
                                      new Date(r.createdAt).toISOString().slice(0, 7) === viewTargetsMonth
                                    ).length;
                                    const progress = Math.min((completedVisits / t.target) * 100, 100);
                                    const isCompleted = completedVisits >= t.target;
                                    return (
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                        <div style={{ 
                                          width: '80px', 
                                          height: '6px', 
                                          background: '#e5e7eb', 
                                          borderRadius: '3px', 
                                          overflow: 'hidden' 
                                        }}>
                                          <div style={{ 
                                            width: `${progress}%`, 
                                            height: '100%', 
                                            background: isCompleted ? '#10b981' : '#4f46e5',
                                            transition: 'width 0.3s ease' 
                                          }} />
                                        </div>
                                        <span style={{ 
                                          fontSize: '0.7rem', 
                                          fontWeight: 600, 
                                          color: isCompleted ? '#10b981' : '#4f46e5' 
                                        }}>
                                          {completedVisits}/{t.target}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
                                  <button
                                    onClick={() => handleDeleteTarget(t._id)}
                                    title="Delete target"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#ef4444',
                                      padding: '0.25rem',
                                      borderRadius: '4px',
                                      transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                  >
                                    <FaTrash style={{ fontSize: '0.78rem' }} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '0.85rem 1.4rem',
                    borderTop: '1px solid #e5e7eb',
                    background: '#f9fafb',
                  }}
                >
                  <button
                    onClick={closeTargetModal}
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#374151',
                      background: '#fff',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {showModal && modalEmployee && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />

            {/* Modal Panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[201] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <div>
                    <h2 className="text-white font-bold text-base">
                      {modalEmployee.empName} — Visit Details
                    </h2>
                    <p className="text-blue-100 text-xs mt-0.5">
                      {getPeriodLabel()} &nbsp;·&nbsp;{' '}
                      <span className="font-semibold">{modalRecords.length} visit{modalRecords.length !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleModalDownload}
                      disabled={modalRecords.length === 0}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download CSV"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Modal Stats Bar */}
                <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 border-b border-gray-100">
                  {[
                    { label: 'Total', value: modalRecords.length, color: 'text-blue-600' },
                    { label: 'Pending', value: modalRecords.filter((r) => r.status === 'Pending').length, color: 'text-amber-600' },
                    { label: 'Lead', value: modalRecords.filter((r) => r.status === 'Lead').length, color: 'text-green-600' },
                    { label: 'Rejected', value: modalRecords.filter((r) => r.status === 'Rejected').length, color: 'text-red-600' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">{s.label}:</span>
                      <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Modal Table */}
                <div className="overflow-auto flex-1">
                  {modalRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <FaPhone className="text-4xl text-gray-300" />
                      <p className="text-gray-500 font-medium text-sm">No visit records for this period</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View - Hidden on Mobile */}
                      <div className="hidden md:block">
                        <table className="emp-dash__table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Date</th>
                              <th>Center Name</th>
                              <th>Client &amp; Contact</th>
                              <th>Address &amp; Location</th>
                              <th style={{ textAlign: 'center' }}>Status</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modalRecords.map((rec, idx) => (
                              <tr key={rec._id || idx} className="hover:bg-gray-50/60 transition-all">
                                <td className="text-xs text-gray-400 font-medium">{idx + 1}</td>
                                <td className="whitespace-nowrap">
                                  <span className="text-xs font-semibold text-gray-700">
                                    {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </td>
                                <td>
                                  <span className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                                    {rec.centerName}
                                  </span>
                                </td>
                                <td>
                                  <div className="flex flex-col">
                                    <span className="text-xs text-gray-900 font-medium">{rec.clientName}</span>
                                    <span className="text-[10px] text-gray-400">{rec.contact}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="flex flex-col gap-1 max-w-[220px]">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="text-xs text-gray-600 truncate"
                                        title={rec.address}
                                      >
                                        {rec.address}
                                      </span>
                                      {rec.addressLink && (
                                        <a
                                          href={rec.addressLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                          title="Open client address in Google Maps"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <FaLink size={10} />
                                        </a>
                                      )}
                                    </div>
                                    {rec.employeeLocation?.mapsLink && (
                                      <a
                                        href={rec.employeeLocation.mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
                                        title={
                                          rec.employeeLocation?.latitude != null && rec.employeeLocation?.longitude != null
                                            ? `Employee current location: ${rec.employeeLocation.latitude}, ${rec.employeeLocation.longitude}`
                                            : 'Open employee current location'
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <FaMapMarkerAlt size={9} />
                                        Employee location
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td className="text-center whitespace-nowrap">
                                  <span
                                    style={{
                                      padding: '0.2rem 0.55rem',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      backgroundColor:
                                        rec.status === 'Pending'
                                          ? '#fef0c7'
                                          : rec.status === 'Lead'
                                          ? '#e0f2fe'
                                          : '#fee4e2',
                                      color:
                                        rec.status === 'Pending'
                                          ? '#b54708'
                                          : rec.status === 'Lead'
                                          ? '#0369a1'
                                          : '#b42318',
                                    }}
                                  >
                                    {rec.status}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="text-xs text-gray-500 line-clamp-2 max-w-[180px]"
                                    title={rec.remarks}
                                  >
                                    {rec.remarks || '—'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View - Visible only on Mobile */}
                      <div className="md:hidden p-3">
                        <div className="space-y-3">
                          {modalRecords.map((rec, idx) => (
                            <div key={rec._id || idx} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">#{idx + 1}</span>
                                <span className="text-xs font-semibold text-gray-700">
                                  {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-sm font-semibold text-gray-800">{rec.centerName}</p>
                                <p className="text-xs text-gray-600"><span className="font-medium">Client:</span> {rec.clientName}</p>
                                <p className="text-xs text-gray-600"><span className="font-medium">Contact:</span> {rec.contact}</p>
                                <div className="flex items-start gap-1">
                                  <span className="text-xs text-gray-600 font-medium">Address:</span>
                                  <span className="text-xs text-gray-500 flex-1">{rec.address}</span>
                                  {rec.addressLink && (
                                    <a href={rec.addressLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                                      <FaLink size={10} />
                                    </a>
                                  )}
                                </div>
                                {rec.employeeLocation?.mapsLink && (
                                  <a href={rec.employeeLocation.mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                                    <FaMapMarkerAlt size={9} /> Employee location
                                  </a>
                                )}
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    rec.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    rec.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {rec.status}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate max-w-[120px]">{rec.remarks || '—'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
































                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    Employee ID:{' '}
                    <span className="font-bold text-gray-800">{modalEmployee.empId}</span>
                  </p>
                  <button
                    onClick={closeModal}
                    className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VisitsData;