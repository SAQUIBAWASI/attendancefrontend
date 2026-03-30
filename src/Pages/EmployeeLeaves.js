// import axios from "axios";
// import { useEffect, useState } from "react";
// import EmployeeSidebar from "../Components/EmployeeSidebar";
// import Navbar from "../Components/Navbar";

// const EmployeeLeaves = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Log all localStorage keys and values
//     console.log("✅ LocalStorage contents:");
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
//       const value = localStorage.getItem(key);
//       console.log(`${key}: ${value}`);
//     }

//     // Get employeeData object from localStorage
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setError("❌ Employee data not found in localStorage.");
//       setLoading(false);
//       return;
//     }

//     let employeeId = null;
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
//       console.log("✅ employeeId from localStorage:", employeeId);
//     } catch (err) {
//       console.error("❌ Failed to parse employeeData:", err);
//       setError("❌ Invalid employee data in localStorage.");
//       setLoading(false);
//       return;
//     }

//     if (!employeeId) {
//       setError("❌ Employee ID not found in employeeData.");
//       setLoading(false);
//       return;
//     }

//     const fetchLeaves = async () => {
//       try {
//         const resp = await axios.get(
//           `https://api.timelyhealth.inapi/leaves/employeeleaves/${employeeId}`
//         );

//         if (resp.data && resp.data.success) {
//           setLeaves(resp.data.records);
//         } else {
//           setError("❌ Unexpected API response.");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("❌ Failed to fetch leaves.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaves();
//   }, []);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">{error}</p>;

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <EmployeeSidebar />

//       {/* Main content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//         <Navbar />

//         {/* Page content */}
//         <main className="p-6">
//           <div className="max-w-5xl p-6 mx-auto bg-white rounded shadow-md">
//             <h2 className="mb-4 text-2xl font-bold text-blue-900">My Leave Requests</h2>
//             {leaves.length === 0 ? (
//               <p className="text-gray-500">No leave records found.</p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border">
//                   <thead className="text-gray-700 bg-gray-200">
//                     <tr>
//                       <th className="p-2 border">Leave Type</th>
//                       <th className="p-2 border">Start Date</th>
//                       <th className="p-2 border">End Date</th>
//                       <th className="p-2 border">Days</th>
//                       <th className="p-2 border">Reason</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {leaves.map((leave) => (
//                       <tr key={leave._id} className="border-b hover:bg-gray-50">
//                         <td className="p-2 capitalize border">{leave.leaveType}</td>
//                         <td className="p-2 border">
//                           {new Date(leave.startDate).toLocaleDateString()}
//                         </td>
//                         <td className="p-2 border">
//                           {new Date(leave.endDate).toLocaleDateString()}
//                         </td>
//                         <td className="p-2 border">{leave.days}</td>
//                         <td className="p-2 border">{leave.reason}</td>
//                         <td className="p-2 border">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-semibold ${
//                               leave.status === "approved"
//                                 ? "bg-green-200 text-green-800"
//                                 : leave.status === "rejected"
//                                 ? "bg-red-200 text-red-800"
//                                 : "bg-yellow-200 text-yellow-800"
//                             }`}
//                           >
//                             {leave.status}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default EmployeeLeaves;






// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";


// const EmployeeLeaves = () => {
//   const navigate = useNavigate();
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

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

//   useEffect(() => {
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setError("❌ Employee data not found in localStorage.");
//       setLoading(false);
//       return;
//     }

//     let employeeId = null;
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
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

//     const fetchLeaves = async () => {
//       try {
//         const resp = await axios.get(
//           `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
//         );

//         if (resp.data && resp.data.success) {
//           setLeaves(resp.data.records);
//           setFilteredLeaves(resp.data.records);
//         } else {
//           setError("❌ Unexpected API response.");
//         }
//       } catch (err) {
//         setError("❌ Failed to fetch leaves.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaves();
//   }, []);

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     setSelectedMonth("");

//     if (!date) {
//       setFilteredLeaves(leaves);
//       return;
//     }

//     const filtered = leaves.filter((l) => {
//       const leaveDate = new Date(l.startDate).toISOString().split("T")[0];
//       return leaveDate === date;
//     });

//     setFilteredLeaves(filtered);
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setSelectedDate("");

//     if (!month) {
//       setFilteredLeaves(leaves);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = leaves.filter((l) => {
//       const d = new Date(l.startDate);
//       return (
//         d.getFullYear() === parseInt(year) &&
//         d.getMonth() + 1 === parseInt(monthNum)
//       );
//     });

//     setFilteredLeaves(filtered);
//   };

//   // Handle Form Change & Date Calculation
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

//   // Handle Leave Submit
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
//           employeeId: "",
//           employeeName: "",
//           leaveType: "casual",
//           startDate: "",
//           endDate: "",
//           days: 0,
//           reason: "",
//         });
//         setIsLeaveModalOpen(false);
//         // Refresh leaves list
//         window.location.reload();
//       }
//     } catch (error) {
//       alert(error.response?.data?.message || "❌ Failed to submit leave application.");
//     } finally {
//       setSubmittingLeave(false);
//     }
//   };

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-600">{error}</p>;

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">


//       {/* Page content */}
//       <main className="flex-1 p-4 sm:p-6 lg:p-8">
//         <div className="max-w-6xl p-6 mx-auto bg-white rounded-lg shadow-md">
//           <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
//             <div className="flex items-center gap-4">
//               <h2 className="text-2xl font-bold text-blue-900">
//                 My Leave Requests
//               </h2>
//               <button
//                 onClick={() => setIsLeaveModalOpen(true)}
//                 className="px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700"
//               >
//                 + Apply Leave
//               </button>
//             </div>

//             <div className="flex flex-col items-stretch w-full gap-3 sm:flex-row md:items-center md:w-auto">
//               {/* <button
//                 onClick={() => navigate("/employeedashboard")}
//                 className="w-full px-5 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
//               >
//                 ← Back to Dashboard
//               </button> */}

//               <div className="flex flex-col gap-3 sm:flex-row">
//                 <div className="flex flex-col">
//                   <label className="mb-1 text-sm text-gray-600">
//                     Filter by Date:
//                   </label>
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     onChange={handleDateChange}
//                     className="w-full p-2 border rounded sm:w-auto"
//                   />
//                 </div>

//                 <div className="flex flex-col">
//                   <label className="mb-1 text-sm text-gray-600">
//                     Filter by Month:
//                   </label>
//                   <input
//                     type="month"
//                     value={selectedMonth}
//                     onChange={handleMonthChange}
//                     className="w-full p-2 border rounded sm:w-auto"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {filteredLeaves.length === 0 ? (
//             <p className="text-gray-500">No leave records found.</p>
//           ) : (
//             <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//               <table className="min-w-full">
//                 <thead className="text-sm text-center text-white bg-gradient-to-r from-purple-500 to-blue-600">
//                   <tr>
//                     <th className="px-4 py-2">Leave Type</th>
//                     <th className="px-4 py-2">Start Date</th>
//                     <th className="px-4 py-2">End Date</th>
//                     <th className="px-4 py-2">Days</th>
//                     <th className="px-4 py-2">Reason</th>
//                     <th className="px-4 py-2">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredLeaves.map((leave) => (
//                     <tr
//                       key={leave._id}
//                       className="border-b hover:bg-gray-50"
//                     >
//                       <td className="p-2 capitalize border">{leave.leaveType}</td>
//                       <td className="p-2 border">
//                         {new Date(leave.startDate).toLocaleDateString()}
//                       </td>
//                       <td className="p-2 border">
//                         {new Date(leave.endDate).toLocaleDateString()}
//                       </td>
//                       <td className="p-2 border">{leave.days}</td>
//                       <td className="p-2 border">{leave.reason}</td>
//                       <td className="p-2 border">
//                         <span
//                           className={`px-2 py-1 rounded text-xs font-semibold ${leave.status === "approved"
//                             ? "bg-green-200 text-green-800"
//                             : leave.status === "rejected"
//                               ? "bg-red-200 text-red-800"
//                               : "bg-yellow-200 text-yellow-800"
//                             }`}
//                         >
//                           {leave.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Apply Leave Modal */}
//       {isLeaveModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-bold text-gray-800">Apply for Leave</h3>
//               <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
//             </div>

//             <form onSubmit={handleLeaveSubmit} className="space-y-4">
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">Leave Type</label>
//                 <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required>
//                   <option value="casual">Casual</option>
//                   <option value="sick">Sick</option>
//                   <option value="earned">Earned</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
//                   <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
//                   <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
//                 </div>
//               </div>

//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">Total Days</label>
//                 <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 bg-gray-100 border rounded-lg outline-none" placeholder="0" />
//               </div>

//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">Reason</label>
//                 <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Reason for leave" required></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeLeaves;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import CountUp from "react-countup";
// import { FaCalendarAlt, FaPlus, FaSearch } from "react-icons/fa";
// import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const EmployeeLeaves = () => {
//   const navigate = useNavigate();
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // const naviga= useNavigate();

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

//   useEffect(() => {
//     const employeeDataRaw = localStorage.getItem("employeeData");
//     if (!employeeDataRaw) {
//       setError("❌ Employee data not found in localStorage.");
//       setLoading(false);
//       return;
//     }

//     let employeeId = null;
//     try {
//       const employeeData = JSON.parse(employeeDataRaw);
//       employeeId = employeeData.employeeId;
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

//     const fetchLeaves = async () => {
//       try {
//         const resp = await axios.get(
//           `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
//         );

//         if (resp.data && resp.data.success) {
//           // Sort by startDate descending (newest first)
//           const sortedLeaves = (resp.data.records || []).sort((a, b) =>
//             new Date(b.startDate) - new Date(a.startDate)
//           );
//           setLeaves(sortedLeaves);
//           setFilteredLeaves(sortedLeaves);
//         } else {
//           setError("❌ Unexpected API response.");
//         }
//       } catch (err) {
//         setError("❌ Failed to fetch leaves.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaves();
//   }, []);

//   // Apply filters and search
//   useEffect(() => {
//     let filtered = leaves;

//     // Search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(leave =>
//         leave.leaveType?.toLowerCase().includes(term) ||
//         leave.reason?.toLowerCase().includes(term) ||
//         leave.status?.toLowerCase().includes(term)
//       );
//     }

//     // Date filter
//     if (selectedDate) {
//       filtered = filtered.filter(leave => {
//         const leaveDate = new Date(leave.startDate).toISOString().split("T")[0];
//         return leaveDate === selectedDate;
//       });
//     }

//     // Month filter
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

//   // Handle Form Change & Date Calculation
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

//   // Handle Leave Submit
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
//           employeeId: "",
//           employeeName: "",
//           leaveType: "casual",
//           startDate: "",
//           endDate: "",
//           days: 0,
//           reason: "",
//         });
//         setIsLeaveModalOpen(false);
//         // Refresh leaves list
//         window.location.reload();
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

//   // Stat Card component with Dashboard Style
//   const StatCard = ({ icon: Icon, label, value, color, isPercentage }) => {
//     const themes = {
//       indigo: "border-indigo-500",
//       emerald: "border-emerald-500",
//       amber: "border-amber-500",
//       purple: "border-purple-500",
//       rose: "border-rose-500",
//       cyan: "border-cyan-500",
//     };

//     const currentTheme = themes[color] || themes.indigo;

//     return (
//       <div
//         className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}
//       >
//         <div className="flex items-center gap-2">
//           {typeof Icon === 'string' ? (
//             <span className="text-lg">{Icon}</span>
//           ) : (
//             <Icon className="text-gray-400 text-base flex-shrink-0" />
//           )}
//           <div className="text-sm font-medium text-gray-700">{label}</div>
//         </div>
//         <div className="text-sm font-bold flex items-center">
//           {typeof value === 'number' ? (
//             <CountUp end={value} duration={2} separator="," />
//           ) : (
//             <span className="text-gray-800">{value}</span>
//           )}
//           {isPercentage && "%"}
//         </div>
//       </div>
//     );
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//           <div className="mb-4 text-4xl text-red-500">❌</div>
//           <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             🔄 Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100 font-poppins sm:px-3 sm:py-3 transition-all duration-300">
//       <div className="mx-auto max-w-9xl">

//         {/* Header - Only Title, No Button */}
//         {/* <div className="mb-3">
//           <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">📋 My Leave Requests</h1>
//           <p className="text-xs text-gray-600 sm:text-sm">View and manage your leave applications</p>
//         </div> */}

//         {/* Stats Cards - Dashboard Style */}
//         <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
//           <StatCard
//             label="Total Leaves"
//             value={leaves.length}
//             color="indigo"
//             icon={FiFileText}
//           />
//           <StatCard
//             label="Approved"
//             value={leaves.filter(l => l.status === "approved").length}
//             color="emerald"
//             icon={FiCheckCircle}
//           />
//           <StatCard
//             label="Pending"
//             value={leaves.filter(l => l.status === "pending").length}
//             color="amber"
//             icon={FiClock}
//           />
//           <StatCard
//             label="Rejected"
//             value={leaves.filter(l => l.status === "rejected").length}
//             color="rose"
//             icon={FiXCircle}
//           />
//         </div>

//         {/* Filters Section - With Apply Leave Button Inside */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">

//             {/* Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by type, reason, status..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Date Filter */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={handleDateChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Filter */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Apply Leave Button - Inside Filters */}
//             <button
//               onClick={() => setIsLeaveModalOpen(true)}
//               className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               <FaPlus className="text-xs" /> Apply Leave
//             </button>

//                <button
//               onClick={() => navigate("/mypermissions")}
//               className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               <FaPlus className="text-xs" /> Permissions
//             </button>

//             {/* Clear Filters */}
//             {(searchTerm || selectedDate || selectedMonth) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//           </div>

//           {/* Results Count */}
//           <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
//             <span>
//               Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
//             </span>
//             {filteredLeaves.length !== leaves.length && (
//               <span className="font-semibold text-orange-600">
//                 🔍 Filters applied
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
//           {filteredLeaves.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="mb-4 text-6xl">📭</div>
//               <p className="mb-4 text-lg font-semibold text-gray-600">
//                 {leaves.length === 0 ? "No leave records found." : "No records match your filters."}
//               </p>
//               {leaves.length > 0 && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Leave Type</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Start Date</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">End Date</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Days</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {currentRecords.map((leave, index) => (
//                       <tr
//                         key={leave._id || index}
//                         className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150`}
//                       >
//                         <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                           <span className="px-2 py-1 text-xs font-medium text-gray-700 capitalize bg-gray-100 rounded-full">
//                             {leave.leaveType}
//                           </span>
//                         </td>
//                         <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
//                           {formatDate(leave.startDate)}
//                         </td>
//                         <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
//                           {formatDate(leave.endDate)}
//                         </td>
//                         <td className="px-2 py-1.5 text-center">
//                           <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
//                             {leave.days}
//                           </span>
//                         </td>
//                         <td className="px-2 py-1.5 text-center max-w-[150px]">
//                           <span className="text-xs text-gray-700 truncate block">
//                             {leave.reason}
//                           </span>
//                         </td>
//                         <td className="px-2 py-1.5 text-center">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-semibold ${leave.status === "approved"
//                               ? "bg-green-100 text-green-800 border border-green-300"
//                               : leave.status === "rejected"
//                                 ? "bg-red-100 text-red-800 border border-red-300"
//                                 : "bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse"
//                               }`}
//                           >
//                             {leave.status}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredLeaves.length > 0 && (
//                 <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
//                   <div className="flex flex-wrap items-center gap-4">
//                     <div className="flex items-center gap-2">
//                       <label className="text-xs font-medium text-gray-700">
//                         Show:
//                       </label>
//                       <select
//                         value={itemsPerPage}
//                         onChange={handleItemsPerPageChange}
//                         className="p-1 text-xs border rounded-lg"
//                       >
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={20}>20</option>
//                         <option value={50}>50</option>
//                       </select>
//                       <span className="text-xs text-gray-600">entries</span>
//                     </div>
//                     <div className="text-xs text-gray-600">
//                       Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of{" "}
//                       <strong>{filteredLeaves.length}</strong> records
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                         }`}
//                     >
//                       ← Prev
//                     </button>

//                     {getPageNumbers().map((page, index) => (
//                       <button
//                         key={index}
//                         onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
//                         disabled={page === "..."}
//                         className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${page === "..."
//                           ? "bg-gray-200 text-gray-500 cursor-default"
//                           : currentPage === page
//                             ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
//                             : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                           }`}
//                       >
//                         {page}
//                       </button>
//                     ))}

//                     <button
//                       onClick={handleNextPage}
//                       disabled={currentPage === totalPages}
//                       className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages
//                         ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
//                         }`}
//                     >
//                       Next →
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Apply Leave Modal */}
//       {isLeaveModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Apply for Leave</h3>
//               <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleLeaveSubmit} className="space-y-3">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Leave Type</label>
//                 <select
//                   name="leaveType"
//                   value={leaveFormData.leaveType}
//                   onChange={handleLeaveChange}
//                   className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="casual">Casual Leave</option>
//                   <option value="sick">Sick Leave</option>
//                   <option value="earned">Earned Leave</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
//                   <input
//                     name="startDate"
//                     type="date"
//                     value={leaveFormData.startDate}
//                     onChange={handleLeaveChange}
//                     className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
//                   <input
//                     name="endDate"
//                     type="date"
//                     value={leaveFormData.endDate}
//                     onChange={handleLeaveChange}
//                     className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
//                 <input
//                   name="days"
//                   type="number"
//                   value={leaveFormData.days}
//                   readOnly
//                   className="w-full p-2 text-sm bg-gray-100 border border-gray-300 rounded-lg outline-none"
//                   placeholder="0"
//                 />
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                 <textarea
//                   name="reason"
//                   value={leaveFormData.reason}
//                   onChange={handleLeaveChange}
//                   className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//                   rows="3"
//                   placeholder="Reason for leave"
//                   required
//                 ></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setIsLeaveModalOpen(false)}
//                   className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submittingLeave}
//                   className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {submittingLeave ? "Applying..." : "Apply Leave"}
//                 </button>

//                  <button
//                   type="submit"
//                   disabled={submittingLeave}
//                   className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {submittingLeave ? "Applying..." : "Apply Leave"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeLeaves;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import CountUp from "react-countup";
// import { FaCalendarAlt, FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt } from "react-icons/fa";
// import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const EmployeeLeaves = () => {
//   const navigate = useNavigate();
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

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

//   // ✅ Permission Modal State
//   const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
//   const [submittingPermission, setSubmittingPermission] = useState(false);
//   const [permissionFormData, setPermissionFormData] = useState({
//     employeeId: "",
//     employeeName: "",
//     permissionType: "half_day",
//     date: "",
//     duration: "first_half",
//     reason: "",
//   });

//   // ✅ Comp-off Request Modal State
//   const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
//   const [submittingCompOff, setSubmittingCompOff] = useState(false);
//   const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
//   const [compOffRequestData, setCompOffRequestData] = useState({
//     workDate: "",
//     reason: ""
//   });

//   // ✅ Track which leaves already have comp-off requests
//   const [compOffRequests, setCompOffRequests] = useState([]);
  
//   // ✅ Maximum comp-off requests allowed
//   const MAX_COMP_OFF_REQUESTS = 2;

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

//     setPermissionFormData(prev => ({
//       ...prev,
//       employeeId: employeeId,
//       employeeName: employeeName
//     }));

//     fetchLeaves(employeeId);
//     fetchCompOffRequests(employeeId);
//   }, []);

//   // ✅ Fetch leaves
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

//   // ✅ Fetch employee's comp-off requests
//   const fetchCompOffRequests = async (employeeId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/employee/${employeeId}`);
//       if (response.data && response.data.success) {
//         setCompOffRequests(response.data.records || []);
//       }
//     } catch (error) {
//       console.error("Error fetching comp-off requests:", error);
//     }
//   };

//   // ✅ Check if leave already has pending comp-off request
//   const hasPendingCompOffRequest = (leaveId) => {
//     return compOffRequests.some(req => 
//       req.originalLeaveId === leaveId && req.status === "pending"
//     );
//   };

//   // ✅ Check if leave already has approved comp-off
//   const hasApprovedCompOff = (leaveId) => {
//     return compOffRequests.some(req => 
//       req.originalLeaveId === leaveId && req.status === "approved"
//     );
//   };
  
//   // ✅ Check if employee can request more comp-offs
//   const canRequestCompOff = (employeeId) => {
//     const pendingRequests = compOffRequests.filter(req => 
//       req.employeeId === employeeId && req.status === "pending"
//     ).length;
    
//     const approvedRequests = compOffRequests.filter(req => 
//       req.employeeId === employeeId && req.status === "approved"
//     ).length;
    
//     const totalRequests = pendingRequests + approvedRequests;
    
//     return {
//       allowed: totalRequests < MAX_COMP_OFF_REQUESTS,
//       pending: pendingRequests,
//       approved: approvedRequests,
//       remaining: MAX_COMP_OFF_REQUESTS - totalRequests,
//       total: totalRequests
//     };
//   };

//   // ✅ Open Comp-off Request Modal
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
//       alert(`❌ You have already reached the maximum limit of ${MAX_COMP_OFF_REQUESTS} comp-off request(s).\n\n📊 Current Status:\n• Pending: ${requestStatus.pending}\n• Approved: ${requestStatus.approved}\n• Total: ${requestStatus.total}\n\nPlease wait for existing requests to be processed before submitting new ones.`);
//       return;
//     }
    
//     setSelectedLeaveForCompOff(leave);
//     setCompOffRequestData({
//       workDate: "",
//       reason: `Comp-off request for leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`
//     });
//     setIsCompOffModalOpen(true);
//   };

//   // ✅ Handle Comp-off Request Submit
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
//       alert(`❌ You have reached the maximum limit of ${MAX_COMP_OFF_REQUESTS} comp-off requests.`);
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
//         fetchCompOffRequests(employeeId);
//       }
//     } catch (error) {
//       console.error("Error submitting comp-off:", error);
//       alert(error.response?.data?.error || "❌ Failed to submit comp-off request");
//     } finally {
//       setSubmittingCompOff(false);
//     }
//   };

//   // ✅ Handle Permission Submit
//   const handlePermissionSubmit = async (e) => {
//     e.preventDefault();
//     setSubmittingPermission(true);

//     const rawData = localStorage.getItem("employeeData");
//     let employeeData = null;
//     try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

//     const id = permissionFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
//     const name = permissionFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

//     if (!id) {
//       alert("❌ Employee details missing. Please re-login.");
//       setSubmittingPermission(false);
//       return;
//     }

//     const payload = {
//       ...permissionFormData,
//       employeeId: id,
//       employeeName: name
//     };

//     try {
//       const response = await axios.post(`${API_BASE_URL}/permissions/add-permission`, payload);
//       if (response.status === 201) {
//         alert("✅ Permission application submitted successfully!");
//         setPermissionFormData({
//           employeeId: id,
//           employeeName: name,
//           permissionType: "half_day",
//           date: "",
//           duration: "first_half",
//           reason: "",
//         });
//         setIsPermissionModalOpen(false);
//       }
//     } catch (error) {
//       alert(error.response?.data?.message || "❌ Failed to submit permission application.");
//     } finally {
//       setSubmittingPermission(false);
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

//   const handlePermissionChange = (e) => {
//     const { name, value } = e.target;
//     setPermissionFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
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

//   // Stat Card component
//   const StatCard = ({ icon: Icon, label, value, color }) => {
//     const themes = {
//       indigo: "border-indigo-500",
//       emerald: "border-emerald-500",
//       amber: "border-amber-500",
//       purple: "border-purple-500",
//       rose: "border-rose-500",
//     };
//     const currentTheme = themes[color] || themes.indigo;

