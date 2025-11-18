// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [employeeSummary, setEmployeeSummary] = useState([]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         const sortedRecords = (data.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sortedRecords);
//         setFilteredRecords(sortedRecords);
//         generateSummary(sortedRecords); // ✅ Generate summary after fetch
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);

//   // ✅ Generate Employee Summary Logic
//   const generateSummary = (data) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;
//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           employeeEmail: rec.employeeEmail,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//         };
//       }

//       const emp = summaryMap[id];
//       emp.totalDays += 1;

//       // Present: if checkInTime exists
//       if (rec.checkInTime) emp.presentDays += 1;

//       // Late: after 10:00 AM
//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) {
//         emp.lateDays += 1;
//       }

//       // Onsite
//       if (rec.onsite) emp.onsiteDays += 1;

//       // ✅ Calculate Working Hours (if checkOutTime exists)
//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const diffMs = checkOut - checkIn;
//         const diffHours = diffMs / (1000 * 60 * 60);

//         if (diffHours < 4) {
//           emp.fullDayLeaves += 1; // less than 4 hrs → full day leave
//         } else if (diffHours < 8.8) {
//           emp.halfDayLeaves += 1; // less than 8.8 hrs → half day leave
//         }
//       }
//     });

//     setEmployeeSummary(Object.values(summaryMap));
//   };

//   useEffect(() => {
//     generateSummary(filteredRecords);
//   }, [filteredRecords]);

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     setSelectedMonth("");
//     setCurrentPage(1);
//     if (!date) return setFilteredRecords(records);

//     const filtered = records.filter((rec) => {
//       const checkInDate = new Date(rec.checkInTime).toISOString().split("T")[0];
//       return checkInDate === date;
//     });
//     setFilteredRecords(filtered);
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setSelectedDate("");
//     setCurrentPage(1);
//     if (!month) return setFilteredRecords(records);

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });
//     setFilteredRecords(filtered);
//   };

//   const clearFilters = () => {
//     setSelectedDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     setCurrentPage(1);
//   };

//   const formatTime = (dateString) =>
//     dateString
//       ? new Date(dateString).toLocaleTimeString("en-IN", {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       : "-";

//   const formatDate = (dateString) =>
//     new Date(dateString).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* ✅ Employee Summary Section */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Employee Summary
//           </h2>

//           {employeeSummary.length === 0 ? (
//             <p className="text-gray-600">No summary data available.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Employee ID</th>
//                     <th className="px-6 py-3 text-left">Email</th>
//                     <th className="px-6 py-3 text-left">Total Days</th>
//                     <th className="px-6 py-3 text-left">Present</th>
//                     <th className="px-6 py-3 text-left">Late</th>
//                     <th className="px-6 py-3 text-left">Onsite</th>
//                     <th className="px-6 py-3 text-left">Half-Day Leave</th>
//                     <th className="px-6 py-3 text-left">Full-Day Leave</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeSummary.map((emp) => (
//                     <tr
//                       key={emp.employeeId}
//                       className="transition border-t hover:bg-blue-50"
//                     >
//                       <td className="px-6 py-3 font-semibold text-gray-900">
//                         {emp.employeeId}
//                       </td>
//                       <td className="px-6 py-3 text-gray-700">
//                         {emp.employeeEmail}
//                       </td>
//                       <td className="px-6 py-3">{emp.totalDays}</td>
//                       <td className="px-6 py-3 font-semibold text-green-700">
//                         {emp.presentDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-orange-700">
//                         {emp.lateDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-blue-700">
//                         {emp.onsiteDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-yellow-700">
//                         {emp.halfDayLeaves}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-red-700">
//                         {emp.fullDayLeaves}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* ✅ Existing Attendance Table (keep below) */}
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [employeeSummary, setEmployeeSummary] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         const sorted = (data.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sorted);
//         setFilteredRecords(sorted);
//         generateSummary(sorted);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);

//   // ✅ Summary Logic
//   const generateSummary = (data) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;
//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           employeeEmail: rec.employeeEmail,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//         };
//       }

//       const emp = summaryMap[id];
//       emp.totalDays += 1;

//       if (rec.checkInTime) emp.presentDays += 1;

//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

//       if (rec.onsite) emp.onsiteDays += 1;

//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

//         if (diffHrs < 4) emp.fullDayLeaves += 1;
//         else if (diffHrs < 8.8) emp.halfDayLeaves += 1;
//       }
//     });

//     setEmployeeSummary(Object.values(summaryMap));
//   };

//   // ✅ Handle From-To Date Filter
//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d >= start && d <= end;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   // ✅ Handle Month Filter
//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     if (!month) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     generateSummary(records);
//   };

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* ✅ Filters Section */}
//         <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div>
//             <label className="mr-2 font-semibold text-gray-700">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={handleDateRangeFilter}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             Apply Date Range
//           </button>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">Month:</label>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={handleMonthChange}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={clearFilters}
//             className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
//           >
//             Clear
//           </button>
//         </div>

//         {/* ✅ Employee Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Employee Summary
//           </h2>

//           {employeeSummary.length === 0 ? (
//             <p className="text-gray-600">No summary data available.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Employee ID</th>
//                     <th className="px-6 py-3 text-left">Email</th>
//                     <th className="px-6 py-3 text-left">Total Days</th>
//                     <th className="px-6 py-3 text-left">Present</th>
//                     <th className="px-6 py-3 text-left">Late</th>
//                     <th className="px-6 py-3 text-left">Onsite</th>
//                     <th className="px-6 py-3 text-left">Half-Day Leave</th>
//                     <th className="px-6 py-3 text-left">Full-Day Leave</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeSummary.map((emp) => (
//                     <tr
//                       key={emp.employeeId}
//                       className="transition border-t hover:bg-blue-50"
//                     >
//                       <td className="px-6 py-3 font-semibold text-gray-900">
//                         {emp.employeeId}
//                       </td>
//                       <td className="px-6 py-3 text-gray-700">
//                         {emp.employeeEmail}
//                       </td>
//                       <td className="px-6 py-3">{emp.totalDays}</td>
//                       <td className="px-6 py-3 font-semibold text-green-700">
//                         {emp.presentDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-orange-700">
//                         {emp.lateDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-blue-700">
//                         {emp.onsiteDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-yellow-700">
//                         {emp.halfDayLeaves}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-red-700">
//                         {emp.fullDayLeaves}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [employeeSummary, setEmployeeSummary] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         const sorted = (data.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sorted);
//         setFilteredRecords(sorted);
//         generateSummary(sorted);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);


//   // ✅ Download Entire Employee Summary as CSV
// const downloadAllSummary = () => {
//   if (!employeeSummary.length) return;

//   const header = [
//     "Employee ID",
//     "Email",
//     "Present Days",
//     "Late Days",
//     "Onsite Days",
//     "Half Day Leaves",
//     "Full Day Leaves",
//   ];

//   const rows = employeeSummary.map((emp) => [
//     emp.employeeId,
//     emp.employeeEmail,
//     emp.presentDays,
//     emp.lateDays,
//     emp.onsiteDays,
//     emp.halfDayLeaves,
//     emp.fullDayLeaves,
//   ]);

//   const csvContent =
//     "data:text/csv;charset=utf-8," +
//     [header, ...rows].map((e) => e.join(",")).join("\n");

//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", `employee_summary.csv`);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };


//   // ✅ Generate Employee Summary
//   const generateSummary = (data) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;
//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           employeeEmail: rec.employeeEmail,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//         };
//       }

//       const emp = summaryMap[id];
//       emp.totalDays += 1;

//       if (rec.checkInTime) emp.presentDays += 1;

//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

//       if (rec.onsite) emp.onsiteDays += 1;

//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

//         if (diffHrs < 4) emp.fullDayLeaves += 1;
//         else if (diffHrs < 8.8) emp.halfDayLeaves += 1;
//       }
//     });

//     setEmployeeSummary(Object.values(summaryMap));
//   };

