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
//     return <p className="mt-6 text-center text-gray-500">Loading Absent Employees Today ({today})...</p>;
//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       {/* <h2 className="mb-4 text-2xl font-bold text-gray-700">
//         Absent Employees Today ({today})
//       </h2> */}

//       {absentEmployees.length === 0 ? (
//         <p className="font-semibold text-center text-blue-700">
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
//                   className="border-t cursor-pointer hover:bg-white"
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
//     if (percentage <= 10) return 'bg-blue-100 text-green-700';
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
//               <FaSearch className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
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
//               <FaCalendarAlt className="absolute text-gray-900 transform -translate-y-1/2 left-3 top-1/2" />
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
//               <span className="ml-2 text-gray-500">Loading absent employees...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         ) : filteredEmployees.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg font-semibold text-blue-700">
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
//                   <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
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
//                         className="transition-colors hover:bg-white"
//                       >
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-500">
//                           {emp.department}
//                         </td>
//                         <td className="px-2 py-2 text-sm text-center text-gray-500">
//                           {emp.designation}
//                         </td>
                        
//                         {filterType === 'month' && (
//                           <>
//                             <td className="px-2 py-2 text-center">
//                               <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-blue-100 rounded-full">
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
//                                 ? 'bg-gray-100 text-gray-500' 
//                                 : 'bg-orange-100 text-orange-700'
//                             }`}>
//                               {emp.lastAttendance}
//                             </span>
//                           </td>
//                         )}
                        
//                         <td className="px-2 py-2 text-sm text-center text-gray-500">
//                           {filterType === 'date' ? emp.date : emp.date}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredEmployees.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 text-center border-t border-gray-200 bg-white">
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
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
//                                   ? "bg-blue-600 text-gray-900"
//                                   : "bg-white text-gray-700 border border-gray-300 hover:bg-white"
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
//                       className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import "../index.css";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// const BASE_URL = API_BASE_URL;

// const AbsentToday = () => {
//   const [absentEmployees, setAbsentEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
//   // Search filters
//   const [searchTerm, setSearchTerm] = useState("");
  
//   // Department and Designation filter states
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
//   // Unique departments and designations
//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
//   // Refs for click outside
//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);
  
//   // Pagination
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });
  
//   const [debug, setDebug] = useState({});

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

//   // Extract unique departments and designations from employees
//   const extractUniqueValues = (employees) => {
//     const depts = new Set();
//     const designations = new Set();
    
//     employees.forEach(emp => {
//       if (emp.department) depts.add(emp.department);
//       if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//     });
    
//     setUniqueDepartments(Array.from(depts).sort());
//     setUniqueDesignations(Array.from(designations).sort());
//   };

//   useEffect(() => {
//     fetchAbsentEmployees();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     // Apply filters whenever absentEmployees or search terms change
//     filterEmployees();
//   }, [absentEmployees, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

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
    
//     // Filter by Department
//     if (filterDepartment) {
//       filtered = filtered.filter(emp => emp.department === filterDepartment);
//     }
    
//     // Filter by Designation
//     if (filterDesignation) {
//       filtered = filtered.filter(emp => emp.designation === filterDesignation);
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
      
//       // Extract unique values for filters
//       extractUniqueValues(activeEmployees);

//       const attendanceData = attResp.data || [];
//       const allAttendance = Array.isArray(attendanceData)
//         ? attendanceData
//         : attendanceData.records || attendanceData.allAttendance || [];

//       // Get present employees based on filters
//       const presentIds = new Set();
//       const absentCounts = {}; // For month view

//       // Determine filter mode
//       const isMonthMode = selectedMonth && !fromDate && !toDate;
//       const isRangeMode = fromDate && toDate;
//       const isSingleDateMode = fromDate && !toDate; // Single date via fromDate only

