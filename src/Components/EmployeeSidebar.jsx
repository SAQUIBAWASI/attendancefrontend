// import axios from "axios";
// import { useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = ({ isCollapsed, isMobile, onClose }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const navigate = useNavigate();

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/employees/logout",
//         {},
//         { withCredentials: true }
//       );

//       localStorage.removeItem("employeeEmail");
//       localStorage.removeItem("employeeId");
//       localStorage.removeItem("token");

//       navigate("/employee-login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       localStorage.clear();
//       navigate("/employee-login");
//     }
//   };

//   const elements = [
//     {
//       icon: <i className="text-white ri-dashboard-fill"></i>,
//       name: "Employee Dashboard",
//       path: "/employeedashboard",
//     },
//     {
//       icon: <i className="text-white ri-calendar-close-fill"></i>,
//       name: "Leave",
//       dropdown: [
//         { name: "Leave Application", path: "/leave-application" },
//         { name: "My Leaves", path: "/myleaves" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-file-chart-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Report", path: "/myattendance" },
//         { name: "Check In", path: "/attendance-capture" },
//         { name: "My Shift", path: "/my-shift" },
//         { name: "My AssignedLocation", path: "/mylocation" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-money-dollar-box-fill"></i>,
//       name: "Salary",
//       dropdown: [
//         { name: "My Salary", path: "/mysalary" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-logout-box-fill"></i>,
//       name: "Logout",
//       action: handleLogout,
//     },
//   ];

//   return (
//     <>
//       {/* Mobile overlay background */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-black bg-opacity-50"
//           onClick={onClose}
//         ></div>
//       )}

//       {/* Sidebar container */}
//       <div
//         className={`fixed md:static top-0 left-0 h-screen bg-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out z-50
//           ${isMobile ? (isCollapsed ? "-translate-x-full" : "translate-x-0 w-64") : isCollapsed ? "w-16" : "w-64"}
//         `}
//       >
//         {/* Header */}
//         <div className="sticky top-0 flex items-center justify-center p-4 text-xl font-bold border-b border-blue-700">
//           <span className="text-center truncate">
//             {isCollapsed && !isMobile ? "AD" : "Team Management System"}
//           </span>
//         </div>

//         {/* Navigation */}
//         <nav
//           className={`flex flex-col flex-grow overflow-y-auto no-scrollbar mt-4 space-y-1 ${
//             isCollapsed && !isMobile ? "items-center" : "px-3"
//           }`}
//         >
//           {elements.map((item, idx) => (
//             <div key={idx}>
//               {item.dropdown ? (
//                 <>
//                   <div
//                     onClick={() => toggleDropdown(item.name)}
//                     className="flex items-center py-3 px-3 rounded-lg font-medium text-sm hover:bg-gray-700 hover:text-[#00B074] transition duration-300 cursor-pointer"
//                   >
//                     <span className="text-xl">{item.icon}</span>
//                     <span
//                       className={`ml-4 flex-grow ${
//                         isCollapsed && !isMobile ? "hidden" : "block"
//                       }`}
//                     >
//                       {item.name}
//                     </span>
//                     {!isCollapsed && (
//                       <FaChevronDown
//                         className={`ml-auto text-xs transform transition-transform duration-300 ${
//                           openDropdown === item.name ? "rotate-180" : "rotate-0"
//                         }`}
//                       />
//                     )}
//                   </div>

//                   {/* Dropdown items */}
//                   <ul
//                     className={`overflow-hidden transition-all duration-300 pl-10 ${
//                       openDropdown === item.name
//                         ? "max-h-40 opacity-100"
//                         : "max-h-0 opacity-0"
//                     } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
//                   >
//                     {item.dropdown.map((subItem, subIdx) => (
//                       <li key={subIdx}>
//                         <Link
//                           to={subItem.path}
//                           onClick={() => {
//                             setOpenDropdown(null);
//                             if (isMobile) onClose();
//                           }}
//                           className="block py-2 text-sm font-normal hover:text-[#00B074] transition duration-200"
//                         >
//                           • {subItem.name}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </>
//               ) : (
//                 <Link
//                   to={item.path}
//                   onClick={() => {
//                     if (item.action) item.action();
//                     if (isMobile) onClose();
//                   }}
//                   className="flex items-center py-3 px-3 rounded-lg font-medium text-sm hover:bg-gray-700 hover:text-[#00B074] transition duration-300 cursor-pointer"
//                 >
//                   <span className="text-xl">{item.icon}</span>
//                   <span
//                     className={`ml-4 ${
//                       isCollapsed && !isMobile ? "hidden" : "block"
//                     }`}
//                   >
//                     {item.name}
//                   </span>
//                 </Link>
//               )}
//             </div>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const EmployeeSidebar = ({ isCollapsed, isMobile, onClose }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/employeedashboard");
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Set active page based on current URL
//   useEffect(() => {
//     const path = location.pathname;
//     setActiveItem(path);

//     const pageName = getPageNameFromPath(path);
//     setCurrentPage(pageName);
//   }, [location]);

//   // Function to get page name from path
//   const getPageNameFromPath = (path) => {
//     const pathMap = {
//       "/employeedashboard": "Dashboard",
//       "/leave-application": "Leave Application",
//       "/attendance-capture": "Check In",
//       "/myattendance": "Attendance Report",
//       "/my-shift": "My Shift",
//       "/mylocation": "My Assigned Location",
//       "/mysalary": "My Salary",
//       "/mypermissions": "My Permissions",
//       "/myleaves": "My Leaves",
//       "/notifications": "Notifications",
//       "/emp-admin-dashboard": "Main Dashboard",
//       "/emp-employees": "Employee Management",
//       "/emp-add-employee": "Add Employee",
//       "/emp-attendance-summary": "Attendance Summary",
//       "/emp-attendance-records": "Attendance Records",
//       "/emp-today-attendance": "Today's Attendance",
//       "/emp-absent-today": "Absent Today",
//       "/emp-leaves": "Leave Approval",
//       "/emp-payroll": "Payroll",
//       "/emp-reports": "Reports",
//       "/emp-locations": "Locations",
//       "/emp-shifts": "Shift Management",
//       "/emp-user-activity": "User Activity",
//       "/emp-user-access": "User Access",
//     };

//     return pathMap[path] || "Dashboard";
//   };

//   // Handle mouse move for tooltip positioning
//   const handleMouseMove = (e, itemName) => {
//     setTooltipPosition({
//       x: e.clientX + 15,
//       y: e.clientY - 10,
//     });
//     setHoveredItem(itemName);
//   };

//   // Toggle dropdown ONLY from arrow
//   const toggleDropdown = (e, name) => {
//     e.stopPropagation();
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   // Close sidebar + dropdown
//   const handleAnyClick = () => {
//     if (onClose) onClose();
//     setOpenDropdown(null);
//     setHoveredItem(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         `${API_BASE_URL}/employees/logout`,
//         {},
//         { withCredentials: true }
//       );
//       localStorage.clear();
//       navigate("/employee-login");
//       handleAnyClick();
//     } catch (error) {
//       localStorage.clear();
//       navigate("/employee-login");
//     }
//   };

//   // Check if item is active
//   const isActive = (path) => {
//     return activeItem === path;
//   };

//   // Check if dropdown contains active item
//   const isDropdownActive = (dropdownItems) => {
//     if (!dropdownItems) return false;
//     return dropdownItems.some(item => isActive(item.path));
//   };


//   // const elements = [

//   // Permissions State
//   const [permissions, setPermissions] = useState([]);

//   // Fetch permissions on mount
//   useEffect(() => {
//     const fetchPermissions = async () => {
//       const storedId = localStorage.getItem("employeeId");
//       if (!storedId || storedId === "undefined") return;

//       try {
//         // Added timestamp to prevent caching
//         const response = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${storedId}&t=${new Date().getTime()}`);
//         console.log("🔍 Permissions API Response:", response.data);
//         if (response.data) {
//           const fetchedPermissions = response.data.data?.permissions || response.data.permissions || [];
//           console.log("✅ Extracted Permissions:", fetchedPermissions);
//           setPermissions(fetchedPermissions);
//           // Also update local storage to keep it in sync
//           localStorage.setItem("employeePermissions", JSON.stringify(fetchedPermissions));
//         }
//       } catch (error) {
//         console.error("Failed to fetch permissions", error);
//         // Fallback to local storage if API fails
//         const localPermissions = JSON.parse(localStorage.getItem("employeePermissions") || "[]");
//         setPermissions(localPermissions);
//       }
//     };

//     fetchPermissions();
//   }, []);

//   // Helper to check permission
//   const hasPermission = (permission) => {
//     // If no permissions are set (legacy or new user), maybe restrict or allow all? 
//     // For safety, if permissions array exists but is empty, restrict. 
//     // If it doesn't exist (null), maybe allow basic? 
//     // Let's assume if it exists, we stick to it.
//     if (!permissions.length) return false;
//     return permissions.includes(permission);
//   };

//   const allElements = [
//     // --- Standard Employee Features (Always Visible) ---

//     {
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/employeedashboard",
//       exact: true,
//       permission: "ALLOW_ALWAYS" // Default for employees
//     },

//     {
//       icon: <i className="ri-shield-keyhole-fill"></i>,
//       name: "My Permissions",
//       path: "/mypermissions"
//     },
//     {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Leave",
//       path: "/myleaves",
//       permission: "ALLOW_ALWAYS"

//     },
//     {
//       icon: <i className="ri-file-chart-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Check In", path: "/attendance-capture", permission: "ALLOW_ALWAYS" },
//         { name: "Attendance Report", path: "/myattendance", permission: "ALLOW_ALWAYS" },
//         { name: "My Shift", path: "/my-shift", permission: "ALLOW_ALWAYS" },
//         { name: "My Assigned Location", path: "/mylocation", permission: "ALLOW_ALWAYS" },
//       ],
//       permission: "ALLOW_ALWAYS"
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Salary",
//       path: "/mysalary",
//       permission: "ALLOW_ALWAYS"
//     },

//     // --- Admin Features (Requires Permission) ---
//     {
//       icon: <i className="ri-dashboard-3-fill"></i>,
//       name: "Main Dashboard",
//       path: "/emp-admin-dashboard",
//       permission: "dashboard_view"
//     },
//     {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employee",
//       path: "/emp-employees",
//       permission: "employee_view_all"
//     },
//     {
//       icon: <i className="ri-user-add-fill"></i>,
//       name: "Add Employee",
//       path: "/emp-add-employee",
//       permission: "employee_add"
//     },
//     {
//       icon: <i className="ri-calendar-check-fill"></i>,
//       name: "All Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/emp-attendance-summary", permission: "attendance_view_all" },
//         { name: "Attendance Records", path: "/emp-attendance-records", permission: "attendance_view_all" },
//         { name: "Today Attendance", path: "/emp-today-attendance", permission: "attendance_view_all" },
//         { name: "Absent Today", path: "/emp-absent-today", permission: "attendance_view_all" },
//       ],
//       permission: "attendance_view_all"
//     },
//     {
//       icon: <i className="ri-calendar-event-fill"></i>,
//       name: "Leave Approval",
//       path: "/emp-leaves",
//       permission: "leave_approve"
//     },
//     {
//       icon: <i className="ri-money-dollar-circle-fill"></i>,
//       name: "Payroll",
//       path: "/emp-payroll",
//       permission: "payroll_manage"
//     },
//     {
//       icon: <i className="ri-bar-chart-2-fill"></i>,
//       name: "Reports",
//       path: "/emp-reports",
//       permission: "reports_view"
//     },
//     {
//       icon: <i className="ri-map-pin-user-fill"></i>,
//       name: "Locations",
//       path: "/emp-locations",
//       permission: "locations_manage"
//     },
//     {
//       icon: <i className="ri-time-line"></i>,
//       name: "Shift",
//       path: "/emp-shifts",
//       permission: "shifts_manage"
//     },
//     {
//       icon: <i className="ri-user-search-fill"></i>,
//       name: "User Activity",
//       path: "/emp-user-activity",
//       permission: "user_activity_view"
//     },
//     {
//       icon: <i className="ri-lock-2-fill"></i>,
//       name: "User Access",
//       path: "/emp-user-access",
//       permission: "user_access_manage"
//     },

//     {
//       icon: <i className="ri-logout-box-fill"></i>,
//       name: "Logout",
//       action: handleLogout,
//       permission: "ALLOW_ALWAYS"

//     },
//   ];

//   const elements = allElements.filter(item => {
//     if (item.permission === "ALLOW_ALWAYS") return true;

//     // Check main item permission
//     if (item.permission && !hasPermission(item.permission)) return false;

//     // Filter dropdown items if they exist
//     if (item.dropdown) {
//       item.dropdown = item.dropdown.filter(sub =>
//         !sub.permission || hasPermission(sub.permission)
//       );
//       // If no dropdown items remain, hide the main item
//       if (item.dropdown.length === 0) return false;
//     }

//     return true;
//   });

//   return (
//     <>
//       {/* Mobile Overlay - FIXED Z-INDEX */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-30 bg-black bg-opacity-40"
//           onClick={handleAnyClick}
//         />
//       )}

//       {/* Tooltip for collapsed sidebar */}
//       {isCollapsed && hoveredItem && !isMobile && (
//         <div
//           className="fixed z-[100] bg-blue-600 text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
//           style={{
//             left: `${tooltipPosition.x}px`,
//             top: `${tooltipPosition.y}px`,
//           }}
//         >
//           {hoveredItem}
//         </div>
//       )}

//       {/* Sidebar - FIXED Z-INDEX */}
//       <div
//         className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 transition-all duration-300 border-r border-blue-800/50
//         ${isMobile
//             ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
//             : isCollapsed ? "w-16" : "w-52"
//           }`}
//       >
//         {/* Header with Current Page */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
//           <div className="flex items-center w-full gap-2 overflow-hidden">
//             {isCollapsed && !isMobile ? (
//               <span className="text-xl text-emerald-300">TM</span>
//             ) : (
//               <div className="flex flex-col w-full">
//                 <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
//                   Employee Portal
//                 </span>
//                 <div className="flex items-center gap-1.5">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
//                   <span className="text-xs font-medium truncate text-blue-100/80">
//                     {currentPage}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Menu */}
//         <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
//           {elements.map((item, idx) => (
//             <div key={idx} className="relative">
//               {/* WITH DROPDOWN */}
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${isDropdownActive(item.dropdown)
//                       ? 'bg-emerald-600/80 text-white shadow-lg'
//                       : openDropdown === item.name
//                         ? 'bg-blue-700/70'
//                         : 'hover:bg-blue-700/60'
//                       }`}
//                     onClick={() => {
//                       navigate(item.dropdown[0].path);
//                       handleAnyClick();
//                     }}
//                     onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <span className={`text-lg transition-colors duration-200 ${isDropdownActive(item.dropdown)
//                         ? 'text-white'
//                         : openDropdown === item.name
//                           ? 'text-emerald-300'
//                           : 'text-blue-100 group-hover:text-emerald-300'
//                         }`}>
//                         {item.icon}
//                       </span>
//                       {!isCollapsed && (
//                         <span className={`text-[14px] font-medium leading-none ${isDropdownActive(item.dropdown) ? 'text-white' : ''
//                           }`}>
//                           {item.name}
//                         </span>
//                       )}
//                     </div>

//                     {!isCollapsed && (
//                       <div className="flex items-center gap-1">
//                         {isDropdownActive(item.dropdown) && (
//                           <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
//                         )}
//                         <FaChevronDown
//                           onClick={(e) => toggleDropdown(e, item.name)}
//                           className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${isDropdownActive(item.dropdown)
//                             ? 'text-white'
//                             : openDropdown === item.name
//                               ? 'text-emerald-300'
//                               : 'text-blue-300 hover:text-white'
//                             } ${openDropdown === item.name ? "rotate-180" : ""}`}
//                           style={{
//                             width: '20px',
//                             height: '20px',
//                             minWidth: '20px',
//                             minHeight: '20px'
//                           }}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* DROPDOWN ITEMS */}
//                   {openDropdown === item.name && !isCollapsed && (
//                     <div className="mt-0.5 bg-blue-900/30 rounded-lg p-1.5">
//                       <ul className="space-y-0.5">
//                         {item.dropdown.map((sub, i) => (
//                           <li key={i}>
//                             <Link
//                               to={sub.path}
//                               onClick={handleAnyClick}

//                               className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${isActive(sub.path)

//                                 // className={`flex items-center gap-2.5 py-1.5 px-3 text-[13px] transition-colors rounded ${isActive(sub.path)

//                                 ? 'text-emerald-300 font-semibold bg-emerald-900/20'
//                                 : 'text-blue-100 hover:text-emerald-300 hover:bg-blue-800/40'
//                                 }`}
//                             >
//                               <div className="flex items-center w-full gap-2">
//                                 {isActive(sub.path) ? (
//                                   <i className="text-xs ri-checkbox-circle-fill text-emerald-400"></i>
//                                 ) : (
//                                   <i className="text-xs text-blue-300 ri-checkbox-blank-circle-line"></i>
//                                 )}
//                                 <span className="truncate">{sub.name}</span>
//                               </div>
//                             </Link>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 /* NO DROPDOWN */
//                 <div
//                   onClick={() => {
//                     item.path && navigate(item.path);
//                     item.action && item.action();
//                     handleAnyClick();
//                   }}
//                   onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isActive(item.path)
//                     ? 'bg-emerald-600/80 text-white shadow-lg'
//                     : 'hover:bg-blue-700/60'
//                     }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
//                     ? 'text-white'
//                     : 'text-blue-100 group-hover:text-emerald-300'
//                     }`}>
//                     {item.icon}
//                   </span>
//                   {!isCollapsed && (
//                     <div className="flex items-center flex-1 min-w-0 gap-2">
//                       <span className={`text-[14px] font-medium leading-none truncate ${isActive(item.path) ? 'text-white' : ''
//                         }`}>
//                         {item.name}
//                       </span>
//                       {isActive(item.path) && (
//                         <div className="w-2 h-2 ml-auto rounded-full bg-emerald-300 animate-pulse"></div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* Footer with Page Indicator */}
//         <div className="px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider uppercase text-blue-200/80">Portal v1.0</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                   <span className="text-[9px] text-emerald-300 font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© {new Date().getFullYear()} Timely Health</p>
//               <div className="pt-1 mt-1 border-t border-blue-700/30">
//                 <p className="text-[9px] text-blue-200/70">
//                   Current: <span className="text-emerald-300">{currentPage}</span>
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 rounded-full bg-emerald-400 animate-pulse"></div>
//               <span>©</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EmployeeSidebar;


// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const EmployeeSidebar = ({ isCollapsed, isMobile, onClose }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/employeedashboard");
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Set active page based on current URL
//   useEffect(() => {
//     const path = location.pathname;
//     setActiveItem(path);

//     const pageName = getPageNameFromPath(path);
//     setCurrentPage(pageName);
//   }, [location]);

//   // Function to get page name from path
//   const getPageNameFromPath = (path) => {
//     const pathMap = {
//       "/employeedashboard": "Dashboard",
//       "/leave-application": "Leave Application",
//       "/attendance-capture": "Check In",
//       "/myattendance": "Attendance Report",
//       "/my-shift": "My Shift",
//       "/mylocation": "My Assigned Location",
//       "/mysalary": "My Salary",
//       "/mypermissions": "My Permissions",
//       "/myleaves": "My Leaves",
//       "/notifications": "Notifications",
//       "/emp-admin-dashboard": "Main Dashboard",
//       "/emp-employees": "Employee Management",
//       "/emp-add-employee": "Add Employee",
//       "/emp-attendance-summary": "Attendance Summary",
//       "/emp-attendance-records": "Attendance Records",
//       "/emp-today-attendance": "Today's Attendance",
//       "/emp-absent-today": "Absent Today",
//       "/emp-leaves": "Leave Approval",
//       "/emp-payroll": "Payroll",
//       "/emp-reports": "Reports",
//       "/emp-locations": "Locations",
//       "/emp-shifts": "Shift Management",
//       "/emp-user-activity": "User Activity",
//       "/emp-user-access": "User Access",
//       // Recruitment Routes
//       "/emp-job-posts": "Job Posts",
//       "/emp-job-applicants": "Job Applicants",
//       "/emp-score-board": "Score Board",
//       "/emp-assessments": "Assessments",
//       "/emp-documents": "Documents",
//     };

//     return pathMap[path] || "Dashboard";
//   };

//   // Handle mouse move for tooltip positioning
//   const handleMouseMove = (e, itemName) => {
//     setTooltipPosition({
//       x: e.clientX + 15,
//       y: e.clientY - 10,
//     });
//     setHoveredItem(itemName);
//   };

//   // Toggle dropdown ONLY from arrow
//   const toggleDropdown = (e, name) => {
//     e.stopPropagation();
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   // Close sidebar + dropdown
//   const handleAnyClick = () => {
//     if (onClose) onClose();
//     setOpenDropdown(null);
//     setHoveredItem(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         `${API_BASE_URL}/employees/logout`,
//         {},
//         { withCredentials: true }
//       );
//       localStorage.clear();
//       navigate("/employee-login");
//       handleAnyClick();
//     } catch (error) {
//       localStorage.clear();
//       navigate("/employee-login");
//     }
//   };

//   // Check if item is active
//   const isActive = (path) => {
//     return activeItem === path;
//   };

//   // Check if dropdown contains active item
//   const isDropdownActive = (dropdownItems) => {
//     if (!dropdownItems) return false;
//     return dropdownItems.some(item => isActive(item.path));
//   };

//   // Permissions State
//   const [permissions, setPermissions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch permissions on mount
//   useEffect(() => {
//     const fetchPermissions = async () => {
//       const storedId = localStorage.getItem("employeeId");
//       console.log("🔍 Stored Employee ID:", storedId);
      
//       if (!storedId || storedId === "undefined") {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${storedId}&t=${new Date().getTime()}`);
//         console.log("🔍 Permissions API Response:", response.data);
        
//         if (response.data) {
//           let fetchedPermissions = [];
          
//           // Handle different response structures
//           if (response.data.data && response.data.data.permissions) {
//             fetchedPermissions = response.data.data.permissions;
//           } else if (response.data.permissions) {
//             fetchedPermissions = response.data.permissions;
//           }
          
//           console.log("✅ Extracted Permissions:", fetchedPermissions);
//           setPermissions(fetchedPermissions);
//           localStorage.setItem("employeePermissions", JSON.stringify(fetchedPermissions));
//         }
//       } catch (error) {
//         console.error("Failed to fetch permissions", error);
//         // Fallback to local storage if API fails
//         const localPermissions = JSON.parse(localStorage.getItem("employeePermissions") || "[]");
//         console.log("📦 Local Storage Permissions:", localPermissions);
//         setPermissions(localPermissions);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPermissions();
//   }, []);

//   // Helper to check permission
//   const hasPermission = (permission) => {
//     // If permission is ALLOW_ALWAYS, return true
//     if (permission === "ALLOW_ALWAYS") return true;
    
//     // If no permissions loaded yet, return false
//     if (loading) return false;
    
//     // If permissions array is empty, return false
//     if (!permissions || permissions.length === 0) return false;
    
//     return permissions.includes(permission);
//   };

//   const allElements = [
//     // --- Standard Employee Features (Always Visible) ---
//     {
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/employeedashboard",
//       exact: true,
//       permission: "ALLOW_ALWAYS"
//     },
//     {
//       icon: <i className="ri-shield-keyhole-fill"></i>,
//       name: "My Permissions",
//       path: "/mypermissions",
//       permission: "ALLOW_ALWAYS"
//     },
//     {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Leave",
//       path: "/myleaves",
//       permission: "ALLOW_ALWAYS"
//     },
//     {
//       icon: <i className="ri-file-chart-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Check In", path: "/attendance-capture", permission: "ALLOW_ALWAYS" },
//         { name: "Attendance Report", path: "/myattendance", permission: "ALLOW_ALWAYS" },
//         { name: "My Shift", path: "/my-shift", permission: "ALLOW_ALWAYS" },
//         { name: "My Assigned Location", path: "/mylocation", permission: "ALLOW_ALWAYS" },
//       ],
//       permission: "ALLOW_ALWAYS"
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Salary",
//       path: "/mysalary",
//       permission: "ALLOW_ALWAYS"
//     },

//     // --- Admin Features (Requires Permission) ---
//     {
//       icon: <i className="ri-dashboard-3-fill"></i>,
//       name: "Main Dashboard",
//       path: "/emp-admin-dashboard",
//       permission: "dashboard_view"
//     },
//     {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employee",
//       path: "/emp-employees",
//       permission: "employee_view_all"
//     },
//     {
//       icon: <i className="ri-user-add-fill"></i>,
//       name: "Add Employee",
//       path: "/emp-add-employee",
//       permission: "employee_add"
//     },
//     {
//       icon: <i className="ri-calendar-check-fill"></i>,
//       name: "All Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/emp-attendance-summary", permission: "attendance_view_all" },
//         { name: "Attendance Records", path: "/emp-attendance-records", permission: "attendance_view_all" },
//         { name: "Today Attendance", path: "/emp-today-attendance", permission: "attendance_view_all" },
//         { name: "Absent Today", path: "/emp-absent-today", permission: "attendance_view_all" },
//       ],
//       permission: "attendance_view_all"
//     },
//     {
//       icon: <i className="ri-calendar-event-fill"></i>,
//       name: "Leave Approval",
//       path: "/emp-leaves",
//       permission: "leave_approve"
//     },
//     {
//       icon: <i className="ri-money-dollar-circle-fill"></i>,
//       name: "Payroll",
//       path: "/emp-payroll",
//       permission: "payroll_manage"
//     },
//     {
//       icon: <i className="ri-bar-chart-2-fill"></i>,
//       name: "Reports",
//       path: "/emp-reports",
//       permission: "reports_view"
//     },
//     {
//       icon: <i className="ri-map-pin-user-fill"></i>,
//       name: "Locations",
//       path: "/emp-locations",
//       permission: "locations_manage"
//     },
//     {
//       icon: <i className="ri-time-line"></i>,
//       name: "Shift",
//       path: "/emp-shifts",
//       permission: "shifts_manage"
//     },
//     {
//       icon: <i className="ri-user-search-fill"></i>,
//       name: "User Activity",
//       path: "/emp-user-activity",
//       permission: "user_activity_view"
//     },
//     {
//       icon: <i className="ri-lock-2-fill"></i>,
//       name: "User Access",
//       path: "/emp-user-access",
//       permission: "user_access_manage"
//     },

//     // ✅ RECRUITMENT SECTION
//     {
//       icon: <i className="ri-briefcase-fill"></i>,
//       name: "Recruitment",
//       dropdown: [
//         { name: "Job Posts", path: "/emp-job-posts", permission: "job_posts_view" },
//         { name: "Job Applicants", path: "/emp-job-applicants", permission: "job_applicants_view" },
//         { name: "Score Board", path: "/emp-score-board", permission: "score_board_view" },
//         { name: "Assessments", path: "/emp-assessments", permission: "assessments_view" },
//         { name: "Documents", path: "/emp-documents", permission: "documents_view" },
//       ],
//       permission: "RECRUITMENT_ACCESS" // This will be checked separately
//     },

//     {
//       icon: <i className="ri-logout-box-fill"></i>,
//       name: "Logout",
//       action: handleLogout,
//       permission: "ALLOW_ALWAYS"
//     },
//   ];

//   // Filter elements based on permissions
//   const elements = allElements.filter(item => {
//     // Always show ALLOW_ALWAYS items
//     if (item.permission === "ALLOW_ALWAYS") return true;

//     // Special handling for Recruitment section
//     if (item.name === "Recruitment") {
//       // Check if user has ANY recruitment permission
//       const hasAnyRecruitmentPermission = 
//         hasPermission("job_posts_view") ||
//         hasPermission("job_applicants_view") ||
//         hasPermission("score_board_view") ||
//         hasPermission("assessments_view") ||
//         hasPermission("documents_view") ||
//         hasPermission("job_recruitment_manage");
      
//       console.log("🔍 Recruitment Permissions Check:", {
//         job_posts_view: hasPermission("job_posts_view"),
//         job_applicants_view: hasPermission("job_applicants_view"),
//         score_board_view: hasPermission("score_board_view"),
//         assessments_view: hasPermission("assessments_view"),
//         documents_view: hasPermission("documents_view"),
//         hasAny: hasAnyRecruitmentPermission
//       });

//       if (!hasAnyRecruitmentPermission) return false;

//       // Filter dropdown items based on individual permissions
//       const filteredDropdown = item.dropdown.filter(sub => {
//         const hasSubPermission = hasPermission(sub.permission);
//         console.log(`📋 ${sub.name}: ${hasSubPermission}`);
//         return hasSubPermission;
//       });
      
//       item.dropdown = filteredDropdown;
      
//       // If no dropdown items remain, hide the main item
//       return item.dropdown.length > 0;
//     }

//     // Check main item permission for other items
//     if (item.permission && !hasPermission(item.permission)) return false;

//     // Filter dropdown items if they exist
//     if (item.dropdown) {
//       const filteredDropdown = item.dropdown.filter(sub =>
//         !sub.permission || hasPermission(sub.permission)
//       );
//       item.dropdown = filteredDropdown;
      
//       // If no dropdown items remain, hide the main item
//       if (item.dropdown.length === 0) return false;
//     }

//     return true;
//   });

//   console.log("📊 Final Elements to Render:", elements.map(e => e.name));

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 w-52 flex items-center justify-center">
//         <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-30 bg-black bg-opacity-40"
//           onClick={handleAnyClick}
//         />
//       )}

//       {/* Tooltip for collapsed sidebar */}
//       {isCollapsed && hoveredItem && !isMobile && (
//         <div
//           className="fixed z-[100] bg-blue-600 text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
//           style={{
//             left: `${tooltipPosition.x}px`,
//             top: `${tooltipPosition.y}px`,
//           }}
//         >
//           {hoveredItem}
//         </div>
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 transition-all duration-300 border-r border-blue-800/50
//         ${isMobile
//             ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
//             : isCollapsed ? "w-16" : "w-52"
//           }`}
//       >
//         {/* Header with Current Page */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
//           <div className="flex items-center w-full gap-2 overflow-hidden">
//             {isCollapsed && !isMobile ? (
//               <span className="text-xl text-emerald-300">TM</span>
//             ) : (
//               <div className="flex flex-col w-full">
//                 <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
//                   Employee Portal
//                 </span>
//                 <div className="flex items-center gap-1.5">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
//                   <span className="text-xs font-medium truncate text-blue-100/80">
//                     {currentPage}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Menu */}
//         <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
//           {elements.map((item, idx) => (
//             <div key={idx} className="relative">
//               {/* WITH DROPDOWN */}
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${
//                       isDropdownActive(item.dropdown)
//                         ? 'bg-emerald-600/80 text-white shadow-lg'
//                         : openDropdown === item.name
//                           ? 'bg-blue-700/70'
//                           : 'hover:bg-blue-700/60'
//                     }`}
//                     onClick={() => {
//                       if (item.dropdown && item.dropdown.length > 0) {
//                         navigate(item.dropdown[0].path);
//                         handleAnyClick();
//                       }
//                     }}
//                     onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <span className={`text-lg transition-colors duration-200 ${
//                         isDropdownActive(item.dropdown)
//                           ? 'text-white'
//                           : openDropdown === item.name
//                             ? 'text-emerald-300'
//                             : 'text-blue-100 group-hover:text-emerald-300'
//                       }`}>
//                         {item.icon}
//                       </span>
//                       {!isCollapsed && (
//                         <span className={`text-[14px] font-medium leading-none ${
//                           isDropdownActive(item.dropdown) ? 'text-white' : ''
//                         }`}>
//                           {item.name}
//                         </span>
//                       )}
//                     </div>

//                     {!isCollapsed && (
//                       <div className="flex items-center gap-1">
//                         {isDropdownActive(item.dropdown) && (
//                           <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
//                         )}
//                         <FaChevronDown
//                           onClick={(e) => toggleDropdown(e, item.name)}
//                           className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${
//                             isDropdownActive(item.dropdown)
//                               ? 'text-white'
//                               : openDropdown === item.name
//                                 ? 'text-emerald-300'
//                                 : 'text-blue-300 hover:text-white'
//                           } ${openDropdown === item.name ? "rotate-180" : ""}`}
//                           style={{
//                             width: '20px',
//                             height: '20px',
//                             minWidth: '20px',
//                             minHeight: '20px'
//                           }}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* DROPDOWN ITEMS */}
//                   {openDropdown === item.name && !isCollapsed && (
//                     <div className="mt-0.5 bg-blue-900/30 rounded-lg p-1.5">
//                       <ul className="space-y-0.5">
//                         {item.dropdown.map((sub, i) => (
//                           <li key={i}>
//                             <Link
//                               to={sub.path}
//                               onClick={handleAnyClick}
//                               className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${
//                                 isActive(sub.path)
//                                   ? 'text-emerald-300 font-semibold bg-emerald-900/20'
//                                   : 'text-blue-100 hover:text-emerald-300 hover:bg-blue-800/40'
//                               }`}
//                             >
//                               <div className="flex items-center w-full gap-2">
//                                 {isActive(sub.path) ? (
//                                   <i className="text-xs ri-checkbox-circle-fill text-emerald-400"></i>
//                                 ) : (
//                                   <i className="text-xs text-blue-300 ri-checkbox-blank-circle-line"></i>
//                                 )}
//                                 <span className="truncate">{sub.name}</span>
//                               </div>
//                             </Link>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 /* NO DROPDOWN */
//                 <div
//                   onClick={() => {
//                     item.path && navigate(item.path);
//                     item.action && item.action();
//                     handleAnyClick();
//                   }}
//                   onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
//                     isActive(item.path)
//                       ? 'bg-emerald-600/80 text-white shadow-lg'
//                       : 'hover:bg-blue-700/60'
//                   }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${
//                     isActive(item.path)
//                       ? 'text-white'
//                       : 'text-blue-100 group-hover:text-emerald-300'
//                   }`}>
//                     {item.icon}
//                   </span>
//                   {!isCollapsed && (
//                     <div className="flex items-center flex-1 min-w-0 gap-2">
//                       <span className={`text-[14px] font-medium leading-none truncate ${
//                         isActive(item.path) ? 'text-white' : ''
//                       }`}>
//                         {item.name}
//                       </span>
//                       {isActive(item.path) && (
//                         <div className="w-2 h-2 ml-auto rounded-full bg-emerald-300 animate-pulse"></div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* Footer with Page Indicator */}
//         <div className="px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider uppercase text-blue-200/80">Portal v1.0</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                   <span className="text-[9px] text-emerald-300 font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© {new Date().getFullYear()} Timely Health</p>
//               <div className="pt-1 mt-1 border-t border-blue-700/30">
//                 <p className="text-[9px] text-blue-200/70">
//                   Current: <span className="text-emerald-300">{currentPage}</span>
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 rounded-full bg-emerald-400 animate-pulse"></div>
//               <span>©</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EmployeeSidebar;


import axios from "axios";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EmployeeSidebar = ({ isCollapsed, setIsCollapsed, isMobile, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/employeedashboard");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Set active page based on current URL
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);

    const pageName = getPageNameFromPath(path);
    setCurrentPage(pageName);
  }, [location]);

  // Function to get page name from path
  const getPageNameFromPath = (path) => {
    const pathMap = {
      "/employeedashboard": "Dashboard",
      "/leave-application": "Leave Application",
      "/attendance-capture": "Check In",
      "/myattendance": "Attendance Report",
      "/my-shift": "My Shift",
      "/mylocation": "My Assigned Location",
      "/mysalary": "My Salary",
      "/mypermissions": "My Permissions",
      "/myleaves": "My Leaves",
      "/notifications": "Notifications",
      "/emp-admin-dashboard": "Main Dashboard",
      "/emp-employees": "Employee Management",
      "/emp-add-employee": "Add Employee",
      "/emp-attendance-summary": "Attendance Summary",
      "/emp-attendance-records": "Attendance Records",
      "/emp-today-attendance": "Today's Attendance",
      "/emp-absent-today": "Absent Today",
      "/emp-leaves": "Leave Approval",
      "/emp-payroll": "Payroll",
      "/emp-reports": "Reports",
      "/emp-locations": "Locations",
      "/emp-shifts": "Shift Management",
      "/emp-user-activity": "User Activity",
      "/emp-user-access": "User Access",
<<<<<<< HEAD
      "/expense-management": "Expense Management"
=======
      // Recruitment Routes
      "/emp-job-posts": "Job Posts",
      "/emp-job-applicants": "Job Applicants",
      "/emp-score-board": "Score Board",
      "/emp-assessments": "Assessments",
      "/emp-documents": "Documents",
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
    };

    return pathMap[path] || "Dashboard";
  };

  // Desktop Hover Expand
  const handleMouseEnterSidebar = () => {
    if (!isMobile && setIsCollapsed) {
      setIsHovering(true);
      setIsCollapsed(false);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (!isMobile && setIsCollapsed) {
      setIsHovering(false);
      if (!openDropdown) {
        setIsCollapsed(true);
      }
    }
  };

  // Handle mouse move for tooltip positioning
  const handleMouseMove = (e, itemName) => {
    setTooltipPosition({
      x: e.clientX + 15,
      y: e.clientY - 10,
    });
    setHoveredItem(itemName);
  };

  // Toggle dropdown ONLY from arrow
  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (openDropdown !== name) {
      if (!isMobile && isCollapsed && setIsCollapsed) {
        setIsCollapsed(false);
      }
      setOpenDropdown(name);
    } else {
      setOpenDropdown(null);
    }
  };

  // Close sidebar + dropdown
  const handleAnyClick = () => {
    if (onClose) onClose();
    setOpenDropdown(null);
    setHoveredItem(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/employees/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      navigate("/employee-login");
      handleAnyClick();
    } catch (error) {
      localStorage.clear();
      navigate("/employee-login");
    }
  };

  // Check if item is active
  const isActive = (path) => {
    return activeItem === path;
  };

  // Check if dropdown contains active item
  const isDropdownActive = (dropdownItems) => {
    if (!dropdownItems) return false;
    return dropdownItems.some(item => isActive(item.path));
  };

  // Permissions State
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch permissions on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      const storedId = localStorage.getItem("employeeId");
      console.log("🔍 Stored Employee ID:", storedId);
      
      if (!storedId || storedId === "undefined") {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${storedId}&t=${new Date().getTime()}`);
        console.log("🔍 Permissions API Response:", response.data);
        
        if (response.data) {
          let fetchedPermissions = [];
          
          // Handle different response structures
          if (response.data.data && response.data.data.permissions) {
            fetchedPermissions = response.data.data.permissions;
          } else if (response.data.permissions) {
            fetchedPermissions = response.data.permissions;
          }
          
          console.log("✅ Extracted Permissions:", fetchedPermissions);
          setPermissions(fetchedPermissions);
          localStorage.setItem("employeePermissions", JSON.stringify(fetchedPermissions));
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error);
        // Fallback to local storage if API fails
        const localPermissions = JSON.parse(localStorage.getItem("employeePermissions") || "[]");
        console.log("📦 Local Storage Permissions:", localPermissions);
        setPermissions(localPermissions);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Helper to check permission
  const hasPermission = (permission) => {
    // If permission is ALLOW_ALWAYS, return true
    if (permission === "ALLOW_ALWAYS") return true;
    
    // If no permissions loaded yet, return false
    if (loading) return false;
    
    // If permissions array is empty, return false
    if (!permissions || permissions.length === 0) return false;
    
    return permissions.includes(permission);
  };

  // Build the final elements with merged dropdowns
  const buildElements = () => {
    const enhancedElements = [];

    // 1. ALWAYS SHOW DASHBOARD (Top Priority)
    enhancedElements.push({
      icon: <i className="ri-dashboard-fill"></i>,
      name: "Dashboard",
      path: "/employeedashboard",
      permission: "ALLOW_ALWAYS"
    });

    // 2. ALWAYS SHOW MY PERMISSIONS
    enhancedElements.push({
      icon: <i className="ri-shield-keyhole-fill"></i>,
      name: "My Permissions",
      path: "/mypermissions",
      permission: "ALLOW_ALWAYS"
    });

    // 3. Enhanced Attendance Dropdown (With My Shift + Shift Management)
    const attendanceDropdown = {
      icon: <i className="ri-file-chart-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Check In", path: "/attendance-capture", permission: "ALLOW_ALWAYS" },
        { name: "Attendance Report", path: "/myattendance", permission: "ALLOW_ALWAYS" },
        { name: "My Shift", path: "/my-shift", permission: "ALLOW_ALWAYS" },
        { name: "My Assigned Location", path: "/mylocation", permission: "ALLOW_ALWAYS" },
      ],
      permission: "ALLOW_ALWAYS"
    };

    // Add admin attendance items if user has permission
    const hasAttendanceAdmin = hasPermission("attendance_view_all");
    const hasShiftsManage = hasPermission("shifts_manage");
    
    if (hasAttendanceAdmin || hasShiftsManage) {
      attendanceDropdown.dropdown.push({ name: "--- Admin ---", path: "#", permission: "ALLOW_ALWAYS", disabled: true, divider: true });
      
      if (hasAttendanceAdmin) {
        attendanceDropdown.dropdown.push(
          { name: "Attendance Summary", path: "/emp-attendance-summary", permission: "attendance_view_all" },
          { name: "Attendance Records", path: "/emp-attendance-records", permission: "attendance_view_all" },
          { name: "Today Attendance", path: "/emp-today-attendance", permission: "attendance_view_all" },
          { name: "Absent Today", path: "/emp-absent-today", permission: "attendance_view_all" }
        );
      }
      
      if (hasShiftsManage) {
        attendanceDropdown.dropdown.push(
          { name: "Shift Management", path: "/emp-shifts", permission: "shifts_manage" }
        );
      }
    }
    enhancedElements.push(attendanceDropdown);

    // 4. Enhanced Leave Dropdown (With Reports)
    const leaveDropdown = {
      icon: <i className="ri-calendar-close-fill"></i>,
      name: "Leave",
      dropdown: [
        { name: "My Leaves", path: "/myleaves", permission: "ALLOW_ALWAYS" },
        { name: "Leave Application", path: "/leave-application", permission: "ALLOW_ALWAYS" },
      ],
      permission: "ALLOW_ALWAYS"
    };

    // Add admin leave items if user has permission
    const hasLeaveApprove = hasPermission("leave_approve");
    const hasReportsView = hasPermission("reports_view");
    
    if (hasLeaveApprove || hasReportsView) {
      leaveDropdown.dropdown.push({ name: "--- Admin ---", path: "#", permission: "ALLOW_ALWAYS", disabled: true, divider: true });
      
      if (hasLeaveApprove) {
        leaveDropdown.dropdown.push(
          { name: "Leave Approval", path: "/emp-leaves", permission: "leave_approve" }
        );
      }
      
      if (hasReportsView) {
        leaveDropdown.dropdown.push(
          { name: "Reports", path: "/emp-reports", permission: "reports_view" }
        );
      }
    }
    enhancedElements.push(leaveDropdown);

    // 5. Enhanced Salary/Payroll Dropdown
    const salaryDropdown = {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Salary",
      dropdown: [
        { name: "My Salary", path: "/mysalary", permission: "ALLOW_ALWAYS" },
      ],
      permission: "ALLOW_ALWAYS"
    };

<<<<<<< HEAD
    {
      icon: <i className="ri-money-dollar-circle-fill"></i>,
      name: "My Expenses",
      path: "/expense-management",
      permission: "ALLOW_ALWAYS"
    },

    // --- Admin Features (Requires Permission) ---
    {
      icon: <i className="ri-dashboard-3-fill"></i>,
      name: "Main Dashboard",
      path: "/emp-admin-dashboard",
      permission: "dashboard_view"
    },
    {
=======
    // Add admin payroll items if user has permission
    if (hasPermission("payroll_manage")) {
      salaryDropdown.dropdown.push(
        { name: "--- Admin ---", path: "#", permission: "ALLOW_ALWAYS", disabled: true, divider: true },
        { name: "Payroll", path: "/emp-payroll", permission: "payroll_manage" }
      );
    }
    enhancedElements.push(salaryDropdown);

    // 6. Enhanced Employee Management Dropdown
    const employeeDropdown = {
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
      icon: <i className="ri-user-fill"></i>,
      name: "Employee",
      dropdown: [],
      permission: "employee_view_all"
<<<<<<< HEAD
    },
    {
      icon: <i className="ri-user-add-fill"></i>,
      name: "Add Employee",
      path: "/emp-add-employee",
      permission: "employee_add"
    },
    {
      icon: <i className="ri-calendar-check-fill"></i>,
      name: "All Attendance",
      dropdown: [
        { name: "Attendance Summary", path: "/emp-attendance-summary", permission: "attendance_view_all" },
        { name: "Attendance Records", path: "/emp-attendance-records", permission: "attendance_view_all" },
        { name: "Today Attendance", path: "/emp-today-attendance", permission: "attendance_view_all" },
        { name: "Absent Today", path: "/emp-absent-today", permission: "attendance_view_all" },
      ],
      permission: "attendance_view_all"
    },
    {
      icon: <i className="ri-calendar-event-fill"></i>,
      name: "Leave Approval",
      path: "/emp-leaves",
      permission: "leave_approve"
    },
    {
      icon: <i className="ri-money-dollar-circle-fill"></i>,
      name: "Payroll",
      path: "/emp-payroll",
      permission: "payroll_manage"
    },

    {
      icon: <i className="ri-bar-chart-2-fill"></i>,
      name: "Reports",
      path: "/emp-reports",
      permission: "reports_view"
    },
    {
      icon: <i className="ri-map-pin-user-fill"></i>,
      name: "Locations",
      path: "/emp-locations",
      permission: "locations_manage"
    },
    {
      icon: <i className="ri-time-line"></i>,
      name: "Shift",
      path: "/emp-shifts",
      permission: "shifts_manage"
    },
    {
      icon: <i className="ri-user-search-fill"></i>,
      name: "User Activity",
      path: "/emp-user-activity",
      permission: "user_activity_view"
    },
    {
      icon: <i className="ri-lock-2-fill"></i>,
      name: "User Access",
      path: "/emp-user-access",
      permission: "user_access_manage"
    },
=======
    };
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2

    // Add employee management items based on permissions
    if (hasPermission("employee_view_all")) {
      employeeDropdown.dropdown.push(
        { name: "Employee Management", path: "/emp-employees", permission: "employee_view_all" }
      );
    }
    if (hasPermission("employee_add")) {
      employeeDropdown.dropdown.push(
        { name: "Add Employee", path: "/emp-add-employee", permission: "employee_add" }
      );
    }
    
    // Only add if at least one item
    if (employeeDropdown.dropdown.length > 0) {
      enhancedElements.push(employeeDropdown);
    }

    // 7. Locations (Standalone)
    if (hasPermission("locations_manage")) {
      enhancedElements.push({
        icon: <i className="ri-map-pin-user-fill"></i>,
        name: "Locations",
        path: "/emp-locations",
        permission: "locations_manage"
      });
    }

    // 8. User Management Dropdown (User Activity + User Access)
    const hasUserActivity = hasPermission("user_activity_view");
    const hasUserAccess = hasPermission("user_access_manage");
    
    if (hasUserActivity || hasUserAccess) {
      const userManagementDropdown = {
        icon: <i className="ri-group-fill"></i>,
        name: "User Management",
        dropdown: []
      };

      if (hasUserActivity) {
        userManagementDropdown.dropdown.push(
          { name: "User Activity", path: "/emp-user-activity", permission: "user_activity_view" }
        );
      }
      
      if (hasUserAccess) {
        userManagementDropdown.dropdown.push(
          { name: "User Access", path: "/emp-user-access", permission: "user_access_manage" }
        );
      }

      enhancedElements.push(userManagementDropdown);
    }

    // 9. Main Dashboard (Standalone)
    if (hasPermission("dashboard_view")) {
      enhancedElements.push({
        icon: <i className="ri-dashboard-3-fill"></i>,
        name: "Main Dashboard",
        path: "/emp-admin-dashboard",
        permission: "dashboard_view"
      });
    }

    // 10. Recruitment
    const hasAnyRecruitmentPermission = 
      hasPermission("job_posts_view") ||
      hasPermission("job_applicants_view") ||
      hasPermission("score_board_view") ||
      hasPermission("assessments_view") ||
      hasPermission("documents_view") ||
      hasPermission("job_recruitment_manage");

    if (hasAnyRecruitmentPermission) {
      const recruitmentDropdown = {
        icon: <i className="ri-briefcase-fill"></i>,
        name: "Recruitment",
        dropdown: []
      };

      if (hasPermission("job_posts_view")) {
        recruitmentDropdown.dropdown.push({ name: "Job Posts", path: "/emp-job-posts", permission: "job_posts_view" });
      }
      if (hasPermission("job_applicants_view")) {
        recruitmentDropdown.dropdown.push({ name: "Job Applicants", path: "/emp-job-applicants", permission: "job_applicants_view" });
      }
      if (hasPermission("score_board_view")) {
        recruitmentDropdown.dropdown.push({ name: "Score Board", path: "/emp-score-board", permission: "score_board_view" });
      }
      if (hasPermission("assessments_view")) {
        recruitmentDropdown.dropdown.push({ name: "Assessments", path: "/emp-assessments", permission: "assessments_view" });
      }
      if (hasPermission("documents_view")) {
        recruitmentDropdown.dropdown.push({ name: "Documents", path: "/emp-documents", permission: "documents_view" });
      }

      if (recruitmentDropdown.dropdown.length > 0) {
        enhancedElements.push(recruitmentDropdown);
      }
    }

    // 11. Logout always at end
    enhancedElements.push({
      icon: <i className="ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout,
      permission: "ALLOW_ALWAYS"
    });

    return enhancedElements;
  };

  const elements = buildElements();

  console.log("📊 Final Elements to Render:", elements.map(e => e.name));

  // Show loading state
  if (loading) {
    return (
      <div 
        className="fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 w-52 flex items-center justify-center"
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
      >
        <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40"
          onClick={() => {
            if (setIsCollapsed) setIsCollapsed(true);
            setOpenDropdown(null);
          }}
        />
      )}

      {/* Tooltip for collapsed sidebar */}
      {isCollapsed && hoveredItem && !isMobile && (
        <div
          className="fixed z-[100] bg-blue-600 text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {hoveredItem}
        </div>
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 transition-all duration-300 border-r border-blue-800/50
        ${isMobile
            ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
            : isCollapsed ? "w-16" : "w-52"
          }`}
      >
        {/* Header with Current Page */}
        <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
          <div className="flex items-center w-full gap-2 overflow-hidden">
            {isCollapsed && !isMobile ? (
              <span className="text-xl text-emerald-300">TM</span>
            ) : (
              <div className="flex flex-col w-full">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
                  Employee Portal
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-medium truncate text-blue-100/80">
                    {currentPage}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
          {elements.map((item, idx) => (
            <div key={idx} className="relative">
              {/* WITH DROPDOWN */}
              {item.dropdown ? (
                <>
                  <div
                    className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${
                      isDropdownActive(item.dropdown)
                        ? 'bg-emerald-600/80 text-white shadow-lg'
                        : openDropdown === item.name
                          ? 'bg-blue-700/70'
                          : 'hover:bg-blue-700/60'
                    }`}
                    onClick={() => {
                      if (item.dropdown && item.dropdown.length > 0) {
                        // Find first non-disabled item
                        const firstValidItem = item.dropdown.find(d => !d.disabled);
                        if (firstValidItem) {
                          navigate(firstValidItem.path);
                          handleAnyClick();
                        }
                      }
                    }}
                    onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg transition-colors duration-200 ${
                        isDropdownActive(item.dropdown)
                          ? 'text-white'
                          : openDropdown === item.name
                            ? 'text-emerald-300'
                            : 'text-blue-100 group-hover:text-emerald-300'
                      }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className={`text-[14px] font-medium leading-none ${
                          isDropdownActive(item.dropdown) ? 'text-white' : ''
                        }`}>
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        {isDropdownActive(item.dropdown) && (
                          <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                        )}
                        <FaChevronDown
                          onClick={(e) => toggleDropdown(e, item.name)}
                          className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${
                            isDropdownActive(item.dropdown)
                              ? 'text-white'
                              : openDropdown === item.name
                                ? 'text-emerald-300'
                                : 'text-blue-300 hover:text-white'
                          } ${openDropdown === item.name ? "rotate-180" : ""}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            minWidth: '20px',
                            minHeight: '20px'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* DROPDOWN ITEMS */}
                  {openDropdown === item.name && !isCollapsed && (
                    <div className="mt-0.5 bg-blue-900/30 rounded-lg p-1.5">
                      <ul className="space-y-0.5">
                        {item.dropdown.map((sub, i) => (
                          <li key={i}>
                            {sub.divider ? (
                              <div className="px-2 py-1 text-[10px] text-blue-300/50 uppercase tracking-wider">
                                {sub.name}
                              </div>
                            ) : sub.disabled ? (
                              <div className="flex items-center gap-2.5 py-1.5 px-0 text-[13px] text-blue-300/50 cursor-not-allowed">
                                <i className="text-xs ri-subtract-line"></i>
                                <span className="truncate">{sub.name}</span>
                              </div>
                            ) : (
                              <Link
                                to={sub.path}
                                onClick={handleAnyClick}
                                className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${
                                  isActive(sub.path)
                                    ? 'text-emerald-300 font-semibold bg-emerald-900/20'
                                    : 'text-blue-100 hover:text-emerald-300 hover:bg-blue-800/40'
                                }`}
                              >
                                <div className="flex items-center w-full gap-2">
                                  {isActive(sub.path) ? (
                                    <i className="text-xs ri-checkbox-circle-fill text-emerald-400"></i>
                                  ) : (
                                    <i className="text-xs text-blue-300 ri-checkbox-blank-circle-line"></i>
                                  )}
                                  <span className="truncate">{sub.name}</span>
                                </div>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                /* NO DROPDOWN */
                <div
                  onClick={() => {
                    item.path && navigate(item.path);
                    item.action && item.action();
                    handleAnyClick();
                  }}
                  onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-emerald-600/80 text-white shadow-lg'
                      : 'hover:bg-blue-700/60'
                  }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-blue-100 group-hover:text-emerald-300'
                  }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className={`text-[14px] font-medium leading-none truncate ${
                        isActive(item.path) ? 'text-white' : ''
                      }`}>
                        {item.name}
                      </span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 ml-auto rounded-full bg-emerald-300 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer with Page Indicator */}
        <div className="px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
          {!isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wider uppercase text-blue-200/80">Portal v1.0</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-[9px] text-emerald-300 font-medium">Active</span>
                </div>
              </div>
              <p>© {new Date().getFullYear()} Timely Health</p>
              <div className="pt-1 mt-1 border-t border-blue-700/30">
                <p className="text-[9px] text-blue-200/70">
                  Current: <span className="text-emerald-300">{currentPage}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>©</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;




