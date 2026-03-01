// import axios from "axios";
// import { useEffect, useState } from "react";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const AbsentToday = () => {
//   const [absentEmployees, setAbsentEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

//   useEffect(() => {
//     fetchAbsentEmployees();
//   }, []);

//   const fetchAbsentEmployees = async () => {
//     try {
//       setLoading(true);

//       // Fetch all employees
//       const empResp = await axios.get("https://api.timelyhealth.in/api/employees/get-employees");
//       const employees = empResp.data;

//       // Fetch today’s attendance
//       const attResp = await axios.get("https://api.timelyhealth.in/api/attendance/today");
//       const attendanceData = attResp.data;
//       const attendance = attendanceData.records || [];

//       // Extract unique present employee IDs
//       const presentIds = [
//         ...new Set(
//           attendance.map((a) => {
//             if (typeof a.employeeId === "object") {
//               return a.employeeId.employeeId || a.employeeId._id || "";
//             }
//             return a.employeeId || a.empId || "";
//           }).filter(Boolean)
//         ),
//       ];

//       console.log("✅ Present IDs:", presentIds);

//       // Filter employees who are not present and are active
//       const absents = employees.filter((emp) => {
//         const empId = emp.employeeId || emp._id || emp.empId;

//         // Check if employee is inactive (hidden) using utility
//         if (isEmployeeHidden(emp)) return false;

//         return !presentIds.includes(empId);
//       });

//       console.log("🚨 Absent Employees:", absents);

//       // Format for table
//       const formatted = absents.map((emp) => ({
//         employeeId: emp.employeeId || emp._id,
//         name: emp.name || emp.fullName || "N/A",
//         date: new Date().toLocaleDateString("en-CA"),
//       }));

//       setAbsentEmployees(formatted);
//     } catch (err) {
//       console.error("❌ Error fetching absent employees:", err);
//       setError("Failed to fetch absent employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-600">Loading Absent Employees Today ({today})...</p>;
//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       {/* <h2 className="mb-4 text-2xl font-bold text-gray-800">
//         Absent Employees Today ({today})
//       </h2> */}

//       {absentEmployees.length === 0 ? (
//         <p className="font-semibold text-center text-green-600">
//           No absent employees today 🎉
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm border border-gray-200">
//             <thead className="text-gray-700 bg-gray-100">
//               <tr>
//                 <th className="py-2 text-center">Employee ID</th>
//                 <th className="py-2 text-center border">Name</th>
//                 <th className="px-4 py-2 border">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {absentEmployees.map((emp) => (
//                 <tr
//                   key={emp.employeeId}
//                   className="border-t cursor-pointer hover:bg-gray-50"
//                 >
//                   <td className="px-4 py-2 font-medium">{emp.employeeId}</td>
//                   <td className="px-4 py-2">{emp.name}</td>
//                   <td className="px-4 py-2">{emp.date}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AbsentToday;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaCalendarAlt, FaSearch } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// const AbsentToday = () => {
//   const [absentEmployees, setAbsentEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterType, setFilterType] = useState("date"); // 'date' or 'month'
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
//   // Search filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deptSearchTerm, setDeptSearchTerm] = useState("");
  
//   // Pagination
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });
  
//   const [debug, setDebug] = useState({});

//   useEffect(() => {
//     fetchAbsentEmployees();
//   }, [selectedDate, selectedMonth, filterType]);

//   useEffect(() => {
//     // Apply filters whenever absentEmployees or search terms change
//     filterEmployees();
//   }, [absentEmployees, searchTerm, deptSearchTerm]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, deptSearchTerm, filterType, selectedDate, selectedMonth]);

//   const filterEmployees = () => {
//     let filtered = [...absentEmployees];
    
//     // Filter by Employee ID or Name
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(emp => 
//         emp.employeeId?.toString().toLowerCase().includes(term) ||
//         emp.name?.toLowerCase().includes(term)
//       );
//     }
    
//     // Filter by Department or Designation
//     if (deptSearchTerm.trim()) {
//       const term = deptSearchTerm.toLowerCase().trim();
//       filtered = filtered.filter(emp => 
//         emp.department?.toLowerCase().includes(term) ||
//         emp.designation?.toLowerCase().includes(term)
//       );
//     }
    
//     setFilteredEmployees(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   // Pagination calculations
//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredEmployees.length,
//       totalPages: Math.ceil(filteredEmployees.length / limit)
//     });
//   };

//   const fetchAbsentEmployees = async () => {
//     try {
//       setLoading(true);

//       const [empResp, attResp] = await Promise.all([
//         axios.get(`${BASE_URL}/employees/get-employees`),
//         axios.get(`${BASE_URL}/attendance/allattendance`)
//       ]);

//       const employees = empResp.data || [];
//       const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

//       const attendanceData = attResp.data || [];
//       const allAttendance = Array.isArray(attendanceData)
//         ? attendanceData
//         : attendanceData.records || attendanceData.allAttendance || [];

//       // Get present employees based on filter
//       const presentIds = new Set();
//       const absentCounts = {}; // For month view

//       if (filterType === 'date') {
//         // Date view: Find who is absent on selected date
//         allAttendance.forEach(record => {
//           if (!record.checkInTime) return;
          
//           const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//           if (recordDate !== selectedDate) return;

//           const id = (typeof record.employeeId === 'object' 
//             ? record.employeeId?.employeeId || record.employeeId?._id
//             : record.employeeId);
          
//           if (id) presentIds.add(id.toString());
//         });
//       } else {
//         // Month view: Count absent days for each employee
//         const [year, month] = selectedMonth.split('-').map(Number);
//         const totalDaysInMonth = new Date(year, month, 0).getDate();
        
//         // Initialize counts for all active employees
//         activeEmployees.forEach(emp => {
//           const empId = emp.employeeId || emp._id;
//           absentCounts[empId] = {
//             ...emp,
//             present: 0,
//             totalDays: totalDaysInMonth,
//             employeeId: empId,
//             name: emp.name || emp.fullName || "N/A",
//             department: emp.department || emp.departmentName || "N/A",
//             designation: emp.designation || emp.role || "N/A",
//             joinDate: emp.joinDate
//           };
//         });

//         // Count present days in the month
//         allAttendance.forEach(record => {
//           if (!record.checkInTime) return;
          
//           const recordDate = new Date(record.checkInTime);
//           if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

//           const id = (typeof record.employeeId === 'object' 
//             ? record.employeeId?.employeeId || record.employeeId?._id
//             : record.employeeId);
          
//           if (id && absentCounts[id]) {
//             absentCounts[id].present++;
//           }
//         });
//       }

//       setDebug({
//         totalEmployees: employees.length,
//         activeEmployees: activeEmployees.length,
//         filterType,
//         selectedValue: filterType === 'date' ? selectedDate : selectedMonth
//       });

//       // Process absent employees based on filter type
//       let formatted = [];

//       if (filterType === 'date') {
//         // Date view: Employees not present on selected date
//         const absents = activeEmployees.filter((emp) => {
//           const empId = emp.employeeId || emp._id || emp.empId;
//           return !presentIds.has(empId?.toString());
//         });

//         formatted = absents.map((emp) => {
//           // Calculate last attendance
//           let lastAttendanceDate = null;
//           let lastAttendance = "Never";
          
//           allAttendance.forEach(record => {
//             const id = (typeof record.employeeId === 'object' 
//               ? record.employeeId?.employeeId || record.employeeId?._id
//               : record.employeeId);
            
//             if (id === (emp.employeeId || emp._id) && record.checkInTime) {
//               const recordDate = new Date(record.checkInTime);
//               if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
//                 lastAttendanceDate = recordDate;
//               }
//             }
//           });

//           if (lastAttendanceDate) {
//             const selected_date = new Date(selectedDate);
//             const diffTime = selected_date - lastAttendanceDate;
//             const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//             lastAttendance = `${lastAttendanceDate.toLocaleDateString()} (${daysSince} days ago)`;
//           }

//           return {
//             employeeId: emp.employeeId || emp._id,
//             name: emp.name || emp.fullName || "N/A",
//             date: selectedDate,
//             department: emp.department || emp.departmentName || "N/A",
//             designation: emp.designation || emp.role || "N/A",
//             lastAttendance: lastAttendance,
//             joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A",
//             absentDays: 1
//           };
//         });
//       } else {
//         // Month view: Show absent days count
//         formatted = Object.values(absentCounts)
//           .map(emp => {
//             const absentDays = Math.max(0, emp.totalDays - emp.present);
//             return {
//               employeeId: emp.employeeId || emp._id,
//               name: emp.name || emp.fullName || "N/A",
//               date: selectedMonth,
//               department: emp.department || emp.departmentName || "N/A",
//               designation: emp.designation || emp.role || "N/A",
//               lastAttendance: `${emp.present} present out of ${emp.totalDays} days`,
//               joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A",
//               absentDays: absentDays,
//               presentDays: emp.present,
//               totalDays: emp.totalDays
//             };
//           })
//           .filter(emp => emp.absentDays > 0) // Only show employees with at least 1 absent day
//           .sort((a, b) => b.absentDays - a.absentDays); // Sort by most absent first
//       }

//       setAbsentEmployees(formatted);
//     } catch (err) {
//       console.error("❌ Error fetching absent employees:", err);
//       setError("Failed to fetch absent employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAbsentColor = (absentDays, totalDays) => {
//     const percentage = (absentDays / totalDays) * 100;
//     if (percentage <= 10) return 'bg-green-100 text-green-700';
//     if (percentage <= 25) return 'bg-lime-100 text-lime-700';
//     if (percentage <= 50) return 'bg-yellow-100 text-yellow-700';
//     if (percentage <= 75) return 'bg-orange-100 text-orange-700';
//     return 'bg-red-100 text-red-700';
//   };

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-2 mb-2 bg-white rounded-lg shadow-md">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
//             {/* ID/Name Search */}
//             <div className="relative">
//               <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department/Designation Dropdown */}
//             <div className="relative">
//               <select
//                 value={deptSearchTerm}
//                 onChange={(e) => setDeptSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Departments & Designations</option>
//                 <option value="Laboratory Medicine">Laboratory Medicine</option>
//                 <option value="Sales">Sales</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Medical">Medical</option>
//                 <option value="Nursing">Nursing</option>
//                 <option value="Developer">Developer</option>
//                 <option value="Designer">Designer</option>
//                 <option value="Heath Department">Heath Department</option>
//                 <option value="Management">Management</option>
//               </select>
//             </div>

//             {/* Filter Type */}
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="date">Date </option>
//               <option value="month">Month </option>
//             </select>

//             {/* Date/Month Picker */}
//             <div className="relative">
//               <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               {filterType === "date" ? (
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               ) : (
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               )}
//             </div>

//             {/* Placeholder for alignment */}
//             <div></div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading absent employees...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         ) : filteredEmployees.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg font-semibold text-green-600">
//               {filterType === 'date' 
//                 ? `No absent employees on ${selectedDate} 🎉` 
//                 : `No absent days in ${selectedMonth} 🎉`}
//             </p>
//             <p className="mt-2 text-sm text-gray-500">
//               {filterType === 'date' 
//                 ? 'All active employees are present' 
//                 : 'All employees have perfect attendance'}
//               {(searchTerm || deptSearchTerm) && " - Try clearing search filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Activities Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="py-2 text-center">Employee ID</th>
//                       <th className="py-2 text-center">Name</th>
//                       <th className="py-2 text-center">Department</th>
//                       <th className="py-2 text-center">Designation</th>
//                       {filterType === 'month' && (
//                         <>
//                           <th className="py-2 text-center">Present Days</th>
//                           <th className="py-2 text-center">Absent Days</th>
//                         </>
//                       )}
//                       {filterType === 'date' && (
//                         <th className="py-2 text-center">Last Attendance</th>
//                       )}
//                       <th className="py-2 text-center">Date/Month</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentRows.map((emp) => (
//                       <tr
//                         key={emp.employeeId}
//                         className="transition-colors hover:bg-gray-50"
//                       >
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {emp.department}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {emp.designation}
//                         </td>
                        
//                         {filterType === 'month' && (
//                           <>
//                             <td className="px-2 py-2 text-center">
//                               <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
//                                 {emp.presentDays}
//                               </span>
//                             </td>
//                             <td className="px-2 py-2 text-center">
//                               <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getAbsentColor(emp.absentDays, emp.totalDays)}`}>
//                                 {emp.absentDays}
//                               </span>
//                             </td>
//                           </>
//                         )}
                        
//                         {filterType === 'date' && (
//                           <td className="px-2 py-2 text-center">
//                             <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
//                               emp.lastAttendance.includes('Never') 
//                                 ? 'bg-gray-100 text-gray-600' 
//                                 : 'bg-orange-100 text-orange-700'
//                             }`}>
//                               {emp.lastAttendance}
//                             </span>
//                           </td>
//                         )}
                        
//                         <td className="px-2 py-2 text-sm text-center text-gray-600">
//                           {filterType === 'date' ? emp.date : emp.date}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredEmployees.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 text-center border-t border-gray-200 bg-gray-50">
//                   <div className="flex flex-wrap items-center justify-between gap-4">
//                     {/* Left Side - Showing Info + Select */}
//                     <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                       <span>Showing</span>
//                       <span className="font-medium">
//                         {(pagination.currentPage - 1) * pagination.limit + 1}
//                       </span>
//                       <span>to</span>
//                       <span className="font-medium">
//                         {Math.min(
//                           pagination.currentPage * pagination.limit,
//                           pagination.totalCount
//                         )}
//                       </span>
//                       <span>of</span>
//                       <span className="font-medium">
//                         {pagination.totalCount}
//                       </span>
//                       <span>results</span>

//                       {/* Select Dropdown */}
//                       <select
//                         value={pagination.limit}
//                         onChange={(e) => {
//                           const newLimit = Number(e.target.value);
//                           handleItemsPerPageChange(newLimit);
//                         }}
//                         className="p-1 ml-2 text-sm border rounded-lg"
//                       >
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={20}>20</option>
//                         <option value={50}>50</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage - 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === 1}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {[...Array(pagination.totalPages)].map((_, index) => {
//                         const page = index + 1;
//                         if (
//                           page === 1 ||
//                           page === pagination.totalPages ||
//                           (page >= pagination.currentPage - 1 &&
//                             page <= pagination.currentPage + 1)
//                         ) {
//                           return (
//                             <button
//                               key={page}
//                               onClick={() =>
//                                 setPagination((prev) => ({
//                                   ...prev,
//                                   currentPage: page,
//                                 }))
//                               }
//                               className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                                 pagination.currentPage === page
//                                   ? "bg-blue-600 text-white"
//                                   : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                               }`}
//                             >
//                               {page}
//                             </button>
//                           );
//                         } else if (
//                           page === pagination.currentPage - 2 ||
//                           page === pagination.currentPage + 2
//                         ) {
//                           return (
//                             <span key={page} className="px-2 text-gray-500">
//                               ...
//                             </span>
//                           );
//                         }
//                         return null;
//                       })}
//                     </div>

//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage + 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === pagination.totalPages}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AbsentToday;


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import "../index.css";
import { isEmployeeHidden } from "../utils/employeeStatus";
const BASE_URL = API_BASE_URL;

const AbsentToday = () => {
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState("");
  
  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  
  const [debug, setDebug] = useState({});

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

  // Extract unique departments and designations from employees
  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  useEffect(() => {
    fetchAbsentEmployees();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Apply filters whenever absentEmployees or search terms change
    filterEmployees();
  }, [absentEmployees, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const filterEmployees = () => {
    let filtered = [...absentEmployees];
    
    // Filter by Employee ID or Name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.employeeId?.toString().toLowerCase().includes(term) ||
        emp.name?.toLowerCase().includes(term)
      );
    }
    
    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(emp => emp.designation === filterDesignation);
    }
    
    setFilteredEmployees(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  // Pagination calculations
  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredEmployees.length,
      totalPages: Math.ceil(filteredEmployees.length / limit)
    });
  };

  const fetchAbsentEmployees = async () => {
    try {
      setLoading(true);

      const [empResp, attResp] = await Promise.all([
        axios.get(`${BASE_URL}/employees/get-employees`),
        axios.get(`${BASE_URL}/attendance/allattendance`)
      ]);

      const employees = empResp.data || [];
      const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
      
      // Extract unique values for filters
      extractUniqueValues(activeEmployees);

      const attendanceData = attResp.data || [];
      const allAttendance = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.records || attendanceData.allAttendance || [];

      // Get present employees based on filters
      const presentIds = new Set();
      const absentCounts = {}; // For month view

      // Determine filter mode
      const isMonthMode = selectedMonth && !fromDate && !toDate;
      const isRangeMode = fromDate && toDate;
      const isSingleDateMode = fromDate && !toDate; // Single date via fromDate only

      if (isMonthMode) {
        // Month view: Count absent days for each employee
        const [year, month] = selectedMonth.split('-').map(Number);
        const totalDaysInMonth = new Date(year, month, 0).getDate();
        
        // Initialize counts for all active employees
        activeEmployees.forEach(emp => {
          const empId = emp.employeeId || emp._id;
          absentCounts[empId] = {
            ...emp,
            present: 0,
            totalDays: totalDaysInMonth,
            employeeId: empId,
            name: emp.name || emp.fullName || "N/A",
            department: emp.department || emp.departmentName || "N/A",
            designation: emp.designation || emp.role || "N/A",
            joinDate: emp.joinDate
          };
        });

        // Count present days in the month
        allAttendance.forEach(record => {
          if (!record.checkInTime) return;
          
          const recordDate = new Date(record.checkInTime);
          if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

          const id = (typeof record.employeeId === 'object' 
            ? record.employeeId?.employeeId || record.employeeId?._id
            : record.employeeId);
          
          if (id && absentCounts[id]) {
            absentCounts[id].present++;
          }
        });
      } else {
        // Date or range mode
        const fromDateTime = fromDate ? new Date(fromDate) : null;
        const toDateTime = toDate ? new Date(toDate) : null;
        
        if (fromDateTime) fromDateTime.setHours(0, 0, 0, 0);
        if (toDateTime) toDateTime.setHours(23, 59, 59, 999);

        // Track which employees were present
        allAttendance.forEach(record => {
          if (!record.checkInTime) return;
          
          const recordDateTime = new Date(record.checkInTime);
          
          // Apply filters
          let shouldInclude = false;
          
          if (fromDateTime && toDateTime) {
            // Range mode
            if (recordDateTime >= fromDateTime && recordDateTime <= toDateTime) {
              shouldInclude = true;
            }
          } else if (fromDateTime && !toDateTime) {
            // Single date mode
            const recordDateStr = recordDateTime.toISOString().split('T')[0];
            if (recordDateStr === fromDate) {
              shouldInclude = true;
            }
          }

          if (!shouldInclude) return;

          const id = (typeof record.employeeId === 'object' 
            ? record.employeeId?.employeeId || record.employeeId?._id
            : record.employeeId);
          
          if (id) presentIds.add(id.toString());
        });
      }

      setDebug({
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        fromDate,
        toDate,
        selectedMonth
      });

      // Process absent employees based on filter type
      let formatted = [];

      if (isMonthMode) {
        // Month view: Show absent days count
        formatted = Object.values(absentCounts)
          .map(emp => {
            const absentDays = Math.max(0, emp.totalDays - emp.present);
            return {
              employeeId: emp.employeeId || emp._id,
              name: emp.name || emp.fullName || "N/A",
              date: selectedMonth,
              department: emp.department || emp.departmentName || "N/A",
              designation: emp.designation || emp.role || "N/A",
              lastAttendance: `${emp.present} present out of ${emp.totalDays} days`,
              joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A",
              absentDays: absentDays,
              presentDays: emp.present,
              totalDays: emp.totalDays
            };
          })
          .filter(emp => emp.absentDays > 0) // Only show employees with at least 1 absent day
          .sort((a, b) => b.absentDays - a.absentDays); // Sort by most absent first
      } else {
        // Date or range mode: Employees not present
        const absents = activeEmployees.filter((emp) => {
          const empId = emp.employeeId || emp._id || emp.empId;
          return !presentIds.has(empId?.toString());
        });

        formatted = absents.map((emp) => {
          // Calculate last attendance
          let lastAttendanceDate = null;
          let lastAttendance = "Never";
          
          allAttendance.forEach(record => {
            const id = (typeof record.employeeId === 'object' 
              ? record.employeeId?.employeeId || record.employeeId?._id
              : record.employeeId);
            
            if (id === (emp.employeeId || emp._id) && record.checkInTime) {
              const recordDate = new Date(record.checkInTime);
              if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
                lastAttendanceDate = recordDate;
              }
            }
          });

          if (lastAttendanceDate) {
            const today = new Date();
            const diffTime = today - lastAttendanceDate;
            const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            lastAttendance = `${lastAttendanceDate.toLocaleDateString()} (${daysSince} days ago)`;
          }

          let dateDisplay = "";
          if (fromDate && toDate) {
            dateDisplay = `${fromDate} to ${toDate}`;
          } else if (fromDate && !toDate) {
            dateDisplay = fromDate;
          }

          return {
            employeeId: emp.employeeId || emp._id,
            name: emp.name || emp.fullName || "N/A",
            date: dateDisplay,
            department: emp.department || emp.departmentName || "N/A",
            designation: emp.designation || emp.role || "N/A",
            lastAttendance: lastAttendance,
            joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A",
            absentDays: 1
          };
        });
      }

      setAbsentEmployees(formatted);
    } catch (err) {
      console.error("❌ Error fetching absent employees:", err);
      setError("Failed to fetch absent employees");
    } finally {
      setLoading(false);
    }
  };

  const getAbsentColor = (absentDays, totalDays) => {
    const percentage = (absentDays / totalDays) * 100;
    if (percentage <= 10) return 'bg-green-100 text-green-700';
    if (percentage <= 25) return 'bg-lime-100 text-lime-700';
    if (percentage <= 50) return 'bg-yellow-100 text-yellow-700';
    if (percentage <= 75) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[150px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[150px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Selector */}
            <div className="relative w-[150px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDepartment("");
                  setFilterDesignation("");
                  setFromDate("");
                  setToDate("");
                  setSelectedMonth(new Date().toISOString().slice(0, 7));
                }}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading absent employees...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg font-semibold text-green-600">
              {fromDate && toDate 
                ? `No absent employees from ${fromDate} to ${toDate} 🎉` 
                : fromDate && !toDate
                ? `No absent employees on ${fromDate} 🎉`
                : selectedMonth 
                ? `No absent days in ${selectedMonth} 🎉`
                : "No absent employees found 🎉"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {fromDate && toDate 
                ? "All employees were present in this period" 
                : fromDate && !toDate
                ? "All active employees are present"
                : selectedMonth 
                ? "All employees have perfect attendance"
                : "Try selecting a date or month"}
              {(searchTerm || filterDepartment || filterDesignation) && " - Try clearing filters"}
            </p>
          </div>
        ) : (
          <>
            {/* Activities Table */}
            <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="text-xs text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-2 text-center">Employee ID</th>
                      <th className="px-2 py-2 text-center">Name</th>
                      <th className="px-2 py-2 text-center">Department</th>
                      <th className="px-2 py-2 text-center">Designation</th>
                      {selectedMonth && !fromDate && !toDate ? (
                        <>
                          <th className="px-2 py-2 text-center">Present Days</th>
                          <th className="px-2 py-2 text-center">Absent Days</th>
                        </>
                      ) : (
                        <th className="px-2 py-2 text-center">Last Attendance</th>
                      )}
                      <th className="px-2 py-2 text-center">Date/Month</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRows.map((emp) => (
                      <tr
                        key={emp.employeeId}
                        className="text-xs transition-colors hover:bg-gray-50"
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.employeeId}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {emp.name}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {emp.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600">
                          {emp.designation}
                        </td>
                        
                        {selectedMonth && !fromDate && !toDate ? (
                          <>
                            <td className="px-2 py-2 text-center">
                              <span className="px-2 py-1 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full">
                                {emp.presentDays}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getAbsentColor(emp.absentDays, emp.totalDays)}`}>
                                {emp.absentDays}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="px-2 py-2 text-center">
                            <span className={`px-2 py-1 text-[10px] rounded-full font-semibold ${
                              emp.lastAttendance.includes('Never') 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {emp.lastAttendance}
                            </span>
                          </td>
                        )}
                        
                        <td className="px-2 py-2 text-center text-gray-600 text-[10px]">
                          {emp.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                    <span>Showing</span>
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>
                    <span>to</span>
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.limit,
                        pagination.totalCount
                      )}
                    </span>
                    <span>of</span>
                    <span className="font-medium">
                      {pagination.totalCount}
                    </span>
                    <span>results</span>

                    {/* Select Dropdown */}
                    <select
                      value={pagination.limit}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        handleItemsPerPageChange(newLimit);
                      }}
                      className="p-1 ml-1 text-xs border rounded-lg"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-0.5">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                }))
                              }
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-1 text-xs text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AbsentToday;