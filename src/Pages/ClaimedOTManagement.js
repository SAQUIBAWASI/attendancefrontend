// // components/ClaimedOTManagement.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { FaEye, FaCheck, FaTimes, FaTrash, FaSearch, FaDownload } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// const API_BASE_URL = 'https://api.timelyhealth.in';

// export default function ClaimedOTManagement() {
//   const [claims, setClaims] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [summary, setSummary] = useState({
//     totalClaims: 0,
//     totalOTHours: 0,
//     pendingCount: 0,
//     approvedCount: 0,
//     rejectedCount: 0,
//     totalPages: 1,
//     currentPage: 1,
//     perPage: 10
//   });

//   // Filter states
//   const [filters, setFilters] = useState({
//     status: 'all',
//     employeeId: '',
//     fromDate: '',
//     toDate: '',
//     search: ''
//   });

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Modal states
//   const [selectedClaim, setSelectedClaim] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showBulkActionModal, setShowBulkActionModal] = useState(false);
//   const [selectedClaims, setSelectedClaims] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);

//   // Status update states
//   const [statusUpdate, setStatusUpdate] = useState({
//     status: 'approved',
//     rejectedReason: '',
//     notes: ''
//   });

//   // Multiplier states per claim
//   const [multipliers, setMultipliers] = useState({});

//   // Toast notification state
//   const [saveStatus, setSaveStatus] = useState('');
//   const saveStatusTimeoutRef = useRef(null);

//   // ====== showSaveStatus function ======
//   const showSaveStatus = (message) => {
//     setSaveStatus(message);
//     // Clear previous timeout if exists
//     if (saveStatusTimeoutRef.current) {
//       clearTimeout(saveStatusTimeoutRef.current);
//     }
//     // Auto-hide after 4 seconds
//     saveStatusTimeoutRef.current = setTimeout(() => {
//       setSaveStatus('');
//     }, 4000);
//   };

//   // Fetch claims
//   useEffect(() => {
//     fetchClaims();
//   }, [currentPage, filters]);

//   const fetchClaims = async () => {
//     try {
//       setLoading(true);
//       let url = `${API_BASE_URL}/api/employees/allotclaimed?page=${currentPage}&limit=${itemsPerPage}`;
      
//       if (filters.status !== 'all') url += `&status=${filters.status}`;
//       if (filters.employeeId) url += `&employeeId=${filters.employeeId}`;
//       if (filters.fromDate) url += `&fromDate=${filters.fromDate}`;
//       if (filters.toDate) url += `&toDate=${filters.toDate}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.success) {
//         setClaims(data.claims || []);
//         setSummary(data.summary || {});
        
//         // Initialize multipliers from localStorage
//         const initialMultipliers = {};
//         data.claims.forEach(claim => {
//           const key = `otMultiplier_${claim._id}`;
//           const saved = localStorage.getItem(key);
//           initialMultipliers[claim._id] = saved ? parseFloat(saved) : 2;
//         });
//         setMultipliers(initialMultipliers);
//       } else {
//         setError(data.message || 'Failed to fetch claims');
//       }
//     } catch (err) {
//       console.error('Error fetching claims:', err);
//       setError('Error fetching claims');
//       toast.error('Failed to load OT claims');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFilters({
//       status: 'all',
//       employeeId: '',
//       fromDate: '',
//       toDate: '',
//       search: ''
//     });
//     setCurrentPage(1);
//   };

//   // Calculate OT Amount (returns number - rounded to 2 decimal places)
//   const calculateOTAmountNumber = (claim) => {
//     const salaryPerMonth = claim.employeeDetails?.salaryPerMonth || 0;
//     const otHours = claim.otHours || 0;
//     const multiplier = multipliers[claim._id] || 2;
    
//     if (!salaryPerMonth || !otHours) return 0;
    
//     const dailySalary = salaryPerMonth / 26;
//     const hourlyRate = dailySalary / 8;
//     const otAmount = hourlyRate * multiplier * otHours;
    
//     // Round to 2 decimal places
//     return Math.round(otAmount * 100) / 100;
//   };

//   // Calculate OT Amount (returns formatted string)
//   const calculateOTAmount = (claim) => {
//     const amount = calculateOTAmountNumber(claim);
//     return `₹${amount.toFixed(2)}`;
//   };

//   // Get multiplier value
//   const getMultiplier = (claimId) => {
//     return multipliers[claimId] || 2;
//   };

//   // Handle multiplier change
//   const handleMultiplierChange = (claimId, value) => {
//     const multiplier = parseFloat(value);
//     setMultipliers(prev => ({ ...prev, [claimId]: multiplier }));
//     localStorage.setItem(`otMultiplier_${claimId}`, multiplier);
//   };

//   // Export CSV
//   const exportCSV = () => {
//     if (claims.length === 0) {
//       toast.warning('No data to export');
//       return;
//     }

//     const headers = [
//       'Employee ID',
//       'Employee Name',
//       'Department',
//       'Date',
//       'OT Hours',
//       'Multiplier',
//       'OT Amount',
//       'Reason',
//       'Status',
//       'Approved By',
//       'Approved At'
//     ];

