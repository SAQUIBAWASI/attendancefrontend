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

//   // ✅ Generate Attndance Summary Logic
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

//         {/* ✅ Attndance Summary Section */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Attndance Summary
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

//         {/* ✅ Attndance Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Attndance Summary
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


//   // ✅ Download Entire Attndance Summary as CSV
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


//   // ✅ Generate Attndance Summary
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

//         {/* ✅ Attndance Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <h2 className="mb-4 text-2xl font-semibold text-purple-700">
//             👥 Attndance Summary
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

//         {/* Attndance Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Attndance Summary
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

//         {/* ✅ Attndance Summary */}
//         <div className="p-6 mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Attndance Summary
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
//               👥 Attndance Summary
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

// import { useEffect, useRef, useState } from "react";

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
//   const [saveStatus, setSaveStatus] = useState(""); // For showing save status

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Refs for tracking changes
//   const previousSummaryRef = useRef([]);
//   const autoSaveIntervalRef = useRef(null);
//   const saveStatusTimeoutRef = useRef(null);

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     try {
//       // Fetch attendance summary from the new API
//       const summaryRes = await fetch(`${BASE_URL}/api/attendancesummary/getattendancesummary`);
//       const summaryData = await summaryRes.json();

//       if (!summaryRes.ok)
//         throw new Error(summaryData.message || "Failed to fetch attendance summary");

//       // Transform the API data to match our expected format
//       const transformedSummary = (summaryData.summary || []).map(item => ({
//         employeeId: item.employeeId,
//         name: item.name,
//         presentDays: item.presentDays,
//         lateDays: item.lateDays,
//         onsiteDays: item.onsiteDays,
//         halfDayLeaves: item.halfDays || 0,
//         fullDayLeaves: item.fullDayLeaves || 0,
//         totalWorkingDays: item.workingDays || item.totalWorkingDays,
//         month: item.month
//       }));

//       setEmployeeSummary(transformedSummary);

//       // Fetch employees for additional details if needed
//       const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
//       const empData = await empRes.json();
//       setEmployees(empData);

//       // Fetch attendance records for detail view
//       const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//       const attData = await attRes.json();
//       if (attRes.ok) {
//         const sorted = (attData.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );
//         setRecords(sorted);
//         setFilteredRecords(sorted);
//       }

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to update attendance record
//   const updateAttendanceRecord = async (attendanceId, hours, reason) => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/attendance/update`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           attendanceId,
//           hours,
//           reason
//         }),
//       });

//       const result = await response.json();
//       return result;
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       return { success: false, message: "Network error" };
//     }
//   };

//   // Function to handle save button click
//   const handleSaveAttendance = async (rec, hours, reason, index) => {
//     try {
//       const result = await updateAttendanceRecord(rec._id, hours, reason);

//       if (result.success) {
//         alert("✅ Hours updated successfully!");

//         // Update local state immediately
//         const updatedDetails = employeeDetails.map((detail, idx) => 
//           idx === index 
//             ? { 
//                 ...detail, 
//                 totalHours: parseFloat(hours),
//                 reason: reason
//               }
//             : detail
//         );
//         setEmployeeDetails(updatedDetails);

//         // Update main records
//         const updatedRecords = records.map(record => 
//           record._id === rec._id 
//             ? { 
//                 ...record, 
//                 totalHours: parseFloat(hours),
//                 reason: reason
//               }
//             : record
//         );
//         setRecords(updatedRecords);
//         setFilteredRecords(updatedRecords);

//       } else {
//         alert("❌ Failed: " + (result.message || "Unknown error"));
//       }
//     } catch (error) {
//       alert("🚨 Error updating hours");
//     }
//   };

//   // Show save status with auto-hide
//   const showSaveStatus = (message, type = "success") => {
//     setSaveStatus(message);

//     // Clear existing timeout
//     if (saveStatusTimeoutRef.current) {
//       clearTimeout(saveStatusTimeoutRef.current);
//     }

//     // Auto hide after 3 seconds
//     saveStatusTimeoutRef.current = setTimeout(() => {
//       setSaveStatus("");
//     }, 3000);
//   };

//   // 🚀 AUTO-SAVE SUMMARY TO DB (Every 5 minutes + on changes)
//   useEffect(() => {
//     if (!employeeSummary.length) return;

//     // Check if summary has changed
//     const hasSummaryChanged = JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current);

//     if (hasSummaryChanged) {
//       console.log("Summary changed, auto-saving...");
//       previousSummaryRef.current = employeeSummary;
//       autoSaveSummary("auto");
//     }

//     // Set up interval for auto-save every 5 minutes
//     if (!autoSaveIntervalRef.current) {
//       autoSaveIntervalRef.current = setInterval(() => {
//         console.log("5-minute auto-save triggered...");
//         autoSaveSummary("scheduled");
//       }, 5 * 60 * 1000); // 5 minutes
//     }

//     // Cleanup interval on component unmount
//     return () => {
//       if (autoSaveIntervalRef.current) {
//         clearInterval(autoSaveIntervalRef.current);
//         autoSaveIntervalRef.current = null;
//       }
//       if (saveStatusTimeoutRef.current) {
//         clearTimeout(saveStatusTimeoutRef.current);
//       }
//     };
//   }, [employeeSummary]);

//   const autoSaveSummary = async (type = "auto") => {
//     try {
//       console.log("Saving summary to database...", employeeSummary);

//       const response = await fetch(`${BASE_URL}/api/attendancesummary/save`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           summaries: employeeSummary,
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           month: selectedMonth || "",
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         console.log("✅ Auto Saved Summary Successfully!", result);

//         // Show different messages based on save type
//         if (type === "scheduled") {
//           showSaveStatus("✅ Data updated successfully! (Auto-save)");
//         } else if (type === "auto") {
//           showSaveStatus("✅ Changes saved automatically!");
//         } else {
//           showSaveStatus("✅ Data saved successfully!");
//         }
//       } else {
//         console.error("❌ Auto Save Failed:", result.message);
//         showSaveStatus("❌ Failed to save data!", "error");
//       }
//     } catch (err) {
//       console.error("🚨 Auto Save Error:", err);
//       showSaveStatus("🚨 Error saving data!", "error");
//     }
//   };

//   // Manual save function
//   const handleManualSave = async () => {
//     try {
//       console.log("Manual save triggered...");
//       await autoSaveSummary("manual");
//     } catch (err) {
//       console.error("Manual save failed:", err);
//       showSaveStatus("❌ Failed to save data!", "error");
//     }
//   };

//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       setFilteredRecords(records);
//       setCurrentPage(1);
//       return;
//     }

//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d >= start && d <= end;
//     });

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   };

//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     if (!month) {
//       setFilteredRecords(records);
//       setCurrentPage(1);
//       return;
//     }

//     const [year, monthNum] = month.split("-");
//     const filtered = records.filter((rec) => {
//       const d = new Date(rec.checkInTime);
//       return d.getFullYear() === +year && d.getMonth() + 1 === +monthNum;
//     });

//     setFilteredRecords(filtered);
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);
//     setCurrentPage(1);
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

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = employeeSummary.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employeeSummary.length / itemsPerPage);

//   // Pagination handlers
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handlePageClick = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }

//     return pageNumbers;
//   };

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">

//         {/* Save Status Alert */}
//         {saveStatus && (
//           <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
//             saveStatus.includes("✅") || saveStatus.includes("successfully") 
//               ? "bg-green-500 border-l-4 border-green-600" 
//               : "bg-red-500 border-l-4 border-red-600"
//           }`}>
//             {saveStatus}
//           </div>
//         )}

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

//           {/* Manual Save Button */}
//           <button
//             onClick={handleManualSave}
//             className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
//             title="Manually save current summary to database"
//           >
//             💾 Save Now
//           </button>
//         </div>

//         {/* Auto-save Info */}
//         <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
//           💡 <strong>Auto-save enabled:</strong> Data is automatically saved every 5 minutes and when changes are detected.
//         </div>

//         {/* Summary Table */}
//         <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
//           <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Attndance Summary
//             </h2>

//             <div className="flex flex-wrap items-center gap-4">
//               {/* Items per page selector */}
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">
//                   Show:
//                 </label>
//                 <select
//                   value={itemsPerPage}
//                   onChange={handleItemsPerPageChange}
//                   className="p-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="text-sm text-gray-600">entries</span>
//               </div>

//               <button
//                 onClick={() => {
//                   const header = [
//                     "Employee ID",
//                     "Name",
//                     "Month",
//                     "Present",
//                     "Late",
//                     "In Office",
//                     "Half Day",
//                     "Full Day",
//                     "Working Days",
//                   ];
//                   const rows = employeeSummary.map((emp) => [
//                     emp.employeeId,
//                     emp.name,
//                     emp.month,
//                     emp.presentDays,
//                     emp.lateDays,
//                     emp.onsiteDays,
//                     emp.halfDayLeaves,
//                     emp.fullDayLeaves,
//                     emp.totalWorkingDays.toFixed(1),
//                   ]);
//                   const csv =
//                     "data:text/csv;charset=utf-8," +
//                     [header, ...rows].map((r) => r.join(",")).join("\n");
//                   const link = document.createElement("a");
//                   link.href = encodeURI(csv);
//                   link.download = "employee_summary.csv";
//                   link.click();
//                 }}
//                 className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//               >
//                 ⬇ Download Summary
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border">
//               <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Employee ID</th>
//                   <th className="px-6 py-3 text-left">Name</th>
//                   <th className="px-6 py-3">Month</th>
//                   <th className="px-6 py-3">Present</th>
//                   <th className="px-6 py-3">Late</th>
//                   <th className="px-6 py-3">In Office</th>
//                   <th className="px-6 py-3">Half Day</th>
//                   <th className="px-6 py-3">Full Day</th>
//                   <th className="px-6 py-3">Working Days</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {currentItems.map((emp) => (
//                   <tr
//                     key={emp.employeeId}
//                     onClick={() => handleViewDetails(emp.employeeId)}
//                     className="border-t cursor-pointer hover:bg-blue-50"
//                   >
//                     <td className="px-6 py-3">{emp.employeeId}</td>
//                     <td className="px-6 py-3">{emp.name}</td>
//                     <td className="px-6 py-3 font-medium text-gray-700">{emp.month}</td>
//                     <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
//                     <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
//                     <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td>
//                     <td className="px-6 py-3 text-yellow-700">
//                       {emp.halfDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 text-red-700">
//                       {emp.fullDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 font-bold text-purple-700">
//                       {emp.totalWorkingDays.toFixed(1)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination Controls */}
//             {employeeSummary.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
//                 <div className="text-sm text-gray-600">
//                   Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employeeSummary.length)} of {employeeSummary.length} entries
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {/* Previous Button */}
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className={`px-3 py-1 text-sm border rounded-lg ${
//                       currentPage === 1
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   {/* Page Numbers */}
//                   {getPageNumbers().map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageClick(page)}
//                       className={`px-3 py-1 text-sm border rounded-lg ${
//                         currentPage === page
//                           ? "text-white bg-blue-600 border-blue-600"
//                           : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   {/* Next Button */}
//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`px-3 py-1 text-sm border rounded-lg ${
//                       currentPage === totalPages
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}

//             {employeeSummary.length === 0 && (
//               <div className="py-8 text-center text-gray-500">
//                 No records found
//               </div>
//             )}
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
//                   className="text-lg font-bold text-red-600 hover:text-red-700"
//                 >
//                   ✖
//                 </button>
//               </div>

//               <table className="w-full text-sm border">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Month</th>
//                     <th className="px-4 py-2">Check-In</th>
//                     <th className="px-4 py-2">Check-Out</th>
//                     <th className="px-4 py-2">Region</th>
//                     <th className="px-4 py-2">Hours</th>
//                     <th className="px-4 py-2">Action</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime ?
//                       new Date(rec.checkOutTime) : null;

//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     const monthYear = checkIn.toLocaleString("en-IN", {
//                       month: "long",
//                       year: "numeric",
//                     });

//                     return (
//                       <tr key={i} className="border-t hover:bg-blue-50">

//                         <td className="px-4 py-2">
//                           {checkIn.toLocaleDateString("en-IN")}
//                         </td>

//                         <td className="px-4 py-2 font-medium">{monthYear}</td>

//                         <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>

//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>

//                         {/* Editable Region + Comment */}
//                         <td className="px-4 py-2">
//                           <select
//                             className="w-full px-2 py-1 border rounded"
//                             value={rec.region || ""}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].region = e.target.value;

//                               // If "Comment" selected, clear previous comment
//                               if (e.target.value !== "Comment") {
//                                 updated[i].comment = "";
//                               }

//                               setEmployeeDetails(updated);
//                             }}
//                           >
//                             <option value="">Select</option>
//                             <option value="Onsite">Onsite</option>
//                             <option value="Remote">Remote</option>
//                             <option value="Hybrid">Hybrid</option>
//                             <option value="Comment">Comment (Type)</option>
//                           </select>

//                           {/* Show comment box only when "Comment" selected */}
//                           {rec.region === "Comment" && (
//                             <input
//                               type="text"
//                               placeholder="Type comment here..."
//                               className="w-full px-2 py-1 mt-2 border rounded"
//                               value={rec.comment || ""}
//                               onChange={(e) => {
//                                 const updated = [...employeeDetails];
//                                 updated[i].comment = e.target.value;
//                                 setEmployeeDetails(updated);
//                               }}
//                             />
//                           )}
//                         </td>

//                         {/* Editable Hours */}
//                         <td className="px-4 py-2">
//                           <input
//                             type="number"
//                             step="0.1"
//                             className="w-20 px-2 py-1 border rounded"
//                             value={rec.hours || rec.totalHours || diffHrs}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].hours = e.target.value;
//                               setEmployeeDetails(updated);
//                             }}
//                           />
//                         </td>

//                         {/* Save Button */}
//                         <td className="px-4 py-2">
//                           <button
//                             className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
//                             onClick={() => handleSaveAttendance(rec, rec.hours || rec.totalHours, rec.region, i)}
//                           >
//                             Save
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add CSS for fade-in animation */}
//       <style jsx>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";

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
//   const [saveStatus, setSaveStatus] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Refs for tracking changes
//   const previousSummaryRef = useRef([]);
//   const autoSaveIntervalRef = useRef(null);
//   const saveStatusTimeoutRef = useRef(null);
//   const isSavingRef = useRef(false);
//   const lastSaveTimestampRef = useRef(0);

//   // Constants for working hours calculation
//   const FULL_DAY_HOURS = 9;
//   const HALF_DAY_THRESHOLD = 8.80;
//   const FULL_DAY_LEAVE_THRESHOLD = 4; // Less than 4 hours = Full Day Leave

//   useEffect(() => {
//     fetchAllData();

//     // Setup auto-save interval
//     autoSaveIntervalRef.current = setInterval(() => {
//       if (employeeSummary.length > 0 && 
//           JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current) &&
//           !isSavingRef.current) {
//         console.log("5-minute auto-save triggered...");
//         autoSaveSummary("scheduled");
//       }
//     }, 5 * 60 * 1000);

//     return () => {
//       if (autoSaveIntervalRef.current) {
//         clearInterval(autoSaveIntervalRef.current);
//       }
//       if (saveStatusTimeoutRef.current) {
//         clearTimeout(saveStatusTimeoutRef.current);
//       }
//     };
//   }, []);

//   // ✅ ADD THIS DOWNLOAD FUNCTION
//   // ✅ Function to download employee details as CSV
//   const downloadEmployeeDetails = (employeeId, details) => {
//     if (!details || details.length === 0) {
//       showSaveStatus("❌ No data available to download", "error");
//       return;
//     }

//     try {
//       // Get employee info
//       const employee = employees.find(emp => emp.employeeId === employeeId);
//       const employeeName = employee?.name || 'Unknown';

//       // Create CSV header
//       const header = [
//         "Employee ID",
//         "Employee Name", 
//         "Date",
//         "Check-In Time",
//         "Check-Out Time",
//         "Region",
//         "Hours Worked",
//         "Day Type",
//         "Comment"
//       ];

//       // Create CSV rows
//       const rows = details.map((rec) => {
//         const checkIn = new Date(rec.checkInTime);
//         const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

//         const hours = rec.totalHours || 
//           (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

//         const dayType = calculateDayType(hours);
//         const dayTypeText = 
//           dayType === "full" ? "Full Day" :
//           dayType === "half" ? "Half Day" :
//           dayType === "full_leave" ? "Full Day Leave" : "Unknown";

//         return [
//           rec.employeeId,
//           employeeName,
//           checkIn.toLocaleDateString("en-IN"),
//           formatDate(rec.checkInTime),
//           rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
//           rec.region || "-",
//           hours,
//           dayTypeText,
//           rec.comment || "-"
//         ];
//       });

//       // Combine header and rows
//       const csvContent = [header, ...rows]
//         .map(row => row.map(field => `"${field}"`).join(","))
//         .join("\n");

//       // Create download link
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");

//       // Set filename with employee info and date
//       const timestamp = new Date().toISOString().split('T')[0];
//       const filename = `attendance_details_${employeeId}_${timestamp}.csv`;

//       link.href = url;
//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);

//       showSaveStatus("✅ Details downloaded successfully!");

//     } catch (error) {
//       console.error("Download error:", error);
//       showSaveStatus("❌ Error downloading details", "error");
//     }
//   };

//   // ✅ UPDATED: Function to calculate day type based on hours with new rules
//   const calculateDayType = (hours) => {
//     const numericHours = parseFloat(hours) || 0;

//     if (numericHours >= FULL_DAY_HOURS) {
//       return "full";
//     } else if (numericHours >= HALF_DAY_THRESHOLD) {
//       return "half";
//     } else if (numericHours >= FULL_DAY_LEAVE_THRESHOLD) {
//       return "half"; // 4 to 8.79 hours = Half Day
//     } else {
//       return "full_leave"; // Less than 4 hours = Full Day Leave
//     }
//   };

//   // ✅ UPDATED: Function to process attendance records with new rules
//   const processAttendanceRecords = (records, employees, fromDate = null, toDate = null, selectedMonth = null) => {
//     const summaryMap = {};

//     // Filter records based on date range or month
//     let filteredRecords = records;

//     if (fromDate && toDate) {
//       const start = new Date(fromDate);
//       const end = new Date(toDate);
//       end.setHours(23, 59, 59, 999);

//       filteredRecords = records.filter(record => {
//         const recordDate = new Date(record.checkInTime);
//         return recordDate >= start && recordDate <= end;
//       });
//     } else if (selectedMonth) {
//       const [year, monthNum] = selectedMonth.split("-");
//       filteredRecords = records.filter(record => {
//         const recordDate = new Date(record.checkInTime);
//         return recordDate.getFullYear() === parseInt(year) && 
//                (recordDate.getMonth() + 1) === parseInt(monthNum);
//       });
//     }

//     filteredRecords.forEach(record => {
//       if (!record.employeeId || !record.checkInTime) return;

//       const employeeId = record.employeeId;
//       const checkInDate = new Date(record.checkInTime);
//       const monthYear = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}`;

//       // Initialize employee summary if not exists
//       if (!summaryMap[employeeId]) {
//         const employee = employees.find(emp => emp.employeeId === employeeId) || {};
//         summaryMap[employeeId] = {
//           employeeId,
//           name: employee.name || `Employee ${employeeId}`,
//           month: monthYear,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0, // Changed from "In Office" to "Onsite"
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//           totalWorkingDays: 0
//         };
//       }

//       // Calculate hours worked
//       let hours = 0;
//       if (record.totalHours) {
//         hours = parseFloat(record.totalHours);
//       } else if (record.checkOutTime) {
//         const checkIn = new Date(record.checkInTime);
//         const checkOut = new Date(record.checkOutTime);
//         hours = (checkOut - checkIn) / (1000 * 60 * 60);
//       }

//       // Determine day type based on new rules
//       const dayType = calculateDayType(hours);

//       // Update summary based on day type
//       switch (dayType) {
//         case "full":
//           summaryMap[employeeId].presentDays += 1;
//           summaryMap[employeeId].totalWorkingDays += 1;
//           break;
//         case "half":
//           summaryMap[employeeId].halfDayLeaves += 1;
//           summaryMap[employeeId].totalWorkingDays += 0.5;
//           break;
//         case "full_leave":
//           summaryMap[employeeId].fullDayLeaves += 1;
//           // No working days added for full day leave
//           break;
//       }

//       // Check for late arrival (after 10 AM)
//       const checkInHour = checkInDate.getHours();
//       const checkInMinute = checkInDate.getMinutes();
//       if (checkInHour > 10 || (checkInHour === 10 && checkInMinute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // Check work location - count as Onsite
//       if (record.region === "Onsite") {
//         summaryMap[employeeId].onsiteDays += 1;
//       }
//     });

//     return Object.values(summaryMap);
//   };

//   // Main data fetching function
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);

//       // Fetch employees first
//       const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
//       const empData = await empRes.json();
//       setEmployees(empData);

//       // Fetch attendance records
//       const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//       const attData = await attRes.json();

//       if (attRes.ok) {
//         const sorted = (attData.records || []).sort(
//           (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//         );
//         setRecords(sorted);
//         setFilteredRecords(sorted);

//         // Process records to generate accurate summary
//         if (empData.length > 0) {
//           const processedSummary = processAttendanceRecords(
//             sorted, 
//             empData, 
//             fromDate, 
//             toDate, 
//             selectedMonth
//           );
//           setEmployeeSummary(processedSummary);
//           previousSummaryRef.current = JSON.parse(JSON.stringify(processedSummary));
//         }
//       } else {
//         throw new Error(attData.message || "Failed to fetch attendance records");
//       }

//     } catch (err) {
//       setError(err.message);
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to update attendance record
//   const updateAttendanceRecord = async (attendanceId, hours, reason) => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/attendance/update`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           attendanceId,
//           hours,
//           reason
//         }),
//       });

//       const result = await response.json();
//       return result;
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       return { success: false, message: "Network error" };
//     }
//   };

//   // Function to handle save with proper hour calculation
//   const handleSaveAttendance = async (rec, hours, reason, index) => {
//     try {
//       const hoursValue = parseFloat(hours) || 0;

//       const result = await updateAttendanceRecord(rec._id, hoursValue, reason);

//       if (result.success) {
//         showSaveStatus("✅ Hours updated successfully!");

//         // Update local state immediately
//         const updatedDetails = employeeDetails.map((detail, idx) => 
//           idx === index 
//             ? { 
//                 ...detail, 
//                 totalHours: hoursValue,
//                 reason: reason
//               }
//             : detail
//         );
//         setEmployeeDetails(updatedDetails);

//         // Update main records
//         const updatedRecords = records.map(record => 
//           record._id === rec._id 
//             ? { 
//                 ...record, 
//                 totalHours: hoursValue,
//                 reason: reason
//               }
//             : record
//         );
//         setRecords(updatedRecords);
//         setFilteredRecords(updatedRecords);

//         // Refresh summary data with updated calculations
//         const processedSummary = processAttendanceRecords(
//           updatedRecords, 
//           employees, 
//           fromDate, 
//           toDate, 
//           selectedMonth
//         );
//         setEmployeeSummary(processedSummary);

//       } else {
//         showSaveStatus("❌ Failed: " + (result.message || "Unknown error"), "error");
//       }
//     } catch (error) {
//       showSaveStatus("🚨 Error updating hours", "error");
//     }
//   };

//   // Show save status with auto-hide
//   const showSaveStatus = (message, type = "success") => {
//     setSaveStatus(message);

//     if (saveStatusTimeoutRef.current) {
//       clearTimeout(saveStatusTimeoutRef.current);
//     }

//     saveStatusTimeoutRef.current = setTimeout(() => {
//       setSaveStatus("");
//     }, 3000);
//   };

//   // Auto-save functionality
//   useEffect(() => {
//     if (!employeeSummary.length || isSavingRef.current) return;

//     const hasSummaryChanged = 
//       JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current);

//     if (hasSummaryChanged) {
//       console.log("Summary changed, auto-saving...");
//       const changeTimestamp = Date.now();

//       const timeoutId = setTimeout(() => {
//         autoSaveSummary("auto", changeTimestamp);
//       }, 2000);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [employeeSummary]);

//   const autoSaveSummary = async (type = "auto", changeTimestamp = null) => {
//     if (changeTimestamp && changeTimestamp < lastSaveTimestampRef.current) {
//       console.log("Skipping outdated save request");
//       return;
//     }

//     if (isSavingRef.current) {
//       console.log("Save already in progress, skipping...");
//       return;
//     }

//     isSavingRef.current = true;
//     lastSaveTimestampRef.current = changeTimestamp || Date.now();

//     try {
//       console.log("Saving summary to database...", employeeSummary);

//       const response = await fetch(`${BASE_URL}/api/attendancesummary/save`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           summaries: employeeSummary,
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           month: selectedMonth || "",
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         console.log("✅ Saved Summary Successfully!", result);
//         previousSummaryRef.current = JSON.parse(JSON.stringify(employeeSummary));

//         if (type === "scheduled") {
//           showSaveStatus("✅ Data auto-saved successfully!");
//         } else if (type === "auto") {
//           showSaveStatus("✅ Changes saved automatically!");
//         } else {
//           showSaveStatus("✅ Data saved successfully!");
//         }
//       } else {
//         console.error("❌ Save Failed:", result.message);
//         showSaveStatus("❌ Failed to save data!", "error");
//       }
//     } catch (err) {
//       console.error("🚨 Save Error:", err);
//       showSaveStatus("🚨 Error saving data!", "error");
//     } finally {
//       isSavingRef.current = false;
//     }
//   };

//   // Manual save function
//   const handleManualSave = async () => {
//     try {
//       console.log("Manual save triggered...");
//       await autoSaveSummary("manual");
//     } catch (err) {
//       console.error("Manual save failed:", err);
//       showSaveStatus("❌ Failed to save data!", "error");
//     }
//   };

//   // Date range filter function
//   const handleDateRangeFilter = () => {
//     if (!fromDate || !toDate) {
//       // If no dates selected, show all records
//       setFilteredRecords(records);
//       const processedSummary = processAttendanceRecords(records, employees);
//       setEmployeeSummary(processedSummary);
//       setCurrentPage(1);
//       return;
//     }

//     // Process records with date filter
//     const processedSummary = processAttendanceRecords(
//       records, 
//       employees, 
//       fromDate, 
//       toDate
//     );
//     setEmployeeSummary(processedSummary);
//     setCurrentPage(1);
//   };

//   // Month filter function
//   const handleMonthChange = (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     // Process records with month filter
//     const processedSummary = processAttendanceRecords(
//       records, 
//       employees, 
//       null, 
//       null, 
//       month
//     );
//     setEmployeeSummary(processedSummary);
//     setCurrentPage(1);
//   };

//   const clearFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     setFilteredRecords(records);

//     // Process all records without filters
//     const processedSummary = processAttendanceRecords(records, employees);
//     setEmployeeSummary(processedSummary);
//     setCurrentPage(1);
//   };

//   const handleViewDetails = (employeeId) => {
//     let details = records.filter((rec) => rec.employeeId === employeeId);

//     // Apply current filters to details
//     if (fromDate && toDate) {
//       const start = new Date(fromDate);
//       const end = new Date(toDate);
//       end.setHours(23, 59, 59, 999);

//       details = details.filter(record => {
//         const recordDate = new Date(record.checkInTime);
//         return recordDate >= start && recordDate <= end;
//       });
//     } else if (selectedMonth) {
//       const [year, monthNum] = selectedMonth.split("-");
//       details = details.filter(record => {
//         const recordDate = new Date(record.checkInTime);
//         return recordDate.getFullYear() === parseInt(year) && 
//                (recordDate.getMonth() + 1) === parseInt(monthNum);
//       });
//     }

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

//   // ✅ UPDATED: Function to get day type badge with new rules
//   const getDayTypeBadge = (hours) => {
//     const dayType = calculateDayType(hours);
//     switch (dayType) {
//       case "full":
//         return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded">Full Day</span>;
//       case "half":
//         return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded">Half Day</span>;
//       case "full_leave":
//         return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">Full Day Leave</span>;
//       default:
//         return <span className="px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded">Unknown</span>;
//     }
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = employeeSummary.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employeeSummary.length / itemsPerPage);

//   // Pagination handlers
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handlePageClick = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//       for (let i = startPage; i <= endPage; i++) {
//         pageNumbers.push(i);
//       }
//     }

//     return pageNumbers;
//   };

//   if (loading) return <p>Loading attendance records...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">

//         {/* Save Status Alert */}
//         {saveStatus && (
//           <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
//             saveStatus.includes("✅") || saveStatus.includes("successfully") 
//               ? "bg-green-500 border-l-4 border-green-600" 
//               : "bg-red-500 border-l-4 border-red-600"
//           }`}>
//             {saveStatus}
//           </div>
//         )}

//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* ✅ UPDATED: Working Hours Info with new rules */}
//         <div className="p-4 mb-6 bg-white border border-blue-300 rounded-lg shadow-sm">
//           <h3 className="font-semibold text-blue-700">📋 Working Hours Criteria:</h3>
//           <div className="grid grid-cols-1 gap-2 mt-2 text-sm md:grid-cols-4">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//               <span><strong>Full Day:</strong> ≥ {FULL_DAY_HOURS} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//               <span><strong>Half Day:</strong> ≥ {FULL_DAY_LEAVE_THRESHOLD} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//               <span><strong>Full Day Leave:</strong> &lt; {FULL_DAY_LEAVE_THRESHOLD} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//               <span><strong>Onsite:</strong> Marked as Onsite</span>
//             </div>
//           </div>
//         </div>

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
//             Apply Date Filter
//           </button>

//           <div className="ml-4">
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
//             Clear All
//           </button>

//           {/* Manual Save Button */}
//           <button
//             onClick={handleManualSave}
//             className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
//             title="Manually save current summary to database"
//           >
//             💾 Save Now
//           </button>
//         </div>

//         {/* Filter Status */}
//         <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
//           💡 <strong>Filter Status:</strong> 
//           {fromDate && toDate && ` Date Range: ${fromDate} to ${toDate}`}
//           {selectedMonth && ` Month: ${selectedMonth}`}
//           {!fromDate && !toDate && !selectedMonth && ' Showing all records'}
//           {employeeSummary.length > 0 && ` | Found ${employeeSummary.length} employees`}
//         </div>

//         {/* ✅ UPDATED: Summary Table with "Onsite" column */}
//         <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
//           <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Attndance Summary ({employeeSummary.length} employees)
//             </h2>

//             <div className="flex flex-wrap items-center gap-4">
//               {/* Items per page selector */}
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">
//                   Show:
//                 </label>
//                 <select
//                   value={itemsPerPage}
//                   onChange={handleItemsPerPageChange}
//                   className="p-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="text-sm text-gray-600">entries</span>
//               </div>

//               <button
//                 onClick={() => {
//                   const header = [
//                     "Employee ID",
//                     "Name",
//                     "Month",
//                     "Present Days",
//                     "Late Days",
//                     "Onsite Days",
//                     "Half Days",
//                     "Full Day Leaves",
//                     "Working Days"
//                   ];
//                   const rows = employeeSummary.map((emp) => [
//                     emp.employeeId,
//                     emp.name,
//                     emp.month,
//                     emp.presentDays,
//                     emp.lateDays,
//                     emp.onsiteDays,
//                     emp.halfDayLeaves,
//                     emp.fullDayLeaves,
//                     emp.totalWorkingDays.toFixed(1)
//                   ]);
//                   const csv =
//                     "data:text/csv;charset=utf-8," +
//                     [header, ...rows].map((r) => r.join(",")).join("\n");
//                   const link = document.createElement("a");
//                   link.href = encodeURI(csv);
//                   link.download = "employee_summary.csv";
//                   link.click();
//                 }}
//                 className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//               >
//                 ⬇ Download Summary
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border">
//               <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Employee ID</th>
//                   <th className="px-6 py-3 text-left">Name</th>
//                   <th className="px-6 py-3">Month</th>
//                   <th className="px-6 py-3">Present</th>
//                   <th className="px-6 py-3">Late</th>
//                   <th className="px-6 py-3">Onsite</th> {/* Changed from "In Office" to "Onsite" */}
//                   <th className="px-6 py-3">Half Day</th>
//                   <th className="px-6 py-3">Full Day Leave</th>
//                   <th className="px-6 py-3">Working Days</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {currentItems.map((emp) => (
//                   <tr
//                     key={emp.employeeId}
//                     onClick={() => handleViewDetails(emp.employeeId)}
//                     className="border-t cursor-pointer hover:bg-blue-50"
//                   >
//                     <td className="px-6 py-3">{emp.employeeId}</td>
//                     <td className="px-6 py-3">{emp.name}</td>
//                     <td className="px-6 py-3 font-medium text-gray-700">{emp.month}</td>
//                     <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
//                     <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
//                     <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td> {/* Changed to onsiteDays */}
//                     <td className="px-6 py-3 text-yellow-700">
//                       {emp.halfDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 text-red-700">
//                       {emp.fullDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 font-bold text-purple-700">
//                       {emp.totalWorkingDays.toFixed(1)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination Controls */}
//             {employeeSummary.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
//                 <div className="text-sm text-gray-600">
//                   Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employeeSummary.length)} of {employeeSummary.length} entries
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className={`px-3 py-1 text-sm border rounded-lg ${
//                       currentPage === 1
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   {getPageNumbers().map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageClick(page)}
//                       className={`px-3 py-1 text-sm border rounded-lg ${
//                         currentPage === page
//                           ? "text-white bg-blue-600 border-blue-600"
//                           : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`px-3 py-1 text-sm border rounded-lg ${
//                       currentPage === totalPages
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}

//             {employeeSummary.length === 0 && (
//               <div className="py-8 text-center text-gray-500">
//                 No records found for the selected filter
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-xl shadow-xl max-w-7xl w-full max-h-[80vh] overflow-y-auto">

//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <div className="flex items-center gap-3">
//                   {/* Download Button */}
//                   <button
//                     onClick={() => downloadEmployeeDetails(selectedEmployee, employeeDetails)}
//                     className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                     title="Download attendance details as CSV"
//                   >
//                     ⬇ Download Details
//                   </button>
//                   <button
//                     onClick={closeModal}
//                     className="text-lg font-bold text-red-600 hover:text-red-700"
//                   >
//                     ✖
//                   </button>
//                 </div>
//               </div>

//               {/* Employee Info Summary */}
//               <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
//                 <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
//                   <div>
//                     <span className="font-semibold text-blue-700">Employee ID:</span>
//                     <span className="ml-2">{selectedEmployee}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Name:</span>
//                     <span className="ml-2">
//                       {employees.find(emp => emp.employeeId === selectedEmployee)?.name || 'N/A'}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Total Records:</span>
//                     <span className="ml-2">{employeeDetails.length}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Period:</span>
//                     <span className="ml-2">
//                       {fromDate && toDate ? `${fromDate} to ${toDate}` : 
//                       selectedMonth ? selectedMonth : 'All Records'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <table className="w-full text-sm border">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2">Employee ID</th>
//                     <th className="px-4 py-2">Name</th>
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Check-In</th>
//                     <th className="px-4 py-2">Check-Out</th>
//                     <th className="px-4 py-2">Region</th>
//                     <th className="px-4 py-2">Hours</th>
//                     <th className="px-4 py-2">Day Type</th>
//                     <th className="px-4 py-2">Action</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime ?
//                       new Date(rec.checkOutTime) : null;

//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     const currentHours = rec.totalHours || diffHrs;
//                     const employee = employees.find(emp => emp.employeeId === rec.employeeId);

//                     return (
//                       <tr key={i} className="border-t hover:bg-blue-50">
//                         {/* Employee ID */}
//                         <td className="px-4 py-2 font-medium text-gray-700">
//                           {rec.employeeId}
//                         </td>

//                         {/* Employee Name */}
//                         <td className="px-4 py-2">
//                           {employee?.name || 'N/A'}
//                         </td>

//                         <td className="px-4 py-2">
//                           {checkIn.toLocaleDateString("en-IN")}
//                         </td>

//                         <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>

//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>

//                         <td className="px-4 py-2">
//                           <select
//                             className="w-full px-2 py-1 border rounded"
//                             value={rec.region || ""}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].region = e.target.value;
//                               if (e.target.value !== "Comment") {
//                                 updated[i].comment = "";
//                               }
//                               setEmployeeDetails(updated);
//                             }}
//                           >
//                             <option value="">Select</option>
//                             <option value="Onsite">Onsite</option>
//                             <option value="Remote">Remote</option>
//                             <option value="Hybrid">Hybrid</option>
//                             <option value="Comment">Comment (Type)</option>
//                           </select>

//                           {rec.region === "Comment" && (
//                             <input
//                               type="text"
//                               placeholder="Type comment here..."
//                               className="w-full px-2 py-1 mt-2 border rounded"
//                               value={rec.comment || ""}
//                               onChange={(e) => {
//                                 const updated = [...employeeDetails];
//                                 updated[i].comment = e.target.value;
//                                 setEmployeeDetails(updated);
//                               }}
//                             />
//                           )}
//                         </td>

//                         <td className="px-4 py-2">
//                           <input
//                             type="number"
//                             step="0.1"
//                             min="0"
//                             max="24"
//                             className="w-20 px-2 py-1 border rounded"
//                             value={rec.hours || rec.totalHours || diffHrs}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].hours = e.target.value;
//                               setEmployeeDetails(updated);
//                             }}
//                           />
//                         </td>

//                         <td className="px-4 py-2">
//                           {getDayTypeBadge(currentHours)}
//                         </td>

//                         <td className="px-4 py-2">
//                           <button
//                             className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
//                             onClick={() => handleSaveAttendance(rec, rec.hours || rec.totalHours, rec.region, i)}
//                           >
//                             Save
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {/* No Records Message */}
//               {employeeDetails.length === 0 && (
//                 <div className="py-8 text-center text-gray-500">
//                   No attendance records found for this employee
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }


// import { useEffect, useRef, useState } from "react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";


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
//   const [saveStatus, setSaveStatus] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Refs for tracking changes
//   const previousSummaryRef = useRef([]);
//   const autoSaveIntervalRef = useRef(null);
//   const saveStatusTimeoutRef = useRef(null);
//   const isSavingRef = useRef(false);
//   const lastSaveTimestampRef = useRef(0);

//   // Constants for working hours calculation
//   const FULL_DAY_HOURS = 9;
//   const HALF_DAY_THRESHOLD = 8.80;
//   const FULL_DAY_LEAVE_THRESHOLD = 4;

//   // ✅ Close modal function
//   const closeModal = () => {
//     setSelectedEmployee(null);
//     setEmployeeDetails([]);
//   };

//   // ✅ Fetch all data from backend
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Fetch employees
//       const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
//       if (!empRes.ok) throw new Error("Failed to fetch employees");
//       const empData = await empRes.json();
//       setEmployees(empData);

//       // Fetch attendance records
//       const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
//       if (!attRes.ok) throw new Error("Failed to fetch attendance records");
//       const attData = await attRes.json();

//       const sortedRecords = (attData.records || []).sort(
//         (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
//       );

//       setRecords(sortedRecords);
//       setFilteredRecords(sortedRecords);

//       // Calculate summary from backend
//       await calculateSummaryFromBackend();

//     } catch (err) {
//       setError(err.message);
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Calculate summary using backend API
//   const calculateSummaryFromBackend = async () => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/attendancesummary/calculate`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           month: selectedMonth || null,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setEmployeeSummary(result.summary);
//         previousSummaryRef.current = JSON.parse(JSON.stringify(result.summary));
//       } else {
//         throw new Error(result.message || "Failed to calculate summary");
//       }
//     } catch (error) {
//       console.error("Error calculating summary:", error);
//       setError("Failed to calculate attendance summary");
//     }
//   };

//   // ✅ Update attendance record in backend
//   const updateAttendanceRecord = async (attendanceId, hours, region, comment) => {
//     try {
//       const response = await fetch(`${BASE_URL}/api/attendancesummary/update`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           attendanceId,
//           hours: hours !== undefined ? parseFloat(hours) : undefined,
//           region,
//           comment
//         }),
//       });

//       const result = await response.json();
//       return result;
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       return { success: false, message: "Network error" };
//     }
//   };

//   // ✅ Handle save with backend update
//   const handleSaveAttendance = async (rec, hours, region, comment, index) => {
//     try {
//       const hoursValue = hours !== undefined ? parseFloat(hours) : rec.totalHours;

//       const result = await updateAttendanceRecord(rec._id, hoursValue, region, comment);

//       if (result.success) {
//         showSaveStatus("✅ Record updated successfully!");

//         // Update local state
//         const updatedDetails = employeeDetails.map((detail, idx) =>
//           idx === index
//             ? {
//               ...detail,
//               totalHours: hoursValue,
//               region: region,
//               comment: comment
//             }
//             : detail
//         );
//         setEmployeeDetails(updatedDetails);

//         // Update main records
//         const updatedRecords = records.map(record =>
//           record._id === rec._id
//             ? {
//               ...record,
//               totalHours: hoursValue,
//               region: region,
//               comment: comment
//             }
//             : record
//         );

//         setRecords(updatedRecords);
//         setFilteredRecords(updatedRecords);

//         // Recalculate summary with updated data
//         await calculateSummaryFromBackend();

//       } else {
//         showSaveStatus("❌ Failed: " + (result.message || "Unknown error"), "error");
//       }
//     } catch (error) {
//       showSaveStatus("🚨 Error updating record", "error");
//     }
//   };

//   // ✅ Auto-save summary to backend
//   const autoSaveSummary = async (type = "auto", changeTimestamp = null) => {
//     if (changeTimestamp && changeTimestamp < lastSaveTimestampRef.current) {
//       console.log("Skipping outdated save request");
//       return;
//     }

//     if (isSavingRef.current || employeeSummary.length === 0) {
//       console.log("Save already in progress or no data, skipping...");
//       return;
//     }

//     isSavingRef.current = true;
//     lastSaveTimestampRef.current = changeTimestamp || Date.now();

//     try {
//       console.log("Saving summary to database...", employeeSummary);

//       const response = await fetch(`${BASE_URL}/api/attendancesummary/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           summaries: employeeSummary,
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           month: selectedMonth || "",
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         console.log("✅ Summary Saved Successfully!", result);
//         previousSummaryRef.current = JSON.parse(JSON.stringify(employeeSummary));

//         if (type === "scheduled") {
//           showSaveStatus("✅ Data auto-saved successfully!");
//         } else if (type === "auto") {
//           showSaveStatus("✅ Changes saved automatically!");
//         } else {
//           showSaveStatus("✅ Data saved successfully!");
//         }
//       } else {
//         console.error("❌ Save Failed:", result.message);
//         showSaveStatus("❌ Failed to save data!", "error");
//       }
//     } catch (err) {
//       console.error("🚨 Save Error:", err);
//       showSaveStatus("🚨 Error saving data!", "error");
//     } finally {
//       isSavingRef.current = false;
//     }
//   };

//   // ✅ Fetch employee details from backend
//   const handleViewDetails = async (employeeId) => {
//     try {
//       setSelectedEmployee(employeeId);

//       const params = new URLSearchParams({
//         employeeId,
//         ...(fromDate && toDate && { fromDate, toDate }),
//         ...(selectedMonth && { month: selectedMonth })
//       });

//       const response = await fetch(`${BASE_URL}/api/attendancesummary/employee-details?${params}`);
//       const result = await response.json();

//       if (result.success) {
//         setEmployeeDetails(result.details);
//       } else {
//         throw new Error(result.message || "Failed to fetch employee details");
//       }
//     } catch (error) {
//       console.error("Error fetching employee details:", error);
//       showSaveStatus("❌ Error loading employee details", "error");
//     }
//   };

//   // ✅ Date range filter
//   const handleDateRangeFilter = async () => {
//     try {
//       setLoading(true);
//       await calculateSummaryFromBackend();
//       setCurrentPage(1);
//     } catch (error) {
//       console.error("Error applying date filter:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Month filter
//   const handleMonthChange = async (e) => {
//     const month = e.target.value;
//     setSelectedMonth(month);
//     setFromDate("");
//     setToDate("");

//     try {
//       setLoading(true);
//       await calculateSummaryFromBackend();
//       setCurrentPage(1);
//     } catch (error) {
//       console.error("Error applying month filter:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Clear filters
//   const clearFilters = async () => {
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");

//     try {
//       setLoading(true);
//       await calculateSummaryFromBackend();
//       setCurrentPage(1);
//     } catch (error) {
//       console.error("Error clearing filters:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Manual save function
//   const handleManualSave = async () => {
//     try {
//       console.log("Manual save triggered...");
//       await autoSaveSummary("manual");
//     } catch (err) {
//       console.error("Manual save failed:", err);
//       showSaveStatus("❌ Failed to save data!", "error");
//     }
//   };

//   // ✅ Download employee details as CSV
//   // const downloadEmployeeDetails = (employeeId, details) => {
//   //   if (!details || details.length === 0) {
//   //     showSaveStatus("❌ No data available to download", "error");
//   //     return;
//   //   }

//   //   try {
//   //     const employee = employees.find(emp => emp.employeeId === employeeId);
//   //     const employeeName = employee?.name || 'Unknown';

//   //     const header = [
//   //       "Employee ID",
//   //       "Employee Name", 
//   //       "Date",
//   //       "Check-In Time",
//   //       "Check-Out Time",
//   //       "Region",
//   //       "Hours Worked",
//   //       "Day Type",
//   //       "Comment"
//   //     ];

//   //     const rows = details.map((rec) => {
//   //       const checkIn = new Date(rec.checkInTime);
//   //       const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

//   //       const hours = rec.totalHours || 
//   //         (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

//   //       const dayType = calculateDayType(hours);
//   //       const dayTypeText = 
//   //         dayType === "full" ? "Full Day" :
//   //         dayType === "half" ? "Half Day" :
//   //         dayType === "full_leave" ? "Full Day Leave" : "Unknown";

//   //       return [
//   //         rec.employeeId,
//   //         employeeName,
//   //         checkIn.toLocaleDateString("en-IN"),
//   //         formatDate(rec.checkInTime),
//   //         rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
//   //         rec.region || "-",
//   //         hours,
//   //         dayTypeText,
//   //         rec.comment || "-"
//   //       ];
//   //     });

//   //     const csvContent = [header, ...rows]
//   //       .map(row => row.map(field => `"${field}"`).join(","))
//   //       .join("\n");

//   //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   //     const url = URL.createObjectURL(blob);
//   //     const link = document.createElement("a");

//   //     const timestamp = new Date().toISOString().split('T')[0];
//   //     const filename = `attendance_details_${employeeId}_${timestamp}.csv`;

//   //     link.href = url;
//   //     link.setAttribute("download", filename);
//   //     document.body.appendChild(link);
//   //     link.click();
//   //     document.body.removeChild(link);
//   //     URL.revokeObjectURL(url);

//   //     showSaveStatus("✅ Details downloaded successfully!");

//   //   } catch (error) {
//   //     console.error("Download error:", error);
//   //     showSaveStatus("❌ Error downloading details", "error");
//   //   }
//   // };

//   // ✅ Helper functions
//   const calculateDayType = (hours) => {
//     const numericHours = parseFloat(hours) || 0;

//     if (numericHours >= FULL_DAY_HOURS) {
//       return "full";
//     } else if (numericHours >= HALF_DAY_THRESHOLD) {
//       return "half";
//     } else if (numericHours >= FULL_DAY_LEAVE_THRESHOLD) {
//       return "half";
//     } else {
//       return "full_leave";
//     }
//   };

//   const showSaveStatus = (message, type = "success") => {
//     setSaveStatus(message);

//     if (saveStatusTimeoutRef.current) {
//       clearTimeout(saveStatusTimeoutRef.current);
//     }

//     saveStatusTimeoutRef.current = setTimeout(() => {
//       setSaveStatus("");
//     }, 3000);
//   };

//   const formatDate = (dateString) =>
//     dateString
//       ? new Date(dateString).toLocaleString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//       : "-";

//   const getDayTypeBadge = (hours) => {
//     const dayType = calculateDayType(hours);
//     switch (dayType) {
//       case "full":
//         return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded">Full Day</span>;
//       case "half":
//         return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded">Half Day</span>;
//       case "full_leave":
//         return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">Full Day Leave</span>;
//       default:
//         return <span className="px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded">Unknown</span>;
//     }
//   };

//   // const downloadCombinedExcel = () => {
//   //   if (employeeSummary.length === 0) {
//   //     alert("No summary data available");
//   //     return;
//   //   }

//   //   const workbook = XLSX.utils.book_new();

//   //   // ------------------------------------------
//   //   // 🟩 Sheet 1 — All Attndance Summary
//   //   // ------------------------------------------
//   //   const summaryData = employeeSummary.map(emp => ({
//   //     "Employee ID": emp.employeeId,
//   //     "Name": emp.name,
//   //     "Month": emp.month,
//   //     "Present Days": emp.presentDays,
//   //     "Late Days": emp.lateDays,
//   //     "Onsite Days": emp.onsiteDays,
//   //     "Half Day Leaves": emp.halfDayLeaves,
//   //     "Full Day Leaves": emp.fullDayLeaves,
//   //     "Working Days": emp.totalWorkingDays.toFixed(1)
//   //   }));

//   //   const summarySheet = XLSX.utils.json_to_sheet(summaryData);
//   //   XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

//   //   // ------------------------------------------
//   //   // 🟦 Sheets for EACH Employee — Attendance Details
//   //   // ------------------------------------------
//   //   const uniqueEmployees = [...new Set(records.map(r => r.employeeId))];

//   //   uniqueEmployees.forEach(empId => {
//   //     const empRecords = records.filter(rec => rec.employeeId === empId);
//   //     const employee = employees.find(e => e.employeeId === empId);

//   //     const detailData = empRecords.map(rec => {
//   //       const checkIn = new Date(rec.checkInTime);
//   //       const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

//   //       const hours = rec.totalHours ||
//   //         (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

//   //       return {
//   //         "Employee ID": rec.employeeId,
//   //         "Employee Name": employee?.name || "N/A",
//   //         "Date": checkIn.toLocaleDateString("en-IN"),
//   //         "Check-In": formatDate(rec.checkInTime),
//   //         "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
//   //         // "Region": rec.region || "-",
//   //         "Hours": hours,
//   //         // "Comment": rec.comment || "-"
//   //       };
//   //     });

//   //     const empSheet = XLSX.utils.json_to_sheet(detailData);

//   //     const sheetName =
//   //       (employee?.name || empId).replace(/[^A-Za-z0-9]/g, "").substring(0, 28);

//   //     XLSX.utils.book_append_sheet(workbook, empSheet, sheetName);
//   //   });

//   //   // ------------------------------------------
//   //   // 🟪 Final Export
//   //   // ------------------------------------------
//   //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//   //   const blob = new Blob([excelBuffer], {
//   //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   //   });

//   //   saveAs(blob, `Attendance_Report_All_Employees.xlsx`);
//   // };


//   // ✅ Initialize on component mount
 
//   const downloadCombinedExcel = () => {
//   if (employeeSummary.length === 0) {
//     alert("No summary data available");
//     return;
//   }

//   const workbook = XLSX.utils.book_new();

//   // ------------------------------------------
//   // 🟩 Sheet 1 — Filtered Attndance Summary
//   // ------------------------------------------
//   const summaryData = employeeSummary.map(emp => ({
//     "Employee ID": emp.employeeId,
//     "Name": emp.name,
//     "Month": emp.month,
//     "Present Days": emp.presentDays,
//     "Late Days": emp.lateDays,
//     "Onsite Days": emp.onsiteDays,
//     "Half Day Leaves": emp.halfDayLeaves,
//     "Full Day Leaves": emp.fullDayLeaves,
//     "Working Days": emp.totalWorkingDays.toFixed(1)
//   }));

//   const summarySheet = XLSX.utils.json_to_sheet(summaryData);
//   XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

//   // ------------------------------------------
//   // 🟦 Filter Data by Date
//   // ------------------------------------------
//   // 👉 IMPORTANT: use filteredRecords, NOT records
//   const filtered = filteredRecords.length > 0 ? filteredRecords : records;

//   const uniqueEmployees = [
//     ...new Set(filtered.map(r => r.employeeId))
//   ];

//   // ------------------------------------------
//   // 🟦 Sheets for EACH Employee — Filtered Attendance Details
//   // ------------------------------------------
//   uniqueEmployees.forEach(empId => {
//     const empRecords = filtered.filter(rec => rec.employeeId === empId);
//     const employee = employees.find(e => e.employeeId === empId);

//     const detailData = empRecords.map(rec => {
//       const checkIn = new Date(rec.checkInTime);
//       const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

//       const hours = rec.totalHours ||
//         (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

//       return {
//         "Employee ID": rec.employeeId,
//         "Employee Name": employee?.name || "N/A",
//         "Date": checkIn.toLocaleDateString("en-IN"),
//         "Check-In": formatDate(rec.checkInTime),
//         "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
//         "Hours": hours,
//       };
//     });

//     const empSheet = XLSX.utils.json_to_sheet(detailData);

//     const sheetName =
//       (employee?.name || empId)
//         .replace(/[^A-Za-z0-9]/g, "")
//         .substring(0, 28);

//     XLSX.utils.book_append_sheet(workbook, empSheet, sheetName);
//   });

//   // ------------------------------------------
//   // 🟪 Final Export
//   // ------------------------------------------
//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array",
//   });

//   const blob = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   saveAs(blob, `Attendance_Report_All_Employees.xlsx`);
// };

 
 
//   useEffect(() => {
//     fetchAllData();

//     // Setup auto-save interval
//     autoSaveIntervalRef.current = setInterval(() => {
//       if (employeeSummary.length > 0 &&
//         JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current) &&
//         !isSavingRef.current) {
//         console.log("5-minute auto-save triggered...");
//         autoSaveSummary("scheduled");
//       }
//     }, 5 * 60 * 1000);

//     return () => {
//       if (autoSaveIntervalRef.current) {
//         clearInterval(autoSaveIntervalRef.current);
//       }
//       if (saveStatusTimeoutRef.current) {
//         clearTimeout(saveStatusTimeoutRef.current);
//       }
//     };
//   }, []);

//   // ✅ Auto-save when summary changes
//   useEffect(() => {
//     if (!employeeSummary.length || isSavingRef.current) return;

//     const hasSummaryChanged =
//       JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current);

//     if (hasSummaryChanged) {
//       console.log("Summary changed, auto-saving...");
//       const changeTimestamp = Date.now();

//       const timeoutId = setTimeout(() => {
//         autoSaveSummary("auto", changeTimestamp);
//       }, 2000);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [employeeSummary]);

//   // ✅ Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = employeeSummary.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employeeSummary.length / itemsPerPage);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
//     } else {
//       const startPage = Math.max(1, currentPage - 2);
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//       for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
//     }

//     return pageNumbers;
//   };

//   if (loading) return <div className="flex items-center justify-center min-h-screen">
//     <div className="text-lg font-semibold text-blue-600">Loading attendance records...</div>
//   </div>;

//   if (error) return <div className="flex items-center justify-center min-h-screen">
//     <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
//   </div>;

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-7xl">

//         {/* Save Status Alert */}
//         {saveStatus && (
//           <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${saveStatus.includes("✅") || saveStatus.includes("successfully")
//               ? "bg-green-500 border-l-4 border-green-600"
//               : "bg-red-500 border-l-4 border-red-600"
//             }`}>
//             {saveStatus}
//           </div>
//         )}

//         <h1 className="mb-6 text-3xl font-bold text-blue-700">
//           📊 Employee Attendance Dashboard
//         </h1>

//         {/* Working Hours Info */}
//         <div className="p-4 mb-6 bg-white border border-blue-300 rounded-lg shadow-sm">
//           <h3 className="font-semibold text-blue-700">📋 Working Hours Criteria:</h3>
//           <div className="grid grid-cols-1 gap-2 mt-2 text-sm md:grid-cols-4">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//               <span><strong>Full Day:</strong> ≥ {FULL_DAY_HOURS} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//               <span><strong>Half Day:</strong> ≥ {FULL_DAY_LEAVE_THRESHOLD} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//               <span><strong>Full Day Leave:</strong> &lt; {FULL_DAY_LEAVE_THRESHOLD} hours</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//               <span><strong>Onsite:</strong> Marked as Onsite</span>
//             </div>
//           </div>
//         </div>

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
//             Apply Date Filter
//           </button>

//           <div className="ml-4">
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
//             Clear All
//           </button>

//           {/* Manual Save Button */}
//           <button
//             onClick={handleManualSave}
//             className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
//             title="Manually save current summary to database"
//           >
//             💾 Save Now
//           </button>
//         </div>

//         {/* Filter Status */}
//         <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
//           💡 <strong>Filter Status:</strong>
//           {fromDate && toDate && ` Date Range: ${fromDate} to ${toDate}`}
//           {selectedMonth && ` Month: ${selectedMonth}`}
//           {!fromDate && !toDate && !selectedMonth && ' Showing all records'}
//           {employeeSummary.length > 0 && ` | Found ${employeeSummary.length} employees`}
//         </div>

//         {/* Summary Table */}
//         <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
//           <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
//             <h2 className="text-2xl font-semibold text-purple-700">
//               👥 Attndance Summary ({employeeSummary.length} employees)
//             </h2>
//               <button
//                     onClick={downloadCombinedExcel}
//                     className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                   >
//                     ⬇ Download Attendance
//                   </button>

//             <div className="flex flex-wrap items-center gap-4">
//               {/* Items per page selector */}
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">
//                   Show:
//                 </label>
//                 <select
//                   value={itemsPerPage}
//                   onChange={handleItemsPerPageChange}
//                   className="p-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="text-sm text-gray-600">entries</span>
//               </div>

//               {/* <button
//                 onClick={() => {
//                   const header = [
//                     "Employee ID",
//                     "Name",
//                     "Month",
//                     "Present Days",
//                     "Late Days",
//                     "Onsite Days",
//                     "Half Days",
//                     "Full Day Leaves",
//                     "Working Days"
//                   ];
//                   const rows = employeeSummary.map((emp) => [
//                     emp.employeeId,
//                     emp.name,
//                     emp.month,
//                     emp.presentDays,
//                     emp.lateDays,
//                     emp.onsiteDays,
//                     emp.halfDayLeaves,
//                     emp.fullDayLeaves,
//                     emp.totalWorkingDays.toFixed(1)
//                   ]);
//                   const csv =
//                     "data:text/csv;charset=utf-8," +
//                     [header, ...rows].map((r) => r.join(",")).join("\n");
//                   const link = document.createElement("a");
//                   link.href = encodeURI(csv);
//                   link.download = "employee_summary.csv";
//                   link.click();
//                 }}
//                 className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//               >
//                 ⬇ Download Summary
//               </button> */}

//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm border">
//               <thead className="text-white bg-gradient-to-r from-blue-500 to-purple-600">
//                 <tr>
//                   <th className="px-6 py-3 text-left">Employee ID</th>
//                   <th className="px-6 py-3 text-left">Name</th>
//                   <th className="px-6 py-3">Month</th>
//                   <th className="px-6 py-3">Present</th>
//                   <th className="px-6 py-3">Late</th>
//                   <th className="px-6 py-3">Onsite</th>
//                   <th className="px-6 py-3">Half Day</th>
//                   <th className="px-6 py-3">Full Day Leave</th>
//                   <th className="px-6 py-3">Working Days</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {currentItems.map((emp) => (
//                   <tr
//                     key={emp.employeeId}
//                     onClick={() => handleViewDetails(emp.employeeId)}
//                     className="border-t cursor-pointer hover:bg-blue-50"
//                   >
//                     <td className="px-6 py-3">{emp.employeeId}</td>
//                     <td className="px-6 py-3">{emp.name}</td>
//                     <td className="px-6 py-3 font-medium text-gray-700">{emp.month}</td>
//                     <td className="px-6 py-3 text-green-700">{emp.presentDays}</td>
//                     <td className="px-6 py-3 text-orange-700">{emp.lateDays}</td>
//                     <td className="px-6 py-3 text-blue-700">{emp.onsiteDays}</td>
//                     <td className="px-6 py-3 text-yellow-700">
//                       {emp.halfDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 text-red-700">
//                       {emp.fullDayLeaves}
//                     </td>
//                     <td className="px-6 py-3 font-bold text-purple-700">
//                       {emp.totalWorkingDays.toFixed(1)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination Controls */}
//             {employeeSummary.length > 0 && (
//               <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
//                 <div className="text-sm text-gray-600">
//                   Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employeeSummary.length)} of {employeeSummary.length} entries
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className={`px-3 py-1 text-sm border rounded-lg ${currentPage === 1
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                   >
//                     Previous
//                   </button>

//                   {getPageNumbers().map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageClick(page)}
//                       className={`px-3 py-1 text-sm border rounded-lg ${currentPage === page
//                           ? "text-white bg-blue-600 border-blue-600"
//                           : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                         }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`px-3 py-1 text-sm border rounded-lg ${currentPage === totalPages
//                         ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//                         : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
//                       }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}

//             {employeeSummary.length === 0 && (
//               <div className="py-8 text-center text-gray-500">
//                 No records found for the selected filter
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Details Modal */}
//         {selectedEmployee && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white p-6 rounded-xl shadow-xl max-w-7xl w-full max-h-[80vh] overflow-y-auto">

//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-blue-700">
//                   🧾 Attendance Details — {selectedEmployee}
//                 </h3>
//                 <div className="flex items-center gap-3">
//                   {/* Download Button */}

//                   {/* <button
//                     onClick={() => downloadEmployeeDetails(selectedEmployee, employeeDetails)}
//                     className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                     title="Download attendance details as CSV"
//                   >
//                     ⬇ Download Details
//                   </button> */}

//                   <button
//                     onClick={downloadCombinedExcel}
//                     className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                   >
//                     ⬇ Download Attendance
//                   </button>


//                   <button
//                     onClick={closeModal}
//                     className="text-lg font-bold text-red-600 hover:text-red-700"
//                   >
//                     ✖
//                   </button>
//                 </div>
//               </div>

//               {/* Employee Info Summary */}
//               <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
//                 <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
//                   <div>
//                     <span className="font-semibold text-blue-700">Employee ID:</span>
//                     <span className="ml-2">{selectedEmployee}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Name:</span>
//                     <span className="ml-2">
//                       {employees.find(emp => emp.employeeId === selectedEmployee)?.name || 'N/A'}
//                     </span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Total Records:</span>
//                     <span className="ml-2">{employeeDetails.length}</span>
//                   </div>
//                   <div>
//                     <span className="font-semibold text-blue-700">Period:</span>
//                     <span className="ml-2">
//                       {fromDate && toDate ? `${fromDate} to ${toDate}` :
//                         selectedMonth ? selectedMonth : 'All Records'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <table className="w-full text-sm border">
//                 <thead className="text-white bg-blue-600">
//                   <tr>
//                     <th className="px-4 py-2">Employee ID</th>
//                     <th className="px-4 py-2">Name</th>
//                     <th className="px-4 py-2">Date</th>
//                     <th className="px-4 py-2">Check-In</th>
//                     <th className="px-4 py-2">Check-Out</th>
//                     <th className="px-4 py-2">Region</th>
//                     <th className="px-4 py-2">Hours</th>
//                     <th className="px-4 py-2">Day Type</th>
//                     <th className="px-4 py-2">Action</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {employeeDetails.map((rec, i) => {
//                     const checkIn = new Date(rec.checkInTime);
//                     const checkOut = rec.checkOutTime ?
//                       new Date(rec.checkOutTime) : null;

//                     const diffHrs = checkOut
//                       ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2)
//                       : "-";

//                     const currentHours = rec.totalHours || diffHrs;
//                     const employee = employees.find(emp => emp.employeeId === rec.employeeId);

//                     return (
//                       <tr key={i} className="border-t hover:bg-blue-50">
//                         {/* Employee ID */}
//                         <td className="px-4 py-2 font-medium text-gray-700">
//                           {rec.employeeId}
//                         </td>

//                         {/* Employee Name */}
//                         <td className="px-4 py-2">
//                           {employee?.name || 'N/A'}
//                         </td>

//                         <td className="px-4 py-2">
//                           {checkIn.toLocaleDateString("en-IN")}
//                         </td>

//                         <td className="px-4 py-2">{formatDate(rec.checkInTime)}</td>

//                         <td className="px-4 py-2">
//                           {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
//                         </td>

//                         <td className="px-4 py-2">
//                           <select
//                             className="w-full px-2 py-1 border rounded"
//                             value={rec.region || ""}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].region = e.target.value;
//                               if (e.target.value !== "Comment") {
//                                 updated[i].comment = "";
//                               }
//                               setEmployeeDetails(updated);
//                             }}
//                           >
//                             <option value="">Select</option>
//                             <option value="Onsite">Onsite</option>
//                             <option value="Remote">Remote</option>
//                             <option value="Hybrid">Hybrid</option>
//                             <option value="Comment">Comment (Type)</option>
//                           </select>

//                           {rec.region === "Comment" && (
//                             <input
//                               type="text"
//                               placeholder="Type comment here..."
//                               className="w-full px-2 py-1 mt-2 border rounded"
//                               value={rec.comment || ""}
//                               onChange={(e) => {
//                                 const updated = [...employeeDetails];
//                                 updated[i].comment = e.target.value;
//                                 setEmployeeDetails(updated);
//                               }}
//                             />
//                           )}
//                         </td>

//                         <td className="px-4 py-2">
//                           <input
//                             type="number"
//                             step="0.1"
//                             min="0"
//                             max="24"
//                             className="w-20 px-2 py-1 border rounded"
//                             value={rec.hours || rec.totalHours || diffHrs}
//                             onChange={(e) => {
//                               const updated = [...employeeDetails];
//                               updated[i].hours = e.target.value;
//                               setEmployeeDetails(updated);
//                             }}
//                           />
//                         </td>

//                         <td className="px-4 py-2">
//                           {getDayTypeBadge(currentHours)}
//                         </td>

//                         <td className="px-4 py-2">
//                           <button
//                             className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
//                             onClick={() => handleSaveAttendance(rec, rec.hours || rec.totalHours, rec.region, rec.comment, i)}
//                           >
//                             Save
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {/* No Records Message */}
//               {employeeDetails.length === 0 && (
//                 <div className="py-8 text-center text-gray-500">
//                   No attendance records found for this employee
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

import { saveAs } from "file-saver";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

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
  const [saveStatus, setSaveStatus] = useState("");

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
  const isSavingRef = useRef(false);
  const lastSaveTimestampRef = useRef(0);

  // Constants for working hours calculation - UPDATED THRESHOLDS
  const FULL_DAY_THRESHOLD = 8.80; // 8.81+ hours = Full Day
  const HALF_DAY_THRESHOLD = 4;    // 4 to 8.80 hours = Half Day

  // ✅ Close modal function
  const closeModal = () => {
    setSelectedEmployee(null);
    setEmployeeDetails([]);
  };

  // ✅ Fix wrong summary data in frontend - UPDATED VERSION
  const fixSummaryDataInFrontend = (summary, month) => {
    if (!summary.length || !month) return summary;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    const [selectedYear, selectedMonthNum] = month.split('-').map(Number);
    
    // 🚨 IMPORTANT: Check if selected month is FUTURE month
    const isFutureMonth = selectedYear > currentYear || 
      (selectedYear === currentYear && selectedMonthNum > currentMonthNum);
    
    // 🔥 FIX FOR FUTURE MONTHS: All values should be 0
    if (isFutureMonth) {
      console.log(`🔧 Future month detected (${month}), resetting all data to 0`);
      
      return summary.map(emp => ({
        ...emp,
        presentDays: 0,
        lateDays: 0,
        onsiteDays: 0,
        halfDayWorking: 0,
        fullDayNotWorking: 0,
        overTimeHours: 0,
        totalWorkingDays: 0
      }));
    }
    
    // Only fix if current month
    const isCurrentMonth = selectedYear === currentYear && selectedMonthNum === currentMonthNum;
    
    if (isCurrentMonth) {
      console.log(`🔧 Frontend auto-correcting ${month} data to max ${currentDay} days`);
      
      return summary.map(emp => {
        // Check if data needs correction
        const needsCorrection = 
          emp.presentDays > currentDay || 
          emp.lateDays > currentDay ||
          emp.onsiteDays > currentDay ||
          emp.totalWorkingDays > currentDay;
        
        if (!needsCorrection) {
          return emp;
        }
        
        // Correct the data
        const correctedPresent = Math.min(emp.presentDays, currentDay);
        const correctedLate = Math.min(emp.lateDays, currentDay);
        const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
        const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
        const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
        const correctedTotal = correctedPresent + (correctedHalf * 0.5);
        
        console.log(`🔧 ${emp.employeeId}: present ${emp.presentDays} → ${correctedPresent}, total ${emp.totalWorkingDays} → ${correctedTotal}`);
        
        return {
          ...emp,
          presentDays: correctedPresent,
          lateDays: correctedLate,
          onsiteDays: correctedOnsite,
          halfDayWorking: correctedHalf,
          fullDayNotWorking: correctedFullLeave,
          totalWorkingDays: correctedTotal
        };
      });
    }
    
    // For past months, return as-is
    return summary;
  };

  // ✅ Fetch all data from backend
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch employees
      const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
      if (!empRes.ok) throw new Error("Failed to fetch employees");
      const empData = await empRes.json();
      setEmployees(empData);

      // Fetch attendance records
      const attRes = await fetch(`${BASE_URL}/api/attendance/allattendance`);
      if (!attRes.ok) throw new Error("Failed to fetch attendance records");
      const attData = await attRes.json();

      const sortedRecords = (attData.records || []).sort(
        (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
      );

      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);

      // Calculate summary from backend
      await calculateSummaryFromBackend();

    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate summary using backend API
  const calculateSummaryFromBackend = async () => {
    try {
      console.log("📊 Fetching summary for month:", selectedMonth);
      
      const response = await fetch(`${BASE_URL}/api/attendancesummary/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: fromDate || null,
          toDate: toDate || null,
          month: selectedMonth || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("📦 Backend summary received:", {
          count: result.summary?.length,
          sample: result.summary?.[0]
        });
        
        // ✅ CRITICAL FIX: Apply frontend correction
        const correctedSummary = fixSummaryDataInFrontend(result.summary, selectedMonth);
        
        console.log("✅ Final corrected summary:", {
          count: correctedSummary.length,
          sample: correctedSummary?.[0]
        });
        
        setEmployeeSummary(correctedSummary);
        previousSummaryRef.current = JSON.parse(JSON.stringify(correctedSummary));
      } else {
        throw new Error(result.message || "Failed to calculate summary");
      }
    } catch (error) {
      console.error("Error calculating summary:", error);
      setError("Failed to calculate attendance summary");
    }
  };

  // ✅ Fix wrong data in database
  const handleFixWrongData = async () => {
    if (!selectedMonth) {
      alert("Please select a month first");
      return;
    }
    
    try {
      setLoading(true);
      showSaveStatus("🔧 Fixing wrong data...");
      
      const response = await fetch(`${BASE_URL}/api/attendancesummary/fix-summary-data`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          month: selectedMonth 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSaveStatus(`✅ Fixed ${result.fixedCount} records for ${selectedMonth}`);
        // Refresh data
        await calculateSummaryFromBackend();
      } else {
        showSaveStatus("❌ Failed to fix data: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error fixing data:", error);
      showSaveStatus("🚨 Error fixing data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update attendance record in backend
  const updateAttendanceRecord = async (attendanceId, hours, region, comment) => {
    try {
      const response = await fetch(`${BASE_URL}/api/attendancesummary/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId,
          hours: hours !== undefined ? parseFloat(hours) : undefined,
          region,
          comment
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating attendance:", error);
      return { success: false, message: "Network error" };
    }
  };

  // ✅ Handle save with backend update
  const handleSaveAttendance = async (rec, hours, region, comment, index) => {
    try {
      const hoursValue = hours !== undefined ? parseFloat(hours) : rec.totalHours;

      const result = await updateAttendanceRecord(rec._id, hoursValue, region, comment);

      if (result.success) {
        showSaveStatus("✅ Record updated successfully!");

        // Update local state
        const updatedDetails = employeeDetails.map((detail, idx) =>
          idx === index
            ? {
              ...detail,
              totalHours: hoursValue,
              region: region,
              comment: comment
            }
            : detail
        );
        setEmployeeDetails(updatedDetails);

        // Update main records
        const updatedRecords = records.map(record =>
          record._id === rec._id
            ? {
              ...record,
              totalHours: hoursValue,
              region: region,
              comment: comment
            }
            : record
        );

        setRecords(updatedRecords);
        setFilteredRecords(updatedRecords);

        // Recalculate summary with updated data
        await calculateSummaryFromBackend();

      } else {
        showSaveStatus("❌ Failed: " + (result.message || "Unknown error"), "error");
      }
    } catch (error) {
      showSaveStatus("🚨 Error updating record", "error");
    }
  };

  // ✅ Auto-save summary to backend
  const autoSaveSummary = async (type = "auto", changeTimestamp = null) => {
    if (changeTimestamp && changeTimestamp < lastSaveTimestampRef.current) {
      console.log("Skipping outdated save request");
      return;
    }

    if (isSavingRef.current || employeeSummary.length === 0) {
      console.log("Save already in progress or no data, skipping...");
      return;
    }

    isSavingRef.current = true;
    lastSaveTimestampRef.current = changeTimestamp || Date.now();

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

      if (result.success) {
        console.log("✅ Summary Saved Successfully!", result);
        previousSummaryRef.current = JSON.parse(JSON.stringify(employeeSummary));

        if (type === "scheduled") {
          showSaveStatus("✅ Data auto-saved successfully!");
        } else if (type === "auto") {
          showSaveStatus("✅ Changes saved automatically!");
        } else {
          showSaveStatus("✅ Data saved successfully!");
        }
      } else {
        console.error("❌ Save Failed:", result.message);
        showSaveStatus("❌ Failed to save data!", "error");
      }
    } catch (err) {
      console.error("🚨 Save Error:", err);
      showSaveStatus("🚨 Error saving data!", "error");
    } finally {
      isSavingRef.current = false;
    }
  };

  // ✅ Fetch employee details from backend
  const handleViewDetails = async (employeeId) => {
    try {
      setSelectedEmployee(employeeId);

      const params = new URLSearchParams({
        employeeId,
        ...(fromDate && toDate && { fromDate, toDate }),
        ...(selectedMonth && { month: selectedMonth })
      });

      const response = await fetch(`${BASE_URL}/api/attendancesummary/employee-details?${params}`);
      const result = await response.json();

      if (result.success) {
        setEmployeeDetails(result.details);
      } else {
        throw new Error(result.message || "Failed to fetch employee details");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      showSaveStatus("❌ Error loading employee details", "error");
    }
  };

  // ✅ Date range filter
  const handleDateRangeFilter = async () => {
    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error applying date filter:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Month filter
  const handleMonthChange = async (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");

    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error applying month filter:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear filters
  const clearFilters = async () => {
    setFromDate("");
    setToDate("");
    setSelectedMonth("");

    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error clearing filters:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Manual save function
  const handleManualSave = async () => {
    try {
      console.log("Manual save triggered...");
      await autoSaveSummary("manual");
    } catch (err) {
      console.error("Manual save failed:", err);
      showSaveStatus("❌ Failed to save data!", "error");
    }
  };

  // ✅ Helper functions - UPDATED LOGIC
// ✅ Calculate OT for single day (Details modal)
// ✅ OT for single day (Attendance Details)
const calculateOT = (hours) => {
  const STANDARD_HOURS = 9;
  const h = Number(hours) || 0;
  return h > STANDARD_HOURS ? h - STANDARD_HOURS : 0;
};
// ✅ TOTAL OT for employee (Attendance Summary)
const calculateEmployeeOT = (employeeId) => {
  let totalOT = 0;

  records.forEach((rec) => {
    if (rec.employeeId !== employeeId) return;

    // Month filter
    if (selectedMonth && rec.checkInTime) {
      const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
      if (recMonth !== selectedMonth) return;
    }

    const hours = rec.hours || rec.totalHours || 0;

    // 🔥 SAME LOGIC as Attendance Details
    totalOT += calculateOT(hours);
  });

  return totalOT;
};




  const calculateDayType = (hours) => {
    const numericHours = parseFloat(hours) || 0;

    if (numericHours > FULL_DAY_THRESHOLD) {
      return "full"; // 8.81, 8.82, 8.9, 9.0, etc. = FULL DAY
    } else if (numericHours >= HALF_DAY_THRESHOLD) {
      return "half"; // 4.0 to 8.80 = HALF DAY
    } else {
      return "full_leave"; // 4.0 se kam = FULL LEAVE
    }
  };

  const showSaveStatus = (message, type = "success") => {
    setSaveStatus(message);

    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }

    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus("");
    }, 3000);
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
        // day: "2-digit",
        // month: "short",
        // year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "-";

  const getDayTypeBadge = (hours) => {
    const dayType = calculateDayType(hours);
    switch (dayType) {
      case "full":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded">Full Day</span>;
      case "half":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded">Half Day</span>;
      case "full_leave":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">Full Day Leave</span>;
      default:
        return <span className="px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded">Unknown</span>;
    }
  };

 const downloadCombinedExcel = () => {
  if (employeeSummary.length === 0) {
    alert("No summary data available");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // ------------------------------------------
  // 🟩 Sheet 1 — Filtered Employee Summary
  // ------------------------------------------
 const summaryData = employeeSummary.map(emp => ({
  "Employee ID": emp.employeeId,
  "Name": emp.name,
  "Month": emp.month,
  "Present Days": emp.presentDays,
  "Late Days": emp.lateDays,
  "Onsite Days": emp.onsiteDays,
  "Half Day ": emp.halfDayWorking || emp.halfDayLeaves || 0,
  "Full Day ": emp.fullDayNotWorking || emp.fullDayLeaves || 0,

  // 🔥 SAME OT LOGIC AS UI
  "Over Time": calculateEmployeeOT(emp.employeeId).toFixed(2),

  "Working Days": emp.totalWorkingDays.toFixed(1)
}));


  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // ------------------------------------------
  // 🟦 Get Filtered Records - DATE FILTER APPLY KARO
  // ------------------------------------------
  let filteredDetails = [...records];

  // Apply same date filters as summary
  if (fromDate && toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    
    filteredDetails = filteredDetails.filter(r => {
      if (!r.checkInTime) return false;
      const recordDate = new Date(r.checkInTime);
      return recordDate >= from && recordDate <= to;
    });
  }

  // Month filter apply karo
  if (selectedMonth) {
    filteredDetails = filteredDetails.filter(r => {
      if (!r.checkInTime) return false;
      const recordMonth = new Date(r.checkInTime).toISOString().slice(0, 7);
      return recordMonth === selectedMonth;
    });
  }

  // Filter only employees that are in the summary
  const summaryEmployeeIds = employeeSummary.map(emp => emp.employeeId);
  filteredDetails = filteredDetails.filter(r => 
    summaryEmployeeIds.includes(r.employeeId)
  );

  console.log("Filtered Details for Excel:", {
    totalRecords: records.length,
    filteredRecords: filteredDetails.length,
    fromDate,
    toDate,
    selectedMonth,
    summaryEmployees: summaryEmployeeIds.length
  });

  // ------------------------------------------
  // 🟦 Sheets for EACH Employee — Filtered Attendance Details
  // ------------------------------------------
  const uniqueEmployees = [
    ...new Set(filteredDetails.map(r => r.employeeId))
  ];

  uniqueEmployees.forEach(empId => {
    const empRecords = filteredDetails.filter(rec => rec.employeeId === empId);
    
    // ✅ SORT RECORDS BY DATE IN ASCENDING ORDER (1 Nov to 21 Nov)
    const sortedEmpRecords = empRecords.sort((a, b) => {
      const dateA = new Date(a.checkInTime);
      const dateB = new Date(b.checkInTime);
      return dateA - dateB; // Ascending order (oldest to newest)
    });

    const employee = employees.find(e => e.employeeId === empId);

    const detailData = sortedEmpRecords.map(rec => {
      const checkIn = new Date(rec.checkInTime);
      const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;

      const hours = rec.totalHours ||
        (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

     return {
  "Employee ID": rec.employeeId,
  "Employee Name": employee?.name || "N/A",
  "Date": checkIn.toLocaleDateString("en-IN"),
  "Check-In": formatDate(rec.checkInTime),
  "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
  "Hours": hours,

  // 🔥 SAME DAILY OT LOGIC
  "Over Time": calculateOT(hours).toFixed(2),
};

    });

    // Only create sheet if there are records
    if (detailData.length > 0) {
      const empSheet = XLSX.utils.json_to_sheet(detailData);

      const sheetName =
        (employee?.name || empId)
          .replace(/[^A-Za-z0-9]/g, "")
          .substring(0, 28);

      XLSX.utils.book_append_sheet(workbook, empSheet, sheetName);
    }
  });

  // ------------------------------------------
  // 🟪 Final Export
  // ------------------------------------------
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // File name mein filter information add karo
  let fileName = "Attendance_Report";
  if (fromDate && toDate) {
    fileName += `_${fromDate}_to_${toDate}`;
  }
  if (selectedMonth) {
    fileName += `_${selectedMonth}`;
  }
  fileName += ".xlsx";

  saveAs(blob, fileName);
};

  // ✅ Initialize on component mount
  useEffect(() => {
    fetchAllData();

    // Setup auto-save interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (employeeSummary.length > 0 &&
        JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current) &&
        !isSavingRef.current) {
        console.log("5-minute auto-save triggered...");
        autoSaveSummary("scheduled");
      }
    }, 5 * 60 * 1000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Auto-save when summary changes
  useEffect(() => {
    if (!employeeSummary.length || isSavingRef.current) return;

    const hasSummaryChanged =
      JSON.stringify(employeeSummary) !== JSON.stringify(previousSummaryRef.current);

    if (hasSummaryChanged) {
      console.log("Summary changed, auto-saving...");
      const changeTimestamp = Date.now();

      const timeoutId = setTimeout(() => {
        autoSaveSummary("auto", changeTimestamp);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [employeeSummary]);

  // ✅ Debug useEffect - UPDATED WITH FUTURE MONTH DETECTION
  useEffect(() => {
    if (employeeSummary.length > 0 && selectedMonth) {
      console.log("🔍 CURRENT SUMMARY DEBUG:");
      console.log("Selected Month:", selectedMonth);
      console.log("Total Employees:", employeeSummary.length);
      
      const today = new Date();
      const currentDay = today.getDate();
      const currentYear = today.getFullYear();
      const currentMonthNum = today.getMonth() + 1;
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
      
      // Check if future month
      const isFutureMonth = selectedYear > currentYear || 
        (selectedYear === currentYear && selectedMonthNum > currentMonthNum);
      
      if (isFutureMonth) {
        console.log(`⚠️ FUTURE MONTH DETECTED: ${selectedMonth}`);
        console.log(`All values should be 0`);
        
        // Check if any employee has non-zero values
        const employeesWithData = employeeSummary.filter(emp => 
          emp.presentDays > 0 || emp.totalWorkingDays > 0
        );
        
        if (employeesWithData.length > 0) {
          console.log(`❌ BUG FOUND: ${employeesWithData.length} employees have data in future month`);
          employeesWithData.slice(0, 3).forEach(emp => {
            console.log(`   - ${emp.employeeId}: present=${emp.presentDays}, total=${emp.totalWorkingDays}`);
          });
        } else {
          console.log(`✅ Good: All employees have 0 values`);
        }
      }
      
      // Show first 3 employees
      employeeSummary.slice(0, 3).forEach((emp, index) => {
        console.log(`Employee ${index + 1}:`, {
          id: emp.employeeId,
          name: emp.name,
          presentDays: emp.presentDays,
          totalWorkingDays: emp.totalWorkingDays
        });
      });
    }
  }, [employeeSummary, selectedMonth]);

  // ✅ Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employeeSummary.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employeeSummary.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg font-semibold text-blue-600">Loading attendance records...</div>
  </div>;

  if (error) return <div className="flex items-center justify-center min-h-screen">
    <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
  </div>;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Save Status Alert */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${saveStatus.includes("✅") || saveStatus.includes("successfully")
              ? "bg-green-500 border-l-4 border-green-600"
              : "bg-red-500 border-l-4 border-red-600"
            }`}>
            {saveStatus}
          </div>
        )}

        <h1 className="mb-6 text-3xl font-bold text-blue-700">
          📊 Employee Attendance Summary
        </h1>

       {/* Working Hours Info - UPDATED CRITERIA */}
<div className="p-4 mb-6 bg-white border border-blue-300 rounded-lg shadow-sm">

  <h3 className="font-semibold text-blue-700 mb-3">
    📋 Working Hours Criteria:
  </h3>

  {/* Criteria */}
  <div className="grid grid-cols-1 gap-2 mb-4 text-sm md:grid-cols-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span><strong>Full Day:</strong> &gt; {FULL_DAY_THRESHOLD} hrs</span>
    </div>

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <span><strong>Half Day:</strong> {HALF_DAY_THRESHOLD} – {FULL_DAY_THRESHOLD} hrs</span>
    </div>

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <span><strong>Leave:</strong> &lt; {HALF_DAY_THRESHOLD} hrs</span>
    </div>

    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      <span><strong>Onsite:</strong> Marked as Onsite</span>
    </div>
  </div>

  {/* 🔽 FILTERS (ONE ROW – SAME DIV) */}
  <div className="flex flex-wrap items-end gap-4 pt-3 border-t">

    <div>
      <label className="block text-sm font-semibold text-gray-700">From</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="p-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700">To</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="p-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700">Month</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        className="p-2 border rounded-lg"
      />
    </div>

    <button
      onClick={() => handleDateRangeFilter(fromDate, toDate)}
      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
    >
      Apply
    </button>

    <button
      onClick={clearFilters}
      className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
    >
      Clear
    </button>

    {/* <button
      onClick={handleManualSave}
      className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
    >
      💾 Save
    </button> */}

  </div>
</div>


       

        {/* Filter Status
        <div className="p-3 mb-6 text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-lg">
          💡 <strong>Filter Status:</strong>
          {fromDate && toDate && ` Date Range: ${fromDate} to ${toDate}`}
          {selectedMonth && ` Month: ${selectedMonth}`}
          {!fromDate && !toDate && !selectedMonth && ' Showing all records'}
          {employeeSummary.length > 0 && ` | Found ${employeeSummary.length} employees`}
        </div> */}

        {/* Summary Table - UPDATED COLUMN HEADERS */}
        <div className="p-6 mb-8 bg-white border shadow-lg rounded-2xl">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-purple-700">
              👥 Attendance Summary ({employeeSummary.length} employees)
            </h2>
            
            <button
              onClick={downloadCombinedExcel}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              ⬇ Download Attendance
            </button>

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
                  <th className="px-6 py-3">Onsite</th>
                  <th className="px-6 py-3">Half Day </th> {/* Updated header */}
                  <th className="px-6 py-3">Full Day </th> {/* Updated header */}
                  <th className="px-6 py-3">Over Time</th>
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
  {emp.halfDayWorking ?? 0}
</td>

<td className="px-6 py-3 text-red-700">
  {emp.fullDayNotWorking ?? 0}
</td>
<td className="px-4 py-2 font-semibold text-indigo-700">
  {calculateEmployeeOT(emp.employeeId).toFixed(2)}
</td>



<td className="px-6 py-3 font-bold text-purple-700">
  {Number(emp.totalWorkingDays || 0).toFixed(1)}
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
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm border rounded-lg ${currentPage === 1
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                      }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-1 text-sm border rounded-lg ${currentPage === page
                          ? "text-white bg-blue-600 border-blue-600"
                          : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm border rounded-lg ${currentPage === totalPages
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
                No records found for the selected filter
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
       {/* Details Modal */}
{selectedEmployee && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-7xl w-full max-h-[80vh] overflow-y-auto">

      {/* 🔹 HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-700">
          🧾 Attendance Details — {selectedEmployee}
        </h3>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCombinedExcel}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            ⬇ Download Attendance
          </button>

          <button
            onClick={closeModal}
            className="text-lg font-bold text-red-600 hover:text-red-700"
          >
            ✖
          </button>
        </div>
      </div>

      {/* 🔹 EMPLOYEE SUMMARY */}
      <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="font-semibold text-blue-700">Employee ID:</span>
            <span className="ml-2">{selectedEmployee}</span>
          </div>

          <div>
            <span className="font-semibold text-blue-700">Name:</span>
            <span className="ml-2">
              {employees.find(e => e.employeeId === selectedEmployee)?.name || "N/A"}
            </span>
          </div>

          <div>
            <span className="font-semibold text-blue-700">Month:</span>
            <span className="ml-2">{selectedMonth || "Current Month"}</span>
          </div>
        </div>
      </div>

      {(() => {
        const baseDate = selectedMonth
          ? new Date(selectedMonth + "-01")
          : new Date();

        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const monthDates = Array.from({ length: totalDays }, (_, i) => {
          const d = new Date(year, month, i + 1);
          return d.toISOString().split("T")[0];
        });

        const mergedEmployeeDetails = monthDates.map(date => {
          const record = employeeDetails.find(rec =>
            rec.checkInTime &&
            new Date(rec.checkInTime).toISOString().split("T")[0] === date
          );

          return record || {
            _absent: true,
            employeeId: selectedEmployee,
            date,
            checkInTime: null,
            checkOutTime: null,
            reason: "",
            hours: "",
            comment: ""
          };
        });

        return (
          <table className="w-full text-sm border">
            <thead className="text-white bg-blue-600">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Check-In</th>
                <th className="px-4 py-2">Check-Out</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Over Time</th>
                <th className="px-4 py-2">Day Type</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {mergedEmployeeDetails.map((rec, i) => {
                const hours = rec.hours || rec.totalHours || "";
                const currentHours = Number(hours) || 0;
                const otHours = calculateOT(currentHours);

                return (
                  <tr
                    key={i}
                    className={`border-t ${
                      rec._absent ? "bg-gray-100 text-gray-500" : "hover:bg-blue-50"
                    }`}
                  >
                    <td className="px-4 py-2">
                      {(rec._absent
                        ? new Date(rec.date)
                        : new Date(rec.checkInTime)
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-2">
                      {rec.checkInTime ? formatDate(rec.checkInTime) : "-"}
                    </td>

                    <td className="px-4 py-2">
                      {rec.checkOutTime ? formatDate(rec.checkOutTime) : "-"}
                    </td>

                    <td className="px-4 py-2">
                      <select
                        disabled={rec._absent}
                        className="w-full px-2 py-1 border rounded"
                        value={rec.reason || ""}
                      >
                        <option value="">Select</option>
                        <option value="Onsite">Onsite</option>
                        <option value="Field Work">Field Work</option>
                        <option value="Work From Home">Work From Home</option>
                      </select>
                    </td>

                    <td className="px-4 py-2">
                      <input
                        disabled={rec._absent}
                        type="number"
                        className="w-20 px-2 py-1 border rounded"
                        value={hours}
                      />
                    </td>

                    <td className="px-4 py-2 font-semibold text-indigo-700">
                      {otHours.toFixed(2)}
                    </td>

                    <td className="px-4 py-2">
                      {getDayTypeBadge(currentHours)}
                    </td>

                    <td className="px-4 py-2">
                      {!rec._absent && (
                        <button className="px-3 py-1 text-white bg-green-600 rounded">
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })()}
    </div>
  </div>
)}


      </div>

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