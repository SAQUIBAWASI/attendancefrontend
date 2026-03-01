// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaCalendarAlt, FaSearch } from "react-icons/fa";
// import { API_BASE_URL } from "../config";

// const UserActivity = () => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     search: "",
//     action: "",
//     userRole: "",
//     startDate: "",
//     endDate: "",
//   });
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 50,
//   });
//   const [stats, setStats] = useState(null);

//   // Fetch activities
//   const fetchActivities = async () => {
//     try {
//       setLoading(true);
//       const params = {
//         page: pagination.currentPage,
//         limit: pagination.limit,
//         ...filters,
//       };

//       // Remove empty filters
//       Object.keys(params).forEach(
//         (key) => params[key] === "" && delete params[key]
//       );

//       const response = await axios.get(
//         `${API_BASE_URL}/user-activity/all`,
//         { params }
//       );

//       if (response.data.success) {
//         setActivities(response.data.data.activities);
//         setPagination(response.data.data.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching activities:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch statistics
//   const fetchStats = async () => {
//     try {
//       const params = {};
//       if (filters.startDate) params.startDate = filters.startDate;
//       if (filters.endDate) params.endDate = filters.endDate;

//       const response = await axios.get(
//         `${API_BASE_URL}/user-activity/stats`,
//         { params }
//       );

//       if (response.data.success) {
//         setStats(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   useEffect(() => {
//     fetchActivities();
//     fetchStats();
//   }, [pagination.currentPage, filters]);

//   // Handle filter change
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//     setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
//   };

//   const handleItemsPerPageChange = (limit) => {
//   setPagination((prev) => ({
//     ...prev,
//     limit: limit,
//     currentPage: 1, // reset page
//   }));
// };


//   // Reset filters
//   const resetFilters = () => {
//     setFilters({
//       search: "",
//       action: "",
//       userRole: "",
//       startDate: "",
//       endDate: "",
//     });
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = [
//       "Timestamp",
//       "User Name",
//       "User Email",
//       "Role",
//       "Action",
//       "Details",
//     ];
//     const csvData = activities.map((activity) => [
//       new Date(activity.createdAt).toLocaleString(),
//       activity.userName,
//       activity.userEmail,
//       activity.userRole,
//       formatActionName(activity.action),
//       activity.actionDetails,
//     ]);

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//   };

//   // Format action name for display
//   const formatActionName = (action) => {
//     const actionMap = {
//       login: "Login",
//       logout: "Logout",
//       leave_apply: "Leave Applied",
//       leave_approve: "Leave Approved",
//       leave_reject: "Leave Rejected",
//       payslip_download: "Payslip Downloaded",
//     };
//     return actionMap[action] || action;
//   };

//   // Get action badge color
//   const getActionBadgeColor = (action) => {
//     const colorMap = {
//       login: "bg-green-100 text-green-800",
//       logout: "bg-gray-100 text-gray-800",
//       leave_apply: "bg-blue-100 text-blue-800",
//       leave_approve: "bg-emerald-100 text-emerald-800",
//       leave_reject: "bg-red-100 text-red-800",
//       payslip_download: "bg-purple-100 text-purple-800",
//     };
//     return colorMap[action] || "bg-gray-100 text-gray-800";
//   };

//   return (
//      <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">
//         {/* Header */}
//         {/* <div className="mb-6">
//           <h1 className="mb-2 text-3xl font-bold text-gray-800">
//             User Activity Log
//           </h1>
//           <p className="text-gray-600">
//             Track all employee and admin actions in real-time
//           </p>
//         </div> */}

//         {/* Statistics Cards */}
//         {/* {stats && (
//           <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
//             <div className="p-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-md">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Activities</p>
//                   <p className="text-2xl font-bold text-gray-800">
//                     {stats.totalActivities}
//                   </p>
//                 </div>
//                 <FiUser className="text-3xl text-blue-500" />
//               </div>
//             </div>

//             <div className="p-4 bg-white border-l-4 border-green-500 rounded-lg shadow-md">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Employee Actions</p>
//                   <p className="text-2xl font-bold text-gray-800">
//                     {stats.byRole.find((r) => r._id === "employee")?.count || 0}
//                   </p>
//                 </div>
//                 <FiUser className="text-3xl text-green-500" />
//               </div>
//             </div>

//             <div className="p-4 bg-white border-l-4 border-purple-500 rounded-lg shadow-md">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Admin Actions</p>
//                   <p className="text-2xl font-bold text-gray-800">
//                     {stats.byRole.find((r) => r._id === "admin")?.count || 0}
//                   </p>
//                 </div>
//                 <FiUser className="text-3xl text-purple-500" />
//               </div>
//             </div>
//           </div>
//         )} */}

//         {/* Filters */}

//         <div className="p-2 mb-2 bg-white rounded-lg shadow-md">
//           {/* <div className="flex items-center gap-2 mb-4">
//             <FiFilter className="text-xl text-blue-600" />
//             <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
//           </div> */}

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
//             {/* Search */}
//             <div className="relative">
//               <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="text"
//                 name="search"
//                 value={filters.search}
//                 onChange={handleFilterChange}
//                 placeholder="Search by name or email"
//                 className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Action Type */}
//             <select
//               name="action"
//               value={filters.action}
//               onChange={handleFilterChange}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Actions</option>
//               <option value="login">Login</option>
//               <option value="logout">Logout</option>
//               <option value="leave_apply">Leave Applied</option>
//               <option value="leave_approve">Leave Approved</option>
//               <option value="leave_reject">Leave Rejected</option>
//               <option value="payslip_download">Payslip Downloaded</option>
//             </select>

//             {/* User Role */}
//             <select
//               name="userRole"
//               value={filters.userRole}
//               onChange={handleFilterChange}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">All Roles</option>
//               <option value="employee">Employee</option>
//               <option value="admin">Admin</option>
//             </select>

//             {/* Start Date */}
//             <div className="relative">
//               <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="date"
//                 name="startDate"
//                 value={filters.startDate}
//                 onChange={handleFilterChange}
//                 className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* End Date */}
//             <div className="relative">
//               <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="date"
//                 name="endDate"
//                 value={filters.endDate}
//                 onChange={handleFilterChange}
//                 className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Filter Actions */}
//           {/* <div className="flex gap-3 mt-4">
//             <button
//               onClick={resetFilters}
//               className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
//             >
//               <FiRefreshCw className="text-sm" />
//               Reset Filters
//             </button>
//             <button
//               onClick={exportToCSV}
//               className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//             >
//               <FiDownload className="text-sm" />
//               Export to CSV
//             </button>
//           </div> */}
//         </div>

//         {/* Activities Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-center">
//                     Timestamp
//                   </th>
//                   <th className="py-2 text-center">
//                     User
//                   </th>
//                   <th className="py-2 text-center">
//                     Role
//                   </th>
//                   <th className="py-2 text-center">
//                     Action
//                   </th>
//                   <th className="py-2 text-center">
//                     Details
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="5" className="px-2 py-2 text-center">
//                       <div className="flex items-center justify-center">
//                         <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//                         <span className="ml-2 text-gray-600">
//                           Loading activities...
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : activities.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-2 py-2 text-center">
//                       <p className="text-gray-500">No activities found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   activities.map((activity) => (
//                     <tr
//                       key={activity._id}
//                       className="transition-colors hover:bg-gray-50"
//                     >
//                       <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(activity.createdAt).toLocaleString("en-IN", {
//                           dateStyle: "medium",
//                           timeStyle: "short",
//                         })}
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <div className="flex flex-col">
//                           <span className="text-sm font-medium text-gray-900">
//                             {activity.userName}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             {activity.userEmail || activity.userId}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.userRole === "admin"
//                             ? "bg-purple-100 text-purple-800"
//                             : "bg-blue-100 text-blue-800"
//                             }`}
//                         >
//                           {activity.userRole.charAt(0).toUpperCase() +
//                             activity.userRole.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-2 text-center p whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(
//                             activity.action
//                           )}`}
//                         >
//                           {formatActionName(activity.action)}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-700">
//                         {activity.actionDetails}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {!loading && activities.length > 0 && (
//             <div className="flex items-center justify-between px-2 py-2 text-center border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-wrap items-center justify-between gap-4">
  
//   {/* Left Side - Showing Info + Select */}
//   <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
    
//     <span>Showing</span>

//     <span className="font-medium">
//       {(pagination.currentPage - 1) * pagination.limit + 1}
//     </span>

//     <span>to</span>

//     <span className="font-medium">
//       {Math.min(
//         pagination.currentPage * pagination.limit,
//         pagination.totalCount
//       )}
//     </span>

//     <span>of</span>

//     <span className="font-medium">
//       {pagination.totalCount}
//     </span>

//     <span>results</span>

//     {/* Select Dropdown */}
//     <select
//       value={pagination.limit}
//       onChange={(e) => {
//         const newLimit = Number(e.target.value);
//         handleItemsPerPageChange(newLimit); // apna function call karo
//       }}
//       className="p-1 ml-2 text-sm border rounded-lg"
//     >
//       <option value={5}>5</option>
//       <option value={10}>10</option>
//       <option value={20}>20</option>
//       <option value={50}>50</option>
//     </select>

//   </div>
// </div>


//               <div className="flex gap-2">
//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage - 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === 1}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {[...Array(pagination.totalPages)].map((_, index) => {
//                     const page = index + 1;
//                     // Show first page, last page, current page, and pages around current
//                     if (
//                       page === 1 ||
//                       page === pagination.totalPages ||
//                       (page >= pagination.currentPage - 1 &&
//                         page <= pagination.currentPage + 1)
//                     ) {
//                       return (
//                         <button
//                           key={page}
//                           onClick={() =>
//                             setPagination((prev) => ({
//                               ...prev,
//                               currentPage: page,
//                             }))
//                           }
//                           className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.currentPage === page
//                             ? "bg-blue-600 text-white"
//                             : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                             }`}
//                         >
//                           {page}
//                         </button>
//                       );
//                     } else if (
//                       page === pagination.currentPage - 2 ||
//                       page === pagination.currentPage + 2
//                     ) {
//                       return (
//                         <span key={page} className="px-2 text-gray-500">
//                           ...
//                         </span>
//                       );
//                     }
//                     return null;
//                   })}
//                 </div>

//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage + 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === pagination.totalPages}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserActivity;


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaCalendarAlt, FaSearch } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const UserActivity = () => {
//   const [activities, setActivities] = useState([]);
//   const [filteredActivities, setFilteredActivities] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [actionFilter, setActionFilter] = useState("");
//   const [userRoleFilter, setUserRoleFilter] = useState("");
  
//   // Date filters
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
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

//   // Fetch employees for department/designation data
//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = response.data || [];
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
      
//       return activeEmployees;
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//       return [];
//     }
//   };

//   // Get employee details by ID or email
//   const getEmployeeDetails = (userId, userEmail) => {
//     const employee = employees.find(emp => 
//       emp.employeeId === userId || 
//       emp._id === userId || 
//       emp.email === userId ||
//       emp.email === userEmail
//     );
    
//     return {
//       department: employee?.department || employee?.departmentName || "N/A",
//       designation: employee?.designation || employee?.role || "N/A",
//       name: employee?.name || employee?.fullName || "N/A"
//     };
//   };

//   // Fetch activities
//   const fetchActivities = async () => {
//     try {
//       setLoading(true);
      
//       // First fetch employees
//       const activeEmployees = await fetchEmployees();
      
//       // Then fetch activities
//       const params = {
//         page: pagination.currentPage,
//         limit: pagination.limit,
//       };

//       // Add filters
//       if (searchTerm) params.search = searchTerm;
//       if (actionFilter) params.action = actionFilter;
//       if (userRoleFilter) params.userRole = userRoleFilter;

//       const response = await axios.get(
//         `${API_BASE_URL}/user-activity/all`,
//         { params }
//       );

//       if (response.data.success) {
//         // Enrich activities with department/designation
//         const enrichedActivities = response.data.data.activities.map(activity => {
//           const empDetails = getEmployeeDetails(activity.userId, activity.userEmail);
//           return {
//             ...activity,
//             department: empDetails.department,
//             designation: empDetails.designation,
//             userName: activity.userName || empDetails.name
//           };
//         });
        
//         setActivities(enrichedActivities);
//         setFilteredActivities(enrichedActivities);
//         setPagination(response.data.data.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching activities:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchActivities();
//   }, [pagination.currentPage, pagination.limit]);

//   useEffect(() => {
//     // Apply filters whenever data or filters change
//     filterActivities();
//   }, [activities, searchTerm, actionFilter, userRoleFilter, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   useEffect(() => {
//     // Reset to first page when filters change
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, [searchTerm, actionFilter, userRoleFilter, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

//   const filterActivities = () => {
//     let filtered = [...activities];
    
//     // Apply search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(activity => 
//         activity.userName?.toLowerCase().includes(term) ||
//         activity.userEmail?.toLowerCase().includes(term)
//       );
//     }
    
//     // Apply action filter
//     if (actionFilter) {
//       filtered = filtered.filter(activity => activity.action === actionFilter);
//     }
    
//     // Apply role filter
//     if (userRoleFilter) {
//       filtered = filtered.filter(activity => activity.userRole === userRoleFilter);
//     }
    
//     // Filter by Department
//     if (filterDepartment) {
//       filtered = filtered.filter(activity => activity.department === filterDepartment);
//     }
    
//     // Filter by Designation
//     if (filterDesignation) {
//       filtered = filtered.filter(activity => activity.designation === filterDesignation);
//     }
    
//     // Filter by Date Range
//     if (fromDate && toDate) {
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(toDate);
//       to.setHours(23, 59, 59, 999);
      
//       filtered = filtered.filter(activity => {
//         const activityDate = new Date(activity.createdAt);
//         return activityDate >= from && activityDate <= to;
//       });
//     } else if (fromDate && !toDate) {
//       // Single date
//       const from = new Date(fromDate);
//       from.setHours(0, 0, 0, 0);
//       const to = new Date(fromDate);
//       to.setHours(23, 59, 59, 999);
      
//       filtered = filtered.filter(activity => {
//         const activityDate = new Date(activity.createdAt);
//         return activityDate >= from && activityDate <= to;
//       });
//     } else if (selectedMonth) {
//       // Month filter
//       const [year, month] = selectedMonth.split('-').map(Number);
//       filtered = filtered.filter(activity => {
//         const activityDate = new Date(activity.createdAt);
//         return activityDate.getFullYear() === year && activityDate.getMonth() + 1 === month;
//       });
//     }
    
//     setFilteredActivities(filtered);
//     setPagination(prev => ({
//       ...prev,
//       totalCount: filtered.length,
//       totalPages: Math.ceil(filtered.length / prev.limit)
//     }));
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchTerm("");
//     setActionFilter("");
//     setUserRoleFilter("");
//     setFromDate("");
//     setToDate("");
//     setSelectedMonth(new Date().toISOString().slice(0, 7));
//     setFilterDepartment("");
//     setFilterDesignation("");
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = [
//       "Timestamp",
//       "User Name",
//       "User Email",
//       "Department",
//       "Designation",
//       "Role",
//       "Action",
//       "Details",
//     ];
//     const csvData = filteredActivities.map((activity) => [
//       new Date(activity.createdAt).toLocaleString(),
//       activity.userName,
//       activity.userEmail,
//       activity.department,
//       activity.designation,
//       activity.userRole,
//       formatActionName(activity.action),
//       activity.actionDetails,
//     ]);

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//   };

//   // Format action name for display
//   const formatActionName = (action) => {
//     const actionMap = {
//       login: "Login",
//       logout: "Logout",
//       leave_apply: "Leave Applied",
//       leave_approve: "Leave Approved",
//       leave_reject: "Leave Rejected",
//       payslip_download: "Payslip Downloaded",
//     };
//     return actionMap[action] || action;
//   };

//   // Get action badge color
//   const getActionBadgeColor = (action) => {
//     const colorMap = {
//       login: "bg-green-100 text-green-800",
//       logout: "bg-gray-100 text-gray-800",
//       leave_apply: "bg-blue-100 text-blue-800",
//       leave_approve: "bg-emerald-100 text-emerald-800",
//       leave_reject: "bg-red-100 text-red-800",
//       payslip_download: "bg-purple-100 text-purple-800",
//     };
//     return colorMap[action] || "bg-gray-100 text-gray-800";
//   };

//   // Pagination handlers
//   const handleItemsPerPageChange = (limit) => {
//     setPagination(prev => ({
//       ...prev,
//       limit: limit,
//       currentPage: 1
//     }));
//   };

//   // Pagination calculations
//   const indexOfLastItem = pagination.currentPage * pagination.limit;
//   const indexOfFirstItem = indexOfLastItem - pagination.limit;
//   const currentItems = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">

//         {/* Filters */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by name or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Action Type */}
//             <select
//               value={actionFilter}
//               onChange={(e) => setActionFilter(e.target.value)}
//               className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
//             >
//               <option value="">All Actions</option>
//               <option value="login">Login</option>
//               <option value="logout">Logout</option>
//               <option value="leave_apply">Leave Applied</option>
//               <option value="leave_approve">Leave Approved</option>
//               <option value="leave_reject">Leave Rejected</option>
//               <option value="payslip_download">Payslip Downloaded</option>
//             </select>

//             {/* User Role */}
//             <select
//               value={userRoleFilter}
//               onChange={(e) => setUserRoleFilter(e.target.value)}
//               className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[90px]"
//             >
//               <option value="">All Roles</option>
//               <option value="employee">Employee</option>
//               <option value="admin">Admin</option>
//             </select>

//             {/* Department Filter Button */}
//             {/* <div className="relative" ref={departmentFilterRef}>
//               <button
//                 onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDepartment 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
//               </button> */}
              
//               {/* Department Filter Dropdown */}
//               {/* {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
//             </div> */}

//             {/* Designation Filter Button */}
//             {/* <div className="relative" ref={designationFilterRef}>
//               <button
//                 onClick={() => setShowDesignationFilter(!showDesignationFilter)}
//                 className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
//                   filterDesignation 
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
//                 }`}
//               >
//                 <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
//               </button> */}
              
//               {/* Designation Filter Dropdown */}
//               {/* {showDesignationFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDesignation('');
//                       setShowDesignationFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
//                   >
//                     All Designations
//                   </div> */}
//                   {/* {uniqueDesignations.map(des => (
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
//             </div> */}

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
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Export CSV Button */}
//             <button
//               onClick={exportToCSV}
//               className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
//             >
//               📥 CSV
//             </button>

//             {/* Clear Filters Button */}
//             {(searchTerm || actionFilter || userRoleFilter || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
//               <button
//                 onClick={resetFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//       {/* Activities Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-center">Timestamp</th>
//                   <th className="py-2 text-center">User</th>
//                   {/* <th className="py-2 text-center">Department</th>
//                   <th className="py-2 text-center">Designation</th> */}
//                   <th className="py-2 text-center">Role</th>
//                   <th className="py-2 text-center">Action</th>
//                   <th className="py-2 text-center">Details</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="px-2 py-2 text-center">
//                       <div className="flex items-center justify-center">
//                         <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//                         <span className="ml-2 text-gray-600">
//                           Loading activities...
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="px-2 py-2 text-center">
//                       <p className="text-gray-500">No activities found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((activity) => (
//                     <tr
//                       key={activity._id}
//                       className="transition-colors hover:bg-gray-50"
//                     >
//                       <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(activity.createdAt).toLocaleString("en-IN", {
//                           dateStyle: "medium",
//                           timeStyle: "short",
//                         })}
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <div className="flex flex-col">
//                           <span className="font-medium text-gray-900">
//                             {activity.userName}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             {activity.userEmail || activity.userId}
//                           </span>
//                         </div>
//                       </td>
//                       {/* <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                         {activity.department}
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                         {activity.designation}
//                       </td> */}
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                             activity.userRole === "admin"
//                               ? "bg-purple-100 text-purple-800"
//                               : "bg-blue-100 text-blue-800"
//                           }`}
//                         >
//                           {activity.userRole?.charAt(0).toUpperCase() + activity.userRole?.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(
//                             activity.action
//                           )}`}
//                         >
//                           {formatActionName(activity.action)}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-700">
//                         {activity.actionDetails}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {!loading && filteredActivities.length > 0 && (
//             <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                 <span>Showing</span>
//                 <span className="font-medium">
//                   {indexOfFirstItem + 1}
//                 </span>
//                 <span>to</span>
//                 <span className="font-medium">
//                   {Math.min(indexOfLastItem, filteredActivities.length)}
//                 </span>
//                 <span>of</span>
//                 <span className="font-medium">
//                   {filteredActivities.length}
//                 </span>
//                 <span>results</span>

//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     const newLimit = Number(e.target.value);
//                     handleItemsPerPageChange(newLimit);
//                   }}
//                   className="p-1 ml-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage - 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === 1}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {[...Array(pagination.totalPages)].map((_, index) => {
//                     const page = index + 1;
//                     if (
//                       page === 1 ||
//                       page === pagination.totalPages ||
//                       (page >= pagination.currentPage - 1 &&
//                         page <= pagination.currentPage + 1)
//                     ) {
//                       return (
//                         <button
//                           key={page}
//                           onClick={() =>
//                             setPagination((prev) => ({
//                               ...prev,
//                               currentPage: page,
//                             }))
//                           }
//                           className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             pagination.currentPage === page
//                               ? "bg-blue-600 text-white"
//                               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       );
//                     } else if (
//                       page === pagination.currentPage - 2 ||
//                       page === pagination.currentPage + 2
//                     ) {
//                       return (
//                         <span key={page} className="px-2 text-gray-500">
//                           ...
//                         </span>
//                       );
//                     }
//                     return null;
//                   })}
//                 </div>

//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage + 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === pagination.totalPages}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserActivity;



import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
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
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

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

  // Fetch employees first
  const fetchEmployees = async () => {
    try {
      console.log("Fetching employees...");
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      console.log("Employees API response:", response.data);
      
      const employeesData = response.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      console.log("Active employees:", activeEmployees);
      
      setEmployees(activeEmployees);
      
      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) {
          depts.add(emp.department);
          console.log("Department found:", emp.department);
        }
        if (emp.role || emp.designation) {
          designations.add(emp.role || emp.designation);
          console.log("Designation found:", emp.role || emp.designation);
        }
      });
      
      const deptsArray = Array.from(depts).sort();
      const desigsArray = Array.from(designations).sort();
      
      console.log("Unique departments:", deptsArray);
      console.log("Unique designations:", desigsArray);
      
      setUniqueDepartments(deptsArray);
      setUniqueDesignations(desigsArray);
      
      return activeEmployees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
  };

  // Get employee details by ID or email
  const getEmployeeDetails = (userId, userEmail) => {
    if (!employees || employees.length === 0) {
      console.log("No employees data available");
      return {
        department: "N/A",
        designation: "N/A",
        name: "N/A"
      };
    }
    
    console.log("Finding employee for:", { userId, userEmail });
    
    // Try to find employee by multiple possible fields
    const employee = employees.find(emp => {
      const match = (
        emp.employeeId === userId || 
        emp._id === userId || 
        emp.email === userId ||
        emp.email === userEmail ||
        emp.employeeId === userEmail
      );
      if (match) {
        console.log("Employee found:", emp);
      }
      return match;
    });
    
    const details = {
      department: employee?.department || employee?.departmentName || "N/A",
      designation: employee?.designation || employee?.role || "N/A",
      name: employee?.name || employee?.fullName || "N/A"
    };
    
    console.log("Employee details:", details);
    return details;
  };

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // First fetch employees
      const activeEmployees = await fetchEmployees();
      console.log("Active employees count:", activeEmployees.length);
      
      // Then fetch activities
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      // Add filters
      if (searchTerm) params.search = searchTerm;
      if (actionFilter) params.action = actionFilter;
      if (userRoleFilter) params.userRole = userRoleFilter;

      console.log("Fetching activities with params:", params);

      const response = await axios.get(
        `${API_BASE_URL}/user-activity/all`,
        { params }
      );

      console.log("Activities API response:", response.data);

      if (response.data.success) {
        const activitiesData = response.data.data.activities;
        console.log("Raw activities:", activitiesData);
        
        // Enrich activities with department/designation
        const enrichedActivities = activitiesData.map(activity => {
          console.log("Processing activity:", activity);
          const empDetails = getEmployeeDetails(activity.userId, activity.userEmail);
          const enriched = {
            ...activity,
            department: empDetails.department,
            designation: empDetails.designation,
            userName: activity.userName || empDetails.name
          };
          console.log("Enriched activity:", enriched);
          return enriched;
        });
        
        console.log("All enriched activities:", enrichedActivities);
        
        setActivities(enrichedActivities);
        setFilteredActivities(enrichedActivities);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, []); // Empty dependency array for initial load

  // Fetch activities when pagination changes
  useEffect(() => {
    if (pagination.currentPage !== 1 || pagination.limit !== 10) {
      fetchActivities();
    }
  }, [pagination.currentPage, pagination.limit]);

  // FILTER ACTIVITIES
  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, actionFilter, userRoleFilter, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, actionFilter, userRoleFilter, filterDepartment, filterDesignation, fromDate, toDate, selectedMonth]);

  const filterActivities = () => {
    console.log("Filtering activities with:", {
      searchTerm,
      actionFilter,
      userRoleFilter,
      filterDepartment,
      filterDesignation,
      fromDate,
      toDate,
      selectedMonth,
      activitiesCount: activities.length
    });
    
    let filtered = [...activities];
    console.log("Initial filtered count:", filtered.length);
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(activity => {
        const match = (
          activity.userName?.toLowerCase().includes(term) ||
          (activity.userEmail && activity.userEmail.toLowerCase().includes(term))
        );
        if (match) console.log("Search match:", activity.userName);
        return match;
      });
      console.log("After search filter:", filtered.length);
    }
    
    // Apply action filter
    if (actionFilter) {
      filtered = filtered.filter(activity => {
        const match = activity.action === actionFilter;
        if (match) console.log("Action match:", activity.action);
        return match;
      });
      console.log("After action filter:", filtered.length);
    }
    
    // Apply role filter
    if (userRoleFilter) {
      filtered = filtered.filter(activity => {
        const match = activity.userRole === userRoleFilter;
        if (match) console.log("Role match:", activity.userRole);
        return match;
      });
      console.log("After role filter:", filtered.length);
    }
    
    // Filter by Department
    if (filterDepartment) {
      console.log("Filtering by department:", filterDepartment);
      console.log("Activities with departments:", filtered.map(a => ({ name: a.userName, dept: a.department })));
      
      filtered = filtered.filter(activity => {
        const match = activity.department && activity.department === filterDepartment;
        if (match) console.log("Department match:", activity.userName, activity.department);
        return match;
      });
      console.log("After department filter:", filtered.length);
    }
    
    // Filter by Designation
    if (filterDesignation) {
      console.log("Filtering by designation:", filterDesignation);
      console.log("Activities with designations:", filtered.map(a => ({ name: a.userName, desig: a.designation })));
      
      filtered = filtered.filter(activity => {
        const match = activity.designation && activity.designation === filterDesignation;
        if (match) console.log("Designation match:", activity.userName, activity.designation);
        return match;
      });
      console.log("After designation filter:", filtered.length);
    }
    
    // Filter by Date Range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= from && activityDate <= to;
      });
      console.log("After date range filter:", filtered.length);
    } else if (fromDate && !toDate) {
      // Single date
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(fromDate);
      to.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= from && activityDate <= to;
      });
      console.log("After single date filter:", filtered.length);
    } else if (selectedMonth) {
      // Month filter
      const [year, month] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.createdAt);
        return activityDate.getFullYear() === year && activityDate.getMonth() + 1 === month;
      });
      console.log("After month filter:", filtered.length);
    }
    
    console.log("Final filtered count:", filtered.length);
    setFilteredActivities(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setUserRoleFilter("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setFilterDepartment("");
    setFilterDesignation("");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Department",
      "Designation",
      "Role",
      "Action",
      "Details",
    ];
    const csvData = filteredActivities.map((activity) => [
      new Date(activity.createdAt).toLocaleString(),
      activity.userName || "",
      activity.userEmail || "",
      activity.department || "N/A",
      activity.designation || "N/A",
      activity.userRole || "",
      formatActionName(activity.action),
      activity.actionDetails || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Format action name for display
  const formatActionName = (action) => {
    const actionMap = {
      login: "Login",
      logout: "Logout",
      leave_apply: "Leave Applied",
      leave_approve: "Leave Approved",
      leave_reject: "Leave Rejected",
      payslip_download: "Payslip Downloaded",
    };
    return actionMap[action] || action;
  };

  // Get action badge color
  const getActionBadgeColor = (action) => {
    const colorMap = {
      login: "bg-green-100 text-green-800",
      logout: "bg-gray-100 text-gray-800",
      leave_apply: "bg-blue-100 text-blue-800",
      leave_approve: "bg-emerald-100 text-emerald-800",
      leave_reject: "bg-red-100 text-red-800",
      payslip_download: "bg-purple-100 text-purple-800",
    };
    return colorMap[action] || "bg-gray-100 text-gray-800";
  };

  // Pagination handlers
  const handleItemsPerPageChange = (limit) => {
    setPagination(prev => ({
      ...prev,
      limit: limit,
      currentPage: 1
    }));
  };

  // Pagination calculations
  const indexOfLastItem = pagination.currentPage * pagination.limit;
  const indexOfFirstItem = indexOfLastItem - pagination.limit;
  const currentItems = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (i === pagination.currentPage - 2 || i === pagination.currentPage + 2) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Filters */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Type */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="leave_apply">Leave Applied</option>
              <option value="leave_approve">Leave Approved</option>
              <option value="leave_reject">Leave Rejected</option>
              <option value="payslip_download">Payslip Downloaded</option>
            </select>

            {/* User Role */}
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[90px]"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

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
                  {uniqueDepartments.length > 0 ? (
                    uniqueDepartments.map(dept => (
                      <div 
                        key={dept}
                        onClick={() => {
                          setFilterDepartment(dept);
                          setShowDepartmentFilter(false);
                          console.log("Department selected:", dept);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                          filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        {dept}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-500">No departments found</div>
                  )}
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
                  {uniqueDesignations.length > 0 ? (
                    uniqueDesignations.map(des => (
                      <div 
                        key={des}
                        onClick={() => {
                          setFilterDesignation(des);
                          setShowDesignationFilter(false);
                          console.log("Designation selected:", des);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                          filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        {des}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-500">No designations found</div>
                  )}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[130px]">
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
            <div className="relative w-[130px]">
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
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              📥 CSV
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || actionFilter || userRoleFilter || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
              <button
                onClick={resetFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Activities Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 text-center">TIMESTAMP</th>
                  <th className="py-2 text-center">USER</th>
                  <th className="py-2 text-center">DEPARTMENT</th>
                  <th className="py-2 text-center">DESIGNATION</th>
                  <th className="py-2 text-center">ROLE</th>
                  <th className="py-2 text-center">ACTION</th>
                  <th className="py-2 text-center">DETAILS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">
                          Loading activities...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-2 py-2 text-center">
                      <p className="text-gray-500">No activities found</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((activity) => (
                    <tr
                      key={activity._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                        {new Date(activity.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {activity.userName || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.userEmail || activity.userId || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
                        {activity.department}
                      </td>
                      <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
                        {activity.designation}
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.userRole === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {activity.userRole?.charAt(0).toUpperCase() + activity.userRole?.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(
                            activity.action
                          )}`}
                        >
                          {formatActionName(activity.action)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-sm text-center text-gray-700">
                        {activity.actionDetails || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredActivities.length > 0 && (
            <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">
                  {indexOfFirstItem + 1}
                </span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredActivities.length)}
                </span>
                <span>of</span>
                <span className="font-medium">
                  {filteredActivities.length}
                </span>
                <span>results</span>

                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    handleItemsPerPageChange(newLimit);
                  }}
                  className="p-1 ml-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                      <span key={index} className="px-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: page,
                          }))
                        }
                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pagination.currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivity;



// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag } from "react-icons/fa";
// import { API_BASE_URL } from "../config";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// const UserActivity = () => {
//   const [activities, setActivities] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [actionFilter, setActionFilter] = useState("");
//   const [userRoleFilter, setUserRoleFilter] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
  
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
  
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalCount: 0,
//     limit: 10,
//   });
//   const [stats, setStats] = useState(null);

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

//   // Fetch employees for department/designation data
//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const employeesData = response.data || [];
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
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   // Get employee details by ID
//   const getEmployeeDetails = (userId) => {
//     const employee = employees.find(emp => 
//       emp.employeeId === userId || emp._id === userId || emp.email === userId
//     );
    
//     return {
//       department: employee?.department || employee?.departmentName || "N/A",
//       designation: employee?.designation || employee?.role || "N/A"
//     };
//   };

//   // Fetch activities
//   const fetchActivities = async () => {
//     try {
//       setLoading(true);
//       const params = {
//         page: pagination.currentPage,
//         limit: pagination.limit,
//       };

//       // Add filters
//       if (searchTerm) params.search = searchTerm;
//       if (actionFilter) params.action = actionFilter;
//       if (userRoleFilter) params.userRole = userRoleFilter;
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       if (filterDepartment) params.department = filterDepartment;
//       if (filterDesignation) params.designation = filterDesignation;

//       const response = await axios.get(
//         `${API_BASE_URL}/user-activity/all`,
//         { params }
//       );

//       if (response.data.success) {
//         // Enrich activities with department/designation
//         const enrichedActivities = response.data.data.activities.map(activity => {
//           const empDetails = getEmployeeDetails(activity.userId || activity.userEmail);
//           return {
//             ...activity,
//             department: empDetails.department,
//             designation: empDetails.designation
//           };
//         });
        
//         setActivities(enrichedActivities);
//         setPagination(response.data.data.pagination);
//       }
//     } catch (error) {
//       console.error("Error fetching activities:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch statistics
//   const fetchStats = async () => {
//     try {
//       const params = {};
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;

//       const response = await axios.get(
//         `${API_BASE_URL}/user-activity/stats`,
//         { params }
//       );

//       if (response.data.success) {
//         setStats(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     fetchActivities();
//     fetchStats();
//   }, [pagination.currentPage, pagination.limit, searchTerm, actionFilter, userRoleFilter, startDate, endDate, filterDepartment, filterDesignation]);

//   const handleItemsPerPageChange = (limit) => {
//     setPagination((prev) => ({
//       ...prev,
//       limit: limit,
//       currentPage: 1,
//     }));
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchTerm("");
//     setActionFilter("");
//     setUserRoleFilter("");
//     setStartDate("");
//     setEndDate("");
//     setFilterDepartment("");
//     setFilterDesignation("");
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     const headers = [
//       "Timestamp",
//       "User Name",
//       "User Email",
//       "Department",
//       "Designation",
//       "Role",
//       "Action",
//       "Details",
//     ];
//     const csvData = activities.map((activity) => [
//       new Date(activity.createdAt).toLocaleString(),
//       activity.userName,
//       activity.userEmail,
//       activity.department,
//       activity.designation,
//       activity.userRole,
//       formatActionName(activity.action),
//       activity.actionDetails,
//     ]);

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `user_activity_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//   };

//   // Format action name for display
//   const formatActionName = (action) => {
//     const actionMap = {
//       login: "Login",
//       logout: "Logout",
//       leave_apply: "Leave Applied",
//       leave_approve: "Leave Approved",
//       leave_reject: "Leave Rejected",
//       payslip_download: "Payslip Downloaded",
//     };
//     return actionMap[action] || action;
//   };

//   // Get action badge color
//   const getActionBadgeColor = (action) => {
//     const colorMap = {
//       login: "bg-green-100 text-green-800",
//       logout: "bg-gray-100 text-gray-800",
//       leave_apply: "bg-blue-100 text-blue-800",
//       leave_approve: "bg-emerald-100 text-emerald-800",
//       leave_reject: "bg-red-100 text-red-800",
//       payslip_download: "bg-purple-100 text-purple-800",
//     };
//     return colorMap[action] || "bg-gray-100 text-gray-800";
//   };

//   // Pagination calculations
//   const indexOfLastItem = pagination.currentPage * pagination.limit;
//   const indexOfFirstItem = indexOfLastItem - pagination.limit;
//   const currentItems = activities;

//   return (
//     <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="mx-auto max-w-9xl">

//         {/* Filters */}
//         <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
//           <div className="flex flex-wrap items-center gap-2">
            
//             {/* Search */}
//             <div className="relative flex-1 min-w-[180px]">
//               <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by name or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Action Type */}
//             <select
//               value={actionFilter}
//               onChange={(e) => setActionFilter(e.target.value)}
//               className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[120px]"
//             >
//               <option value="">All Actions</option>
//               <option value="login">Login</option>
//               <option value="logout">Logout</option>
//               <option value="leave_apply">Leave Applied</option>
//               <option value="leave_approve">Leave Approved</option>
//               <option value="leave_reject">Leave Rejected</option>
//               <option value="payslip_download">Payslip Downloaded</option>
//             </select>

//             {/* User Role */}
//             <select
//               value={userRoleFilter}
//               onChange={(e) => setUserRoleFilter(e.target.value)}
//               className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
//             >
//               <option value="">All Roles</option>
//               <option value="employee">Employee</option>
//               <option value="admin">Admin</option>
//             </select>

//             {/* Department Filter Button */}
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
              
//               {/* Department Filter Dropdown */}
//               {showDepartmentFilter && (
//                 <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => {
//                       setFilterDepartment('');
//                       setShowDepartmentFilter(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
//                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
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
//                     className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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

//             {/* Start Date */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* End Date */}
//             <div className="relative w-[130px]">
//               <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Export CSV Button */}
//             <button
//               onClick={exportToCSV}
//               className="h-8 px-3 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
//             >
//               📥 CSV
//             </button>

//             {/* Clear Filters Button */}
//             {(searchTerm || actionFilter || userRoleFilter || filterDepartment || filterDesignation || startDate || endDate) && (
//               <button
//                 onClick={resetFilters}
//                 className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Activities Table */}
//         <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
//           <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
//             <table className="min-w-full">
//               <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
//                 <tr>
//                   <th className="py-2 text-center">Timestamp</th>
//                   <th className="py-2 text-center">User</th>
//                   <th className="py-2 text-center">Department</th>
//                   <th className="py-2 text-center">Designation</th>
//                   <th className="py-2 text-center">Role</th>
//                   <th className="py-2 text-center">Action</th>
//                   <th className="py-2 text-center">Details</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="px-2 py-2 text-center">
//                       <div className="flex items-center justify-center">
//                         <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
//                         <span className="ml-2 text-gray-600">
//                           Loading activities...
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="px-2 py-2 text-center">
//                       <p className="text-gray-500">No activities found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((activity) => (
//                     <tr
//                       key={activity._id}
//                       className="transition-colors hover:bg-gray-50"
//                     >
//                       <td className="px-2 py-2 text-sm font-medium text-center text-gray-900 whitespace-nowrap">
//                         {new Date(activity.createdAt).toLocaleString("en-IN", {
//                           dateStyle: "medium",
//                           timeStyle: "short",
//                         })}
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <div className="flex flex-col">
//                           <span className="text-sm font-medium text-gray-900">
//                             {activity.userName}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             {activity.userEmail || activity.userId}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                         {activity.department}
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-600 whitespace-nowrap">
//                         {activity.designation}
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                             activity.userRole === "admin"
//                               ? "bg-purple-100 text-purple-800"
//                               : "bg-blue-100 text-blue-800"
//                           }`}
//                         >
//                           {activity.userRole?.charAt(0).toUpperCase() + activity.userRole?.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-center whitespace-nowrap">
//                         <span
//                           className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(
//                             activity.action
//                           )}`}
//                         >
//                           {formatActionName(activity.action)}
//                         </span>
//                       </td>
//                       <td className="px-2 py-2 text-sm text-center text-gray-700">
//                         {activity.actionDetails}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {!loading && activities.length > 0 && (
//             <div className="flex items-center justify-between px-2 py-2 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
//                 <span>Showing</span>
//                 <span className="font-medium">
//                   {(pagination.currentPage - 1) * pagination.limit + 1}
//                 </span>
//                 <span>to</span>
//                 <span className="font-medium">
//                   {Math.min(
//                     pagination.currentPage * pagination.limit,
//                     pagination.totalCount
//                   )}
//                 </span>
//                 <span>of</span>
//                 <span className="font-medium">
//                   {pagination.totalCount}
//                 </span>
//                 <span>results</span>

//                 {/* Select Dropdown */}
//                 <select
//                   value={pagination.limit}
//                   onChange={(e) => {
//                     const newLimit = Number(e.target.value);
//                     handleItemsPerPageChange(newLimit);
//                   }}
//                   className="p-1 ml-2 text-sm border rounded-lg"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage - 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === 1}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {[...Array(pagination.totalPages)].map((_, index) => {
//                     const page = index + 1;
//                     if (
//                       page === 1 ||
//                       page === pagination.totalPages ||
//                       (page >= pagination.currentPage - 1 &&
//                         page <= pagination.currentPage + 1)
//                     ) {
//                       return (
//                         <button
//                           key={page}
//                           onClick={() =>
//                             setPagination((prev) => ({
//                               ...prev,
//                               currentPage: page,
//                             }))
//                           }
//                           className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
//                             pagination.currentPage === page
//                               ? "bg-blue-600 text-white"
//                               : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       );
//                     } else if (
//                       page === pagination.currentPage - 2 ||
//                       page === pagination.currentPage + 2
//                     ) {
//                       return (
//                         <span key={page} className="px-2 text-gray-500">
//                           ...
//                         </span>
//                       );
//                     }
//                     return null;
//                   })}
//                 </div>

//                 <button
//                   onClick={() =>
//                     setPagination((prev) => ({
//                       ...prev,
//                       currentPage: prev.currentPage + 1,
//                     }))
//                   }
//                   disabled={pagination.currentPage === pagination.totalPages}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserActivity;