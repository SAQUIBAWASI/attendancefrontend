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

// import { useEffect, useState } from "react";

// const BASE_URL = "https://attendancebackend-5cgn.onrender.com";

// export default function AttendanceSummary() {
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [employeeSummary, setEmployeeSummary] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
//         const empData = await empRes.json();
//         setEmployees(empData);

//         const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//         const attData = await attRes.json();
//         if (!attRes.ok)
//           throw new Error(attData.message || "Failed to fetch attendance");

//         const sorted = (attData.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );

//         setRecords(sorted);
//         setFilteredRecords(sorted);
//         generateSummary(sorted, empData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   const generateSummary = (data, empList = employees) => {
//     const summaryMap = {};

//     data.forEach((rec) => {
//       const id = rec.employeeId;

//       const employee = empList.find(
//         (e) => e.employeeId === id || e._id === id || e.empId === id
//       );

//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           name: employee?.name || employee?.fullName || "N/A",
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//           totalWorkingDays: 0,
//         };
//       }

//       const emp = summaryMap[id];

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

//     Object.values(summaryMap).forEach((emp) => {
//       emp.totalWorkingDays =
//         emp.presentDays - (emp.fullDayLeaves + emp.halfDayLeaves / 2);
//       emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);
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

//   const downloadAllSummary = () => {
//     if (!employeeSummary.length) return;

//     const header = [
//       "Employee ID",
//       "Name",
//       "Present Days",
//       "Late Days",
//       "In Office Days",
//       "Half Day Leaves",
//       "Full Day Leaves",
//       "Total Working Days",
//     ];

//     const rows = employeeSummary.map((emp) => [
//       emp.employeeId,
//       emp.name,
//       emp.presentDays,
//       emp.lateDays,
//       emp.onsiteDays,
//       emp.halfDayLeaves,
//       emp.fullDayLeaves,
//       emp.totalWorkingDays,
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

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">
//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* Filters */}
//         <div className="flex flex-wrap items-center gap-4 p-5 mb-8 bg-white border shadow-md rounded-xl">
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

//         {/* Summary Table */}
//         <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Employee Summary
//             </h2>
//             <button
//               onClick={downloadAllSummary}
//               className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//             >
//               ⬇ Download Summary
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border">
//               <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Employee ID</th>
//                   <th className="px-6 py-3 text-left">Name</th>
//                   <th className="px-6 py-3">Present</th>
//                   <th className="px-6 py-3">Late</th>
//                   <th className="px-6 py-3">In Office</th>
//                   <th className="px-6 py-3">Half Day</th>
//                   <th className="px-6 py-3">Full Day</th>
//                   <th className="px-6 py-3">Working Days</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {employeeSummary.map((emp) => (
//                   <tr
//                     key={emp.employeeId}
//                     onClick={() => handleViewDetails(emp.employeeId)}
//                     className="border-t cursor-pointer hover:bg-blue-50"
//                   >
//                     <td className="px-6 py-3">{emp.employeeId}</td>
//                     <td className="px-6 py-3">{emp.name}</td>
//                     <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
//                     <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
//                     <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td>
//                     <td className="px-6 py-3 text-yellow-700">{emp.halfDayLeaves}</td>
//                     <td className="px-6 py-3 text-red-700">{emp.fullDayLeaves}</td>
//                     <td className="px-6 py-3 font-bold text-purple-700">
//                       {emp.totalWorkingDays}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-lg font-bold text-red-600"
//                 >
//                   ✖
//                 </button>
//               </div>

//               <table className="w-full text-sm border">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Check-In</th>
//                     <th className="px-4 py-2">Check-Out</th>
//                     <th className="px-4 py-2">In Office</th>
//                     <th className="px-4 py-2">Hours</th>
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
//                       <tr key={i} className="border-t hover:bg-blue-50">
//                         <td className="px-4 py-2">
//                           {new Date(rec.checkInTime).toLocaleDateString("en-IN")}
//                         </td>
//                         <td className="px-4 py-2">
//                           {formatDate(rec.checkInTime)}
//                         </td>
//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>
//                         <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
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

import { useEffect, useRef, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function AttendanceSummary() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // For showing save status

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Refs for tracking changes
  const previousSummaryRef = useRef([]);
  const autoSaveIntervalRef = useRef(null);
  const saveStatusTimeoutRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch attendance summary from the new API
      const summaryRes = await fetch(`${BASE_URL}/api/attendancesummary/getattendancesummary`);
      const summaryData = await summaryRes.json();
      
      if (!summaryRes.ok)
        throw new Error(summaryData.message || "Failed to fetch attendance summary");

      // Transform the API data to match our expected format
      const transformedSummary = (summaryData.summary || []).map(item => ({
        employeeId: item.employeeId,
        name: item.name,
        presentDays: item.presentDays,
        lateDays: item.lateDays,
        onsiteDays: item.onsiteDays,
        halfDayLeaves: item.halfDays || 0,
        fullDayLeaves: item.fullDayLeaves || 0,
        totalWorkingDays: item.workingDays || item.totalWorkingDays,
        month: item.month
      }));

      setEmployeeSummary(transformedSummary);

      // Fetch employees for additional details if needed
      const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
      const empData = await empRes.json();
      setEmployees(empData);

      // Fetch attendance records for detail view
      const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
      const attData = await attRes.json();
      if (attRes.ok) {
        const sorted = (attData.records || []).sort(
          (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
        );
        setRecords(sorted);
        setFilteredRecords(sorted);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to update attendance record
  const updateAttendanceRecord = async (attendanceId, hours, reason) => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendance/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId,
          hours,
          reason
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating attendance:", error);
      return { success: false, message: "Network error" };
    }
  };

  // Function to handle save button click
  const handleSaveAttendance = async (rec, hours, reason, index) => {
    try {
      const result = await updateAttendanceRecord(rec._id, hours, reason);

      if (result.success) {
        alert("✅ Hours updated successfully!");
        
        // Update local state immediately
        const updatedDetails = employeeDetails.map((detail, idx) => 
          idx === index 
            ? { 
                ...detail, 
                totalHours: parseFloat(hours),
                reason: reason
              }
            : detail
        );
        setEmployeeDetails(updatedDetails);
        
        // Update main records
        const updatedRecords = records.map(record => 
          record._id === rec._id 
            ? { 
                ...record, 
                totalHours: parseFloat(hours),
                reason: reason
              }
            : record
        );
        setRecords(updatedRecords);
        setFilteredRecords(updatedRecords);
        
      } else {
        alert("❌ Failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      alert("🚨 Error updating hours");
    }
  };

  // Show save status with auto-hide
  const showSaveStatus = (message, type = "success") => {
    setSaveStatus(message);
    
    // Clear existing timeout
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    
    // Auto hide after 3 seconds
    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus("");
    }, 3000);
  };

  // 🚀 AUTO-SAVE SUMMARY TO DB (Every 5 minutes + on changes)
  useEffect(() => {
    if (!employeeSummary.length) return;

    // Check if summary has changed
    const hasSummaryChanged = JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current);
    
    if (hasSummaryChanged) {
      console.log("Summary changed, auto-saving...");
      previousSummaryRef.current = employeeSummary;
      autoSaveSummary("auto");
    }

    // Set up interval for auto-save every 5 minutes
    if (!autoSaveIntervalRef.current) {
      autoSaveIntervalRef.current = setInterval(() => {
        console.log("5-minute auto-save triggered...");
        autoSaveSummary("scheduled");
      }, 5 * 60 * 1000); // 5 minutes
    }

    // Cleanup interval on component unmount
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, [employeeSummary]);

  const autoSaveSummary = async (type = "auto") => {
    try {
      console.log("Saving summary to database...", employeeSummary);
      
      const response = await fetch(`${BASE_URL}/api/attendancesummary/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaries: employeeSummary,
          fromDate: fromDate || null,
          toDate: toDate || null,
          month: selectedMonth || "",
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log("✅ Auto Saved Summary Successfully!", result);
        
        // Show different messages based on save type
        if (type === "scheduled") {
          showSaveStatus("✅ Data updated successfully! (Auto-save)");
        } else if (type === "auto") {
          showSaveStatus("✅ Changes saved automatically!");
        } else {
          showSaveStatus("✅ Data saved successfully!");
        }
      } else {
        console.error("❌ Auto Save Failed:", result.message);
        showSaveStatus("❌ Failed to save data!", "error");
      }
    } catch (err) {
      console.error("🚨 Auto Save Error:", err);
      showSaveStatus("🚨 Error saving data!", "error");
    }
  };

  // Manual save function
  const handleManualSave = async () => {
    try {
      console.log("Manual save triggered...");
      await autoSaveSummary("manual");
    } catch (err) {
      console.error("Manual save failed:", err);
      showSaveStatus("❌ Failed to save data!", "error");
    }
  };

  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredRecords(records);
      setCurrentPage(1);
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return d >= start && d <= end;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");

    if (!month) {
      setFilteredRecords(records);
      setCurrentPage(1);
      return;
    }

    const [year, monthNum] = month.split("-");
    const filtered = records.filter((rec) => {
      const d = new Date(rec.checkInTime);
      return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setFilteredRecords(records);
    setCurrentPage(1);
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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employeeSummary.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employeeSummary.length / itemsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  if (loading) return <p>Loading attendance records...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl">
        
        {/* Save Status Alert */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes("✅") || saveStatus.includes("successfully") 
              ? "bg-green-500 border-l-4 border-green-600" 
              : "bg-red-500 border-l-4 border-red-600"
          }`}>
            {saveStatus}
          </div>
        )}

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

          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
            title="Manually save current summary to database"
          >
            💾 Save Now
          </button>
        </div>

        {/* Auto-save Info */}
        <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
          💡 <strong>Auto-save enabled:</strong> Data is automatically saved every 5 minutes and when changes are detected.
        </div>

        {/* Summary Table */}
        <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-purple-700">
              👥 Employee Summary
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>

              <button
                onClick={() => {
                  const header = [
                    "Employee ID",
                    "Name",
                    "Month",
                    "Present",
                    "Late",
                    "In Office",
                    "Half Day",
                    "Full Day",
                    "Working Days",
                  ];
                  const rows = employeeSummary.map((emp) => [
                    emp.employeeId,
                    emp.name,
                    emp.month,
                    emp.presentDays,
                    emp.lateDays,
                    emp.onsiteDays,
                    emp.halfDayLeaves,
                    emp.fullDayLeaves,
                    emp.totalWorkingDays.toFixed(1),
                  ]);
                  const csv =
                    "data:text/csv;charset=utf-8," +
                    [header, ...rows].map((r) => r.join(",")).join("\n");
                  const link = document.createElement("a");
                  link.href = encodeURI(csv);
                  link.download = "employee_summary.csv";
                  link.click();
                }}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                ⬇ Download Summary
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
                <tr>
                  <th className="px-6 py-3 text-left">Employee ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3">Month</th>
                  <th className="px-6 py-3">Present</th>
                  <th className="px-6 py-3">Late</th>
                  <th className="px-6 py-3">In Office</th>
                  <th className="px-6 py-3">Half Day</th>
                  <th className="px-6 py-3">Full Day</th>
                  <th className="px-6 py-3">Working Days</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((emp) => (
                  <tr
                    key={emp.employeeId}
                    onClick={() => handleViewDetails(emp.employeeId)}
                    className="border-t cursor-pointer hover:bg-blue-50"
                  >
                    <td className="px-6 py-3">{emp.employeeId}</td>
                    <td className="px-6 py-3">{emp.name}</td>
                    <td className="px-6 py-3 font-medium text-gray-700">{emp.month}</td>
                    <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
                    <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
                    <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td>
                    <td className="px-6 py-3 text-yellow-700">
                      {emp.halfDayLeaves}
                    </td>
                    <td className="px-6 py-3 text-red-700">
                      {emp.fullDayLeaves}
                    </td>
                    <td className="px-6 py-3 font-bold text-purple-700">
                      {emp.totalWorkingDays.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {employeeSummary.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employeeSummary.length)} of {employeeSummary.length} entries
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm border rounded-lg ${
                      currentPage === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-1 text-sm border rounded-lg ${
                        currentPage === page
                          ? "text-white bg-blue-600 border-blue-600"
                          : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm border rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {employeeSummary.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No records found
              </div>
            )}
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
                  className="text-lg font-bold text-red-600 hover:text-red-700"
                >
                  ✖
                </button>
              </div>

              <table className="w-full text-sm border">
                <thead className="text-white bg-blue-600">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Check-In</th>
                    <th className="px-4 py-2">Check-Out</th>
                    <th className="px-4 py-2">Region</th>
                    <th className="px-4 py-2">Hours</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employeeDetails.map((rec, i) => {
                    const checkIn = new Date(rec.checkInTime);
                    const checkOut = rec.checkOutTime ?
                      new Date(rec.checkOutTime) : null;

                    const diffHrs = checkOut
                      ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
                      : "-";

                    const monthYear = checkIn.toLocaleString("en-IN", {
                      month: "long",
                      year: "numeric",
                    });

                    return (
                      <tr key={i} className="border-t hover:bg-blue-50">

                        <td className="px-4 py-2">
                          {checkIn.toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-4 py-2 font-medium">{monthYear}</td>

                        <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>

                        <td className="px-4 py-2">
                          {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
                        </td>

                        {/* Editable Region + Comment */}
                        <td className="px-4 py-2">
                          <select
                            className="w-full px-2 py-1 border rounded"
                            value={rec.region || ""}
                            onChange={(e) => {
                              const updated = [...employeeDetails];
                              updated[i].region = e.target.value;

                              // If "Comment" selected, clear previous comment
                              if (e.target.value !== "Comment") {
                                updated[i].comment = "";
                              }

                              setEmployeeDetails(updated);
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Comment">Comment (Type)</option>
                          </select>

                          {/* Show comment box only when "Comment" selected */}
                          {rec.region === "Comment" && (
                            <input
                              type="text"
                              placeholder="Type comment here..."
                              className="w-full px-2 py-1 mt-2 border rounded"
                              value={rec.comment || ""}
                              onChange={(e) => {
                                const updated = [...employeeDetails];
                                updated[i].comment = e.target.value;
                                setEmployeeDetails(updated);
                              }}
                            />
                          )}
                        </td>

                        {/* Editable Hours */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-20 px-2 py-1 border rounded"
                            value={rec.hours || rec.totalHours || diffHrs}
                            onChange={(e) => {
                              const updated = [...employeeDetails];
                              updated[i].hours = e.target.value;
                              setEmployeeDetails(updated);
                            }}
                          />
                        </td>

                        {/* Save Button */}
                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                            onClick={() => handleSaveAttendance(rec, rec.hours || rec.totalHours, rec.region, i)}
                          >
                            Save
                          </button>
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
      
      {/* Add CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}