//   // ✅ Handle From-To Date Filter
//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d >= start && d <= end;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   // ✅ Handle Month Filter
//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     if (!month) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     generateSummary(records);
//   };

//   // ✅ Show Employee Full Details
//   const handleViewDetails = (employeeId) => {
//     const details = records.filter((rec) => rec.employeeId === employeeId);
//     setEmployeeDetails(details);
//     setSelectedEmployee(employeeId);
//   };

//   const closeModal = () => {
//     setSelectedEmployee(null);
//     setEmployeeDetails([]);
//   };

//   const formatDate = (dateString) =>
//     dateString
//       ? new Date(dateString).toLocaleString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       : "-";

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* ✅ Filters */}
//         <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div>
//             <label className="mr-2 font-semibold text-gray-700">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={handleDateRangeFilter}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             Apply
//           </button>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">Month:</label>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={handleMonthChange}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={clearFilters}
//             className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
//           >
//             Clear
//           </button>
//         </div>

//         {/* ✅ Employee Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Employee Summary
//           </h2>

//            <button
//     onClick={downloadAllSummary}
//     className="px-4 py-2 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
//   >
//     ⬇ Download Summary
//   </button>

//           {employeeSummary.length === 0 ? (
//             <p className="text-gray-600">No summary data available.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Employee ID</th>
//                     <th className="px-6 py-3 text-left">Email</th>
//                     <th className="px-6 py-3">Present</th>
//                     <th className="px-6 py-3">Late</th>
//                     <th className="px-6 py-3">In Office</th>
//                     <th className="px-6 py-3">Half Day</th>
//                     <th className="px-6 py-3">Full Day</th>
//                     <th className="px-6 py-3 text-center">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeSummary.map((emp) => (
//                     <tr
//                       key={emp.employeeId}
//                       className="transition border-t hover:bg-blue-50"
//                     >
//                       <td className="px-6 py-3 font-semibold text-gray-900">
//                         {emp.employeeId}
//                       </td>
//                       <td className="px-6 py-3 text-gray-700">
//                         {emp.employeeEmail}
//                       </td>
                      
//                       <td className="px-6 py-3 font-semibold text-green-700">
//                         {emp.presentDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-orange-700">
//                         {emp.lateDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-blue-700">
//                         {emp.onsiteDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-yellow-700">
//                         {emp.halfDayLeaves}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-red-700">
//                         {emp.fullDayLeaves}
//                       </td>
//                       <td className="px-6 py-3 text-center">
//                         <button
//                           onClick={() => handleViewDetails(emp.employeeId)}
//                           className="px-3 py-1 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* ✅ Employee Full Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-lg font-semibold text-red-600 hover:text-red-800"
//                 >
//                   ✖
//                 </button>
//               </div>

//               <table className="w-full text-sm border border-gray-300">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Date</th>
//                     <th className="px-4 py-2 text-left">Check-In</th>
//                     <th className="px-4 py-2 text-left">Check-Out</th>
//                     <th className="px-4 py-2 text-left">Onsite</th>
//                     <th className="px-4 py-2 text-left">Working Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime
//                       ? new Date(rec.checkOutTime)
//                       : null;
//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     return (
//                       <tr
//                         key={i}
//                         className="transition border-t hover:bg-blue-50"
//                       >
//                         <td className="px-4 py-2">
//                           {new Date(rec.checkInTime).toLocaleDateString("en-IN")}
//                         </td>
//                         <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>
//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>
//                         <td className="px-4 py-2">
//                           {rec.onsite ? "Yes" : "No"}
//                         </td>
//                         <td className="px-4 py-2">{diffHrs}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [employeeSummary, setEmployeeSummary] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();
//         if (!res.ok)
//           throw new Error(data.message || "Failed to fetch attendance");

//         const sorted = (data.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sorted);
//         setFilteredRecords(sorted);
//         generateSummary(sorted);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);

//   const downloadAllSummary = () => {
//     if (!employeeSummary.length) return;

//     const header = [
//       "Employee ID",
//       "Email",
//       "Present Days",
//       "Late Days",
//       "In Office",
//       "Half Days",
//       "Full Days",
//       "Working Days",
//     ];

//     const rows = employeeSummary.map((emp) => [
//       emp.employeeId,
//       emp.employeeEmail,
//       emp.presentDays,
//       emp.lateDays,
//       emp.inOfficeDays,
//       emp.halfDayCount,
//       emp.fullDayCount,
//       emp.workingDays,
//     ]);

//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [header, ...rows].map((e) => e.join(",")).join("\n");

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `employee_summary.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // ⭐⭐⭐ UPDATED SUMMARY LOGIC ⭐⭐⭐
//   const generateSummary = (data) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;

//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           employeeEmail: rec.employeeEmail,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           inOfficeDays: 0,
//           halfDayCount: 0,
//           fullDayCount: 0,
//           workingDays: 0,
//         };
//       }

//       const emp = summaryMap[id];
//       emp.totalDays += 1;

//       if (rec.checkInTime) emp.presentDays += 1;

//       // Late calculation
//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

//       if (rec.onsite) emp.inOfficeDays += 1;

//       // ⭐ Working hours logic (full / half)
//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

//         if (totalHours >= 9) {
//           emp.fullDayCount += 1;
//         } else if (totalHours >= 4.5) {
//           emp.halfDayCount += 1;
//         }
//       }

//       // ⭐ FINAL WORKING DAYS CALCULATION ⭐
//       // 2 Half Days = 1 Full Day → 0.5 + 0.5 = 1
//       emp.workingDays = emp.fullDayCount + emp.halfDayCount * 0.5;
//     });

//     setEmployeeSummary(Object.values(summaryMap));
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d >= start && d <= end;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     if (!month) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     generateSummary(records);
//   };

//   const handleViewDetails = (employeeId) => {
//     const details = records.filter((rec) => rec.employeeId === employeeId);
//     setEmployeeDetails(details);
//     setSelectedEmployee(employeeId);
//   };

//   const closeModal = () => {
//     setSelectedEmployee(null);
//     setEmployeeDetails([]);
//   };

//   const formatDate = (dateString) =>
//     dateString
//       ? new Date(dateString).toLocaleString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       : "-";

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* Filters */}
//         <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div>
//             <label className="mr-2 font-semibold text-gray-700">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={handleDateRangeFilter}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             Apply
//           </button>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">Month:</label>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={handleMonthChange}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={clearFilters}
//             className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
//           >
//             Clear
//           </button>
//         </div>

//         {/* Employee Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Employee Summary
//             </h2>
//             <button
//               onClick={downloadAllSummary}
//               className="px-4 py-2 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
//             >
//               ⬇ Download Summary
//             </button>
//           </div>

//           {employeeSummary.length === 0 ? (
//             <p className="text-gray-600">No summary data available.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Employee ID</th>
//                     <th className="px-6 py-3 text-left">Email</th>
//                     <th className="px-6 py-3">Present</th>
//                     <th className="px-6 py-3">Late</th>
//                     <th className="px-6 py-3">In Office</th>
//                     <th className="px-6 py-3">Half Days</th>
//                     <th className="px-6 py-3">Full Days</th>
//                     <th className="px-6 py-3">Working Days</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeSummary.map((emp) => (
//                     <tr
//                       key={emp.employeeId}
//                       onClick={() => handleViewDetails(emp.employeeId)}
//                       className="transition border-t cursor-pointer hover:bg-blue-50"
//                     >
//                       <td className="px-6 py-3 font-semibold text-gray-900">
//                         {emp.employeeId}
//                       </td>
//                       <td className="px-6 py-3 text-gray-700">
//                         {emp.employeeEmail}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-green-700">
//                         {emp.presentDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-orange-700">
//                         {emp.lateDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-blue-700">
//                         {emp.inOfficeDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-yellow-700">
//                         {emp.halfDayCount}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-red-700">
//                         {emp.fullDayCount}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-purple-700">
//                         {emp.workingDays}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Employee Full Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-lg font-semibold text-red-600 hover:text-red-800"
//                 >
//                   ✖
//                 </button>
//               </div>

//               <table className="w-full text-sm border border-gray-300">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Date</th>
//                     <th className="px-4 py-2 text-left">Check-In</th>
//                     <th className="px-4 py-2 text-left">Check-Out</th>
//                     <th className="px-4 py-2 text-left">In Office</th>
//                     <th className="px-4 py-2 text-left">Working Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime
//                       ? new Date(rec.checkOutTime)
//                       : null;
//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     return (
//                       <tr
//                         key={i}
//                         className="transition border-t hover:bg-blue-50"
//                       >
//                         <td className="px-4 py-2">
//                           {new Date(
//                             rec.checkInTime
//                           ).toLocaleDateString("en-IN")}
//                         </td>
//                         <td className="px-4 py-2">
//                           {formatDate(rec.checkInTime)}
//                         </td>
//                         <td className="px-4 py-2">
//                           {rec.checkOutTime
//                             ? formatDate(rec.checkOutTime)
//                             : "-"}
//                         </td>
//                         <td className="px-4 py-2">
//                           {rec.onsite ? "Yes" : "No"}
//                         </td>
//                         <td className="px-4 py-2">{diffHrs}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [employeeSummary, setEmployeeSummary] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchAllAttendance = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

//         const sorted = (data.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sorted);
//         setFilteredRecords(sorted);
//         generateSummary(sorted);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllAttendance();
//   }, []);

//   const downloadAllSummary = () => {
//     if (!employeeSummary.length) return;

//     const header = [
//       "Employee ID",
//       "Email",
//       "Present Days",
//       "Late Days",
//       "Onsite Days",
//       "Half Day Leaves",
//       "Full Day Leaves",
//     ];

//     const rows = employeeSummary.map((emp) => [
//       emp.employeeId,
//       emp.employeeEmail,
//       emp.presentDays,
//       emp.lateDays,
//       emp.onsiteDays,
//       emp.halfDayLeaves,
//       emp.fullDayLeaves,
//     ]);

//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [header, ...rows].map((e) => e.join(",")).join("\n");

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "employee_summary.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const generateSummary = (data) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;
//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           employeeEmail: rec.employeeEmail,
//           totalDays: 0,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//         };
//       }

//       const emp = summaryMap[id];
//       emp.totalDays += 1;

//       if (rec.checkInTime) emp.presentDays += 1;

//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

//       if (rec.onsite) emp.onsiteDays += 1;

//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

//         if (diffHrs < 4) emp.fullDayLeaves += 1;
//         else if (diffHrs < 8.8) emp.halfDayLeaves += 1;
//       }
//     });

//     setEmployeeSummary(Object.values(summaryMap));
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d >= start && d <= end;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     if (!month) {
//       setFilteredRecords(records);
//       generateSummary(records);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });

//     setFilteredRecords(filtered);
//     generateSummary(filtered);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     generateSummary(records);
//   };

//   const handleViewDetails = (employeeId) => {
//     const details = records.filter((rec) => rec.employeeId === employeeId);
//     setEmployeeDetails(details);
//     setSelectedEmployee(employeeId);
//   };

//   const closeModal = () => {
//     setSelectedEmployee(null);
//     setEmployeeDetails([]);
//   };

//   const formatDate = (dateString) =>
//     dateString
//       ? new Date(dateString).toLocaleString("en-IN", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       : "-";

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* ✅ Filters */}
//         <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div>
//             <label className="mr-2 font-semibold text-gray-700">From:</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">To:</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={handleDateRangeFilter}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             Apply
//           </button>

//           <div>
//             <label className="mr-2 font-semibold text-gray-700">Month:</label>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={handleMonthChange}
//               className="p-2 border rounded-lg"
//             />
//           </div>

//           <button
//             onClick={clearFilters}
//             className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
//           >
//             Clear
//           </button>
//         </div>

//         {/* ✅ Employee Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Employee Summary
//             </h2>
//             <button
//               onClick={downloadAllSummary}
//               className="px-4 py-2 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
//             >
//               ⬇ Download Summary
//             </button>
//           </div>

//           {employeeSummary.length === 0 ? (
//             <p className="text-gray-600">No summary data available.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                   <tr>
//                     <th className="px-6 py-3 text-left">Employee ID</th>
//                     <th className="px-6 py-3 text-left">Email</th>
//                     <th className="px-6 py-3">Present</th>
//                     <th className="px-6 py-3">Late</th>
//                     <th className="px-6 py-3">In Office</th>
//                     <th className="px-6 py-3">Half Day</th>
//                     <th className="px-6 py-3">Full Day</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeSummary.map((emp) => (
//                     <tr
//                       key={emp.employeeId}
//                       onClick={() => handleViewDetails(emp.employeeId)}
//                       className="transition border-t cursor-pointer hover:bg-blue-50"
//                     >
//                       <td className="px-6 py-3 font-semibold text-gray-900">
//                         {emp.employeeId}
//                       </td>
//                       <td className="px-6 py-3 text-gray-700">
//                         {emp.employeeEmail}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-green-700">
//                         {emp.presentDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-orange-700">
//                         {emp.lateDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-blue-700">
//                         {emp.onsiteDays}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-yellow-700">
//                         {emp.halfDayLeaves}
//                       </td>
//                       <td className="px-6 py-3 font-semibold text-red-700">
//                         {emp.fullDayLeaves}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* ✅ Employee Full Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-lg font-semibold text-red-600 hover:text-red-800"
//                 >
//                   ✖
//                 </button>
//               </div>

//               <table className="w-full text-sm border border-gray-300">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2 text-left">Date</th>
//                     <th className="px-4 py-2 text-left">Check-In</th>
//                     <th className="px-4 py-2 text-left">Check-Out</th>
//                     <th className="px-4 py-2 text-left">Onsite</th>
//                     <th className="px-4 py-2 text-left">Working Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime
//                       ? new Date(rec.checkOutTime)
//                       : null;
//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     return (
//                       <tr
//                         key={i}
//                         className="transition border-t hover:bg-blue-50"
//                       >
//                         <td className="px-4 py-2">
//                           {new Date(rec.checkInTime).toLocaleDateString("en-IN")}
//                         </td>
//                         <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>
//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>
//                         <td className="px-4 py-2">
//                           {rec.onsite ? "Yes" : "No"}
//                         </td>
//                         <td className="px-4 py-2">{diffHrs}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";

const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

export default function AttendanceSummary() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
        const empData = await empRes.json();
        setEmployees(empData);

        const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
        const attData = await attRes.json();
        if (!attRes.ok)
          throw new Error(attData.message || "Failed to fetch attendance");

        const sorted = (attData.records || []).sort(
          (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
        );

        setRecords(sorted);
        setFilteredRecords(sorted);
        generateSummary(sorted, empData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const generateSummary = (data, empList = employees) => {
    const summaryMap = {};

    data.forEach((rec) => {
      const id = rec.employeeId;

      const employee = empList.find(
        (e) => e.employeeId === id || e._id === id || e.empId === id
      );

      if (!summaryMap[id]) {
        summaryMap[id] = {
          employeeId: id,
          name: employee?.name || employee?.fullName || "N/A",
          presentDays: 0,
          lateDays: 0,
          onsiteDays: 0,
          halfDayLeaves: 0,
          fullDayLeaves: 0,
          totalWorkingDays: 0,
        };
      }

      const emp = summaryMap[id];

      if (rec.checkInTime) emp.presentDays += 1;

      const checkIn = new Date(rec.checkInTime);
      const hours = checkIn.getHours();
      const minutes = checkIn.getMinutes();

      if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

      if (rec.onsite) emp.onsiteDays += 1;

      if (rec.checkInTime && rec.checkOutTime) {
        const checkOut = new Date(rec.checkOutTime);
        const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

        if (diffHrs < 4) emp.fullDayLeaves += 1;
        else if (diffHrs < 8.8) emp.halfDayLeaves += 1;
      }
    });

    Object.values(summaryMap).forEach((emp) => {
      emp.totalWorkingDays =
        emp.presentDays - (emp.fullDayLeaves + emp.halfDayLeaves / 2);
      emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);
    });

    setEmployeeSummary(Object.values(summaryMap));
  };

  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredRecords(records);
      generateSummary(records);
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return d >= start && d <= end;
    });

    setFilteredRecords(filtered);
    generateSummary(filtered);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");

    if (!month) {
      setFilteredRecords(records);
      generateSummary(records);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
    });

    setFilteredRecords(filtered);
    generateSummary(filtered);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setFilteredRecords(records);
    generateSummary(records);
  };

  const handleViewDetails = (employeeId) => {
    const details = records.filter((rec) => rec.employeeId === employeeId);
    setEmployeeDetails(details);
    setSelectedEmployee(employeeId);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setEmployeeDetails([]);
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const downloadAllSummary = () => {
    if (!employeeSummary.length) return;

    const header = [
      "Employee ID",
      "Name",
      "Present Days",
      "Late Days",
      "In Office Days",
      "Half Day Leaves",
      "Full Day Leaves",
      "Total Working Days",
    ];

    const rows = employeeSummary.map((emp) => [
      emp.employeeId,
      emp.name,
      emp.presentDays,
      emp.lateDays,
      emp.onsiteDays,
      emp.halfDayLeaves,
      emp.fullDayLeaves,
      emp.totalWorkingDays,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading attendance records...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-blue-700">
          📊 Employee Attendance Dashboard
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border shadow-md rounded-xl">
          <div>
            <label className="mr-2 font-semibold text-gray-700">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="mr-2 font-semibold text-gray-700">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>

          <button
            onClick={handleDateRangeFilter}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>

          <div>
            <label className="mr-2 font-semibold text-gray-700">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="p-2 border rounded-lg"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
          >
            Clear
          </button>
        </div>

        {/* Summary Table */}
        <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-purple-700">
              👥 Employee Summary
            </h2>
            <button
              onClick={downloadAllSummary}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              ⬇ Download Summary
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
                <tr>
                  <th className="px-6 py-3 text-left">Employee ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3">Present</th>
                  <th className="px-6 py-3">Late</th>
                  <th className="px-6 py-3">In Office</th>
                  <th className="px-6 py-3">Half Day</th>
                  <th className="px-6 py-3">Full Day</th>
                  <th className="px-6 py-3">Working Days</th>
                </tr>
              </thead>

              <tbody>
                {employeeSummary.map((emp) => (
                  <tr
                    key={emp.employeeId}
                    onClick={() => handleViewDetails(emp.employeeId)}
                    className="border-t cursor-pointer hover:bg-blue-50"
                  >
                    <td className="px-6 py-3">{emp.employeeId}</td>
                    <td className="px-6 py-3">{emp.name}</td>
                    <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
                    <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
                    <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td>
                    <td className="px-6 py-3 text-yellow-700">{emp.halfDayLeaves}</td>
                    <td className="px-6 py-3 text-red-700">{emp.fullDayLeaves}</td>
                    <td className="px-6 py-3 font-bold text-purple-700">
                      {emp.totalWorkingDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-blue-700">
                  🧾 Attendance Details — {selectedEmployee}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-lg font-bold text-red-600"
                >
                  ✖
                </button>
              </div>

              <table className="w-full text-sm border">
                <thead className="text-white bg-blue-600">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Check-In</th>
                    <th className="px-4 py-2">Check-Out</th>
                    <th className="px-4 py-2">In Office</th>
                    <th className="px-4 py-2">Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {employeeDetails.map((rec, i) => {
                    const checkIn = new Date(rec.checkInTime);
                    const checkOut = rec.checkOutTime
                      ? new Date(rec.checkOutTime)
                      : null;

                    const diffHrs = checkOut
                      ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
                      : "-";

                    return (
                      <tr key={i} className="border-t hover:bg-blue-50">
                        <td className="px-4 py-2">
                          {new Date(rec.checkInTime).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(rec.checkInTime)}
                        </td>
                        <td className="px-4 py-2">
                          {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
                        </td>
                        <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
                        <td className="px-4 py-2">{diffHrs}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
