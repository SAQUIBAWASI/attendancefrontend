// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaCalendarAlt, FaExchangeAlt, FaPlus, FaShieldAlt, FaEye, FaInfoCircle } from "react-icons/fa";
// import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
// import { API_BASE_URL } from "../config";
// import "./EmployeeDashboard.css";
// import "./EmployeeLeaves.css";

// const EmployeeLeaves = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [leaveBalances, setLeaveBalances] = useState(null);
//   const [publicHolidays, setPublicHolidays] = useState([]);

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Modal & Form State
//   const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
//   const [submittingLeave, setSubmittingLeave] = useState(false);
//   const [leaveFormData, setLeaveFormData] = useState({
//     employeeId: "",
//     employeeName: "",
//     leaveType: "casual",
//     startDate: "",
//     endDate: "",
//     days: 0,
//     reason: "",
//   });

//   // Permission Modal State
//   const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
//   const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
//   const [permissionLoading, setPermissionLoading] = useState(false);

//   // Comp-off Request Modal State
//   const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
//   const [submittingCompOff, setSubmittingCompOff] = useState(false);
//   const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
//   const [compOffRequestData, setCompOffRequestData] = useState({
//     workDate: "",
//     reason: ""
//   });

//   // Comp-off summary data from API
//   const [compOffSummary, setCompOffSummary] = useState({
//     totalCompOff: 0,
//     usedCompOffCount: 0,
//     remainingCompOffCount: 0,
//     records: [],
//     validityFrom: null,
//     validityTo: null,
//     isValidPeriod: false,
//     status: "inactive"
//   });
  
//   // Track which leaves already have comp-off requests
//   const [compOffRequests, setCompOffRequests] = useState([]);
  
//   // Maximum comp-off requests allowed (from API or default)
//   const [maxCompOffRequests, setMaxCompOffRequests] = useState(2);
  
//   // Comp-off Requests Modal State
//   const [isCompOffRequestsModalOpen, setIsCompOffRequestsModalOpen] = useState(false);

//   useEffect(() => {
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setError("❌ Employee data not found in localStorage.");
//       setLoading(false);
//       return;
//     }

//     let employeeId = null;
//     let employeeName = "";
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//       employeeName = employeeData.employeeName || employeeData.name;
//     } catch (err) {
//       setError("❌ Invalid employee data in localStorage.");
//       setLoading(false);
//       return;
//     }

//     if (!employeeId) {
//       setError("❌ Employee ID not found in employeeData.");
//       setLoading(false);
//       return;
//     }

//     setLeaveFormData(prev => ({
//       ...prev,
//       employeeId: employeeId,
//       employeeName: employeeName
//     }));

//     fetchLeaves(employeeId);
//     fetchLeaveBalances(employeeId);
//     fetchCompOffSummary(employeeId);
//     fetchPublicHolidays();
//   }, []);

//   // Fetch public holidays
//   const fetchPublicHolidays = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/holidays/all`);
//       setPublicHolidays(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Error fetching public holidays:", err);
//     }
//   };

//   // Fetch leave balances
//   const fetchLeaveBalances = async (employeeId) => {
//     try {
//       const resp = await axios.get(`${API_BASE_URL}/leaves/balances/${employeeId}`);
//       if (resp.data && resp.data.success) {
//         setLeaveBalances(resp.data.balances);
//       }
//     } catch (err) {
//       console.error("Error fetching leave balances:", err);
//     }
//   };

//   // Fetch leaves
//   const fetchLeaves = async (employeeId) => {
//     try {
//       const resp = await axios.get(
//         `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
//       );

//       if (resp.data && resp.data.success) {
//         const sortedLeaves = (resp.data.records || []).sort((a, b) => 
//           new Date(b.startDate) - new Date(a.startDate)
//         );
//         setLeaves(sortedLeaves);
//         setFilteredLeaves(sortedLeaves);
//       } else {
//         setError("❌ Unexpected API response.");
//       }
//     } catch (err) {
//       setError("❌ Failed to fetch leaves.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch comp-off summary from API
//   const fetchCompOffSummary = async (employeeId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/employee/${employeeId}`);
//       if (response.data && response.data.success) {
//         setCompOffSummary({
//           totalCompOff: response.data.totalCompOff || 0,
//           usedCompOffCount: response.data.usedCompOffCount || 0,
//           remainingCompOffCount: response.data.remainingCompOffCount || 0,
//           records: response.data.records || [],
//           validityFrom: response.data.validityFrom || null,
//           validityTo: response.data.validityTo || null,
//           isValidPeriod: response.data.isValidPeriod || false,
//           status: response.data.status || "inactive"
//         });
        
//         if (response.data.totalCompOff) {
//           setMaxCompOffRequests(response.data.totalCompOff);
//         }
        
//         setCompOffRequests(response.data.records || []);
//       }
//     } catch (error) {
//       console.error("Error fetching comp-off summary:", error);
//       setCompOffSummary({
//         totalCompOff: 2,
//         usedCompOffCount: 0,
//         remainingCompOffCount: 2,
//         records: [],
//         validityFrom: null,
//         validityTo: null,
//         isValidPeriod: false,
//         status: "inactive"
//       });
//       setCompOffRequests([]);
//     }
//   };

//   // Format date for display
//   const formatDateDisplay = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Check if leave already has pending comp-off request
//   const hasPendingCompOffRequest = (leaveId) => {
//     return compOffRequests.some(req => 
//       req.originalLeaveId?._id === leaveId && req.status === "pending"
//     );
//   };

//   // Check if leave already has approved comp-off
//   const hasApprovedCompOff = (leaveId) => {
//     return compOffRequests.some(req => 
//       req.originalLeaveId?._id === leaveId && req.status === "approved"
//     );
//   };
  
//   // Check if employee can request more comp-offs
//   const canRequestCompOff = (employeeId) => {
//     const pendingRequests = compOffRequests.filter(req => 
//       req.employeeId === employeeId && req.status === "pending"
//     ).length;
    
//     const approvedRequests = compOffRequests.filter(req => 
//       req.employeeId === employeeId && req.status === "approved"
//     ).length;
    
//     const totalRequests = pendingRequests + approvedRequests;
//     const remainingAllowed = compOffSummary.remainingCompOffCount;
//     const isPeriodValid = compOffSummary.isValidPeriod && compOffSummary.status === "active";
    
//     return {
//       allowed: totalRequests < maxCompOffRequests && remainingAllowed > 0 && isPeriodValid,
//       pending: pendingRequests,
//       approved: approvedRequests,
//       remaining: remainingAllowed,
//       total: totalRequests,
//       totalAllowed: maxCompOffRequests,
//       isPeriodValid: isPeriodValid
//     };
//   };

//   // Open Comp-off Request Modal
//   const openCompOffRequestModal = (leave) => {
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     let employeeId = "";
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//     } catch (err) {
//       alert("❌ Employee data error");
//       return;
//     }
    
//     const requestStatus = canRequestCompOff(employeeId);
    
//     if (!requestStatus.allowed) {
//       if (!requestStatus.isPeriodValid) {
//         alert(`❌ Comp-off request period is not active.\n\n📅 Validity Period: ${formatDateDisplay(compOffSummary.validityFrom)} to ${formatDateDisplay(compOffSummary.validityTo)}\n\nPlease contact admin for more information.`);
//       } else {
//         alert(`❌ You have reached the maximum limit of ${maxCompOffRequests} comp-off request(s).\n\n📊 Current Status:\n• Total Allowed: ${maxCompOffRequests}\n• Pending: ${requestStatus.pending}\n• Approved: ${requestStatus.approved}\n• Remaining: ${requestStatus.remaining}\n• Total Used: ${requestStatus.total}\n\nPlease wait for existing requests to be processed before submitting new ones.`);
//       }
//       return;
//     }
    
//     setSelectedLeaveForCompOff(leave);
//     setCompOffRequestData({
//       workDate: "",
//       reason: `Comp-off request for leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`
//     });
//     setIsCompOffModalOpen(true);
//   };

//   // Handle Comp-off Request Submit
//   const handleCompOffRequestSubmit = async (e) => {
//     e.preventDefault();
//     setSubmittingCompOff(true);

//     if (!compOffRequestData.workDate) {
//       alert("❌ Please select work date");
//       setSubmittingCompOff(false);
//       return;
//     }

//     const employeeDataRaw = localStorage.getItem("employeeData");
//     let employeeId = "";
//     let employeeName = "";
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//       employeeName = employeeData.employeeName || employeeData.name;
//     } catch (err) {
//       alert("❌ Employee data error");
//       setSubmittingCompOff(false);
//       return;
//     }
    
//     const requestStatus = canRequestCompOff(employeeId);
//     if (!requestStatus.allowed) {
//       alert(`❌ You have reached the maximum limit of ${maxCompOffRequests} comp-off requests.`);
//       setIsCompOffModalOpen(false);
//       setSubmittingCompOff(false);
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_BASE_URL}/leaves/comp-off-requests`, {
//         employeeId: employeeId,
//         employeeName: employeeName,
//         originalLeaveId: selectedLeaveForCompOff._id,
//         workDate: compOffRequestData.workDate,
//         reason: compOffRequestData.reason,
//         status: "pending"
//       });

//       if (response.status === 201) {
//         alert("✅ Comp-off request submitted successfully!");
//         setIsCompOffModalOpen(false);
//         setSelectedLeaveForCompOff(null);
//         fetchCompOffSummary(employeeId);
//       }
//     } catch (error) {
//       console.error("Error submitting comp-off:", error);
//       alert(error.response?.data?.error || "❌ Failed to submit comp-off request");
//     } finally {
//       setSubmittingCompOff(false);
//     }
//   };

//   // Handle Permission Submit
//   const handlePermissionSubmit = async (e) => {
//     e.preventDefault();
//     setPermissionLoading(true);

//     const rawData = localStorage.getItem("employeeData");
//     let employeeData = null;
//     try {
//       if (rawData) employeeData = JSON.parse(rawData);
//     } catch (e) { }

//     const id = employeeData?.employeeId || localStorage.getItem("employeeId");
//     const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
//     const durationNum = parseInt(permissionForm.duration);

//     if (!id) {
//       alert("❌ Employee ID not found. Please log out and log in again.");
//       setPermissionLoading(false);
//       return;
//     }
//     if (!permissionForm.reason || isNaN(durationNum)) {
//       alert("❌ Please provide a valid reason and duration.");
//       setPermissionLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.post(`${API_BASE_URL}/permissions/request`, {
//         employeeId: id,
//         employeeName: name,
//         reason: permissionForm.reason,
//         duration: durationNum,
//       });
//       if (res.status === 201) {
//         alert("✅ Permission Requested Successfully!");
//         setIsPermissionModalOpen(false);
//         setPermissionForm({ reason: "", duration: "" });
//       }
//     } catch (err) {
//       alert("❌ " + (err.response?.data?.message || err.message));
//     } finally {
//       setPermissionLoading(false);
//     }
//   };

//   // Apply filters and search
//   useEffect(() => {
//     let filtered = leaves;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(leave => 
//         leave.leaveType?.toLowerCase().includes(term) ||
//         leave.reason?.toLowerCase().includes(term) ||
//         leave.status?.toLowerCase().includes(term)
//       );
//     }

//     if (selectedDate) {
//       filtered = filtered.filter(leave => {
//         const leaveDate = new Date(leave.startDate).toISOString().split("T")[0];
//         return leaveDate === selectedDate;
//       });
//     }

//     if (selectedMonth) {
//       const [year, monthNum] = selectedMonth.split("-").map(Number);
//       filtered = filtered.filter(leave => {
//         const d = new Date(leave.startDate);
//         return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
//       });
//     }

//     setFilteredLeaves(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, selectedDate, selectedMonth, leaves]);

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     setSelectedMonth("");
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setSelectedDate("");
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setSelectedDate("");
//     setSelectedMonth("");
//   };

//   const handleLeaveChange = (e) => {
//     const { name, value } = e.target;
//     setLeaveFormData((prev) => {
//       const updated = { ...prev, [name]: value };
//       if (name === "startDate" || name === "endDate") {
//         if (updated.startDate && updated.endDate) {
//           const start = new Date(updated.startDate);
//           const end = new Date(updated.endDate);
//           const diffTime = end - start;
//           const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
//           updated.days = diffDays;
//         }
//       }
//       return updated;
//     });
//   };

//   const handleLeaveSubmit = async (e) => {
//     e.preventDefault();
//     setSubmittingLeave(true);

//     const rawData = localStorage.getItem("employeeData");
//     let employeeData = null;
//     try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

//     const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
//     const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

//     if (!id) {
//       alert("❌ Employee details missing. Please re-login.");
//       setSubmittingLeave(false);
//       return;
//     }

//     const payload = {
//       ...leaveFormData,
//       employeeId: id,
//       employeeName: name
//     };

//     try {
//       const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
//       if (response.status === 201) {
//         alert("✅ Leave application submitted successfully!");
//         setLeaveFormData({
//           employeeId: id,
//           employeeName: name,
//           leaveType: "casual",
//           startDate: "",
//           endDate: "",
//           days: 0,
//           reason: "",
//         });
//         setIsLeaveModalOpen(false);
//         fetchLeaves(id);
//       }
//     } catch (error) {
//       alert(error.response?.data?.message || "❌ Failed to submit leave application.");
//     } finally {
//       setSubmittingLeave(false);
//     }
//   };

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentRecords = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePageClick = (page) => {
//     setCurrentPage(page);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
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

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };
  
//   const getCurrentEmployeeId = () => {
//     try {
//       const employeeDataRaw = localStorage.getItem("employeeData");
//       if (employeeDataRaw) {
//         const employeeData = JSON.parse(employeeDataRaw);
//         return employeeData.employeeId;
//       }
//     } catch(e) {}
//     return null;
//   };
  
//   const employeeId = getCurrentEmployeeId();
//   const requestStatus = employeeId ? canRequestCompOff(employeeId) : { remaining: maxCompOffRequests, pending: 0, approved: 0, totalAllowed: maxCompOffRequests, isPeriodValid: false };

//   const LeavesStat = ({ label, value, icon: Icon, variant = "rate" }) => {
//     const variantClass = {
//       total: "emp-dash__stat-icon--rate",
//       approved: "emp-dash__stat-icon--present",
//       pending: "emp-dash__stat-icon--late",
//       rejected: "emp-dash__stat-icon--absent",
//       comp: "emp-leaves__stat-icon--comp",
//     }[variant] || "emp-dash__stat-icon--rate";

//     return (
//       <div className="emp-dash__stat">
//         <div className="emp-dash__stat-top">
//           <span className="emp-dash__stat-label">{label}</span>
//           <div className={`emp-dash__stat-icon ${variantClass}`}>
//             <Icon />
//           </div>
//         </div>
//         <div className="emp-dash__stat-value">{value}</div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div className="emp-dash__spinner" />
//           <p className="emp-dash__loading-text">Loading your leave records...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div style={{ fontSize: "1.75rem", color: "var(--ed-danger)" }}>✕</div>
//           <p className="emp-dash__loading-text" style={{ color: "var(--ed-danger)" }}>
//             {error}
//           </p>
//           <button type="button" className="emp-dash__today-btn" onClick={() => window.location.reload()}>
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="emp-dash emp-leaves">
//       <main>
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">
//               My <span>Leaves</span>
//             </h1>
//             <p className="emp-dash__subtitle">Apply, track approvals, and manage comp-offs from one place.</p>
//           </div>
//           <div className="emp-dash__date-pill">
//             <FaCalendarAlt />
//             <span>
//               {new Date().toLocaleDateString("en-US", {
//                 weekday: "short",
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//               })}
//             </span>
//           </div>
//         </div>

//         <div className="emp-dash__stats emp-leaves__stats">
//           <LeavesStat label="Total Leaves" value={leaves.length} icon={FiFileText} variant="total" />
//           <LeavesStat label="Approved" value={leaves.filter((l) => l.status === "approved").length} icon={FiCheckCircle} variant="approved" />
//           <LeavesStat label="Pending" value={leaves.filter((l) => l.status === "pending").length} icon={FiClock} variant="pending" />
//           <LeavesStat label="Rejected" value={leaves.filter((l) => l.status === "rejected").length} icon={FiXCircle} variant="rejected" />
//           <LeavesStat label="Comp-off" value={`${requestStatus.pending + requestStatus.approved}/${maxCompOffRequests}`} icon={FaExchangeAlt} variant="comp" />
//         </div>

//         {leaveBalances && (
//           <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
//             <div className="emp-dash__card-header">
//               <div>
//                 <h3 className="emp-dash__card-title">Leave Balances</h3>
//                 {/* <p className="emp-dash__card-desc">Available vs total leaves for the year</p> */}
//               </div>
//             </div>
//             <div className="emp-dash__card-body">
//               <div className="emp-leaves__balances-grid">
//                 <div className="emp-leaves__tile">
//                   <div className="emp-leaves__tile-label">Casual Leave</div>
//                   <div className="emp-leaves__tile-value">
//                     {leaveBalances?.CL?.available || 0} / {leaveBalances?.CL?.total || 0}
//                   </div>
//                   <div className="emp-leaves__progress">
//                     <span
//                       style={{
//                         width: `${((leaveBalances?.CL?.used || 0) / (leaveBalances?.CL?.total || 1)) * 100}%`,
//                         background: "var(--ed-primary)",
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="emp-leaves__tile">
//                   <div className="emp-leaves__tile-label">Sick Leave</div>
//                   <div className="emp-leaves__tile-value">
//                     {leaveBalances?.SL?.available || 0} / {leaveBalances?.SL?.total || 0}
//                   </div>
//                   <div className="emp-leaves__progress">
//                     <span
//                       style={{
//                         width: `${((leaveBalances?.SL?.used || 0) / (leaveBalances?.SL?.total || 1)) * 100}%`,
//                         background: "var(--ed-danger)",
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="emp-leaves__tile">
//                   <div className="emp-leaves__tile-label">Earned Leave</div>
//                   <div className="emp-leaves__tile-value">
//                     {leaveBalances?.EL?.available || 0} / {leaveBalances?.EL?.total || 0}
//                   </div>
//                   <div className="emp-leaves__progress">
//                     <span
//                       style={{
//                         width: `${((leaveBalances?.EL?.used || 0) / (leaveBalances?.EL?.total || 1)) * 100}%`,
//                         background: "var(--ed-success)",
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="emp-leaves__tile">
//                   <div className="emp-leaves__tile-label">Public Holidays</div>
//                   <div className="emp-leaves__tile-value">{publicHolidays.length}</div>
//                   <div className="emp-leaves__tile-sub">
//                     {publicHolidays.filter((h) => h.type === "National Holiday").length} National holidays
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Comp-off Summary</h3>
//               {/* <p className="emp-dash__card-desc">Track your comp-off entitlement and requests</p> */}
//             </div>
//             <button type="button" className="emp-dash__card-link" onClick={() => setIsCompOffRequestsModalOpen(true)}>
//               View requests <FaEye />
//             </button>
//           </div>
//           <div className="emp-dash__card-body">
//             {compOffSummary.validityFrom && compOffSummary.validityTo && (
//               <div
//                 className={`emp-leaves__notice ${
//                   compOffSummary.isValidPeriod && compOffSummary.status === "active"
//                     ? "emp-leaves__notice--active"
//                     : "emp-leaves__notice--inactive"
//                 }`}
//                 style={{ marginBottom: "1rem" }}
//               >
//                 <FaInfoCircle
//                   style={{
//                     marginTop: "0.1rem",
//                     color:
//                       compOffSummary.isValidPeriod && compOffSummary.status === "active"
//                         ? "var(--ed-success)"
//                         : "var(--ed-danger)",
//                   }}
//                 />
//                 <div className="min-w-0">
//                   <div className="emp-leaves__notice-title">Validity period</div>
//                   <div className="emp-leaves__notice-text">
//                     {formatDateDisplay(compOffSummary.validityFrom)} to {formatDateDisplay(compOffSummary.validityTo)}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="emp-leaves__summary-grid">
//               <div className="emp-leaves__tile">
//                 <div className="emp-leaves__tile-label">Total Allowed</div>
//                 <div className="emp-leaves__tile-value">{compOffSummary.totalCompOff || 0}</div>
//               </div>
//               <div className="emp-leaves__tile">
//                 <div className="emp-leaves__tile-label">Used / Pending</div>
//                 <div className="emp-leaves__tile-value">{compOffSummary.usedCompOffCount || 0}</div>
//               </div>
//               <div className="emp-leaves__tile">
//                 <div className="emp-leaves__tile-label">Remaining</div>
//                 <div className="emp-leaves__tile-value">{compOffSummary.remainingCompOffCount || 0}</div>
//               </div>
//               <div className="emp-leaves__tile">
//                 <div className="emp-leaves__tile-label">Status</div>
//                 <div className="emp-leaves__tile-value" style={{ textTransform: "uppercase" }}>
//                   {compOffSummary.isValidPeriod && compOffSummary.status === "active" ? "Active" : "Inactive"}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Filters</h3>
//               {/* <p className="emp-dash__card-desc">Search and narrow down leave records</p> */}
//             </div>
//           </div>
//           <div className="emp-dash__card-body">
//             <div className="emp-leaves__filters">
//               <div className="emp-leaves__field">
//                 <label>Search</label>
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Type, reason, status..."
//                   className="emp-leaves__input"
//                 />
//               </div>
//               <div className="emp-leaves__field">
//                 <label>Date</label>
//                 <input type="date" value={selectedDate} onChange={handleDateChange} className="emp-leaves__input" />
//               </div>
//               <div className="emp-leaves__field">
//                 <label>Month</label>
//                 <input type="month" value={selectedMonth} onChange={handleMonthChange} className="emp-leaves__input" />
//               </div>
//               <button type="button" className="emp-leaves__btn emp-leaves__btn--primary" onClick={() => setIsLeaveModalOpen(true)}>
//                 <FaPlus /> Apply Leave
//               </button>
//               <button type="button" className="emp-leaves__btn emp-leaves__btn--success" onClick={() => setIsPermissionModalOpen(true)}>
//                 <FaShieldAlt /> Permission
//               </button>
//             </div>

//             {(searchTerm || selectedDate || selectedMonth) && (
//               <div style={{ marginTop: "0.75rem" }}>
//                 <button type="button" className="emp-leaves__btn emp-leaves__btn--ghost" onClick={clearFilters}>
//                   Clear filters
//                 </button>
//               </div>
//             )}

//             <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
//               Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
//             </div>
//           </div>
//         </div>

//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Leave Records</h3>
//               <p className="emp-dash__card-desc">Your applications and approvals</p>
//             </div>
//           </div>

//           {filteredLeaves.length === 0 ? (
//             <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
//               <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>
//                 {leaves.length === 0 ? "No leave records found." : "No records match your filters."}
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="emp-dash__table-wrap emp-leaves__table-wrap">
//                 <table className="emp-dash__table">
//                   <thead>
//                     <tr>
//                       <th>Leave Type</th>
//                       <th>Start Date</th>
//                       <th>End Date</th>
//                       <th>Days</th>
//                       <th>Reason</th>
//                       <th>Status</th>
//                       <th>Approved By</th>
//                       <th style={{ textAlign: "right" }}>Comp-off</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentRecords.map((leave, index) => {
//                       const hasPending = hasPendingCompOffRequest(leave._id);
//                       const hasApproved = hasApprovedCompOff(leave._id);
//                       const status = (leave.status || "").toLowerCase();
//                       const statusClass =
//                         status === "approved"
//                           ? "emp-leaves__status--approved"
//                           : status === "rejected"
//                           ? "emp-leaves__status--rejected"
//                           : "emp-leaves__status--pending";

//                       return (
//                         <tr key={leave._id || index}>
//                           <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{leave.leaveType}</td>
//                           <td>{formatDate(leave.startDate)}</td>
//                           <td>{formatDate(leave.endDate)}</td>
//                           <td>{leave.days}</td>
//                           <td title={leave.reason} style={{ maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                             {leave.reason || "-"}
//                           </td>
//                           <td>
//                             <span className={`emp-leaves__status ${statusClass}`}>{leave.status}</span>
//                           </td>
//                           <td>
//                             {leave.approvedBy ? (
//                               <span>
//                                 <strong>{leave.approvedBy}</strong>
//                                 <span style={{ display: "block", fontSize: "0.75rem", color: "var(--ed-text-muted)" }}>
//                                   {leave.approvedByRole || "Admin"}
//                                 </span>
//                               </span>
//                             ) : (
//                               "—"
//                             )}
//                           </td>
//                           <td style={{ textAlign: "right" }}>
//                             {(leave.status === "approved" || leave.status === "manager_approved") ? (
//                               hasApproved ? (
//                                 <span className="emp-leaves__status emp-leaves__status--approved">Converted</span>
//                               ) : hasPending ? (
//                                 <span className="emp-leaves__status emp-leaves__status--pending">Requested</span>
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={() => openCompOffRequestModal(leave)}
//                                   disabled={!requestStatus.allowed}
//                                   className="emp-leaves__btn emp-leaves__btn--ghost"
//                                   style={{ height: "2rem", padding: "0 0.75rem" }}
//                                 >
//                                   <FaExchangeAlt /> Request
//                                 </button>
//                               )
//                             ) : (
//                               "—"
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="emp-dash__mobile-list">
//                 {currentRecords.map((leave, idx) => {
//                   const status = (leave.status || "").toLowerCase();
//                   const statusClass =
//                     status === "approved"
//                       ? "emp-leaves__status--approved"
//                       : status === "rejected"
//                       ? "emp-leaves__status--rejected"
//                       : "emp-leaves__status--pending";
//                   return (
//                     <div key={leave._id || idx} className="emp-leaves__mobile-card">
//                       <div className="emp-leaves__mobile-top">
//                         <div className="emp-leaves__mobile-type">{leave.leaveType}</div>
//                         <span className={`emp-leaves__status ${statusClass}`}>{leave.status}</span>
//                       </div>
//                       <div className="emp-leaves__mobile-grid">
//                         <div className="emp-leaves__mobile-field">
//                           <span>Start</span>
//                           <span>{formatDate(leave.startDate)}</span>
//                         </div>
//                         <div className="emp-leaves__mobile-field">
//                           <span>End</span>
//                           <span>{formatDate(leave.endDate)}</span>
//                         </div>
//                         <div className="emp-leaves__mobile-field">
//                           <span>Days</span>
//                           <span>{leave.days}</span>
//                         </div>
//                         <div className="emp-leaves__mobile-field">
//                           <span>Approved by</span>
//                           <span>{leave.approvedBy || "—"}</span>
//                         </div>
//                       </div>
//                       {leave.reason && (
//                         <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--ed-text-secondary)" }}>
//                           <strong style={{ color: "var(--ed-text)" }}>Reason:</strong> {leave.reason}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {filteredLeaves.length > 0 && (
//                 <div className="emp-dash__card-body" style={{ borderTop: "1px solid var(--ed-border-light)" }}>
//                   <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
//                       <span>Rows:</span>
//                       <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="emp-leaves__input" style={{ height: "2rem", padding: "0 0.5rem" }}>
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={20}>20</option>
//                         <option value={50}>50</option>
//                       </select>
//                       <span>
//                         Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of{" "}
//                         <strong>{filteredLeaves.length}</strong>
//                       </span>
//                     </div>

//                     <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
//                       <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
//                         Prev
//                       </button>
//                       {getPageNumbers().map((page, index) => (
//                         <button
//                           key={index}
//                           type="button"
//                           onClick={() => (typeof page === "number" ? handlePageClick(page) : null)}
//                           disabled={page === "..."}
//                           className="emp-leaves__btn emp-leaves__btn--ghost"
//                           style={{
//                             height: "2rem",
//                             minWidth: "2.25rem",
//                             opacity: page === "..." ? 0.6 : 1,
//                             borderColor: currentPage === page ? "var(--ed-primary)" : "var(--ed-border)",
//                             color: currentPage === page ? "var(--ed-primary)" : "var(--ed-text-secondary)",
//                             background: currentPage === page ? "var(--ed-primary-soft)" : "#fff",
//                           }}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                       <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       {/* Glassmorphism Modals */}
//       {isLeaveModalOpen && (
//         <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-bold text-gray-800">Apply for Leave</h3>
//               <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>
//             <div className="emp-dash__modal-body p-6">
//               <form onSubmit={handleLeaveSubmit} className="space-y-3">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Leave Type</label>
//                 <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required>
//                   <option value="casual">Casual Leave</option>
//                   <option value="sick">Sick Leave</option>
//                   <option value="earned">Earned Leave</option>
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
//                   <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
//                   <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" required />
//                 </div>
//               </div>
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
//                 <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 text-sm bg-gray-100 border border-gray-200 rounded-xl" />
//               </div>
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                 <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400" rows="3" required></textarea>
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300">Cancel</button>
//                 <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
//               </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Apply Permission Modal */}
//       {isPermissionModalOpen && (
//         <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-bold text-gray-800">Request Permission</h3>
//               <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>
//             <div className="emp-dash__modal-body p-6">
//               <form onSubmit={handlePermissionSubmit} className="space-y-3">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                 <textarea required className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-400" rows="3" value={permissionForm.reason} onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })} placeholder="Why do you need permission?"></textarea>
//               </div>
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Duration (minutes)</label>
//                 <input type="number" required min="1" className="w-full p-2 text-sm bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-400" value={permissionForm.duration} onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })} placeholder="e.g. 30" />
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300">Cancel</button>
//                 <button type="submit" disabled={permissionLoading} className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700">{permissionLoading ? "Submitting..." : "Request Permission"}</button>
//               </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Comp-off Request Modal */}
//       {isCompOffModalOpen && selectedLeaveForCompOff && (
//         <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-purple-700">Request Comp-off</h3>
//               <button onClick={() => setIsCompOffModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>
//             <div className="emp-dash__modal-body p-5">
//               <div className="emp-leaves__notice" style={{ marginBottom: "0.75rem" }}>
//                 <div className="min-w-0">
//                   <div className="emp-leaves__notice-title">Leave details</div>
//                   <div className="emp-leaves__notice-text">
//                     <strong style={{ color: "var(--ed-text)" }}>{selectedLeaveForCompOff.leaveType}</strong>{" "}
//                     ({formatDate(selectedLeaveForCompOff.startDate)} to {formatDate(selectedLeaveForCompOff.endDate)})
//                   </div>
//                 </div>
//               </div>

//               <div className="emp-leaves__notice" style={{ marginBottom: "0.75rem" }}>
//                 <div className="min-w-0">
//                   <div className="emp-leaves__notice-title">Limit</div>
//                   <div className="emp-leaves__notice-text">
//                     Max {maxCompOffRequests} • Used {requestStatus.total} • Remaining {requestStatus.remaining}
//                   </div>
//                 </div>
//               </div>

//               <form onSubmit={handleCompOffRequestSubmit} className="space-y-2">
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Work Date *</label>
//                   <input
//                     name="workDate"
//                     type="date"
//                     value={compOffRequestData.workDate}
//                     onChange={(e) => setCompOffRequestData({ ...compOffRequestData, workDate: e.target.value })}
//                     className="emp-leaves__input"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                   <textarea
//                     name="reason"
//                     value={compOffRequestData.reason}
//                     onChange={(e) => setCompOffRequestData({ ...compOffRequestData, reason: e.target.value })}
//                     rows="3"
//                     className="w-full p-3 text-sm bg-white border border-[#e4e7ec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(23,92,211,0.12)]"
//                     placeholder="Optional..."
//                   />
//                 </div>
//                 <div className="flex gap-2 pt-2">
//                   <button type="button" onClick={() => setIsCompOffModalOpen(false)} className="emp-leaves__btn emp-leaves__btn--ghost flex-1">
//                     Cancel
//                   </button>
//                   <button type="submit" disabled={submittingCompOff} className="emp-leaves__btn emp-leaves__btn--primary flex-1">
//                     {submittingCompOff ? "Submitting..." : "Submit"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Comp-off Requests List Modal */}
//       {isCompOffRequestsModalOpen && (
//         <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: "720px" }}>
//             <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--ed-border-light)" }}>
//               <div>
//                 <h3 className="text-lg font-bold" style={{ color: "var(--ed-text)" }}>Comp-off Requests</h3>
//                 <p className="text-xs" style={{ color: "var(--ed-text-secondary)" }}>
//                   Total: {compOffRequests.length} • Pending: {requestStatus.pending} • Approved: {requestStatus.approved}
//                 </p>
//               </div>
//               <button onClick={() => setIsCompOffRequestsModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
//             </div>
//             <div className="emp-dash__modal-body p-4">
//               {compOffRequests.length === 0 ? (
//                 <div className="py-8 text-center text-gray-500">No comp-off requests found.</div>
//               ) : (
//                 <div className="space-y-3">
//                   {compOffRequests.map((request, idx) => (
//                     <div key={request._id} className="p-3 bg-white rounded-xl border" style={{ borderColor: "var(--ed-border)" }}>
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
//                             request.status === "pending" ? "bg-yellow-200 text-yellow-700" : request.status === "approved" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
//                           }`}>{request.status}</span>
//                           <span className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</span>
//                         </div>
//                         {request.count && <span className="text-xs font-medium text-purple-600">{request.count} day(s)</span>}
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-xs">
//                         <div><span className="text-gray-500">Leave Type:</span> <span className="ml-1 font-medium capitalize">{request.originalLeaveId?.leaveType || '-'}</span></div>
//                         <div><span className="text-gray-500">Work Date:</span> <span className="ml-1 font-medium">{request.workDate ? formatDate(request.workDate) : '-'}</span></div>
//                         <div><span className="text-gray-500">Leave Period:</span> <span className="ml-1 font-medium">{request.originalLeaveId?.startDate ? formatDate(request.originalLeaveId.startDate) : '-'}{request.originalLeaveId?.endDate ? ` - ${formatDate(request.originalLeaveId.endDate)}` : ''}</span></div>
//                         <div><span className="text-gray-500">Converted:</span> <span className={`ml-1 font-medium ${request.convertedToCompOff ? 'text-green-600' : 'text-gray-500'}`}>{request.convertedToCompOff ? 'Yes' : 'No'}</span></div>
//                       </div>
//                       {request.reason && <div className="mt-2 text-xs"><span className="text-gray-500">Reason:</span><p className="mt-0.5 text-gray-700">{request.reason}</p></div>}
//                       {request.approvedBy && <div className="mt-2 text-xs text-gray-500">Approved by: {request.approvedBy}</div>}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <div className="p-4 border-t" style={{ borderColor: "var(--ed-border-light)" }}>
//               <button type="button" onClick={() => setIsCompOffRequestsModalOpen(false)} className="emp-leaves__btn emp-leaves__btn--primary" style={{ width: "100%" }}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeLeaves;




import axios from "axios";
import { useEffect, useState } from "react";
import { FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt, FaEye, FaInfoCircle } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: "",
    employeeName: "",
    leaveType: "casual",
    startDate: "",
    endDate: "",
    days: 0,
    reason: "",
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);

  // Comp-off for Extra Days
  const [isExtraDayCompOffModalOpen, setIsExtraDayCompOffModalOpen] = useState(false);
  const [submittingExtraDayCompOff, setSubmittingExtraDayCompOff] = useState(false);
  const [selectedExtraDay, setSelectedExtraDay] = useState(null);
  const [extraDayCompOffData, setExtraDayCompOffData] = useState({
    reason: ""
  });

  // View Comp-off Request Modal
  const [isViewCompOffModalOpen, setIsViewCompOffModalOpen] = useState(false);
  const [viewCompOffData, setViewCompOffData] = useState(null);

  // Real data states
  const [extraDaysData, setExtraDaysData] = useState({
    employeeId: "",
    employeeName: "",
    month: "",
    assignedWorkingDays: 0,
    presentDays: 0,
    extraDays: {
      count: 0,
      list: []
    }
  });
  
  const [isCompOffRequestsModalOpen, setIsCompOffRequestsModalOpen] = useState(false);
  const [extraDayCompOffRequests, setExtraDayCompOffRequests] = useState([]);
  
  // For dropdown in leaves table
  const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
  const [selectedExtraDayForCompOff, setSelectedExtraDayForCompOff] = useState("");

  // Comp-off requests from API
  const [compOffRequestsFromAPI, setCompOffRequestsFromAPI] = useState([]);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    let employeeId = null;
    let employeeName = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.employeeName || employeeData.name;
    } catch (err) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    setLeaveFormData(prev => ({
      ...prev,
      employeeId: employeeId,
      employeeName: employeeName
    }));

    fetchLeaves(employeeId);
    fetchLeaveBalances(employeeId);
    fetchExtraDaysData(employeeId, getCurrentMonth());
    fetchPublicHolidays();
    fetchCompOffRequests(employeeId);
  }, []);

  const fetchPublicHolidays = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/holidays/all`);
      setPublicHolidays(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching public holidays:", err);
    }
  };

  const fetchLeaveBalances = async (employeeId) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/leaves/balances/${employeeId}`);
      if (resp.data && resp.data.success) {
        setLeaveBalances(resp.data.balances);
      }
    } catch (err) {
      console.error("Error fetching leave balances:", err);
    }
  };

  const fetchLeaves = async (employeeId) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/leaves/employeeleaves/${employeeId}`);
      if (resp.data && resp.data.success) {
        const sortedLeaves = (resp.data.records || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setLeaves(sortedLeaves);
        setFilteredLeaves(sortedLeaves);
      } else {
        setError("Unexpected API response.");
      }
    } catch (err) {
      setError("Failed to fetch leaves.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraDaysData = async (employeeId, month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/extra-days/${employeeId}?month=${month}`);
      console.log("Extra Days API Response:", response.data);
      
      if (response.data && response.data.success) {
        setExtraDaysData(response.data);
        if (response.data.extraDays && response.data.extraDays.count > 0) {
          // Fetch comp-off requests for these extra days
          fetchExtraDayCompOffRequests(employeeId, month);
        }
      } else {
        setExtraDaysData({
          employeeId: employeeId,
          employeeName: "",
          month: month,
          assignedWorkingDays: 0,
          presentDays: 0,
          extraDays: {
            count: 0,
            list: []
          }
        });
      }
    } catch (error) {
      console.error("Error fetching extra days data:", error);
      setExtraDaysData({
        employeeId: employeeId,
        employeeName: "",
        month: month,
        assignedWorkingDays: 0,
        presentDays: 0,
        extraDays: {
          count: 0,
          list: []
        }
      });
    }
  };

  const fetchExtraDayCompOffRequests = async (employeeId, month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/extra-days-compoff/${employeeId}?month=${month}`);
      if (response.data && response.data.requests) {
        setExtraDayCompOffRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching comp-off requests:", error);
    }
  };

  const fetchCompOffRequests = async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/getcompoffrequestforuser/${employeeId}`);
      if (response.data && response.data.success) {
        setCompOffRequestsFromAPI(response.data.requests || []);
        console.log("Comp-off requests from API:", response.data);
      }
    } catch (error) {
      console.error("Error fetching comp-off requests:", error);
    }
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (employeeDataRaw) {
      try {
        const employeeData = JSON.parse(employeeDataRaw);
        const employeeId = employeeData.employeeId;
        if (employeeId) {
          fetchExtraDaysData(employeeId, month);
        }
      } catch (err) {
        console.error("Error parsing employee data:", err);
      }
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getApplyBeforeDate = (extraDayDate, daysBefore = 15) => {
    const date = new Date(extraDayDate);
    date.setDate(date.getDate() - daysBefore);
    return formatDateDisplay(date.toISOString());
  };

  const isApplyWindowOpen = (extraDayDate, daysBefore = 15) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const applyDeadline = new Date(extraDayDate);
    applyDeadline.setDate(applyDeadline.getDate() - daysBefore);
    applyDeadline.setHours(0, 0, 0, 0);
    return today <= applyDeadline;
  };

  const getCompOffStatusForLeave = (leaveId) => {
    const request = compOffRequestsFromAPI.find(req => req.leaveId === leaveId);
    if (request) {
      return {
        exists: true,
        status: request.status,
        data: request
      };
    }
    return { exists: false, status: null, data: null };
  };

  const openLeaveCompOffModal = (leave, extraDayDate) => {
    const existingCompOff = getCompOffStatusForLeave(leave._id);
    if (existingCompOff.exists) {
      if (existingCompOff.status === 'pending') {
        alert('Comp-off request is already pending for this leave!');
        return;
      } else if (existingCompOff.status === 'approved') {
        alert('Comp-off has already been approved for this leave!');
        return;
      }
    }

    const extraDay = extraDaysData.extraDays.list.find(d => d.date === extraDayDate);
    if (!extraDay) {
      alert("Selected extra day not found!");
      return;
    }
    
    if (!isApplyWindowOpen(extraDay.date, 15)) {
      alert(`You can only apply for comp-off at least 15 days before the extra day (${formatDateDisplay(extraDay.date)}). The deadline was ${getApplyBeforeDate(extraDay.date, 15)}.`);
      return;
    }
    
    setSelectedExtraDay({
      ...extraDay,
      leave: leave,
      leaveId: leave._id,
      leaveType: leave.leaveType,
      leaveStartDate: leave.startDate,
      leaveEndDate: leave.endDate,
      leaveDays: leave.days,
      leaveReason: leave.reason,
      leaveStatus: leave.status,
      source: 'leavesTable'
    });
    
    setExtraDayCompOffData({
      reason: `Requesting comp-off for extra day on ${extraDay.day || formatDateDisplay(extraDay.date)} (${extraDay.totalHours} hours) against ${leave.leaveType} leave (${formatDate(leave.startDate)} - ${formatDate(leave.endDate)})`
    });
    setIsExtraDayCompOffModalOpen(true);
    setSelectedLeaveForCompOff(null);
    setSelectedExtraDayForCompOff("");
  };

  const openViewCompOffModal = (compOffData) => {
    setViewCompOffData(compOffData);
    setIsViewCompOffModalOpen(true);
  };

  const handleExtraDayCompOffSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExtraDayCompOff(true);

    if (!extraDayCompOffData.reason) {
      alert("Please provide a reason for comp-off request");
      setSubmittingExtraDayCompOff(false);
      return;
    }

    if (isDemoMode) {
      alert("Demo Mode: Comp-off request submitted successfully!");
      setIsExtraDayCompOffModalOpen(false);
      setSubmittingExtraDayCompOff(false);
      return;
    }

    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeId = "";
    let employeeName = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.employeeName || employeeData.name;
    } catch (err) {
      alert("Employee data error");
      setSubmittingExtraDayCompOff(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/requestforcompoffs`, {
        employeeId: employeeId,
        employeeName: employeeName,
        extraDayDate: selectedExtraDay.date,
        extraDayDetails: selectedExtraDay,
        reason: extraDayCompOffData.reason,
        leaveId: selectedExtraDay.leaveId,
        leaveDetails: {
          leaveType: selectedExtraDay.leaveType,
          startDate: selectedExtraDay.leaveStartDate,
          endDate: selectedExtraDay.leaveEndDate,
          days: selectedExtraDay.leaveDays,
          reason: selectedExtraDay.leaveReason,
          status: selectedExtraDay.leaveStatus
        }
      });

      if (response.status === 201) {
        alert("Comp-off request submitted successfully!");
        setIsExtraDayCompOffModalOpen(false);
        setSelectedExtraDay(null);
        const employeeData = JSON.parse(employeeDataRaw);
        fetchExtraDaysData(employeeId, getCurrentMonth());
        fetchCompOffRequests(employeeId);
      }
    } catch (error) {
      console.error("Error submitting comp-off:", error);
      alert(error.response?.data?.error || "Failed to submit comp-off request");
    } finally {
      setSubmittingExtraDayCompOff(false);
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    if (isDemoMode) {
      alert("Demo Mode: Permission Requested Successfully!");
      setIsPermissionModalOpen(false);
      setPermissionLoading(false);
      return;
    }

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try {
      if (rawData) employeeData = JSON.parse(rawData);
    } catch (e) { }

    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
    const durationNum = parseInt(permissionForm.duration);

    if (!id) {
      alert("Employee ID not found.");
      setPermissionLoading(false);
      return;
    }
    if (!permissionForm.reason || isNaN(durationNum)) {
      alert("Please provide a valid reason and duration.");
      setPermissionLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/permissions/request`, {
        employeeId: id,
        employeeName: name,
        reason: permissionForm.reason,
        duration: durationNum,
      });
      if (res.status === 201) {
        alert("Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);

    if (isDemoMode) {
      alert("Demo Mode: Leave application submitted successfully!");
      setIsLeaveModalOpen(false);
      setSubmittingLeave(false);
      return;
    }

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

    if (!id) {
      alert("Employee details missing.");
      setSubmittingLeave(false);
      return;
    }

    const payload = { ...leaveFormData, employeeId: id, employeeName: name };

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
      if (response.status === 201) {
        alert("Leave application submitted successfully!");
        setLeaveFormData({
          employeeId: id,
          employeeName: name,
          leaveType: "casual",
          startDate: "",
          endDate: "",
          days: 0,
          reason: "",
        });
        setIsLeaveModalOpen(false);
        fetchLeaves(id);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit leave application.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  useEffect(() => {
    let filtered = leaves;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leaveType?.toLowerCase().includes(term) ||
        leave.reason?.toLowerCase().includes(term) ||
        leave.status?.toLowerCase().includes(term)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(leave => {
        const leaveDate = new Date(leave.startDate).toISOString().split("T")[0];
        return leaveDate === selectedDate;
      });
    }

    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(leave => {
        const d = new Date(leave.startDate);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedMonth, leaves]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedMonth("");
  };

  const handleMonthFilterChange = (e) => {
    setSelectedMonth(e.target.value);
    setSelectedDate("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedMonth("");
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        if (updated.startDate && updated.endDate) {
          const start = new Date(updated.startDate);
          const end = new Date(updated.endDate);
          const diffTime = end - start;
          const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
          updated.days = diffDays;
        }
      }
      return updated;
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCompOffRequestForExtraDay = (extraDayDate) => {
    return extraDayCompOffRequests.find(req => req.extraDayDate === extraDayDate);
  };

  const isCompOffExpired = (workDate) => {
    if (!workDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workDateObj = new Date(workDate);
    workDateObj.setHours(0, 0, 0, 0);
    return workDateObj < today;
  };

  const getRequestStatusDisplay = (request) => {
    if (!request) return null;
    if (request.status === "approved") {
      if (isCompOffExpired(request.workDate)) {
        return { text: "Expired", className: "bg-gray-400 text-white" };
      }
      return { text: "Active", className: "bg-green-500 text-white" };
    }
    if (request.status === "pending") {
      return { text: "Pending", className: "bg-yellow-500 text-white" };
    }
    if (request.status === "rejected") {
      return { text: "Rejected", className: "bg-red-500 text-white" };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
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

  const hasExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.count > 0 && extraDaysData.extraDays.list.length > 0;

  // Calculate leave stats from real data
  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter(l => l.status === "approved").length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  const rejectedLeaves = leaves.filter(l => l.status === "rejected").length;

  return (
    <div className="min-h-screen px-3 py-6 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            📋 My Leaves
          </h1>
          <p className="text-sm text-gray-500">Apply, track approvals, and manage comp-offs from one place</p>
        </div>

        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
            <p className="text-sm font-semibold text-yellow-800">Demo Mode - Showing Sample Data</p>
            <p className="text-xs text-yellow-600">Login to see your actual data</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="p-6 text-center bg-white border border-purple-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-purple-600">{totalLeaves}</div>
            <div className="font-semibold text-purple-800">Total Leaves</div>
          </div>
          <div className="p-6 text-center bg-white border border-green-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-green-600">{approvedLeaves}</div>
            <div className="font-semibold text-green-800">Approved</div>
          </div>
          <div className="p-6 text-center bg-white border border-yellow-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-yellow-600">{pendingLeaves}</div>
            <div className="font-semibold text-yellow-800">Pending</div>
          </div>
          <div className="p-6 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-red-600">{rejectedLeaves}</div>
            <div className="font-semibold text-red-800">Rejected</div>
          </div>
          <div className="p-6 text-center bg-white border border-cyan-200 shadow-lg rounded-2xl">
            <div className="text-3xl font-bold text-cyan-600">{extraDayCompOffRequests.length}</div>
            <div className="font-semibold text-cyan-800">Comp-off</div>
          </div>
        </div>

        {/* Leave Balances Section */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">💼 Leave Balances</h3>
            <p className="text-sm text-gray-500">Available vs total leaves for the year</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="p-4 bg-white border border-blue-200 rounded-xl shadow-sm">
              <p className="text-sm font-semibold text-blue-700">Casual Leave</p>
              <p className="text-2xl font-bold text-gray-800">{leaveBalances?.casual?.used || 0} <span className="text-lg font-normal text-gray-400">/ {leaveBalances?.casual?.total || 12}</span></p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(leaveBalances?.casual?.used / leaveBalances?.casual?.total) * 100 || 0}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-white border border-red-200 rounded-xl shadow-sm">
              <p className="text-sm font-semibold text-red-700">Sick Leave</p>
              <p className="text-2xl font-bold text-gray-800">{leaveBalances?.sick?.used || 0} <span className="text-lg font-normal text-gray-400">/ {leaveBalances?.sick?.total || 10}</span></p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(leaveBalances?.sick?.used / leaveBalances?.sick?.total) * 100 || 0}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-white border border-green-200 rounded-xl shadow-sm">
              <p className="text-sm font-semibold text-green-700">Earned Leave</p>
              <p className="text-2xl font-bold text-gray-800">{leaveBalances?.earned?.used || 0} <span className="text-lg font-normal text-gray-400">/ {leaveBalances?.earned?.total || 15}</span></p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(leaveBalances?.earned?.used / leaveBalances?.earned?.total) * 100 || 0}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-white border border-purple-200 rounded-xl shadow-sm">
              <p className="text-sm font-semibold text-purple-700">Public Holidays</p>
              <p className="text-2xl font-bold text-gray-800">{publicHolidays.length}</p>
              <p className="text-sm text-gray-500">{publicHolidays.filter(h => h.type === "national").length} National holidays</p>
            </div>
          </div>
        </div>

        {/* Extra Days Details */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-4 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                <FaExchangeAlt className="text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Extra Days Details</h3>
            </div>
            <div className="flex items-center gap-2">
              <input type="month" value={extraDaysData.month || getCurrentMonth()} onChange={handleMonthChange} className="px-2 py-1 text-xs bg-white/50 border border-white/30 rounded-lg" />
            </div>
          </div>
          
          <p className="text-center text-sm font-semibold text-gray-700 mb-2">
            {extraDaysData.month ? new Date(extraDaysData.month + "-01").toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : getCurrentMonth()}
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
            <div className="text-center bg-white/20 rounded-lg py-3 px-1">
              <div className="text-2xl font-bold text-purple-700">{extraDaysData.assignedWorkingDays || 0}</div>
              <div className="text-[10px] text-gray-600">Assigned Days</div>
            </div>
            <div className="text-center bg-white/20 rounded-lg py-3 px-1">
              <div className="text-2xl font-bold text-orange-600">{extraDaysData.presentDays || 0}</div>
              <div className="text-[10px] text-gray-600">Present Days</div>
            </div>
          </div>
          
          <div className="mt-3 text-center mb-3">
            <div className={`text-sm font-bold rounded-lg py-2 ${hasExtraDays ? "bg-green-500/30 text-green-700" : "bg-gray-500/30 text-gray-600"}`}>
              {hasExtraDays ? `Extra Days Worked: ${extraDaysData.extraDays.count} day(s)` : `No Extra Days`}
            </div>
          </div>
          
          {/* Extra Days Details Table */}
          {hasExtraDays && (
            <div className="mt-3">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/30 rounded-xl overflow-hidden">
                  <thead className="bg-purple-600/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Sr. No.</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Day</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Total Hours</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Extra Hours</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-white">Apply Before</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {extraDaysData.extraDays.list.map((day, idx) => {
                      const compOffRequest = getCompOffRequestForExtraDay(day.date);
                      const requestStatus = getRequestStatusDisplay(compOffRequest);
                      const applyBeforeDate = getApplyBeforeDate(day.date, 15);
                      const canApply = isApplyWindowOpen(day.date, 15);
                      const dayStatus = day.status || 'active';
                      const statusColors = {
                        active: "bg-green-100 text-green-700",
                        expired: "bg-red-100 text-red-700",
                        used: "bg-blue-100 text-blue-700"
                      };
                      
                      return (
                        <tr key={idx} className="hover:bg-white/20">
                          <td className="px-3 py-2 text-xs text-gray-700">{day.sr || idx + 1}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{formatDateDisplay(day.date)}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{day.day || formatDateDisplay(day.date)}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{day.totalHours || 8} hrs</td>
                          <td className="px-3 py-2 text-xs text-green-600 font-semibold">+{day.extraHours || 0} hrs</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-1 rounded-full text-xs ${canApply ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                              {applyBeforeDate}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {requestStatus ? (
                              <span className={`px-2 py-1 text-xs rounded-full ${requestStatus.className}`}>
                                {requestStatus.text}
                              </span>
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[dayStatus] || 'bg-gray-300 text-gray-600'}`}>
                                {dayStatus.charAt(0).toUpperCase() + dayStatus.slice(1)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="p-6 mb-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">🔍 Filter Leave Records</h3>
            <p className="text-sm text-gray-500">Search and filter by various criteria</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-700">
                <FaSearch className="inline mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Type, reason, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 transition border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-purple-700">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-green-700">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthFilterChange}
                className="w-full p-3 transition border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">Actions</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700"
                >
                  <FaPlus className="text-sm" /> Apply Leave
                </button>
                <button
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 font-semibold text-white transition shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700"
                >
                  <FaShieldAlt className="text-sm" /> Permission
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="font-semibold text-blue-700">
              Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
            </span>
            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 font-semibold text-gray-900 transition bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Leaves Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">📋 Leave Records</h3>
            <p className="text-sm text-gray-500">Your applications and approvals</p>
          </div>
          {currentRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-500">
                {leaves.length === 0 ? "No leave records found." : "No records match your filters."}
              </p>
              {leaves.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-900 bg-gradient-to-r from-purple-500 to-blue-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-left">Leave Type</th>
                      <th className="px-6 py-4 font-semibold text-left">Date Range</th>
                      <th className="px-6 py-4 font-semibold text-left">Days</th>
                      <th className="px-6 py-4 font-semibold text-left">Reason</th>
                      <th className="px-6 py-4 font-semibold text-left">Status</th>
                      <th className="px-6 py-4 font-semibold text-left">Approved By</th>
                      <th className="px-6 py-4 font-semibold text-left">Comp-off Status</th>
                      <th className="px-6 py-4 font-semibold text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((leave, idx) => {
                      const canApplyCompOff = leave.status === "approved";
                      const compOffInfo = getCompOffStatusForLeave(leave._id);
                      
                      const availableExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.list 
                        ? extraDaysData.extraDays.list.filter(day => {
                            const compOffRequest = getCompOffRequestForExtraDay(day.date);
                            return !compOffRequest || compOffRequest.status !== "approved";
                          })
                        : [];
                      
                      const getLeaveTypeClass = (type) => {
                        const t = type?.toLowerCase();
                        if (t.includes('sick')) return "bg-blue-50 text-blue-700 border border-blue-300";
                        if (t.includes('casual')) return "bg-purple-100 text-purple-800 border border-purple-300";
                        if (t.includes('earned')) return "bg-emerald-50 text-emerald-700 border border-green-300";
                        return "bg-gray-100 text-gray-700 border border-gray-300";
                      };
                      
                      const getStatusClass = (status) => {
                        switch (status.toLowerCase()) {
                          case "approved":
                            return "bg-emerald-50 text-emerald-700 border border-green-300";
                          case "rejected":
                            return "bg-red-50 text-red-700 border border-red-300";
                          case "pending":
                          default:
                            return "bg-amber-50 text-amber-700 border border-yellow-300";
                        }
                      };
                      
                      return (
                        <tr
                          key={leave._id}
                          className={`border-t transition-all duration-200 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-purple-50 hover:shadow-sm`}
                        >
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getLeaveTypeClass(leave.leaveType)}`}>
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {formatDate(leave.startDate)}
                              </div>
                              <div className="text-xs text-gray-500">to</div>
                              <div className="font-medium">
                                {formatDate(leave.endDate)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full">
                              {leave.days} day{leave.days !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[200px]">
                              <p className="text-gray-700 line-clamp-2">{leave.reason || "-"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 w-fit ${getStatusClass(leave.status)}`}>
                              <span className="text-sm">{leave.status === "approved" ? "✅" : leave.status === "rejected" ? "❌" : "⏳"}</span>
                              <span className="capitalize">{leave.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-700">{leave.approvedBy || "—"}</span>
                          </td>
                          <td className="px-6 py-4">
                            {compOffInfo.exists ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                compOffInfo.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                compOffInfo.status === "approved" ? "bg-green-100 text-green-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {compOffInfo.status.charAt(0).toUpperCase() + compOffInfo.status.slice(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Not Applied</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {compOffInfo.exists ? (
                              <button 
                                onClick={() => openViewCompOffModal(compOffInfo.data)}
                                className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-900 transition shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700"
                                title="View Comp-off Request"
                              >
                                <FaEye className="text-sm" /> View
                              </button>
                            ) : canApplyCompOff && availableExtraDays.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <select 
                                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  value={selectedExtraDayForCompOff}
                                  onChange={(e) => setSelectedExtraDayForCompOff(e.target.value)}
                                >
                                  <option value="">Select Day</option>
                                  {availableExtraDays.map((day, idx) => {
                                    const compOffRequest = getCompOffRequestForExtraDay(day.date);
                                    const isPending = compOffRequest && compOffRequest.status === "pending";
                                    const isRejected = compOffRequest && compOffRequest.status === "rejected";
                                    return (
                                    <option 
                                      key={idx} 
                                      value={day.date}
                                      disabled={isPending}
                                    >
                                      {formatDateDisplay(day.date)} - {day.totalHours}hrs 
                                      {isPending ? ' (Pending)' : ''}
                                      {isRejected ? ' (Rejected)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <button 
                                onClick={() => {
                                  if (!selectedExtraDayForCompOff) {
                                    alert("Please select an extra day first!");
                                    return;
                                  }
                                  openLeaveCompOffModal(leave, selectedExtraDayForCompOff);
                                  setSelectedExtraDayForCompOff("");
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-purple-500 rounded-lg hover:bg-purple-600"
                              >
                                <FaExchangeAlt size={10} /> Apply
                              </button>
                            </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 p-6 border-t sm:flex-row bg-white">
                  <div className="text-sm text-gray-500">
                    Showing <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeaves.length)}</strong> of{" "}
                    <strong>{filteredLeaves.length}</strong> records
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      }`}
                    >
                      Prev
                    </button>

                    <div className="flex gap-1">
                      {getPageNumbers().map((pageNumber, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof pageNumber === "number" && handlePageClick(pageNumber)}
                          className={`px-3 py-2 rounded-lg transition font-semibold ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 bg-white border border-purple-200 shadow-2xl rounded-2xl">
            <button
              onClick={() => setIsLeaveModalOpen(false)}
              className="absolute text-xl text-gray-500 transition top-4 right-4 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-700">Apply for Leave</h2>
              <p className="text-gray-500">Submit your leave request</p>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Leave Type</label>
                <select
                  name="leaveType"
                  value={leaveFormData.leaveType}
                  onChange={handleLeaveChange}
                  className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={handleLeaveChange}
                    className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">End Date</label>
                  <input
                    name="endDate"
                    type="date"
                    value={leaveFormData.endDate}
                    onChange={handleLeaveChange}
                    className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Total Days</label>
                <input
                  name="days"
                  type="number"
                  value={leaveFormData.days}
                  readOnly
                  className="w-full p-3 bg-gray-100 border-2 border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  value={leaveFormData.reason}
                  onChange={handleLeaveChange}
                  className="w-full p-3 transition border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                  rows="3"
                  required
                  placeholder="Please provide reason for leave..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 px-4 py-3 font-semibold text-gray-900 transition bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="flex-1 px-4 py-3 font-semibold text-white transition shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700"
                >
                  {submittingLeave ? "Applying..." : "Apply Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 bg-white border border-green-200 shadow-2xl rounded-2xl">
            <button
              onClick={() => setIsPermissionModalOpen(false)}
              className="absolute text-xl text-gray-500 transition top-4 right-4 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-700">Request Permission</h2>
              <p className="text-gray-500">Request short-term permission</p>
            </div>

            <form onSubmit={handlePermissionSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Reason</label>
                <textarea
                  required
                  className="w-full p-3 transition border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500"
                  rows="3"
                  value={permissionForm.reason}
                  onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })}
                  placeholder="Why do you need permission?"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-3 transition border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-500"
                  value={permissionForm.duration}
                  onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })}
                  placeholder="e.g. 30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="flex-1 px-4 py-3 font-semibold text-gray-900 transition bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={permissionLoading}
                  className="flex-1 px-4 py-3 font-semibold text-white transition shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700"
                >
                  {permissionLoading ? "Submitting..." : "Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Day Comp-off Request Modal */}
      {isExtraDayCompOffModalOpen && selectedExtraDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-purple-700">Request Comp-off</h3>
              <button onClick={() => setIsExtraDayCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedExtraDay.leave && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">Leave Details:</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Leave Type:</span><span className="font-medium text-gray-800 capitalize">{selectedExtraDay.leave.leaveType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Start Date:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.startDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">End Date:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Days:</span><span className="font-medium text-gray-800">{selectedExtraDay.leave.days}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Reason:</span><span className="font-medium text-gray-800 truncate max-w-[180px]">{selectedExtraDay.leave.reason}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedExtraDay.leave.status === "approved" ? "bg-emerald-200 text-emerald-700" : selectedExtraDay.leave.status === "pending" ? "bg-amber-200 text-amber-700" : "bg-rose-200 text-rose-700"}`}>{selectedExtraDay.leave.status}</span></div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2"><FaExchangeAlt className="text-purple-600" /> Extra Day Details:</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{selectedExtraDay.day || formatDateDisplay(selectedExtraDay.date)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{selectedExtraDay.totalHours || 8} hrs</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Extra Hours:</span><span className="font-medium text-green-600">+{selectedExtraDay.extraHours || 0} hrs</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Apply Before:</span><span className="font-medium text-blue-600">{getApplyBeforeDate(selectedExtraDay.date, 15)}</span></div>
                </div>
              </div>

              <form onSubmit={handleExtraDayCompOffSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Reason <span className="text-red-500">*</span></label>
                  <textarea value={extraDayCompOffData.reason} onChange={(e) => setExtraDayCompOffData({ ...extraDayCompOffData, reason: e.target.value })} rows="4" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none" placeholder="Please provide reason for comp-off request..." required />
                </div>
              </form>
            </div>
            <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
              <button type="button" onClick={() => setIsExtraDayCompOffModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">Cancel</button>
              <button type="submit" onClick={handleExtraDayCompOffSubmit} disabled={submittingExtraDayCompOff} className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submittingExtraDayCompOff ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...</span>) : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Comp-off Request Modal */}
      {isViewCompOffModalOpen && viewCompOffData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2"><FaInfoCircle className="text-purple-600" /> Comp-off Request Details</h3>
              <button onClick={() => setIsViewCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${viewCompOffData.status === "pending" ? "bg-yellow-100 text-yellow-700" : viewCompOffData.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Status: {viewCompOffData.status.charAt(0).toUpperCase() + viewCompOffData.status.slice(1)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500">Request ID</p>
                <p className="text-sm font-medium text-gray-800">{viewCompOffData._id}</p>
              </div>

              {viewCompOffData.leaveDetails && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">Leave Details:</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Leave Type:</span><span className="font-medium text-gray-800 capitalize">{viewCompOffData.leaveDetails.leaveType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Start Date:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.startDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">End Date:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.endDate)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Days:</span><span className="font-medium text-gray-800">{viewCompOffData.leaveDetails.days}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Leave Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${viewCompOffData.leaveDetails.status === "approved" ? "bg-emerald-200 text-emerald-700" : viewCompOffData.leaveDetails.status === "pending" ? "bg-amber-200 text-amber-700" : "bg-rose-200 text-rose-700"}`}>{viewCompOffData.leaveDetails.status}</span></div>
                  </div>
                </div>
              )}

              {viewCompOffData.extraDayDetails && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2"><FaExchangeAlt className="text-purple-600" /> Extra Day Details:</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.day || formatDateDisplay(viewCompOffData.extraDayDetails.date)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.totalHours || 8} hrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Extra Hours:</span><span className="font-medium text-green-600">+{viewCompOffData.extraDayDetails.extraHours || 0} hrs</span></div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Reason:</p>
                <p className="text-sm text-gray-600">{viewCompOffData.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div className="p-2 rounded-lg bg-gray-50"><p>Created At</p><p className="font-medium text-gray-700">{formatDate(viewCompOffData.createdAt)}</p></div>
                <div className="p-2 rounded-lg bg-gray-50"><p>Updated At</p><p className="font-medium text-gray-700">{formatDate(viewCompOffData.updatedAt)}</p></div>
              </div>

              {viewCompOffData.status === "approved" && viewCompOffData.approvedBy && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-xs text-green-600">Approved by: {viewCompOffData.approvedBy}</p>
                  <p className="text-xs text-green-600">Approved at: {formatDate(viewCompOffData.approvedAt)}</p>
                </div>
              )}

              {viewCompOffData.status === "rejected" && viewCompOffData.rejectedReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-xs text-red-600">Rejected Reason: {viewCompOffData.rejectedReason}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
              <button onClick={() => setIsViewCompOffModalOpen(false)} className="w-full py-2.5 text-sm font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Comp-off Requests List Modal */}
      {isCompOffRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 flex justify-between p-4 bg-white border-b">
              <div><h3 className="text-lg font-bold text-purple-700">Comp-off Requests</h3><p className="text-xs text-gray-600">Total Requests: {extraDayCompOffRequests.length}</p></div>
              <button onClick={() => setIsCompOffRequestsModalOpen(false)} className="text-gray-500 text-xl hover:text-gray-700">×</button>
            </div>
            <div className="p-4">
              {extraDayCompOffRequests.length > 0 ? (
                extraDayCompOffRequests.map((request, idx) => {
                  const isExpired = request.status === "approved" && isCompOffExpired(request.workDate);
                  return (
                    <div key={request._id || idx} className="p-3 bg-gray-50 rounded-xl border mb-3">
                      <div className="flex justify-between mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${request.status === "pending" ? "bg-yellow-200 text-yellow-700" : request.status === "approved" ? (isExpired ? "bg-gray-400 text-white" : "bg-green-200 text-green-700") : "bg-red-200 text-red-700"}`}>
                          {request.status === "approved" && isExpired ? "Expired" : request.status}
                        </span>
                        <span className="text-xs text-gray-500">{request.createdAt ? formatDate(request.createdAt) : '-'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Date: {request.extraDayDate ? formatDateDisplay(request.extraDayDate) : '-'}</div>
                        <div>Total Hours: {request.extraDayDetails?.totalHours || '-'} hrs</div>
                        <div>Extra Hours: +{request.extraDayDetails?.extraHours || '-'} hrs</div>
                      </div>
                      {request.reason && (<div className="mt-2 text-xs"><span className="text-gray-500">Reason:</span><p className="mt-0.5 text-gray-700">{request.reason}</p></div>)}
                    </div>
                  );
                })
              ) : (<div className="text-center py-8 text-gray-500">No comp-off requests found</div>)}
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t"><button onClick={() => setIsCompOffRequestsModalOpen(false)} className="w-full px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;