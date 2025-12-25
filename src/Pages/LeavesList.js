// src/pages/LeavesList.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaTimes, FaEdit, FaSearch, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// const LeavesList = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [currentPageLeaves, setCurrentPageLeaves] = useState([]);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [updatedStatus, setUpdatedStatus] = useState("");
//   const [loading, setLoading] = useState(true);
  
//   // Search and Filter States
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/leaves");
//       const leavesData = res.data.records || res.data || [];
      
//       // Sort by latest first
//       const sortedLeaves = leavesData.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
//       setLeaves(sortedLeaves);
//       setFilteredLeaves(sortedLeaves);
//     } catch (err) {
//       console.error("Failed to fetch leaves:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // Apply filters
//   useEffect(() => {
//     let filtered = leaves;

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(leave =>
//         leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Status filter
//     if (statusFilter !== "all") {
//       filtered = filtered.filter(leave => leave.status === statusFilter);
//     }

//     // Leave type filter
//     if (leaveTypeFilter !== "all") {
//       filtered = filtered.filter(leave => leave.leaveType === leaveTypeFilter);
//     }

//     setFilteredLeaves(filtered);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [searchTerm, statusFilter, leaveTypeFilter, leaves]);

//   // Pagination logic
//   useEffect(() => {
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     setCurrentPageLeaves(filteredLeaves.slice(indexOfFirstItem, indexOfLastItem));
//   }, [currentPage, filteredLeaves, itemsPerPage]);

//   const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

//   const handleEdit = (rec) => {
//     setEditingRecord(rec);
//     setUpdatedStatus(rec.status);
//   };

//   const handleUpdateStatus = async () => {
//     if (!["pending", "approved", "rejected"].includes(updatedStatus)) {
//       alert("Status must be Pending, Approved, or Rejected");
//       return;
//     }
//     try {
//       await axios.put(
//         `https://attendancebackend-5cgn.onrender.com/api/leaves/updateleaves/${editingRecord._id}`,
//         { status: updatedStatus }
//       );
//       alert(`✅ Leave ${updatedStatus} successfully!`);
//       setEditingRecord(null);
//       fetchLeaves();
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       alert("❌ Failed to update leave status");
//     }
//   };

//   const getStatusClass = (status) => {
//     switch (status.toLowerCase()) {
//       case "approved":
//         return "bg-green-100 text-green-800 border border-green-300";
//       case "rejected":
//         return "bg-red-100 text-red-800 border border-red-300";
//       case "pending":
//       default:
//         return "bg-yellow-100 text-yellow-800 border border-yellow-300";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status.toLowerCase()) {
//       case "approved":
//         return "✅";
//       case "rejected":
//         return "❌";
//       case "pending":
//       default:
//         return "⏳";
//     }
//   };

//   const getLeaveTypeClass = (type) => {
//     switch (type?.toLowerCase()) {
//       case "sick leave":
//         return "bg-blue-100 text-blue-800 border border-blue-300";
//       case "casual leave":
//         return "bg-purple-100 text-purple-800 border border-purple-300";
//       case "emergency leave":
//         return "bg-red-100 text-red-800 border border-red-300";
//       case "annual leave":
//         return "bg-green-100 text-green-800 border border-green-300";
//       default:
//         return "bg-gray-100 text-gray-800 border border-gray-300";
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("all");
//     setLeaveTypeFilter("all");
//   };

//   const downloadCSV = () => {
//     if (filteredLeaves.length === 0) {
//       alert("No data available to download!");
//       return;
//     }

//     const headers = [
//       "Employee Name",
//       "Employee ID",
//       "Leave Type",
//       "Start Date",
//       "End Date",
//       "Days",
//       "Reason",
//       "Status",
//       "Applied Date"
//     ];

//     const csvRows = [
//       headers.join(","),
//       ...filteredLeaves.map(leave =>
//         [
//           `"${leave.employeeName || 'N/A'}"`,
//           `"${leave.employeeId || 'N/A'}"`,
//           `"${leave.leaveType || 'N/A'}"`,
//           `"${new Date(leave.startDate).toLocaleDateString()}"`,
//           `"${new Date(leave.endDate).toLocaleDateString()}"`,
//           leave.days || '0',
//           `"${leave.reason || 'N/A'}"`,
//           leave.status,
//           `"${new Date(leave.createdAt || leave.startDate).toLocaleDateString()}"`
//         ].join(",")
//       ),
//     ];

//     const csvData = csvRows.join("\n");
//     const blob = new Blob([csvData], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `leave_requests_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Get unique leave types for filter
//   const leaveTypes = [...new Set(leaves.map(leave => leave.leaveType).filter(Boolean))];

//   // Pagination controls
//   const goToPage = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Generate page numbers
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;
    
//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }
    
//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-700 text-lg font-semibold">Loading leave requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3">
//             📋 Leave Requests Management
//           </h1>
//           <p className="text-gray-600 text-lg">
//             Review and manage employee leave applications
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200 text-center">
//             <div className="text-3xl font-bold text-purple-600">{leaves.length}</div>
//             <div className="text-purple-800 font-semibold">Total Requests</div>
//           </div>
//           <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200 text-center">
//             <div className="text-3xl font-bold text-yellow-600">
//               {leaves.filter(l => l.status === 'pending').length}
//             </div>
//             <div className="text-yellow-800 font-semibold">Pending</div>
//           </div>
//           <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 text-center">
//             <div className="text-3xl font-bold text-green-600">
//               {leaves.filter(l => l.status === 'approved').length}
//             </div>
//             <div className="text-green-800 font-semibold">Approved</div>
//           </div>
//           <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 text-center">
//             <div className="text-3xl font-bold text-red-600">
//               {leaves.filter(l => l.status === 'rejected').length}
//             </div>
//             <div className="text-red-800 font-semibold">Rejected</div>
//           </div>
//         </div>

//         {/* Filters Section */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
//             <div>
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 Filter Leave Requests</h3>
//               <p className="text-gray-600">Search and filter by various criteria</p>
//             </div>
            
//             <div className="flex flex-col sm:flex-row gap-3">
//               <button
//                 onClick={downloadCSV}
//                 className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold flex items-center gap-2 shadow-lg"
//               >
//                 <FaDownload className="text-sm" />
//                 Download CSV
//               </button>
              
//               <button
//                 onClick={clearFilters}
//                 className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition font-semibold flex items-center gap-2"
//               >
//                 <FaFilter className="text-sm" />
//                 Clear Filters
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-blue-700">
//                 <FaSearch className="inline mr-2" />
//                 Search
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search by name, ID, type, or reason..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-purple-700">
//                 📊 Status Filter
//               </label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Leave Type Filter */}
//             <div>
//               <label className="block mb-2 text-sm font-semibold text-green-700">
//                 🏷️ Leave Type
//               </label>
//               <select
//                 value={leaveTypeFilter}
//                 onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500 transition"
//               >
//                 <option value="all">All Types</option>
//                 {leaveTypes.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Results Count */}
//           <div className="mt-4 flex justify-between items-center text-sm">
//             <span className="text-blue-700 font-semibold">
//               Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> requests
//             </span>
//             {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
//               <span className="text-orange-600 font-semibold">
//                 🔍 Filters applied
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
//           {filteredLeaves.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="text-6xl mb-4">📭</div>
//               <p className="text-gray-600 text-lg font-semibold mb-4">
//                 {leaves.length === 0 ? "No leave requests found." : "No requests match your filters."}
//               </p>
//               {leaves.length > 0 && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
//                     <tr>
//                       <th className="px-6 py-4 text-left font-semibold">Employee</th>
//                       <th className="px-6 py-4 text-left font-semibold">Leave Type</th>
//                       <th className="px-6 py-4 text-left font-semibold">Date Range</th>
//                       <th className="px-6 py-4 text-left font-semibold">Days</th>
//                       <th className="px-6 py-4 text-left font-semibold">Reason</th>
//                       <th className="px-6 py-4 text-left font-semibold">Status</th>
//                       <th className="px-6 py-4 text-left font-semibold">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentPageLeaves.map((leave, idx) => (
//                       <tr
//                         key={leave._id}
//                         className={`border-t transition-all duration-200 ${
//                           idx % 2 === 0 ? "bg-gray-50" : "bg-white"
//                         } hover:bg-purple-50 hover:shadow-sm`}
//                       >
//                         <td className="px-6 py-4">
//                           <div>
//                             <div className="font-semibold text-gray-900">{leave.employeeName}</div>
//                             {leave.employeeId && (
//                               <div className="text-xs text-gray-500">ID: {leave.employeeId}</div>
//                             )}
//                             <div className="text-xs text-gray-400">
//                               {new Date(leave.createdAt || leave.startDate).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getLeaveTypeClass(leave.leaveType)}`}>
//                             {leave.leaveType}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <div className="font-medium">
//                               {new Date(leave.startDate).toLocaleDateString()}
//                             </div>
//                             <div className="text-xs text-gray-500">to</div>
//                             <div className="font-medium">
//                               {new Date(leave.endDate).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
//                             {leave.days} day{leave.days !== 1 ? 's' : ''}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="max-w-[200px]">
//                             <p className="text-gray-700 line-clamp-2">{leave.reason}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${getStatusClass(leave.status)}`}>
//                             <span className="text-sm">{getStatusIcon(leave.status)}</span>
//                             <span className="capitalize">{leave.status}</span>
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <button
//                             onClick={() => handleEdit(leave)}
//                             className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition font-semibold flex items-center gap-2 shadow-lg"
//                           >
//                             <FaEdit className="text-sm" />
//                             Edit
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t bg-gray-50 gap-4">
//                   <div className="text-sm text-gray-600">
//                     Showing <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeaves.length)}</strong> of{" "}
//                     <strong>{filteredLeaves.length}</strong> requests
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     {/* Previous Button */}
//                     <button
//                       onClick={prevPage}
//                       disabled={currentPage === 1}
//                       className={`p-2 rounded-lg transition ${
//                         currentPage === 1
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                       }`}
//                     >
//                       <FaChevronLeft className="text-sm" />
//                     </button>

//                     {/* Page Numbers */}
//                     <div className="flex gap-1">
//                       {getPageNumbers().map(pageNumber => (
//                         <button
//                           key={pageNumber}
//                           onClick={() => goToPage(pageNumber)}
//                           className={`px-3 py-2 rounded-lg transition font-semibold ${
//                             currentPage === pageNumber
//                               ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
//                               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                           }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Next Button */}
//                     <button
//                       onClick={nextPage}
//                       disabled={currentPage === totalPages}
//                       className={`p-2 rounded-lg transition ${
//                         currentPage === totalPages
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                       }`}
//                     >
//                       <FaChevronRight className="text-sm" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editingRecord && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//           <div className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-2xl border border-purple-200">
//             <button
//               onClick={() => setEditingRecord(null)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-xl"
//             >
//               <FaTimes />
//             </button>
            
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800 mb-2">Update Leave Status</h2>
//               <p className="text-gray-600">Change the status of this leave request</p>
//             </div>

//             <div className="space-y-4 mb-6">
//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="font-semibold text-gray-700">{editingRecord.employeeName}</p>
//                 <p className="text-sm text-gray-500 capitalize">{editingRecord.leaveType}</p>
//                 <p className="text-xs text-gray-400">
//                   {new Date(editingRecord.startDate).toLocaleDateString()} - {new Date(editingRecord.endDate).toLocaleDateString()}
//                 </p>
//               </div>

//               <div>
//                 <label className="block mb-2 text-sm font-semibold text-gray-700">
//                   New Status
//                 </label>
//                 <select
//                   value={updatedStatus}
//                   onChange={(e) => setUpdatedStatus(e.target.value)}
//                   className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
//                 >
//                   <option value="pending">⏳ Pending</option>
//                   <option value="approved">✅ Approved</option>
//                   <option value="rejected">❌ Rejected</option>
//                 </select>
//               </div>

//               <div className={`p-3 rounded-xl text-center ${getStatusClass(updatedStatus)}`}>
//                 <span className="font-semibold capitalize">Current: {updatedStatus}</span>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setEditingRecord(null)}
//                 className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdateStatus}
//                 className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition font-semibold shadow-lg"
//               >
//                 Update Status
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LeavesList;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FaCalendarAlt,
//   FaSearch,
// } from "react-icons/fa";

// const LeavesList = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
//   const [startDateFilter, setStartDateFilter] = useState("");
//   const [endDateFilter, setEndDateFilter] = useState("");

//   // Fetch Leaves
//   const fetchLeaves = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("https://attendancebackend-5cgn.onrender.com/api/leaves/leaves");
//       const leavesData = res.data.records || res.data || [];
//       const sorted = leavesData.sort(
//         (a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate)
//       );
//       setLeaves(sorted);
//       setFilteredLeaves(sorted);
//     } catch (err) {
//       console.error("Failed to fetch leaves:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   // ✅ Apply Filters
//   useEffect(() => {
//     let filtered = [...leaves];

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (l) =>
//           l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter((l) => l.status === statusFilter);
//     }

//     if (leaveTypeFilter !== "all") {
//       filtered = filtered.filter((l) => l.leaveType === leaveTypeFilter);
//     }

//     // ✅ Fixed Date Range Filter
//     if (startDateFilter) {
//       const start = new Date(startDateFilter);
//       filtered = filtered.filter((l) => new Date(l.startDate) >= start);
//     }

//     if (endDateFilter) {
//       const end = new Date(endDateFilter);
//       filtered = filtered.filter((l) => new Date(l.endDate) <= end);
//     }

//     setFilteredLeaves(filtered);
//   }, [searchTerm, statusFilter, leaveTypeFilter, startDateFilter, endDateFilter, leaves]);

//   const clearFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("all");
//     setLeaveTypeFilter("all");
//     setStartDateFilter("");
//     setEndDateFilter("");
//   };

//   // ✅ Small Stat Boxes
//   const StatCard = ({ label, value, color }) => (
//     <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}>
//       <div className="text-lg font-bold">{value}</div>
//       <div className="text-gray-700 text-xs font-medium">{label}</div>
//     </div>
//   );

//   const leaveTypes = [...new Set(leaves.map((l) => l.leaveType).filter(Boolean))];

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full mx-auto mb-3"></div>
//           <p className="font-semibold text-gray-600">Loading leave requests...</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-6 px-3">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
//             📋 Leave Requests
//           </h1>
//           <p className="text-gray-600 text-sm">Manage and filter employee leave requests easily</p>
//         </div>

//         {/* ✅ Compact Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
//           <StatCard label="Total Requests" value={leaves.length} color="border-purple-500" />
//           <StatCard
//             label="Pending"
//             value={leaves.filter((l) => l.status === "pending").length}
//             color="border-yellow-500"
//           />
//           <StatCard
//             label="Approved"
//             value={leaves.filter((l) => l.status === "approved").length}
//             color="border-green-500"
//           />
//           <StatCard
//             label="Rejected"
//             value={leaves.filter((l) => l.status === "rejected").length}
//             color="border-red-500"
//           />
//         </div>

//         {/* ✅ Filters Section */}
//         <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
//           <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
//             {/* Search */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 <FaSearch className="inline mr-1" /> Search
//               </label>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                 placeholder="Name / ID / Type / Reason"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md text-sm"
//               >
//                 <option value="all">All</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Leave Type */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">Leave Type</label>
//               <select
//                 value={leaveTypeFilter}
//                 onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md text-sm"
//               >
//                 <option value="all">All</option>
//                 {leaveTypes.map((t) => (
//                   <option key={t}>{t}</option>
//                 ))}
//               </select>
//             </div>

//             {/* ✅ Start Date */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 <FaCalendarAlt className="inline mr-1" /> From
//               </label>
//               <input
//                 type="date"
//                 value={startDateFilter}
//                 onChange={(e) => setStartDateFilter(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md text-sm"
//               />
//             </div>

//             {/* ✅ End Date */}
//             <div>
//               <label className="block text-xs font-semibold text-gray-600 mb-1">
//                 <FaCalendarAlt className="inline mr-1" /> To
//               </label>
//               <input
//                 type="date"
//                 value={endDateFilter}
//                 onChange={(e) => setEndDateFilter(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md text-sm"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end mt-4 gap-3">
//             <button
//               onClick={clearFilters}
//               className="bg-gray-500 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* ✅ Table (Your Existing Table Design Below) */}
//         <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//           <table className="min-w-full">
//             <thead className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-left">
//               <tr>
//                 <th className="py-3 px-4 rounded-tl-lg">Employee</th>
//                 <th className="py-3 px-4">Leave Type</th>
//                 <th className="py-3 px-4">Date Range</th>
//                 <th className="py-3 px-4">Days</th>
//                 <th className="py-3 px-4">Reason</th>
//                 <th className="py-3 px-4">Status</th>
//                 <th className="py-3 px-4 rounded-tr-lg">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredLeaves.length > 0 ? (
//                 filteredLeaves.map((l) => (
//                   <tr key={l._id} className="border-b hover:bg-gray-50 transition">
//                     <td className="py-3 px-4">
//                       <div className="font-semibold">{l.employeeName}</div>
//                       <div className="text-xs text-gray-500">
//                         ID: {l.employeeId}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {new Date(l.createdAt).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
//                         {l.leaveType || "Enter Leave Type"}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-600">
//                       {new Date(l.startDate).toLocaleDateString()} <br />
//                       <span className="text-xs text-gray-400">to</span> <br />
//                       {new Date(l.endDate).toLocaleDateString()}
//                     </td>
//                     <td className="py-3 px-4">
//                       <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
//                         {l.days} days
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-700">{l.reason}</td>
//                     <td className="py-3 px-4">
//                       {l.status === "approved" && (
//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
//                           ✅ Approved
//                         </span>
//                       )}
//                       {l.status === "pending" && (
//                         <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
//                           ⏳ Pending
//                         </span>
//                       )}
//                       {l.status === "rejected" && (
//                         <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
//                           ❌ Rejected
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-3 px-4 text-right">
//                       <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-1.5 rounded-md text-sm shadow hover:opacity-90 transition">
//                         ✏️ Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-6 text-gray-500">
//                     No leave records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeavesList;




import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";

const LeavesList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // ✅ Fetch all leaves
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://attendancebackend-5cgn.onrender.com/api/leaves/leaves"
      );
      const leavesData = res.data.records || res.data || [];
      const sorted = leavesData.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      );
      setLeaves(sorted);
      setFilteredLeaves(sorted);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ✅ Update Leave Status (Approve / Reject)
  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `https://attendancebackend-5cgn.onrender.com/api/leaves/updateleaves/${id}`,
        { status }
      );

      if (res.status === 200) {
        alert(`Leave ${status} successfully`);
        fetchLeaves(); // refresh table
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update leave status");
    }
  };

  // ✅ Apply Filters
  useEffect(() => {
    let filtered = [...leaves];

    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((l) => l.leaveType === leaveTypeFilter);
    }

    if (startDateFilter) {
      const start = new Date(startDateFilter);
      filtered = filtered.filter((l) => new Date(l.startDate) >= start);
    }

    if (endDateFilter) {
      const end = new Date(endDateFilter);
      filtered = filtered.filter((l) => new Date(l.endDate) <= end);
    }

    setFilteredLeaves(filtered);
  }, [
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    startDateFilter,
    endDateFilter,
    leaves,
  ]);

  // ✅ Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  // ✅ Stat Box
  const StatCard = ({ label, value, color }) => (
    <div
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} text-center`}
    >
      <div className="text-lg font-bold">{value}</div>
      <div className="text-gray-700 text-xs font-medium">{label}</div>
    </div>
  );

  const leaveTypes = [...new Set(leaves.map((l) => l.leaveType).filter(Boolean))];

  // ✅ Loading Screen
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full mx-auto mb-3"></div>
          <p className="font-semibold text-gray-600">
            Loading leave requests...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-6 px-3">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            📋 Leave Requests
          </h1>
          <p className="text-gray-600 text-sm">
            Manage and filter employee leave requests easily
          </p>
        </div>

        {/* ✅ Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <StatCard
            label="Total Requests"
            value={leaves.length}
            color="border-purple-500"
          />
          <StatCard
            label="Pending"
            value={leaves.filter((l) => l.status === "pending").length}
            color="border-yellow-500"
          />
          <StatCard
            label="Approved"
            value={leaves.filter((l) => l.status === "approved").length}
            color="border-green-500"
          />
          <StatCard
            label="Rejected"
            value={leaves.filter((l) => l.status === "rejected").length}
            color="border-red-500"
          />
        </div>

        {/* ✅ Filters */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                <FaSearch className="inline mr-1" /> Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Name / ID / Type / Reason"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Leave Type
              </label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                {leaveTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                <FaCalendarAlt className="inline mr-1" /> From
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                <FaCalendarAlt className="inline mr-1" /> To
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-3">
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-left">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((l) => (
                  <tr
                    key={l._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold">{l.employeeName}</div>
                      <div className="text-xs text-gray-500">
                        ID: {l.employeeId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {l.leaveType || "Enter Leave Type"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(l.startDate).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-400">to</span> <br />
                      {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                        {l.days} days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {l.reason}
                    </td>
                    <td className="py-3 px-4">
                      {l.status === "approved" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                          ✅ Approved
                        </span>
                      )}
                      {l.status === "pending" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                          ⏳ Pending
                        </span>
                      )}
                      {l.status === "rejected" && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                          ❌ Rejected
                        </span>
                      )}
                    </td>

                    {/* ✅ Approve / Reject Buttons */}
                    <td className="py-3 px-4 text-right">
                      {l.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => updateLeaveStatus(l._id, "approved")}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(l._id, "rejected")}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesList;
