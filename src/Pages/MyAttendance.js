// src/pages/MyAttendance.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";


// const BASE_URL = "https://api.timelyhealth.in";

// export default function MyAttendance() {
//   const navigate = useNavigate();
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Search and Filter States
//   const [searchDate, setSearchDate] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [onsiteFilter, setOnsiteFilter] = useState("all");

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchAttendance = async () => {
//       try {
//         const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         // Sort records by checkInTime descending (newest first)
//         const sortedRecords = (data.records || []).sort((a, b) =>
//           new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);
//       } catch (err) {
//         console.error("Attendance fetch error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendance();
//   }, []);

//   // Apply filters and search
//   useEffect(() => {
//     let filtered = records;

//     // Date filter
//     if (searchDate) {
//       filtered = filtered.filter(rec => {
//         const recordDate = new Date(rec.checkInTime || rec.createdAt).toLocaleDateString();
//         const searchDateObj = new Date(searchDate).toLocaleDateString();
//         return recordDate === searchDateObj;
//       });
//     }

//     // Status filter
//     if (statusFilter !== "all") {
//       filtered = filtered.filter(rec => rec.status === statusFilter);
//     }

//     // Onsite filter
//     if (onsiteFilter !== "all") {
//       filtered = filtered.filter(rec =>
//         onsiteFilter === "yes" ? rec.onsite : !rec.onsite
//       );
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [searchDate, statusFilter, onsiteFilter, records]);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

//   // CSV Data
//   const csvData = filteredRecords.map((rec) => ({
//     Date: new Date(rec.checkInTime || rec.createdAt).toLocaleDateString(),
//     "Check In": rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-",
//     "Check Out": rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-",
//     "Total Hours": rec.totalHours ? rec.totalHours.toFixed(2) : "0.00",
//     "Distance (m)": rec.distance ? rec.distance.toFixed(2) : "0.00",
//     Onsite: rec.onsite ? "Yes" : "No",
//     Reason: rec.reason || "Not specified",
//     Status: rec.status,
//   }));

//   // Clear all filters
//   const clearFilters = () => {
//     setSearchDate("");
//     setStatusFilter("all");
//     setOnsiteFilter("all");
//   };

//   // Format time for display
//   const formatTime = (dateString) => {
//     if (!dateString) return "-";
//     return new Date(dateString).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: true
//     });
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* Main Section */}
//       <div className="flex flex-col flex-1">


//         <div className="flex items-start justify-center flex-1 p-4 sm:p-6 lg:p-8">
//           <div className="w-full p-4 bg-white shadow-xl max-w-7xl rounded-2xl sm:p-6 lg:p-8">
//             {/* Header Section */}
//             {/* <div className="flex flex-col items-start justify-between gap-4 mb-6 lg:flex-row lg:items-center">
//               <div>
//                 <h2 className="text-2xl font-extrabold text-transparent sm:text-3xl bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
//                   📅 My Attendance Records
//                 </h2>
//                 <p className="mt-1 text-gray-600">View and manage your attendance history</p>
//               </div>

//               <div className="flex flex-col w-full gap-3 sm:flex-row lg:w-auto">
             

//                 <CSVLink
//                   data={csvData}
//                   filename={`my_attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`}
//                   className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-center text-white transition bg-green-600 rounded-lg hover:bg-green-700"
//                 >
//                   ⬇ Download CSV
//                 </CSVLink>
//               </div>
//             </div> */}

//             {/* Search and Filter Section */}
//             <div className="p-4 mb-6 border border-blue-200 bg-blue-50 rounded-xl">
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {/* Date Search */}
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-blue-800">
//                     📅 Search by Date
//                   </label>
//                   <input
//                     type="date"
//                     value={searchDate}
//                     onChange={(e) => setSearchDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 {/* Status Filter */}
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-blue-800">
//                     📊 Status Filter
//                   </label>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="checked-in">Checked In</option>
//                     <option value="checked-out">Checked Out</option>
//                   </select>
//                 </div>

//                 {/* Onsite Filter */}
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-blue-800">
//                     🏢 Onsite Filter
//                   </label>
//                   <select
//                     value={onsiteFilter}
//                     onChange={(e) => setOnsiteFilter(e.target.value)}
//                     className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="all">All Locations</option>
//                     <option value="yes">Onsite Only</option>
//                     <option value="no">Remote Only</option>
//                   </select>
//                 </div>

//                 {/* Clear Filters */}
//                 <div className="flex items-end">
//                   <button
//                     onClick={clearFilters}
//                     className="w-full px-4 py-2 text-sm font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-700"
//                   >
//                     🗑️ Clear Filters
//                   </button>
//                 </div>
//               </div>

//               {/* Results Count */}
//               <div className="flex flex-col items-center justify-between mt-4 text-sm text-blue-700 sm:flex-row">
//                 <span>
//                   Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
//                 </span>
//                 {filteredRecords.length !== records.length && (
//                   <span className="font-semibold text-orange-600">
//                     🔍 Filters applied
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Loading / Error / No Data */}
//             {loading ? (
//               <div className="py-12 text-center">
//                 <div className="w-12 h-12 mx-auto border-b-2 border-green-600 rounded-full animate-spin"></div>
//                 <p className="mt-4 text-lg text-gray-600">Loading your attendance records...</p>
//               </div>
//             ) : error ? (
//               <div className="py-8 text-center border border-red-200 rounded-lg bg-red-50">
//                 <p className="text-lg font-semibold text-red-600">{error}</p>
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="px-6 py-2 mt-4 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//                 >
//                   🔄 Retry
//                 </button>
//               </div>
//             ) : filteredRecords.length === 0 ? (
//               <div className="py-12 text-center border border-yellow-200 rounded-lg bg-yellow-50">
//                 <p className="text-lg font-semibold text-yellow-700">
//                   {records.length === 0 ? "No attendance records found." : "No records match your filters."}
//                 </p>
//                 {records.length > 0 && (
//                   <button
//                     onClick={clearFilters}
//                     className="px-6 py-2 mt-4 text-white transition bg-yellow-600 rounded-lg hover:bg-yellow-700"
//                   >
//                     🔄 Clear Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* Table */}
//                 <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                   <table className="min-w-full">
//                     <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
//                       <tr>
//                         <th className="px-4 py-2 font-semibold text-left">Date</th>
//                         <th className="px-4 py-2 font-semibold text-left">Check-In Time</th>
//                         <th className="px-4 py-2 font-semibold text-left">Check-Out Time</th>
//                         <th className="px-4 py-2 font-semibold text-left">Total Hours</th>
//                         <th className="px-4 py-2 font-semibold text-left">Distance (m)</th>
//                         <th className="px-4 py-2 font-semibold text-left">Onsite</th>
//                         <th className="px-4 py-2 font-semibold text-left">Reason</th>
//                         <th className="px-4 py-2 font-semibold text-left">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentRecords.map((rec, idx) => (
//                         <tr
//                           key={rec._id || idx}
//                           className={`border-t transition-all duration-200 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
//                             } hover:bg-green-50 hover:shadow-sm`}
//                         >
//                           <td className="px-4 py-2 font-medium text-gray-900">
//                             {formatDate(rec.checkInTime || rec.createdAt)}
//                           </td>
//                           <td className="px-4 py-2">
//                             <div className="flex items-center gap-2">
//                               <span className="text-green-600">🟢</span>
//                               {formatTime(rec.checkInTime)}
//                             </div>
//                           </td>
//                           <td className="px-4 py-2">
//                             <div className="flex items-center gap-2">
//                               <span className="text-red-600">🔴</span>
//                               {formatTime(rec.checkOutTime)}
//                             </div>
//                           </td>
//                           <td className="px-4 py-2">
//                             <span className={`font-semibold ${rec.totalHours >= 8 ? 'text-green-600' :
//                               rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
//                               }`}>
//                               {rec.totalHours ? rec.totalHours.toFixed(2) : "0.00"}h
//                             </span>
//                           </td>
//                           <td className="px-4 py-2">
//                             <span className="font-mono text-gray-700">
//                               {rec.distance?.toFixed(0) || "0"}m
//                             </span>
//                           </td>
//                           <td className="px-4 py-2">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.onsite
//                                 ? "bg-green-200 text-green-800 border border-green-300"
//                                 : "bg-red-200 text-red-800 border border-red-300"
//                                 }`}
//                             >
//                               {rec.onsite ? "🏢 Yes" : "🏠 No"}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2">
//                             <span className="px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded">
//                               {rec.reason || "Not specified"}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-semibold ${rec.status === "checked-in"
//                                 ? "bg-blue-200 text-blue-800 border border-blue-300"
//                                 : "bg-purple-200 text-purple-800 border border-purple-300"
//                                 }`}
//                             >
//                               {rec.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
//                     <div className="text-sm text-gray-600">
//                       Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
//                       <strong>{filteredRecords.length}</strong> records
//                     </div>

//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                         disabled={currentPage === 1}
//                         className={`px-2 py-1 rounded-lg transition ${currentPage === 1
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700"
//                           }`}
//                       >
//                         ← Previous
//                       </button>

//                       <div className="flex gap-1">
//                         {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                           let pageNum;
//                           if (totalPages <= 5) {
//                             pageNum = i + 1;
//                           } else if (currentPage <= 3) {
//                             pageNum = i + 1;
//                           } else if (currentPage >= totalPages - 2) {
//                             pageNum = totalPages - 4 + i;
//                           } else {
//                             pageNum = currentPage - 2 + i;
//                           }

//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => setCurrentPage(pageNum)}
//                               className={`px-2 py-2 rounded-lg transition ${currentPage === pageNum
//                                 ? "bg-green-600 text-white font-semibold"
//                                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                 }`}
//                             >
//                               {pageNum}
//                             </button>
//                           );
//                         })}
//                       </div>

//                       <button
//                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                         disabled={currentPage === totalPages}
//                         className={`px-2 py-1 rounded-lg transition ${currentPage === totalPages
//                           ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                           : "bg-blue-600 text-white hover:bg-blue-700"
//                           }`}
//                       >
//                         Next →
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Summary Stats */}
//                 <div className="grid grid-cols-2 gap-4 mt-6 text-center md:grid-cols-4">
//                   <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
//                     <div className="text-2xl font-bold text-blue-600">{records.length}</div>
//                     <div className="text-sm text-blue-800">Total Records</div>
//                   </div>
//                   <div className="p-4 border border-green-200 rounded-lg bg-green-50">
//                     <div className="text-2xl font-bold text-green-600">
//                       {records.filter(r => r.onsite).length}
//                     </div>
//                     <div className="text-sm text-green-800">Onsite Days</div>
//                   </div>
//                   <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
//                     <div className="text-2xl font-bold text-orange-600">
//                       {records.filter(r => r.status === 'checked-in').length}
//                     </div>
//                     <div className="text-sm text-orange-800">Checked In</div>
//                   </div>
//                   <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
//                     <div className="text-2xl font-bold text-purple-600">
//                       {records.filter(r => r.totalHours >= 8).length}
//                     </div>
//                     <div className="text-sm text-purple-800">Full Days</div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/MyAttendance.jsx
// src/pages/MyAttendance.jsx
import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://api.timelyhealth.in";

export default function MyAttendance() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Filter States
  const [searchDate, setSearchDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onsiteFilter, setOnsiteFilter] = useState("all");
  
  // Department and Designation filters (from employee data)
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Click outside handlers for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const employeeData = JSON.parse(localStorage.getItem("employeeData"));
        setEmployeeData(employeeData);
        const employeeId = employeeData?.employeeId;

        if (!employeeId) {
          setError("❌ Employee ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/attendance/myattendance/${employeeId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

        // Sort records by checkInTime descending (newest first)
        const sortedRecords = (data.records || []).sort((a, b) =>
          new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        setRecords(sortedRecords);
        setFilteredRecords(sortedRecords);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = records;

    // Single date filter
    if (searchDate) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.checkInTime || rec.createdAt).toISOString().split("T")[0];
        return recordDate === searchDate;
      });
    }
    
    // Date range filter (from - to)
    if (dateFrom && dateTo) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.checkInTime || rec.createdAt);
        recordDate.setHours(0, 0, 0, 0);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        return recordDate >= fromDate && recordDate <= toDate;
      });
    } else if (dateFrom) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.checkInTime || rec.createdAt);
        recordDate.setHours(0, 0, 0, 0);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        return recordDate >= fromDate;
      });
    } else if (dateTo) {
      filtered = filtered.filter(rec => {
        const recordDate = new Date(rec.checkInTime || rec.createdAt);
        recordDate.setHours(0, 0, 0, 0);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        return recordDate <= toDate;
      });
    }

    // Month filter
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter((rec) => {
        const d = new Date(rec.checkInTime || rec.createdAt);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(rec => rec.status === statusFilter);
    }

    // Onsite filter
    if (onsiteFilter !== "all") {
      filtered = filtered.filter(rec =>
        onsiteFilter === "yes" ? rec.onsite : !rec.onsite
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchDate, dateFrom, dateTo, selectedMonth, statusFilter, onsiteFilter, records]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Format time for display with blinking animation
  const formatTimeWithStatus = (checkInTime, checkOutTime) => {
    const checkIn = checkInTime ? new Date(checkInTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;
    
    const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;

    if (checkIn && !checkOut) {
      // Still checked in - show with green blinking
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
            <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
          </span>
          <span className="font-semibold text-green-600">{checkIn}</span>
          <span className="text-xs text-gray-400">/ --:--</span>
        </div>
      );
    } else if (checkIn && checkOut) {
      // Completed - show in red
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="font-semibold text-gray-700">{checkIn}</span>
          <span className="text-xs text-gray-400">/</span>
          <span className="font-semibold text-red-600">{checkOut}</span>
        </div>
      );
    } else {
      return <span className="text-gray-400">-</span>;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchDate("");
    setDateFrom("");
    setDateTo("");
    setSelectedMonth("");
    setStatusFilter("all");
    setOnsiteFilter("all");
  };

  // Handle date change - clear other date filters when using specific filter
  const handleSearchDateChange = (e) => {
    setSearchDate(e.target.value);
    setDateFrom("");
    setDateTo("");
    setSelectedMonth("");
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setSearchDate("");
    setSelectedMonth("");
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setSearchDate("");
    setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSearchDate("");
    setDateFrom("");
    setDateTo("");
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  // Download CSV function
  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Date",
      "Check-In Time",
      "Check-Out Time",
      "Total Hours",
      "Distance (m)",
      "Onsite",
      "Reason",
      "Status"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((rec) => [
        `"${formatDate(rec.checkInTime || rec.createdAt)}"`,
        `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`,
        `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
        rec.totalHours?.toFixed(2) || "0.00",
        rec.distance?.toFixed(2) || "0.00",
        rec.onsite ? "Yes" : "No",
        `"${rec.reason || "Not specified"}"`,
        rec.status
      ].join(",")),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `my_attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stat Card component with reduced height
  const StatCard = ({ label, value, color }) => {
    return (
      <div className="overflow-hidden bg-white shadow-sm rounded-xl">
        <div className={`h-0.5 ${color}`}></div>
        <div className="p-2 text-center sm:p-3">
          <div className="text-base font-bold sm:text-lg">{value}</div>
          <div className="text-[10px] font-medium text-gray-700 sm:text-xs whitespace-nowrap">{label}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
          <div className="mb-4 text-4xl text-red-500">❌</div>
          <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100 sm:px-3 sm:py-3">
      <div className="mx-auto max-w-9xl">
        
        {/* Header Section */}
        {/* <div className="mb-2">
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">📅 My Attendance Records</h1>
          <p className="text-xs text-gray-600 sm:text-sm">View and manage your attendance history</p>
        </div> */}

        {/* Stats Cards - Reduced Height */}
        <div className="grid grid-cols-2 gap-1 mb-3 sm:grid-cols-4 sm:gap-2">
          <StatCard
            label={`Total Records: ${records.length}`}
            // value={records.length}
            color="bg-blue-500"
          />
          <StatCard
            label={`Onsite Days: ${records.filter(r => r.onsite).length}`}
            // value={records.filter(r => r.onsite).length}
            color="bg-green-500"
          />
          <StatCard
            label={`Checked In: ${records.filter(r => r.status === "checked-in").length}`}
            // value={records.filter(r => r.status === "checked-in").length}
            color="bg-orange-500"
          />
          <StatCard
            label={`Full Days: ${records.filter(r => r.totalHours >= 8).length}`}
            // value={records.filter(r => r.totalHours >= 8).length}
            color="bg-purple-500"
          />
        </div>

        {/* Filters Section */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md sm:p-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            
            {/* Single Date Filter */}
            <div className="relative w-[110px] sm:w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={searchDate}
                onChange={handleSearchDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="Date"
                className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date From */}
            <div className="relative w-[110px] sm:w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="From"
                className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div className="relative w-[110px] sm:w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="To"
                className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Filter */}
            <div className="relative w-[110px] sm:w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="Month"
                className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-1 py-1 text-xs border border-gray-300 rounded-lg w-[90px] sm:w-[100px] focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>

            {/* Onsite Filter */}
            <select
              value={onsiteFilter}
              onChange={(e) => setOnsiteFilter(e.target.value)}
              className="h-8 px-1 py-1 text-xs border border-gray-300 rounded-lg w-[90px] sm:w-[100px] focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="yes">Onsite Only</option>
              <option value="no">Remote Only</option>
            </select>

            {/* CSV Button */}
            <button
              onClick={downloadCSV}
              className="h-8 px-2 text-xs font-medium text-white transition bg-green-600 rounded-md sm:px-3 hover:bg-green-700"
            >
              📥 CSV
            </button>

            {/* Clear Button */}
            {(searchDate || dateFrom || dateTo || selectedMonth || statusFilter !== "all" || onsiteFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="h-8 px-2 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md sm:px-3 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
            </span>
            {filteredRecords.length !== records.length && (
              <span className="font-semibold text-orange-600">
                🔍 Filters applied
              </span>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center sm:py-16">
              <div className="mb-3 text-5xl sm:text-6xl">📭</div>
              <p className="mb-3 text-base font-semibold text-gray-600 sm:text-lg">
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
              {records.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-1.5 text-sm font-semibold text-white transition bg-blue-600 rounded-lg sm:px-6 sm:py-2 hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Date</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Check-In/Out</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Hours</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Distance</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Onsite</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((rec, idx) => (
                      <tr
                        key={rec._id || idx}
                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 hover:shadow-sm transition-all duration-200 text-xs sm:text-sm`}
                      >
                        {/* Date */}
                        <td className="px-2 py-1.5 font-medium text-center text-gray-900 whitespace-nowrap sm:px-3 sm:py-2">
                          {formatDate(rec.checkInTime || rec.createdAt)}
                        </td>

                        {/* Check-In/Out with Blinking */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          {formatTimeWithStatus(rec.checkInTime, rec.checkOutTime)}
                        </td>

                        {/* Hours */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span className={`font-semibold ${rec.totalHours >= 8 ? 'text-green-600' :
                            rec.totalHours >= 4 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                            {rec.totalHours ? rec.totalHours.toFixed(1) : "0.0"}h
                          </span>
                        </td>

                        {/* Distance */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span className="px-1.5 py-0.5 font-mono text-gray-700 bg-gray-100 rounded sm:px-2 sm:py-1">
                            {rec.distance?.toFixed(0) || "0"}m
                          </span>
                        </td>

                        {/* Onsite */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${rec.onsite
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                          >
                            {rec.onsite ? "🏢 Yes" : "🏠 No"}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded max-w-[80px] truncate block sm:max-w-[100px]">
                            {rec.reason || "-"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${rec.status === "checked-in"
                              ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                              : "bg-purple-100 text-purple-800 border border-purple-300"
                              }`}
                          >
                            {rec.status === "checked-in" ? "In" : "Out"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {filteredRecords.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 p-3 border-t sm:flex-row sm:p-4 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Show:
                      </label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-1 text-xs border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="hidden sm:inline">Showing </span>
                      <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                      <strong>{filteredRecords.length}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      ←
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg transition min-w-[24px] ${page === "..."
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}