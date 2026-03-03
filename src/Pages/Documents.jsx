// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { API_BASE_URL } from "../config";
// import {
//   FaFilePdf, FaCheckCircle, FaTimesCircle, FaEye, FaDownload,
//   FaSearch, FaFilter, FaCalendarAlt, FaUserTie, FaBriefcase, FaSpinner
// } from "react-icons/fa";
// import { toast } from "react-toastify";

// const Documents = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE_URL}/applications/documents`);
//       if (res.data.success) {
//         setDocuments(res.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//       toast.error("Failed to load documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReview = async (applicationId, status) => {
//     try {
//       setActionLoading(true);
//       const res = await axios.post(`${API_BASE_URL}/applications/review-documents`, {
//         applicationId,
//         status
//       });

//       if (res.data.success) {
//         toast.success(`Document ${status} successfully`);
//         fetchDocuments(); // Refresh list
//         if (selectedDoc && selectedDoc._id === applicationId) {
//           setIsModalOpen(false); // Close modal if open
//         }
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Failed to update status");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const filteredDocs = documents.filter(doc =>
//     (doc.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (doc.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (doc.jobId?.role || "").toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Accepted": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Accepted</span>;
//       case "Rejected": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
//       default: return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending Review</span>;
//     }
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium text-sm">Loading Secure Vault...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 md:p-8">
//       {/* Header */}
//       <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Document Verification</h1>
//           <p className="text-slate-500 text-sm mt-1">Review and approve signed candidate agreements</p>
//         </div>

//         {/* Search Bar */}
//         <div className="relative w-full md:w-96">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <FaSearch className="text-slate-400" />
//           </div>
//           <input
//             type="text"
//             className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all placeholder:text-slate-400"
//             placeholder="Search candidates, roles..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
//           <div>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
//             <h3 className="text-3xl font-black text-orange-500 mt-1">{documents.filter(d => d.docReviewStatus === 'Pending').length}</h3>
//           </div>
//           <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
//             <FaFilter size={20} />
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
//           <div>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified</p>
//             <h3 className="text-3xl font-black text-green-500 mt-1">{documents.filter(d => d.docReviewStatus === 'Accepted').length}</h3>
//           </div>
//           <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
//             <FaCheckCircle size={20} />
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
//           <div>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Uploads</p>
//             <h3 className="text-3xl font-black text-indigo-500 mt-1">{documents.length}</h3>
//           </div>
//           <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
//             <FaFilePdf size={20} />
//           </div>
//         </div>
//       </div>

//       {/* Documents Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-slate-50/50 border-b border-slate-200">
//               <tr>
//                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
//                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
//                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted On</th>
//                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
//                 <tr key={doc._id} className="hover:bg-slate-50 transition-colors group">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
//                         {doc.firstName?.charAt(0)}{doc.lastName?.charAt(0)}
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-slate-800">{doc.firstName} {doc.lastName}</p>
//                         <p className="text-xs text-slate-500">{doc.email}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2 text-slate-600">
//                       <FaBriefcase className="text-slate-400" size={12} />
//                       <span className="text-sm font-medium">{doc.jobId?.role}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2 text-slate-600">
//                       <FaCalendarAlt className="text-slate-400" size={12} />
//                       <span className="text-sm">{new Date(doc.updatedAt).toLocaleDateString()}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     {getStatusBadge(doc.docReviewStatus)}
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       {/* View Button */}
//                       <button
//                         onClick={() => { setSelectedDoc(doc); setIsModalOpen(true); }}
//                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
//                         title="View Document"
//                       >
//                         <FaEye size={16} />
//                       </button>

//                       {/* Download Button */}
//                       <button
//                         onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${doc.candidateAgreementsUpload}`, '_blank')}
//                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
//                         title="Download"
//                       >
//                         <FaDownload size={16} />
//                       </button>

//                       {/* Quick Actions (only if pending) */}
//                       {doc.docReviewStatus === 'Pending' && (
//                         <>
//                           <div className="w-px h-4 bg-slate-200 mx-1"></div>
//                           <button
//                             onClick={() => handleReview(doc._id, 'Accepted')}
//                             className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
//                             title="Accept"
//                             disabled={actionLoading}
//                           >
//                             <FaCheckCircle size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleReview(doc._id, 'Rejected')}
//                             className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
//                             title="Reject"
//                             disabled={actionLoading}
//                           >
//                             <FaTimesCircle size={16} />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
//                     <div className="flex flex-col items-center gap-3">
//                       <FaFilePdf size={32} className="opacity-20" />
//                       <p>No documents found matching your criteria</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Document Viewer Modal */}
//       {isModalOpen && selectedDoc && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
//             {/* Modal Header */}
//             <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
//               <div className="flex items-center gap-4">
//                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
//                   <FaFilePdf />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg">{selectedDoc.jobId?.role} Agreement</h3>
//                   <p className="text-xs text-slate-400">Signed by {selectedDoc.firstName} {selectedDoc.lastName}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
//               >
//                 <FaTimesCircle size={20} />
//               </button>
//             </div>

//             {/* Modal Body - PDF Viewer */}
//             <div className="flex-1 bg-slate-100 overflow-hidden relative">
//               <iframe
//                 src={`${API_BASE_URL.replace('/api', '')}/${selectedDoc.candidateAgreementsUpload}`}
//                 className="w-full h-full"
//                 title="Document Viewer"
//               />
//             </div>

//             {/* Modal Footer - Actions */}
//             <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status:</span>
//                 {getStatusBadge(selectedDoc.docReviewStatus)}
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedDoc.candidateAgreementsUpload}`, '_blank')}
//                   className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
//                 >
//                   Download PDF
//                 </button>

//                 {selectedDoc.docReviewStatus === 'Pending' && (
//                   <>
//                     <button
//                       onClick={() => handleReview(selectedDoc._id, 'Rejected')}
//                       disabled={actionLoading}
//                       className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors"
//                     >
//                       Reject
//                     </button>
//                     <button
//                       onClick={() => handleReview(selectedDoc._id, 'Accepted')}
//                       disabled={actionLoading}
//                       className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg hover:shadow-xl"
//                     >
//                       {actionLoading ? <FaSpinner className="animate-spin" /> : "Verify & Accept"}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Documents;


import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTimesCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/applications/documents`);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId, status) => {
    try {
      setActionLoading(true);
      const res = await axios.post(`${API_BASE_URL}/applications/review-documents`, {
        applicationId,
        status
      });

      if (res.data.success) {
        toast.success(`Document ${status} successfully`);
        fetchDocuments();
        if (selectedDoc && selectedDoc._id === applicationId) {
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (doc.firstName || "").toLowerCase().includes(query) ||
      (doc.lastName || "").toLowerCase().includes(query) ||
      (doc.jobId?.role || "").toLowerCase().includes(query);
    
    const matchesStatus = statusFilter ? doc.docReviewStatus === statusFilter : true;
    
    let matchesDate = true;
    if (dateFilter) {
      const docDate = new Date(doc.updatedAt).toISOString().split('T')[0];
      matchesDate = docDate === dateFilter;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredDocs.length,
      totalPages: Math.ceil(filteredDocs.length / limit)
    });
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const handlePageClick = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalCount: filteredDocs.length,
      totalPages: Math.ceil(filteredDocs.length / prev.limit),
      currentPage: 1
    }));
  }, [filteredDocs.length, searchQuery, statusFilter, dateFilter]);

  // Calculate pagination
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Accepted</span>;
      case "Rejected": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
      default: return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending Review</span>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Loading Secure Vault...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Document Verification</h1>
          <p className="text-slate-500 text-xs mt-1">Review and approve signed candidate agreements</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-2">

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search candidates, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-[130px]">
            <select
              className="w-full pl-2 pr-6 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
              <FaFilter className="text-[8px] text-gray-400" />
            </div>
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
              className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reset Filters Button */}
          {(searchQuery || statusFilter || dateFilter) && (
            <button
              onClick={resetFilters}
              className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
            <h3 className="text-2xl font-black text-orange-500 mt-1">{documents.filter(d => d.docReviewStatus === 'Pending').length}</h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            <FaFilter size={16} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified</p>
            <h3 className="text-2xl font-black text-green-500 mt-1">{documents.filter(d => d.docReviewStatus === 'Accepted').length}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <FaCheckCircle size={16} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Uploads</p>
            <h3 className="text-2xl font-black text-indigo-500 mt-1">{documents.length}</h3>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <FaFilePdf size={16} />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Candidate</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Role</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Submitted On</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? currentItems.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {doc.firstName?.charAt(0)}{doc.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.firstName} {doc.lastName}</p>
                        <p className="text-[10px] text-slate-500">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                      <FaBriefcase className="text-slate-400" size={10} />
                      <span className="text-xs font-medium">{doc.jobId?.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                      <FaCalendarAlt className="text-slate-400" size={10} />
                      <span className="text-xs">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(doc.docReviewStatus)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => { setSelectedDoc(doc); setIsModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="View Document"
                      >
                        <FaEye size={14} />
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${doc.candidateAgreementsUpload}`, '_blank')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Download"
                      >
                        <FaDownload size={14} />
                      </button>

                      {/* Quick Actions (only if pending) */}
                      {doc.docReviewStatus === 'Pending' && (
                        <>
                          <div className="w-px h-4 bg-slate-200 mx-1"></div>
                          <button
                            onClick={() => handleReview(doc._id, 'Accepted')}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                            title="Accept"
                            disabled={actionLoading}
                          >
                            <FaCheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleReview(doc._id, 'Rejected')}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Reject"
                            disabled={actionLoading}
                          >
                            <FaTimesCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FaFilePdf size={32} className="opacity-20" />
                      <p className="text-xs">No documents found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredDocs.length > 0 && (
          <div className="flex flex-col items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sm:flex-row">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>Showing</span>
              <span className="font-medium">
                {indexOfFirstItem + 1}
              </span>
              <span>to</span>
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredDocs.length)}
              </span>
              <span>of</span>
              <span className="font-medium">
                {filteredDocs.length}
              </span>
              <span>results</span>

              <select
                value={pagination.limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  handleItemsPerPageChange(newLimit);
                }}
                className="p-1 ml-2 text-sm border rounded-lg"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  pagination.currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                    disabled={page === "..."}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === "..."
                        ? "text-gray-500 cursor-default"
                        : pagination.currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  pagination.currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {isModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <FaFilePdf />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedDoc.jobId?.role} Agreement</h3>
                  <p className="text-xs text-slate-400">Signed by {selectedDoc.firstName} {selectedDoc.lastName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 overflow-hidden relative">
              <iframe
                src={`${API_BASE_URL.replace('/api', '')}/${selectedDoc.candidateAgreementsUpload}`}
                className="w-full h-full"
                title="Document Viewer"
              />
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status:</span>
                {getStatusBadge(selectedDoc.docReviewStatus)}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/${selectedDoc.candidateAgreementsUpload}`, '_blank')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Download PDF
                </button>

                {selectedDoc.docReviewStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleReview(selectedDoc._id, 'Rejected')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(selectedDoc._id, 'Accepted')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg hover:shadow-xl"
                    >
                      {actionLoading ? <FaSpinner className="animate-spin" /> : "Verify & Accept"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;