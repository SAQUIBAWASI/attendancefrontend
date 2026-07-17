// // src/pages/TodayAttendance.jsx
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get(
//         "https://api.timelyhealth.in//api/attendance/today"
//       );

//       let records = resp.data.records || [];

//       const formattedRecords = records.map((rec) => ({
//         ...rec,
//         employeeName: rec.employeeName || rec.employee?.name || "-",
//         employeeEmail: rec.employeeEmail || rec.employee?.email || "-",
//       }));

//       setTodayRecords(formattedRecords);
//     } catch (err) {
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-500">Loading today's attendance...</p>;

//   if (error)
//     return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-700">Today's Attendance</h3>

//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-gray-900 transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr key={rec._id} className="border-t hover:bg-white">
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeName}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.totalHours ? Number(rec.totalHours).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.distance ? Number(rec.distance).toFixed(2) : "0.00"}
//                   </td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// // const BASE_URL = "https://api.timelyhealth.in/"; // replace with your backend base URL

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchTodayAttendance();
//   }, []);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);
//       const resp = await axios.get("https://api.timelyhealth.in//api/attendance/today");
//       if (resp.data && resp.data.records) {
//         setTodayRecords(resp.data.records);
//       }
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   if (loading)
//     return <p className="mt-6 text-center text-gray-500">Loading today's attendance...</p>;
//   if (error) return <p className="mt-6 text-center text-red-600">{error}</p>;

//   return (
//     <div className="max-w-6xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold text-gray-700">Today's Attendance</h3>
//         <button
//           onClick={() => navigate("/attendance-records")}
//           className="px-4 py-2 text-sm text-gray-900 transition bg-blue-600 rounded hover:bg-blue-700"
//         >
//           View All Records
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm text-left border border-gray-200">
//           <thead className="text-gray-700 bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 border">Employee ID</th>
//               <th className="px-4 py-2 border">Email</th>
//               <th className="px-4 py-2 border">Check In</th>
//               <th className="px-4 py-2 border">Check Out</th>
//               <th className="px-4 py-2 border">Total Hours</th>
//               <th className="px-4 py-2 border">Distance (m)</th>
//               <th className="px-4 py-2 border">Onsite</th>
//               <th className="px-4 py-2 border">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {todayRecords.length > 0 ? (
//               todayRecords.map((rec) => (
//                 <tr
//                   key={rec._id}
//                   className="border-t cursor-pointer hover:bg-white"
//                   onClick={() =>
//                     navigate(`/employee-details/${rec.employeeId}`)
//                   }
//                 >
//                   <td className="px-4 py-2 font-medium">{rec.employeeId}</td>
//                   <td className="px-4 py-2">{rec.employeeEmail}</td>
//                   <td className="px-4 py-2">
//                     {rec.checkInTime
//                       ? new Date(rec.checkInTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">
//                     {rec.checkOutTime
//                       ? new Date(rec.checkOutTime).toLocaleTimeString()
//                       : "-"}
//                   </td>
//                   <td className="px-4 py-2">{rec.totalHours?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.distance?.toFixed(2) || "-"}</td>
//                   <td className="px-4 py-2">{rec.onsite ? "Yes" : "No"}</td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                         rec.status
//                       )}`}
//                     >
//                       {rec.status || "-"}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={8} className="py-4 text-center text-gray-500">
//                   No attendance records for today.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;

// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // Employees data for department/designation
//   const [employees, setEmployees] = useState([]);

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
//     fetchTodayAttendance();
//   }, []);

//   useEffect(() => {
//     // Apply filters whenever data or filters change
//     filterRecords();
//   }, [todayRecords, searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   const fetchTodayAttendance = async () => {
//     try {
//       setLoading(true);

//       // 1️⃣ Fetch attendance
//       const attendanceResp = await axios.get(
//         `${API_BASE_URL}/attendance/today`
//       );

//       const attendance = attendanceResp.data.records || [];

//       // 2️⃣ Fetch employee list
//       const empResp = await axios.get(
//         `${API_BASE_URL}/employees/get-employees`
//       );
//       const employeesData = empResp.data || [];

//       // Filter active employees
//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);

//       // Extract unique departments and designations
//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());

//       // 3️⃣ Map employee details into attendance records
//       const merged = attendance
//         .map((rec) => {
//           const empId =
//             rec.employeeId?._id ||
//             rec.employeeId?.employeeId ||
//             rec.employeeId ||
//             rec.empId ||
//             "";

//           const employee = employeesData.find(
//             (e) =>
//               e.employeeId === empId ||
//               e._id === empId ||
//               e.empId === empId
//           );

//           // Skip if employee is hidden
//           if (isEmployeeHidden(employee)) return null;

//           return {
//             ...rec,
//             name: employee?.name || employee?.fullName || "N/A",
//             employeeId: empId,
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//             joinDate: employee?.joinDate
//           };
//         })
//         .filter(rec => rec !== null); // Remove hidden employees

//       setTodayRecords(merged);
//     } catch (err) {
//       console.error("Error fetching today's attendance:", err);
//       setError("Failed to fetch today's attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterRecords = () => {
//     let filtered = [...todayRecords];

//     // Filter by Employee ID or Name
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.name?.toLowerCase().includes(term)
//       );
//     }

//     // Filter by Department
//     if (filterDepartment) {
//       filtered = filtered.filter(rec => rec.department === filterDepartment);
//     }

//     // Filter by Designation
//     if (filterDesignation) {
//       filtered = filtered.filter(rec => rec.designation === filterDesignation);
//     }

//     // Filter by Date Range
//     if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(toDate);
//       to.setHours(23, 59, 59, 999);

//       filtered = filtered.filter(rec => {
//         const recDate = new Date(rec.checkInTime);
//         return recDate >= from && recDate <= to;
//       });
//     } else if (fromDate && !toDate) {
//       // Single date
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(fromDate);
//       to.setHours(23, 59, 59, 999);

//       filtered = filtered.filter(rec => {
//         const recDate = new Date(rec.checkInTime);
//         return recDate >= from && recDate <= to;
//       });
//     } else if (selectedMonth) {
//       // Month filter
//       const [year, month] = selectedMonth.split('-').map(Number);
//       filtered = filtered.filter(rec => {
//         const recDate = new Date(rec.checkInTime);
//         return recDate.getFullYear() === year && recDate.getMonth() + 1 === month;
//       });
//     }

//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth(new Date().toISOString().slice(0, 7));
//   };

//   // Pagination calculations
//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getHoursColor = (hours) => {
//     if (hours >= 8) return 'bg-blue-100 text-green-700';
//     if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
//     return 'bg-orange-100 text-orange-700';
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-500">Loading today's attendance...</span>
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
//             <div className="relative w-[130px]">
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
//             <div className="relative w-[130px]">
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
//             <div className="relative w-[130px]">
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
//                 onClick={clearFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-500 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredRecords.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No attendance records found</p>
//             <p className="mt-2 text-sm text-gray-500">
//               {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && "Try clearing filters"}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Attendance Table */}
//             <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//               <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//                 <table className="min-w-full">
//                   <thead className="text-sm text-left text-gray-900 bg-gradient-to-r from-green-500 to-blue-600">
//                     <tr>
//                       <th className="py-2 text-center">Employee ID</th>
//                       <th className="py-2 text-center">Name</th>
//                       <th className="py-2 text-center">Department</th>
//                       <th className="py-2 text-center">Designation</th>
//                       <th className="py-2 text-center">Check In</th>
//                       <th className="py-2 text-center">Check Out</th>
//                       <th className="py-2 text-center">Total Hours</th>
//                       <th className="py-2 text-center">Distance (m)</th>
//                       <th className="py-2 text-center">Onsite</th>
//                       <th className="py-2 text-center">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentRows.map((rec) => (
//                       <tr
//                         key={rec._id}
//                         className="transition-colors border-t hover:bg-white"
//                       >
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {rec.employeeId || "-"}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                           {rec.name}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {rec.department}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {rec.designation}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {rec.checkInTime
//                             ? new Date(rec.checkInTime).toLocaleTimeString()
//                             : "-"}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-500">
//                           {rec.checkOutTime
//                             ? new Date(rec.checkOutTime).toLocaleTimeString()
//                             : "-"}
//                         </td>
//                         <td className="px-2 py-2 text-center whitespace-nowrap">
//                           <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHoursColor(rec.totalHours)}`}>
//                             {rec.totalHours?.toFixed(2) || "0.00"}h
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-700 whitespace-nowrap">
//                           {rec.distance?.toFixed(2) || "-"}
//                         </td>
//                         <td className="px-2 py-2 text-sm font-medium text-center text-gray-500 whitespace-nowrap">
//                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rec.onsite ? 'bg-blue-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                             {rec.onsite ? "Yes" : "No"}
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center whitespace-nowrap">
//                           <span
//                             className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
//                               rec.status
//                             )}`}
//                           >
//                             {rec.status || "-"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {filteredRecords.length > 0 && (
//                 <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-white">
//                   <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
//                     <span>Showing</span>
//                     <span className="font-medium">
//                       {indexOfFirstRow + 1}
//                     </span>
//                     <span>to</span>
//                     <span className="font-medium">
//                       {Math.min(indexOfLastRow, filteredRecords.length)}
//                     </span>
//                     <span>of</span>
//                     <span className="font-medium">
//                       {filteredRecords.length}
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

// export default TodayAttendance;


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [employees, setEmployees] = useState([]);

//   // Date filters - same as Attendance Summary
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

//   // ✅ Like Attendance Summary - fetch when date filters change
//   useEffect(() => {
//     fetchAttendanceData();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     filterRecords();
//   }, [todayRecords, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation]);

//   // ✅ Main fetch function - sends date filters to backend
//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Build query params like Attendance Summary
//       const params = new URLSearchParams();
//       if (fromDate && toDate) {
//         params.append('fromDate', fromDate);
//         params.append('toDate', toDate);
//       } else if (fromDate && !toDate) {
//         params.append('fromDate', fromDate);
//       } else if (selectedMonth) {
//         params.append('month', selectedMonth);
//       }

//       // Use same allattendance endpoint but with params
//       const url = `${API_BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`;
//       const attendanceResp = await axios.get(url);
//       const attendance = attendanceResp.data.records || attendanceResp.data || [];

//       const empResp = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = empResp.data || [];

//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);

//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());

//       const merged = attendance
//         .filter(rec => rec.checkInTime) // Only records with checkInTime
//         .map((rec) => {
//           const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";
//           const employee = employeesData.find(e => e.employeeId === empId || e._id === empId || e.empId === empId);

//           if (isEmployeeHidden(employee)) return null;

//           return {
//             ...rec,
//             name: employee?.name || employee?.fullName || "N/A",
//             employeeId: empId,
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//           };
//         })
//         .filter(rec => rec !== null);

//       setTodayRecords(merged);
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//       setError("Failed to fetch attendance data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Only search, department, designation filters (NO date filtering)
//   const filterRecords = () => {
//     let filtered = [...todayRecords];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.name?.toLowerCase().includes(term)
//       );
//     }

//     if (filterDepartment) {
//       filtered = filtered.filter(rec => rec.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(rec => rec.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth(new Date().toISOString().slice(0, 7));
//   };

//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getHoursColor = (hours) => {
//     if (hours >= 8) return 'bg-blue-100 text-green-700';
//     if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
//     return 'bg-orange-100 text-orange-700';
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-500">Loading attendance...</span>
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
//         {/* Filters - Same style as Attendance Summary */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">

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
//                   <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer">
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

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
//                   <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer">
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* From Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">From:</span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">To:</span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             {/* Month Selector */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-900 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             {/* Apply Button */}
//             <button
//               onClick={fetchAttendanceData}
//               className="px-3 py-1.5 text-xs font-medium text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700"
//             >
//               Apply
//             </button>

//             {/* Clear Button */}
//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate) && (
//               <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredRecords.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No attendance records found</p>
//           </div>
//         ) : (
//           <div className="overflow-hidden bg-white rounded-lg shadow-lg">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="py-2 text-center text-gray-900">Employee ID</th>
//                     <th className="py-2 text-center text-gray-900">Name</th>
//                     <th className="py-2 text-center text-gray-900">Department</th>
//                     <th className="py-2 text-center text-gray-900">Designation</th>
//                     <th className="py-2 text-center text-gray-900">Check In</th>
//                     <th className="py-2 text-center text-gray-900">Check Out</th>
//                     <th className="py-2 text-center text-gray-900">Total Hours</th>
//                     <th className="py-2 text-center text-gray-900">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentRows.map((rec) => (
//                     <tr key={rec._id} className="border-t hover:bg-white">
//                       <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{rec.employeeId || "-"}</td>
//                       <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{rec.name}</td>
//                       <td className="px-2 py-2 text-center">{rec.department}</td>
//                       <td className="px-2 py-2 text-center">{rec.designation}</td>
//                       <td className="px-2 py-2 text-center">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}</td>
//                       <td className="px-2 py-2 text-center">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}</td>
//                       <td className="px-2 py-2 text-center">
//                         <span className={`px-2 py-1 text-xs rounded-full ${getHoursColor(rec.totalHours)}`}>
//                           {rec.totalHours?.toFixed(2) || "0.00"}h
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-center">
//                         <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rec.status)}`}>
//                           {rec.status || "-"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {filteredRecords.length > 0 && (
//               <div className="flex justify-between px-2 py-2 border-t">
//                 <div className="text-xs text-gray-700">
//                   Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRecords.length)} of {filteredRecords.length} results
//                   <select value={pagination.limit} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} className="ml-2 p-1 text-xs border rounded">
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                   </select>
//                 </div>
//                 <div className="flex gap-1">
//                   <button onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))} disabled={pagination.currentPage === 1} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Previous</button>
//                   <button onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))} disabled={pagination.currentPage === pagination.totalPages} className="px-2 py-1 text-xs border rounded disabled:opacity-50">Next</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [employees, setEmployees] = useState([]);

//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

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

//   // Fetch when component mounts OR when filters change
//   useEffect(() => {
//     fetchAttendanceData();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     filterRecords();
//   }, [todayRecords, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation]);

//   // Main fetch function
//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Build query params - if no filters, fetch today's data only
//       const params = new URLSearchParams();

//       if (fromDate && toDate) {
//         // Date range filter
//         params.append('fromDate', fromDate);
//         params.append('toDate', toDate);
//       } else if (fromDate && !toDate) {
//         // Single date filter
//         params.append('fromDate', fromDate);
//       } else if (selectedMonth) {
//         // Month filter
//         params.append('month', selectedMonth);
//       } else {
//         // Default: Today's date only
//         const today = new Date().toISOString().split('T')[0];
//         params.append('fromDate', today);
//         params.append('toDate', today);
//       }

//       const url = `${API_BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`;
//       const attendanceResp = await axios.get(url);
//       const attendance = attendanceResp.data.records || attendanceResp.data || [];

//       const empResp = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = empResp.data || [];

//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);

//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());

//       const merged = attendance
//         .filter(rec => rec.checkInTime)
//         .map((rec) => {
//           const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";
//           const employee = employeesData.find(e => e.employeeId === empId || e._id === empId || e.empId === empId);

//           if (isEmployeeHidden(employee)) return null;

//           return {
//             ...rec,
//             name: employee?.name || employee?.fullName || "N/A",
//             employeeId: empId,
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//           };
//         })
//         .filter(rec => rec !== null);

//       setTodayRecords(merged);
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//       setError("Failed to fetch attendance data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterRecords = () => {
//     let filtered = [...todayRecords];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.name?.toLowerCase().includes(term)
//       );
//     }

//     if (filterDepartment) {
//       filtered = filtered.filter(rec => rec.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(rec => rec.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//     // This will trigger fetch for today's data
//   };

//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getHoursColor = (hours) => {
//     if (hours >= 8) return 'bg-blue-100 text-green-700';
//     if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
//     return 'bg-orange-100 text-orange-700';
//   };

//   if (loading)
//     return (
//       <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="mx-auto max-w-9xl">
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <div className="flex items-center justify-center">
//               <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-500">Loading attendance...</span>
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
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">

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

//             <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button>

//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDepartment(''); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">
//                     All Departments
//                   </div>
//                   {uniqueDepartments.map(dept => (
//                     <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer">
//                       {dept}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button>

//               {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div onClick={() => { setFilterDesignation(''); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50">
//                     All Designations
//                   </div>
//                   {uniqueDesignations.map(des => (
//                     <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer">
//                       {des}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">From:</span>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             <div className="relative w-[130px]">
//               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">To:</span>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-500 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             <button
//               onClick={fetchAttendanceData}
//               className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//             >
//               Apply
//             </button>

//             {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth) && (
//               <button onClick={clearFilters} className="h-8 px-3 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {filteredRecords.length === 0 ? (
//           <div className="p-8 text-center bg-white rounded-lg shadow-md">
//             <p className="text-lg text-gray-500">No attendance records found</p>
//           </div>
//         ) : (
//           <div className="overflow-hidden bg-white rounded-lg shadow-lg">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="px-2 py-2 text-center text-white">Employee ID</th>
//                     <th className="px-2 py-2 text-center text-white">Name</th>
//                     <th className="px-2 py-2 text-center text-white">Department</th>
//                     <th className="px-2 py-2 text-center text-white">Designation</th>
//                     <th className="px-2 py-2 text-center text-white">Check In</th>
//                     <th className="px-2 py-2 text-center text-white">Check Out</th>
//                     <th className="px-2 py-2 text-center text-white">Total Hours</th>
//                     <th className="px-2 py-2 text-center text-white">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentRows.map((rec) => (
//                     <tr key={rec._id} className="border-t hover:bg-gray-50">
//                       <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{rec.employeeId || "-"}</td>
//                       <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">{rec.name}</td>
//                       <td className="px-2 py-2 text-center text-gray-700">{rec.department}</td>
//                       <td className="px-2 py-2 text-center text-gray-700">{rec.designation}</td>
//                       <td className="px-2 py-2 text-center text-gray-700">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : "-"}</td>
//                       <td className="px-2 py-2 text-center text-gray-700">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : "-"}</td>
//                       <td className="px-2 py-2 text-center">
//                         <span className={`px-2 py-1 text-xs rounded-full ${getHoursColor(rec.totalHours)}`}>
//                           {rec.totalHours?.toFixed(2) || "0.00"}h
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-center">
//                         <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rec.status)}`}>
//                           {rec.status || "-"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {filteredRecords.length > 0 && (
//               <div className="flex justify-between items-center px-4 py-3 border-t">
//                 <div className="text-xs text-gray-700">
//                   Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRecords.length)} of {filteredRecords.length} results
//                   <select 
//                     value={pagination.limit} 
//                     onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} 
//                     className="ml-2 p-1 text-xs border rounded"
//                   >
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                   </select>
//                 </div>
//                 <div className="flex gap-1">
//                   <button 
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))} 
//                     disabled={pagination.currentPage === 1} 
//                     className="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50"
//                   >
//                     Previous
//                   </button>
//                   <button 
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))} 
//                     disabled={pagination.currentPage === pagination.totalPages} 
//                     className="px-3 py-1 text-xs border rounded disabled:opacity-50 hover:bg-gray-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { FiCoffee, FiUsers, FiMapPin, FiUserCheck, FiHome, FiCalendar, FiTrash2, FiRefreshCw, FiFilter } from "react-icons/fi";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// import "./EmployeeDashboard.css";
// import "./EmployeeLeaves.css";

// // Helper function to format break minutes
// const formatBreakMinutes = (minutes) => {
//   if (!minutes || minutes === 0) return "-";
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   if (hours > 0) return `${hours}h ${mins}m`;
//   return `${mins}m`;
// };

// // Helper function to calculate total break minutes from breaks array
// const calculateTotalBreakMinutes = (breaks) => {
//   if (!breaks || breaks.length === 0) return 0;
//   return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
// };

// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [employees, setEmployees] = useState([]);

//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

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

//   // Fetch when component mounts OR when filters change
//   useEffect(() => {
//     fetchAttendanceData();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     filterRecords();
//   }, [todayRecords, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation]);

//   // Main fetch function
//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Build query params - if no filters, fetch today's data only
//       const params = new URLSearchParams();

//       if (fromDate && toDate) {
//         params.append('fromDate', fromDate);
//         params.append('toDate', toDate);
//       } else if (fromDate && !toDate) {
//         params.append('fromDate', fromDate);
//       } else if (selectedMonth) {
//         params.append('month', selectedMonth);
//       } else {
//         const today = new Date().toISOString().split('T')[0];
//         params.append('fromDate', today);
//         params.append('toDate', today);
//       }

//       const url = `${API_BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`;
//       const attendanceResp = await axios.get(url);
//       const attendance = attendanceResp.data.records || attendanceResp.data || [];

//       const empResp = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = empResp.data || [];

//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);

//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());

//       const merged = attendance
//         .filter(rec => rec.checkInTime)
//         .map((rec) => {
//           const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";
//           const employee = employeesData.find(e => e.employeeId === empId || e._id === empId || e.empId === empId);

//           if (isEmployeeHidden(employee)) return null;

//           const recordDate = new Date(rec.checkInTime);
//           const formattedDate = recordDate.toLocaleDateString('en-IN', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit'
//           });

//           return {
//             ...rec,
//             name: employee?.name || employee?.fullName || "N/A",
//             employeeId: empId,
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//             attendanceDate: formattedDate,
//             rawDate: recordDate,
//             profilePicture: employee?.profilePicture || null
//           };
//         })
//         .filter(rec => rec !== null);

//       setTodayRecords(merged);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch attendance data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterRecords = () => {
//     let filtered = [...todayRecords];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.name?.toLowerCase().includes(term)
//       );
//     }

//     if (filterDepartment) {
//       filtered = filtered.filter(rec => rec.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(rec => rec.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//   };

//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "text-emerald-700 bg-emerald-50 border-emerald-100";
//       case "checked-out":
//         return "text-slate-600 bg-slate-100 border-slate-200";
//       default:
//         return "text-gray-700 bg-gray-50 border-gray-200";
//     }
//   };

//   const getHoursColor = (hours) => {
//     if (hours >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
//     if (hours >= 4) return 'text-amber-700 bg-amber-50 border-amber-100';
//     return 'text-red-700 bg-red-50 border-red-100';
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const totalPages = pagination.totalPages;
//     const currentPage = pagination.currentPage;
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

//   if (loading) {
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div className="emp-dash__spinner" />
//           <p className="emp-dash__loading-text">Loading today's attendance...</p>
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
//                 <h3 className="emp-dash__card-title">Couldn't load attendance data</h3>
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
//       <main className="p-4 sm:p-6 lg:p-8">

//         {/* Dashboard Header */}
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">
//               Today's <span>Attendance</span>
//             </h1>
//             <p className="emp-dash__subtitle">
//               Monitor active check-ins, remote vs. onsite work, and current day attendance logs.
//             </p>
//           </div>
//           <div className="emp-dash__date-pill">
//             <FiCalendar />
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

//         {/* Top KPI Stats Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Total Checked-In</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiUsers />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{todayRecords.length}</div>
//             <div className="emp-dash__stat-meta">checked in today</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Active Working</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                 <FiUserCheck />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{todayRecords.filter((r) => r.status?.toLowerCase() === "checked-in").length}</div>
//             <div className="emp-dash__stat-meta">currently working</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Onsite (WFO)</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiMapPin />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{todayRecords.filter((r) => r.onsite).length}</div>
//             <div className="emp-dash__stat-meta">working at office</div>
//           </div>

//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Remote (WFH)</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                 <FiHome />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{todayRecords.filter((r) => !r.onsite).length}</div>
//             <div className="emp-dash__stat-meta">working from home</div>
//           </div>
//         </div>

//         {/* Filters Card */}
//         <div className="emp-dash__card mb-6">
//           <div className="emp-dash__card-header flex-col sm:flex-row gap-3">
//             <div>
//               <h3 className="emp-dash__card-title flex items-center gap-2">
//                 <FiFilter className="text-blue-600" /> Filters &amp; Actions
//               </h3>
//               {/* <p className="emp-dash__card-desc">Filter records by name, department, date range, or month</p> */}
//             </div>
//             <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
//               <button
//                 onClick={fetchAttendanceData}
//                 className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md"
//               >
//                 <FiRefreshCw /> Refresh
//               </button>
//             </div>
//           </div>

//           <div className="emp-dash__card-body bg-gray-55/50">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
//               {/* ID/Name Search */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Search Employee</label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                     <FaSearch className="w-3.5 h-3.5" />
//                   </span>
//                   <input
//                     type="text"
//                     placeholder="Search ID or Name..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Department Filter */}
//               <div className="flex flex-col gap-1.5 relative" ref={departmentFilterRef}>
//                 <label className="text-xs font-medium text-gray-600">Department</label>
//                 <button
//                   onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                   className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
//                     filterDepartment 
//                       ? 'border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-55'
//                   }`}
//                 >
//                   <span className="flex items-center gap-1.5 truncate">
//                     <FaBuilding className="text-gray-400" />
//                     {filterDepartment || 'All Departments'}
//                   </span>
//                   <span className="text-gray-400">▾</span>
//                 </button>

//                 {showDepartmentFilter && (
//                   <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//                     <div 
//                       onClick={() => {
//                         setFilterDepartment('');
//                         setShowDepartmentFilter(false);
//                       }}
//                       className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
//                     >
//                       All Departments
//                     </div>
//                     {uniqueDepartments.map(dept => (
//                       <div 
//                         key={dept}
//                         onClick={() => {
//                           setFilterDepartment(dept);
//                           setShowDepartmentFilter(false);
//                         }}
//                         className={`px-3 py-2 text-xs hover:bg-blue-55 cursor-pointer transition-all ${
//                           filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
//                         }`}
//                       >
//                         {dept}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Designation Filter */}
//               <div className="flex flex-col gap-1.5 relative" ref={designationFilterRef}>
//                 <label className="text-xs font-medium text-gray-600">Designation</label>
//                 <button
//                   onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                   className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
//                     filterDesignation 
//                       ? 'border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10' 
//                       : 'border-gray-300 text-gray-700 hover:bg-gray-55'
//                   }`}
//                 >
//                   <span className="flex items-center gap-1.5 truncate">
//                     <FaUserTag className="text-gray-400" />
//                     {filterDesignation || 'All Designations'}
//                   </span>
//                   <span className="text-gray-400">▾</span>
//                 </button>

//                 {showDesignationFilter && (
//                   <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//                     <div 
//                       onClick={() => {
//                         setFilterDesignation('');
//                         setShowDesignationFilter(false);
//                       }}
//                       className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
//                     >
//                       All Designations
//                     </div>
//                     {uniqueDesignations.map(des => (
//                       <div 
//                         key={des}
//                         onClick={() => {
//                           setFilterDesignation(des);
//                           setShowDesignationFilter(false);
//                         }}
//                         className={`px-3 py-2 text-xs hover:bg-blue-55 cursor-pointer transition-all ${
//                           filterDesignation === des ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
//                         }`}
//                       >
//                         {des}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Date From */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">From Date</label>
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Date To */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">To Date</label>
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>

//               {/* Month Selector */}
//               <div className="flex flex-col gap-1.5">
//                 <label className="text-xs font-medium text-gray-600">Month</label>
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                   className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Filter Actions */}
//             <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
//               <div className="text-xs text-gray-500 font-medium">
//                 Showing <strong>{filteredRecords.length}</strong> of <strong>{todayRecords.length}</strong> records
//               </div>
//               <div className="flex gap-2">
//                 {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth) && (
//                   <button
//                     onClick={clearFilters}
//                     className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 transition-all flex items-center gap-1.5 shadow-sm"
//                   >
//                     <FiTrash2 /> Clear Filters
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             <div>
//               <h3 className="emp-dash__card-title">Today's Logs</h3>
//               <p className="emp-dash__card-desc">Detailed logs of checked-in employees, work location, and hours</p>
//             </div>
//           </div>

//           {filteredRecords.length === 0 ? (
//             <div className="emp-dash__card-body py-12 text-center text-gray-500">
//               No attendance records found matching current filter values.
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table View */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className="emp-dash__table">
//                   <thead>
//                     <tr>
//                       <th style={{ textAlign: "center" }}>Emp ID</th>
//                       <th>Employee Name</th>
//                       <th>Department</th>
//                       <th>Designation</th>
//                       <th style={{ textAlign: "center" }}>Date</th>
//                       <th style={{ textAlign: "center" }}>Check In</th>
//                       <th style={{ textAlign: "center" }}>Check Out</th>
//                       <th style={{ textAlign: "center" }}>Total Hours</th>
//                       <th style={{ textAlign: "center" }}>Break Time</th>
//                       <th style={{ textAlign: "right" }}>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentRows.map((rec) => {
//                       const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
//                       const breakReason = rec.breaks && rec.breaks.length > 0 ? rec.breaks[0].reason : null;

//                       return (
//                         <tr key={rec._id} className="hover:bg-gray-55/60 transition-all">
//                           <td style={{ textAlign: "center" }} className="font-semibold text-gray-900 whitespace-nowrap">{rec.employeeId || "-"}</td>
//                           <td className="font-semibold text-gray-900 whitespace-nowrap">
//                             <div className="flex items-center gap-2">
//                               {rec.profilePicture ? (
//                                 <img 
//                                   src={rec.profilePicture} 
//                                   alt={rec.name} 
//                                   className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
//                                   onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
//                                 />
//                               ) : null}
//                               <div 
//                                 style={{ display: rec.profilePicture ? 'none' : 'flex' }}
//                                 className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
//                               >
//                                 {rec.name ? rec.name.charAt(0).toUpperCase() : "?"}
//                               </div>
//                               <span>{rec.name}</span>
//                             </div>
//                           </td>
//                           <td>{rec.department}</td>
//                           <td>{rec.designation}</td>
//                           <td style={{ textAlign: "center" }} className="font-bold text-gray-700">{rec.attendanceDate || "-"}</td>
//                           <td style={{ textAlign: "center" }}>
//                             {rec.checkInTime ? (
//                               <span className="text-[11px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center gap-1 max-w-[90px] mx-auto">
//                                 <span className="relative flex w-1.5 h-1.5">
//                                   <span className="absolute inline-flex w-full h-full bg-emerald-400 rounded-full opacity-75 animate-ping"></span>
//                                   <span className="relative inline-flex w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
//                                 </span>
//                                 {new Date(rec.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
//                               </span>
//                             ) : (
//                               <span className="text-slate-400 font-medium">-</span>
//                             )}
//                           </td>
//                           <td style={{ textAlign: "center" }}>
//                             {rec.checkOutTime ? (
//                               <span className="text-[11px] font-semibold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100 max-w-[90px] mx-auto">
//                                 {new Date(rec.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
//                               </span>
//                             ) : (
//                               <span className="text-slate-400 font-medium">-</span>
//                             )}
//                           </td>
//                           <td style={{ textAlign: "center" }}>
//                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHoursColor(rec.totalHours)}`}>
//                               {rec.totalHours?.toFixed(2) || "0.00"}h
//                             </span>
//                           </td>
//                           <td style={{ textAlign: "center" }}>
//                             {breakMinutes > 0 ? (
//                               <div className="flex items-center justify-center gap-1" title={breakReason ? `Reason: ${breakReason}` : 'On Break'}>
//                                 <FiCoffee className="w-3.5 h-3.5 text-amber-500" />
//                                 <span className="text-[11px] font-bold text-amber-600">
//                                   {formatBreakMinutes(breakMinutes)}
//                                 </span>
//                               </div>
//                             ) : (
//                               <span className="text-xs text-slate-300">-</span>
//                             )}
//                           </td>
//                           <td style={{ textAlign: "right" }}>
//                             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(rec.status)}`}>
//                               {rec.status === "checked-in" ? "Active" : "Logged Out"}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile View Card List */}
//               <div className="block lg:hidden divide-y divide-gray-100">
//                 {currentRows.map((rec) => {
//                   const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
//                   const formattedTime = (time) => time ? new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";

//                   return (
//                     <div key={rec._id} className="p-4 hover:bg-gray-55/60 transition-all">
//                       <div className="flex justify-between items-start mb-2">
//                         <div className="flex items-center gap-2">
//                           {rec.profilePicture ? (
//                             <img 
//                               src={rec.profilePicture} 
//                               alt={rec.name} 
//                               className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
//                               onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
//                             />
//                           ) : null}
//                           <div 
//                             style={{ display: rec.profilePicture ? 'none' : 'flex' }}
//                             className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
//                           >
//                             {rec.name ? rec.name.charAt(0).toUpperCase() : "?"}
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-900">{rec.name}</h4>
//                             <span className="text-xs text-gray-500">{rec.employeeId} • {rec.attendanceDate}</span>
//                           </div>
//                         </div>
//                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(rec.status)}`}>
//                           {rec.status === "checked-in" ? "Active" : "Logged Out"}
//                         </span>
//                       </div>
//                       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600 mt-2">
//                         <div><span className="text-gray-400">Dept:</span> {rec.department}</div>
//                         <div><span className="text-gray-400">Desig:</span> {rec.designation}</div>
//                         <div><span className="text-gray-400">Total Hours:</span> {rec.totalHours?.toFixed(2) || "0.00"}h</div>
//                         <div><span className="text-gray-400">Break:</span> {breakMinutes > 0 ? formatBreakMinutes(breakMinutes) : "-"}</div>
//                         <div><span className="text-gray-400">Onsite:</span> {rec.onsite ? "WFO" : "WFH"}</div>
//                         <div><span className="text-gray-400">Times:</span> {rec.checkInTime ? formattedTime(rec.checkInTime) : "-"} - {rec.checkOutTime ? formattedTime(rec.checkOutTime) : "-"}</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Pagination Section */}
//               <div className="flex flex-col items-center justify-between gap-4 p-4 border-t border-gray-100 sm:flex-row bg-white rounded-b-xl">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <div className="flex items-center gap-2">
//                     <label className="text-xs font-semibold text-slate-500">
//                       Show:
//                     </label>
//                     <select
//                       value={pagination.limit}
//                       onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                       className="p-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
//                     >
//                       <option value={5}>5</option>
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>
//                     <span className="text-xs text-slate-400">entries</span>
//                   </div>
//                   <div className="text-xs text-slate-500 font-medium">
//                     Showing <strong className="text-slate-700">{indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredRecords.length)}</strong> of <strong className="text-slate-700">{filteredRecords.length}</strong> results
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-1.5">
//                   <button
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
//                     disabled={pagination.currentPage === 1}
//                     className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
//                       pagination.currentPage === 1
//                         ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
//                         : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   {getPageNumbers().map((page, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof page === 'number' ? setPagination(prev => ({ ...prev, currentPage: page })) : null}
//                       disabled={page === "..."}
//                       className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
//                         page === "..."
//                           ? "bg-white text-slate-400 border-none cursor-default"
//                           : pagination.currentPage === page
//                             ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white border-blue-600 shadow-sm"
//                             : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
//                     disabled={pagination.currentPage === pagination.totalPages}
//                     className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
//                       pagination.currentPage === pagination.totalPages
//                         ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
//                         : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default TodayAttendance;




// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { FiFilter, FiMapPin, FiUserCheck, FiUsers } from "react-icons/fi";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// import "./EmployeeDashboard.css";

// // import { API_BASE_URL } from "../config";
// // import { isEmployeeHidden } from "../utils/employeeStatus";


// const TodayAttendance = () => {
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [employees, setEmployees] = useState([]);

//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");

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

//   // Fetch when component mounts OR when filters change
//   useEffect(() => {
//     fetchAttendanceData();
//   }, [fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     filterRecords();
//   }, [todayRecords, searchTerm, filterDepartment, filterDesignation]);

//   useEffect(() => {
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, filterDepartment, filterDesignation]);

//   // Main fetch function
//   const fetchAttendanceData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Build query params - if no filters, fetch today's data only
//       const params = new URLSearchParams();

//       if (fromDate && toDate) {
//         params.append('fromDate', fromDate);
//         params.append('toDate', toDate);
//       } else if (fromDate && !toDate) {
//         params.append('fromDate', fromDate);
//       } else if (selectedMonth) {
//         params.append('month', selectedMonth);
//       } else {
//         const today = new Date().toISOString().split('T')[0];
//         params.append('fromDate', today);
//         params.append('toDate', today);
//       }

//       const url = `${API_BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`;
//       const attendanceResp = await axios.get(url);
//       const attendance = attendanceResp.data.records || attendanceResp.data || [];

//       const empResp = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = empResp.data || [];

//       const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);

//       const depts = new Set();
//       const designations = new Set();
//       activeEmployees.forEach(emp => {
//         if (emp.department) depts.add(emp.department);
//         if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
//       });
//       setUniqueDepartments(Array.from(depts).sort());
//       setUniqueDesignations(Array.from(designations).sort());

//       const merged = attendance
//         .filter(rec => rec.checkInTime)
//         .map((rec) => {
//           const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";
//           const employee = employeesData.find(e => e.employeeId === empId || e._id === empId || e.empId === empId);

//           if (isEmployeeHidden(employee)) return null;

//           const recordDate = new Date(rec.checkInTime);
//           const formattedDate = recordDate.toLocaleDateString('en-IN', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit'
//           });

//           return {
//             ...rec,
//             name: employee?.name || employee?.fullName || "N/A",
//             employeeId: empId,
//             department: employee?.department || employee?.departmentName || "N/A",
//             designation: employee?.designation || employee?.role || "N/A",
//             attendanceDate: formattedDate,
//             rawDate: recordDate
//           };
//         })
//         .filter(rec => rec !== null);

//       setTodayRecords(merged);
//     } catch (err) {
//       console.error("Error fetching attendance:", err);
//       setError("Failed to fetch attendance data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterRecords = () => {
//     let filtered = [...todayRecords];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(rec => 
//         rec.employeeId?.toString().toLowerCase().includes(term) ||
//         rec.name?.toLowerCase().includes(term)
//       );
//     }

//     if (filterDepartment) {
//       filtered = filtered.filter(rec => rec.department === filterDepartment);
//     }

//     if (filterDesignation) {
//       filtered = filtered.filter(rec => rec.designation === filterDesignation);
//     }

//     setFilteredRecords(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth("");
//   };

//   const indexOfLastRow = pagination.currentPage * pagination.limit;
//   const indexOfFirstRow = indexOfLastRow - pagination.limit;
//   const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination({
//       currentPage: 1,
//       limit: limit,
//       totalCount: filteredRecords.length,
//       totalPages: Math.ceil(filteredRecords.length / limit)
//     });
//   };

//   const getStatusColor = (status) => {
//     switch ((status || "").toLowerCase()) {
//       case "checked-in":
//         return "bg-emerald-50 text-emerald-700";
//       case "checked-out":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getHoursColor = (hours) => {
//     if (hours >= 8) return 'bg-green-100 text-green-700';
//     if (hours >= 4) return 'bg-yellow-100 text-yellow-700';
//     return 'bg-orange-100 text-orange-700';
//   };

//   // ✅ Format time with AM/PM
//   const formatTimeWithAMPM = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12 || 12;
//     return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
//   };

//   // ✅ Format date
//   const formatDateDisplay = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   if (loading)
//     return (
//       <div className="emp-dash">
//         <div className="emp-dash__loading">
//           <div className="emp-dash__spinner" />
//           <p className="emp-dash__loading-text">Loading attendance records...</p>
//         </div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="emp-dash">
//         <main className="grid place-items-center min-h-[60vh] p-4">
//           <div className="emp-dash__card max-w-[520px] w-full">
//             <div className="emp-dash__card-header">
//               <div>
//                 <h3 className="emp-dash__card-title">Couldn't load attendance</h3>
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

//   // Derived KPI values
//   const checkedInCount = filteredRecords.filter(r => (r.status || '').toLowerCase() === 'checked-in').length;
//   const checkedOutCount = filteredRecords.filter(r => (r.status || '').toLowerCase() !== 'checked-in').length;
//   const onsiteCount = filteredRecords.filter(r => r.onsite || r.reason === 'Onsite').length;

//   const getPeriodLabel = () => {
//     try {
//       const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//       if (fromDate && toDate) return fromDate === toDate ? fmt(fromDate) : `${fmt(fromDate)} – ${fmt(toDate)}`;
//       if (fromDate && !toDate) return fmt(fromDate);
//       if (selectedMonth) return new Date(`${selectedMonth}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
//       return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
//     } catch { return 'Today'; }
//   };

//   return (
//     <div className="emp-dash">
//       <div className="p-4 sm:p-6 lg:p-8">

//         {/* Page Header */}
//         <div className="emp-dash__header">
//           <div>
//             <h1 className="emp-dash__greeting">
//               Today's <span>Attendance</span>
//             </h1>
//             <p className="emp-dash__subtitle">
//               Live check-in/out records. Filter by date, department, or employee.
//             </p>
//           </div>
//           <div className="emp-dash__date-pill">
//             <FaCalendarAlt />
//             <span>{getPeriodLabel()}</span>
//           </div>
//         </div>

//         {/* KPI Stats */}
//         <main className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//           <div className="emp-dash__stat">
//             <div className="emp-dash__stat-top">
//               <span className="emp-dash__stat-label">Total Records</span>
//               <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                 <FiUsers />
//               </div>
//             </div>
//             <div className="emp-dash__stat-value">{filteredRecords.length}</div>
//             <div className="emp-dash__stat-meta">in selected period</div>
//           </div>
//         ) : (
//           <div className="overflow-hidden bg-white rounded-lg shadow-lg">
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead className="bg-gradient-to-r from-green-500 to-blue-600">
//                   <tr>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Employee ID</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Name</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Department</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Designation</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Date</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Check In</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Check Out</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Total Hours</th>
//                     <th className="px-2 py-2 text-center text-white text-xs sm:text-sm">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentRows.map((rec) => {
//                     const status = rec.status || "-";
//                     const isCheckedIn = status.toLowerCase() === "checked-in";

//                     return (
//                       <tr key={rec._id} className="border-t hover:bg-gray-50 transition-colors">
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap text-xs">
//                           {rec.employeeId || "-"}
//                         </td>
//                         <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap text-xs">
//                           {rec.name}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-700 text-xs">
//                           {rec.department}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-700 text-xs">
//                           {rec.designation}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-700 whitespace-nowrap text-xs">
//                           {formatDateDisplay(rec.checkInTime)}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-700 text-xs">
//                           {rec.checkInTime ? formatTimeWithAMPM(rec.checkInTime) : "-"}
//                         </td>
//                         <td className="px-2 py-2 text-center text-gray-700 text-xs">
//                           {rec.checkOutTime ? formatTimeWithAMPM(rec.checkOutTime) : "-"}
//                         </td>
//                         <td className="px-2 py-2 text-center">
//                           <span className={`px-2 py-1 text-xs rounded-full ${getHoursColor(rec.totalHours)}`}>
//                             {rec.totalHours?.toFixed(2) || "0.00"}h
//                           </span>
//                         </td>
//                         <td className="px-2 py-2 text-center">
//                           {isCheckedIn ? (
//                             <div className="flex items-center justify-center gap-1.5">
//                               <span className="relative flex w-2 h-2">
//                                 <span className="absolute inline-flex w-full h-full bg-emerald-500 rounded-full opacity-75 animate-ping"></span>
//                                 <span className="relative inline-flex w-2 h-2 bg-emerald-600 rounded-full"></span>
//                               </span>
//                               <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
//                                 Checked In
//                               </span>
//                             </div>
//                           ) : (
//                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
//                               {status === "checked-out" ? "Checked Out" : status}
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {filteredRecords.length > 0 && (
//               <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t gap-2">
//                 <div className="text-xs text-gray-700">
//                   Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRecords.length)} of {filteredRecords.length} results
//                   <select 
//                     value={pagination.limit} 
//                     onChange={(e) => handleItemsPerPageChange(Number(e.target.value))} 
//                     className="ml-2 p-1 text-xs border rounded"
//                   >
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={20}>20</option>
//                     <option value={50}>50</option>
//                   </select>
//                 </div>
//                 <div className="flex gap-1">
//                   <button 
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))} 
//                     disabled={pagination.currentPage === 1} 
//                     className={`px-3 py-1 text-xs border rounded ${pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                   >
//                     Prev
//                   </button>
//                   <span className="px-3 py-1 text-xs">
//                     Page {pagination.currentPage} of {pagination.totalPages || 1}
//                   </span>
//                   <button 
//                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))} 
//                     disabled={pagination.currentPage === pagination.totalPages} 
//                     className={`px-3 py-1 text-xs border rounded ${pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>

//           )}
//         </div>
//        </main>
//       </div>
//     </div>
//   );
// };

// export default TodayAttendance;






import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag, FaMapMarkerAlt } from "react-icons/fa";
import { FiCoffee, FiUsers, FiMapPin, FiUserCheck, FiHome, FiCalendar, FiTrash2, FiRefreshCw, FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// Helper function to format break minutes
const formatBreakMinutes = (minutes) => {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

// Helper function to calculate total break minutes from breaks array
const calculateTotalBreakMinutes = (breaks) => {
  if (!breaks || breaks.length === 0) return 0;
  return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
};

const TodayAttendance = () => {
  const navigate = useNavigate(); // ✅ For navigation
  
  const [todayRecords, setTodayRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [employees, setEmployees] = useState([]);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
  
  // State for stat card filter
  const [activeFilter, setActiveFilter] = useState(null); // 'all', 'active', 'onsite', 'remote'
  
  // State for mobile filter collapse
  const [showFilters, setShowFilters] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
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

  // Fetch when component mounts OR when filters change
  useEffect(() => {
    fetchAttendanceData();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    filterRecords();
  }, [todayRecords, searchTerm, filterDepartment, filterDesignation, activeFilter]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation, activeFilter]);

  // Main fetch function
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");

      // Build query params - if no filters, fetch today's data only
      const params = new URLSearchParams();
      
      if (fromDate && toDate) {
        params.append('fromDate', fromDate);
        params.append('toDate', toDate);
      } else if (fromDate && !toDate) {
        params.append('fromDate', fromDate);
      } else if (selectedMonth) {
        params.append('month', selectedMonth);
      } else {
        const today = new Date().toISOString().split('T')[0];
        params.append('fromDate', today);
        params.append('toDate', today);
      }

      const url = `${API_BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`;
      const attendanceResp = await axios.get(url);
      const attendance = attendanceResp.data.records || attendanceResp.data || [];

      const empResp = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      const employeesData = empResp.data || [];
      
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      const merged = attendance
        .filter(rec => rec.checkInTime)
        .map((rec) => {
          const empId = rec.employeeId?._id || rec.employeeId?.employeeId || rec.employeeId || rec.empId || "";
          const employee = employeesData.find(e => e.employeeId === empId || e._id === empId || e.empId === empId);
          
          if (isEmployeeHidden(employee)) return null;

          const recordDate = new Date(rec.checkInTime);
          const formattedDate = recordDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });

          return {
            ...rec,
            name: employee?.name || employee?.fullName || "N/A",
            employeeId: empId,
            department: employee?.department || employee?.departmentName || "N/A",
            designation: employee?.designation || employee?.role || "N/A",
            attendanceDate: formattedDate,
            rawDate: recordDate,
            profilePicture: employee?.profilePicture || null
          };
        })
        .filter(rec => rec !== null);

      setTodayRecords(merged);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance data.");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...todayRecords];
    
    // Apply stat card filter first
    if (activeFilter === 'active') {
      filtered = filtered.filter(rec => rec.status?.toLowerCase() === "checked-in");
    } else if (activeFilter === 'onsite') {
      filtered = filtered.filter(rec => rec.onsite === true);
    } else if (activeFilter === 'remote') {
      filtered = filtered.filter(rec => rec.onsite === false);
    }
    // 'all' shows all records, no filter needed
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.name?.toLowerCase().includes(term)
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

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setActiveFilter(null);
  };

  // ─── Navigate to Employee Locations Page ───
  const goToEmployeeLocations = () => {
    navigate('/employee-locations');
  };

  // Function to scroll to table
  const scrollToTable = () => {
    const tableElement = document.querySelector('.emp-dash__card:last-child');
    if (tableElement) {
      const headerOffset = 80;
      const elementPosition = tableElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle stat card click
  const handleStatClick = (filterType) => {
    setActiveFilter(filterType);
    // Small delay to allow state update and re-render before scrolling
    setTimeout(() => {
      scrollToTable();
    }, 100);
  };

  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "checked-in":
        return "text-emerald-700 bg-emerald-50 border-emerald-100";
      case "checked-out":
        return "text-slate-600 bg-slate-100 border-slate-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getHoursColor = (hours) => {
    if (hours >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (hours >= 4) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-red-700 bg-red-50 border-red-100';
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

  // Function to get avatar color for desktop/tab
  const getAvatarColorDesktop = (rec) => {
    if (rec.status?.toLowerCase() === "checked-out") {
      return "bg-gradient-to-br from-red-500 to-red-600";
    } else if (rec.onsite === false) {
      return "bg-gradient-to-br from-orange-500 to-amber-600";
    } else if (rec.onsite === true) {
      return "bg-gradient-to-br from-green-500 to-emerald-600";
    } else if (rec.status?.toLowerCase() === "checked-in") {
      return "bg-gradient-to-br from-emerald-500 to-green-600";
    }
    return "bg-gradient-to-br from-indigo-500 to-blue-600";
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading today's attendance...</p>
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
                <h3 className="emp-dash__card-title">Couldn't load attendance data</h3>
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

        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Today's <span>Attendance</span>
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

        {/* ─── Action Buttons Row ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            {/* ✅ Employee Location Button */}
            <button
              onClick={goToEmployeeLocations}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaMapMarkerAlt className="text-sm" />
              Check Employee Location
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAttendanceData}
              className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Top KPI Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* Total Checked-In - Shows All */}
          <div 
            onClick={() => handleStatClick('all')}
            className={`emp-dash__stat cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              activeFilter === 'all' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50' : ''
            }`}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Checked-In</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{todayRecords.length}</div>
            <div className="emp-dash__stat-meta">checked in today</div>
          </div>
          
          {/* Active Working - Shows Active/Checked-In */}
          <div 
            onClick={() => handleStatClick('active')}
            className={`emp-dash__stat cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              activeFilter === 'active' ? 'ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50/50' : ''
            }`}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Working</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value">{todayRecords.filter((r) => r.status?.toLowerCase() === "checked-in").length}</div>
            <div className="emp-dash__stat-meta">currently working</div>
          </div>

          {/* Onsite (WFO) */}
          <div 
            onClick={() => handleStatClick('onsite')}
            className={`emp-dash__stat cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              activeFilter === 'onsite' ? 'ring-2 ring-purple-500 ring-offset-2 bg-purple-50/50' : ''
            }`}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Onsite (WFO)</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiMapPin />
              </div>
            </div>
            <div className="emp-dash__stat-value">{todayRecords.filter((r) => r.onsite).length}</div>
            <div className="emp-dash__stat-meta">working at office</div>
          </div>

          {/* Remote (WFH) */}
          <div 
            onClick={() => handleStatClick('remote')}
            className={`emp-dash__stat cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              activeFilter === 'remote' ? 'ring-2 ring-orange-500 ring-offset-2 bg-orange-50/50' : ''
            }`}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Remote (WFH)</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiHome />
              </div>
            </div>
            <div className="emp-dash__stat-value">{todayRecords.filter((r) => !r.onsite).length}</div>
            <div className="emp-dash__stat-meta">working from home</div>
          </div>
        </div>

        {/* Filters Card */}
      <div className="emp-dash__card mb-6">
  {/* Desktop View */}
  <div className="hidden lg:block">
    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
      {/* Left - Filters */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Search */}
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

        {/* Department */}
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

        {/* Designation */}
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

        {/* Date From - Compact */}
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

        {/* Date To - Compact */}
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

        {/* Month Picker - Compact */}
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

      {/* Right - Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={fetchAttendanceData}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
          title="Refresh data"
        >
          <FiRefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth || activeFilter) && (
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
    {/* Mobile Header with Toggle */}
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
      >
        <FiFilter className="text-blue-600 text-base" />
        <span>Filters</span>
        {showFilters ? (
          <FiChevronUp className="text-gray-400" />
        ) : (
          <FiChevronDown className="text-gray-400" />
        )}
      </button>
      <span className="text-xs text-gray-500">
        <strong>{filteredRecords.length}</strong> records
      </span>
    </div>

    {/* Mobile Filters */}
    {showFilters && (
      <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
        {/* Search */}
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

        {/* Department */}
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

        {/* Designation */}
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

        {/* Date From & To */}
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

        {/* Month Picker */}
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

        {/* Mobile Action Buttons */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchAttendanceData}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth || activeFilter) && (
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
          <div className="emp-dash__card-header">
            <div>
              {/* Header removed as requested */}
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              No attendance records found matching current filter values.
            </div>
          ) : (
            <>
              {/* Desktop & Tab View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>Emp ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th style={{ textAlign: "center" }}>Date</th>
                      <th style={{ textAlign: "center" }}>Check In</th>
                      <th style={{ textAlign: "center" }}>Check Out</th>
                      <th style={{ textAlign: "center" }}>Total Hours</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec) => {
                      const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
                      const breakReason = rec.breaks && rec.breaks.length > 0 ? rec.breaks[0].reason : null;
                      
                      return (
                        <tr key={rec._id} className="hover:bg-gray-55/60 transition-all">
                          <td style={{ textAlign: "center" }} className="font-semibold text-gray-900 whitespace-nowrap">{rec.employeeId || "-"}</td>
                          <td className="font-semibold text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {rec.profilePicture ? (
                                <img 
                                  src={rec.profilePicture} 
                                  alt={rec.name} 
                                  className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                              ) : null}
                              <div 
                                style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                                className={`items-center justify-center w-7 h-7 text-[10px] font-bold text-white rounded-full shadow-inner ${getAvatarColorDesktop(rec)}`}
                              >
                                {rec.name ? rec.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span>{rec.name}</span>
                            </div>
                          </td>
                          <td>{rec.department}</td>
                          <td>{rec.designation}</td>
                          <td style={{ textAlign: "center" }} className="font-bold text-gray-700">{rec.attendanceDate || "-"}</td>
                          <td style={{ textAlign: "center" }}>
                            {rec.checkInTime ? (
                              <span className="text-[11px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center gap-1 max-w-[90px] mx-auto">
                                <span className="relative flex w-1.5 h-1.5">
                                  <span className="absolute inline-flex w-full h-full bg-emerald-400 rounded-full opacity-75 animate-ping"></span>
                                  <span className="relative inline-flex w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                </span>
                                {new Date(rec.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">-</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {rec.checkOutTime ? (
                              <span className="text-[11px] font-semibold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100 max-w-[90px] mx-auto">
                                {new Date(rec.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">-</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHoursColor(rec.totalHours)}`}>
                              {rec.totalHours?.toFixed(2) || "0.00"}h
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(rec.status)}`}>
                              {rec.status === "checked-in" ? "Active" : "Logged Out"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {currentRows.map((rec) => {
                  const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
                  const formattedTime = (time) => time ? new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
                  
                  // Function to get avatar color based on status with PRIORITY to WFH/Onsite
                  const getAvatarColor = (rec) => {
                    // First check: Checked-Out gets Red (highest priority)
                    if (rec.status?.toLowerCase() === "checked-out") {
                      return "bg-gradient-to-br from-red-500 to-red-600"; // Red for logged out
                    }
                    // Second check: WFH gets Orange
                    else if (rec.onsite === false) {
                      return "bg-gradient-to-br from-orange-500 to-amber-600"; // Orange for WFH
                    }
                    // Third check: Onsite gets Green
                    else if (rec.onsite === true) {
                      return "bg-gradient-to-br from-green-500 to-emerald-600"; // Green for onsite
                    }
                    // Fourth check: Active
                    else if (rec.status?.toLowerCase() === "checked-in") {
                      return "bg-gradient-to-br from-emerald-500 to-green-600"; // Green for active
                    }
                    return "bg-gradient-to-br from-indigo-500 to-blue-600"; // Default
                  };
                  
                  // Function to get status dot color with PRIORITY to Checked-Out
                  const getStatusDotColor = (rec) => {
                    // First check: Checked-Out gets Red (highest priority)
                    if (rec.status?.toLowerCase() === "checked-out") {
                      return "bg-red-500"; // Red dot for logged out
                    }
                    // Second check: WFH gets Orange
                    else if (rec.onsite === false) {
                      return "bg-orange-500"; // Orange dot for WFH
                    }
                    // Third check: Onsite gets Green
                    else if (rec.onsite === true) {
                      return "bg-green-500"; // Green dot for onsite
                    }
                    // Fourth check: Active
                    else if (rec.status?.toLowerCase() === "checked-in") {
                      return "bg-emerald-500"; // Green dot for active
                    }
                    return "bg-gray-400"; // Default
                  };
                  
                  // Get text for location badge
                  const getLocationBadge = (rec) => {
                    // Checked-Out gets Red
                    if (rec.status?.toLowerCase() === "checked-out") {
                      return "bg-red-100 text-red-700 border-red-200";
                    }
                    else if (rec.onsite === false) {
                      return "bg-orange-100 text-orange-700 border-orange-200";
                    } else if (rec.onsite === true) {
                      return "bg-green-100 text-green-700 border-green-200";
                    }
                    return "bg-gray-100 text-gray-700 border-gray-200";
                  };
                  
                  return (
                    <div key={rec._id} className="p-4 hover:bg-gray-55/60 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {rec.profilePicture ? (
                            <img 
                              src={rec.profilePicture} 
                              alt={rec.name} 
                              className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div 
                            style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                            className={`items-center justify-center w-7 h-7 text-[10px] font-bold text-white rounded-full shadow-inner ${getAvatarColor(rec)}`}
                          >
                            {rec.name ? rec.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{rec.name}</h4>
                            <div className="flex items-center gap-1.5">
                              {/* Employee ID and Location badge - commented out as requested */}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Status dot indicator - commented out as requested */}
                        </div>
                      </div>
                      
                      {/* Department and Designation in one row - same format as Total Hours */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                        <span><span className="text-gray-400">Dept:</span> {rec.department}</span>
                        <span className="text-gray-300">|</span>
                        <span><span className="text-gray-400">Desig:</span> {rec.designation}</span>
                      </div>

                      {/* Total Hours and Times in same row */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5">
                        <span><span className="text-gray-400">Total Hours:</span> <span className="font-semibold text-gray-700">{rec.totalHours?.toFixed(2) || "0.00"}h</span></span>
                        <span className="text-gray-300">|</span>
                        <span><span className="text-gray-400">Times:</span> <span className="font-semibold text-gray-700">{rec.checkInTime ? formattedTime(rec.checkInTime) : "-"} {rec.checkOutTime ? ` - ${formattedTime(rec.checkOutTime)}` : " - -"}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Section */}
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
                    Showing <strong className="text-slate-700">{indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredRecords.length)}</strong> of <strong className="text-slate-700">{filteredRecords.length}</strong> results
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
                  >Next
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

export default TodayAttendance;