//     return (
//       <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
//         <div className="flex items-center gap-2">
//           <Icon className="text-gray-400 text-base flex-shrink-0" />
//           <div className="text-sm font-medium text-gray-700">{label}</div>
//         </div>
//         <div className="text-sm font-bold text-gray-800">
//           <CountUp end={value} duration={2} separator="," />
//         </div>
//       </div>
//     );
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
//   const requestStatus = employeeId ? canRequestCompOff(employeeId) : { remaining: MAX_COMP_OFF_REQUESTS, pending: 0, approved: 0 };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="max-w-md p-8 text-center bg-white border border-red-200 shadow-lg rounded-2xl">
//           <div className="mb-4 text-4xl text-red-500">❌</div>
//           <p className="mb-4 text-lg font-semibold text-red-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-2 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700"
//           >
//             🔄 Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
//       <div className="mx-auto max-w-9xl">
        
//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-5">
//           <StatCard icon={FiFileText} label="Total Leaves" value={leaves.length} color="indigo" />
//           <StatCard icon={FiCheckCircle} label="Approved" value={leaves.filter(l => l.status === "approved").length} color="emerald" />
//           <StatCard icon={FiClock} label="Pending" value={leaves.filter(l => l.status === "pending").length} color="amber" />
//           <StatCard icon={FiXCircle} label="Rejected" value={leaves.filter(l => l.status === "rejected").length} color="rose" />
//           <StatCard icon={FaExchangeAlt} label={`Comp-off (${compOffRequests.filter(r => r.status === "pending").length})`} value={requestStatus.remaining} color="purple" />
//         </div>

//         {/* Filters Section */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by type, reason, status..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={handleDateChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={handleMonthChange}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Apply Leave Button */}
//             <button
//               onClick={() => setIsLeaveModalOpen(true)}
//               className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               <FaPlus className="text-xs" /> Apply Leave
//             </button>

//             {/* ✅ Apply Permission Button */}
//             <button
//               onClick={() => setIsPermissionModalOpen(true)}
//               className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
//             >
//               <FaShieldAlt className="text-xs" /> Apply Permission
//             </button>

//             {(searchTerm || selectedDate || selectedMonth) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//           </div>

//           <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
//             <span>
//               Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
//             </span>
//             {filteredLeaves.length !== leaves.length && (
//               <span className="font-semibold text-orange-600">🔍 Filters applied</span>
//             )}
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
//           {filteredLeaves.length === 0 ? (
//             <div className="py-16 text-center">
//               <div className="mb-4 text-6xl">📭</div>
//               <p className="mb-4 text-lg font-semibold text-gray-600">
//                 {leaves.length === 0 ? "No leave records found." : "No records match your filters."}
//               </p>
//               {leaves.length > 0 && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//                 >
//                   🔄 Clear Filters
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Leave Type</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Start Date</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">End Date</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Days</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
//                       <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Comp-off</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {currentRecords.map((leave, index) => {
//                       const hasPending = hasPendingCompOffRequest(leave._id);
//                       const hasApproved = hasApprovedCompOff(leave._id);
                      
//                       return (
//                         <tr
//                           key={leave._id || index}
//                           className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150 ${hasApproved ? 'bg-purple-50' : ''}`}
//                         >
//                           <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
//                             <span className="px-2 py-1 text-xs font-medium text-gray-700 capitalize bg-gray-100 rounded-full">
//                               {leave.leaveType}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
//                             {formatDate(leave.startDate)}
//                           </td>
//                           <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
//                             {formatDate(leave.endDate)}
//                           </td>
//                           <td className="px-2 py-1.5 text-center">
//                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasApproved ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-800'}`}>
//                               {leave.days}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center max-w-[150px]">
//                             <span className="block text-xs text-gray-700 truncate">
//                               {leave.reason}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                 leave.status === "approved"
//                                   ? "bg-green-100 text-green-800 border border-green-300"
//                                   : leave.status === "rejected"
//                                   ? "bg-red-100 text-red-800 border border-red-300"
//                                   : "bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse"
//                               }`}
//                             >
//                               {leave.status}
//                             </span>
//                           </td>
//                           <td className="px-2 py-1.5 text-center">
//                             {leave.status === "approved" ? (
//                               hasApproved ? (
//                                 <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
//                                   ✅ Converted
//                                 </span>
//                               ) : hasPending ? (
//                                 <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
//                                   ⏳ Requested
//                                 </span>
//                               ) : (
//                                 <button
//                                   onClick={() => openCompOffRequestModal(leave)}
//                                   disabled={!requestStatus.allowed}
//                                   className={`flex items-center gap-1 px-2 py-1 mx-auto text-xs text-white transition rounded-md ${
//                                     requestStatus.allowed 
//                                       ? "bg-purple-500 hover:bg-purple-600" 
//                                       : "bg-gray-400 cursor-not-allowed"
//                                   }`}
//                                   title={!requestStatus.allowed ? `Maximum ${MAX_COMP_OFF_REQUESTS} comp-off requests reached` : "Request comp-off for this leave"}
//                                 >
//                                   <FaExchangeAlt size={10} /> Request Comp-off
//                                 </button>
//                               )
//                             ) : (
//                               <span className="text-xs text-gray-400">-</span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredLeaves.length > 0 && (
//                 <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
//                   <div className="flex flex-wrap items-center gap-4">
//                     <div className="flex items-center gap-2">
//                       <label className="text-xs font-medium text-gray-700">Show:</label>
//                       <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded-lg">
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={20}>20</option>
//                         <option value={50}>50</option>
//                       </select>
//                       <span className="text-xs text-gray-600">entries</span>
//                     </div>
//                     <div className="text-xs text-gray-600">
//                       Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of{" "}
//                       <strong>{filteredLeaves.length}</strong> records
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-1">
//                     <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}>← Prev</button>
//                     {getPageNumbers().map((page, index) => (
//                       <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${page === "..." ? "bg-gray-200 text-gray-500 cursor-default" : currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>{page}</button>
//                     ))}
//                     <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}>Next →</button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Apply Leave Modal */}
//       {isLeaveModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Apply for Leave</h3>
//               <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleLeaveSubmit} className="space-y-3">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Leave Type</label>
//                 <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required>
//                   <option value="casual">Casual Leave</option>
//                   <option value="sick">Sick Leave</option>
//                   <option value="earned">Earned Leave</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
//                   <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
//                 </div>
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
//                   <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
//                 </div>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
//                 <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 text-sm bg-gray-100 border border-gray-300 rounded-lg outline-none" placeholder="0" />
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                 <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Reason for leave" required></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ Apply Permission Modal */}
//       {isPermissionModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//           <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Apply for Permission</h3>
//               <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handlePermissionSubmit} className="space-y-3">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Permission Type</label>
//                 <select name="permissionType" value={permissionFormData.permissionType} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" required>
//                   <option value="half_day">Half Day Permission</option>
//                   <option value="full_day">Full Day Permission</option>
//                   <option value="hourly">Hourly Permission</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Date</label>
//                 <input name="date" type="date" value={permissionFormData.date} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" required />
//               </div>