//       if (isMonthMode) {
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
//       } else {
//         // Date or range mode
//         const fromDateTime = fromDate ? new Date(fromDate) : null;
//         const toDateTime = toDate ? new Date(toDate) : null;
        
//         if (fromDateTime) fromDateTime.setHours(0, 0, 0, 0);
//         if (toDateTime) toDateTime.setHours(23, 59, 59, 999);

//         // Track which employees were present
//         allAttendance.forEach(record => {
//           if (!record.checkInTime) return;
          
//           const recordDateTime = new Date(record.checkInTime);
          
//           // Apply filters
//           let shouldInclude = false;
          
//           if (fromDateTime && toDateTime) {
//             // Range mode
//             if (recordDateTime >= fromDateTime && recordDateTime <= toDateTime) {
//               shouldInclude = true;
//             }
//           } else if (fromDateTime && !toDateTime) {
//             // Single date mode
//             const recordDateStr = recordDateTime.toISOString().split('T')[0];
//             if (recordDateStr === fromDate) {
//               shouldInclude = true;
//             }
//           }

//           if (!shouldInclude) return;

//           const id = (typeof record.employeeId === 'object' 
//             ? record.employeeId?.employeeId || record.employeeId?._id
//             : record.employeeId);
          
//           if (id) presentIds.add(id.toString());
//         });
//       }

//       setDebug({
//         totalEmployees: employees.length,
//         activeEmployees: activeEmployees.length,
//         fromDate,
//         toDate,
//         selectedMonth
//       });

//       // Process absent employees based on filter type
//       let formatted = [];

//       if (isMonthMode) {
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
//       } else {
//         // Date or range mode: Employees not present
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
//             const today = new Date();
//             const diffTime = today - lastAttendanceDate;
//             const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//             lastAttendance = `${lastAttendanceDate.toLocaleDateString()} (${daysSince} days ago)`;
//           }

//           let dateDisplay = "";
//           if (fromDate && toDate) {
//             dateDisplay = `${fromDate} to ${toDate}`;
//           } else if (fromDate && !toDate) {
//             dateDisplay = fromDate;
//           }

//           return {
//             employeeId: emp.employeeId || emp._id,
//             name: emp.name || emp.fullName || "N/A",
//             date: dateDisplay,
//             department: emp.department || emp.departmentName || "N/A",
//             designation: emp.designation || emp.role || "N/A",
//             lastAttendance: lastAttendance,
//             joinDate: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : "N/A",
//             absentDays: 1
//           };
//         });
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
//     if (percentage <= 10) return 'bg-blue-100 text-green-700';
//     if (percentage <= 25) return 'bg-lime-100 text-lime-700';
//     if (percentage <= 50) return 'bg-yellow-100 text-yellow-700';
//     if (percentage <= 75) return 'bg-orange-100 text-orange-700';
//     return 'bg-red-100 text-red-700';
//   };

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* ID/Name Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department Filter Button */}
//             <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
              
//               {/* Department Filter Dropdown */}
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
//                   >
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div 
//                       key={dept}
//                       onClick={() => {
//                         setFilterDepartment(dept);
//                         setShowDepartmentFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Designation Filter Button */}
//             <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
              
//               {/* Designation Filter Dropdown */}
//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDesignation('');
//                       setShowDesignationFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
//                   >
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div 
//                       key={des}
//                       onClick={() => {
//                         setFilterDesignation(des);
//                         setShowDesignationFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* From Date */}
//             <div className="relative w-[150px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 From:
//               </span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative w-[150px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 To:
//               </span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Selector */}
//             <div className="relative w-[150px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Clear Filters Button */}
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setFilterDepartment("");
//                   setFilterDesignation("");
//                   setFromDate("");
//                   setToDate("");
//                   setSelectedMonth(new Date().toISOString().slice(0, 7));
//                 }}
//                 className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-500">Loading absent employees...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         ) : filteredEmployees.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg font-semibold text-blue-700">
//               {fromDate && toDate 
//                 ? `No absent employees from ${fromDate} to ${toDate} 🎉` 
//                 : fromDate && !toDate
//                 ? `No absent employees on ${fromDate} 🎉`
//                 : selectedMonth 
//                 ? `No absent days in ${selectedMonth} 🎉`
//                 : "No absent employees found 🎉"}
//             </p>
//             <p className="mt-2 text-sm text-gray-500">
//               {fromDate && toDate 
//                 ? "All employees were present in this period" 
//                 : fromDate && !toDate
//                 ? "All active employees are present"
//                 : selectedMonth 
//                 ? "All employees have perfect attendance"
//                 : "Try selecting a date or month"}
//               {(searchTerm || filterDepartment || filterDesignation) && " - Try clearing filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Activities Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-2 text-center">Employee ID</th>
//                       <th className="px-2 py-2 text-center">Name</th>
//                       <th className="px-2 py-2 text-center">Department</th>
//                       <th className="px-2 py-2 text-center">Designation</th>
//                       {selectedMonth && !fromDate && !toDate ? (
//                         <>
//                           <th className="px-2 py-2 text-center">Present Days</th>
//                           <th className="px-2 py-2 text-center">Absent Days</th>
//                         </>
//                       ) : (
//                         <th className="px-2 py-2 text-center">Last Attendance</th>
//                       )}
//                       <th className="px-2 py-2 text-center">Date/Month</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentRows.map((emp) => (
//                       <tr
//                         key={emp.employeeId}
//                         className="text-xs transition-colors hover:bg-white"
//                       >
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {emp.department}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {emp.designation}
//                         </td>
                        
//                         {selectedMonth && !fromDate && !toDate ? (
//                           <>
//                             <td className="px-2 py-2 text-center">
//                               <span className="px-2 py-1 text-[10px] font-semibold text-green-700 bg-blue-100 rounded-full">
//                                 {emp.presentDays}
//                               </span>
//                             </td>
//                             <td className="px-2 py-2 text-center">
//                               <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getAbsentColor(emp.absentDays, emp.totalDays)}`}>
//                                 {emp.absentDays}
//                               </span>
//                             </td>
//                           </>
//                         ) : (
//                           <td className="px-2 py-2 text-center">
//                             <span className={`px-2 py-1 text-[10px] rounded-full font-semibold ${
//                               emp.lastAttendance.includes('Never') 
//                                 ? 'bg-gray-100 text-gray-500' 
//                                 : 'bg-orange-100 text-orange-700'
//                             }`}>
//                               {emp.lastAttendance}
//                             </span>
//                           </td>
//                         )}
                        
//                         <td className="px-2 py-2 text-center text-gray-500 text-[10px]">
//                           {emp.date}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredEmployees.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-white">
//                   <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {(pagination.currentPage - 1) * pagination.limit + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(
//                         pagination.currentPage * pagination.limit,
//                         pagination.totalCount
//                       )}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {pagination.totalCount}
//                     </span>
//                     <span>results</span>

//                     {/* Select Dropdown */}
//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => {
//                         const newLimit = Number(e.target.value);
//                         handleItemsPerPageChange(newLimit);
//                       }}
//                       className="p-1 ml-1 text-xs border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                   </div>

//                   <div className="flex gap-1">
//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage - 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === 1}
//                       className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-0.5">
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
//                               className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
//                                 pagination.currentPage === page
//                                   ? "bg-blue-600 text-gray-900"
//                                   : "bg-white text-gray-700 border border-gray-300 hover:bg-white"
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
//                             <span key={page} className="px-1 text-xs text-gray-500">
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
//                       className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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

// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import "../index.css";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const BASE_URL = API_BASE_URL;

// const AbsentToday = () => {
//   const [absentEmployees, setAbsentEmployees] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
//   const [searchTerm, setSearchTerm] = useState("");
  
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterDesignation, setFilterDesignation] = useState("");
//   const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
//   const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
//   const [uniqueDepartments, setUniqueDepartments] = useState([]);
//   const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
//   const departmentFilterRef = useRef(null);
//   const designationFilterRef = useRef(null);
  
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });

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

//   const extractUniqueValues = (employees) => {
//     const depts = new Set();
//     const designations = new Set();
    
//     employees.forEach(emp => {
//       if (emp.department) depts.add(emp.department);
//       if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//     });
    
//     setUniqueDepartments(Array.from(depts).sort());
//     setUniqueDesignations(Array.from(designations).sort());
//   };

//   // ✅ Fetch when date filters change
//   useEffect(() => {
//     fetchAbsentEmployees();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     filterEmployees();
//   }, [absentEmployees, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation]);

//   const filterEmployees = () => {
//     let filtered = [...absentEmployees];
    
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(emp => 
//         emp.employeeId?.toString().toLowerCase().includes(term) ||
//         emp.name?.toLowerCase().includes(term)
//       );
//     }
    
//     if (filterDepartment) {
//       filtered = filtered.filter(emp => emp.department === filterDepartment);
//     }
    
//     if (filterDesignation) {
//       filtered = filtered.filter(emp => emp.designation === filterDesignation);
//     }
    
//     setFilteredEmployees(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

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

//   // ✅ Modified fetch with date parameters
//   const fetchAbsentEmployees = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       if (fromDate && toDate) {
//         params.append('fromDate', fromDate);
//         params.append('toDate', toDate);
//       } else if (fromDate && !toDate) {
//         params.append('fromDate', fromDate);
//       } else if (selectedMonth) {
//         params.append('month', selectedMonth);
//       }

//       const [empResp, attResp] = await Promise.all([
//         axios.get(`${BASE_URL}/employees/get-employees`),
//         axios.get(`${BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`)
//       ]);

//       const employees = empResp.data || [];
//       const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));
      
//       extractUniqueValues(activeEmployees);

//       const attendanceData = attResp.data || [];
//       const allAttendance = Array.isArray(attendanceData)
//         ? attendanceData
//         : attendanceData.records || attendanceData.allAttendance || [];

//       // Get present employees based on filters
//       const presentIds = new Set();
//       let formatted = [];

//       // Date or range mode
//       const fromDateTime = fromDate ? new Date(fromDate) : null;
//       const toDateTime = toDate ? new Date(toDate) : null;
      
//       if (fromDateTime) fromDateTime.setHours(0, 0, 0, 0);
//       if (toDateTime) toDateTime.setHours(23, 59, 59, 999);

//       // Track which employees were present
//       allAttendance.forEach(record => {
//         if (!record.checkInTime) return;
        
//         const recordDateTime = new Date(record.checkInTime);
        
//         let shouldInclude = false;
        
//         if (fromDateTime && toDateTime) {
//           if (recordDateTime >= fromDateTime && recordDateTime <= toDateTime) {
//             shouldInclude = true;
//           }
//         } else if (fromDateTime && !toDateTime) {
//           const recordDateStr = recordDateTime.toISOString().split('T')[0];
//           if (recordDateStr === fromDate) {
//             shouldInclude = true;
//           }
//         } else if (selectedMonth && !fromDate && !toDate) {
//           const recordMonth = recordDateTime.toISOString().slice(0, 7);
//           if (recordMonth === selectedMonth) {
//             shouldInclude = true;
//           }
//         } else if (!fromDate && !toDate && !selectedMonth) {
//           const today = new Date();
//           const todayStr = today.toISOString().split('T')[0];
//           const recordDateStr = recordDateTime.toISOString().split('T')[0];
//           if (recordDateStr === todayStr) {
//             shouldInclude = true;
//           }
//         }

//         if (!shouldInclude) return;

//         const id = (typeof record.employeeId === 'object' 
//           ? record.employeeId?.employeeId || record.employeeId?._id
//           : record.employeeId);
        
//         if (id) presentIds.add(id.toString());
//       });

//       // Date or range mode: Employees not present
//       const absents = activeEmployees.filter((emp) => {
//         const empId = emp.employeeId || emp._id || emp.empId;
//         return !presentIds.has(empId?.toString());
//       });

//       let dateDisplay = "";
//       if (fromDate && toDate) {
//         dateDisplay = `${fromDate} to ${toDate}`;
//       } else if (fromDate && !toDate) {
//         dateDisplay = fromDate;
//       } else if (selectedMonth && !fromDate && !toDate) {
//         dateDisplay = selectedMonth;
//       } else {
//         dateDisplay = new Date().toISOString().split('T')[0];
//       }

//       formatted = absents.map((emp) => ({
//         employeeId: emp.employeeId || emp._id,
//         name: emp.name || emp.fullName || "N/A",
//         date: dateDisplay,
//         department: emp.department || emp.departmentName || "N/A",
//         designation: emp.designation || emp.role || "N/A",
//       }));

//       setAbsentEmployees(formatted);
//     } catch (err) {
//       console.error("Error fetching absent employees:", err);
//       setError("Failed to fetch absent employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth(new Date().toISOString().slice(0, 7));
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-500">Loading absent employees...</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
    
//   if (error)
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Filters - Same as TodayAttendance */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* ID/Name Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by ID or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Department Filter Button */}
//             <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>
              
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
//                   >
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div 
//                       key={dept}
//                       onClick={() => {
//                         setFilterDepartment(dept);
//                         setShowDepartmentFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Designation Filter Button */}
//             <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-gray-900 hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>
              
//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDesignation('');
//                       setShowDesignationFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
//                   >
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div 
//                       key={des}
//                       onClick={() => {
//                         setFilterDesignation(des);
//                         setShowDesignationFilter(false);
//                       }}
//                       className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
//                         filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
//                       }`}
//                     >
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* From Date */}
//             <div className="relative w-[150px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 From:
//               </span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative w-[150px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
//                 To:
//               </span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Month Selector */}
//             <div className="relative w-[150px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Apply Button */}
//             <button
//               onClick={fetchAbsentEmployees}
//               className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-900 bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
//             >
//               <FaSearch className="text-xs" /> Apply
//             </button>

//             {/* Clear Filters Button */}
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
//               <button
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredEmployees.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg font-semibold text-blue-700">
//               {fromDate && toDate 
//                 ? `No absent employees from ${fromDate} to ${toDate} 🎉` 
//                 : fromDate && !toDate
//                 ? `No absent employees on ${fromDate} 🎉`
//                 : selectedMonth 
//                 ? `No absent days in ${selectedMonth} 🎉`
//                 : "No absent employees found 🎉"}
//             </p>
//             <p className="mt-2 text-sm text-gray-500">
//               {(searchTerm || filterDepartment || filterDesignation) && " - Try clearing filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Activities Table - Same as TodayAttendance style */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-xs text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="px-2 py-2 text-center">Employee ID</th>
//                       <th className="px-2 py-2 text-center">Name</th>
//                       <th className="px-2 py-2 text-center">Department</th>
//                       <th className="px-2 py-2 text-center">Designation</th>
//                       <th className="px-2 py-2 text-center">Date/Month</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentRows.map((emp) => (
//                       <tr
//                         key={emp.employeeId}
//                         className="text-xs transition-colors hover:bg-white"
//                       >
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.employeeId}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {emp.name}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {emp.department}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {emp.designation}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500 text-[10px]">
//                           {emp.date}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination - Same as TodayAttendance */}
//               {filteredEmployees.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-white">
//                   <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {(pagination.currentPage - 1) * pagination.limit + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(
//                         pagination.currentPage * pagination.limit,
//                         pagination.totalCount
//                       )}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {pagination.totalCount}
//                     </span>
//                     <span>results</span>

//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => {
//                         const newLimit = Number(e.target.value);
//                         handleItemsPerPageChange(newLimit);
//                       }}
//                       className="p-1 ml-1 text-xs border rounded-lg"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                   </div>

//                   <div className="flex gap-1">
//                     <button
//                       onClick={() =>
//                         setPagination((prev) => ({
//                           ...prev,
//                           currentPage: prev.currentPage - 1,
//                         }))
//                       }
//                       disabled={pagination.currentPage === 1}
//                       className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Previous
//                     </button>

//                     <div className="flex items-center gap-0.5">
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
//                               className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
//                                 pagination.currentPage === page
//                                   ? "bg-blue-600 text-gray-900"
//                                   : "bg-white text-gray-700 border border-gray-300 hover:bg-white"
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
//                             <span key={page} className="px-1 text-xs text-gray-500">
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
//                       className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
//  import axios from "axios";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag,FaChevronDown,FaChevronUp } from "react-icons/fa";
import { FiUsers, FiFilter, FiUserX, FiPercent, FiCalendar, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const BASE_URL = API_BASE_URL;

const AbsentToday = () => {
  const [absentRecords, setAbsentRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allDatesCount, setAllDatesCount] = useState(1);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getTodayDate = () => {
    return formatDateForAPI(new Date());
  };
  
  const parseDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };
  
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // ─── PERSISTED PAGINATION ───
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: (() => {
      const saved = localStorage.getItem('absentToday_itemsPerPage');
      return saved ? parseInt(saved, 10) : 10;
    })(),
  });

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
    fetchAbsentRecords();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    filterRecords();
  }, [absentRecords, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation]);

  const filterRecords = () => {
    let filtered = [...absentRecords];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.employeeName?.toLowerCase().includes(term)
      );
    }
    
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  // ─── HANDLE ITEMS PER PAGE CHANGE WITH LOCALSTORAGE ───
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
    localStorage.setItem('absentToday_itemsPerPage', String(limit));
  };

  const fetchAbsentRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      let startDate = fromDate;
      let endDate = toDate;
      
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        startDate = firstDay;
        endDate = lastDay;
      }
      
      if (startDate && endDate) {
        params.append('fromDate', startDate);
        params.append('toDate', endDate);
      }

      const [empResp, attResp] = await Promise.all([
        axios.get(`${BASE_URL}/employees/get-employees`),
        axios.get(`${BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`)
      ]);

      const employeesData = empResp.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      extractUniqueValues(activeEmployees);

      let attendanceData = attResp.data || [];
      if (attendanceData.allAttendance) {
        attendanceData = attendanceData.allAttendance;
      } else if (attendanceData.records) {
        attendanceData = attendanceData.records;
      }
      
      const allAttendance = Array.isArray(attendanceData) ? attendanceData : [];

      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      const allDatesInRange = [];
      let currentDate = new Date(startDateTime);
      while (currentDate <= endDateTime) {
        const dateStr = formatDateForAPI(currentDate);
        allDatesInRange.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setAllDatesCount(allDatesInRange.length || 1);
      
      const presentDatesByEmployee = new Map();
      
      allAttendance.forEach(record => {
        let checkInTime = record.checkInTime;
        
        if (checkInTime) {
          let recordDate;
          if (typeof checkInTime === 'string' && checkInTime.includes('-')) {
            const parts = checkInTime.split(' ');
            const datePart = parts[0];
            if (datePart.includes('-')) {
              const dateParts = datePart.split('-');
              if (dateParts[0].length === 4) {
                recordDate = new Date(datePart);
              } else {
                recordDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
              }
            } else {
              recordDate = new Date(checkInTime);
            }
          } else {
            recordDate = new Date(checkInTime);
          }
          
          if (!isNaN(recordDate.getTime()) && recordDate >= startDateTime && recordDate <= endDateTime) {
            const recordDateStr = formatDateForAPI(recordDate);
            
            let id = record.employeeId;
            if (typeof id === 'object' && id !== null) {
              id = id.employeeId || id._id;
            }
            
            if (id) {
              if (!presentDatesByEmployee.has(id.toString())) {
                presentDatesByEmployee.set(id.toString(), new Set());
              }
              presentDatesByEmployee.get(id.toString()).add(recordDateStr);
            }
          }
        }
      });
      
      const absentRecordsList = [];
      
      activeEmployees.forEach((emp) => {
        const empId = (emp.employeeId || emp._id || emp.empId)?.toString();
        if (!empId) return;
        
        const presentDates = presentDatesByEmployee.get(empId) || new Set();
        
        allDatesInRange.forEach(date => {
          if (!presentDates.has(date)) {
            absentRecordsList.push({
              _id: `${empId}_${date}`,
              employeeId: empId,
              employeeName: emp.name || emp.fullName || "N/A",
              date: date,
              department: emp.department || emp.departmentName || "N/A",
              designation: emp.designation || emp.role || "N/A",
              profilePicture: emp.profilePicture || null
            });
          }
        });
      });
      
      absentRecordsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAbsentRecords(absentRecordsList);
      setFilteredRecords(absentRecordsList);
      setPagination(prev => ({
        ...prev,
        totalCount: absentRecordsList.length,
        totalPages: Math.ceil(absentRecordsList.length / prev.limit)
      }));
      
    } catch (err) {
      console.error("Error fetching absent records:", err);
      setError("Failed to fetch absent records");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate(getTodayDate());
    setToDate(getTodayDate());
    setSelectedMonth("");
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
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

  const handleCardClick = (filterType) => {
    const tableSection = document.querySelector('.emp-dash__card:last-child');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading absent records...</p>
        </div>
      </div>
    );
  }
    
  if (error) {
    return (
      <div className="emp-dash">
        <main className="grid place-items-center min-h-[60vh] p-4">
          <div className="emp-dash__card max-w-[520px] w-full">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load absent records</h3>
                <p className="emp-dash__card-desc text-red-600 mt-1">{error}</p>
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
      <main className="p-2 sm:p-4 lg:p-6">

        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Absent <span>Today</span>
            </h1>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('total')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Absences</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value">{absentRecords.length}</div>
            <div className="emp-dash__stat-meta">active in view</div>
          </div>
          
          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('filtered')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Absences</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('employees')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Employees</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{employees.length}</div>
            <div className="emp-dash__stat-meta">active employees</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('rate')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Absent Rate</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiPercent />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {employees.length > 0 ? ((absentRecords.length / (employees.length * allDatesCount)) * 100).toFixed(1) : 0}%
            </div>
            <div className="emp-dash__stat-meta">average rate</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative min-w-[140px] flex-1 max-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative" ref={departmentFilterRef}>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDepartment
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaBuilding className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[100px]">{filterDepartment || "Departments"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDepartment("");
                          setShowDepartmentFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Departments
                      </div>
                      {uniqueDepartments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => {
                            setFilterDepartment(dept);
                            setShowDepartmentFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={designationFilterRef}>
                  <button
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDesignation
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUserTag className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[100px]">{filterDesignation || "Designations"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDesignation("");
                          setShowDesignationFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Designations
                      </div>
                      {uniqueDesignations.map((des) => (
                        <div
                          key={des}
                          onClick={() => {
                            setFilterDesignation(des);
                            setShowDesignationFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {des}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="From"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="To"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="relative">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={fetchAbsentRecords}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {(searchTerm || filterDepartment || filterDesignation || fromDate !== getTodayDate() || toDate !== getTodayDate() || selectedMonth) && (
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
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <FiFilter className="text-blue-600 text-base" />
                <span>Filters</span>
                {showMobileFilters ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredRecords.length}</strong> absences
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Employee</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search ID or Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="relative" ref={departmentFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDepartment
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FaBuilding className="text-gray-400" />
                      {filterDepartment || "All Departments"}
                    </span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFilterDepartment("");
                          setShowDepartmentFilter(false);
                        }}
                        className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Departments
                      </div>
                      {uniqueDepartments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => {
                            setFilterDepartment(dept);
                            setShowDepartmentFilter(false);
                          }}
                          className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                            filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={designationFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                  <button
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDesignation
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FaUserTag className="text-gray-400" />
                      {filterDesignation || "All Designations"}
                    </span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFilterDesignation("");
                          setShowDesignationFilter(false);
                        }}
                        className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Designations
                      </div>
                      {uniqueDesignations.map((des) => (
                        <div
                          key={des}
                          onClick={() => {
                            setFilterDesignation(des);
                            setShowDesignationFilter(false);
                          }}
                          className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                            filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {des}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={fetchAbsentRecords}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    {(searchTerm || filterDepartment || filterDesignation || fromDate !== getTodayDate() || toDate !== getTodayDate() || selectedMonth) && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="emp-dash__card">
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-5xl">🎉</div>
              <p className="mb-1 text-base font-bold text-slate-700">
                {fromDate && toDate && fromDate === toDate 
                  ? `No absent employees on ${formatDateForDisplay(fromDate)}` 
                  : fromDate && toDate && fromDate !== toDate
                  ? `No absent employees from ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`
                  : selectedMonth 
                  ? `No absent employees in ${selectedMonth}`
                  : "No absent employees found"}
              </p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">Everyone has checked in successfully during this period!</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>Emp ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th style={{ textAlign: "right" }}>Absent Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec) => (
                      <tr key={rec._id} className="hover:bg-gray-55/60 transition-all">
                        <td style={{ textAlign: "center" }} className="font-semibold text-gray-900 whitespace-nowrap">{rec.employeeId}</td>
                        <td className="font-semibold text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {rec.profilePicture ? (
                              <img 
                                src={rec.profilePicture} 
                                alt={rec.employeeName} 
                                className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div 
                              style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                              className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
                            >
                              {rec.employeeName ? rec.employeeName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span>{rec.employeeName}</span>
                          </div>
                        </td>
                        <td>{rec.department}</td>
                        <td>{rec.designation}</td>
                        <td style={{ textAlign: "right" }} className="font-bold text-rose-600 whitespace-nowrap">
                          {formatDateForDisplay(rec.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="block lg:hidden divide-y divide-gray-100">
                {currentRows.map((rec) => (
                  <div key={rec._id} className="p-4 hover:bg-gray-55/60 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {rec.profilePicture ? (
                          <img 
                            src={rec.profilePicture} 
                            alt={rec.employeeName} 
                            className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div 
                          style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                          className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
                        >
                          {rec.employeeName ? rec.employeeName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rec.employeeName}</h4>
                          <span className="text-xs text-gray-500">{rec.employeeId}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                        Absent: {formatDateForDisplay(rec.date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600 mt-2">
                      <div><span className="text-gray-400">Dept:</span> {rec.department}</div>
                      <div><span className="text-gray-400">Desig:</span> {rec.designation}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── PAGINATION SECTION ─── */}
              <div className="flex flex-col items-center justify-between gap-4 p-4 border-t border-gray-100 sm:flex-row bg-white rounded-b-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500">
                      Show:
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="p-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-xs text-slate-400">entries</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-700">{(pagination.currentPage - 1) * pagination.limit + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</strong> of <strong className="text-slate-700">{pagination.totalCount}</strong> absences
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
                      pagination.currentPage === 1
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? setPagination(prev => ({ ...prev, currentPage: page })) : null}
                      disabled={page === "..."}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                        page === "..."
                          ? "bg-white text-slate-400 border-none cursor-default"
                          : pagination.currentPage === page
                            ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
                      pagination.currentPage === pagination.totalPages
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AbsentToday;