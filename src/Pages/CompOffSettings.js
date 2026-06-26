// import React, { useEffect, useState, useRef } from 'react';
// import { API_BASE_URL } from '../config';

// function CompOffSettings() {
//   const [settings, setSettings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [saveStatus, setSaveStatus] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingSetting, setEditingSetting] = useState(null);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     totalCompOff: '',
//     validityFrom: '',
//     validityTo: ''
//   });
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
  
//   const saveStatusTimeoutRef = useRef(null);
  
//   const showSaveStatus = (msg, isError = false) => {
//     setSaveStatus(msg);
//     clearTimeout(saveStatusTimeoutRef.current);
//     saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
//   };
  
//   // ── Fetch all comp-off settings ──────────────────────────────────────────────
//   const fetchSettings = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/leaves/get-all-comp-off-settings`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch comp-off settings');
//       }
      
//       const result = await response.json();
      
//       if (result.success) {
//         setSettings(result.data || []);
//       } else {
//         throw new Error(result.message || 'Failed to fetch settings');
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchSettings();
//   }, []);
  
//   // ── Add new comp-off setting ──────────────────────────────────────────────
//   const handleAddSetting = async () => {
//     // Validation
//     if (!formData.totalCompOff || formData.totalCompOff <= 0) {
//       showSaveStatus('❌ Please enter a valid number of Comp-Off days', true);
//       return;
//     }
    
//     if (!formData.validityFrom) {
//       showSaveStatus('❌ Please select Validity From date', true);
//       return;
//     }
    
//     if (!formData.validityTo) {
//       showSaveStatus('❌ Please select Validity To date', true);
//       return;
//     }
    
//     const fromDate = new Date(formData.validityFrom);
//     const toDate = new Date(formData.validityTo);
    
//     if (toDate < fromDate) {
//       showSaveStatus('❌ Validity To date cannot be before Validity From date', true);
//       return;
//     }
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/leaves/add-comp-off-settings`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           totalCompOff: Number(formData.totalCompOff),
//           validityFrom: formData.validityFrom,
//           validityTo: formData.validityTo
//         })
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         showSaveStatus('✅ Comp-Off setting added successfully');
//         setIsModalOpen(false);
//         resetForm();
//         fetchSettings();
//       } else {
//         throw new Error(result.message || 'Failed to add setting');
//       }
//     } catch (err) {
//       console.error(err);
//       showSaveStatus(`❌ ${err.message}`, true);
//     }
//   };
  
//   // ── Update comp-off setting ───────────────────────────────────────────────
//   const handleUpdateSetting = async () => {
//     if (!formData.totalCompOff || formData.totalCompOff <= 0) {
//       showSaveStatus('❌ Please enter a valid number of Comp-Off days', true);
//       return;
//     }
    
//     if (!formData.validityFrom) {
//       showSaveStatus('❌ Please select Validity From date', true);
//       return;
//     }
    
//     if (!formData.validityTo) {
//       showSaveStatus('❌ Please select Validity To date', true);
//       return;
//     }
    
//     const fromDate = new Date(formData.validityFrom);
//     const toDate = new Date(formData.validityTo);
    
//     if (toDate < fromDate) {
//       showSaveStatus('❌ Validity To date cannot be before Validity From date', true);
//       return;
//     }
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/leaves/update-comp-off-settings/${editingSetting._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           totalCompOff: Number(formData.totalCompOff),
//           validityFrom: formData.validityFrom,
//           validityTo: formData.validityTo
//         })
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         showSaveStatus('✅ Comp-Off setting updated successfully');
//         setIsModalOpen(false);
//         resetForm();
//         fetchSettings();
//       } else {
//         throw new Error(result.message || 'Failed to update setting');
//       }
//     } catch (err) {
//       console.error(err);
//       showSaveStatus(`❌ ${err.message}`, true);
//     }
//   };
  
//   // ── Delete comp-off setting ───────────────────────────────────────────────
//   const handleDeleteSetting = async (setting) => {
//     if (!window.confirm(`Are you sure you want to delete this Comp-Off setting?`)) {
//       return;
//     }
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/leaves/delete-comp-off-settings/${setting._id}`, {
//         method: 'DELETE'
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         showSaveStatus('✅ Comp-Off setting deleted successfully');
//         fetchSettings();
//       } else {
//         throw new Error(result.message || 'Failed to delete setting');
//       }
//     } catch (err) {
//       console.error(err);
//       showSaveStatus(`❌ ${err.message}`, true);
//     }
//   };
  
//   // ── Open modal for add/edit ───────────────────────────────────────────────
//   const openAddModal = () => {
//     setEditingSetting(null);
//     resetForm();
//     setIsModalOpen(true);
//   };
  
//   const openEditModal = (setting) => {
//     setEditingSetting(setting);
//     setFormData({
//       totalCompOff: setting.totalCompOff,
//       validityFrom: setting.validityFrom.split('T')[0],
//       validityTo: setting.validityTo.split('T')[0]
//     });
//     setIsModalOpen(true);
//   };
  
//   const resetForm = () => {
//     setFormData({
//       totalCompOff: '',
//       validityFrom: '',
//       validityTo: ''
//     });
//   };
  
//   // ── Filtered + paginated list ─────────────────────────────────────────────
//   const filteredSettings = settings.filter(setting => {
//     if (!searchTerm) return true;
//     const q = searchTerm.toLowerCase();
//     return (
//       setting._id?.toLowerCase().includes(q) ||
//       setting.totalCompOff?.toString().includes(q) ||
//       setting.status?.toLowerCase().includes(q)
//     );
//   });
  
//   const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filteredSettings.slice(startIdx, startIdx + itemsPerPage);
  
//   const getPageNumbers = () => {
//     const pages = [];
//     const delta = 2;
//     for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
//       pages.push(i);
//     }
//     return pages;
//   };
  
//   // ── Format date ───────────────────────────────────────────────────────────
//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
  
//   // ── Loading / Error states ────────────────────────────────────────────────
//   if (loading) return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-lg font-semibold text-blue-600">Loading Comp-Off Settings...</div>
//     </div>
//   );
  
//   if (error) return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
//     </div>
//   );
  
//   // ── Render ────────────────────────────────────────────────────────────────
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
        
//         {/* ── Header with Add Button ── */}
//         <div className="flex flex-wrap items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">Comp-Off Settings</h1>
//           <button
//             onClick={openAddModal}
//             className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
//             </svg>
//             Add New Setting
//           </button>
//         </div>
        
//         {/* ── Filter bar ── */}
//         <div className="p-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
//             {/* Search */}
//             <div className="relative flex-1 min-w-[200px]">
//               <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search by ID, days or status..."
//                 value={searchTerm}
//                 onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//                 className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             {/* Clear */}
//             <button
//               onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
//               className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 whitespace-nowrap"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//               Clear
//             </button>
//           </div>
//         </div>
        
//         {/* ── Table card ── */}
//         <div className="p-0 mb-0 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 px-3 text-center">S.No</th>
//                   <th className="py-2 px-3 text-center">Total Comp-Off Days</th>
//                   <th className="py-2 px-3 text-center">Validity Period</th>
//                   <th className="py-2 px-3 text-center">Status</th>
//                   <th className="py-2 px-3 text-center">Created At</th>
//                   <th className="py-2 px-3 text-center">Actions</th>
//                 </tr>
//               </thead>
              
//               <tbody>
//                 {currentItems.map((setting, index) => (
//                   <tr
//                     key={setting._id}
//                     className="border-t border-gray-200 hover:bg-blue-50"
//                   >
//                     <td className="px-2 py-2 text-center text-gray-600">
//                       {startIdx + index + 1}
//                     </td>
//                     <td className="px-2 py-2 font-semibold text-center text-indigo-600">
//                       {setting.totalCompOff} day{setting.totalCompOff !== 1 ? 's' : ''}
//                     </td>
//                     <td className="px-2 py-2 text-center text-gray-600">
//                       {formatDate(setting.validityFrom)} - {formatDate(setting.validityTo)}
//                     </td>
//                     <td className="px-2 py-2 text-center">
//                       <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
//                         setting.status === 'active'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-500'
//                       }`}>
//                         {setting.status === 'active' ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-2 py-2 text-center text-gray-600">
//                       {formatDate(setting.createdAt)}
//                     </td>
//                     <td className="px-2 py-2 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           title="Edit Setting"
//                           onClick={() => openEditModal(setting)}
//                           className="p-1.5 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-150"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                         </button>
//                         <button
//                           title="Delete Setting"
//                           onClick={() => handleDeleteSetting(setting)}
//                           className="p-1.5 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-all duration-150"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
            
//             {/* ── Pagination ── */}
//             {filteredSettings.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-6 pb-4 sm:flex-row px-4">
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
//                   <div className="text-sm text-gray-600">
//                     Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredSettings.length)} of {filteredSettings.length} entries
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
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages || totalPages === 0}
//                     className={`px-4 py-1 text-sm border rounded-lg ${
//                       currentPage === totalPages || totalPages === 0
//                         ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
//                         : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
            