//               {permissionFormData.permissionType === "half_day" && (
//                 <div>
//                   <label className="block mb-1 text-xs font-medium text-gray-700">Duration</label>
//                   <select name="duration" value={permissionFormData.duration} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500">
//                     <option value="first_half">First Half</option>
//                     <option value="second_half">Second Half</option>
//                   </select>
//                 </div>
//               )}

//               {permissionFormData.permissionType === "hourly" && (
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block mb-1 text-xs font-medium text-gray-700">Start Time</label>
//                     <input name="startTime" type="time" value={permissionFormData.startTime || ""} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
//                   </div>
//                   <div>
//                     <label className="block mb-1 text-xs font-medium text-gray-700">End Time</label>
//                     <input name="endTime" type="time" value={permissionFormData.endTime || ""} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
//                 <textarea name="reason" value={permissionFormData.reason} onChange={handlePermissionChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" rows="3" placeholder="Reason for permission" required></textarea>
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button type="button" onClick={() => setIsPermissionModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button type="submit" disabled={submittingPermission} className="flex-1 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">{submittingPermission ? "Applying..." : "Apply Permission"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ✅ Comp-off Request Modal */}
//       {isCompOffModalOpen && selectedLeaveForCompOff && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-base font-semibold text-purple-700">Request Comp-off</h3>
//               <button onClick={() => setIsCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>

//             <div className="p-2 mb-3 rounded-md bg-blue-50">
//               <p className="text-xs text-gray-500">Leave Details</p>
//               <p className="text-sm font-medium">{selectedLeaveForCompOff.leaveType} Leave</p>
//               <p className="text-[11px] text-gray-400">{formatDate(selectedLeaveForCompOff.startDate)} - {formatDate(selectedLeaveForCompOff.endDate)}</p>
//             </div>

//             <div className="p-2 mb-3 rounded-md bg-orange-50">
//               <p className="text-[11px] text-orange-700 leading-snug">
//                 <strong>Limit:</strong> Max {MAX_COMP_OFF_REQUESTS} | Used {requestStatus.total}<br />
//                 Remaining: {requestStatus.remaining}
//               </p>
//             </div>

//             <form onSubmit={handleCompOffRequestSubmit} className="space-y-2">
//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-600">Work Date *</label>
//                 <input name="workDate" type="date" value={compOffRequestData.workDate} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, workDate: e.target.value })} className="w-full p-2 text-xs border rounded-md focus:ring-1 focus:ring-purple-500" required />
//               </div>

//               <div>
//                 <label className="block mb-1 text-xs font-medium text-gray-600">Reason</label>
//                 <textarea name="reason" value={compOffRequestData.reason} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, reason: e.target.value })} rows="2" className="w-full p-2 text-xs border rounded-md focus:ring-1 focus:ring-purple-500" placeholder="Optional..."></textarea>
//               </div>

//               <div className="p-2 rounded-md bg-purple-50">
//                 <p className="text-[11px] text-purple-700">Approval required before conversion to comp-off.</p>
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button type="button" onClick={() => setIsCompOffModalOpen(false)} className="flex-1 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
//                 <button type="submit" disabled={submittingCompOff} className="flex-1 py-1.5 text-xs text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">{submittingCompOff ? "Submitting..." : "Submit"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeLeaves;


import axios from "axios";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaCalendarAlt, FaExchangeAlt, FaPlus, FaSearch, FaShieldAlt } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiFileText, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal & Form State
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

  // ✅ Permission Modal State (Same as EmployeePermissions)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({ reason: "", duration: "" });
  const [permissionLoading, setPermissionLoading] = useState(false);

  // ✅ Comp-off Request Modal State
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [submittingCompOff, setSubmittingCompOff] = useState(false);
  const [selectedLeaveForCompOff, setSelectedLeaveForCompOff] = useState(null);
  const [compOffRequestData, setCompOffRequestData] = useState({
    workDate: "",
    reason: ""
  });

  // ✅ Track which leaves already have comp-off requests
  const [compOffRequests, setCompOffRequests] = useState([]);
  
  // ✅ Maximum comp-off requests allowed
  const MAX_COMP_OFF_REQUESTS = 2;

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
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
      setError("❌ Invalid employee data in localStorage.");
      setLoading(false);
      return;
    }

    if (!employeeId) {
      setError("❌ Employee ID not found in employeeData.");
      setLoading(false);
      return;
    }

    setLeaveFormData(prev => ({
      ...prev,
      employeeId: employeeId,
      employeeName: employeeName
    }));

    fetchLeaves(employeeId);
    fetchCompOffRequests(employeeId);
  }, []);

  // ✅ Fetch leaves
  const fetchLeaves = async (employeeId) => {
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
      );

      if (resp.data && resp.data.success) {
        const sortedLeaves = (resp.data.records || []).sort((a, b) => 
          new Date(b.startDate) - new Date(a.startDate)
        );
        setLeaves(sortedLeaves);
        setFilteredLeaves(sortedLeaves);
      } else {
        setError("❌ Unexpected API response.");
      }
    } catch (err) {
      setError("❌ Failed to fetch leaves.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch employee's comp-off requests
  const fetchCompOffRequests = async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves/comp-off-requests/employee/${employeeId}`);
      if (response.data && response.data.success) {
        setCompOffRequests(response.data.records || []);
      }
    } catch (error) {
      console.error("Error fetching comp-off requests:", error);
    }
  };

  // ✅ Check if leave already has pending comp-off request
  const hasPendingCompOffRequest = (leaveId) => {
    return compOffRequests.some(req => 
      req.originalLeaveId === leaveId && req.status === "pending"
    );
  };

  // ✅ Check if leave already has approved comp-off
  const hasApprovedCompOff = (leaveId) => {
    return compOffRequests.some(req => 
      req.originalLeaveId === leaveId && req.status === "approved"
    );
  };
  
  // ✅ Check if employee can request more comp-offs
  const canRequestCompOff = (employeeId) => {
    const pendingRequests = compOffRequests.filter(req => 
      req.employeeId === employeeId && req.status === "pending"
    ).length;
    
    const approvedRequests = compOffRequests.filter(req => 
      req.employeeId === employeeId && req.status === "approved"
    ).length;
    
    const totalRequests = pendingRequests + approvedRequests;
    
    return {
      allowed: totalRequests < MAX_COMP_OFF_REQUESTS,
      pending: pendingRequests,
      approved: approvedRequests,
      remaining: MAX_COMP_OFF_REQUESTS - totalRequests,
      total: totalRequests
    };
  };

  // ✅ Open Comp-off Request Modal
  const openCompOffRequestModal = (leave) => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeId = "";
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
    } catch (err) {
      alert("❌ Employee data error");
      return;
    }
    
    const requestStatus = canRequestCompOff(employeeId);
    
    if (!requestStatus.allowed) {
      alert(`❌ You have already reached the maximum limit of ${MAX_COMP_OFF_REQUESTS} comp-off request(s).\n\n📊 Current Status:\n• Pending: ${requestStatus.pending}\n• Approved: ${requestStatus.approved}\n• Total: ${requestStatus.total}\n\nPlease wait for existing requests to be processed before submitting new ones.`);
      return;
    }
    
    setSelectedLeaveForCompOff(leave);
    setCompOffRequestData({
      workDate: "",
      reason: `Comp-off request for leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`
    });
    setIsCompOffModalOpen(true);
  };

  // ✅ Handle Comp-off Request Submit
  const handleCompOffRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCompOff(true);

    if (!compOffRequestData.workDate) {
      alert("❌ Please select work date");
      setSubmittingCompOff(false);
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
      alert("❌ Employee data error");
      setSubmittingCompOff(false);
      return;
    }
    
    const requestStatus = canRequestCompOff(employeeId);
    if (!requestStatus.allowed) {
      alert(`❌ You have reached the maximum limit of ${MAX_COMP_OFF_REQUESTS} comp-off requests.`);
      setIsCompOffModalOpen(false);
      setSubmittingCompOff(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/comp-off-requests`, {
        employeeId: employeeId,
        employeeName: employeeName,
        originalLeaveId: selectedLeaveForCompOff._id,
        workDate: compOffRequestData.workDate,
        reason: compOffRequestData.reason,
        status: "pending"
      });

      if (response.status === 201) {
        alert("✅ Comp-off request submitted successfully!");
        setIsCompOffModalOpen(false);
        setSelectedLeaveForCompOff(null);
        fetchCompOffRequests(employeeId);
      }
    } catch (error) {
      console.error("Error submitting comp-off:", error);
      alert(error.response?.data?.error || "❌ Failed to submit comp-off request");
    } finally {
      setSubmittingCompOff(false);
    }
  };

  // ✅ Handle Permission Submit (Same as EmployeePermissions)
  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setPermissionLoading(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try {
      if (rawData) employeeData = JSON.parse(rawData);
    } catch (e) { }

    const id = employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = employeeData?.name || localStorage.getItem("employeeName") || "Employee";
    const durationNum = parseInt(permissionForm.duration);

    if (!id) {
      alert("❌ Employee ID not found. Please log out and log in again.");
      setPermissionLoading(false);
      return;
    }
    if (!permissionForm.reason || isNaN(durationNum)) {
      alert("❌ Please provide a valid reason and duration.");
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
        alert("✅ Permission Requested Successfully!");
        setIsPermissionModalOpen(false);
        setPermissionForm({ reason: "", duration: "" });
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setPermissionLoading(false);
    }
  };

  // Apply filters and search
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
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
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

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);

    const rawData = localStorage.getItem("employeeData");
    let employeeData = null;
    try { if (rawData) employeeData = JSON.parse(rawData); } catch (e) { }

    const id = leaveFormData.employeeId || employeeData?.employeeId || localStorage.getItem("employeeId");
    const name = leaveFormData.employeeName || employeeData?.name || localStorage.getItem("employeeName") || employeeData?.employeeName;

    if (!id) {
      alert("❌ Employee details missing. Please re-login.");
      setSubmittingLeave(false);
      return;
    }

    const payload = {
      ...leaveFormData,
      employeeId: id,
      employeeName: name
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/leaves/add-leave`, payload);
      if (response.status === 201) {
        alert("✅ Leave application submitted successfully!");
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
      alert(error.response?.data?.message || "❌ Failed to submit leave application.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Pagination logic
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

  // Stat Card component
  const StatCard = ({ icon: Icon, label, value, color }) => {
    const themes = {
      indigo: "border-indigo-500",
      emerald: "border-emerald-500",
      amber: "border-amber-500",
      purple: "border-purple-500",
      rose: "border-rose-500",
    };
    const currentTheme = themes[color] || themes.indigo;

    return (
      <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="text-gray-400 text-base flex-shrink-0" />
          <div className="text-sm font-medium text-gray-700">{label}</div>
        </div>
        <div className="text-sm font-bold text-gray-800">
          <CountUp end={value} duration={2} separator="," />
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getCurrentEmployeeId = () => {
    try {
      const employeeDataRaw = localStorage.getItem("employeeData");
      if (employeeDataRaw) {
        const employeeData = JSON.parse(employeeDataRaw);
        return employeeData.employeeId;
      }
    } catch(e) {}
    return null;
  };
  
  const employeeId = getCurrentEmployeeId();
  const requestStatus = employeeId ? canRequestCompOff(employeeId) : { remaining: MAX_COMP_OFF_REQUESTS, pending: 0, approved: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
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
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-5">
          <StatCard icon={FiFileText} label="Total Leaves" value={leaves.length} color="indigo" />
          <StatCard icon={FiCheckCircle} label="Approved" value={leaves.filter(l => l.status === "approved").length} color="emerald" />
          <StatCard icon={FiClock} label="Pending" value={leaves.filter(l => l.status === "pending").length} color="amber" />
          <StatCard icon={FiXCircle} label="Rejected" value={leaves.filter(l => l.status === "rejected").length} color="rose" />
          <StatCard icon={FaExchangeAlt} label={`Comp-off (${compOffRequests.filter(r => r.status === "pending").length})`} value={requestStatus.remaining} color="purple" />
        </div>

        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by type, reason, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Apply Leave Button */}
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaPlus className="text-xs" /> Apply Leave
            </button>

            {/* ✅ Apply Permission Button - Same as EmployeePermissions */}
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              <FaShieldAlt className="text-xs" /> Apply Permission
            </button>

            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
            </span>
            {filteredLeaves.length !== leaves.length && (
              <span className="font-semibold text-orange-600">🔍 Filters applied</span>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredLeaves.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">📭</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
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
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white sm:text-sm bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Leave Type</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Start Date</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">End Date</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Days</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Reason</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Status</th>
                      <th className="px-2 py-1.5 text-center sm:px-3 sm:py-2">Comp-off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.map((leave, index) => {
                      const hasPending = hasPendingCompOffRequest(leave._id);
                      const hasApproved = hasApprovedCompOff(leave._id);
                      
                      return (
                        <tr
                          key={leave._id || index}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150 ${hasApproved ? 'bg-purple-50' : ''}`}
                        >
                          <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                            <span className="px-2 py-1 text-xs font-medium text-gray-700 capitalize bg-gray-100 rounded-full">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
                            {formatDate(leave.startDate)}
                          </td>
                          <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
                            {formatDate(leave.endDate)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasApproved ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-800'}`}>
                              {leave.days}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-center max-w-[150px]">
                            <span className="block text-xs text-gray-700 truncate">
                              {leave.reason}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                leave.status === "approved"
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : leave.status === "rejected"
                                  ? "bg-red-100 text-red-800 border border-red-300"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse"
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {leave.status === "approved" ? (
                              hasApproved ? (
                                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                  ✅ Converted
                                </span>
                              ) : hasPending ? (
                                <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                                  ⏳ Requested
                                </span>
                              ) : (
                                <button
                                  onClick={() => openCompOffRequestModal(leave)}
                                  disabled={!requestStatus.allowed}
                                  className={`flex items-center gap-1 px-2 py-1 mx-auto text-xs text-white transition rounded-md ${
                                    requestStatus.allowed 
                                      ? "bg-purple-500 hover:bg-purple-600" 
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                  title={!requestStatus.allowed ? `Maximum ${MAX_COMP_OFF_REQUESTS} comp-off requests reached` : "Request comp-off for this leave"}
                                >
                                  <FaExchangeAlt size={10} /> Request Comp-off
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLeaves.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">Show:</label>
                      <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 text-xs border rounded-lg">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of{" "}
                      <strong>{filteredLeaves.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}>← Prev</button>
                    {getPageNumbers().map((page, index) => (
                      <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${page === "..." ? "bg-gray-200 text-gray-500 cursor-default" : currentPage === page ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>{page}</button>
                    ))}
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}>Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Apply for Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Leave Type</label>
                <select name="leaveType" value={leaveFormData.leaveType} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
                  <input name="startDate" type="date" value={leaveFormData.startDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
                  <input name="endDate" type="date" value={leaveFormData.endDate} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
                <input name="days" type="number" value={leaveFormData.days} readOnly className="w-full p-2 text-sm bg-gray-100 border border-gray-300 rounded-lg outline-none" placeholder="0" />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea name="reason" value={leaveFormData.reason} onChange={handleLeaveChange} className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Reason for leave" required></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={submittingLeave} className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{submittingLeave ? "Applying..." : "Apply Leave"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Apply Permission Modal - Same as EmployeePermissions */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Request Permission</h3>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePermissionSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea
                  required
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  value={permissionForm.reason}
                  onChange={(e) => setPermissionForm({ ...permissionForm, reason: e.target.value })}
                  placeholder="Why do you need permission?"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  value={permissionForm.duration}
                  onChange={(e) => setPermissionForm({ ...permissionForm, duration: e.target.value })}
                  placeholder="e.g. 30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={permissionLoading}
                  className="flex-1 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {permissionLoading ? "Submitting..." : "Request Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Comp-off Request Modal */}
      {isCompOffModalOpen && selectedLeaveForCompOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-purple-700">Request Comp-off</h3>
              <button onClick={() => setIsCompOffModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-2 mb-3 rounded-md bg-blue-50">
              <p className="text-xs text-gray-500">Leave Details</p>
              <p className="text-sm font-medium">{selectedLeaveForCompOff.leaveType} Leave</p>
              <p className="text-[11px] text-gray-400">{formatDate(selectedLeaveForCompOff.startDate)} - {formatDate(selectedLeaveForCompOff.endDate)}</p>
            </div>

            <div className="p-2 mb-3 rounded-md bg-orange-50">
              <p className="text-[11px] text-orange-700 leading-snug">
                <strong>Limit:</strong> Max {MAX_COMP_OFF_REQUESTS} | Used {requestStatus.total}<br />
                Remaining: {requestStatus.remaining}
              </p>
            </div>

            <form onSubmit={handleCompOffRequestSubmit} className="space-y-2">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600">Work Date *</label>
                <input name="workDate" type="date" value={compOffRequestData.workDate} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, workDate: e.target.value })} className="w-full p-2 text-xs border rounded-md focus:ring-1 focus:ring-purple-500" required />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-600">Reason</label>
                <textarea name="reason" value={compOffRequestData.reason} onChange={(e) => setCompOffRequestData({ ...compOffRequestData, reason: e.target.value })} rows="2" className="w-full p-2 text-xs border rounded-md focus:ring-1 focus:ring-purple-500" placeholder="Optional..."></textarea>
              </div>

              <div className="p-2 rounded-md bg-purple-50">
                <p className="text-[11px] text-purple-700">Approval required before conversion to comp-off.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsCompOffModalOpen(false)} className="flex-1 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={submittingCompOff} className="flex-1 py-1.5 text-xs text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">{submittingCompOff ? "Submitting..." : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;

