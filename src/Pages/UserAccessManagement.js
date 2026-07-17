// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiSettings,
//   FiUser,
//   FiUsers
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { API_BASE_URL } from "../config";

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedDepartment, setSelectedDepartment] = useState("All");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Get unique departments
//   const departments = ["All", ...new Set(employees.map(e => e.department).filter(Boolean))];

//   // Filter employees based on Role, Department, AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const matchesDept = selectedDepartment === "All" ? true : e.department === selectedDepartment;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesDept && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     setPermissions((prev) =>
//       prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//     );
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   return (
//     <div className="flex justify-center min-h-screen p-4 font-sans text-gray-700 bg-white md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* 🟣 LEFT SIDEBAR - TEAMS/DEPARTMENTS */}
//       <div className="flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
//         <div className="p-6 border-b border-gray-50">
//           <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
//             <FiUsers className="text-blue-600" /> Departments
//           </h2>
//         </div>
//         <div className="flex-1 p-4 space-y-2 overflow-y-auto">
//           {departments.map((dept) => (
//             <button
//               key={dept}
//               onClick={() => setSelectedDepartment(dept)}
//               className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center ${selectedDepartment === dept
//                 ? "bg-blue-600 text-gray-900 shadow-lg shadow-blue-100"
//                 : "text-gray-500 hover:bg-white hover:text-gray-900"
//                 }`}
//             >
//               <span>{dept}</span>
//               {selectedDepartment !== dept && dept !== "All" && (
//                 <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-lg">
//                   {employees.filter(e => e.department === dept).length}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* 🔵 RIGHT CONTENT - EMPLOYEE GRID */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Sleek Sub-Header */}
//         <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
//           <div>
//             <h1 className="text-xl font-black leading-none text-gray-900">User Access</h1>
//             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Manage platform-wide permissions</p>
//           </div>

//           {/* Global Search Bar */}
//           <div className="relative w-full md:w-80" ref={globalSearchRef}>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Quick Search Employee (Name or ID)..."
//                 value={globalSearchTerm}
//                 onChange={(e) => {
//                   setGlobalSearchTerm(e.target.value);
//                   setIsGlobalSearchOpen(true);
//                 }}
//                 className="w-full py-2 pr-4 text-sm transition-all bg-white border border-gray-300 rounded-full pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//               />
//               <FiSearch className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2" />
//             </div>

//             {/* Global Search Results Dropdown */}
//             {isGlobalSearchOpen && globalSearchTerm && (
//               <div className="absolute right-0 z-30 w-full mt-2 overflow-y-auto duration-200 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 animate-in fade-in zoom-in-95">
//                 {filteredGlobalEmployees.length > 0 ? (
//                   filteredGlobalEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleGlobalSelectEmployee(emp)}
//                       className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                           <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
//                         </div>
//                         <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                           {emp.employeeId}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="px-4 py-3 text-sm text-center text-gray-500">
//                     No employees found.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6 md:p-8">

//           {/* --- TOP FILTERS (Role & Role-based Search) --- */}
//           <div className="flex flex-col gap-6 md:flex-row">

//             {/* 1. Role Selector */}
//             <div className="flex-1 space-y-1.5 relative" ref={roleDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Role</label>
//               <div
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                   {selectedRole ? (
//                     <span className="flex items-center gap-2">
//                       <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{selectedRole}</span>
//                       <span className="text-xs text-gray-500">({roleStats[selectedRole]} Users)</span>
//                     </span>
//                   ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   <div
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="text-sm font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 group"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{role}</span>
//                         <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector (Context Specific) */}
//             <div className="flex-[2] space-y-1.5 relative" ref={employeeDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if (!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole} (${roleStats[selectedRole] || 0} Users)...` : `Search Employee Name or ID (${employees.length} Users)...`}
//                   className="w-full p-3 pl-4 pr-10 text-sm font-medium transition-all border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">
//                   {loading ? <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" /> : <FiUser />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                             {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[10px] text-gray-500">•</span>
//                               <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({ ...item, type: group.type }))).map((item) => (
//                   <label
//                     key={item.id}
//                     className={`flex items-center gap-3 cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-white transition-colors ${item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                       }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${item.type === "immutable"
//                           ? "bg-blue-600 border-blue-500 text-gray-900"
//                           : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
//                         }`}>
//                         <FiCheck size={10} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200">
//                 <button
//                   onClick={savePermissions}
//                   className="px-8 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
//                 >
//                   Update
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedEmployee(null);
//                     setSearchTerm("");
//                   }}
//                   className="px-8 py-2.5 bg-[#a55eea] hover:bg-[#9a52d8] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* Empty State */
//             <div className="flex flex-col items-center justify-center py-12 text-gray-700 border border-gray-200 border-dashed bg-white/50 rounded-xl">
//               <FiFilter size={32} className="mb-3 text-blue-300 opacity-50" />
//               <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Select Role & Employee to Configure</p>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;



// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//     FiCheck,
//     FiChevronDown,
//     FiFilter,
//     FiSearch // Added
//     ,
//     FiSettings,
//     FiUser
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     setPermissions((prev) =>
//       prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//     );
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   return (
//     <div className="flex justify-center min-h-screen p-4 font-sans text-gray-700 bg-white md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm max-w-8xl rounded-xl">
//         {/* Header - Enhanced with Global Search */}
//         <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 md:flex-row bg-white/50">
//           <div className="flex items-center gap-2">
//             <FiSettings className="text-gray-500" />
//             <h1 className="text-lg font-bold text-gray-700">User Access Management</h1>
//           </div>

//           {/* Global Search Bar */}
//           <div className="relative w-full md:w-80" ref={globalSearchRef}>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Quick Search Employee (Name or ID)..."
//                 value={globalSearchTerm}
//                 onChange={(e) => {
//                   setGlobalSearchTerm(e.target.value);
//                   setIsGlobalSearchOpen(true);
//                 }}
//                 className="w-full py-2 pr-4 text-sm transition-all bg-white border border-gray-300 rounded-full pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//               />
//               <FiSearch className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2" />
//             </div>

//             {/* Global Search Results Dropdown */}
//             {isGlobalSearchOpen && globalSearchTerm && (
//               <div className="absolute right-0 z-30 w-full mt-2 overflow-y-auto duration-200 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 animate-in fade-in zoom-in-95">
//                 {filteredGlobalEmployees.length > 0 ? (
//                   filteredGlobalEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleGlobalSelectEmployee(emp)}
//                       className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                           <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
//                         </div>
//                         <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                           {emp.employeeId}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="px-4 py-3 text-sm text-center text-gray-500">
//                     No employees found.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6 md:p-8">

//           {/* --- TOP FILTERS (Role & Role-based Search) --- */}
//           <div className="flex flex-col gap-6 md:flex-row">

//             {/* 1. Role Selector */}
//             <div className="flex-1 space-y-1.5 relative" ref={roleDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Role</label>
//               <div 
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                    {selectedRole ? (
//                      <span className="flex items-center gap-2">
//                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{selectedRole}</span>
//                        <span className="text-xs text-gray-500">({roleStats[selectedRole]} Users)</span>
//                      </span>
//                    ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   <div 
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="text-sm font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div 
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 group"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{role}</span>
//                         <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector (Context Specific) */}
//             <div className="flex-[2] space-y-1.5 relative" ref={employeeDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if(!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole} (${roleStats[selectedRole] || 0} Users)...` : `Search Employee Name or ID (${employees.length} Users)...`}
//                   className="w-full p-3 pl-4 pr-10 text-sm font-medium transition-all border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">
//                    {loading ? <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"/> : <FiUser />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                              {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[10px] text-gray-500">•</span>
//                               <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({...item, type: group.type}))).map((item) => (
//                   <label 
//                     key={item.id} 
//                     className={`flex items-center gap-3 cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-white transition-colors ${
//                        item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
//                          item.type === "immutable"
//                            ? "bg-blue-600 border-blue-500 text-gray-900"
//                            : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
//                       }`}>
//                         <FiCheck size={10} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200">
//                  <button
//                     onClick={savePermissions}
//                     className="px-8 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
//                   >
//                     Update
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedEmployee(null);
//                       setSearchTerm("");
//                     }}
//                     className="px-8 py-2.5 bg-[#a55eea] hover:bg-[#9a52d8] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
//                   >
//                     Cancel
//                   </button>
//               </div>
//             </div>
//           ) : (
//              /* Empty State */
//              <div className="flex flex-col items-center justify-center py-12 text-gray-700 border border-gray-200 border-dashed bg-white/50 rounded-xl">
//                <FiFilter size={32} className="mb-3 text-blue-300 opacity-50"/>
//                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Select Role & Employee to Configure</p>
//              </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;



// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiSettings,
//   FiUser
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ NEW RECRUITMENT SECTION WITH MANAGE OPTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         // { id: "job_posts_view", name: "Job Posts" },
//         // { id: "job_applicants_view", name: "Job Applicants" },
//         // { id: "score_board_view", name: "Score Board" },
//         // { id: "assessments_view", name: "Assessments" },
//         // { id: "documents_view", name: "Documents" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];

//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     } 
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];

//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));

//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }

//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   return (
//     <div className="flex justify-center min-h-screen p-4 font-sans text-gray-700 bg-white md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm max-w-8xl rounded-xl">
//         {/* Header - Enhanced with Global Search */}
//         <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 md:flex-row bg-white/50">
//           <div className="flex items-center gap-2">
//             <FiSettings className="text-gray-500" />
//             <h1 className="text-lg font-bold text-gray-700">User Access Management</h1>
//           </div>

//           {/* Global Search Bar */}
//           <div className="relative w-full md:w-80" ref={globalSearchRef}>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Quick Search Employee (Name or ID)..."
//                 value={globalSearchTerm}
//                 onChange={(e) => {
//                   setGlobalSearchTerm(e.target.value);
//                   setIsGlobalSearchOpen(true);
//                 }}
//                 className="w-full py-2 pr-4 text-sm transition-all bg-white border border-gray-300 rounded-full pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//               />
//               <FiSearch className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2" />
//             </div>

//             {/* Global Search Results Dropdown */}
//             {isGlobalSearchOpen && globalSearchTerm && (
//               <div className="absolute right-0 z-30 w-full mt-2 overflow-y-auto duration-200 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 animate-in fade-in zoom-in-95">
//                 {filteredGlobalEmployees.length > 0 ? (
//                   filteredGlobalEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleGlobalSelectEmployee(emp)}
//                       className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                           <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
//                         </div>
//                         <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                           {emp.employeeId}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="px-4 py-3 text-sm text-center text-gray-500">
//                     No employees found.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="p-6 space-y-6 md:p-8">

//           {/* --- TOP FILTERS (Role & Role-based Search) --- */}
//           <div className="flex flex-col gap-6 md:flex-row">

//             {/* 1. Role Selector */}
//             <div className="flex-1 space-y-1.5 relative" ref={roleDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Role</label>
//               <div 
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                    {selectedRole ? (
//                      <span className="flex items-center gap-2">
//                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{selectedRole}</span>
//                        <span className="text-xs text-gray-500">({roleStats[selectedRole]} Users)</span>
//                      </span>
//                    ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   <div 
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="text-sm font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div 
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 group"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{role}</span>
//                         <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector (Context Specific) */}
//             <div className="flex-[2] space-y-1.5 relative" ref={employeeDropdownRef}>
//               <label className="block text-sm font-bold text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if(!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole} (${roleStats[selectedRole] || 0} Users)...` : `Search Employee Name or ID (${employees.length} Users)...`}
//                   className="w-full p-3 pl-4 pr-10 text-sm font-medium transition-all border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">
//                    {loading ? <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"/> : <FiUser />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                              {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[10px] text-gray-500">•</span>
//                               <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({...item, type: group.type}))).map((item) => (
//                   <label 
//                     key={item.id} 
//                     className={`flex items-center gap-3 cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-white transition-colors ${
//                        item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
//                          item.type === "immutable"
//                            ? "bg-blue-600 border-blue-500 text-gray-900"
//                            : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
//                       }`}>
//                         <FiCheck size={10} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200">
//                  <button
//                     onClick={savePermissions}
//                     className="px-8 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
//                   >
//                     Update
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedEmployee(null);
//                       setSearchTerm("");
//                     }}
//                     className="px-8 py-2.5 bg-[#a55eea] hover:bg-[#9a52d8] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
//                   >
//                     Cancel
//                   </button>
//               </div>
//             </div>
//           ) : (
//              /* Empty State */
//              <div className="flex flex-col items-center justify-center py-12 text-gray-700 border border-gray-200 border-dashed bg-white/50 rounded-xl">
//                <FiFilter size={32} className="mb-3 text-blue-300 opacity-50"/>
//                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Select Role & Employee to Configure</p>
//              </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;

// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiUser
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ NEW RECRUITMENT SECTION WITH MANAGE OPTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         // { id: "job_posts_view", name: "Job Posts" },
//         // { id: "job_applicants_view", name: "Job Applicants" },
//         // { id: "score_board_view", name: "Score Board" },
//         // { id: "assessments_view", name: "Assessments" },
//         // { id: "documents_view", name: "Documents" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];

//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     } 
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];

//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));

//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }

//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   return (
//     <div className="flex justify-center min-h-screen p-4 font-sans text-gray-700 bg-white md:p-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       <div className="w-full overflow-hidden bg-white border border-gray-200 shadow-sm max-w-8xl rounded-xl">
//         {/* Header */}
//         {/* <div className="px-6 py-4 border-b border-gray-200 bg-white/50">
//           <div className="flex items-center gap-2">
//             <FiSettings className="text-gray-500" />
//             <h1 className="text-lg font-bold text-gray-700">User Access Management</h1>
//           </div> */}
//         {/* </div> */}

//         <div className="p-6 space-y-6 md:p-8">

//           {/* --- ALL FILTERS IN ONE ROW --- */}
//           <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">

//             {/* Global Search - First */}
//             <div className="relative w-full md:w-80" ref={globalSearchRef}>
//               <label className="block text-gray-700 font-bold text-sm mb-1.5">Quick Search</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Name or ID..."
//                   value={globalSearchTerm}
//                   onChange={(e) => {
//                     setGlobalSearchTerm(e.target.value);
//                     setIsGlobalSearchOpen(true);
//                   }}
//                   className="w-full py-3 pr-4 text-sm transition-all bg-white border border-gray-200 rounded-lg pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
//                 />
//                 <FiSearch className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2" />
//               </div>

//               {/* Global Search Results Dropdown */}
//               {isGlobalSearchOpen && globalSearchTerm && (
//                 <div className="absolute right-0 z-30 w-full mt-2 overflow-y-auto duration-200 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 animate-in fade-in zoom-in-95">
//                   {filteredGlobalEmployees.length > 0 ? (
//                     filteredGlobalEmployees.map((emp) => (
//                       <div
//                         key={emp._id}
//                         onClick={() => handleGlobalSelectEmployee(emp)}
//                         className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                             <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5">{emp.role || "No Role"}</p>
//                           </div>
//                           <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                             {emp.employeeId}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="px-4 py-3 text-sm text-center text-gray-500">
//                       No employees found.
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 1. Role Selector - Second */}
//             <div className="relative flex-1" ref={roleDropdownRef}>
//               <label className="block text-gray-700 font-bold text-sm mb-1.5">Select Role</label>
//               <div 
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full p-3 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                    {selectedRole ? (
//                      <span className="flex items-center gap-2">
//                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{selectedRole}</span>
//                        <span className="text-xs text-gray-500">({roleStats[selectedRole]} Users)</span>
//                      </span>
//                    ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   <div 
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="text-sm font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div 
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 group"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{role}</span>
//                         <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector - Third */}
//             <div className="flex-[2] relative" ref={employeeDropdownRef}>
//               <label className="block text-gray-700 font-bold text-sm mb-1.5">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if(!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
//                   className="w-full p-3 pl-4 pr-10 text-sm font-medium transition-all border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">
//                    {loading ? <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"/> : <FiUser />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto duration-200 bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 animate-in fade-in zoom-in-95">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex justify-between items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-[10px] font-bold text-gray-900 bg-[#a55eea] px-2 py-0.5 rounded-full shadow-sm shadow-purple-100">
//                              {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[10px] text-gray-500">•</span>
//                               <span className="text-[10px] font-bold text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({...item, type: group.type}))).map((item) => (
//                   <label 
//                     key={item.id} 
//                     className={`flex items-center gap-3 cursor-pointer select-none group py-1.5 px-2 rounded-lg hover:bg-white transition-colors ${
//                        item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
//                          item.type === "immutable"
//                            ? "bg-blue-600 border-blue-500 text-gray-900"
//                            : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
//                       }`}>
//                         <FiCheck size={10} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200">
//                  <button
//                     onClick={savePermissions}
//                     className="px-8 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95"
//                   >
//                     Update
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedEmployee(null);
//                       setSearchTerm("");
//                     }}
//                     className="px-8 py-2.5 bg-[#a55eea] hover:bg-[#9a52d8] text-gray-900 font-bold text-lg rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
//                   >
//                     Cancel
//                   </button>
//               </div>
//             </div>
//           ) : (
//              /* Empty State */
//              <div className="flex flex-col items-center justify-center py-12 text-gray-700 border border-gray-200 border-dashed bg-white/50 rounded-xl">
//                <FiFilter size={32} className="mb-3 text-blue-300 opacity-50"/>
//                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Select Role & Employee to Configure</p>
//              </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;


// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiUser
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ NEW RECRUITMENT SECTION WITH MANAGE OPTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         // { id: "job_posts_view", name: "Job Posts" },
//         // { id: "job_applicants_view", name: "Job Applicants" },
//         // { id: "score_board_view", name: "Score Board" },
//         // { id: "assessments_view", name: "Assessments" },
//         // { id: "documents_view", name: "Documents" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);

//       // ✅ Auto-select first employee as default
//       if (response.data.length > 0) {
//         const firstEmployee = response.data[0];
//         setSelectedEmployee(firstEmployee);
//         setPermissions(firstEmployee.permissions || []);
//         setSearchTerm(firstEmployee.name);
//         setSelectedRole(firstEmployee.role || "");
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];

//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     } 
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];

//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));

//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }

//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   // Loading screen matching other components
//   if (loading && employees.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-500">
//             Loading user access...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="mx-auto max-w-9xl">

//         {/* Header with gradient - matching other components */}
//         {/* <div className="p-2 mb-3 bg-white border border-gray-200 shadow-md rounded-xl">
//           <div className="flex items-end justify-between">
//             <h1 className="text-xl font-bold text-gray-700">User Access Management</h1>
//           </div>
//         </div> */}

//         {/* Stats Overview - matching other components */}
//         <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
//           <div className="px-2 py-2 bg-white border-t-4 border-blue-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Total Employees: {employees.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-green-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Roles: {availableRoles.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-purple-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Admins: {employees.filter(e => e.role === 'admin' || e.role === 'Admin').length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-yellow-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Super Admins: {employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Card */}
//         <div className="p-3 bg-white border border-gray-200 shadow-md rounded-xl">

//           {/* --- ALL FILTERS IN ONE ROW --- */}
//           <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-end">

//             {/* Global Search - First */}
//             <div className="relative w-full md:w-72" ref={globalSearchRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Quick Search</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Name or ID..."
//                   value={globalSearchTerm}
//                   onChange={(e) => {
//                     setGlobalSearchTerm(e.target.value);
//                     setIsGlobalSearchOpen(true);
//                   }}
//                   className="w-full py-2 pl-8 pr-3 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
//               </div>

//               {/* Global Search Results Dropdown */}
//               {isGlobalSearchOpen && globalSearchTerm && (
//                 <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredGlobalEmployees.length > 0 ? (
//                     filteredGlobalEmployees.map((emp) => (
//                       <div
//                         key={emp._id}
//                         onClick={() => handleGlobalSelectEmployee(emp)}
//                         className="px-3 py-2 transition-colors border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                             <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
//                           </div>
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                             {emp.employeeId}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="px-3 py-2 text-xs text-center text-gray-500">
//                       No employees found.
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 1. Role Selector - Second */}
//             <div className="relative flex-1" ref={roleDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Role</label>
//               <div 
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                    {selectedRole ? (
//                      <span className="flex items-center gap-2">
//                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
//                        <span className="text-gray-500 text-[9px]">({roleStats[selectedRole]})</span>
//                      </span>
//                    ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div 
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs font-medium text-gray-700">{role}</span>
//                         <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector - Third */}
//             <div className="flex-[2] relative" ref={employeeDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if(!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
//                   className="w-full px-3 py-2 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
//                    {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"/> : <FiUser className="text-xs" />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex items-center justify-between px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                              {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[8px] text-gray-500">•</span>
//                               <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Selected Employee Info - Shows when employee is selected */}
//           {selectedEmployee && (
//             <div className="p-2 mb-4 border border-blue-200 rounded-md bg-blue-50">
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
//                   <span className="text-xs font-semibold text-blue-800">
//                     {selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700">{selectedEmployee.name}</p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-[9px] text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
//                     <span className="text-[9px] text-gray-500">{selectedEmployee.role || 'No Role'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({...item, type: group.type}))).map((item) => (
//                   <label 
//                     key={item.id} 
//                     className={`flex items-center gap-2 cursor-pointer select-none py-1 px-2 rounded hover:bg-white transition-colors ${
//                        item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center ${
//                          item.type === "immutable"
//                            ? "bg-blue-600 border-blue-500 text-gray-900"
//                            : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 hover:border-blue-400"
//                       }`}>
//                         <FiCheck size={8} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-[10px] font-medium text-gray-700">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200">
//                  <button
//                     onClick={savePermissions}
//                     className="px-4 py-1.5 text-xs font-medium text-gray-900 bg-blue-600 rounded-md hover:bg-blue-800 transition"
//                   >
//                     Update Access
//                   </button>
//                   <button
//                     onClick={() => {
//                       setSelectedEmployee(null);
//                       setSearchTerm("");
//                     }}
//                     className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
//                   >
//                     Cancel
//                   </button>
//               </div>
//             </div>
//           ) : (
//              /* Empty State */
//              <div className="flex flex-col items-center justify-center py-8 text-gray-500 border border-gray-300 border-dashed rounded-md bg-white">
//                <FiFilter size={24} className="mb-2 text-blue-500 opacity-50"/>
//                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Select Role & Employee to Configure</p>
//              </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;




// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiShield,
//   FiStar,
//   FiTag,
//   FiUser,
//   FiUsers
// } from "react-icons/fi";
// import CountUp from "react-countup";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api";

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ RECRUITMENT SECTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         { id: "job_posts_view", name: "Job Posts" },
//         { id: "job_applicants_view", name: "Job Applicants" },
//         { id: "score_board_view", name: "Score Board" },
//         { id: "assessments_view", name: "Assessments" },
//         { id: "documents_view", name: "Documents" },
//       ]
//     },
//     // ✅ EXPENSES SECTION
//     {
//       title: "Admin: Expenses",
//       type: "toggleable",
//       items: [
//         { id: "expenses_manage", name: "Manage Expenses" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();

//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(response.data);

//       // ✅ Auto-select first employee as default
//       if (response.data.length > 0) {
//         const firstEmployee = response.data[0];
//         setSelectedEmployee(firstEmployee);
//         setPermissions(firstEmployee.permissions || []);
//         setSearchTerm(firstEmployee.name);
//         setSelectedRole(firstEmployee.role || "");
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);

//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];

//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     }
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId)
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];

//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));

//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }

//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   // Loading screen matching other components
//   if (loading && employees.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-500">
//             Loading user access...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="mx-auto max-w-9xl">

//         {/* Stats Overview - matching Dashboard design */}
//         <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
//           {[
//             { icon: FiUsers, label: "Total Employees", value: employees.length, color: "border-blue-500" },
//             { icon: FiTag, label: "Roles", value: availableRoles.length, color: "border-green-500" },
//             { icon: FiShield, label: "Admins", value: employees.filter(e => e.role === 'admin' || e.role === 'Admin').length, color: "border-purple-500" },
//             { icon: FiStar, label: "Super Admins", value: employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length, color: "border-yellow-500" },
//           ].map(({ icon: Icon, label, value, color }) => (
//             <div key={label} className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
//               <div className="flex items-center gap-2">
//                 <Icon className="text-gray-500 text-base flex-shrink-0" />
//                 <div className="text-sm font-medium text-gray-700">{label}</div>
//               </div>
//               <div className="text-sm font-bold text-gray-700">
//                 <CountUp end={value} duration={2} separator="," />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Main Content Card */}
//         <div className="p-3 bg-white border border-gray-200 shadow-md rounded-xl">

//           {/* --- ALL FILTERS IN ONE ROW --- */}
//           <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-end">

//             {/* Global Search - First */}
//             <div className="relative w-full md:w-72" ref={globalSearchRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Quick Search</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Name or ID..."
//                   value={globalSearchTerm}
//                   onChange={(e) => {
//                     setGlobalSearchTerm(e.target.value);
//                     setIsGlobalSearchOpen(true);
//                   }}
//                   className="w-full py-2 pl-8 pr-3 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
//               </div>

//               {/* Global Search Results Dropdown */}
//               {isGlobalSearchOpen && globalSearchTerm && (
//                 <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredGlobalEmployees.length > 0 ? (
//                     filteredGlobalEmployees.map((emp) => (
//                       <div
//                         key={emp._id}
//                         onClick={() => handleGlobalSelectEmployee(emp)}
//                         className="px-3 py-2 transition-colors border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                             <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
//                           </div>
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                             {emp.employeeId}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="px-3 py-2 text-xs text-center text-gray-500">
//                       No employees found.
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 1. Role Selector - Second */}
//             <div className="relative flex-1" ref={roleDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Role</label>
//               <div
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                   {selectedRole ? (
//                     <span className="flex items-center gap-2">
//                       <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
//                       <span className="text-gray-500 text-[9px]">({roleStats[selectedRole]})</span>
//                     </span>
//                   ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs font-medium text-gray-700">{role}</span>
//                         <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector - Third */}
//             <div className="flex-[2] relative" ref={employeeDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if (!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
//                   className="w-full px-3 py-2 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
//                   {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" /> : <FiUser className="text-xs" />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex items-center justify-between px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                             {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[8px] text-gray-500">•</span>
//                               <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Selected Employee Info - Shows when employee is selected */}
//           {selectedEmployee && (
//             <div className="p-2 mb-4 border border-blue-200 rounded-md bg-blue-50">
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
//                   <span className="text-xs font-semibold text-blue-800">
//                     {selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700">{selectedEmployee.name}</p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-[9px] text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
//                     <span className="text-[9px] text-gray-500">{selectedEmployee.role || 'No Role'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* --- PERMISSIONS GRID --- */}
//           {selectedEmployee ? (
//             <div className="pt-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
//                 {permissionGroups.flatMap(group => group.items.map(item => ({ ...item, type: group.type }))).map((item) => (
//                   <label
//                     key={item.id}
//                     className={`flex items-center gap-2 cursor-pointer select-none py-1 px-2 rounded hover:bg-white transition-colors ${item.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                       }`}
//                   >
//                     <div className="relative flex items-center justify-center">
//                       <input
//                         type="checkbox"
//                         checked={item.type === "immutable" ? true : permissions.includes(item.id)}
//                         onChange={() => item.type === "toggleable" && handleTogglePermission(item.id)}
//                         disabled={item.type === "immutable"}
//                         className="sr-only peer"
//                       />
//                       <div className={`w-3.5 h-3.5 rounded border transition-all duration-200 flex items-center justify-center ${item.type === "immutable"
//                           ? "bg-blue-600 border-blue-500 text-gray-900"
//                           : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 hover:border-blue-400"
//                         }`}>
//                         <FiCheck size={8} className={item.type === "toggleable" && !permissions.includes(item.id) ? "hidden" : "block"} />
//                       </div>
//                     </div>
//                     <span className="text-[10px] font-medium text-gray-700">
//                       {item.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200">
//                 <button
//                   onClick={savePermissions}
//                   className="px-4 py-1.5 text-xs font-medium text-gray-900 bg-blue-600 rounded-md hover:bg-blue-800 transition"
//                 >
//                   Update Access
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedEmployee(null);
//                     setSearchTerm("");
//                   }}
//                   className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* Empty State */
//             <div className="flex flex-col items-center justify-center py-8 text-gray-500 border border-gray-300 border-dashed rounded-md bg-white">
//               <FiFilter size={24} className="mb-2 text-blue-500 opacity-50" />
//               <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Select Role & Employee to Configure</p>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;



// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiUser
// } from "react-icons/fi";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//         { id: "holidays_add", name: "Add New Holidays" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//         { id: "leave_approval_manager", name: "Leave Approval By Manager" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ RECRUITMENT SECTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         { id: "job_posts_view", name: "Job Posts" },
//         { id: "job_applicants_view", name: "Job Applicants" },
//         { id: "score_board_view", name: "Score Board" },
//         { id: "assessments_view", name: "Assessments" },
//         { id: "documents_view", name: "Documents" },
//       ]
//     },
//     // ✅ EXPENSES SECTION
//     {
//       title: "Admin: Expenses",
//       type: "toggleable",
//       items: [
//         { id: "expenses_manage", name: "Manage Expenses" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   useEffect(() => {
//     fetchEmployees();
    
//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const activeEmployees = response.data.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);
      
//       // ✅ DO NOT auto-select first employee as default so that the permission models show by default for the admin
//       // if (response.data.length > 0) {
//       //   const firstEmployee = response.data[0];
//       //   setSelectedEmployee(firstEmployee);
//       //   setPermissions(firstEmployee.permissions || []);
//       //   setSearchTerm(firstEmployee.name);
//       //   setSelectedRole(firstEmployee.role || "");
//       // }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);
    
//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];
      
//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     } 
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];
        
//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }
        
//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   // Loading screen matching other components
//   if (loading && employees.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-500">
//             Loading user access...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="mx-auto max-w-9xl">

//         {/* Stats Overview - matching other components */}
//         <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
//           <div className="px-2 py-2 bg-white border-t-4 border-blue-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Total Employees: {employees.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-green-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Roles: {availableRoles.length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-purple-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Admins: {employees.filter(e => e.role === 'admin' || e.role === 'Admin').length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="px-2 py-2 bg-white border-t-4 border-yellow-500 rounded-md shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-semibold leading-tight text-gray-700">
//                   Super Admins: {employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Card */}
//         <div className="p-3 bg-white border border-gray-200 shadow-md rounded-xl">
          
//           {/* --- ALL FILTERS IN ONE ROW --- */}
//           <div className="flex flex-col items-start gap-3 mb-4 md:flex-row md:items-end">
            
//             {/* Global Search - First */}
//             <div className="relative w-full md:w-72" ref={globalSearchRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Quick Search</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Name or ID..."
//                   value={globalSearchTerm}
//                   onChange={(e) => {
//                     setGlobalSearchTerm(e.target.value);
//                     setIsGlobalSearchOpen(true);
//                   }}
//                   className="w-full py-2 pl-8 pr-3 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
//               </div>

//               {/* Global Search Results Dropdown */}
//               {isGlobalSearchOpen && globalSearchTerm && (
//                 <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredGlobalEmployees.length > 0 ? (
//                     filteredGlobalEmployees.map((emp) => (
//                       <div
//                         key={emp._id}
//                         onClick={() => handleGlobalSelectEmployee(emp)}
//                         className="px-3 py-2 transition-colors border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                             <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
//                           </div>
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                             {emp.employeeId}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="px-3 py-2 text-xs text-center text-gray-500">
//                       No employees found.
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             {/* 1. Role Selector - Second */}
//             <div className="relative flex-1" ref={roleDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Role</label>
//               <div 
//                 onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                 className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-400"
//               >
//                 <span>
//                    {selectedRole ? (
//                      <span className="flex items-center gap-2">
//                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
//                        <span className="text-gray-500 text-[9px]">({roleStats[selectedRole]})</span>
//                      </span>
//                    ) : "All Roles"}
//                 </span>
//                 <FiChevronDown className={`text-gray-500 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//               </div>

//               {/* Role Dropdown */}
//               {isRoleDropdownOpen && (
//                 <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   <div 
//                     onClick={() => handleSelectRole("")}
//                     className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
//                   >
//                     <span className="font-medium text-gray-700">All Roles</span>
//                     {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
//                   </div>
//                   {availableRoles.map(role => (
//                     <div 
//                       key={role}
//                       onClick={() => handleSelectRole(role)}
//                       className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs font-medium text-gray-700">{role}</span>
//                         <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                       </div>
//                       {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* 2. Employee Selector - Third */}
//             <div className="flex-[2] relative" ref={employeeDropdownRef}>
//               <label className="block mb-1 text-xs font-medium text-gray-700">Select Employee</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setIsEmployeeDropdownOpen(true);
//                     if(!e.target.value) setSelectedEmployee(null);
//                   }}
//                   onClick={() => setIsEmployeeDropdownOpen(true)}
//                   placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
//                   className="w-full px-3 py-2 pr-8 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
//                    {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"/> : <FiUser className="text-xs" />}
//                 </div>
//               </div>

//               {/* Employee Dropdown */}
//               {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
//                   {filteredEmployees.map((emp) => (
//                     <div
//                       key={emp._id}
//                       onClick={() => handleSelectEmployee(emp)}
//                       className="flex items-center justify-between px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                     >
//                       <div>
//                         <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                              {emp.employeeId}
//                           </span>
//                           {!selectedRole && (
//                             <>
//                               <span className="text-[8px] text-gray-500">•</span>
//                               <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                       {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Selected Employee Info - Shows when employee is selected */}
//           {selectedEmployee && (
//             <div className="p-2 mb-4 border border-blue-200 rounded-md bg-blue-50">
//               <div className="flex items-center gap-2">
//                 <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
//                   <span className="text-xs font-semibold text-blue-800">
//                     {selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700">{selectedEmployee.name}</p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-[9px] text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
//                     <span className="text-[9px] text-gray-500">{selectedEmployee.role || 'No Role'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* --- PERMISSIONS GRID --- */}
//           <div className="pt-2 mt-4">
//             <h3 className="mb-4 text-sm font-extrabold text-gray-700 border-b border-gray-200 pb-3 flex items-center justify-between">
//               <span>{selectedEmployee ? `Permissions Profile: ${selectedEmployee.name}` : 'Platform Permission Models (Read-Only)'}</span>
//               {selectedEmployee && (
//                 <span className="text-[10px] font-bold text-gray-900 bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-0.5 rounded-full shadow-sm">
//                   {selectedEmployee.role || 'No Role Assigned'}
//                 </span>
//               )}
//             </h3>
            
//             {!selectedEmployee && (
//               <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
//                 <FiFilter className="text-blue-600" size={18} />
//                 <p className="text-xs text-blue-800 font-medium">Please select an employee or role above to modify these permission assignments. Showing available system modules below.</p>
//               </div>
//             )}

//             <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${!selectedEmployee ? 'opacity-60 pointer-events-none grayscale-[10%]' : ''}`}>
//               {permissionGroups.map((group, groupIndex) => (
//                 <div key={groupIndex} className="p-4 bg-white border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-2xl hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all duration-300">
//                   <h4 className="mb-4 text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 uppercase tracking-widest flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
//                     {group.title}
//                   </h4>
//                   <div className="space-y-3">
//                     {group.items.map(item => (
//                       <label 
//                         key={item.id} 
//                         className={`flex items-start gap-3 cursor-pointer select-none group p-2 -mx-2 rounded-xl hover:bg-purple-50/50 transition-all duration-300 ${
//                           group.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                         }`}
//                       >
//                         <div className="relative flex items-center justify-center mt-0.5">
//                           <input
//                             type="checkbox"
//                             checked={group.type === "immutable" ? true : permissions.includes(item.id)}
//                             onChange={() => group.type === "toggleable" && handleTogglePermission(item.id)}
//                             disabled={!selectedEmployee || group.type === "immutable"}
//                             className="sr-only peer"
//                           />
//                           <div className={`w-4 h-4 rounded-md border transition-all duration-300 flex items-center justify-center ${
//                              group.type === "immutable"
//                                ? "bg-gradient-to-br from-gray-400 to-gray-500 border-transparent text-gray-900 shadow-sm"
//                                : "border-gray-300 peer-checked:bg-gradient-to-br peer-checked:from-purple-500 peer-checked:to-indigo-600 peer-checked:border-transparent peer-checked:text-gray-900 group-hover:border-purple-400 group-hover:shadow-[0_0_0_4px_rgba(168,85,247,0.1)]"
//                           }`}>
//                             <FiCheck size={10} className={group.type === "toggleable" && !permissions.includes(item.id) ? "opacity-0 scale-50 transition-all duration-200" : "opacity-100 scale-100 transition-all duration-300"} />
//                           </div>
//                         </div>
//                         <span className="text-xs font-semibold text-gray-500 group-hover:text-purple-900 leading-tight transition-colors">
//                           {item.name}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setSelectedEmployee(null);
//                   setSearchTerm("");
//                 }}
//                 className="px-6 py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:border-gray-300 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
//               >
//                 Clear Selection
//               </button>
//               <button
//                 onClick={savePermissions}
//                 disabled={!selectedEmployee}
//                 className={`px-8 py-2.5 text-xs font-bold text-gray-900 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
//                   selectedEmployee 
//                     ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-200 hover:shadow-emerald-300' 
//                     : 'bg-gray-300 shadow-none cursor-not-allowed opacity-50'
//                 }`}
//               >
//                 <FiCheck size={14} />
//                 Save Assignments
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserAccessManagement;



// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiFilter,
//   FiSearch,
//   FiUser,
//   FiShield,
//   FiUsers,
//   FiCalendar,
//   FiChevronUp,
//   FiSettings,
//   FiTrash2
// } from "react-icons/fi";
// import { 
//   FaChevronUp as FaChevronUpIcon, 
//   FaChevronDown as FaChevronDownIcon,
//   FaTimes 
// } from "react-icons/fa";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { isEmployeeHidden } from "../utils/employeeStatus";
// import "../index.css";
// import "./EmployeeDashboard.css";

// // Use relative path for proxy to handle it, or environment variable
// const API_BASE_URL = "https://api.timelyhealth.in/api"; 

// const UserAccessManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // Selection State
//   const [selectedRole, setSelectedRole] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [permissions, setPermissions] = useState([]);

//   // UI State - Main Filter
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
//   const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

//   // UI State - Global Search
//   const [globalSearchTerm, setGlobalSearchTerm] = useState("");
//   const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

//   // UI State - Mobile Filters
//   const [showMobileFilters, setShowMobileFilters] = useState(false); // <-- ADDED

//   const roleDropdownRef = useRef(null);
//   const employeeDropdownRef = useRef(null);
//   const globalSearchRef = useRef(null);

//   // --- Permission Configuration ---
//   const permissionGroups = [
//     {
//       title: "Standard Employee Features",
//       type: "immutable",
//       items: [
//         { id: "std_dashboard", name: "Employee Dashboard" },
//         { id: "std_leave", name: "My Leaves & Application" },
//         { id: "std_attendance", name: "My Attendance" },
//         { id: "std_shift", name: "My Shift & Location" },
//         { id: "std_salary", name: "My Salary Support" },
//         { id: "std_profile", name: "My Profile" },
//       ]
//     },
//     {
//       title: "Admin: Dashboard & Monitoring",
//       type: "toggleable",
//       items: [
//         { id: "dashboard_view", name: "Admin Dashboard" },
//         { id: "user_activity_view", name: "User Activity Logs" },
//       ]
//     },
//     {
//       title: "Admin: Employee Management",
//       type: "toggleable",
//       items: [
//         { id: "employee_view_all", name: "View All Employees" },
//         { id: "employee_add", name: "Add New Employee" },
//         { id: "holidays_add", name: "Add New Holidays" },
//       ]
//     },
//     {
//       title: "Admin: Operations",
//       type: "toggleable",
//       items: [
//         { id: "attendance_view_all", name: "Manage Attendance" },
//         { id: "leave_approve", name: "Leave Approval" },
//         { id: "shifts_manage", name: "Shift Management" },
//         { id: "locations_manage", name: "Location Management" },
//         { id: "leave_approval_manager", name: "Leave Approval By Manager" },
//       ]
//     },
//     {
//       title: "Admin: Financials & Reports",
//       type: "toggleable",
//       items: [
//         { id: "payroll_manage", name: "Payroll Management" },
//         { id: "reports_view", name: "View Reports" },
//       ]
//     },
//     // ✅ RECRUITMENT SECTION
//     {
//       title: "Admin: Recruitment",
//       type: "toggleable",
//       items: [
//         { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
//         { id: "job_posts_view", name: "Job Posts" },
//         { id: "job_applicants_view", name: "Job Applicants" },
//         { id: "score_board_view", name: "Score Board" },
//         { id: "assessments_view", name: "Assessments" },
//         { id: "documents_view", name: "Documents" },
//       ]
//     },
//     // ✅ EXPENSES SECTION
//     {
//       title: "Admin: Expenses",
//       type: "toggleable",
//       items: [
//         { id: "expenses_manage", name: "Manage Expenses" },
//       ]
//     },
//     // ✅ EVENTS SECTION - NEWLY ADDED
//     {
//       title: "Admin: Events Management",
//       type: "toggleable",
//       items: [
//         { id: "events_manage", name: "Manage Events" },
//         { id: "events_create", name: "Create Events" },
//         { id: "events_edit", name: "Edit Events" },
//         { id: "events_delete", name: "Delete Events" },
//         { id: "events_view_all", name: "View All Events" },
//         { id: "events_register_participants", name: "Register Participants" },
//       ]
//     },
//     {
//       title: "Super Admin: System Control",
//       type: "toggleable",
//       items: [
//         { id: "user_access_manage", name: "Manage User Access" },
//       ]
//     }
//   ];

//   // --- Clear Filters Function ---
//   const clearFilters = () => { // <-- ADDED
//     setGlobalSearchTerm('');
//     setSelectedRole('');
//     setSearchTerm('');
//     setSelectedEmployee(null);
//     setPermissions([]);
//   };

//   useEffect(() => {
//     fetchEmployees();
    
//     // Click outside handler
//     const handleClickOutside = (event) => {
//       // Role Dropdown
//       if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
//         setIsRoleDropdownOpen(false);
//       }
//       // Employee Dropdown
//       if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
//         setIsEmployeeDropdownOpen(false);
//       }
//       // Global Search Dropdown
//       if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
//         setIsGlobalSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       const activeEmployees = response.data.filter(emp => !isEmployeeHidden(emp));
//       setEmployees(activeEmployees);
//     } catch (error) {
//       console.error("Fetch error:", error);
//       toast.error("Failed to load employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Derived Data ---
//   // Get unique roles with counts
//   const roleStats = employees.reduce((acc, emp) => {
//     const role = emp.role || "No Role";
//     acc[role] = (acc[role] || 0) + 1;
//     return acc;
//   }, {});
//   const availableRoles = Object.keys(roleStats).sort();

//   // Filter employees based on Role AND Search Term (Main Filter)
//   const filteredEmployees = employees.filter((e) => {
//     const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term);
    
//     return matchesRole && matchesSearch;
//   });

//   // Global Search Filter (Any Role)
//   const filteredGlobalEmployees = employees.filter((e) => {
//     if (!globalSearchTerm) return false;
//     const term = globalSearchTerm.toLowerCase();
//     return (
//       e.name?.toLowerCase().includes(term) ||
//       e.employeeId?.toLowerCase().includes(term)
//     );
//   });

//   // --- Handlers ---
//   const handleSelectRole = (role) => {
//     setSelectedRole(role);
//     setIsRoleDropdownOpen(false);
//     setSelectedEmployee(null); // Reset employee when role changes
//     setSearchTerm("");
//   };

//   const handleSelectEmployee = (emp) => {
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name);
//     setIsEmployeeDropdownOpen(false);
//   };

//   const handleGlobalSelectEmployee = (emp) => {
//     setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
//     setSelectedEmployee(emp);
//     setPermissions(emp.permissions || []);
//     setSearchTerm(emp.name); // Sync main search
//     setIsGlobalSearchOpen(false);
//     setGlobalSearchTerm(""); // Clear global search
//   };

//   const handleTogglePermission = (permId) => {
//     // Special handling for "Manage Job Recruitment"
//     if (permId === "job_recruitment_manage") {
//       const recruitmentPermissions = [
//         "job_recruitment_manage",
//         "job_posts_view",
//         "job_applicants_view",
//         "score_board_view",
//         "assessments_view",
//         "documents_view"
//       ];
      
//       // If "Manage Job Recruitment" is being checked
//       if (!permissions.includes("job_recruitment_manage")) {
//         // Add all recruitment permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           recruitmentPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
//         setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
//       }
//     } 
//     // Special handling for individual recruitment permissions
//     else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];
        
//         // Check if all individual recruitment permissions are checked
//         const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
//           return [...newPermissions, "job_recruitment_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
//           return newPermissions.filter(p => p !== "job_recruitment_manage");
//         }
        
//         return newPermissions;
//       });
//     }
//     // Special handling for Events Management
//     else if (permId === "events_manage") {
//       const eventsPermissions = [
//         "events_manage",
//         "events_create",
//         "events_edit",
//         "events_delete",
//         "events_view_all",
//         "events_register_participants"
//       ];
      
//       // If "Manage Events" is being checked
//       if (!permissions.includes("events_manage")) {
//         // Add all events permissions
//         setPermissions(prev => {
//           const newPermissions = [...prev];
//           eventsPermissions.forEach(p => {
//             if (!newPermissions.includes(p)) {
//               newPermissions.push(p);
//             }
//           });
//           return newPermissions;
//         });
//       } else {
//         // If "Manage Events" is being unchecked, remove all events permissions
//         setPermissions(prev => prev.filter(p => !eventsPermissions.includes(p)));
//       }
//     }
//     // Special handling for individual events permissions
//     else if (["events_create", "events_edit", "events_delete", "events_view_all", "events_register_participants"].includes(permId)) {
//       setPermissions(prev => {
//         const newPermissions = prev.includes(permId) 
//           ? prev.filter(p => p !== permId)
//           : [...prev, permId];
        
//         // Check if all individual events permissions are checked
//         const individualPerms = ["events_create", "events_edit", "events_delete", "events_view_all", "events_register_participants"];
//         const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
//         // If all are checked, add manage permission
//         if (allChecked && !newPermissions.includes("events_manage")) {
//           return [...newPermissions, "events_manage"];
//         }
//         // If any is unchecked, remove manage permission
//         else if (!allChecked && newPermissions.includes("events_manage")) {
//           return newPermissions.filter(p => p !== "events_manage");
//         }
        
//         return newPermissions;
//       });
//     }
//     else {
//       // Normal toggle for other permissions
//       setPermissions((prev) =>
//         prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
//       );
//     }
//   };

//   const savePermissions = async () => {
//     if (!selectedEmployee) return;

//     try {
//       const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

//       if (response.status === 200) {
//         toast.success(`Access updated for ${selectedEmployee.name}`);
//         setEmployees((prev) =>
//           prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
//         );
//       } else {
//         toast.error("Failed to update access");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error("Error updating permissions");
//     }
//   };

//   // Loading screen matching other components
//   if (loading && employees.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
//           <p className="font-semibold text-gray-500">
//             Loading user access...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="emp-dash">
//       <main className="p-2 sm:p-4 lg:p-6">
//         <ToastContainer position="top-right" autoClose={3000} />

//         {/* Dashboard Header */}
//         <div className="emp-dash__header">
//           <div className="flex items-center gap-3 flex-wrap">
//             <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
//               User <span>Access Management</span>
//             </h1>
//             <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
//               Configure platform-wide permissions and access controls
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
//         {!loading && (
//           <div className="emp-dash__stats">
//             <div className="emp-dash__stat">
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Total Employees</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
//                   <FiUsers className="text-blue-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">
//                 {employees.length}
//               </div>
//               <div className="emp-dash__stat-meta">registered users</div>
//             </div>

//             <div className="emp-dash__stat">
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Roles</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
//                   <FiSettings className="text-green-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">
//                 {availableRoles.length}
//               </div>
//               <div className="emp-dash__stat-meta">unique roles</div>
//             </div>

//             <div className="emp-dash__stat">
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Admins</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
//                   <FiShield className="text-amber-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">
//                 {employees.filter(e => e.role === 'admin' || e.role === 'Admin').length}
//               </div>
//               <div className="emp-dash__stat-meta">admin accounts</div>
//             </div>

//             <div className="emp-dash__stat">
//               <div className="emp-dash__stat-top">
//                 <span className="emp-dash__stat-label">Super Admins</span>
//                 <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
//                   <FiShield className="text-rose-500" />
//                 </div>
//               </div>
//               <div className="emp-dash__stat-value">
//                 {employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length}
//               </div>
//               <div className="emp-dash__stat-meta">super admin accounts</div>
//             </div>
//           </div>
//         )}

//         {/* Filter Card */}
//         <div className="emp-dash__card">
//           {/* Mobile Filter Toggle Button */}
//           <div className="sm:hidden flex items-center justify-between p-3 border-b border-gray-100">
//             <button
//               onClick={() => setShowMobileFilters(!showMobileFilters)}
//               className="flex items-center gap-2 text-sm font-semibold text-gray-700"
//             >
//               <FiFilter className="text-blue-600" />
//               Filters
//               {showMobileFilters ? <FaChevronUpIcon className="ml-1" /> : <FaChevronDownIcon className="ml-1" />}
//             </button>
//             <span className="text-xs text-gray-400">
//               {filteredEmployees.length} employees
//             </span>
//           </div>

//           {/* Filter Content - Toggle on Mobile */}
//           <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
//             <div className="emp-dash__card-body p-4 bg-gray-50/50">
//               <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
                
//                 {/* Global Search - First */}
//                 <div className="relative w-full md:w-72" ref={globalSearchRef}>
//                   <label className="block mb-1 text-xs font-medium text-gray-600">Search Employee</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <FiSearch className="text-xs" />
//                     </span>
//                     <input
//                       type="text"
//                       placeholder="Quick search name or ID..."
//                       value={globalSearchTerm}
//                       onChange={(e) => {
//                         setGlobalSearchTerm(e.target.value);
//                         setIsGlobalSearchOpen(true);
//                       }}
//                       className="w-full h-9 pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                     />
//                   </div>

//                   {/* Global Search Results Dropdown */}
//                   {isGlobalSearchOpen && globalSearchTerm && (
//                     <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
//                       {filteredGlobalEmployees.length > 0 ? (
//                         filteredGlobalEmployees.map((emp) => (
//                           <div
//                             key={emp._id}
//                             onClick={() => handleGlobalSelectEmployee(emp)}
//                             className="px-3 py-2 transition-colors border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                           >
//                             <div className="flex items-start justify-between">
//                               <div>
//                                 <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                                 <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
//                               </div>
//                               <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                                 {emp.employeeId}
//                               </span>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-3 py-2 text-xs text-center text-gray-500">
//                           No employees found.
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
                
//                 {/* 1. Role Selector - Second */}
//                 <div className="relative w-full md:w-48" ref={roleDropdownRef}>
//                   <label className="block mb-1 text-xs font-medium text-gray-600">Role</label>
//                   <div 
//                     onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
//                     className="flex items-center justify-between w-full h-9 px-3 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400"
//                   >
//                     <span>
//                        {selectedRole ? (
//                          <span className="flex items-center gap-2">
//                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
//                            <span className="text-gray-500 text-[9px]">({roleStats[selectedRole]})</span>
//                          </span>
//                        ) : "All Roles"}
//                     </span>
//                     <FiChevronDown className={`text-gray-500 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
//                   </div>

//                   {/* Role Dropdown */}
//                   {isRoleDropdownOpen && (
//                     <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
//                       <div 
//                         onClick={() => handleSelectRole("")}
//                         className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
//                       >
//                         <span className="font-medium text-gray-700">All Roles</span>
//                         {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
//                       </div>
//                       {availableRoles.map(role => (
//                         <div 
//                           key={role}
//                           onClick={() => handleSelectRole(role)}
//                           className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
//                         >
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium text-gray-700">{role}</span>
//                             <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
//                           </div>
//                           {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* 2. Employee Selector - Third */}
//                 <div className="flex-[2] relative w-full" ref={employeeDropdownRef}>
//                   <label className="block mb-1 text-xs font-medium text-gray-600">Employee</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//                       <FiUser className="text-xs" />
//                     </span>
//                     <input
//                       type="text"
//                       value={searchTerm}
//                       onChange={(e) => {
//                         setSearchTerm(e.target.value);
//                         setIsEmployeeDropdownOpen(true);
//                         if(!e.target.value) setSelectedEmployee(null);
//                       }}
//                       onClick={() => setIsEmployeeDropdownOpen(true)}
//                       placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
//                       className="w-full h-9 pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                     />
//                     <div className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
//                        {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"/> : null}
//                     </div>
//                   </div>

//                   {/* Employee Dropdown */}
//                   {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
//                     <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
//                       {filteredEmployees.map((emp) => (
//                         <div
//                           key={emp._id}
//                           onClick={() => handleSelectEmployee(emp)}
//                           className="flex items-center justify-between px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
//                         >
//                           <div>
//                             <p className="text-xs font-medium text-gray-700">{emp.name}</p>
//                             <div className="flex items-center gap-2 mt-0.5">
//                               <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
//                                  {emp.employeeId}
//                               </span>
//                               {!selectedRole && (
//                                 <>
//                                   <span className="text-[8px] text-gray-500">•</span>
//                                   <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                           {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Filter Actions */}
//               <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-200/50">
//                 <div className="text-xs text-gray-500 font-medium">
//                   Showing <strong>{filteredEmployees.length}</strong> employees
//                 </div>
//                 <div className="flex gap-2 flex-wrap">
//                   {(globalSearchTerm || selectedRole || searchTerm || selectedEmployee) && (
//                     <button
//                       onClick={clearFilters}
//                       className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
//                     >
//                       <FiTrash2 className="w-3.5 h-3.5" /> Clear All Filters
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Active Filters */}
//               {(globalSearchTerm || selectedRole || searchTerm || selectedEmployee) && (
//                 <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
//                   <span className="text-[10px] text-gray-500 font-medium">Active Filters:</span>
//                   {globalSearchTerm && (
//                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] font-semibold border border-gray-200">
//                       Search: {globalSearchTerm}
//                       <button onClick={() => setGlobalSearchTerm('')} className="hover:text-gray-900 ml-0.5">
//                         <FaTimes size={8} />
//                       </button>
//                     </span>
//                   )}
//                   {selectedRole && (
//                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-semibold border border-blue-200">
//                       Role: {selectedRole}
//                       <button onClick={() => handleSelectRole('')} className="hover:text-blue-900 ml-0.5">
//                         <FaTimes size={8} />
//                       </button>
//                     </span>
//                   )}
//                   {selectedEmployee && (
//                     <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-semibold border border-purple-200">
//                       Employee: {selectedEmployee.name}
//                       <button onClick={() => handleSelectEmployee(null)} className="hover:text-purple-900 ml-0.5">
//                         <FaTimes size={8} />
//                       </button>
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Permissions Card */}
//         <div className="emp-dash__card">
//           <div className="emp-dash__card-header">
//             {selectedEmployee && (
//               <span className="text-[10px] font-bold text-gray-900 bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-0.5 rounded-full shadow-sm">
//                 {selectedEmployee.role || 'No Role Assigned'}
//               </span>
//             )}
//           </div>
//           <div className="emp-dash__card-body bg-gray-50/50">
//             {/* Selected Employee Info - Shows when employee is selected */}
//             {selectedEmployee && (
//               <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50 flex items-center gap-3">
//                 <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
//                   <span className="text-sm font-semibold text-blue-800">
//                     {selectedEmployee.name?.charAt(0) || 'E'}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-700">{selectedEmployee.name}</p>
//                   <div className="flex items-center gap-2 mt-0.5">
//                     <span className="text-[10px] font-medium text-gray-900 bg-purple-600 px-2 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
//                     <span className="text-[10px] text-gray-500">{selectedEmployee.role || 'No Role'}</span>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {!selectedEmployee && (
//               <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
//                 <FiFilter className="text-blue-600" size={18} />
//                 <p className="text-xs text-blue-800 font-medium">Please select an employee or role above to modify these permission assignments. Showing available system modules below.</p>
//               </div>
//             )}

//             <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${!selectedEmployee ? 'opacity-60 pointer-events-none grayscale-[10%]' : ''}`}>
//               {permissionGroups.map((group, groupIndex) => (
//                 <motion.div
//                   key={groupIndex}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
//                   className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300"
//                 >
//                   <h4 className="mb-3 text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
//                     {group.title}
//                   </h4>
//                   <div className="space-y-2">
//                     {group.items.map(item => (
//                       <label 
//                         key={item.id} 
//                         className={`flex items-start gap-3 cursor-pointer select-none group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-all duration-300 ${
//                           group.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
//                         }`}
//                       >
//                         <div className="relative flex items-center justify-center mt-0.5">
//                           <input
//                             type="checkbox"
//                             checked={group.type === "immutable" ? true : permissions.includes(item.id)}
//                             onChange={() => group.type === "toggleable" && handleTogglePermission(item.id)}
//                             disabled={!selectedEmployee || group.type === "immutable"}
//                             className="sr-only peer"
//                           />
//                           <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${
//                              group.type === "immutable"
//                                ? "bg-gray-400 border-gray-400 text-gray-900"
//                                : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
//                           }`}>
//                             <FiCheck size={10} className={group.type === "toggleable" && !permissions.includes(item.id) ? "opacity-0 scale-50 transition-all duration-200" : "opacity-100 scale-100 transition-all duration-300"} />
//                           </div>
//                         </div>
//                         <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 leading-tight transition-colors">
//                           {item.name}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setSelectedEmployee(null);
//                   setSearchTerm("");
//                 }}
//                 className="emp-dash__btn-outline"
//               >
//                 Clear Selection
//               </button>
//               <button
//                 onClick={savePermissions}
//                 disabled={!selectedEmployee}
//                 className={`emp-dash__btn-primary ${!selectedEmployee ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 <FiCheck size={14} className="mr-1" />
//                 Save Assignments
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default UserAccessManagement;


import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiUser,
  FiShield,
  FiUsers,
  FiCalendar,
  FiChevronUp,
  FiSettings,
  FiTrash2
} from "react-icons/fi";
import { 
  FaChevronUp as FaChevronUpIcon, 
  FaChevronDown as FaChevronDownIcon,
  FaTimes 
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "../index.css";
import "./EmployeeDashboard.css";

// Use relative path for proxy to handle it, or environment variable
const API_BASE_URL = "https://api.timelyhealth.in/api"; 

const UserAccessManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // UI State - Main Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  // UI State - Global Search
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // UI State - Mobile Filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const roleDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const globalSearchRef = useRef(null);

  // --- Permission Configuration ---
  const permissionGroups = [
    {
      title: "Standard Employee Features",
      type: "immutable",
      items: [
        { id: "std_dashboard", name: "Employee Dashboard" },
        { id: "std_leave", name: "My Leaves & Application" },
        { id: "std_attendance", name: "My Attendance" },
        { id: "std_shift", name: "My Shift & Location" },
        { id: "std_salary", name: "My Salary Support" },
        { id: "std_profile", name: "My Profile" },
      ]
    },
    {
      title: "Admin: Dashboard & Monitoring",
      type: "toggleable",
      items: [
        { id: "dashboard_view", name: "Admin Dashboard" },
        { id: "user_activity_view", name: "User Activity Logs" },
      ]
    },
    {
      title: "Admin: Employee Management",
      type: "toggleable",
      items: [
        { id: "employee_view_all", name: "View All Employees" },
        { id: "employee_add", name: "Add New Employee" },
        { id: "holidays_add", name: "Add New Holidays" },
      ]
    },
    {
      title: "Admin: Operations",
      type: "toggleable",
      items: [
        { id: "attendance_view_all", name: "Manage Attendance" },
        { id: "leave_approve", name: "Leave Approval" },
        { id: "shifts_manage", name: "Shift Management" },
        { id: "locations_manage", name: "Location Management" },
        { id: "leave_approval_manager", name: "Leave Approval By Manager" },
      ]
    },
    {
      title: "Admin: Financials & Reports",
      type: "toggleable",
      items: [
        { id: "payroll_manage", name: "Payroll Management" },
        { id: "reports_view", name: "View Reports" },
      ]
    },
    // RECRUITMENT SECTION
    {
      title: "Admin: Recruitment",
      type: "toggleable",
      items: [
        { id: "job_recruitment_manage", name: "Manage Job Recruitment" },
        { id: "job_posts_view", name: "Job Posts" },
        { id: "job_applicants_view", name: "Job Applicants" },
        { id: "score_board_view", name: "Score Board" },
        { id: "assessments_view", name: "Assessments" },
        { id: "documents_view", name: "Documents" },
      ]
    },
    // EXPENSES SECTION
    {
      title: "Admin: Expenses",
      type: "toggleable",
      items: [
        { id: "expenses_manage", name: "Manage Expenses" },
      ]
    },
    // EVENTS SECTION
    {
      title: "Admin: Events Management",
      type: "toggleable",
      items: [
        { id: "events_manage", name: "Manage Events" },
        { id: "events_create", name: "Create Events" },
        { id: "events_edit", name: "Edit Events" },
        { id: "events_delete", name: "Delete Events" },
        { id: "events_view_all", name: "View All Events" },
        { id: "events_register_participants", name: "Register Participants" },
      ]
    },
    // ✅ EMPLOYEE ISSUES SECTION - NEWLY ADDED
    {
      title: "Admin: Employee Issues Management",
      type: "toggleable",
      items: [
        { id: "employee_issues_view", name: "View Employee Issues" },
        { id: "employee_issues_manage", name: "Manage Employee Issues" },
        { id: "employee_issues_resolve", name: "Resolve Issues" },
        { id: "employee_issues_assign", name: "Assign Issues" },
        { id: "employee_issues_delete", name: "Delete Issues" },
        { id: "employee_issues_reply", name: "Reply to Issues" },
      ]
    },
    // ✅ ADMIN ISSUE MANAGEMENT SECTION
    {
      title: "Admin: Issue Management System",
      type: "toggleable",
      items: [
        { id: "admin_issue_view", name: "View All Issues" },
        { id: "admin_issue_manage", name: "Manage Issues" },
        { id: "admin_issue_resolve", name: "Resolve Admin Issues" },
        { id: "admin_issue_assign", name: "Assign Admin Issues" },
        { id: "admin_issue_delete", name: "Delete Admin Issues" },
        { id: "admin_issue_priority", name: "Set Issue Priority" },
        { id: "admin_issue_status", name: "Update Issue Status" },
      ]
    },
    {
      title: "Super Admin: System Control",
      type: "toggleable",
      items: [
        { id: "user_access_manage", name: "Manage User Access" },
      ]
    }
  ];

  // --- Clear Filters Function ---
  const clearFilters = () => {
    setGlobalSearchTerm('');
    setSelectedRole('');
    setSearchTerm('');
    setSelectedEmployee(null);
    setPermissions([]);
  };

  useEffect(() => {
    fetchEmployees();
    
    // Click outside handler
    const handleClickOutside = (event) => {
      // Role Dropdown
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      // Employee Dropdown
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
      // Global Search Dropdown
      if (globalSearchRef.current && !globalSearchRef.current.contains(event.target)) {
        setIsGlobalSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      const activeEmployees = response.data.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Data ---
  // Get unique roles with counts
  const roleStats = employees.reduce((acc, emp) => {
    const role = emp.role || "No Role";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const availableRoles = Object.keys(roleStats).sort();

  // Filter employees based on Role AND Search Term (Main Filter)
  const filteredEmployees = employees.filter((e) => {
    const matchesRole = selectedRole ? (e.role || "No Role") === selectedRole : true;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term);
    
    return matchesRole && matchesSearch;
  });

  // Global Search Filter (Any Role)
  const filteredGlobalEmployees = employees.filter((e) => {
    if (!globalSearchTerm) return false;
    const term = globalSearchTerm.toLowerCase();
    return (
      e.name?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term)
    );
  });

  // --- Handlers ---
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsRoleDropdownOpen(false);
    setSelectedEmployee(null); // Reset employee when role changes
    setSearchTerm("");
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name);
    setIsEmployeeDropdownOpen(false);
  };

  const handleGlobalSelectEmployee = (emp) => {
    setSelectedRole(emp.role || ""); // Auto-switch context to employee's role
    setSelectedEmployee(emp);
    setPermissions(emp.permissions || []);
    setSearchTerm(emp.name); // Sync main search
    setIsGlobalSearchOpen(false);
    setGlobalSearchTerm(""); // Clear global search
  };

  const handleTogglePermission = (permId) => {
    // Special handling for "Manage Job Recruitment"
    if (permId === "job_recruitment_manage") {
      const recruitmentPermissions = [
        "job_recruitment_manage",
        "job_posts_view",
        "job_applicants_view",
        "score_board_view",
        "assessments_view",
        "documents_view"
      ];
      
      // If "Manage Job Recruitment" is being checked
      if (!permissions.includes("job_recruitment_manage")) {
        // Add all recruitment permissions
        setPermissions(prev => {
          const newPermissions = [...prev];
          recruitmentPermissions.forEach(p => {
            if (!newPermissions.includes(p)) {
              newPermissions.push(p);
            }
          });
          return newPermissions;
        });
      } else {
        // If "Manage Job Recruitment" is being unchecked, remove all recruitment permissions
        setPermissions(prev => prev.filter(p => !recruitmentPermissions.includes(p)));
      }
    } 
    // Special handling for individual recruitment permissions
    else if (["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"].includes(permId)) {
      setPermissions(prev => {
        const newPermissions = prev.includes(permId) 
          ? prev.filter(p => p !== permId)
          : [...prev, permId];
        
        // Check if all individual recruitment permissions are checked
        const individualPerms = ["job_posts_view", "job_applicants_view", "score_board_view", "assessments_view", "documents_view"];
        const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
        // If all are checked, add manage permission
        if (allChecked && !newPermissions.includes("job_recruitment_manage")) {
          return [...newPermissions, "job_recruitment_manage"];
        }
        // If any is unchecked, remove manage permission
        else if (!allChecked && newPermissions.includes("job_recruitment_manage")) {
          return newPermissions.filter(p => p !== "job_recruitment_manage");
        }
        
        return newPermissions;
      });
    }
    // Special handling for Events Management
    else if (permId === "events_manage") {
      const eventsPermissions = [
        "events_manage",
        "events_create",
        "events_edit",
        "events_delete",
        "events_view_all",
        "events_register_participants"
      ];
      
      // If "Manage Events" is being checked
      if (!permissions.includes("events_manage")) {
        // Add all events permissions
        setPermissions(prev => {
          const newPermissions = [...prev];
          eventsPermissions.forEach(p => {
            if (!newPermissions.includes(p)) {
              newPermissions.push(p);
            }
          });
          return newPermissions;
        });
      } else {
        // If "Manage Events" is being unchecked, remove all events permissions
        setPermissions(prev => prev.filter(p => !eventsPermissions.includes(p)));
      }
    }
    // Special handling for individual events permissions
    else if (["events_create", "events_edit", "events_delete", "events_view_all", "events_register_participants"].includes(permId)) {
      setPermissions(prev => {
        const newPermissions = prev.includes(permId) 
          ? prev.filter(p => p !== permId)
          : [...prev, permId];
        
        // Check if all individual events permissions are checked
        const individualPerms = ["events_create", "events_edit", "events_delete", "events_view_all", "events_register_participants"];
        const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
        // If all are checked, add manage permission
        if (allChecked && !newPermissions.includes("events_manage")) {
          return [...newPermissions, "events_manage"];
        }
        // If any is unchecked, remove manage permission
        else if (!allChecked && newPermissions.includes("events_manage")) {
          return newPermissions.filter(p => p !== "events_manage");
        }
        
        return newPermissions;
      });
    }
    // ✅ Special handling for Employee Issues Management
    else if (permId === "employee_issues_manage") {
      const employeeIssuesPermissions = [
        "employee_issues_manage",
        "employee_issues_view",
        "employee_issues_resolve",
        "employee_issues_assign",
        "employee_issues_delete",
        "employee_issues_reply"
      ];
      
      // If "Manage Employee Issues" is being checked
      if (!permissions.includes("employee_issues_manage")) {
        // Add all employee issues permissions
        setPermissions(prev => {
          const newPermissions = [...prev];
          employeeIssuesPermissions.forEach(p => {
            if (!newPermissions.includes(p)) {
              newPermissions.push(p);
            }
          });
          return newPermissions;
        });
      } else {
        // If "Manage Employee Issues" is being unchecked, remove all employee issues permissions
        setPermissions(prev => prev.filter(p => !employeeIssuesPermissions.includes(p)));
      }
    }
    // Special handling for individual employee issues permissions
    else if (["employee_issues_view", "employee_issues_resolve", "employee_issues_assign", "employee_issues_delete", "employee_issues_reply"].includes(permId)) {
      setPermissions(prev => {
        const newPermissions = prev.includes(permId) 
          ? prev.filter(p => p !== permId)
          : [...prev, permId];
        
        // Check if all individual employee issues permissions are checked
        const individualPerms = ["employee_issues_view", "employee_issues_resolve", "employee_issues_assign", "employee_issues_delete", "employee_issues_reply"];
        const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
        // If all are checked, add manage permission
        if (allChecked && !newPermissions.includes("employee_issues_manage")) {
          return [...newPermissions, "employee_issues_manage"];
        }
        // If any is unchecked, remove manage permission
        else if (!allChecked && newPermissions.includes("employee_issues_manage")) {
          return newPermissions.filter(p => p !== "employee_issues_manage");
        }
        
        return newPermissions;
      });
    }
    // ✅ Special handling for Admin Issue Management
    else if (permId === "admin_issue_manage") {
      const adminIssuePermissions = [
        "admin_issue_manage",
        "admin_issue_view",
        "admin_issue_resolve",
        "admin_issue_assign",
        "admin_issue_delete",
        "admin_issue_priority",
        "admin_issue_status"
      ];
      
      // If "Manage Admin Issues" is being checked
      if (!permissions.includes("admin_issue_manage")) {
        // Add all admin issue permissions
        setPermissions(prev => {
          const newPermissions = [...prev];
          adminIssuePermissions.forEach(p => {
            if (!newPermissions.includes(p)) {
              newPermissions.push(p);
            }
          });
          return newPermissions;
        });
      } else {
        // If "Manage Admin Issues" is being unchecked, remove all admin issue permissions
        setPermissions(prev => prev.filter(p => !adminIssuePermissions.includes(p)));
      }
    }
    // Special handling for individual admin issue permissions
    else if (["admin_issue_view", "admin_issue_resolve", "admin_issue_assign", "admin_issue_delete", "admin_issue_priority", "admin_issue_status"].includes(permId)) {
      setPermissions(prev => {
        const newPermissions = prev.includes(permId) 
          ? prev.filter(p => p !== permId)
          : [...prev, permId];
        
        // Check if all individual admin issue permissions are checked
        const individualPerms = ["admin_issue_view", "admin_issue_resolve", "admin_issue_assign", "admin_issue_delete", "admin_issue_priority", "admin_issue_status"];
        const allChecked = individualPerms.every(p => newPermissions.includes(p));
        
        // If all are checked, add manage permission
        if (allChecked && !newPermissions.includes("admin_issue_manage")) {
          return [...newPermissions, "admin_issue_manage"];
        }
        // If any is unchecked, remove manage permission
        else if (!allChecked && newPermissions.includes("admin_issue_manage")) {
          return newPermissions.filter(p => p !== "admin_issue_manage");
        }
        
        return newPermissions;
      });
    }
    else {
      // Normal toggle for other permissions
      setPermissions((prev) =>
        prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
      );
    }
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/employees/update/${selectedEmployee._id}`, { permissions });

      if (response.status === 200) {
        toast.success(`Access updated for ${selectedEmployee.name}`);
        setEmployees((prev) =>
          prev.map((e) => (e._id === selectedEmployee._id ? { ...e, permissions } : e))
        );
      } else {
        toast.error("Failed to update access");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating permissions");
    }
  };

  // Loading screen matching other components
  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-500">
            Loading user access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Dashboard Header */}
        <div className="emp-dash__header">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap flex items-center gap-2">
              User <span>Access Management</span>
            </h1>
            {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Configure platform-wide permissions and access controls
            </p> */}
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

        {/* Top KPI Stats Grid */}
        {!loading && (
          <div className="emp-dash__stats">
            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Total Employees</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                  <FiUsers className="text-blue-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {employees.length}
              </div>
              <div className="emp-dash__stat-meta">registered users</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Roles</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                  <FiSettings className="text-green-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {availableRoles.length}
              </div>
              <div className="emp-dash__stat-meta">unique roles</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Admins</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                  <FiShield className="text-amber-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {employees.filter(e => e.role === 'admin' || e.role === 'Admin').length}
              </div>
              <div className="emp-dash__stat-meta">admin accounts</div>
            </div>

            <div className="emp-dash__stat">
              <div className="emp-dash__stat-top">
                <span className="emp-dash__stat-label">Super Admins</span>
                <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                  <FiShield className="text-rose-500" />
                </div>
              </div>
              <div className="emp-dash__stat-value">
                {employees.filter(e => e.role === 'super_admin' || e.role === 'Super Admin').length}
              </div>
              <div className="emp-dash__stat-meta">super admin accounts</div>
            </div>
          </div>
        )}

        {/* Filter Card */}
        <div className="emp-dash__card">
          {/* Mobile Filter Toggle Button */}
          <div className="sm:hidden flex items-center justify-between p-3 border-b border-gray-100">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600" />
              Filters
              {showMobileFilters ? <FaChevronUpIcon className="ml-1" /> : <FaChevronDownIcon className="ml-1" />}
            </button>
            <span className="text-xs text-gray-400">
              {filteredEmployees.length} employees
            </span>
          </div>

          {/* Filter Content - Toggle on Mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
            <div className="emp-dash__card-body p-4 bg-gray-50/50">
              <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
                
                {/* Global Search - First */}
                <div className="relative w-full md:w-72" ref={globalSearchRef}>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Search Employee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FiSearch className="text-xs" />
                    </span>
                    <input
                      type="text"
                      placeholder="Quick search name or ID..."
                      value={globalSearchTerm}
                      onChange={(e) => {
                        setGlobalSearchTerm(e.target.value);
                        setIsGlobalSearchOpen(true);
                      }}
                      className="w-full h-9 pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Global Search Results Dropdown */}
                  {isGlobalSearchOpen && globalSearchTerm && (
                    <div className="absolute right-0 z-30 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                      {filteredGlobalEmployees.length > 0 ? (
                        filteredGlobalEmployees.map((emp) => (
                          <div
                            key={emp._id}
                            onClick={() => handleGlobalSelectEmployee(emp)}
                            className="px-3 py-2 transition-colors border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-medium text-gray-700">{emp.name}</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">{emp.role || "No Role"}</p>
                              </div>
                              <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
                                {emp.employeeId}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-center text-gray-500">
                          No employees found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 1. Role Selector - Second */}
                <div className="relative w-full md:w-48" ref={roleDropdownRef}>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Role</label>
                  <div 
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center justify-between w-full h-9 px-3 text-xs text-gray-700 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400"
                  >
                    <span>
                       {selectedRole ? (
                         <span className="flex items-center gap-2">
                           <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-medium uppercase">{selectedRole}</span>
                           <span className="text-gray-500 text-[9px]">({roleStats[selectedRole]})</span>
                         </span>
                       ) : "All Roles"}
                    </span>
                    <FiChevronDown className={`text-gray-500 text-xs transition-transform ${isRoleDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {/* Role Dropdown */}
                  {isRoleDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                      <div 
                        onClick={() => handleSelectRole("")}
                        className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-blue-50"
                      >
                        <span className="font-medium text-gray-700">All Roles</span>
                        {!selectedRole && <FiCheck className="text-xs text-blue-600" />}
                      </div>
                      {availableRoles.map(role => (
                        <div 
                          key={role}
                          onClick={() => handleSelectRole(role)}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">{role}</span>
                            <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{roleStats[role]}</span>
                          </div>
                          {selectedRole === role && <FiCheck className="text-xs text-blue-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Employee Selector - Third */}
                <div className="flex-[2] relative w-full" ref={employeeDropdownRef}>
                  <label className="block mb-1 text-xs font-medium text-gray-600">Employee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FiUser className="text-xs" />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsEmployeeDropdownOpen(true);
                        if(!e.target.value) setSelectedEmployee(null);
                      }}
                      onClick={() => setIsEmployeeDropdownOpen(true)}
                      placeholder={selectedRole ? `Search in ${selectedRole}...` : `Search Name or ID...`}
                      className="w-full h-9 pl-9 pr-8 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <div className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
                       {loading ? <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"/> : null}
                    </div>
                  </div>

                  {/* Employee Dropdown */}
                  {isEmployeeDropdownOpen && filteredEmployees.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                      {filteredEmployees.map((emp) => (
                        <div
                          key={emp._id}
                          onClick={() => handleSelectEmployee(emp)}
                          className="flex items-center justify-between px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 last:border-0"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-700">{emp.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-medium text-gray-900 bg-purple-600 px-1.5 py-0.5 rounded-full">
                                 {emp.employeeId}
                              </span>
                              {!selectedRole && (
                                <>
                                  <span className="text-[8px] text-gray-500">•</span>
                                  <span className="text-[8px] font-medium text-gray-500 uppercase">{emp.role}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedEmployee?._id === emp._id && <FiCheck className="text-xs text-blue-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-200/50">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong>{filteredEmployees.length}</strong> employees
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(globalSearchTerm || selectedRole || searchTerm || selectedEmployee) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(globalSearchTerm || selectedRole || searchTerm || selectedEmployee) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500 font-medium">Active Filters:</span>
                  {globalSearchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[9px] font-semibold border border-gray-200">
                      Search: {globalSearchTerm}
                      <button onClick={() => setGlobalSearchTerm('')} className="hover:text-gray-900 ml-0.5">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {selectedRole && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-semibold border border-blue-200">
                      Role: {selectedRole}
                      <button onClick={() => handleSelectRole('')} className="hover:text-blue-900 ml-0.5">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                  {selectedEmployee && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-semibold border border-purple-200">
                      Employee: {selectedEmployee.name}
                      <button onClick={() => handleSelectEmployee(null)} className="hover:text-purple-900 ml-0.5">
                        <FaTimes size={8} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            {selectedEmployee && (
              <span className="text-[10px] font-bold text-gray-900 bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-0.5 rounded-full shadow-sm">
                {selectedEmployee.role || 'No Role Assigned'}
              </span>
            )}
          </div>
          <div className="emp-dash__card-body bg-gray-50/50">
            {/* Selected Employee Info - Shows when employee is selected */}
            {selectedEmployee && (
              <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-semibold text-blue-800">
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{selectedEmployee.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium text-gray-900 bg-purple-600 px-2 py-0.5 rounded-full">{selectedEmployee.employeeId}</span>
                    <span className="text-[10px] text-gray-500">{selectedEmployee.role || 'No Role'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {!selectedEmployee && (
              <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-3">
                <FiFilter className="text-blue-600" size={18} />
                <p className="text-xs text-blue-800 font-medium">Please select an employee or role above to modify these permission assignments. Showing available system modules below.</p>
              </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${!selectedEmployee ? 'opacity-60 pointer-events-none grayscale-[10%]' : ''}`}>
              {permissionGroups.map((group, groupIndex) => (
                <motion.div
                  key={groupIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                  className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <h4 className="mb-3 text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {group.title}
                  </h4>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-3 cursor-pointer select-none group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-all duration-300 ${
                          group.type === "immutable" ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={group.type === "immutable" ? true : permissions.includes(item.id)}
                            onChange={() => group.type === "toggleable" && handleTogglePermission(item.id)}
                            disabled={!selectedEmployee || group.type === "immutable"}
                            className="sr-only peer"
                          />
                          <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${
                             group.type === "immutable"
                               ? "bg-gray-400 border-gray-400 text-gray-900"
                               : "border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-gray-900 group-hover:border-blue-400"
                          }`}>
                            <FiCheck size={10} className={group.type === "toggleable" && !permissions.includes(item.id) ? "opacity-0 scale-50 transition-all duration-200" : "opacity-100 scale-100 transition-all duration-300"} />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 leading-tight transition-colors">
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setSearchTerm("");
                }}
                className="emp-dash__btn-outline"
              >
                Clear Selection
              </button>
              <button
                onClick={savePermissions}
                disabled={!selectedEmployee}
                className={`emp-dash__btn-primary ${!selectedEmployee ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiCheck size={14} className="mr-1" />
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAccessManagement;