
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt, FaEye, FaInfoCircle } from "react-icons/fa";
// import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
// import StatCard from "../Components/StatCard";
// import { API_BASE_URL } from "../config";

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
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

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

//   const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
//   const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
//   const [permissionLoading, setPermissionLoading] = useState(false);

//   // Comp-off for Extra Days
//   const [isExtraDayCompOffModalOpen, setIsExtraDayCompOffModalOpen] = useState(false);
//   const [submittingExtraDayCompOff, setSubmittingExtraDayCompOff] = useState(false);
//   const [selectedExtraDay, setSelectedExtraDay] = useState(null);
//   const [extraDayCompOffData, setExtraDayCompOffData] = useState({
//     reason: ""
//   });

//   // View Comp-off Request Modal
//   const [isViewCompOffModalOpen, setIsViewCompOffModalOpen] = useState(false);
//   const [viewCompOffData, setViewCompOffData] = useState(null);

//   // Real data states
//   const [extraDaysData, setExtraDaysData] = useState({
//     employeeId: "",
//     employeeName: "",
//     month: "",
//     assignedWorkingDays: 0,
//     presentDays: 0,
//     extraDays: {
//       count: 0,
//       list: []
//     }
//   });
  
//   const [isCompOffRequestsModalOpen, setIsCompOffRequestsModalOpen] = useState(false);
//   const [extraDayCompOffRequests, setExtraDayCompOffRequests] = useState([]);
  
//   // For dropdown in leaves table
//   const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
//   const [selectedExtraDayForCompOff, setSelectedExtraDayForCompOff] = useState("");

//   // Comp-off requests from API
//   const [compOffRequestsFromAPI, setCompOffRequestsFromAPI] = useState([]);

//   const getCurrentMonth = () => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//   };

//   useEffect(() => {
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setIsDemoMode(true);
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
//       setIsDemoMode(true);
//       setLoading(false);
//       return;
//     }

//     if (!employeeId) {
//       setIsDemoMode(true);
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
//     fetchExtraDaysData(employeeId, getCurrentMonth());
//     fetchPublicHolidays();
//     fetchCompOffRequests(employeeId);
//   }, []);

//   const fetchPublicHolidays = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/holidays/all`);
//       setPublicHolidays(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Error fetching public holidays:", err);
//     }
//   };

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

//   const fetchLeaves = async (employeeId) => {
//     try {
//       const resp = await axios.get(`${API_BASE_URL}/leaves/employeeleaves/${employeeId}`);
//       if (resp.data && resp.data.success) {
//         const sortedLeaves = (resp.data.records || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
//         setLeaves(sortedLeaves);
//         setFilteredLeaves(sortedLeaves);
//       } else {
//         setError("Unexpected API response.");
//       }
//     } catch (err) {
//       setError("Failed to fetch leaves.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchExtraDaysData = async (employeeId, month) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/attendance/extra-days/${employeeId}?month=${month}`);
//       console.log("Extra Days API Response:", response.data);
      
//       if (response.data && response.data.success) {
//         setExtraDaysData(response.data);
//         if (response.data.extraDays && response.data.extraDays.count > 0) {
//           // Fetch comp-off requests for these extra days
//           fetchExtraDayCompOffRequests(employeeId, month);
//         }
//       } else {
//         setExtraDaysData({
//           employeeId: employeeId,
//           employeeName: "",
//           month: month,
//           assignedWorkingDays: 0,
//           presentDays: 0,
//           extraDays: {
//             count: 0,
//             list: []
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching extra days data:", error);
//       setExtraDaysData({
//         employeeId: employeeId,
//         employeeName: "",
//         month: month,
//         assignedWorkingDays: 0,
//         presentDays: 0,
//         extraDays: {
//           count: 0,
//           list: []
//         }
//       });
//     }
//   };

//   const fetchExtraDayCompOffRequests = async (employeeId, month) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/attendance/extra-days-compoff/${employeeId}?month=${month}`);
//       if (response.data && response.data.requests) {
//         setExtraDayCompOffRequests(response.data.requests);
//       }
//     } catch (error) {
//       console.error("Error fetching comp-off requests:", error);
//     }
//   };

//   const fetchCompOffRequests = async (employeeId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/leaves/getcompoffrequestforuser/${employeeId}`);
//       if (response.data && response.data.success) {
//         setCompOffRequestsFromAPI(response.data.requests || []);
//         console.log("Comp-off requests from API:", response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching comp-off requests:", error);
//     }
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
    
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (employeeDataRaw) {
//       try {
//         const employeeData = JSON.parse(employeeDataRaw);
//         const employeeId = employeeData.employeeId;
//         if (employeeId) {
//           fetchExtraDaysData(employeeId, month);
//         }
//       } catch (err) {
//         console.error("Error parsing employee data:", err);
//       }
//     }
//   };

//   const formatDateDisplay = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const getApplyBeforeDate = (extraDayDate, daysBefore = 15) => {
//     const date = new Date(extraDayDate);
//     date.setDate(date.getDate() - daysBefore);
//     return formatDateDisplay(date.toISOString());
//   };

//   const isApplyWindowOpen = (extraDayDate, daysBefore = 15) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const applyDeadline = new Date(extraDayDate);
//     applyDeadline.setDate(applyDeadline.getDate() - daysBefore);
//     applyDeadline.setHours(0, 0, 0, 0);
//     return today <= applyDeadline;
//   };

//   const getCompOffStatusForLeave = (leaveId) => {
//     const request = compOffRequestsFromAPI.find(req => req.leaveId === leaveId);
//     if (request) {
//       return {
//         exists: true,
//         status: request.status,
//         data: request
//       };
//     }
//     return { exists: false, status: null, data: null };
//   };

//   const openLeaveCompOffModal = (leave, extraDayDate) => {
//     const existingCompOff = getCompOffStatusForLeave(leave._id);
//     if (existingCompOff.exists) {
//       if (existingCompOff.status === 'pending') {
//         alert('Comp-off request is already pending for this leave!');
//         return;
//       } else if (existingCompOff.status === 'approved') {
//         alert('Comp-off has already been approved for this leave!');
//         return;
//       }
//     }

//     const extraDay = extraDaysData.extraDays.list.find(d => d.date === extraDayDate);
//     if (!extraDay) {
//       alert("Selected extra day not found!");
//       return;
//     }
    
//     if (!isApplyWindowOpen(extraDay.date, 15)) {
//       alert(`You can only apply for comp-off at least 15 days before the extra day (${formatDateDisplay(extraDay.date)}). The deadline was ${getApplyBeforeDate(extraDay.date, 15)}.`);
//       return;
//     }
    
//     setSelectedExtraDay({
//       ...extraDay,
//       leave: leave,
//       leaveId: leave._id,
//       leaveType: leave.leaveType,
//       leaveStartDate: leave.startDate,
//       leaveEndDate: leave.endDate,
//       leaveDays: leave.days,
//       leaveReason: leave.reason,
//       leaveStatus: leave.status,
//       source: 'leavesTable'
//     });
    
//     setExtraDayCompOffData({
//       reason: `Requesting comp-off for extra day on ${extraDay.day || formatDateDisplay(extraDay.date)} (${extraDay.totalHours} hours) against ${leave.leaveType} leave (${formatDate(leave.startDate)} - ${formatDate(leave.endDate)})`
//     });
//     setIsExtraDayCompOffModalOpen(true);
//     setSelectedLeaveForCompOff(null);
//     setSelectedExtraDayForCompOff("");
//   };

//   const openViewCompOffModal = (compOffData) => {
//     setViewCompOffData(compOffData);
//     setIsViewCompOffModalOpen(true);
//   };

//   const handleExtraDayCompOffSubmit = async (e) => {
//     e.preventDefault();
//     setSubmittingExtraDayCompOff(true);

//     if (!extraDayCompOffData.reason) {
//       alert("Please provide a reason for comp-off request");
//       setSubmittingExtraDayCompOff(false);
//       return;
//     }

//     if (isDemoMode) {
//       alert("Demo Mode: Comp-off request submitted successfully!");
//       setIsExtraDayCompOffModalOpen(false);
//       setSubmittingExtraDayCompOff(false);
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
//       alert("Employee data error");
//       setSubmittingExtraDayCompOff(false);
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_BASE_URL}/leaves/requestforcompoffs`, {
//         employeeId: employeeId,
//         employeeName: employeeName,
//         extraDayDate: selectedExtraDay.date,
//         extraDayDetails: selectedExtraDay,
//         reason: extraDayCompOffData.reason,
//         leaveId: selectedExtraDay.leaveId,
//         leaveDetails: {
//           leaveType: selectedExtraDay.leaveType,
//           startDate: selectedExtraDay.leaveStartDate,
//           endDate: selectedExtraDay.leaveEndDate,
//           days: selectedExtraDay.leaveDays,
//           reason: selectedExtraDay.leaveReason,
//           status: selectedExtraDay.leaveStatus
//         }
//       });

//       if (response.status === 201) {
//         alert("Comp-off request submitted successfully!");
//         setIsExtraDayCompOffModalOpen(false);
//         setSelectedExtraDay(null);
//         const employeeData = JSON.parse(employeeDataRaw);
//         fetchExtraDaysData(employeeId, getCurrentMonth());
//         fetchCompOffRequests(employeeId);
//       }
//     } catch (error) {
//       console.error("Error submitting comp-off:", error);
//       alert(error.response?.data?.error || "Failed to submit comp-off request");
//     } finally {
//       setSubmittingExtraDayCompOff(false);
//     }
//   };

//   const handlePermissionSubmit = async (e) => {
//     e.preventDefault();
//     setPermissionLoading(true);

//     if (isDemoMode) {
//       alert("Demo Mode: Permission Requested Successfully!");
//       setIsPermissionModalOpen(false);
//       setPermissionLoading(false);
//       return;
//     }

//     const rawData = localStorage.getItem("employeeData");
//     let employeeData = null;
//     try {
//       if (rawData) employeeData = JSON.parse(rawData);
//     } catch (e) { }

//     const id = employeeData?.employeeId || localStorage.getItem("employeeId");
//     const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
//     const durationNum = parseInt(permissionForm.duration);

//     if (!id) {
//       alert("Employee ID not found.");
//       setPermissionLoading(false);
//       return;
//     }
//     if (!permissionForm.reason || isNaN(durationNum)) {
//       alert("Please provide a valid reason and duration.");
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
//         alert("Permission Requested Successfully!");
//         setIsPermissionModalOpen(false);
//         setPermissionForm({ reason: "", duration: "" });
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || err.message);
//     } finally {
//       setPermissionLoading(false);
//     }
//   };

//   const handleLeaveSubmit = async (e) => {
//     e.preventDefault();
//     setSubmittingLeave(true);

//     if (isDemoMode) {
//       alert("Demo Mode: Leave application submitted successfully!");
//       setIsLeaveModalOpen(false);
//       setSubmittingLeave(false);
//       return;
//     }

//     const rawData = localStorage.getItem("employeeData");
//     let employeeData = null;
//     try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

//     const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
//     const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

//     if (!id) {
//       alert("Employee details missing.");
//       setSubmittingLeave(false);
//       return;
//     }

//     const payload = { ...leaveFormData, employeeId: id, employeeName: name };

//     try {
//       const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
//       if (response.status === 201) {
//         alert("Leave application submitted successfully!");
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
//       alert(error.response?.data?.message || "Failed to submit leave application.");
//     } finally {
//       setSubmittingLeave(false);
//     }
//   };

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
//     setSelectedDate(e.target.value);
//     setSelectedMonth("");
//   };

//   const handleMonthFilterChange = (e) => {
//     setSelectedMonth(e.target.value);
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
//       if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
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

//   const getCompOffRequestForExtraDay = (extraDayDate) => {
//     return extraDayCompOffRequests.find(req => req.extraDayDate === extraDayDate);
//   };

//   const isCompOffExpired = (workDate) => {
//     if (!workDate) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const workDateObj = new Date(workDate);
//     workDateObj.setHours(0, 0, 0, 0);
//     return workDateObj < today;
//   };

//   const getRequestStatusDisplay = (request) => {
//     if (!request) return null;
//     if (request.status === "approved") {
//       if (isCompOffExpired(request.workDate)) {
//         return { text: "Expired", className: "bg-gray-400 text-white" };
//       }
//       return { text: "Active", className: "bg-green-500 text-white" };
//     }
//     if (request.status === "pending") {
//       return { text: "Pending", className: "bg-yellow-500 text-white" };
//     }
//     if (request.status === "rejected") {
//       return { text: "Rejected", className: "bg-red-500 text-white" };
//     }
//     return null;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//           <div className="mb-4 text-4xl text-red-500">X</div>
//           <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
//           <button onClick={() => window.location.reload()} className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Retry</button>
//         </div>
//       </div>
//     );
//   }

//   const hasExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.count > 0 && extraDaysData.extraDays.list.length > 0;

//   // Calculate leave stats from real data
//   const totalLeaves = leaves.length;
//   const approvedLeaves = leaves.filter(l => l.status === "approved").length;
//   const pendingLeaves = leaves.filter(l => l.status === "pending").length;
//   const rejectedLeaves = leaves.filter(l => l.status === "rejected").length;

//   return (
//     <div className="min-h-screen p-2 sm:p-4">
//       <div className="mx-auto max-w-9xl">
//         {isDemoMode && (
//           <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
//             <p className="text-sm font-semibold text-yellow-800">Demo Mode - Showing Sample Data</p>
//             <p className="text-xs text-yellow-600">Login to see your actual data</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-5">
//           <StatCard icon={FiFileText} label="Total Leaves" value={totalLeaves} color="indigo" />
//           <StatCard icon={FiCheckCircle} label="Approved" value={approvedLeaves} color="emerald" />
//           <StatCard icon={FiClock} label="Pending" value={pendingLeaves} color="amber" />
//           <StatCard icon={FiXCircle} label="Rejected" value={rejectedLeaves} color="rose" />
//           <StatCard icon={FaExchangeAlt} label="Comp-off" value={extraDayCompOffRequests.length} color="cyan" />
//         </div>

//         <div className="grid grid-cols-2 gap-1.5 mb-4 sm:grid-cols-4 sm:gap-2">
//           <div className="bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1.5">
//             <p className="text-[9px] text-gray-500 font-medium">Casual Leave</p>
//             <p className="text-xs font-bold text-gray-800">{leaveBalances?.casual?.used || 0}<span className="text-[9px] font-normal text-gray-400"> / {leaveBalances?.casual?.total || 12}</span></p>
//             <div className="w-full bg-gray-100 rounded-full h-0.5 mt-0.5">
//               <div className="bg-blue-500 h-0.5 rounded-full" style={{ width: `${(leaveBalances?.casual?.used / leaveBalances?.casual?.total) * 100 || 0}%` }}></div>
//             </div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1.5">
//             <p className="text-[9px] text-gray-500 font-medium">Sick Leave</p>
//             <p className="text-xs font-bold text-gray-800">{leaveBalances?.sick?.used || 0}<span className="text-[9px] font-normal text-gray-400"> / {leaveBalances?.sick?.total || 10}</span></p>
//             <div className="w-full bg-gray-100 rounded-full h-0.5 mt-0.5">
//               <div className="bg-red-500 h-0.5 rounded-full" style={{ width: `${(leaveBalances?.sick?.used / leaveBalances?.sick?.total) * 100 || 0}%` }}></div>
//             </div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1.5">
//             <p className="text-[9px] text-gray-500 font-medium">Earned Leave</p>
//             <p className="text-xs font-bold text-gray-800">{leaveBalances?.earned?.used || 0}<span className="text-[9px] font-normal text-gray-400"> / {leaveBalances?.earned?.total || 15}</span></p>
//             <div className="w-full bg-gray-100 rounded-full h-0.5 mt-0.5">
//               <div className="bg-green-500 h-0.5 rounded-full" style={{ width: `${(leaveBalances?.earned?.used / leaveBalances?.earned?.total) * 100 || 0}%` }}></div>
//             </div>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1.5">
//             <p className="text-[9px] text-gray-500 font-medium">Public Holidays</p>
//             <p className="text-xs font-bold text-gray-800">{publicHolidays.length}</p>
//             <p className="text-[8px] text-gray-400">{publicHolidays.filter(h => h.type === "national").length} National</p>
//           </div>
//         </div>

//         {/* Extra Days Details */}
//         <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-4 mb-5">
//           <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
//                 <FaExchangeAlt className="text-purple-700" />
//               </div>
//               <h3 className="text-base font-bold text-gray-800">Extra Days Details</h3>
//             </div>
//             <div className="flex items-center gap-2">
//               <input type="month" value={extraDaysData.month || getCurrentMonth()} onChange={handleMonthChange} className="px-2 py-1 text-xs bg-white/50 border border-white/30 rounded-lg" />
//             </div>
//           </div>
          
//           <p className="text-center text-sm font-semibold text-gray-700 mb-2">
//             {extraDaysData.month ? new Date(extraDaysData.month + "-01").toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : getCurrentMonth()}
//           </p>
          
//           <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
//             <div className="text-center bg-white/20 rounded-lg py-3 px-1">
//               <div className="text-2xl font-bold text-purple-700">{extraDaysData.assignedWorkingDays || 0}</div>
//               <div className="text-[10px] text-gray-600">Assigned Days</div>
//             </div>
//             <div className="text-center bg-white/20 rounded-lg py-3 px-1">
//               <div className="text-2xl font-bold text-orange-600">{extraDaysData.presentDays || 0}</div>
//               <div className="text-[10px] text-gray-600">Present Days</div>
//             </div>
//           </div>
          
//           <div className="mt-3 text-center mb-3">
//             <div className={`text-sm font-bold rounded-lg py-2 ${hasExtraDays ? "bg-green-500/30 text-green-700" : "bg-gray-500/30 text-gray-600"}`}>
//               {hasExtraDays ? `Extra Days Worked: ${extraDaysData.extraDays.count} day(s)` : `No Extra Days`}
//             </div>
//           </div>
          
//           {/* Extra Days Details Table */}
//           {hasExtraDays && (
//             <div className="mt-3">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full bg-white/30 rounded-xl overflow-hidden">
//                   <thead className="bg-purple-600/50">
//                     <tr>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Sr. No.</th>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Date</th>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Day</th>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Total Hours</th>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Extra Hours</th>
//                       <th className="px-3 py-2 text-left text-xs font-semibold text-white">Apply Before</th>
//                       <th className="px-3 py-2 text-center text-xs font-semibold text-white">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-white/20">
//                     {extraDaysData.extraDays.list.map((day, idx) => {
//                       const compOffRequest = getCompOffRequestForExtraDay(day.date);
//                       const requestStatus = getRequestStatusDisplay(compOffRequest);
//                       const applyBeforeDate = getApplyBeforeDate(day.date, 15);
//                       const canApply = isApplyWindowOpen(day.date, 15);
//                       const dayStatus = day.status || 'active';
//                       const statusColors = {
//                         active: "bg-green-100 text-green-700",
//                         expired: "bg-red-100 text-red-700",
//                         used: "bg-blue-100 text-blue-700"
//                       };
                      
//                       return (
//                         <tr key={idx} className="hover:bg-white/20">
//                           <td className="px-3 py-2 text-xs text-gray-700">{day.sr || idx + 1}</td>
//                           <td className="px-3 py-2 text-xs text-gray-700">{formatDateDisplay(day.date)}</td>
//                           <td className="px-3 py-2 text-xs text-gray-700">{day.day || formatDateDisplay(day.date)}</td>
//                           <td className="px-3 py-2 text-xs text-gray-700">{day.totalHours || 8} hrs</td>
//                           <td className="px-3 py-2 text-xs text-green-600 font-semibold">+{day.extraHours || 0} hrs</td>
//                           <td className="px-3 py-2 text-xs">
//                             <span className={`px-2 py-1 rounded-full text-xs ${canApply ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
//                               {applyBeforeDate}
//                             </span>
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {requestStatus ? (
//                               <span className={`px-2 py-1 text-xs rounded-full ${requestStatus.className}`}>
//                                 {requestStatus.text}
//                               </span>
//                             ) : (
//                               <span className={`px-2 py-1 text-xs rounded-full ${statusColors[dayStatus] || 'bg-gray-300 text-gray-600'}`}>
//                                 {dayStatus.charAt(0).toUpperCase() + dayStatus.slice(1)}
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Filters Section */}
//         <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 mb-5">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 left-3 top-1/2 -translate-y-1/2" />
//               <input type="text" placeholder="Search leaves..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl" />
//             </div>
//             <input type="date" value={selectedDate} onChange={handleDateChange} className="px-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl" />
//             <input type="month" value={selectedMonth} onChange={handleMonthFilterChange} className="px-3 py-2 text-sm bg-white/50 border border-white/30 rounded-xl" />
//             <button onClick={() => setIsLeaveModalOpen(true)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600">
//               <FaPlus className="text-xs" /> Apply Leave
//             </button>
//             <button onClick={() => setIsPermissionModalOpen(true)} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600">
//               <FaShieldAlt className="text-xs" /> Apply Permission
//             </button>
//             {(searchTerm || selectedDate || selectedMonth) && (
//               <button onClick={clearFilters} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 border border-white/30 rounded-xl">Clear</button>
//             )}
//           </div>
//           <div className="flex justify-between mt-3 text-xs text-gray-600">
//             <span>Showing {filteredLeaves.length} of {leaves.length} leave records</span>
//           </div>
//         </div>

//         {/* Leaves Table Section */}
//         <div className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Leave Type</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Start Date</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">End Date</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Days</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Reason</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Status</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Approved By</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Comp-off Status</th>
//                   <th className="px-3 py-3 text-center text-xs font-semibold text-white uppercase">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/20">
//                 {currentRecords.length > 0 ? (
//                   currentRecords.map((leave) => {
//                     const canApplyCompOff = leave.status === "approved";
//                     const compOffInfo = getCompOffStatusForLeave(leave._id);
                    
//                     const availableExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.list 
//                       ? extraDaysData.extraDays.list.filter(day => {
//                           const compOffRequest = getCompOffRequestForExtraDay(day.date);
//                           return !compOffRequest || compOffRequest.status !== "approved";
//                         })
//                       : [];
                    
//                     return (
//                       <tr key={leave._id} className="hover:bg-white/20">
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="px-2 py-1 text-xs font-medium text-gray-700 capitalize bg-white/50 rounded-full">
//                             {leave.leaveType}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2.5 text-center text-xs text-gray-700">
//                           {formatDate(leave.startDate)}
//                         </td>
//                         <td className="px-3 py-2.5 text-center text-xs text-gray-700">
//                           {formatDate(leave.endDate)}
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-700">
//                             {leave.days}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="block text-xs text-gray-600 truncate max-w-[150px]">
//                             {leave.reason}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                             leave.status === "approved" ? "bg-emerald-200 text-emerald-700" :
//                             leave.status === "pending" ? "bg-amber-200 text-amber-700" :
//                             "bg-rose-200 text-rose-700"
//                           }`}>
//                             {leave.status}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           <span className="text-xs text-gray-700">{leave.approvedBy || "-"}</span>
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           {compOffInfo.exists ? (
//                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                               compOffInfo.status === "pending" ? "bg-yellow-200 text-yellow-700" :
//                               compOffInfo.status === "approved" ? "bg-green-200 text-green-700" :
//                               "bg-red-200 text-red-700"
//                             }`}>
//                               {compOffInfo.status.charAt(0).toUpperCase() + compOffInfo.status.slice(1)}
//                             </span>
//                           ) : (
//                             <span className="text-xs text-gray-400">Not Applied</span>
//                           )}
//                         </td>
//                         <td className="px-3 py-2.5 text-center">
//                           {compOffInfo.exists ? (
//                             <button 
//                               onClick={() => openViewCompOffModal(compOffInfo.data)}
//                               className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600 mx-auto"
//                               title="View Comp-off Request"
//                             >
//                               <FaEye size={12} /> View
//                             </button>
//                           ) : canApplyCompOff && availableExtraDays.length > 0 ? (
//                             <div className="flex items-center gap-1 justify-center">
//                               <select 
//                                 className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                                 value={selectedExtraDayForCompOff}
//                                 onChange={(e) => setSelectedExtraDayForCompOff(e.target.value)}
//                               >
//                                 <option value="">Select Extra Day</option>
//                                 {availableExtraDays.map((day, idx) => {
//                                   const compOffRequest = getCompOffRequestForExtraDay(day.date);
//                                   const isPending = compOffRequest && compOffRequest.status === "pending";
//                                   const isRejected = compOffRequest && compOffRequest.status === "rejected";
//                                   return (
//                                     <option 
//                                       key={idx} 
//                                       value={day.date}
//                                       disabled={isPending}
//                                     >
//                                       {formatDateDisplay(day.date)} - {day.totalHours}hrs 
//                                       {isPending ? ' (Pending)' : ''}
//                                       {isRejected ? ' (Rejected)' : ''}
//                                     </option>
//                                   );
//                                 })}
//                               </select>
//                               <button 
//                                 onClick={() => {
//                                   if (!selectedExtraDayForCompOff) {
//                                     alert("Please select an extra day first!");
//                                     return;
//                                   }
//                                   openLeaveCompOffModal(leave, selectedExtraDayForCompOff);
//                                   setSelectedExtraDayForCompOff("");
//                                 }}
//                                 className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-purple-500 rounded-lg hover:bg-purple-600"
//                               >
//                                 <FaExchangeAlt size={10} /> Apply
//                               </button>
//                             </div>
//                           ) : canApplyCompOff && compOffInfo.exists && compOffInfo.status === "rejected" && availableExtraDays.length > 0 ? (
//                             <div className="flex items-center gap-1 justify-center">
//                               <select 
//                                 className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                                 value={selectedExtraDayForCompOff}
//                                 onChange={(e) => setSelectedExtraDayForCompOff(e.target.value)}
//                               >
//                                 <option value="">Select Extra Day</option>
//                                 {availableExtraDays.map((day, idx) => {
//                                   const compOffRequest = getCompOffRequestForExtraDay(day.date);
//                                   const isPending = compOffRequest && compOffRequest.status === "pending";
//                                   return (
//                                     <option 
//                                       key={idx} 
//                                       value={day.date}
//                                       disabled={isPending}
//                                     >
//                                       {formatDateDisplay(day.date)} - {day.totalHours}hrs 
//                                       {isPending ? ' (Pending)' : ''}
//                                     </option>
//                                   );
//                                 })}
//                               </select>
//                               <button 
//                                 onClick={() => {
//                                   if (!selectedExtraDayForCompOff) {
//                                     alert("Please select an extra day first!");
//                                     return;
//                                   }
//                                   openLeaveCompOffModal(leave, selectedExtraDayForCompOff);
//                                   setSelectedExtraDayForCompOff("");
//                                 }}
//                                 className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-purple-500 rounded-lg hover:bg-purple-600"
//                               >
//                                 <FaExchangeAlt size={10} /> Re-apply
//                               </button>
//                             </div>
//                           ) : (
//                             <span className="text-xs text-gray-400">-</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="9" className="px-3 py-8 text-center text-gray-500">No leave records found</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-white/20 sm:flex-row">
//             <div className="flex items-center gap-2">
//               <label className="text-xs text-gray-700">Show:</label>
//               <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs bg-white/50 border border-white/30 rounded-lg">
//                 <option value={5}>5</option>
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//               </select>
//             </div>
//             <div className="flex items-center gap-1">
//               <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-300 text-gray-500 disabled:opacity-50">Prev</button>
//               {getPageNumbers().map((page, idx) => (
//                 <button key={idx} onClick={() => typeof page === "number" && handlePageClick(page)} className={`px-3 py-1 text-xs font-semibold rounded-lg ${currentPage === page ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}>
//                   {page}
//                 </button>
//               ))}
//               <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-300 text-gray-500 disabled:opacity-50">Next</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* All Modals remain same */}
//       {isLeaveModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-md bg-white rounded-2xl p-6">
//             <div className="flex justify-between mb-4"><h3 className="text-xl font-bold text-gray-800">Apply Leave</h3><button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500">X</button></div>
//             <form onSubmit={handleLeaveSubmit} className="space-y-3">
//               <div><label className="block mb-1 text-xs">Leave Type</label><select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 text-sm border rounded-xl" required><option value="casual">Casual Leave</option><option value="sick">Sick Leave</option><option value="earned">Earned Leave</option></select></div>
//               <div className="grid grid-cols-2 gap-3"><div><label className="block mb-1 text-xs">Start Date</label><input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border rounded-xl" required /></div><div><label className="block mb-1 text-xs">End Date</label><input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border rounded-xl" required /></div></div>
//               <div><label className="block mb-1 text-xs">Total Days</label><input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 text-sm bg-gray-100 border rounded-xl" /></div>
//               <div><label className="block mb-1 text-xs">Reason</label><textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 text-sm border rounded-xl" rows="3" required></textarea></div>
//               <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl">Cancel</button><button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-sm text-white bg-blue-500 rounded-xl">{submittingLeave ? "Applying..." : "Apply"}</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isPermissionModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-md bg-white rounded-2xl p-6">
//             <div className="flex justify-between mb-4"><h3 className="text-xl font-bold text-gray-800">Request Permission</h3><button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-500">X</button></div>
//             <form onSubmit={handlePermissionSubmit} className="space-y-3">
//               <div><label className="block mb-1 text-xs">Reason</label><textarea required className="w-full p-2 text-sm border rounded-xl" rows="3" value={permissionForm.reason} onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })} placeholder="Why do you need permission?"></textarea></div>
//               <div><label className="block mb-1 text-xs">Duration (minutes)</label><input type="number" required min="1" className="w-full p-2 text-sm border rounded-xl" value={permissionForm.duration} onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })} placeholder="e.g. 30" /></div>
//               <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl">Cancel</button><button type="submit" disabled={permissionLoading} className="flex-1 py-2 text-sm text-white bg-green-500 rounded-xl">{permissionLoading ? "Submitting..." : "Request"}</button></div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Extra Day Comp-off Request Modal */}
//       {isExtraDayCompOffModalOpen && selectedExtraDay && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
//             <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl sticky top-0 z-10">
//               <h3 className="text-xl font-bold text-purple-700">Request Comp-off</h3>
//               <button onClick={() => setIsExtraDayCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-5 space-y-4">
//               {selectedExtraDay.leave && (
//                 <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
//                   <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">Leave Details:</p>
//                   <div className="space-y-1.5 text-sm">
//                     <div className="flex justify-between"><span className="text-gray-600">Leave Type:</span><span className="font-medium text-gray-800 capitalize">{selectedExtraDay.leave.leaveType}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Start Date:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.startDate)}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">End Date:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.endDate)}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Total Days:</span><span className="font-medium text-gray-800">{selectedExtraDay.leave.days}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Reason:</span><span className="font-medium text-gray-800 truncate max-w-[180px]">{selectedExtraDay.leave.reason}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedExtraDay.leave.status === "approved" ? "bg-emerald-200 text-emerald-700" : selectedExtraDay.leave.status === "pending" ? "bg-amber-200 text-amber-700" : "bg-rose-200 text-rose-700"}`}>{selectedExtraDay.leave.status}</span></div>
//                   </div>
//                 </div>
//               )}

//               <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
//                 <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2"><FaExchangeAlt className="text-purple-600" /> Extra Day Details:</p>
//                 <div className="space-y-1.5 text-sm">
//                   <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{selectedExtraDay.day || formatDateDisplay(selectedExtraDay.date)}</span></div>
//                   <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{selectedExtraDay.totalHours || 8} hrs</span></div>
//                   <div className="flex justify-between"><span className="text-gray-600">Extra Hours:</span><span className="font-medium text-green-600">+{selectedExtraDay.extraHours || 0} hrs</span></div>
//                   <div className="flex justify-between"><span className="text-gray-600">Apply Before:</span><span className="font-medium text-blue-600">{getApplyBeforeDate(selectedExtraDay.date, 15)}</span></div>
//                 </div>
//               </div>

//               <form onSubmit={handleExtraDayCompOffSubmit} className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-semibold text-gray-700">Reason <span className="text-red-500">*</span></label>
//                   <textarea value={extraDayCompOffData.reason} onChange={(e) => setExtraDayCompOffData({ ...extraDayCompOffData, reason: e.target.value })} rows="4" className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none" placeholder="Please provide reason for comp-off request..." required />
//                 </div>
//               </form>
//             </div>
//             <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
//               <button type="button" onClick={() => setIsExtraDayCompOffModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">Cancel</button>
//               <button type="submit" onClick={handleExtraDayCompOffSubmit} disabled={submittingExtraDayCompOff} className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                 {submittingExtraDayCompOff ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...</span>) : "Submit Request"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Comp-off Request Modal */}
//       {isViewCompOffModalOpen && viewCompOffData && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
//             <div className="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl sticky top-0 z-10">
//               <h3 className="text-xl font-bold text-purple-700 flex items-center gap-2"><FaInfoCircle className="text-purple-600" /> Comp-off Request Details</h3>
//               <button onClick={() => setIsViewCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors">×</button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-5 space-y-4">
//               <div className="flex justify-center">
//                 <span className={`px-4 py-2 rounded-full text-sm font-semibold ${viewCompOffData.status === "pending" ? "bg-yellow-100 text-yellow-700" : viewCompOffData.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                   Status: {viewCompOffData.status.charAt(0).toUpperCase() + viewCompOffData.status.slice(1)}
//                 </span>
//               </div>

//               <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
//                 <p className="text-xs text-gray-500">Request ID</p>
//                 <p className="text-sm font-medium text-gray-800">{viewCompOffData._id}</p>
//               </div>

//               {viewCompOffData.leaveDetails && (
//                 <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
//                   <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">Leave Details:</p>
//                   <div className="space-y-1.5 text-sm">
//                     <div className="flex justify-between"><span className="text-gray-600">Leave Type:</span><span className="font-medium text-gray-800 capitalize">{viewCompOffData.leaveDetails.leaveType}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Start Date:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.startDate)}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">End Date:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.endDate)}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Total Days:</span><span className="font-medium text-gray-800">{viewCompOffData.leaveDetails.days}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Leave Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${viewCompOffData.leaveDetails.status === "approved" ? "bg-emerald-200 text-emerald-700" : viewCompOffData.leaveDetails.status === "pending" ? "bg-amber-200 text-amber-700" : "bg-rose-200 text-rose-700"}`}>{viewCompOffData.leaveDetails.status}</span></div>
//                   </div>
//                 </div>
//               )}

//               {viewCompOffData.extraDayDetails && (
//                 <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
//                   <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2"><FaExchangeAlt className="text-purple-600" /> Extra Day Details:</p>
//                   <div className="space-y-1.5 text-sm">
//                     <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.day || formatDateDisplay(viewCompOffData.extraDayDetails.date)}</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.totalHours || 8} hrs</span></div>
//                     <div className="flex justify-between"><span className="text-gray-600">Extra Hours:</span><span className="font-medium text-green-600">+{viewCompOffData.extraDayDetails.extraHours || 0} hrs</span></div>
//                   </div>
//                 </div>
//               )}

//               <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
//                 <p className="text-sm font-semibold text-gray-700 mb-2">Reason:</p>
//                 <p className="text-sm text-gray-600">{viewCompOffData.reason}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
//                 <div className="p-2 rounded-lg bg-gray-50"><p>Created At</p><p className="font-medium text-gray-700">{formatDate(viewCompOffData.createdAt)}</p></div>
//                 <div className="p-2 rounded-lg bg-gray-50"><p>Updated At</p><p className="font-medium text-gray-700">{formatDate(viewCompOffData.updatedAt)}</p></div>
//               </div>

//               {viewCompOffData.status === "approved" && viewCompOffData.approvedBy && (
//                 <div className="p-3 rounded-xl bg-green-50 border border-green-200">
//                   <p className="text-xs text-green-600">Approved by: {viewCompOffData.approvedBy}</p>
//                   <p className="text-xs text-green-600">Approved at: {formatDate(viewCompOffData.approvedAt)}</p>
//                 </div>
//               )}

//               {viewCompOffData.status === "rejected" && viewCompOffData.rejectedReason && (
//                 <div className="p-3 rounded-xl bg-red-50 border border-red-200">
//                   <p className="text-xs text-red-600">Rejected Reason: {viewCompOffData.rejectedReason}</p>
//                 </div>
//               )}
//             </div>
//             <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl sticky bottom-0">
//               <button onClick={() => setIsViewCompOffModalOpen(false)} className="w-full py-2.5 text-sm font-semibold text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Comp-off Requests List Modal */}
//       {isCompOffRequestsModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-2xl max-h-[80vh] overflow-auto bg-white rounded-2xl shadow-2xl">
//             <div className="sticky top-0 flex justify-between p-4 bg-white border-b">
//               <div><h3 className="text-lg font-bold text-purple-700">Comp-off Requests</h3><p className="text-xs text-gray-600">Total Requests: {extraDayCompOffRequests.length}</p></div>
//               <button onClick={() => setIsCompOffRequestsModalOpen(false)} className="text-gray-500 text-xl hover:text-gray-700">×</button>
//             </div>
//             <div className="p-4">
//               {extraDayCompOffRequests.length > 0 ? (
//                 extraDayCompOffRequests.map((request, idx) => {
//                   const isExpired = request.status === "approved" && isCompOffExpired(request.workDate);
//                   return (
//                     <div key={request._id || idx} className="p-3 bg-gray-50 rounded-xl border mb-3">
//                       <div className="flex justify-between mb-2">
//                         <span className={`px-2 py-0.5 text-xs rounded-full ${request.status === "pending" ? "bg-yellow-200 text-yellow-700" : request.status === "approved" ? (isExpired ? "bg-gray-400 text-white" : "bg-green-200 text-green-700") : "bg-red-200 text-red-700"}`}>
//                           {request.status === "approved" && isExpired ? "Expired" : request.status}
//                         </span>
//                         <span className="text-xs text-gray-500">{request.createdAt ? formatDate(request.createdAt) : '-'}</span>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-xs">
//                         <div>Date: {request.extraDayDate ? formatDateDisplay(request.extraDayDate) : '-'}</div>
//                         <div>Total Hours: {request.extraDayDetails?.totalHours || '-'} hrs</div>
//                         <div>Extra Hours: +{request.extraDayDetails?.extraHours || '-'} hrs</div>
//                       </div>
//                       {request.reason && (<div className="mt-2 text-xs"><span className="text-gray-500">Reason:</span><p className="mt-0.5 text-gray-700">{request.reason}</p></div>)}
//                     </div>
//                   );
//                 })
//               ) : (<div className="text-center py-8 text-gray-500">No comp-off requests found</div>)}
//             </div>
//             <div className="sticky bottom-0 p-4 bg-white border-t"><button onClick={() => setIsCompOffRequestsModalOpen(false)} className="w-full px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600">Close</button></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeLeaves;




import axios from "axios";
import { useEffect, useState } from "react";
import { FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt, FaEye, FaInfoCircle, FaList, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiFileText, FiXCircle, FiFilter, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  
  // ─── PERSISTED ITEMS PER PAGE ───
  const getSavedItemsPerPage = () => {
    try {
      const saved = localStorage.getItem('employeeLeaves_itemsPerPage');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [5, 10, 20, 50].includes(parsed)) {
          return parsed;
        }
      }
      return 10;
    } catch (e) {
      return 10;
    }
  };

  const [itemsPerPage, setItemsPerPage] = useState(getSavedItemsPerPage);

  useEffect(() => {
    const saved = getSavedItemsPerPage();
    setItemsPerPage(saved);
  }, []);

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

  const [isExtraDayCompOffModalOpen, setIsExtraDayCompOffModalOpen] = useState(false);
  const [submittingExtraDayCompOff, setSubmittingExtraDayCompOff] = useState(false);
  const [selectedExtraDay, setSelectedExtraDay] = useState(null);
  const [extraDayCompOffData, setExtraDayCompOffData] = useState({ reason: "" });

  const [isViewCompOffModalOpen, setIsViewCompOffModalOpen] = useState(false);
  const [viewCompOffData, setViewCompOffData] = useState(null);

  const [extraDaysData, setExtraDaysData] = useState({
    employeeId: "",
    employeeName: "",
    month: "",
    assignedWorkingDays: 0,
    presentDays: 0,
    extraDays: { count: 0, list: [] }
  });
  
  const [isCompOffRequestsModalOpen, setIsCompOffRequestsModalOpen] = useState(false);
  const [extraDayCompOffRequests, setExtraDayCompOffRequests] = useState([]);
  const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
  const [selectedExtraDayForCompOff, setSelectedExtraDayForCompOff] = useState("");
  const [compOffRequestsFromAPI, setCompOffRequestsFromAPI] = useState([]);
  
  const [extraWorkedDays, setExtraWorkedDays] = useState([]);
  const [loadingExtraWorkedDays, setLoadingExtraWorkedDays] = useState(false);
  const [selectedExtraWorkDay, setSelectedExtraWorkDay] = useState(null);
  const [manualCompOffWorkDate, setManualCompOffWorkDate] = useState("");
  const [myCompOffRequests, setMyCompOffRequests] = useState([]);
  const [loadingMyCompOffRequests, setLoadingMyCompOffRequests] = useState(false);

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
    fetchExtraWorkedDays(employeeId);
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
      if (response.data && response.data.success) {
        setExtraDaysData(response.data);
        if (response.data.extraDays && response.data.extraDays.count > 0) {
          fetchExtraDayCompOffRequests(employeeId, month);
        }
      } else {
        setExtraDaysData({
          employeeId, employeeName: "", month,
          assignedWorkingDays: 0, presentDays: 0,
          extraDays: { count: 0, list: [] }
        });
      }
    } catch (error) {
      console.error("Error fetching extra days data:", error);
      setExtraDaysData({
        employeeId, employeeName: "", month,
        assignedWorkingDays: 0, presentDays: 0,
        extraDays: { count: 0, list: [] }
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

  const fetchExtraWorkedDays = async (empId) => {
    try {
      if (!empId) return;
      setLoadingExtraWorkedDays(true);
      const res = await axios.get(`${API_BASE_URL}/leaves/extra-worked-days/${empId}`);
      if (res.data && res.data.success) {
        const days = res.data.extraDays || [];
        setExtraWorkedDays(days);

        setSelectedExtraWorkDay(prev => {
          if (prev) {
            const found = days.find(d => d.date === prev.date);
            return found || prev;
          }
          const firstEligible = days.find(d => (d.status === "available" || d.requestStatus === "available") && !d.isExpired);
          if (firstEligible) {
            setLeaveFormData(f => ({
              ...f,
              startDate: f.startDate || firstEligible.date,
              endDate: f.endDate || firstEligible.date,
              days: 1
            }));
          }
          return firstEligible || null;
        });
      }
    } catch (err) {
      console.error("Error fetching extra worked days:", err);
    } finally {
      setLoadingExtraWorkedDays(false);
    }
  };

  const fetchCompOffRequests = async (empId) => {
    try {
      if (!empId) return;
      setLoadingMyCompOffRequests(true);
      const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/employee/${empId}`);
      const data = response.data;
      const records = data.records || data.requests || (Array.isArray(data) ? data : []);
      setMyCompOffRequests(records);
      setCompOffRequestsFromAPI(records);
    } catch (error) {
      console.error("Error fetching comp-off requests:", error);
    } finally {
      setLoadingMyCompOffRequests(false);
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
        if (employeeId) fetchExtraDaysData(employeeId, month);
      } catch (err) {}
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getApplyBeforeDate = (extraDayDate) => {
    if (!extraDayDate) return "N/A";
    const d = new Date(extraDayDate);
    const expiry = new Date(d.getFullYear(), d.getMonth() + 1, 15);
    return formatDateDisplay(expiry.toISOString());
  };

  const isApplyWindowOpen = (extraDayDate) => {
    if (!extraDayDate) return false;
    const today = new Date();
    const d = new Date(extraDayDate);
    const expiry = new Date(d.getFullYear(), d.getMonth() + 1, 15, 23, 59, 59, 999);
    return today <= expiry;
  };

  const getCompOffStatusForLeave = (leaveId) => {
    if (!leaveId) return { exists: false, status: null, data: null };
    const leaveIdStr = String(leaveId);
    const request = compOffRequestsFromAPI.find(req => {
      const reqLeaveId = req.leaveId ? String(req.leaveId) : '';
      return reqLeaveId === leaveIdStr;
    });
    if (request) return { exists: true, status: request.status, data: request };
    return { exists: false, status: null, data: null };
  };

  const openLeaveCompOffModal = (leave, extraDayDate) => {
    if (!leave || !extraDayDate) { alert("Invalid leave or extra day data"); return; }
    const existingCompOff = getCompOffStatusForLeave(leave._id);
    if (existingCompOff.exists) {
      if (existingCompOff.status === 'pending') { alert('Comp-off request is already pending for this leave!'); return; }
      else if (existingCompOff.status === 'approved') { alert('Comp-off has already been approved for this leave!'); return; }
    }
    const extraDay = extraDaysData.extraDays?.list?.find(d => d.date === extraDayDate);
    if (!extraDay) { alert("Selected extra day not found!"); return; }
    if (!isApplyWindowOpen(extraDay.date, 15)) {
      alert(`You can only apply for comp-off at least 15 days before the extra day (${formatDateDisplay(extraDay.date)}). The deadline was ${getApplyBeforeDate(extraDay.date, 15)}.`);
      return;
    }
    setSelectedExtraDay({
      ...extraDay,
      date: extraDay.date,
      day: extraDay.day || formatDateDisplay(extraDay.date),
      totalHours: extraDay.totalHours || 8,
      extraHours: extraDay.extraHours || 0,
      leave, leaveId: leave._id,
      leaveType: leave.leaveType,
      leaveStartDate: leave.startDate,
      leaveEndDate: leave.endDate,
      leaveDays: leave.days,
      leaveReason: leave.reason,
      leaveStatus: leave.status,
      source: 'leavesTable'
    });
    setExtraDayCompOffData({
      reason: `Requesting comp-off for extra day on ${extraDay.day || formatDateDisplay(extraDay.date)} (${extraDay.totalHours || 8} hours) against ${leave.leaveType} leave (${formatDateDisplay(leave.startDate)} - ${formatDateDisplay(leave.endDate)})`
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
    if (!extraDayCompOffData.reason) { alert("Please provide a reason for comp-off request"); setSubmittingExtraDayCompOff(false); return; }
    if (isDemoMode) { alert("Demo Mode: Comp-off request submitted successfully!"); setIsExtraDayCompOffModalOpen(false); setSubmittingExtraDayCompOff(false); return; }

    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeId = ""; let employeeName = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
      employeeName = employeeData.employeeName || employeeData.name;
    } catch (err) { alert("Employee data error"); setSubmittingExtraDayCompOff(false); return; }

    if (!employeeId) { alert("Employee ID not found"); setSubmittingExtraDayCompOff(false); return; }
    if (!selectedExtraDay || !selectedExtraDay.date) { alert("Extra day data is missing"); setSubmittingExtraDayCompOff(false); return; }

    try {
      const payload = {
        employeeId, employeeName,
        extraDayDate: selectedExtraDay.date,
        extraDayDetails: {
          date: selectedExtraDay.date,
          day: selectedExtraDay.day || formatDateDisplay(selectedExtraDay.date),
          totalHours: selectedExtraDay.totalHours || 8,
          extraHours: selectedExtraDay.extraHours || 0
        },
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
      };
      const response = await axios.post(`${API_BASE_URL}/leaves/requestforcompoffs`, payload);
      if (response.status === 201 || response.data.success) {
        alert("✅ Comp-off request submitted successfully!");
        setIsExtraDayCompOffModalOpen(false);
        setSelectedExtraDay(null);
        setExtraDayCompOffData({ reason: "" });
        await fetchExtraDaysData(employeeId, getCurrentMonth());
        await fetchCompOffRequests(employeeId);
        await fetchLeaves(employeeId);
      } else throw new Error(response.data?.message || "Failed to submit comp-off");
    } catch (error) {
      console.error("Error submitting comp-off:", error);
      alert(error.response?.data?.error || error.response?.data?.message || error.message || "Failed to submit comp-off request");
    } finally {
      setSubmittingExtraDayCompOff(false);
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);
    if (isDemoMode) { alert("Demo Mode: Permission Requested Successfully!"); setIsPermissionModalOpen(false); setPermissionLoading(false); return; }
    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) {}
    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
    const durationNum = parseInt(permissionForm.duration);
    if (!id) { alert("Employee ID not found."); setPermissionLoading(false); return; }
    if (!permissionForm.reason || isNaN(durationNum)) { alert("Please provide a valid reason and duration."); setPermissionLoading(false); return; }
    try {
      const res = await axios.post(`${API_BASE_URL}/permissions/request`, {
        employeeId: id, employeeName: name,
        reason: permissionForm.reason, duration: durationNum,
      });
      if (res.status === 201) {
        alert("Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
      }
    } catch (err) { alert(err.response?.data?.message || err.message); }
    finally { setPermissionLoading(false); }
  };

  const handleOpenLeaveModal = () => {
    setIsLeaveModalOpen(true);
    const rawData = localStorage.getItem("employeeData");
    if (rawData) {
      try {
        const emp = JSON.parse(rawData);
        if (emp?.employeeId) fetchExtraWorkedDays(emp.employeeId);
      } catch (e) {}
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    if (isDemoMode) { alert("Demo Mode: Leave application submitted successfully!"); setIsLeaveModalOpen(false); setSubmittingLeave(false); return; }
    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) {}
    const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;
    if (!id) { alert("Employee details missing."); setSubmittingLeave(false); return; }

    if (leaveFormData.leaveType === "compoff") {
      const workDateToUse = selectedExtraWorkDay?.date || manualCompOffWorkDate;
      if (!workDateToUse) { alert("Please select the extra day worked (on week-off or holiday) for comp-off."); setSubmittingLeave(false); return; }

      const workD = new Date(workDateToUse);
      const expiryDate = new Date(workD.getFullYear(), workD.getMonth() + 1, 15, 23, 59, 59, 999);
      if (new Date() > expiryDate) {
        const expFormatted = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        alert(`❌ Cannot submit comp-off request: Extra work on ${workDateToUse} expired on ${expFormatted}. Comp-off must be requested by the 15th of the following month.`);
        setSubmittingLeave(false);
        return;
      }

      if (!leaveFormData.reason) { alert("Please provide a reason for the comp-off request."); setSubmittingLeave(false); return; }

      try {
        const compOffPayload = {
          employeeId: id, employeeName: name,
          workDate: workDateToUse,
          leaveDate: leaveFormData.startDate || workDateToUse,
          reason: leaveFormData.reason,
          count: leaveFormData.days || 1,
          extraDayDetails: selectedExtraWorkDay || {
            date: workDateToUse,
            day: new Date(workDateToUse).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
            totalHours: 8,
            workType: "Week-off Work"
          }
        };
        const res = await axios.post(`${API_BASE_URL}/leaves/comp-off-requests`, compOffPayload);
        if (res.status === 201 || res.data.success) {
          alert("✅ Comp-off request submitted successfully! Admin has been notified.");
          setIsLeaveModalOpen(false);
          setLeaveFormData({
            employeeId: id, employeeName: name,
            leaveType: "casual", startDate: "", endDate: "", days: 0, reason: "",
          });
          setSelectedExtraWorkDay(null);
          setManualCompOffWorkDate("");
          fetchLeaves(id);
          fetchCompOffRequests(id);
          fetchExtraWorkedDays(id);
          fetchLeaveBalances(id);
        }
      } catch (err) {
        console.error("Error submitting comp-off request:", err);
        alert(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit comp-off request");
      } finally {
        setSubmittingLeave(false);
      }
      return;
    }

    const payload = { ...leaveFormData, employeeId: id, employeeName: name };
    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
      if (response.status === 201) {
        alert("Leave application submitted successfully!");
        setLeaveFormData({
          employeeId: id, employeeName: name,
          leaveType: "casual", startDate: "", endDate: "", days: 0, reason: "",
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

  const handleDateChange = (e) => { setSelectedDate(e.target.value); setSelectedMonth(""); };
  const handleMonthFilterChange = (e) => { setSelectedMonth(e.target.value); setSelectedDate(""); };
  const clearFilters = () => { setSearchTerm(""); setSelectedDate(""); setSelectedMonth(""); };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "leaveType" && value === "compoff") {
        updated.days = 1;
        const rawData = localStorage.getItem("employeeData");
        try {
          const emp = rawData ? JSON.parse(rawData) : null;
          if (emp?.employeeId) fetchExtraWorkedDays(emp.employeeId);
        } catch (err) {}
      }
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

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (page) => { setCurrentPage(page); };

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    try { localStorage.setItem('employeeLeaves_itemsPerPage', String(newValue)); } catch (error) {}
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pageNumbers.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pageNumbers.push("...");
    }
    return pageNumbers;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getCompOffRequestForExtraDay = (extraDayDate) => {
    return extraDayCompOffRequests.find(req => req.extraDayDate === extraDayDate);
  };

  const isCompOffExpired = (workDate) => {
    if (!workDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const workDateObj = new Date(workDate); workDateObj.setHours(0, 0, 0, 0);
    return workDateObj < today;
  };

  const getRequestStatusDisplay = (request) => {
    if (!request) return null;
    if (request.status === "approved") {
      if (isCompOffExpired(request.workDate)) return { text: "Expired", className: "bg-gray-400 text-white" };
      return { text: "Active", className: "bg-green-500 text-white" };
    }
    if (request.status === "pending") return { text: "Pending", className: "bg-yellow-500 text-white" };
    if (request.status === "rejected") return { text: "Rejected", className: "bg-red-500 text-white" };
    return null;
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    const dots = {
      approved: 'bg-green-500', pending: 'bg-yellow-500', rejected: 'bg-red-500'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100'}`}>
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dots[status] || 'bg-gray-500'}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">Loading your leave records...</p>
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

  const hasExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.count > 0 && extraDaysData.extraDays.list.length > 0;
  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter(l => l.status === "approved").length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  const rejectedLeaves = leaves.filter(l => l.status === "rejected").length;
  const compOffApprovedCount = myCompOffRequests.filter(r => r.status === 'approved').length;
  const compOffPendingCount = myCompOffRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="emp-dash">
      <main className="p-4 sm:p-6 lg:p-8">
        {isDemoMode && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-sm font-semibold text-yellow-800">Demo Mode - Showing Sample Data</p>
            <p className="text-xs text-yellow-600">Login to see your actual data</p>
          </div>
        )}

        {/* Header with Compact Filters - Desktop Only */}
        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              My <span>Leaves</span>
            </h1>
          </div>
          
          {/* Right side: Compact Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[140px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <FaCalendarAlt className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[130px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthFilterChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
              />
            </div>

            <button
              onClick={handleOpenLeaveModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaPlus size={10} /> Apply Leave
            </button>

            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FaShieldAlt size={10} /> Permission
            </button>

            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="sm:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            My <span className="text-indigo-600">Leaves</span>
          </h1>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500">
              <strong>{filteredLeaves.length}</strong> leaves
            </span>
          </div>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="sm:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
          </div>

          {showMobileFilters && (
            <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search leaves..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthFilterChange}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleOpenLeaveModal}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FaPlus size={12} /> Apply Leave
                  </button>
                  <button
                    onClick={() => setIsPermissionModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                  >
                    <FaShieldAlt size={12} /> Permission
                  </button>
                </div>
                {(searchTerm || selectedDate || selectedMonth) && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Leaves</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiFileText /></div>
            </div>
            <div className="emp-dash__stat-value">{totalLeaves}</div>
            <div className="emp-dash__stat-meta">all leaves</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Approved</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiCheckCircle /></div>
            </div>
            <div className="emp-dash__stat-value text-green-600">{approvedLeaves}</div>
            <div className="emp-dash__stat-meta">approved leaves</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiClock /></div>
            </div>
            <div className="emp-dash__stat-value text-yellow-600">{pendingLeaves}</div>
            <div className="emp-dash__stat-meta">awaiting approval</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Rejected</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent"><FiXCircle /></div>
            </div>
            <div className="emp-dash__stat-value text-red-600">{rejectedLeaves}</div>
            <div className="emp-dash__stat-meta">rejected leaves</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Comp-off</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaExchangeAlt /></div>
            </div>
            <div className="emp-dash__stat-value text-purple-600">{compOffApprovedCount}</div>
            <div className="emp-dash__stat-meta">Pending: {compOffPendingCount}</div>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__card">
            <div className="emp-dash__card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Casual Leave</span>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-50">
                  <FiFileText className="text-blue-600 text-xs" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-800">{leaveBalances?.casual?.used || 0}</span>
                <span className="text-sm text-gray-400">/ {leaveBalances?.casual?.total || 12}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((leaveBalances?.casual?.used / leaveBalances?.casual?.total) * 100 || 0, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="emp-dash__card">
            <div className="emp-dash__card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Sick Leave</span>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50">
                  <FiXCircle className="text-red-600 text-xs" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-800">{leaveBalances?.sick?.used || 0}</span>
                <span className="text-sm text-gray-400">/ {leaveBalances?.sick?.total || 10}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((leaveBalances?.sick?.used / leaveBalances?.sick?.total) * 100 || 0, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="emp-dash__card">
            <div className="emp-dash__card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Earned Leave</span>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-green-50">
                  <FiCheckCircle className="text-green-600 text-xs" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-800">{leaveBalances?.earned?.used || 0}</span>
                <span className="text-sm text-gray-400">/ {leaveBalances?.earned?.total || 15}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((leaveBalances?.earned?.used / leaveBalances?.earned?.total) * 100 || 0, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="emp-dash__card">
            <div className="emp-dash__card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Public Holidays</span>
                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-purple-50">
                  <FaExchangeAlt className="text-purple-600 text-xs" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-800">{publicHolidays.length}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{publicHolidays.filter(h => h.type === "national").length} National</p>
            </div>
          </div>
        </div>

        {/* Extra Days Details */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header flex-col sm:flex-row gap-3">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FaExchangeAlt className="text-purple-600" /> Extra Days Details
              </h3>
              <p className="emp-dash__card-desc">View your extra working days and comp-off eligibility</p>
            </div>
            <input
              type="month"
              value={extraDaysData.month || getCurrentMonth()}
              onChange={handleMonthChange}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
            />
          </div>

          <div className="emp-dash__card-body">
            <p className="text-center text-sm font-semibold text-gray-700 mb-3">
              {extraDaysData.month ? new Date(extraDaysData.month + "-01").toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : getCurrentMonth()}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center bg-purple-50 rounded-xl py-3 px-1 border border-purple-100">
                <div className="text-2xl font-bold text-purple-700">{extraDaysData.assignedWorkingDays || 0}</div>
                <div className="text-xs text-gray-500">Assigned Days</div>
              </div>
              <div className="text-center bg-orange-50 rounded-xl py-3 px-1 border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{extraDaysData.presentDays || 0}</div>
                <div className="text-xs text-gray-500">Present Days</div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className={`text-sm font-bold rounded-xl py-2 px-4 inline-block ${hasExtraDays ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                {hasExtraDays ? `Extra Days Worked: ${extraDaysData.extraDays.count} day(s)` : `No Extra Days`}
              </div>
            </div>

            {hasExtraDays && (
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">#</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Day</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Total Hours</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Extra Hours</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Apply Before</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {extraDaysData.extraDays.list.map((day, idx) => {
                      const compOffRequest = getCompOffRequestForExtraDay(day.date);
                      const requestStatus = getRequestStatusDisplay(compOffRequest);
                      const applyBeforeDate = getApplyBeforeDate(day.date, 15);
                      const canApply = isApplyWindowOpen(day.date, 15);
                      const dayStatus = day.status || 'active';
                      const statusColors = {
                        active: "bg-green-100 text-green-700 border-green-200",
                        expired: "bg-red-100 text-red-700 border-red-200",
                        used: "bg-blue-100 text-blue-700 border-blue-200"
                      };
                      return (
                        <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                          <td className="px-3 py-2.5 text-center text-sm text-gray-500">{day.sr || idx + 1}</td>
                          <td className="px-3 py-2.5 text-center text-sm text-gray-700">{formatDateDisplay(day.date)}</td>
                          <td className="px-3 py-2.5 text-center text-sm text-gray-700">{day.day || formatDateDisplay(day.date)}</td>
                          <td className="px-3 py-2.5 text-center text-sm text-gray-700">{day.totalHours || 8} hrs</td>
                          <td className="px-3 py-2.5 text-center text-sm text-green-600 font-semibold">+{day.extraHours || 0} hrs</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${canApply ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                              {applyBeforeDate}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {requestStatus ? (
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${requestStatus.className}`}>
                                <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                                  requestStatus.text === "Active" ? "bg-green-500" :
                                  requestStatus.text === "Pending" ? "bg-yellow-500" :
                                  requestStatus.text === "Rejected" ? "bg-red-500" : "bg-gray-500"
                                }`}></span>
                                {requestStatus.text}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[dayStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
            )}
          </div>
        </div>

        {/* My Comp-Off Requests */}
        <div className="emp-dash__card mb-6" style={{ borderColor: "#e9d5ff" }}>
          <div className="emp-dash__card-header flex-col sm:flex-row gap-3" style={{ background: "#faf5ff" }}>
            <div className="flex items-center gap-2">
              <FaExchangeAlt className="text-purple-600" />
              <h3 className="emp-dash__card-title">My Comp-Off Requests</h3>
              <span className="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                {myCompOffRequests.length}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="text-gray-600">Approved: <strong className="text-green-600">{compOffApprovedCount}</strong></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Pending: <strong className="text-yellow-600">{compOffPendingCount}</strong></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Rejected: <strong className="text-red-600">{myCompOffRequests.filter(r => r.status === 'rejected').length}</strong></span>
              <button
                onClick={() => {
                  const raw = localStorage.getItem("employeeData");
                  try {
                    const emp = raw ? JSON.parse(raw) : null;
                    if (emp?.employeeId) {
                      fetchCompOffRequests(emp.employeeId);
                      fetchExtraWorkedDays(emp.employeeId);
                    }
                  } catch (e) {}
                }}
                className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingMyCompOffRequests ? (
              <div className="p-8 text-center text-sm text-gray-500 animate-pulse">Loading comp-off requests...</div>
            ) : myCompOffRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <FaExchangeAlt className="mx-auto text-purple-300 text-3xl mb-2" />
                <p className="font-semibold text-gray-700">No comp-off requests submitted yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Worked on a Sunday or holiday? Click <strong>"Apply Leave"</strong> above and choose <strong>"Comp Off"</strong> to submit a request.
                </p>
              </div>
            ) : (
              <table className="emp-dash__table">
                <thead className="bg-purple-50/50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Extra Work Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Work Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Comp-Off Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Days</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Admin Review</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">Requested On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {myCompOffRequests.map((req, idx) => {
                    const statusColors = {
                      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                      approved: "bg-green-100 text-green-800 border-green-200",
                      rejected: "bg-red-100 text-red-800 border-red-200"
                    };
                    const statusDotColors = {
                      pending: "bg-yellow-500", approved: "bg-green-500", rejected: "bg-red-500"
                    };
                    return (
                      <tr key={req._id || idx} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">
                          {req.workDate ? formatDateDisplay(req.workDate) : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                            {req.extraDayDetails?.workType || "Week-off Work"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">
                          {req.leaveDate ? formatDateDisplay(req.leaveDate) : (req.workDate ? formatDateDisplay(req.workDate) : "-")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {req.count || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="block text-xs text-gray-600 truncate max-w-[160px] mx-auto" title={req.reason}>
                            {req.reason || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}>
                            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${statusDotColors[req.status] || "bg-gray-400"}`}></span>
                            {req.status === "pending" ? "Pending" : req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1)) : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          {req.status === "approved" ? (
                            <div className="text-green-700 font-medium">Approved {req.approvedBy ? `by ${req.approvedBy}` : "by Admin"}</div>
                          ) : req.status === "rejected" ? (
                            <div className="text-red-700">
                              <span className="font-medium">Rejected {req.approvedBy ? `by ${req.approvedBy}` : "by Admin"}</span>
                              {req.rejectionReason && (
                                <p className="text-[11px] text-red-500 mt-0.5 italic max-w-[160px] truncate mx-auto" title={req.rejectionReason}>{req.rejectionReason}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-yellow-700 italic font-medium">Pending Admin Review</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                          {req.createdAt ? formatDateDisplay(req.createdAt) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Leave History Table */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title flex items-center gap-2">
              <FaList className="text-blue-600" /> Leave History
            </h3>
            <div className="text-xs text-gray-500">
              Showing <strong className="text-gray-700">{filteredLeaves.length}</strong> of <strong className="text-gray-700">{leaves.length}</strong> records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved By</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Comp-off</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.length > 0 ? (
                  currentRecords.map((leave) => {
                    const canApplyCompOff = leave.status === "approved";
                    const compOffInfo = getCompOffStatusForLeave(leave._id);
                    const availableExtraDays = extraDaysData.extraDays && extraDaysData.extraDays.list
                      ? extraDaysData.extraDays.list.filter(day => {
                          const compOffRequest = getCompOffRequestForExtraDay(day.date);
                          return !compOffRequest || compOffRequest.status !== "approved";
                        })
                      : [];

                    return (
                      <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 text-xs font-medium capitalize bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{formatDate(leave.startDate)}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{formatDate(leave.endDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            {leave.days}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="block text-sm text-gray-500 truncate max-w-[150px]" title={leave.reason}>{leave.reason}</span>
                        </td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(leave.status)}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">{leave.approvedBy || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {compOffInfo.exists ? (
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              compOffInfo.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                              compOffInfo.status === "approved" ? "bg-green-100 text-green-700 border-green-200" :
                              "bg-red-100 text-red-700 border-red-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                                compOffInfo.status === "pending" ? "bg-yellow-500" :
                                compOffInfo.status === "approved" ? "bg-green-500" : "bg-red-500"
                              }`}></span>
                              {compOffInfo.status.charAt(0).toUpperCase() + compOffInfo.status.slice(1)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not Applied</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {compOffInfo.exists ? (
                            <button
                              onClick={() => openViewCompOffModal(compOffInfo.data)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            >
                              <FaEye size={12} /> View
                            </button>
                          ) : canApplyCompOff && availableExtraDays.length > 0 ? (
                            <div className="flex items-center gap-1.5 justify-center">
                              <select
                                className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                                value={selectedExtraDayForCompOff}
                                onChange={(e) => setSelectedExtraDayForCompOff(e.target.value)}
                              >
                                <option value="">Select Extra Day</option>
                                {availableExtraDays.map((day, idx) => {
                                  const compOffRequest = getCompOffRequestForExtraDay(day.date);
                                  const isPending = compOffRequest && compOffRequest.status === "pending";
                                  const isRejected = compOffRequest && compOffRequest.status === "rejected";
                                  return (
                                    <option key={idx} value={day.date} disabled={isPending}>
                                      {formatDateDisplay(day.date)} - {day.totalHours}hrs
                                      {isPending ? ' (Pending)' : ''}
                                      {isRejected ? ' (Rejected)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                onClick={() => {
                                  if (!selectedExtraDayForCompOff) { alert("Please select an extra day first!"); return; }
                                  openLeaveCompOffModal(leave, selectedExtraDayForCompOff);
                                  setSelectedExtraDayForCompOff("");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                              >
                                <FaExchangeAlt size={12} /> Apply
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-400 text-sm">
                      No leave records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLeaves.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLeaves.length)} of {filteredLeaves.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Previous
                </button>
                {getPageNumbers().map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof page === "number" && handlePageClick(page)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      page === "..." ? 'text-gray-400 cursor-default'
                        : currentPage === page ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================== MODALS ==================== */}

        {/* Apply Leave Modal */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className={`w-full ${leaveFormData.leaveType === "compoff" ? "max-w-lg" : "max-w-md"} bg-white rounded-2xl shadow-2xl p-6 transition-all duration-200 max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {leaveFormData.leaveType === "compoff" ? "Apply for Comp-Off" : "Apply Leave"}
                  </h3>
                  {leaveFormData.leaveType === "compoff" && (
                    <p className="text-xs text-purple-600 font-medium mt-0.5">
                      Claim compensatory leave for working on a week-off or holiday
                    </p>
                  )}
                </div>
                <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 text-2xl hover:text-gray-600 transition-colors">×</button>
              </div>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Leave Type</label>
                  <select
                    name="leaveType"
                    value={leaveFormData.leaveType}
                    onChange={handleLeaveChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                    required
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="compoff">Comp Off (Compensatory Off)</option>
                  </select>
                </div>

                {leaveFormData.leaveType === "compoff" ? (
                  <>
                    <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                      <span className="text-base leading-none">ℹ️</span>
                      <div className="leading-snug">
                        <strong>Comp-Off Validity Rule:</strong> Extra work performed in any month is valid until the <strong>15th of the following month</strong> (e.g. September work is valid till <strong>15th October</strong>). Expired days cannot be claimed.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider">Select Extra Worked Day</label>
                          {extraWorkedDays.length > 0 && (
                            <span className="text-[11px] text-gray-500">
                              (Eligible: <strong className="text-green-600">{extraWorkedDays.filter(d => !d.isExpired && d.status !== 'pending' && d.status !== 'approved' && d.requestStatus !== 'expired').length}</strong>, Expired: <strong className="text-red-500">{extraWorkedDays.filter(d => d.isExpired || d.status === 'expired' || d.requestStatus === 'expired').length}</strong>)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const raw = localStorage.getItem("employeeData");
                            try {
                              const emp = raw ? JSON.parse(raw) : null;
                              if (emp?.employeeId) fetchExtraWorkedDays(emp.employeeId);
                            } catch (e) {}
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:underline flex items-center gap-0.5"
                        >
                          ↻ Refresh
                        </button>
                      </div>

                      {loadingExtraWorkedDays ? (
                        <div className="p-4 text-center text-xs text-gray-500 bg-purple-50 rounded-xl border border-purple-100 animate-pulse">
                          Scanning attendance records for week-off work...
                        </div>
                      ) : extraWorkedDays.length > 0 ? (
                        <div className="max-h-52 overflow-y-auto space-y-2 pr-1 border border-purple-100 rounded-xl p-2 bg-purple-50/20">
                          {extraWorkedDays.map((item, idx) => {
                            const workDateObj = new Date(item.date);
                            const expiryDateObj = new Date(workDateObj.getFullYear(), workDateObj.getMonth() + 1, 15, 23, 59, 59, 999);
                            const isExpired = item.isExpired || item.requestStatus === "expired" || item.status === "expired" || (new Date() > expiryDateObj);
                            const isPending = item.requestStatus === "pending" || item.status === "pending";
                            const isApproved = item.requestStatus === "approved" || item.status === "approved";
                            const isAvailable = !isExpired && !isPending && !isApproved;
                            const isSelected = selectedExtraWorkDay?.date === item.date;
                            const validTillFormatted = item.validTillFormatted || expiryDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedExtraWorkDay(item);
                                    setManualCompOffWorkDate("");
                                    setLeaveFormData(prev => ({ ...prev, startDate: prev.startDate || item.date, endDate: prev.endDate || item.date, days: 1 }));
                                  }
                                }}
                                className={`p-3 rounded-xl border text-xs transition-all ${
                                  isSelected ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/40 shadow-xs"
                                    : isAvailable ? "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40 cursor-pointer shadow-2xs"
                                    : isExpired ? "border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed"
                                    : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="selectedExtraDayRadio"
                                      checked={isSelected}
                                      disabled={!isAvailable}
                                      onChange={() => {
                                        if (isAvailable) {
                                          setSelectedExtraWorkDay(item);
                                          setManualCompOffWorkDate("");
                                          setLeaveFormData(prev => ({ ...prev, startDate: prev.startDate || item.date, endDate: prev.endDate || item.date, days: 1 }));
                                        }
                                      }}
                                      className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                                    />
                                    <span className={`font-semibold ${isExpired ? "text-gray-500 line-through" : "text-gray-800"}`}>
                                      {formatDateDisplay(item.date)}
                                    </span>
                                    <span className="text-gray-500">({new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })})</span>
                                  </div>
                                  {isPending ? (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</span>
                                  ) : isApproved ? (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-green-100 text-green-800 border-green-200">✅ Approved</span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-gray-200 text-gray-700 border-gray-300">⚠️ Expired</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-100 text-emerald-800 border-emerald-200">✨ Eligible</span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-2 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{item.workType || "Week-off Work"}</span>
                                    <span className="text-gray-500">Total: <strong className="text-gray-700">{item.totalHours || 8} hrs</strong></span>
                                  </div>
                                  <div>
                                    {isExpired ? (
                                      <span className="text-red-500 font-medium">Expired on {validTillFormatted}</span>
                                    ) : (
                                      <span className="text-emerald-700 font-medium">Valid till {validTillFormatted}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                          No automated week-off or holiday work detected in recent attendance. You can manually enter the extra day worked below:
                        </div>
                      )}

                      {selectedExtraWorkDay && (
                        <div className="p-2.5 bg-purple-50/90 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            <span><strong>Selected Day:</strong> {formatDateDisplay(selectedExtraWorkDay.date)} ({selectedExtraWorkDay.workType})</span>
                          </div>
                          <span className="text-[11px] font-semibold text-purple-800 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                            Valid till: {selectedExtraWorkDay.validTillFormatted || '15th next month'}
                          </span>
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                          {extraWorkedDays.length > 0 ? "Or enter work date manually (if not listed above):" : "Extra Work Date:"}
                        </label>
                        <input
                          type="date"
                          value={manualCompOffWorkDate}
                          onChange={(e) => {
                            const dVal = e.target.value;
                            setManualCompOffWorkDate(dVal);
                            if (dVal) {
                              const workD = new Date(dVal);
                              const expiryDate = new Date(workD.getFullYear(), workD.getMonth() + 1, 15, 23, 59, 59, 999);
                              if (new Date() > expiryDate) {
                                const expFormatted = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                alert(`⚠️ Notice: Extra work on ${dVal} expired on ${expFormatted} (15th of next month). Comp-off cannot be requested for this date.`);
                              } else {
                                setSelectedExtraWorkDay(null);
                                if (!leaveFormData.startDate) {
                                  setLeaveFormData(prev => ({ ...prev, startDate: dVal, endDate: dVal, days: 1 }));
                                }
                              }
                            }
                          }}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Date to take Leave</label>
                        <input
                          name="startDate"
                          type="date"
                          value={leaveFormData.startDate}
                          onChange={(e) => {
                            setLeaveFormData(prev => ({ ...prev, startDate: e.target.value, endDate: e.target.value, days: 1 }));
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Total Days</label>
                        <input
                          name="days"
                          type="number"
                          value={1}
                          readOnly
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-semibold"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Total Days</label>
                      <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={leaveFormData.reason}
                    onChange={handleLeaveChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    rows="3"
                    placeholder={leaveFormData.leaveType === "compoff" ? "Reason for comp-off (e.g. Worked extra on Sunday)..." : "Reason for leave..."}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 ${
                      leaveFormData.leaveType === "compoff" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submittingLeave ? "Submitting..." : leaveFormData.leaveType === "compoff" ? "Submit Comp-Off" : "Apply"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permission Modal */}
        {isPermissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Request Permission</h3>
                <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-400 text-2xl hover:text-gray-600 transition-colors">×</button>
              </div>
              <form onSubmit={handlePermissionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
                  <textarea required className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white" rows="3" value={permissionForm.reason} onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })} placeholder="Why do you need permission?"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Duration (minutes)</label>
                  <input type="number" required min="1" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white" value={permissionForm.duration} onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })} placeholder="e.g. 30" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={permissionLoading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">{permissionLoading ? "Submitting..." : "Request"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Extra Day Comp-off Request Modal */}
        {isExtraDayCompOffModalOpen && selectedExtraDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
              <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b">
                <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                  <FaExchangeAlt className="text-purple-600" /> Request Comp-off
                </h3>
                <button onClick={() => setIsExtraDayCompOffModalOpen(false)} className="text-gray-400 text-2xl hover:text-gray-600 transition-colors">×</button>
              </div>
              <div className="p-6 space-y-4">
                {selectedExtraDay.leave && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-2">Leave Details:</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium text-gray-800 capitalize">{selectedExtraDay.leave.leaveType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Start:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.startDate)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">End:</span><span className="font-medium text-gray-800">{formatDate(selectedExtraDay.leave.endDate)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Days:</span><span className="font-medium text-gray-800">{selectedExtraDay.leave.days}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Status:</span>{getStatusBadge(selectedExtraDay.leave.status)}</div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <FaExchangeAlt className="text-purple-600" /> Extra Day Details:
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{selectedExtraDay.day || formatDateDisplay(selectedExtraDay.date)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{selectedExtraDay.totalHours || 8} hrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Extra Hours:</span><span className="font-medium text-green-600">+{selectedExtraDay.extraHours || 0} hrs</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Apply Before:</span><span className="font-medium text-blue-600">{getApplyBeforeDate(selectedExtraDay.date, 15)}</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
                  <textarea value={extraDayCompOffData.reason} onChange={(e) => setExtraDayCompOffData({ ...extraDayCompOffData, reason: e.target.value })} rows="4" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white resize-none" placeholder="Please provide reason for comp-off request..." required />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsExtraDayCompOffModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" onClick={handleExtraDayCompOffSubmit} disabled={submittingExtraDayCompOff} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {submittingExtraDayCompOff ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Comp-off Modal */}
        {isViewCompOffModalOpen && viewCompOffData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
              <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b">
                <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                  <FaInfoCircle className="text-purple-600" /> Comp-off Details
                </h3>
                <button onClick={() => setIsViewCompOffModalOpen(false)} className="text-gray-400 text-2xl hover:text-gray-600 transition-colors">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                    viewCompOffData.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                    viewCompOffData.status === "approved" ? "bg-green-100 text-green-700 border-green-200" :
                    "bg-red-100 text-red-700 border-red-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 mr-2 rounded-full ${
                      viewCompOffData.status === "pending" ? "bg-yellow-500" :
                      viewCompOffData.status === "approved" ? "bg-green-500" : "bg-red-500"
                    }`}></span>
                    Status: {viewCompOffData.status.charAt(0).toUpperCase() + viewCompOffData.status.slice(1)}
                  </span>
                </div>

                {viewCompOffData.leaveDetails && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-2">Leave Details:</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium text-gray-800 capitalize">{viewCompOffData.leaveDetails.leaveType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Start:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.startDate)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">End:</span><span className="font-medium text-gray-800">{formatDate(viewCompOffData.leaveDetails.endDate)}</span></div>
                    </div>
                  </div>
                )}

                {viewCompOffData.extraDayDetails && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <p className="text-sm font-semibold text-purple-800 mb-2">Extra Day Details:</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.day || formatDateDisplay(viewCompOffData.extraDayDetails.date)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Total Hours:</span><span className="font-medium text-gray-800">{viewCompOffData.extraDayDetails.totalHours || 8} hrs</span></div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Reason:</p>
                  <p className="text-sm text-gray-600">{viewCompOffData.reason}</p>
                </div>

                {viewCompOffData.status === "rejected" && viewCompOffData.rejectedReason && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600">Rejected Reason: {viewCompOffData.rejectedReason}</p>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 p-4 bg-white border-t">
                <button onClick={() => setIsViewCompOffModalOpen(false)} className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeLeaves;