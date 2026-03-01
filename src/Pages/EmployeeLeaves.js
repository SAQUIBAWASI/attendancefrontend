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
//                 <thead className="text-sm text-left text-white bg-gradient-to-r from-purple-500 to-blue-600">
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


import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaPlus, FaSearch } from "react-icons/fa";
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

  useEffect(() => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    if (!employeeDataRaw) {
      setError("❌ Employee data not found in localStorage.");
      setLoading(false);
      return;
    }

    let employeeId = null;
    try {
      const employeeData = JSON.parse(employeeDataRaw);
      employeeId = employeeData.employeeId;
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

    const fetchLeaves = async () => {
      try {
        const resp = await axios.get(
          `${API_BASE_URL}/leaves/employeeleaves/${employeeId}`
        );

        if (resp.data && resp.data.success) {
          // Sort by startDate descending (newest first)
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

    fetchLeaves();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = leaves;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.leaveType?.toLowerCase().includes(term) ||
        leave.reason?.toLowerCase().includes(term) ||
        leave.status?.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(leave => {
        const leaveDate = new Date(leave.startDate).toISOString().split("T")[0];
        return leaveDate === selectedDate;
      });
    }

    // Month filter
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

  // Handle Form Change & Date Calculation
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

  // Handle Leave Submit
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
          employeeId: "",
          employeeName: "",
          leaveType: "casual",
          startDate: "",
          endDate: "",
          days: 0,
          reason: "",
        });
        setIsLeaveModalOpen(false);
        // Refresh leaves list
        window.location.reload();
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
  const StatCard = ({ label, value, color }) => {
    return (
      <div className="overflow-hidden bg-white shadow-sm rounded-xl">
        <div className={`h-1 ${color}`}></div>
        <div className="p-3 text-center sm:p-4">
          <div className="text-base font-bold sm:text-lg">{value}</div>
          <div className="text-[10px] font-medium text-gray-700 sm:text-xs">{label}</div>
        </div>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your leave records...</p>
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
        
        {/* Header - Only Title, No Button */}
        {/* <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">📋 My Leave Requests</h1>
          <p className="text-xs text-gray-600 sm:text-sm">View and manage your leave applications</p>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
          <StatCard
            label={`Total Leaves: ${leaves.length}`}
            // value={leaves.length}
            color="bg-blue-500"
          />
          <StatCard
            label={`Approved: ${leaves.filter(l => l.status === "approved").length}`}
            // value={leaves.filter(l => l.status === "approved").length}
            color="bg-green-500"
          />
          <StatCard
            label={`Pending: ${leaves.filter(l => l.status === "pending").length}`}
            // value={leaves.filter(l => l.status === "pending").length}
            color="bg-yellow-500"
          />
          <StatCard
            label={`Rejected: ${leaves.filter(l => l.status === "rejected").length}`}
            // value={leaves.filter(l => l.status === "rejected").length}
            color="bg-red-500"
          />
        </div>

        {/* Filters Section - With Apply Leave Button Inside */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search */}
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

            {/* Date Filter */}
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

            {/* Month Filter */}
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

            {/* Apply Leave Button - Inside Filters */}
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaPlus className="text-xs" /> Apply Leave
            </button>

            {/* Clear Filters */}
            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredLeaves.length}</strong> of <strong>{leaves.length}</strong> records
            </span>
            {filteredLeaves.length !== leaves.length && (
              <span className="font-semibold text-orange-600">
                🔍 Filters applied
              </span>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.map((leave, index) => (
                      <tr
                        key={leave._id || index}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150`}
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
                          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                            {leave.days}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center max-w-[150px]">
                          <span className="text-xs text-gray-700 truncate block">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLeaves.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
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
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeaves.length)}</strong> of{" "}
                      <strong>{filteredLeaves.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      }`}
                    >
                      ← Prev
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${
                          page === "..."
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
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                      }`}
                    >
                      Next →
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
                <select 
                  name="leaveType" 
                  value={leaveFormData.leaveType} 
                  onChange={handleLeaveChange} 
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Start Date</label>
                  <input 
                    name="startDate" 
                    type="date" 
                    value={leaveFormData.startDate} 
                    onChange={handleLeaveChange} 
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">End Date</label>
                  <input 
                    name="endDate" 
                    type="date" 
                    value={leaveFormData.endDate} 
                    onChange={handleLeaveChange} 
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Total Days</label>
                <input 
                  name="days" 
                  type="number" 
                  value={leaveFormData.days} 
                  readOnly 
                  className="w-full p-2 text-sm bg-gray-100 border border-gray-300 rounded-lg outline-none" 
                  placeholder="0" 
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Reason</label>
                <textarea 
                  name="reason" 
                  value={leaveFormData.reason} 
                  onChange={handleLeaveChange} 
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" 
                  placeholder="Reason for leave" 
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)} 
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingLeave} 
                  className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingLeave ? "Applying..." : "Apply Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaves;