//     const rows = claims.map(claim => [
//       claim.employeeId || '',
//       claim.employeeName || '',
//       claim.employeeDetails?.department || '',
//       formatDate(claim.date) || '',
//       claim.otHours || 0,
//       `${getMultiplier(claim._id)}x`,
//       calculateOTAmount(claim),
//       claim.reason || '',
//       claim.status || '',
//       claim.approvedBy || '',
//       claim.approvedAt ? formatDate(claim.approvedAt) : ''
//     ]);

//     const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `OT_Claims_${new Date().toISOString().slice(0, 10)}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//     showSaveStatus('✅ CSV exported successfully!');
//   };

//   // Handle status update with OT amount and multiplier
//   const handleStatusUpdate = async () => {
//     try {
//       // Calculate OT amount for the selected claim (rounded to 2 decimal places)
//       const otAmount = calculateOTAmountNumber(selectedClaim);
//       const multiplier = getMultiplier(selectedClaim._id);

//       const payload = {
//         status: statusUpdate.status,
//         rejectedReason: statusUpdate.status === 'rejected' ? statusUpdate.rejectedReason : undefined,
//         notes: statusUpdate.notes || undefined,
//         otAmount: otAmount,
//         multiplier: multiplier
//       };

//       const response = await fetch(`${API_BASE_URL}/api/employees/update-otclaimedstatus/${selectedClaim._id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       if (data.success) {
//         showSaveStatus(`✅ Claim ${statusUpdate.status} successfully! OT Amount: ₹${otAmount.toFixed(2)} at ${multiplier}x`);
//         setShowStatusModal(false);
//         setSelectedClaim(null);
//         fetchClaims();
//       } else {
//         toast.error(data.message || 'Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       toast.error('Error updating status');
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/employees/delete-claim/${selectedClaim._id}`, {
//         method: 'DELETE'
//       });

//       const data = await response.json();
//       if (data.success) {
//         showSaveStatus('✅ Claim deleted successfully!');
//         setShowDeleteModal(false);
//         setSelectedClaim(null);
//         fetchClaims();
//       } else {
//         toast.error(data.message || 'Failed to delete claim');
//       }
//     } catch (error) {
//       console.error('Error deleting claim:', error);
//       toast.error('Error deleting claim');
//     }
//   };

//   const handleBulkAction = async (action, status) => {
//     if (selectedClaims.length === 0) {
//       toast.warning('Please select at least one claim');
//       return;
//     }

//     try {
//       let url = '';
//       let body = {};

//       if (action === 'status') {
//         // Calculate total OT amount for selected claims (rounded to 2 decimal places)
//         const selectedClaimsData = claims.filter(c => selectedClaims.includes(c._id));
//         const totalOTAmount = selectedClaimsData.reduce((sum, claim) => {
//           return sum + calculateOTAmountNumber(claim);
//         }, 0);
//         const multipliersData = {};
//         selectedClaimsData.forEach(claim => {
//           multipliersData[claim._id] = getMultiplier(claim._id);
//         });

//         url = `${API_BASE_URL}/api/employees/bulk-update-status`;
//         body = {
//           claimIds: selectedClaims,
//           status: status,
//           ...(status === 'rejected' && { rejectedReason: 'Bulk rejection' }),
//           otAmount: Math.round(totalOTAmount * 100) / 100,
//           multipliers: multipliersData
//         };
//       } else if (action === 'delete') {
//         url = `${API_BASE_URL}/api/employees/bulk-delete`;
//         body = { claimIds: selectedClaims };
//       }

//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });

//       const data = await response.json();
//       if (data.success) {
//         showSaveStatus(`✅ ${data.message}`);
//         setSelectedClaims([]);
//         setSelectAll(false);
//         setShowBulkActionModal(false);
//         fetchClaims();
//       } else {
//         toast.error(data.message || 'Bulk action failed');
//       }
//     } catch (error) {
//       console.error('Error in bulk action:', error);
//       toast.error('Error performing bulk action');
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedClaims([]);
//     } else {
//       setSelectedClaims(claims.map(c => c._id));
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleSelectClaim = (claimId) => {
//     if (selectedClaims.includes(claimId)) {
//       setSelectedClaims(selectedClaims.filter(id => id !== claimId));
//     } else {
//       setSelectedClaims([...selectedClaims, claimId]);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       approved: 'bg-green-100 text-green-800 border-green-300',
//       rejected: 'bg-red-100 text-red-800 border-red-300'
//     };
//     const labels = {
//       pending: '🟡 Pending',
//       approved: '🟢 Approved',
//       rejected: '🔴 Rejected'
//     };
//     return (
//       <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100'}`}>
//         {labels[status] || status}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const delta = 2;
//     const total = summary.totalPages || 1;
//     for (let i = Math.max(1, currentPage - delta); i <= Math.min(total, currentPage + delta); i++) {
//       pages.push(i);
//     }
//     return pages;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading OT Claims...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Toast notification */}
//         {saveStatus && (
//           <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
//             saveStatus.includes('✅') ? 'bg-green-600 border-l-4 border-green-700' : 'bg-red-500 border-l-4 border-red-600'
//           }`}>
//             {saveStatus}
//           </div>
//         )}

//         {/* Header */}
//         <div className="mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">OT Claims Management</h1>
//           <p className="text-sm text-gray-600">Manage all overtime claims from employees</p>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-5">
//           <div className="p-3 bg-white rounded-lg shadow">
//             <p className="text-xs text-gray-500">Total Claims</p>
//             <p className="text-xl font-bold text-gray-800">{summary.totalClaims}</p>
//           </div>
//           <div className="p-3 bg-white rounded-lg shadow">
//             <p className="text-xs text-gray-500">OT Hours</p>
//             <p className="text-xl font-bold text-orange-600">{summary.totalOTHours}h</p>
//           </div>
//           <div className="p-3 bg-white rounded-lg shadow">
//             <p className="text-xs text-gray-500">Pending</p>
//             <p className="text-xl font-bold text-yellow-600">{summary.pendingCount}</p>
//           </div>
//           <div className="p-3 bg-white rounded-lg shadow">
//             <p className="text-xs text-gray-500">Approved</p>
//             <p className="text-xl font-bold text-green-600">{summary.approvedCount}</p>
//           </div>
//           <div className="p-3 bg-white rounded-lg shadow">
//             <p className="text-xs text-gray-500">Rejected</p>
//             <p className="text-xl font-bold text-red-600">{summary.rejectedCount}</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="p-2 mb-3 bg-white border border-gray-200 rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             {/* Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 name="employeeId"
//                 placeholder="Search by Employee ID..."
//                 value={filters.employeeId}
//                 onChange={handleFilterChange}
//                 className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Status Filter */}
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleFilterChange}
//               className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>

//             {/* From Date */}
//             <input
//               type="date"
//               name="fromDate"
//               value={filters.fromDate}
//               onChange={handleFilterChange}
//               className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500"
//               placeholder="From"
//             />

//             {/* To Date */}
//             <input
//               type="date"
//               name="toDate"
//               value={filters.toDate}
//               onChange={handleFilterChange}
//               className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500"
//               placeholder="To"
//             />

//             {/* Clear Filters */}
//             {(filters.status !== 'all' || filters.employeeId || filters.fromDate || filters.toDate) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
//               >
//                 Clear
//               </button>
//             )}

//             {/* Search Button */}
//             <button
//               onClick={fetchClaims}
//               className="h-8 px-3 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"
//             >
//               <FaSearch size={12} /> Search
//             </button>

//             {/* Export CSV Button */}
//             <button
//               onClick={exportCSV}
//               className="h-8 px-3 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1"
//             >
//               <FaDownload size={12} /> Export CSV
//             </button>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         {selectedClaims.length > 0 && (
//           <div className="p-3 mb-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
//             <span className="text-sm font-medium text-blue-700">
//               {selectedClaims.length} claims selected
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowBulkActionModal(true)}
//                 className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//               >
//                 Bulk Actions
//               </button>
//               <button
//                 onClick={() => setSelectedClaims([])}
//                 className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
//               >
//                 Clear Selection
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="p-0 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 px-3 text-center">
//                     <input
//                       type="checkbox"
//                       checked={selectAll}
//                       onChange={handleSelectAll}
//                       className="w-4 h-4 rounded border-gray-300"
//                     />
//                   </th>
//                   <th className="py-2 px-3 text-center">Employee</th>
//                   <th className="py-2 px-3 text-center">Date</th>
//                   <th className="py-2 px-3 text-center">OT Hours</th>
//                   <th className="py-2 px-3 text-center">Multiplier</th>
//                   <th className="py-2 px-3 text-center">OT Amount</th>
//                   <th className="py-2 px-3 text-center">Reason</th>
//                   <th className="py-2 px-3 text-center">Status</th>
//                   <th className="py-2 px-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {claims.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
//                       No OT claims found
//                     </td>
//                   </tr>
//                 ) : (
//                   claims.map((claim) => (
//                     <tr key={claim._id} className="border-t border-gray-200 hover:bg-blue-50">
//                       <td className="px-3 py-2 text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedClaims.includes(claim._id)}
//                           onChange={() => handleSelectClaim(claim._id)}
//                           className="w-4 h-4 rounded border-gray-300"
//                           disabled={claim.status !== 'pending'}
//                         />
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <div>
//                           <div className="font-medium text-gray-900">{claim.employeeName}</div>
//                           <div className="text-xs text-gray-500">{claim.employeeId}</div>
//                           <div className="text-xs text-gray-400">{claim.employeeDetails?.department || '-'}</div>
//                         </div>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <div className="text-sm text-gray-900">{formatDate(claim.date)}</div>
//                         <div className="text-xs text-gray-500">{formatTime(claim.date)}</div>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <span className="font-semibold text-orange-600">{claim.otHours}h</span>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <select
//                           value={getMultiplier(claim._id)}
//                           onChange={(e) => handleMultiplierChange(claim._id, e.target.value)}
//                           className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900"
//                         >
//                           <option value={1}>1x</option>
//                           <option value={1.5}>1.5x</option>
//                           <option value={2}>2x</option>
//                           <option value={2.5}>2.5x</option>
//                           <option value={3}>3x</option>
//                         </select>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <span className="font-semibold text-green-600">
//                           {calculateOTAmount(claim)}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <div className="max-w-xs text-sm text-gray-600 truncate">
//                           {claim.reason || '-'}
//                         </div>
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         {getStatusBadge(claim.status)}
//                       </td>
//                       <td className="px-3 py-2 text-center">
//                         <div className="flex items-center justify-center gap-1">
//                           {/* View Details */}
//                           <button
//                             onClick={() => {
//                               setSelectedClaim(claim);
//                               setShowDetailsModal(true);
//                             }}
//                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
//                             title="View Details"
//                           >
//                             <FaEye size={15} />
//                           </button>

//                           {/* Update Status */}
//                           {claim.status === 'pending' && (
//                             <button
//                               onClick={() => {
//                                 setSelectedClaim(claim);
//                                 setStatusUpdate({ status: 'approved', rejectedReason: '', notes: '' });
//                                 setShowStatusModal(true);
//                               }}
//                               className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
//                               title="Update Status"
//                             >
//                               <FaCheck size={15} />
//                             </button>
//                           )}

//                           {/* Delete */}
//                           {claim.status === 'pending' && (
//                             <button
//                               onClick={() => {
//                                 setSelectedClaim(claim);
//                                 setShowDeleteModal(true);
//                               }}
//                               className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
//                               title="Delete"
//                             >
//                               <FaTrash size={15} />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             {claims.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-2 pb-4 sm:flex-row px-4">
//                 <div className="flex flex-wrap items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <label className="text-sm font-medium text-gray-700">Show:</label>
//                     <select
//                       value={itemsPerPage}
//                       onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
//                       className="p-2 text-sm border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                     <span className="text-sm text-gray-500">entries</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-1 text-sm border rounded-lg ${
//                       currentPage === 1
//                         ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
//                         : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   {getPageNumbers().map(page => (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`px-4 py-1 text-sm border rounded-lg ${
//                         currentPage === page
//                           ? 'text-white bg-blue-600 border-blue-600'
//                           : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={() => setCurrentPage(p => Math.min(summary.totalPages || 1, p + 1))}
//                     disabled={currentPage === (summary.totalPages || 1)}
//                     className={`px-4 py-1 text-sm border rounded-lg ${
//                       currentPage === (summary.totalPages || 1)
//                         ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
//                         : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ==================== MODALS ==================== */}

//       {/* Details Modal */}
//       {showDetailsModal && selectedClaim && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 z-10 p-4 bg-white border-b">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-gray-800">Claim Details</h2>
//                 <button
//                   onClick={() => {
//                     setShowDetailsModal(false);
//                     setSelectedClaim(null);
//                   }}
//                   className="p-1 text-gray-500 hover:text-gray-700 text-xl"
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Employee Info */}
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h3 className="mb-2 font-semibold text-gray-700">Employee Information</h3>
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <div><span className="font-medium">Name:</span> {selectedClaim.employeeName}</div>
//                   <div><span className="font-medium">ID:</span> {selectedClaim.employeeId}</div>
//                   <div><span className="font-medium">Department:</span> {selectedClaim.employeeDetails?.department || 'N/A'}</div>
//                   <div><span className="font-medium">Email:</span> {selectedClaim.employeeDetails?.email || 'N/A'}</div>
//                   <div><span className="font-medium">Salary/Month:</span> ₹{selectedClaim.employeeDetails?.salaryPerMonth?.toLocaleString() || '0'}</div>
//                 </div>
//               </div>

//               {/* Claim Info */}
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h3 className="mb-2 font-semibold text-gray-700">Claim Information</h3>
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <div><span className="font-medium">Date:</span> {formatDate(selectedClaim.date)}</div>
//                   <div><span className="font-medium">OT Hours:</span> <span className="font-bold text-orange-600">{selectedClaim.otHours}h</span></div>
//                   <div><span className="font-medium">Multiplier:</span> {getMultiplier(selectedClaim._id)}x</div>
//                   <div><span className="font-medium">OT Amount:</span> <span className="font-bold text-green-600">{calculateOTAmount(selectedClaim)}</span></div>
//                   <div className="col-span-2"><span className="font-medium">Reason:</span> {selectedClaim.reason}</div>
//                   <div className="col-span-2"><span className="font-medium">Status:</span> {getStatusBadge(selectedClaim.status)}</div>
//                   {selectedClaim.status === 'approved' && (
//                     <>
//                       <div><span className="font-medium">Approved By:</span> {selectedClaim.approvedBy || 'Admin'}</div>
//                       <div><span className="font-medium">Approved At:</span> {formatDate(selectedClaim.approvedAt)}</div>
//                     </>
//                   )}
//                   {selectedClaim.status === 'rejected' && (
//                     <div className="col-span-2">
//                       <span className="font-medium">Rejected Reason:</span> {selectedClaim.rejectedReason || 'N/A'}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Attendance Info */}
//               {selectedClaim.attendanceDetails && (
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <h3 className="mb-2 font-semibold text-gray-700">Attendance Details</h3>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div><span className="font-medium">Check In:</span> {formatTime(selectedClaim.attendanceDetails.checkInTime)}</div>
//                     <div><span className="font-medium">Check Out:</span> {formatTime(selectedClaim.attendanceDetails.checkOutTime)}</div>
//                     <div><span className="font-medium">Total Hours:</span> {selectedClaim.attendanceDetails.totalHours}h</div>
//                     <div><span className="font-medium">Assigned Shift:</span> {selectedClaim.attendanceDetails.assignedShiftHours}h</div>
//                     <div><span className="font-medium">Location:</span> {selectedClaim.attendanceDetails.onsite ? '🏢 Onsite' : '🏠 Remote'}</div>
//                     <div><span className="font-medium">Distance:</span> {(selectedClaim.attendanceDetails.distance / 1000).toFixed(1)} km</div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               {selectedClaim.status === 'pending' && (
//                 <div className="flex gap-2 pt-4 border-t">
//                   <button
//                     onClick={() => {
//                       setShowDetailsModal(false);
//                       setShowStatusModal(true);
//                     }}
//                     className="flex-1 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700"
//                   >
//                     Approve/Reject
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowDetailsModal(false);
//                       setShowDeleteModal(true);
//                     }}
//                     className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Update Modal */}
//       {showStatusModal && selectedClaim && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-2xl">
//             <div className="p-4 border-b">
//               <h2 className="text-xl font-bold text-gray-800">Update Claim Status</h2>
//               <p className="text-sm text-gray-500">
//                 {selectedClaim.employeeName} - {formatDate(selectedClaim.date)}
//               </p>
//               <p className="text-sm text-green-600 font-medium">
//                 OT Amount: {calculateOTAmount(selectedClaim)} at {getMultiplier(selectedClaim._id)}x
//               </p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <select
//                   value={statusUpdate.status}
//                   onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
//                   className="w-full p-2 mt-1 border rounded-lg"
//                 >
//                   <option value="approved">✅ Approved</option>
//                   <option value="rejected">❌ Rejected</option>
//                 </select>
//               </div>

//               {statusUpdate.status === 'rejected' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
//                   <textarea
//                     value={statusUpdate.rejectedReason}
//                     onChange={(e) => setStatusUpdate(prev => ({ ...prev, rejectedReason: e.target.value }))}
//                     placeholder="Why is this claim being rejected?"
//                     className="w-full p-2 mt-1 border rounded-lg"
//                     rows="3"
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
//                 <textarea
//                   value={statusUpdate.notes}
//                   onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
//                   placeholder="Add any notes..."
//                   className="w-full p-2 mt-1 border rounded-lg"
//                   rows="2"
//                 />
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button
//                   onClick={() => {
//                     setShowStatusModal(false);
//                     setSelectedClaim(null);
//                   }}
//                   className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleStatusUpdate}
//                   className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   Update Status
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteModal && selectedClaim && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-2xl">
//             <div className="p-4 border-b">
//               <h2 className="text-xl font-bold text-red-600">Delete Claim</h2>
//             </div>

//             <div className="p-6">
//               <p className="text-gray-700">
//                 Are you sure you want to delete this OT claim?
//               </p>
//               <div className="p-3 mt-4 bg-gray-50 rounded-lg">
//                 <p><span className="font-medium">Employee:</span> {selectedClaim.employeeName}</p>
//                 <p><span className="font-medium">Date:</span> {formatDate(selectedClaim.date)}</p>
//                 <p><span className="font-medium">OT Hours:</span> {selectedClaim.otHours}h</p>
//                 <p><span className="font-medium">Multiplier:</span> {getMultiplier(selectedClaim._id)}x</p>
//                 <p><span className="font-medium">OT Amount:</span> {calculateOTAmount(selectedClaim)}</p>
//                 <p><span className="font-medium">Reason:</span> {selectedClaim.reason}</p>
//               </div>
//               <p className="mt-3 text-sm text-red-600">
//                 ⚠️ This action cannot be undone. Only pending claims can be deleted.
//               </p>

//               <div className="flex gap-2 pt-4">
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setSelectedClaim(null);
//                   }}
//                   className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Action Modal */}
//       {showBulkActionModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white rounded-2xl">
//             <div className="p-4 border-b">
//               <h2 className="text-xl font-bold text-gray-800">Bulk Actions</h2>
//               <p className="text-sm text-gray-500">{selectedClaims.length} claims selected</p>
//             </div>

//             <div className="p-6 space-y-3">
//               <button
//                 onClick={() => handleBulkAction('status', 'approved')}
//                 className="w-full p-3 text-left text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
//               >
//                 <FaCheck className="inline mr-2" /> Approve All
//               </button>
//               <button
//                 onClick={() => handleBulkAction('status', 'rejected')}
//                 className="w-full p-3 text-left text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
//               >
//                 <FaTimes className="inline mr-2" /> Reject All
//               </button>
//               <button
//                 onClick={() => {
//                   if (window.confirm(`Delete ${selectedClaims.length} claims?`)) {
//                     handleBulkAction('delete', null);
//                   }
//                 }}
//                 className="w-full p-3 text-left text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
//               >
//                 <FaTrash className="inline mr-2" /> Delete All
//               </button>

//               <button
//                 onClick={() => {
//                   setShowBulkActionModal(false);
//                 }}
//                 className="w-full p-2 mt-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(-10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in { animation: fade-in 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// }



// components/ClaimedOTManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaCheck, FaTimes, FaTrash, FaSearch, FaDownload, FaList } from 'react-icons/fa';
import { FiClock, FiCheckCircle, FiXCircle, FiFileText, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://api.timelyhealth.in';

export default function ClaimedOTManagement() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalClaims: 0,
    totalOTHours: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    employeeId: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Status update states
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'approved',
    rejectedReason: '',
    notes: ''
  });

  // Multiplier states per claim
  const [multipliers, setMultipliers] = useState({});

  // Toast notification state
  const [saveStatus, setSaveStatus] = useState('');
  const saveStatusTimeoutRef = useRef(null);

  // ====== showSaveStatus function ======
  const showSaveStatus = (message) => {
    setSaveStatus(message);
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus('');
    }, 4000);
  };

  // Fetch claims
  useEffect(() => {
    fetchClaims();
  }, [currentPage, filters]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/employees/allotclaimed?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (filters.status !== 'all') url += `&status=${filters.status}`;
      if (filters.employeeId) url += `&employeeId=${filters.employeeId}`;
      if (filters.fromDate) url += `&fromDate=${filters.fromDate}`;
      if (filters.toDate) url += `&toDate=${filters.toDate}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setClaims(data.claims || []);
        setSummary(data.summary || {});
        
        const initialMultipliers = {};
        data.claims.forEach(claim => {
          const key = `otMultiplier_${claim._id}`;
          const saved = localStorage.getItem(key);
          initialMultipliers[claim._id] = saved ? parseFloat(saved) : 2;
        });
        setMultipliers(initialMultipliers);
      } else {
        setError(data.message || 'Failed to fetch claims');
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Error fetching claims');
      toast.error('Failed to load OT claims');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      employeeId: '',
      fromDate: '',
      toDate: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const calculateOTAmountNumber = (claim) => {
    const salaryPerMonth = claim.employeeDetails?.salaryPerMonth || 0;
    const otHours = claim.otHours || 0;
    const multiplier = multipliers[claim._id] || 2;
    
    if (!salaryPerMonth || !otHours) return 0;
    
    const dailySalary = salaryPerMonth / 26;
    const hourlyRate = dailySalary / 8;
    const otAmount = hourlyRate * multiplier * otHours;
    
    return Math.round(otAmount * 100) / 100;
  };

  const calculateOTAmount = (claim) => {
    const amount = calculateOTAmountNumber(claim);
    return `₹${amount.toFixed(2)}`;
  };

  const getMultiplier = (claimId) => {
    return multipliers[claimId] || 2;
  };

  const handleMultiplierChange = (claimId, value) => {
    const multiplier = parseFloat(value);
    setMultipliers(prev => ({ ...prev, [claimId]: multiplier }));
    localStorage.setItem(`otMultiplier_${claimId}`, multiplier);
  };

  const exportCSV = () => {
    if (claims.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Date',
      'OT Hours',
      'Multiplier',
      'OT Amount',
      'Reason',
      'Status',
      'Approved By',
      'Approved At'
    ];

    const rows = claims.map(claim => [
      claim.employeeId || '',
      claim.employeeName || '',
      claim.employeeDetails?.department || '',
      formatDate(claim.date) || '',
      claim.otHours || 0,
      `${getMultiplier(claim._id)}x`,
      calculateOTAmount(claim),
      claim.reason || '',
      claim.status || '',
      claim.approvedBy || '',
      claim.approvedAt ? formatDate(claim.approvedAt) : ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `OT_Claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSaveStatus('✅ CSV exported successfully!');
  };

  const handleStatusUpdate = async () => {
    try {
      const otAmount = calculateOTAmountNumber(selectedClaim);
      const multiplier = getMultiplier(selectedClaim._id);

      const payload = {
        status: statusUpdate.status,
        rejectedReason: statusUpdate.status === 'rejected' ? statusUpdate.rejectedReason : undefined,
        notes: statusUpdate.notes || undefined,
        otAmount: otAmount,
        multiplier: multiplier
      };

      const response = await fetch(`${API_BASE_URL}/api/employees/update-otclaimedstatus/${selectedClaim._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus(`✅ Claim ${statusUpdate.status} successfully! OT Amount: ₹${otAmount.toFixed(2)} at ${multiplier}x`);
        setShowStatusModal(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/delete-claim/${selectedClaim._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus('✅ Claim deleted successfully!');
        setShowDeleteModal(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(data.message || 'Failed to delete claim');
      }
    } catch (error) {
      console.error('Error deleting claim:', error);
      toast.error('Error deleting claim');
    }
  };

  const handleBulkAction = async (action, status) => {
    if (selectedClaims.length === 0) {
      toast.warning('Please select at least one claim');
      return;
    }

    try {
      let url = '';
      let body = {};

      if (action === 'status') {
        const selectedClaimsData = claims.filter(c => selectedClaims.includes(c._id));
        const totalOTAmount = selectedClaimsData.reduce((sum, claim) => {
          return sum + calculateOTAmountNumber(claim);
        }, 0);
        const multipliersData = {};
        selectedClaimsData.forEach(claim => {
          multipliersData[claim._id] = getMultiplier(claim._id);
        });

        url = `${API_BASE_URL}/api/employees/bulk-update-status`;
        body = {
          claimIds: selectedClaims,
          status: status,
          ...(status === 'rejected' && { rejectedReason: 'Bulk rejection' }),
          otAmount: Math.round(totalOTAmount * 100) / 100,
          multipliers: multipliersData
        };
      } else if (action === 'delete') {
        url = `${API_BASE_URL}/api/employees/bulk-delete`;
        body = { claimIds: selectedClaims };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        showSaveStatus(`✅ ${data.message}`);
        setSelectedClaims([]);
        setSelectAll(false);
        setShowBulkActionModal(false);
        fetchClaims();
      } else {
        toast.error(data.message || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Error performing bulk action');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(claims.map(c => c._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectClaim = (claimId) => {
    if (selectedClaims.includes(claimId)) {
      setSelectedClaims(selectedClaims.filter(id => id !== claimId));
    } else {
      setSelectedClaims([...selectedClaims, claimId]);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    const dots = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100'}`}>
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dots[status] || 'bg-gray-500'}`}></span>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const total = summary.totalPages || 1;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(total, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-gray-200 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">Loading OT Claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">✕</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      {/* Toast notification */}
      {saveStatus && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
          saveStatus.includes('✅') ? 'bg-green-600' : 'bg-red-500'
        }`}>
          {saveStatus}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaList className="text-orange-600" />
          OT Claims Management
        </h1>
        <p className="text-sm text-gray-500">Manage all overtime claims from employees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50">
              <FiFileText className="text-indigo-600 text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.totalClaims}</div>
          <div className="text-xs text-gray-400">all claims</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50">
              <FiClock className="text-orange-600 text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{summary.totalOTHours}h</div>
          <div className="text-xs text-gray-400">total hours</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-50">
              <FiClock className="text-yellow-600 text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</div>
          <div className="text-xs text-gray-400">awaiting approval</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50">
              <FiCheckCircle className="text-green-600 text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{summary.approvedCount}</div>
          <div className="text-xs text-gray-400">approved claims</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</span>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50">
              <FiXCircle className="text-red-600 text-sm" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{summary.rejectedCount}</div>
          <div className="text-xs text-gray-400">rejected claims</div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiList className="text-orange-600 text-sm" />
            <span className="text-sm font-semibold text-gray-700">Filters</span>
          </div>
          {(filters.status !== 'all' || filters.employeeId || filters.fromDate || filters.toDate) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
            >
              ✕ Clear
            </button>
          )}
        </div>
        
        <div className="p-4 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="employeeId"
                  placeholder="Employee ID..."
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">To Date</label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>

            {/* Search Button */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">&nbsp;</label>
              <button
                onClick={fetchClaims}
                className="h-9 px-4 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <FaSearch size={12} /> Search
              </button>
            </div>

            {/* Export CSV Button */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">&nbsp;</label>
              <button
                onClick={exportCSV}
                className="h-9 px-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <FaDownload size={12} /> Export CSV
              </button>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
            <div className="text-xs text-gray-500">
              Showing <strong className="text-gray-700">{claims.length}</strong> of <strong className="text-gray-700">{summary.totalClaims || 0}</strong> records
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedClaims.length > 0 && (
        <div className="p-3 mb-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">
            {selectedClaims.length} claim{selectedClaims.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkActionModal(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Bulk Actions
            </button>
            <button
              onClick={() => setSelectedClaims([])}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiList className="text-orange-600" /> OT Claims
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Hours</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Multiplier</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">OT Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">
                    No OT claims found
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedClaims.includes(claim._id)}
                        onChange={() => handleSelectClaim(claim._id)}
                        disabled={claim.status !== 'pending'}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium text-gray-800 text-sm">{claim.employeeName}</div>
                      <div className="text-xs text-gray-400">{claim.employeeId}</div>
                      <div className="text-xs text-gray-400">{claim.employeeDetails?.department || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-700">{formatDate(claim.date)}</div>
                      <div className="text-xs text-gray-400">{formatTime(claim.date)}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-orange-600">{claim.otHours}h</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={getMultiplier(claim._id)}
                        onChange={(e) => handleMultiplierChange(claim._id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                      >
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                        <option value={2.5}>2.5x</option>
                        <option value={3}>3x</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-green-600 text-sm">
                        {calculateOTAmount(claim)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="max-w-xs text-sm text-gray-500 truncate" title={claim.reason}>
                        {claim.reason || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>

                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                setStatusUpdate({ status: 'approved', rejectedReason: '', notes: '' });
                                setShowStatusModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FaCheck size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {claims.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, summary.totalClaims)} of {summary.totalClaims}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(summary.totalPages || 1, p + 1))}
                disabled={currentPage === (summary.totalPages || 1)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === (summary.totalPages || 1)
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Details Modal */}
      {showDetailsModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaList className="text-orange-600" /> Claim Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedClaim(null);
                }}
                className="text-gray-400 text-2xl hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Employee Information</h3>
                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedClaim.employeeName}</span></div>
                  <div><span className="text-gray-500">ID:</span> <span className="font-medium text-gray-800">{selectedClaim.employeeId}</span></div>
                  <div><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-800">{selectedClaim.employeeDetails?.department || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedClaim.employeeDetails?.email || 'N/A'}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Salary/Month:</span> <span className="font-medium text-gray-800">₹{selectedClaim.employeeDetails?.salaryPerMonth?.toLocaleString() || '0'}</span></div>
                </div>
              </div>

              {/* Claim Info */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <h3 className="text-sm font-semibold text-orange-800">Claim Information</h3>
                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                  <div><span className="text-gray-600">Date:</span> <span className="font-medium text-gray-800">{formatDate(selectedClaim.date)}</span></div>
                  <div><span className="text-gray-600">OT Hours:</span> <span className="font-bold text-orange-600">{selectedClaim.otHours}h</span></div>
                  <div><span className="text-gray-600">Multiplier:</span> <span className="font-medium text-gray-800">{getMultiplier(selectedClaim._id)}x</span></div>
                  <div><span className="text-gray-600">OT Amount:</span> <span className="font-bold text-green-600">{calculateOTAmount(selectedClaim)}</span></div>
                  <div className="col-span-2"><span className="text-gray-600">Reason:</span> <span className="font-medium text-gray-800">{selectedClaim.reason}</span></div>
                  <div className="col-span-2"><span className="text-gray-600">Status:</span> {getStatusBadge(selectedClaim.status)}</div>
                  {selectedClaim.status === 'approved' && (
                    <>
                      <div><span className="text-gray-600">Approved By:</span> <span className="font-medium text-gray-800">{selectedClaim.approvedBy || 'Admin'}</span></div>
                      <div><span className="text-gray-600">Approved At:</span> <span className="font-medium text-gray-800">{formatDate(selectedClaim.approvedAt)}</span></div>
                    </>
                  )}
                  {selectedClaim.status === 'rejected' && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Rejected Reason:</span> <span className="font-medium text-red-600">{selectedClaim.rejectedReason || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Info */}
              {selectedClaim.attendanceDetails && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Attendance Details</h3>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <div><span className="text-gray-500">Check In:</span> <span className="font-medium text-gray-800">{formatTime(selectedClaim.attendanceDetails.checkInTime)}</span></div>
                    <div><span className="text-gray-500">Check Out:</span> <span className="font-medium text-gray-800">{formatTime(selectedClaim.attendanceDetails.checkOutTime)}</span></div>
                    <div><span className="text-gray-500">Total Hours:</span> <span className="font-medium text-gray-800">{selectedClaim.attendanceDetails.totalHours}h</span></div>
                    <div><span className="text-gray-500">Assigned Shift:</span> <span className="font-medium text-gray-800">{selectedClaim.attendanceDetails.assignedShiftHours}h</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-800">{selectedClaim.attendanceDetails.onsite ? '🏢 Onsite' : '🏠 Remote'}</span></div>
                    <div><span className="text-gray-500">Distance:</span> <span className="font-medium text-gray-800">{(selectedClaim.attendanceDetails.distance / 1000).toFixed(1)} km</span></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedClaim.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowStatusModal(true);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Approve/Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Update Claim Status</h2>
            <p className="text-sm text-gray-500 mb-3">
              {selectedClaim.employeeName} - {formatDate(selectedClaim.date)}
            </p>
            <p className="text-sm text-green-600 font-medium mb-4">
              OT Amount: {calculateOTAmount(selectedClaim)} at {getMultiplier(selectedClaim._id)}x
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>

              {statusUpdate.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={statusUpdate.rejectedReason}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, rejectedReason: e.target.value }))}
                    placeholder="Why is this claim being rejected?"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                    rows="3"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600">Notes (Optional)</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes..."
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedClaim(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Claim</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this OT claim?
            </p>
            <div className="p-3 mb-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm"><span className="font-medium text-gray-600">Employee:</span> <span className="text-gray-800">{selectedClaim.employeeName}</span></p>
              <p className="text-sm"><span className="font-medium text-gray-600">Date:</span> <span className="text-gray-800">{formatDate(selectedClaim.date)}</span></p>
              <p className="text-sm"><span className="font-medium text-gray-600">OT Hours:</span> <span className="text-orange-600 font-semibold">{selectedClaim.otHours}h</span></p>
              <p className="text-sm"><span className="font-medium text-gray-600">Multiplier:</span> <span className="text-gray-800">{getMultiplier(selectedClaim._id)}x</span></p>
              <p className="text-sm"><span className="font-medium text-gray-600">OT Amount:</span> <span className="text-green-600 font-semibold">{calculateOTAmount(selectedClaim)}</span></p>
              <p className="text-sm"><span className="font-medium text-gray-600">Reason:</span> <span className="text-gray-800">{selectedClaim.reason}</span></p>
            </div>
            <p className="text-xs text-red-600 mb-4">
              ⚠️ This action cannot be undone. Only pending claims can be deleted.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedClaim(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Bulk Actions</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedClaims.length} claim{selectedClaims.length > 1 ? 's' : ''} selected</p>

            <div className="space-y-2">
              <button
                onClick={() => handleBulkAction('status', 'approved')}
                className="w-full p-3 text-sm font-medium text-left text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200"
              >
                <FaCheck className="text-green-600" /> Approve All
              </button>
              <button
                onClick={() => handleBulkAction('status', 'rejected')}
                className="w-full p-3 text-sm font-medium text-left text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-200"
              >
                <FaTimes className="text-red-600" /> Reject All
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedClaims.length} claims?`)) {
                    handleBulkAction('delete', null);
                  }
                }}
                className="w-full p-3 text-sm font-medium text-left text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-200"
              >
                <FaTrash className="text-red-600" /> Delete All
              </button>

              <button
                onClick={() => {
                  setShowBulkActionModal(false);
                }}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}