//             {filteredSettings.length === 0 && (
//               <div className="py-8 text-center text-gray-500">
//                 No comp-off settings found
//                 {searchTerm && ' matching your search'}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {/* ── Modal for Add/Edit ── */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {editingSetting ? 'Edit Comp-Off Setting' : 'Add New Comp-Off Setting'}
//               </h2>
//               <button
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   resetForm();
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Total Comp-Off Days <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   min="0.5"
//                   step="0.5"
//                   value={formData.totalCompOff}
//                   onChange={e => setFormData({ ...formData, totalCompOff: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter total comp-off days"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Validity From <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.validityFrom}
//                   onChange={e => setFormData({ ...formData, validityFrom: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Validity To <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.validityTo}
//                   onChange={e => setFormData({ ...formData, validityTo: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
            
//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   resetForm();
//                 }}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={editingSetting ? handleUpdateSetting : handleAddSetting}
//                 className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
//               >
//                 {editingSetting ? 'Update' : 'Save'}
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

// export default CompOffSettings;



import axios from "axios";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';
import { FaCheck, FaTimes, FaEye, FaSearch, FaExchangeAlt } from "react-icons/fa";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiFilter, FiList, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../config";

const AdminCompOffRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/leaves/all?page=${currentPage}&limit=${itemsPerPage}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (monthFilter) {
        url += `&month=${monthFilter}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setRequests(response.data.requests || []);
        setCounts(response.data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setError("Failed to fetch comp-off requests");
      }
    } catch (err) {
      console.error("Error fetching comp-off requests:", err);
      setError(err.response?.data?.error || "Failed to fetch comp-off requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, itemsPerPage, statusFilter, monthFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchRequests();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMonthFilter("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/leaves/compoff-status/${selectedRequest._id}`,
        {
          status: "approved"
        }
      );
      
      if (response.data && response.data.success) {
        setActionMessage("Comp-off request approved successfully!");
        setShowSuccessModal(true);
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert("Failed to approve comp-off request");
      }
    } catch (err) {
      console.error("Error approving comp-off:", err);
      alert(err.response?.data?.error || "Failed to approve comp-off request");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/leaves/compoff-status/${selectedRequest._id}`,
        {
          status: "rejected",
          rejectedReason: rejectReason
        }
      );
      
      if (response.data && response.data.success) {
        setActionMessage("Comp-off request rejected successfully!");
        setShowSuccessModal(true);
        setIsRejectModalOpen(false);
        setSelectedRequest(null);
        setRejectReason("");
        fetchRequests();
      } else {
        alert("Failed to reject comp-off request");
      }
    } catch (err) {
      console.error("Error rejecting comp-off:", err);
      alert(err.response?.data?.error || "Failed to reject comp-off request");
    } finally {
      setActionLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = pagination.totalPages || 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading comp-off requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">X</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Comp-off <span className="text-purple-600">Requests</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and approve employee comp-off requests
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
            <FiCalendar className="text-purple-600" />
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
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Requests</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FiList className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={counts.total || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">total requests</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FiClock className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={counts.pending || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">awaiting approval</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FiCheckCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={counts.approved || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">approved requests</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rejected</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                <FiXCircle className="text-base" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              <CountUp end={counts.rejected || 0} duration={1} />
            </div>
            <div className="mt-1 text-xs text-gray-500">rejected requests</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiFilter className="text-purple-600" /> Filters &amp; Search
              </h3>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
              
              {/* Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Search Employee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, ID, or reason..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Month</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={handleMonthChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
              <div className="text-xs text-gray-500 font-medium">
                Showing <strong>{requests.length}</strong> of <strong>{pagination.total || 0}</strong> records
              </div>
              <div className="flex gap-2">
                {(searchTerm || statusFilter || monthFilter) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <FiTrash2 /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Requests Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiList className="text-purple-600" /> Comp-off Requests List
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage and approve employee comp-off requests</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              No comp-off requests found matching current filter values.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Employee</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Leave Details</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Extra Day Details</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Status</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Requested On</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {requests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50 transition-all">
                        {/* Employee */}
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold text-gray-900">{request.employeeName || "N/A"}</div>
                            <div className="text-xs text-gray-500">{request.employeeId || "N/A"}</div>
                          </div>
                        </td>
                        
                        {/* Leave Details */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="px-2 py-0.5 text-xs font-medium capitalize bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                              {request.leaveDetails?.leaveType || "N/A"}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {request.leaveDetails?.startDate ? formatDate(request.leaveDetails.startDate) : "N/A"} 
                              {request.leaveDetails?.endDate && request.leaveDetails?.startDate !== request.leaveDetails?.endDate 
                                ? ` - ${formatDate(request.leaveDetails.endDate)}` 
                                : ''}
                              <span className="ml-1 text-gray-400">({request.leaveDetails?.days || 0} days)</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Extra Day Details */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <div className="font-medium text-gray-900">
                              {request.extraDayDetails?.day || formatDateDisplay(request.extraDayDate)}
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              +{request.extraDayDetails?.extraHours || 0} hrs 
                              <span className="text-gray-400 ml-1">({request.extraDayDetails?.totalHours || 8} total hrs)</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                            {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "N/A"}
                          </span>
                        </td>
                        
                        {/* Requested On */}
                        <td className="px-4 py-3 text-center text-gray-600">
                          {request.createdAt ? formatDateTime(request.createdAt) : "N/A"}
                        </td>
                        
                        {/* Action */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(request)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                              title="View Details"
                            >
                              <FaEye size={14} />
                            </button>
                            {request.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-all shadow-sm"
                                  title="Approve"
                                >
                                  <FaCheck size={14} />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-all shadow-sm"
                                  title="Reject"
                                >
                                  <FaTimes size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {requests.map((request) => (
                  <div key={request._id} className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.employeeName || "N/A"}</h4>
                        <span className="text-xs text-gray-500">{request.employeeId || "N/A"}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "N/A"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600">
                      <div><span className="text-gray-400">Leave Type:</span> <span className="font-medium capitalize">{request.leaveDetails?.leaveType || "N/A"}</span></div>
                      <div><span className="text-gray-400">Days:</span> <span className="font-medium">{request.leaveDetails?.days || 0}</span></div>
                      <div><span className="text-gray-400">Date:</span> <span className="font-medium">{request.leaveDetails?.startDate ? formatDate(request.leaveDetails.startDate) : "N/A"}</span></div>
                      <div><span className="text-gray-400">Extra Day:</span> <span className="font-medium">{request.extraDayDetails?.day || formatDateDisplay(request.extraDayDate)}</span></div>
                      <div><span className="text-gray-400">Extra Hours:</span> <span className="font-semibold text-green-600">+{request.extraDayDetails?.extraHours || 0} hrs</span></div>
                      <div><span className="text-gray-400">Requested:</span> <span className="font-medium">{request.createdAt ? formatDateTime(request.createdAt) : "N/A"}</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleView(request)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-all"
                      >
                        View Details
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-gray-500">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Previous
              </button>
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    currentPage === page
                      ? "text-white bg-purple-600 border-purple-600 shadow-sm"
                      : "text-purple-600 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 bg-gray-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-150 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 z-10 p-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiList className="text-purple-600" /> Request Details
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiList className="text-purple-600" /> Employee Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ID:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeId}</span></div>
                </div>
              </div>

              {/* Leave Details */}
              {selectedRequest.leaveDetails && (
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                  <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                    <FiFileText className="text-green-600" /> Leave Details (Comp-off Against)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveDetails.leaveType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.leaveDetails.status)}`}>{selectedRequest.leaveDetails.status}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Start:</span> <span className="font-medium text-gray-900">{formatDate(selectedRequest.leaveDetails.startDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">End:</span> <span className="font-medium text-gray-900">{formatDate(selectedRequest.leaveDetails.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Days:</span> <span className="font-medium text-gray-900">{selectedRequest.leaveDetails.days}</span></div>
                    <div className="flex justify-between col-span-2"><span className="text-gray-500">Reason:</span> <span className="font-medium text-gray-900">{selectedRequest.leaveDetails.reason}</span></div>
                  </div>
                </div>
              )}

              {/* Extra Day Details */}
              {selectedRequest.extraDayDetails && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="text-blue-600" /> Extra Day Details (Comp-off For)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails.day || formatDateDisplay(selectedRequest.extraDayDetails.date)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Hours:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails.totalHours || 8} hrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Extra Hours:</span> <span className="font-medium text-green-600">+{selectedRequest.extraDayDetails.extraHours || 0} hrs</span></div>
                  </div>
                </div>
              )}

              {/* Request Info */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-purple-600" /> Request Info
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Requested:</span> <span className="font-medium text-gray-900">{formatDateTime(selectedRequest.createdAt)}</span></div>
                  {selectedRequest.status === "approved" && (
                    <>
                      <div className="flex justify-between"><span className="text-gray-500">Approved By:</span> <span className="font-medium text-gray-900">{selectedRequest.approvedBy || "Admin"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Approved At:</span> <span className="font-medium text-gray-900">{formatDateTime(selectedRequest.approvedAt)}</span></div>
                    </>
                  )}
                  {selectedRequest.status === "rejected" && selectedRequest.rejectedReason && (
                    <div className="flex justify-between col-span-2"><span className="text-gray-500">Rejected Reason:</span> <span className="font-medium text-red-600">{selectedRequest.rejectedReason}</span></div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="mb-3 font-semibold text-gray-700 flex items-center gap-2">
                  <FiFileText className="text-gray-600" /> Reason for Comp-off
                </h3>
                <p className="text-sm text-gray-600">{selectedRequest.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-150 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCheckCircle className="text-green-600" /> Approve Comp-off Request
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to approve this comp-off request?</p>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Leave:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveDetails?.leaveType}</span></div>
                  <div className="flex justify-between col-span-2"><span className="text-gray-500">Extra Day:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails?.day || formatDateDisplay(selectedRequest.extraDayDate)}</span></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setIsApproveModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmApprove} 
                  disabled={actionLoading} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-150 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiXCircle className="text-red-600" /> Reject Comp-off Request
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to reject this comp-off request?</p>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{selectedRequest.employeeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Leave:</span> <span className="font-medium text-gray-900 capitalize">{selectedRequest.leaveDetails?.leaveType}</span></div>
                  <div className="flex justify-between col-span-2"><span className="text-gray-500">Extra Day:</span> <span className="font-medium text-gray-900">{selectedRequest.extraDayDetails?.day || formatDateDisplay(selectedRequest.extraDayDate)}</span></div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Please provide reason for rejection..."
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setIsRejectModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReject} 
                  disabled={actionLoading} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-150 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{actionMessage}</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setActionMessage("");
                }}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompOffRequests;