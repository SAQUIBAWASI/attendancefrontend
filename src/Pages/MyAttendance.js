

// import { useEffect, useRef, useState } from "react";
// import { FaCalendarAlt, FaClock, FaCheckSquare, FaSquare, FaTrash, FaTimes } from "react-icons/fa";
// import { FiCheckCircle, FiCheckSquare, FiFileText, FiMapPin, FiClock } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// export default function MyAttendance() {
//   const navigate = useNavigate();
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Search and Filter States
//   const [searchDate, setSearchDate] = useState("");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [onsiteFilter, setOnsiteFilter] = useState("all");

//   // Department and Designation filters
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);
//   const [employeeData, setEmployeeData] = useState(null);

//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Edit Request States
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [requestDate, setRequestDate] = useState("");
//   const [selectedRequestDates, setSelectedRequestDates] = useState([]);
//   const [requestComment, setRequestComment] = useState("");
//   const [submittingRequest, setSubmittingRequest] = useState(false);

//   // Claim OT States
//   const [showOTClaimModal, setShowOTClaimModal] = useState(false);
//   const [selectedOTRecords, setSelectedOTRecords] = useState([]);
//   const [otClaimReason, setOTClaimReason] = useState("");
//   const [submittingOTClaim, setSubmittingOTClaim] = useState(false);
//   const [claimedOTRecords, setClaimedOTRecords] = useState([]);
//   const [selectedOTIds, setSelectedOTIds] = useState([]);

//   // ✅ Helper function to format decimal hours to HH:MM
//   const formatDecimalHours = (decimalHours) => {
//     if (!decimalHours && decimalHours !== 0) return "0h 0m";
//     const hours = Math.floor(decimalHours);
//     const minutes = Math.round((decimalHours - hours) * 60);
//     if (minutes === 60) {
//       return `${hours + 1}h 0m`;
//     }
//     return `${hours}h ${minutes}m`;
//   };

//   // ✅ Get shift hours directly from attendance record
//   const getCorrectShiftHours = (record) => {
//     return record.assignedShiftHours || 9;
//   };

//   // ✅ Calculate OT Hours
//   const calculateOTHoursFromRecord = (record) => {
//     const totalHours = record.totalHours || record.hours || 0;
//     if (totalHours === 0) return 0;
    
//     const assignedShiftHours = getCorrectShiftHours(record);
//     if (!assignedShiftHours || assignedShiftHours === 0) return 0;
    
//     const ot = totalHours - assignedShiftHours;
    
//     // 30 MINUTES THRESHOLD (0.5 hours)
//     if (ot > 0.5) {
//       return Math.round(ot * 100) / 100;
//     }
    
//     return 0;
//   };

//   // ✅ Check if OT is already claimed for a record
//   const isOTClaimed = (recordId) => {
//     return claimedOTRecords.some(r => r.attendanceId === recordId);
//   };

//   // ✅ Get claimed OT status for a record
//   const getOTClaimStatus = (recordId) => {
//     return claimedOTRecords.find(r => r.attendanceId === recordId);
//   };

//   // ✅ Check if OT is available for a record
//   const hasOTAvailable = (record) => {
//     const otHours = calculateOTHoursFromRecord(record);
//     return otHours > 0 && !isOTClaimed(record._id);
//   };

//   // ✅ FIX: Don't filter out 0 hours records
//   const isValidRecord = (record) => {
//     const totalHours = record.totalHours || record.hours || 0;
//     // Only filter out > 24 hours records
//     if (totalHours > 24) return false;
//     return true;
//   };

//   // ✅ Format time with status - WITH BLINKING DOT
//   const formatTimeWithStatus = (record) => {
//     const checkInTime = record?.checkInTime;
//     const checkOutTime = record?.checkOutTime;
//     const totalHours = record?.totalHours || record?.hours || 0;
//     const assignedShift = getCorrectShiftHours(record);
//     const status = record?.status;

//     const checkIn = checkInTime ? new Date(checkInTime).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     }) : null;

//     const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     }) : null;

//     const formattedHours = formatDecimalHours(totalHours);

//     // ✅ Blinking dot for checked-in status
//     if (checkIn && !checkOut) {
//       return (
//         <div className="flex flex-col items-center justify-center">
//           <div className="flex items-center justify-center gap-1">
//             <span className="relative flex w-2 h-2">
//               <span className="absolute inline-flex w-full h-full bg-blue-500 rounded-full opacity-75 animate-ping"></span>
//               <span className="relative inline-flex w-2 h-2 bg-blue-600 rounded-full"></span>
//             </span>
//             <span className="font-semibold text-blue-700">{checkIn}</span>
//             <span className="text-xs text-gray-500">/ --:--</span>
//           </div>
//           <span className="text-[10px] text-gray-400">{formattedHours}</span>
//           <span className="text-[8px] text-gray-400">Shift: {assignedShift}h</span>
//         </div>
//       );
//     } else if (checkIn && checkOut) {
//       return (
//         <div className="flex flex-col items-center justify-center">
//           <div className="flex items-center justify-center gap-1">
//             <span className="inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
//             <span className="font-semibold text-gray-700">{checkIn}</span>
//             <span className="text-xs text-gray-500">/</span>
//             <span className="font-semibold text-red-600">{checkOut}</span>
//           </div>
//           <span className="text-[10px] text-gray-400">{formattedHours}</span>
//           <span className="text-[8px] text-gray-400">Shift: {assignedShift}h</span>
//         </div>
//       );
//     } else {
//       return <span className="text-gray-500">-</span>;
//     }
//   };

//   // Click outside handlers for filter dropdowns
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
//         setShowDepartmentFilter(false);
//       }
//       if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
//         setShowDesignationFilter(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const fetchAttendance = async () => {
//       try {
//         const employeeData = JSON.parse(localStorage.getItem("employeeData"));
//         setEmployeeData(employeeData);
//         const employeeId = employeeData?.employeeId;

//         if (!employeeId) {
//           setError("❌ Employee ID not found. Please log in again.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(`${API_BASE_URL}/attendance/myattendance/${employeeId}`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         const allRecords = data.records || [];
//         const validRecords = allRecords.filter(isValidRecord);
        
//         // ✅ SORT: Latest first (newest on top)
//         const sortedRecords = validRecords.sort((a, b) =>
//           new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);

//         await fetchClaimedOT(employeeId);
//       } catch (err) {
//         console.error("Attendance fetch error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendance();
//   }, []);

//   const fetchClaimedOT = async (employeeId) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/employees/employeeotclaimed/${employeeId}`);
//       const data = await res.json();
//       if (res.ok && data.success) {
//         const transformedRecords = data.claims.map(claim => ({
//           attendanceId: claim.attendanceId,
//           status: claim.status,
//           otHours: claim.otHours,
//           otAmount: claim.otAmount,
//           multiplier: claim.multiplier,
//           date: claim.date,
//           reason: claim.reason,
//           approvedBy: claim.approvedBy,
//           approvedAt: claim.approvedAt,
//           employeeDetails: claim.employeeDetails,
//           attendanceDetails: claim.attendanceDetails,
//           formattedDate: claim.formattedDate,
//           formattedOTHours: claim.formattedOTHours,
//           formattedOTAmount: claim.formattedOTAmount,
//           statusBadge: claim.statusBadge
//         }));
//         setClaimedOTRecords(transformedRecords);
//       }
//     } catch (err) {
//       console.error("Error fetching claimed OT:", err);
//     }
//   };

//   // Handle checkbox selection
//   const handleOTCheckboxChange = (recordId) => {
//     setSelectedOTIds(prev => {
//       if (prev.includes(recordId)) {
//         return prev.filter(id => id !== recordId);
//       } else {
//         return [...prev, recordId];
//       }
//     });
//   };

//   const handleUnselectFromPopup = (recordId) => {
//     setSelectedOTRecords(prev => prev.filter(r => r._id !== recordId));
//     setSelectedOTIds(prev => prev.filter(id => id !== recordId));
//   };

//   const handleSelectAllOT = () => {
//     const availableOTIds = records
//       .filter(r => hasOTAvailable(r))
//       .map(r => r._id);
    
//     if (selectedOTIds.length === availableOTIds.length && availableOTIds.length > 0) {
//       setSelectedOTIds([]);
//     } else {
//       setSelectedOTIds(availableOTIds);
//     }
//   };

//   const handleBulkOTClaim = () => {
//     if (selectedOTIds.length === 0) {
//       alert("Please select at least one record with OT to claim.");
//       return;
//     }

//     const selectedRecords = records.filter(r => selectedOTIds.includes(r._id));
//     const validRecords = selectedRecords.filter(r => hasOTAvailable(r));

//     if (validRecords.length === 0) {
//       alert("Selected records are either already claimed or have no OT.");
//       return;
//     }

//     setSelectedOTRecords(validRecords);
//     setOTClaimReason("");
//     setShowOTClaimModal(true);
//   };

//   const handleSubmitBulkOTClaim = async (e) => {
//     e.preventDefault();
//     if (!otClaimReason.trim()) {
//       alert("Please provide a reason for claiming OT.");
//       return;
//     }

//     setSubmittingOTClaim(true);
//     try {
//       const claims = selectedOTRecords.map(record => ({
//         employeeId: employeeData.employeeId,
//         employeeName: employeeData.name || "Employee",
//         attendanceId: record._id,
//         date: record.checkInTime,
//         otHours: calculateOTHoursFromRecord(record),
//         reason: otClaimReason
//       }));

//       const payload = {
//         claims: claims,
//         totalOTHours: claims.reduce((sum, c) => sum + c.otHours, 0)
//       };

//       const res = await fetch(`${API_BASE_URL}/employees/claimot`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to claim OT");

//       alert(`✅ ${claims.length} OT claims submitted successfully!`);
//       setShowOTClaimModal(false);
//       setSelectedOTRecords([]);
//       setSelectedOTIds([]);
//       setOTClaimReason("");

//       await fetchClaimedOT(employeeData.employeeId);
      
//       const refreshRes = await fetch(`${API_BASE_URL}/attendance/myattendance/${employeeData.employeeId}`);
//       const refreshData = await refreshRes.json();
//       if (refreshRes.ok) {
//         const sortedRecords = (refreshData.records || []).sort((a, b) =>
//           new Date(b.checkInTime) - new Date(a.checkInTime)
//         );
//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);
//       }
//     } catch (err) {
//       console.error("Submit OT claim error:", err);
//       alert("❌ Error: " + err.message);
//     } finally {
//       setSubmittingOTClaim(false);
//     }
//   };

//   // Apply filters and search
//   useEffect(() => {
//     let filtered = records;

//     if (searchDate) {
//       filtered = filtered.filter(rec => {
//         const recordDate = new Date(rec.checkInTime || rec.createdAt).toISOString().split("T")[0];
//         return recordDate === searchDate;
//       });
//     }

//     if (dateFrom && dateTo) {
//       filtered = filtered.filter(rec => {
//         const recordDate = new Date(rec.checkInTime || rec.createdAt);
//         recordDate.setHours(0, 0, 0, 0);
//         const fromDate = new Date(dateFrom);
//         fromDate.setHours(0, 0, 0, 0);
//         const toDate = new Date(dateTo);
//         toDate.setHours(23, 59, 59, 999);
//         return recordDate >= fromDate && recordDate <= toDate;
//       });
//     } else if (dateFrom) {
//       filtered = filtered.filter(rec => {
//         const recordDate = new Date(rec.checkInTime || rec.createdAt);
//         recordDate.setHours(0, 0, 0, 0);
//         const fromDate = new Date(dateFrom);
//         fromDate.setHours(0, 0, 0, 0);
//         return recordDate >= fromDate;
//       });
//     } else if (dateTo) {
//       filtered = filtered.filter(rec => {
//         const recordDate = new Date(rec.checkInTime || rec.createdAt);
//         recordDate.setHours(0, 0, 0, 0);
//         const toDate = new Date(dateTo);
//         toDate.setHours(23, 59, 59, 999);
//         return recordDate <= toDate;
//       });
//     }

//     if (selectedMonth) {
//       const [year, month] = selectedMonth.split("-").map(Number);
//       filtered = filtered.filter((rec) => {
//         const d = new Date(rec.checkInTime || rec.createdAt);
//         return d.getFullYear() === year && d.getMonth() + 1 === month;
//       });
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter(rec => rec.status === statusFilter);
//     }

//     if (onsiteFilter !== "all") {
//       filtered = filtered.filter(rec =>
//         onsiteFilter === "yes" ? rec.onsite : !rec.onsite
//       );
//     }

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   }, [searchDate, dateFrom, dateTo, selectedMonth, statusFilter, onsiteFilter, records]);

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const clearFilters = () => {
//     setSearchDate("");
//     setDateFrom("");
//     setDateTo("");
//     setSelectedMonth("");
//     setStatusFilter("all");
//     setOnsiteFilter("all");
//   };

//   const handleSearchDateChange = (e) => {
//     setSearchDate(e.target.value);
//     setDateFrom("");
//     setDateTo("");
//     setSelectedMonth("");
//   };

//   const handleDateFromChange = (e) => {
//     setDateFrom(e.target.value);
//     setSearchDate("");
//     setSelectedMonth("");
//   };

//   const handleDateToChange = (e) => {
//     setDateTo(e.target.value);
//     setSearchDate("");
//     setSelectedMonth("");
//   };

//   const handleMonthChange = (e) => {
//     setSelectedMonth(e.target.value);
//     setSearchDate("");
//     setDateFrom("");
//     setDateTo("");
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (page) => {
//     setCurrentPage(page);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     for (let i = 1; i <= totalPages; i++) {
//       if (
//         i === 1 ||
//         i === totalPages ||
//         (i >= currentPage - 2 && i <= currentPage + 2)
//       ) {
//         pageNumbers.push(i);
//       } else if (i === currentPage - 3 || i === currentPage + 3) {
//         pageNumbers.push("...");
//       }
//     }
//     return pageNumbers;
//   };

//   // Handle Edit Request Submission
//   const handleAddRequestDate = () => {
//     if (!requestDate) return alert("Please select a date first");
//     if (selectedRequestDates.includes(requestDate)) return alert("Date already added");
//     setSelectedRequestDates([...selectedRequestDates, requestDate]);
//     setRequestDate("");
//   };

//   const handleRemoveRequestDate = (dateToRemove) => {
//     setSelectedRequestDates(selectedRequestDates.filter(d => d !== dateToRemove));
//   };

//   const handleSubmitEditRequest = async (e) => {
//     e.preventDefault();
//     if (selectedRequestDates.length === 0) return alert("Please select at least one date");
//     if (!requestComment.trim()) return alert("Please enter a comment");

//     try {
//       setSubmittingRequest(true);
//       const payload = {
//         employeeId: employeeData.employeeId,
//         employeeName: employeeData.name || "Employee",
//         selectedDates: selectedRequestDates,
//         comment: requestComment
//       };

//       const res = await fetch(`${API_BASE_URL}/attendance-edit-requests/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to submit request");

//       alert("✅ Attendance edit request submitted successfully!");
//       setShowEditModal(false);
//       setSelectedRequestDates([]);
//       setRequestComment("");
//     } catch (err) {
//       console.error("Submit request error:", err);
//       alert("❌ Error: " + err.message);
//     } finally {
//       setSubmittingRequest(false);
//     }
//   };

//   // Download CSV function
//   const downloadCSV = () => {
//     if (filteredRecords.length === 0) {
//       alert("No data available to download!");
//       return;
//     }

//     const headers = [
//       "Date",
//       "Check-In Time",
//       "Check-Out Time",
//       "Assigned Shift",
//       "Total Hours",
//       "OT Hours",
//       "Claimed OT",
//       "OT Amount",
//       "Multiplier",
//       "Distance (m)",
//       "Onsite",
//       "Reason",
//       "Status"
//     ];

//     const csvRows = [
//       headers.join(","),
//       ...filteredRecords.map((rec) => {
//         const totalHours = rec.totalHours || rec.hours || 0;
//         const assignedShift = getCorrectShiftHours(rec);
//         const formattedHours = formatDecimalHours(totalHours);
//         const otHours = calculateOTHoursFromRecord(rec);
//         const formattedOT = formatDecimalHours(otHours);
//         const claimed = isOTClaimed(rec._id);
//         const claimStatus = getOTClaimStatus(rec._id);
//         const otAmount = claimStatus?.otAmount || 0;
//         const multiplier = claimStatus?.multiplier || 0;
//         const status = claimed ? (claimStatus?.status || "Claimed") : "Pending";
//         return [
//           `"${formatDate(rec.checkInTime || rec.createdAt)}"`,
//           `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`,
//           `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
//           `${assignedShift}h`,
//           formattedHours,
//           otHours > 0 ? formattedOT : "0h 0m",
//           claimed ? "Yes" : "No",
//           claimed ? `₹${otAmount.toFixed(2)}` : "-",
//           claimed ? `${multiplier}x` : "-",
//           rec.distance?.toFixed(2) || "0.00",
//           rec.onsite ? "Yes" : "No",
//           `"${rec.reason || "Not specified"}"`,
//           status
//         ].join(",");
//       }),
//     ];

//     const csvData = csvRows.join("\n");
//     const blob = new Blob([csvData], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `my_attendance_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Calculate total OT available
//   const totalOTAvailable = records.reduce((sum, r) => {
//     if (!isOTClaimed(r._id)) {
//       const ot = calculateOTHoursFromRecord(r);
//       return sum + (ot > 0 ? ot : 0);
//     }
//     return sum;
//   }, 0);

//   const availableOTCount = records.filter(r => hasOTAvailable(r)).length;

//   if (loading) {
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div className="emp-dash__spinner" />
//           <p className="emp-dash__loading-text">Loading your attendance records...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="emp-dash">
//         <main className="grid place-items-center min-h-[60vh] p-4">
//           <div className="emp-dash__card max-w-[520px] w-full">
//             <div className="emp-dash__card-header">
//               <div>
//                 <h3 className="emp-dash__card-title">Couldn't load attendance records</h3>
//                 <p className="emp-dash__card-desc text-red-600 mt-1">{error}</p>
//               </div>
//               <button type="button" className="emp-dash__card-link" onClick={() => window.location.reload()}>
//                 Retry
//               </button>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="emp-dash">
//       <div className="p-4 sm:p-6 lg:p-8">

//         {/* OT Info Banner */}
//         <div className="p-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg">
//           <p className="text-sm text-blue-700">
//             ⏱️ <strong>OT Calculation:</strong> OT hours are calculated when total hours exceed <strong>Assigned Shift Hours</strong> by more than <strong>30 minutes (0.5 hours)</strong>.
//             <br />
//             <span className="text-xs text-blue-600">💡 Example: If shift is 9h, OT starts after 9h 30m of work.</span>
//           </p>
//         </div>

//         {/* Stats Cards - Dashboard Style */}
//         <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-6">
//           <StatCard
//             label="Total Records"
//             value={records.length}
//             color="indigo"
//             icon={FiFileText}
//           />
//           <StatCard
//             label="Onsite Days"
//             value={records.filter(r => r.onsite).length}
//             color="emerald"
//             icon={FiMapPin}
//           />
//           <StatCard
//             label="Checked In"
//             value={records.filter(r => r.status === "checked-in").length}
//             color="amber"
//             icon={FiCheckCircle}
//           />
//           <StatCard
//             label="Full Days"
//             value={records.filter(r => (r.totalHours || r.hours || 0) >= 8).length}
//             color="purple"
//             icon={FiCheckSquare}
//           />
//           <StatCard
//             label="OT Hours"
//             value={records.reduce((sum, r) => {
//               const ot = calculateOTHoursFromRecord(r);
//               return sum + ot;
//             }, 0)}
//             color="orange"
//             icon={FiClock}
//           />
//           <StatCard
//             label="Claimed OT"
//             value={claimedOTRecords.length}
//             color="teal"
//             icon={FiCheckCircle}
//           />
//         </div>

//         {/* Available OT Banner */}
//         {availableOTCount > 0 && (
//           <div className="p-3 mb-3 bg-orange-50 border border-orange-200 rounded-lg flex flex-wrap items-center justify-between">
//             <div>
//               <span className="text-sm font-medium text-orange-700">
//                 🕐 {availableOTCount} record(s) have OT available ({formatDecimalHours(totalOTAvailable)} total OT hours)
//               </span>
//             </div>
//             {selectedOTIds.length > 0 && (
//               <span className="text-xs text-orange-600 font-medium">
//                 {selectedOTIds.length} selected
//               </span>
//             )}
//             <div className="flex gap-2">
//               <button
//                 onClick={handleSelectAllOT}
//                 className="px-3 py-1 text-xs font-medium text-orange-700 bg-white border border-orange-300 rounded-lg hover:bg-orange-100 transition"
//               >
//                 {selectedOTIds.length === availableOTCount && availableOTCount > 0 ? 'Deselect All' : 'Select All'}
//               </button>
//               <button
//                 onClick={handleBulkOTClaim}
//                 disabled={selectedOTIds.length === 0}
//                 className={`px-3 py-1 text-xs font-medium text-white rounded-lg transition ${
//                   selectedOTIds.length === 0 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : 'bg-orange-500 hover:bg-orange-600'
//                 }`}
//               >
//                 Claim Selected ({selectedOTIds.length})
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Filters Section */}
//         <div className="p-2 mb-3 bg-white rounded-lg shadow-md sm:p-3">
//           <div className="flex flex-wrap items-center gap-1 sm:gap-2">

//             {/* Single Date Filter */}
//             <div className="relative w-[110px] sm:w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={searchDate}
//                 onChange={handleSearchDateChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="Date"
//                 className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Date From */}
//             <div className="relative w-[110px] sm:w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={handleDateFromChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="From"
//                 className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Date To */}
//             <div className="relative w-[110px] sm:w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={handleDateToChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="To"
//                 className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Filter */}
//             <div className="relative w-[110px] sm:w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 placeholder="Month"
//                 className="w-full pl-8 pr-1 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Status Filter */}
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="h-8 px-1 py-1 text-xs border border-gray-300 rounded-lg w-[90px] sm:w-[100px] focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="checked-in">Checked In</option>
//               <option value="checked-out">Checked Out</option>
//             </select>

//             {/* Onsite Filter */}
//             <select
//               value={onsiteFilter}
//               onChange={(e) => setOnsiteFilter(e.target.value)}
//               className="h-8 px-1 py-1 text-xs border border-gray-300 rounded-lg w-[90px] sm:w-[100px] focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="all">All Locations</option>
//               <option value="yes">Onsite Only</option>
//               <option value="no">Remote Only</option>
//             </select>

//             {/* CSV Button */}
//             <button
//               onClick={downloadCSV}
//               className="h-8 px-2 text-xs font-medium text-white transition bg-green-600 rounded-md sm:px-3 hover:bg-green-700"
//             >
//               📥 CSV
//             </button>

//             {/* Clear Button */}
//             {(searchDate || dateFrom || dateTo || selectedMonth || statusFilter !== "all" || onsiteFilter !== "all") && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-2 text-xs font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-md sm:px-3 hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//           <div className="emp-dash__date-pill">
//             <FaCalendarAlt />
//             <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
//           </div>
//         </div>

//         {/* Top KPI Stats Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Total Records</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiFileText />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{records.length}</div>
//             <div className="emp-dash__stat-meta">in selected period</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Onsite Days</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiMapPin />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{records.filter((r) => r.onsite).length}</div>
//             <div className="emp-dash__stat-meta">office check-ins</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Checked In</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                 <FiCheckCircle />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{records.filter((r) => r.status === "checked-in").length}</div>
//             <div className="emp-dash__stat-meta">currently active</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Full Days</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiCheckSquare />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{records.filter(r => (r.totalHours || r.hours || 0) >= 8).length}</div>
//             <div className="emp-dash__stat-meta">8+ hours worked</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">OT Hours</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                 <FiClock />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
//               {formatDecimalHours(records.reduce((sum, r) => sum + calculateOTHoursFromRecord(r), 0))}
//             </div>
//             <div className="emp-dash__stat-meta">available to claim</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Claimed OT</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiCheckCircle />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{claimedOTRecords.length}</div>
//             <div className="emp-dash__stat-meta">claims submitted</div>
//           </div>
//         </div>

//         {/* OT Info Banner */}
//         <div className="emp-dash__card mb-6">
//           <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
//             <p className="text-sm text-blue-700">
//               <span className="font-semibold">OT Calculation:</span> OT hours are calculated when total hours exceed <strong>Assigned Shift Hours</strong> by more than <strong>30 minutes (0.5 hours)</strong>.
//             </p>
//             <p className="text-xs text-blue-600 mt-1">
//               💡 Example: If shift is 9h, OT starts after 9h 30m of work.
//             </p>
//           </div>
//           {availableOTCount > 0 && (
//             <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
//               <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
//                 <div>
//                   <span className="text-sm font-medium text-orange-700">
//                     🕐 {availableOTCount} record(s) have OT available ({formatDecimalHours(totalOTAvailable)} total OT hours)
//                   </span>
//                 </div>
//                 {selectedOTIds.length > 0 && (
//                   <span className="text-xs text-orange-600 font-medium">
//                     {selectedOTIds.length} selected
//                   </span>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleSelectAllOT}
//                   className="px-3 py-1 text-xs font-medium text-orange-700 bg-white border border-orange-300 rounded-lg hover:bg-orange-100 transition"
//                 >
//                   {selectedOTIds.length === availableOTCount && availableOTCount > 0 ? 'Deselect All' : 'Select All'}
//                 </button>
//                 <button
//                   onClick={handleBulkOTClaim}
//                   disabled={selectedOTIds.length === 0}
//                   className={`px-3 py-1 text-xs font-medium text-white rounded-lg transition ${
//                     selectedOTIds.length === 0 
//                       ? 'bg-gray-400 cursor-not-allowed' 
//                       : 'bg-orange-500 hover:bg-orange-600'
//                   }`}
//                 >
//                   Claim Selected ({selectedOTIds.length})
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters Card */}
//         <div className="emp-dash__card mb-6">
//           <div className="emp-dash__card-header flex-col sm:flex-row gap-3">
//             <div>
//               <h3 className="emp-dash__card-title">Filters &amp; Actions</h3>
//               <p className="emp-dash__card-desc">Filter attendance by date, status, and location.</p>
//             </div>
//           </div>

//           <div className="emp-dash__card-body bg-gray-50/50">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
//               {/* Single Date Filter */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Date</label>
//                 <input
//                   type="date"
//                   value={searchDate}
//                   onChange={handleSearchDateChange}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Date From */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">From Date</label>
//                 <input
//                   type="date"
//                   value={dateFrom}
//                   onChange={handleDateFromChange}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Date To */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">To Date</label>
//                 <input
//                   type="date"
//                   value={dateTo}
//                   onChange={handleDateToChange}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Month Filter */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Month</label>
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={handleMonthChange}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Status Filter */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Status</label>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="checked-in">Checked In</option>
//                   <option value="checked-out">Checked Out</option>
//                 </select>
//               </div>

//               {/* Onsite Filter */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Location</label>
//                 <select
//                   value={onsiteFilter}
//                   onChange={(e) => setOnsiteFilter(e.target.value)}
//                   className="w-full h-9 px-3 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 >
//                   <option value="all">All Locations</option>
//                   <option value="yes">Onsite Only</option>
//                   <option value="no">Remote Only</option>
//                 </select>
//               </div>
//             </div>

//             <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
//               <div className="text-xs text-gray-500 font-medium">
//                 Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
//               </div>
//               <div className="flex gap-2">
//                 {(searchDate || dateFrom || dateTo || selectedMonth || statusFilter !== "all" || onsiteFilter !== "all") && (
//                   <button
//                     onClick={clearFilters}
//                     className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 transition-all flex items-center gap-1.5 shadow-sm"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//                 <button
//                   onClick={downloadCSV}
//                   className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-md"
//                 >
//                   Export CSV
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Attendance Records Section */}
//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Attendance records</h3>
//               <p className="emp-dash__card-desc">Detailed check-in/out logs for the selected period.</p>
//             </div>
//           </div>
//           {filteredRecords.length === 0 ? (
//             <div className="emp-dash__card-body py-12 text-center text-gray-500">
//               <div className="mb-3 text-4xl text-gray-300">📭</div>
//               <p className="mb-1 text-sm font-semibold text-gray-800">No attendance records found</p>
//               <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">There are no records matching the selected search query or filters.</p>
//               {(searchDate || dateFrom || dateTo || selectedMonth || statusFilter !== "all" || onsiteFilter !== "all") && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 transition-all shadow-sm"
//                 >
//                   Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="emp-dash__table">
//                   <thead>
//                     <tr>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                         <input
//                           type="checkbox"
//                           checked={records.filter(r => hasOTAvailable(r)).length > 0 && selectedOTIds.length === records.filter(r => hasOTAvailable(r)).length}
//                           onChange={handleSelectAllOT}
//                           className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
//                           disabled={records.filter(r => hasOTAvailable(r)).length === 0}
//                         />
//                       </th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Date</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Check-In/Out</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Assigned Shift</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Hours</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">OT Hours</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Claimed OT</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">OT Amount</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Distance</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Onsite</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentRecords.map((rec, idx) => {
//                       const totalHours = rec.totalHours || rec.hours || 0;
//                       const assignedShift = getCorrectShiftHours(rec);
//                       let hoursColorClass = 'text-red-600';
//                       if (totalHours >= assignedShift) hoursColorClass = 'text-blue-700';
//                       else if (totalHours >= assignedShift * 0.5) hoursColorClass = 'text-orange-600';
//                       else hoursColorClass = 'text-red-600';
                      
//                       const otHours = calculateOTHoursFromRecord(rec);
//                       const hasOT = otHours > 0;
//                       const claimed = isOTClaimed(rec._id);
//                       const claimStatus = getOTClaimStatus(rec._id);
//                       const isAvailable = hasOT && !claimed;
                      
//                       let statusDisplay = "Pending";
//                       let statusColor = "text-gray-400";
//                       let bgColor = "bg-gray-50";
//                       let borderColor = "border-gray-200";
                      
//                       if (claimed && claimStatus) {
//                         if (claimStatus.status === 'approved') {
//                           statusDisplay = "Approved";
//                           statusColor = "text-green-600";
//                           bgColor = "bg-green-50";
//                           borderColor = "border-green-200";
//                         } else if (claimStatus.status === 'rejected') {
//                           statusDisplay = "Rejected";
//                           statusColor = "text-red-600";
//                           bgColor = "bg-red-50";
//                           borderColor = "border-red-200";
//                         } else {
//                           statusDisplay = "Pending";
//                           statusColor = "text-yellow-600";
//                           bgColor = "bg-yellow-50";
//                           borderColor = "border-yellow-200";
//                         }
//                       }
                      
//                       let otAmountDisplay = "-";
//                       let otAmountColor = "text-gray-400";
//                       if (claimed && claimStatus && claimStatus.otAmount) {
//                         otAmountDisplay = `₹${claimStatus.otAmount.toFixed(2)}`;
//                         otAmountColor = "text-green-600 font-semibold";
//                       }
                      
//                       return (
//                         <tr
//                           key={rec._id || idx}
//                           className="transition-colors hover:bg-slate-50/50"
//                         >
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             {isAvailable && (
//                               <input
//                                 type="checkbox"
//                                 checked={selectedOTIds.includes(rec._id)}
//                                 onChange={() => handleOTCheckboxChange(rec._id)}
//                                 className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
//                               />
//                             )}
//                           </td>
//                           <td className="px-2 py-1.5 font-medium text-center text-gray-900 whitespace-nowrap sm:px-3 sm:py-2">
//                             {formatDate(rec.checkInTime || rec.createdAt)}
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             {formatTimeWithStatus(rec)}
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className="font-semibold text-purple-600">
//                               {assignedShift}h
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className={`font-semibold ${hoursColorClass}`}>
//                               {formatDecimalHours(totalHours)}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             {hasOT ? (
//                               <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
//                                 +{formatDecimalHours(otHours)}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">0h 0m</span>
//                             )}
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             {claimed ? (
//                               <span className={`font-semibold ${statusColor} ${bgColor} px-2 py-0.5 rounded-full border ${borderColor}`}>
//                                 {statusDisplay}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">Pending</span>
//                             )}
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className={otAmountColor}>
//                               {otAmountDisplay}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className="px-1.5 py-0.5 font-mono text-gray-700 bg-gray-100 rounded sm:px-2 sm:py-1">
//                               {rec.distance?.toFixed(0) || "0"}m
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${rec.onsite ? "bg-emerald-50 text-emerald-700 border border-green-300" : "bg-red-50 text-red-700 border border-red-300"}`}>
//                               {rec.onsite ? "🏢 Yes" : "🏠 No"}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded max-w-[80px] truncate block sm:max-w-[100px]">
//                               {rec.reason || "-"}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${rec.status === "checked-in" ? "bg-blue-50 text-blue-700 border border-blue-300 animate-pulse" : "bg-purple-100 text-purple-800 border border-purple-300"}`}>
//                               {rec.status === "checked-in" ? "In" : "Out"}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination Section */}
//               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <div className="flex items-center gap-2 text-xs text-gray-500">
//                     <span>Show</span>
//                     <select
//                       value={itemsPerPage}
//                       onChange={handleItemsPerPageChange}
//                       className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                     <span>entries</span>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={currentPage === 1}
//                       className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}
//                     >
//                       ←
//                     </button>

//                     {getPageNumbers().map((page, index) => (
//                       <button
//                         key={index}
//                         onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                         disabled={page === "..."}
//                         className={`px-2 py-1 text-xs font-semibold rounded-lg transition min-w-[24px] ${page === "..." ? "bg-gray-200 text-gray-500 cursor-default" : currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                       >
//                         {page}
//                       </button>
//                     ))}

//                     <button
//                       onClick={handleNextPage}
//                       disabled={currentPage === totalPages}
//                       className={`px-2 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}
//                     >
//                       →
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-1.5">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
//                       currentPage === 1
//                         ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
//                         : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
//                     }`}
//                   >
//                     Prev
//                   </button>

//                   {getPageNumbers().map((page, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                       disabled={page === "..."}
//                       className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
//                         page === "..."
//                           ? "text-gray-400 bg-gray-100 border-gray-200 cursor-default"
//                           : currentPage === page
//                           ? "text-white bg-blue-600 border-blue-600 shadow-sm"
//                           : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
//                       currentPage === totalPages
//                         ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
//                         : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//       {/* Attendance Edit Request Modal */}
//       {showEditModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-gray-800">Request Record Edit</h2>
//                 <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-500 transition hover:text-gray-700">✕</button>
//               </div>
//               <p className="mt-1 text-xs text-gray-500">Raise a request to admin to edit your attendance records</p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee ID & Name</label>
//                 <div className="flex gap-2">
//                   <input type="text" value={employeeData?.employeeId || ""} disabled className="w-1/3 px-3 py-2 text-xs bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" />
//                   <input type="text" value={employeeData?.name || ""} disabled className="w-2/3 px-3 py-2 text-xs bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Dates</label>
//                 <div className="flex gap-2">
//                   <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" />
//                   <button type="button" onClick={handleAddRequestDate} className="px-3 py-1 text-xs font-bold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700">+ Add</button>
//                 </div>
//                 {selectedRequestDates.length > 0 && (
//                   <div className="flex flex-wrap gap-1 mt-2">
//                     {selectedRequestDates.map(date => (
//                       <span key={date} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
//                         {date}
//                         <button onClick={() => handleRemoveRequestDate(date)} className="text-blue-600 hover:text-blue-700">×</button>
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Comment / Reason</label>
//                 <textarea value={requestComment} onChange={(e) => setRequestComment(e.target.value)} placeholder="Explain why you need to edit these records..." className="w-full h-24 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500" />
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-xs font-bold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button onClick={handleSubmitEditRequest} disabled={submittingRequest} className={`flex-1 px-4 py-2 text-xs font-bold text-white transition rounded-lg shadow-lg ${submittingRequest ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"}`}>
//                   {submittingRequest ? "Submitting..." : "Submit Request"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk OT Claim Modal */}
//       {showOTClaimModal && selectedOTRecords.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
//                   <FaClock className="text-orange-500" /> Claim OT ({selectedOTRecords.length} records)
//                 </h2>
//                 <button onClick={() => setShowOTClaimModal(false)} className="p-1 text-gray-500 transition hover:text-gray-700">✕</button>
//               </div>
//               <p className="mt-1 text-xs text-gray-500">Claim overtime for selected records</p>
//               <p className="text-xs text-orange-600 mt-1">
//                 💡 Click <span className="font-bold">✕</span> on any record to remove it from claim
//               </p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="max-h-40 overflow-y-auto space-y-1">
//                 {selectedOTRecords.map((record, idx) => {
//                   const otHours = calculateOTHoursFromRecord(record);
//                   return (
//                     <div key={idx} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200 text-xs">
//                       <div className="flex-1 flex justify-between items-center mr-2">
//                         <span className="font-medium text-gray-700">{formatDate(record.checkInTime)}</span>
//                         <span className="font-bold text-orange-600">+{formatDecimalHours(otHours)}</span>
//                       </div>
//                       <button
//                         onClick={() => handleUnselectFromPopup(record._id)}
//                         className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
//                         title="Remove from selection"
//                       >
//                         <FaTimes size={14} />
//                       </button>
//                     </div>
//                   );
//                 })}
                
//                 {/* Total OT Hours */}
//                 <div className="p-2 mt-1 bg-orange-100 rounded-lg border border-orange-300">
//                   <div className="flex justify-between font-semibold">
//                     <span>Total OT Hours</span>
//                     <span className="text-orange-700">
//                       {formatDecimalHours(selectedOTRecords.reduce((sum, r) => 
//                         sum + calculateOTHoursFromRecord(r), 0
//                       ))}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Remove All button */}
//                 {selectedOTRecords.length > 1 && (
//                   <button
//                     onClick={() => {
//                       if (window.confirm("Remove all records from selection?")) {
//                         setSelectedOTRecords([]);
//                         setSelectedOTIds([]);
//                         setShowOTClaimModal(false);
//                       }
//                     }}
//                     className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
//                   >
//                     <FaTrash size={10} /> Remove All
//                   </button>
//                 )}
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason for OT Claim</label>
//                 <textarea
//                   value={otClaimReason}
//                   onChange={(e) => setOTClaimReason(e.target.value)}
//                   placeholder="Why are you claiming overtime for these days?"
//                   className="w-full h-24 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button onClick={() => setShowOTClaimModal(false)} className="flex-1 px-4 py-2 text-xs font-bold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button onClick={handleSubmitBulkOTClaim} disabled={submittingOTClaim} className={`flex-1 px-4 py-2 text-xs font-bold text-white transition rounded-lg shadow-lg ${submittingOTClaim ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"}`}>
//                   {submittingOTClaim ? "Submitting..." : `Claim ${selectedOTRecords.length} OT`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk OT Claim Modal */}
//       {showOTClaimModal && selectedOTRecords.length > 0 && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
//                   <FaClock className="text-orange-500" /> Claim OT ({selectedOTRecords.length} records)
//                 </h2>
//                 <button onClick={() => setShowOTClaimModal(false)} className="p-1 text-gray-500 transition hover:text-gray-700">✕</button>
//               </div>
//               <p className="mt-1 text-xs text-gray-500">Claim overtime for selected records</p>
//               <p className="text-xs text-orange-600 mt-1">
//                 💡 Click <span className="font-bold">✕</span> on any record to remove it from claim
//               </p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="max-h-40 overflow-y-auto space-y-1">
//                 {selectedOTRecords.map((record, idx) => {
//                   const otHours = calculateOTHoursFromRecord(record);
//                   return (
//                     <div key={idx} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200 text-xs">
//                       <div className="flex-1 flex justify-between items-center mr-2">
//                         <span className="font-medium text-gray-700">{formatDate(record.checkInTime)}</span>
//                         <span className="font-bold text-orange-600">+{formatDecimalHours(otHours)}</span>
//                       </div>
//                       <button
//                         onClick={() => handleUnselectFromPopup(record._id)}
//                         className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
//                         title="Remove from selection"
//                       >
//                         <FaTimes size={14} />
//                       </button>
//                     </div>
//                   );
//                 })}
                
//                 {/* Total OT Hours */}
//                 <div className="p-2 mt-1 bg-orange-100 rounded-lg border border-orange-300">
//                   <div className="flex justify-between font-semibold">
//                     <span>Total OT Hours</span>
//                     <span className="text-orange-700">
//                       {formatDecimalHours(selectedOTRecords.reduce((sum, r) => 
//                         sum + calculateOTHoursFromRecord(r), 0
//                       ))}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Remove All button */}
//                 {selectedOTRecords.length > 1 && (
//                   <button
//                     onClick={() => {
//                       if (window.confirm("Remove all records from selection?")) {
//                         setSelectedOTRecords([]);
//                         setSelectedOTIds([]);
//                         setShowOTClaimModal(false);
//                       }
//                     }}
//                     className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
//                   >
//                     <FaTrash size={10} /> Remove All
//                   </button>
//                 )}
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason for OT Claim</label>
//                 <textarea
//                   value={otClaimReason}
//                   onChange={(e) => setOTClaimReason(e.target.value)}
//                   placeholder="Why are you claiming overtime for these days?"
//                   className="w-full h-24 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button onClick={() => setShowOTClaimModal(false)} className="flex-1 px-4 py-2 text-xs font-bold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button onClick={handleSubmitBulkOTClaim} disabled={submittingOTClaim} className={`flex-1 px-4 py-2 text-xs font-bold text-white transition rounded-lg shadow-lg ${submittingOTClaim ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"}`}>
//                   {submittingOTClaim ? "Submitting..." : `Claim ${selectedOTRecords.length} OT`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
    
//     </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { FiCheckCircle, FiCheckSquare, FiFileText, FiMapPin, FiCoffee } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

export default function MyAttendance() {
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
  const [employeeData, setEmployeeData] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Request States
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [selectedRequestDates, setSelectedRequestDates] = useState([]);
  const [requestComment, setRequestComment] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // ✅ Helper function to format decimal hours to HH:MM
  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // ✅ Format break minutes to readable format
  const formatBreakMinutes = (minutes) => {
    if (!minutes || minutes === 0) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // ✅ Calculate total break minutes from breaks array
  const calculateTotalBreakMinutes = (breaks) => {
    if (!breaks || breaks.length === 0) return 0;
    return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
  };

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

        const res = await fetch(`${API_BASE_URL}/attendance/myattendance/${employeeId}`);
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

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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

  // Handle Edit Request Submission
  const handleAddRequestDate = () => {
    if (!requestDate) return alert("Please select a date first");
    if (selectedRequestDates.includes(requestDate)) return alert("Date already added");
    setSelectedRequestDates([...selectedRequestDates, requestDate]);
    setRequestDate("");
  };

  const handleRemoveRequestDate = (dateToRemove) => {
    setSelectedRequestDates(selectedRequestDates.filter(d => d !== dateToRemove));
  };

  const handleSubmitEditRequest = async (e) => {
    e.preventDefault();
    if (selectedRequestDates.length === 0) return alert("Please select at least one date");
    if (!requestComment.trim()) return alert("Please enter a comment");

    try {
      setSubmittingRequest(true);
      const payload = {
        employeeId: employeeData.employeeId,
        employeeName: employeeData.name || "Employee",
        selectedDates: selectedRequestDates,
        comment: requestComment
      };

      const res = await fetch(`${API_BASE_URL}/attendance-edit-requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request");

      alert("✅ Attendance edit request submitted successfully!");
      setShowEditModal(false);
      setSelectedRequestDates([]);
      setRequestComment("");
    } catch (err) {
      console.error("Submit request error:", err);
      alert("❌ Error: " + err.message);
    } finally {
      setSubmittingRequest(false);
    }
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
      "Break Time",
      "Distance (m)",
      "Onsite",
      "Reason",
      "Status"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((rec) => {
        const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
        const formattedBreak = formatBreakMinutes(breakMinutes);
        const formattedHours = formatDecimalHours(rec.totalHours);
        return [
          `"${formatDate(rec.checkInTime || rec.createdAt)}"`,
          `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`,
          `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
          formattedHours,
          formattedBreak,
          rec.distance?.toFixed(2) || "0.00",
          rec.onsite ? "Yes" : "No",
          `"${rec.reason || "Not specified"}"`,
          rec.status
        ].join(",");
      }),
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

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "1rem" }}>
          <div className="emp-dash__card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn’t load attendance</h3>
                <p className="emp-dash__card-desc">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              My <span>Attendance</span>
            </h1>
            <p className="emp-dash__subtitle">View your attendance history, break time, and onsite status.</p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
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

        {(() => {
          const totalBreakMinutes = records.reduce(
            (sum, r) => sum + (r.totalBreakMinutes || calculateTotalBreakMinutes(r.breaks)),
            0
          );

          return (
            <div className="emp-dash__stats">
              <div className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">Total Records</span>
                  <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                    <FiFileText />
                  </div>
                </div>
                <div className="emp-dash__stat-value">{records.length}</div>
                <div className="emp-dash__stat-meta">all time</div>
              </div>

              <div className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">Onsite</span>
                  <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                    <FiMapPin />
                  </div>
                </div>
                <div className="emp-dash__stat-value">{records.filter((r) => r.onsite).length}</div>
                <div className="emp-dash__stat-meta">days</div>
              </div>

              <div className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">Checked In</span>
                  <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                    <FiCheckCircle />
                  </div>
                </div>
                <div className="emp-dash__stat-value">{records.filter((r) => r.status === "checked-in").length}</div>
                <div className="emp-dash__stat-meta">open sessions</div>
              </div>

              <div className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">Full Days</span>
                  <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                    <FiCheckSquare />
                  </div>
                </div>
                <div className="emp-dash__stat-value">{records.filter((r) => Number(r.totalHours) >= 8).length}</div>
                <div className="emp-dash__stat-meta">8h+</div>
              </div>

              <div className="emp-dash__stat">
                <div className="emp-dash__stat-top">
                  <span className="emp-dash__stat-label">Break Time</span>
                  <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                    <FiCoffee />
                  </div>
                </div>
                <div className="emp-dash__stat-value">{formatBreakMinutes(totalBreakMinutes)}</div>
                <div className="emp-dash__stat-meta">total</div>
              </div>
            </div>
          );
        })()}

        <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Filters</h3>
              {/* <p className="emp-dash__card-desc">Search and narrow down attendance records</p> */}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" className="emp-dash__card-link" onClick={downloadCSV}>
                Download CSV
              </button>
              <button type="button" className="emp-dash__card-link" onClick={() => setShowEditModal(true)}>
                Request Edit
              </button>
            </div>
          </div>

          <div className="emp-dash__card-body">
            <div className="emp-leaves__filters">
              <div className="emp-leaves__field">
                <label>Date</label>
                <input type="date" value={searchDate} onChange={handleSearchDateChange} className="emp-leaves__input" />
              </div>
              <div className="emp-leaves__field">
                <label>From</label>
                <input type="date" value={dateFrom} onChange={handleDateFromChange} className="emp-leaves__input" />
              </div>
              <div className="emp-leaves__field">
                <label>To</label>
                <input type="date" value={dateTo} onChange={handleDateToChange} className="emp-leaves__input" />
              </div>
              <div className="emp-leaves__field">
                <label>Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthChange} className="emp-leaves__input" />
              </div>
              <div className="emp-leaves__field">
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="emp-leaves__input">
                  <option value="all">All</option>
                  <option value="checked-in">Checked In</option>
                  <option value="checked-out">Checked Out</option>
                </select>
              </div>
              <div className="emp-leaves__field">
                <label>Location</label>
                <select value={onsiteFilter} onChange={(e) => setOnsiteFilter(e.target.value)} className="emp-leaves__input">
                  <option value="all">All</option>
                  <option value="yes">Onsite</option>
                  <option value="no">Remote</option>
                </select>
              </div>
            </div>

            {(searchDate || dateFrom || dateTo || selectedMonth || statusFilter !== "all" || onsiteFilter !== "all") && (
              <div style={{ marginTop: "0.75rem" }}>
                <button type="button" className="emp-leaves__btn emp-leaves__btn--ghost" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}

            <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
            </div>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Attendance Records</h3>
              <p className="emp-dash__card-desc">Your daily check-in and check-out history</p>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>
                {records.length === 0 ? "No attendance records found." : "No records match your filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Break</th>
                      <th>Distance</th>
                      <th>Onsite</th>
                      <th>Reason</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((rec, idx) => {
                      const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
                      const isCheckedIn = rec.status === "checked-in" && !rec.checkOutTime;

                      return (
                        <tr key={rec._id || idx}>
                          <td>{formatDate(rec.checkInTime || rec.createdAt)}</td>
                          <td>
                            {rec.checkInTime ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                                {isCheckedIn && (
                                  <span className="relative flex w-2 h-2">
                                    <span className="absolute inline-flex w-full h-full bg-blue-500 rounded-full opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex w-2 h-2 bg-blue-600 rounded-full"></span>
                                  </span>
                                )}
                                {formatTime(rec.checkInTime)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{rec.checkOutTime ? formatTime(rec.checkOutTime) : "—"}</td>
                          <td>{formatDecimalHours(rec.totalHours)}</td>
                          <td>
                            {breakMinutes > 0 ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#dc6803" }}>
                                <FiCoffee />
                                {formatBreakMinutes(breakMinutes)}
                                {rec.breaks && rec.breaks.length > 0 && rec.breaks[0].reason ? (
                                  <span style={{ color: "#98a2b3", fontSize: "0.6875rem" }}>({rec.breaks[0].reason})</span>
                                ) : null}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{rec.distance ? `${Number(rec.distance).toFixed(0)}m` : "—"}</td>
                          <td>{rec.onsite ? "Yes" : "No"}</td>
                          <td title={rec.reason || ""} style={{ maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {rec.reason || "—"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span
                              className={`emp-dash__table-status ${
                                rec.status === "checked-out" ? "emp-dash__table-status--present" : "emp-dash__table-status--other"
                              }`}
                            >
                              {rec.status === "checked-in" ? "Checked In" : rec.status === "checked-out" ? "Checked Out" : rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {currentRecords.map((rec, idx) => {
                  const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
                  const isCheckedOut = rec.status === "checked-out";

                  return (
                    <div key={rec._id || idx} className="emp-dash__mobile-item">
                      <div className="emp-dash__mobile-item-top">
                        <span className="emp-dash__mobile-date">{formatDate(rec.checkInTime || rec.createdAt)}</span>
                        <span className={`emp-dash__table-status ${isCheckedOut ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                          {isCheckedOut ? "Checked Out" : "Checked In"}
                        </span>
                      </div>
                      <div className="emp-dash__mobile-grid">
                        <div className="emp-dash__mobile-field">
                          <span>Check In</span>
                          <span>{formatTime(rec.checkInTime)}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Check Out</span>
                          <span>{rec.checkOutTime ? formatTime(rec.checkOutTime) : "—"}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Hours</span>
                          <span>{formatDecimalHours(rec.totalHours)}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Break</span>
                          <span>{breakMinutes > 0 ? formatBreakMinutes(breakMinutes) : "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRecords.length > 0 && (
                <div className="emp-dash__card-body" style={{ borderTop: "1px solid var(--ed-border-light)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
                      <span>Rows:</span>
                      <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="emp-leaves__input" style={{ height: "2rem", padding: "0 0.5rem" }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span>
                        Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                        <strong>{filteredRecords.length}</strong>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                      <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
                        Prev
                      </button>
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => (typeof page === "number" ? handlePageClick(page) : null)}
                          disabled={page === "..."}
                          className="emp-leaves__btn emp-leaves__btn--ghost"
                          style={{
                            height: "2rem",
                            minWidth: "2.25rem",
                            opacity: page === "..." ? 0.6 : 1,
                            borderColor: currentPage === page ? "var(--ed-primary)" : "var(--ed-border)",
                            color: currentPage === page ? "var(--ed-primary)" : "var(--ed-text-secondary)",
                            background: currentPage === page ? "var(--ed-primary-soft)" : "#fff",
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showEditModal && (
        <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: 560 }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--ed-border-light)" }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--ed-text)" }}>Request Record Edit</h3>
                <p className="text-xs" style={{ color: "var(--ed-text-secondary)" }}>
                  Raise a request to admin to edit your attendance records
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>

            <div className="emp-dash__modal-body p-4">
              <form onSubmit={handleSubmitEditRequest} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Employee ID</label>
                    <input value={employeeData?.employeeId || ""} disabled className="emp-leaves__input" />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Name</label>
                    <input value={employeeData?.name || ""} disabled className="emp-leaves__input" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Select date</label>
                  <div className="flex gap-2">
                    <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="emp-leaves__input" />
                    <button type="button" onClick={handleAddRequestDate} className="emp-leaves__btn emp-leaves__btn--primary" style={{ height: "2.5rem" }}>
                      Add
                    </button>
                  </div>

                  {selectedRequestDates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRequestDates.map((date) => (
                        <span key={date} className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-2">
                          {date}
                          <button type="button" onClick={() => handleRemoveRequestDate(date)} className="text-blue-600 hover:text-blue-800">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Comment / Reason</label>
                  <textarea
                    value={requestComment}
                    onChange={(e) => setRequestComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 text-sm bg-white border border-[#e4e7ec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(23,92,211,0.12)]"
                    placeholder="Explain why you need to edit these records..."
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="emp-leaves__btn emp-leaves__btn--ghost flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingRequest} className="emp-leaves__btn emp-leaves__btn--primary flex-1">
                    {submittingRequest ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}