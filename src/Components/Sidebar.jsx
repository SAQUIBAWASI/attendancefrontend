// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// const Sidebar = ({ isCollapsed, isMobile, onLinkClick }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/dashboard");
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
//       "/dashboard": "Dashboard",
//       "/employeelist": "Employees",
//       "/attedancesummary": "Attendance Summary",
//       "/attendancelist": "Attendance Records",
//       "/today-attendance": "Today Attendance",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leaves",
//       "/payroll": "Payroll",
//       "/useractivity": "User Activity",
//       "/leaves-report": "Reports",
//       "/locationlist": "Locations",
//       "/shift": "Shifts",
//       "/addemployee": "Add Employee",
//       "/editemployee": "Edit Employee",
//       "/departmentdashboard": "Departments",
//       "/roledashboard": "Roles",
//       "/addlocation": "Add Location",
//       "/empmanagement": "Employee Management",
//       "/permissions": "Permissions"
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
//     if (onLinkClick) onLinkClick();
//     setOpenDropdown(null);
//     setHoveredItem(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//       localStorage.clear();
//       navigate("/admin-login");
//     } catch (error) {
//       localStorage.clear();
//       navigate("/admin-login");
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

//   const elements = [
//     { 
//       icon: <i className="ri-dashboard-fill"></i>, 
//       name: "Dashboard", 
//       path: "/dashboard",
//       exact: true
//     },
//     { 
//       icon: <i className="ri-user-fill"></i>, 
//       name: "Employees", 
//       path: "/employeelist" 
//     },
//     {
//       icon: <i className="ri-calendar-check-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/attedancesummary" },
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         { name: "Absent Today", path: "/absent-today" },
//       ],
//     },
//     {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Leaves",
//       path: "/leavelist"
//     },

//      {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Permissions",
//       path: "/permissions"
//     },
//     { 
//       icon: <i className="ri-money-dollar-box-fill"></i>, 
//       name: "Payroll", 
//       path: "/payroll" 
//     },
//     { 
//       icon: <i className="ri-user-fill"></i>, 
//       name: "User Activity", 
//       path: "/useractivity" 
//     },
//     { 
//       icon: <i className="ri-lock-2-fill"></i>,
//       name: "User Access",
//       path: "/useraccess" 
//     },
//     { 
//       icon: <i className="ri-file-chart-fill"></i>, 
//       name: "Reports", 
//       path: "/leaves-report" 
//     },
//     { 
//       icon: <i className="ri-map-pin-2-fill"></i>, 
//       name: "Locations", 
//       path: "/locationlist" 
//     },
//     { 
//       icon: <i className="ri-time-fill"></i>, 
//       name: "Shifts", 
//       path: "/shift" 
//     },
//     { 
//       icon: <i className="ri-logout-box-fill"></i>, 
//       name: "Logout", 
//       action: handleLogout 
//     },
//   ];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-black bg-opacity-40"
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
//         className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-50 transition-all duration-300 border-r border-blue-800/50
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
//                   Team Management
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
//             <div key={idx}>
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
//                       navigate(item.dropdown[0].path);
//                       handleAnyClick();
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
//                           className={`text-[9px] transition-transform duration-300 ${
//                             isDropdownActive(item.dropdown) 
//                               ? 'text-white' 
//                               : openDropdown === item.name 
//                                 ? 'text-emerald-300' 
//                                 : 'text-blue-300 hover:text-white'
//                           } ${openDropdown === item.name ? "rotate-180" : ""}`}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* DROPDOWN ITEMS */}
//                   {openDropdown === item.name && !isCollapsed && (
//                     <ul className="mt-0.5 ml-9 space-y-0.5 relative before:absolute before:left-[-1.1rem] before:top-0 before:bottom-1 before:w-[1px] before:bg-blue-700">
//                       {item.dropdown.map((sub, i) => (
//                         <li key={i}>
//                           <Link
//                             to={sub.path}
//                             onClick={handleAnyClick}
//                             className={`block py-1 text-[13px] transition-colors relative before:absolute before:left-[-1.1rem] before:top-1/2 before:w-2 before:h-[1px] before:bg-blue-700 ${
//                               isActive(sub.path)
//                                 ? 'text-emerald-300 font-semibold'
//                                 : 'text-blue-100 hover:text-emerald-300'
//                             }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                               )}
//                               {sub.name}
//                             </div>
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
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
//                 <p className="font-semibold tracking-wider uppercase text-blue-200/80">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                   <span className="text-[9px] text-emerald-300 font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
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

// export default Sidebar;

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// const Sidebar = ({ isCollapsed, isMobile, onLinkClick }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/dashboard");
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
//       "/dashboard": "Dashboard",
//       "/employeelist": "Employees",
//       "/attedancesummary": "Attendance Summary",
//       "/attendancelist": "Attendance Records",
//       "/today-attendance": "Today Attendance",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leaves",
//       "/payroll": "Payroll",
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       // "/leaves-report": "Reports",
//       "/jobpost": "Job Posts",
//       "/locationlist": "Locations",
//       "/shift": "Shifts",
//       "/addemployee": "Add Employee",
//       "/editemployee": "Edit Employee",
//       "/departmentdashboard": "Departments",
//       "/roledashboard": "Roles",
//       "/addlocation": "Add Location",
//       "/empmanagement": "Employee Management",
//       "/permissions": "Permissions"
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
//     if (onLinkClick) onLinkClick();
//     setOpenDropdown(null);
//     setHoveredItem(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//       localStorage.clear();
//       navigate("/admin-login");
//     } catch (error) {
//       localStorage.clear();
//       navigate("/admin-login");
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

//   const elements = [
//     {
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/dashboard",
//       exact: true
//     },
//     {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employees",
//       path: "/employeelist"
//     },
//     {
//       icon: <i className="ri-calendar-check-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/attedancesummary" },
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         { name: "Absent Today", path: "/absent-today" },
//       ],
//     },
//     {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Leaves",
//       path: "/leavelist"
//     },
//     {
//       icon: <i className="ri-shield-keyhole-fill"></i>,
//       name: "Permissions",
//       path: "/permissions"
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Payroll",
//       path: "/payroll"
//     },
//     {
//       icon: <i className="ri-history-fill"></i>,
//       name: "User Activity",
//       path: "/useractivity"
//     },
//     {
//       icon: <i className="ri-shield-user-fill"></i>,
//       name: "User Access",
//       path: "/useraccess"
//     },
//     // { 
//     //   icon: <i className="ri-file-chart-fill"></i>, 
//     //   name: "Reports", 
//     //   path: "/leaves-report" 
//     // },
//     {
//       icon: <i className="ri-briefcase-fill"></i>,
//       name: "Recruitment",
//       dropdown: [
//         { name: "Job Posts", path: "/jobpost" },
//         { name: "Job Applicants", path: "/job-applicants" },
//         { name: "Score Board", path: "/score" },
//         { name: "Assessments", path: "/assessment-manager" },
//         { name: "Documents", path: "/documents" },
//       ],
//     },

//     {
//       icon: <i className="ri-map-pin-2-fill"></i>,
//       name: "Locations",
//       path: "/locationlist"
//     },
//     {
//       icon: <i className="ri-time-fill"></i>,
//       name: "Shifts",
//       path: "/shift"
//     },
//     {
//       icon: <i className="ri-logout-box-r-line"></i>,
//       name: "Logout",
//       action: handleLogout
//     },
//   ];

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-black bg-opacity-40"
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
//         className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-50 transition-all duration-300 border-r border-blue-800/50
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
//                   Team Management
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
//             <div key={idx}>
//               {/* WITH DROPDOWN */}
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${isDropdownActive(item.dropdown)
//                         ? 'bg-emerald-600/80 text-white shadow-lg'
//                         : openDropdown === item.name
//                           ? 'bg-blue-700/70'
//                           : 'hover:bg-blue-700/60'
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
//                           ? 'text-white'
//                           : openDropdown === item.name
//                             ? 'text-emerald-300'
//                             : 'text-blue-100 group-hover:text-emerald-300'
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
//                     <ul className="mt-0.5  space-y-0.5 relative before:absolute before:left-[-1.1rem] before:top-0 before:bottom-1 before:w-[1px] before:bg-blue-700">
//                       {item.dropdown.map((sub, i) => (
//                         <li key={i}>
//                           <Link
//                             to={sub.path}
//                             onClick={handleAnyClick}
//                             className={`block py-1 text-[13px] transition-colors relative before:absolute before:left-[-1.1rem] before:top-1/2 before:w-2 before:h-[1px] before:bg-blue-700 ${isActive(sub.path)
//                                 ? 'text-emerald-300 font-semibold'
//                                 : 'text-blue-100 hover:text-emerald-300'
//                               }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                               )}
//                               {sub.name}
//                             </div>
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
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
//                       ? 'bg-emerald-600/80 text-white shadow-lg'
//                       : 'hover:bg-blue-700/60'
//                     }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
//                       ? 'text-white'
//                       : 'text-blue-100 group-hover:text-emerald-300'
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
//                 <p className="font-semibold tracking-wider uppercase text-blue-200/80">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
//                   <span className="text-[9px] text-emerald-300 font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
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

// export default Sidebar;

import axios from "axios";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isMobile, onLinkClick, isCollapsed, setIsCollapsed }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/dashboard");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Detect active page
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
    setCurrentPage(getPageNameFromPath(path));
  }, [location]);

  const getPageNameFromPath = (path) => {
    const pathMap = {
      "/dashboard": "Dashboard",
      "/employeelist": "Employees",
      "/attedancesummary": "Attendance Summary",
      "/attendancelist": "Attendance Records",
      "/today-attendance": "Today Attendance",
      "/absent-today": "Absent Today",
      "/leavelist": "Leaves",
      "/payroll": "Payroll",
      "/useractivity": "User Activity",
      "/useraccess": "User Access",
      "/jobpost": "Job Posts",
      "/locationlist": "Locations",
      "/shift": "Shifts",
      "/addemployee": "Add Employee",
      "/editemployee": "Edit Employee",
      "/departmentdashboard": "Departments",
      "/roledashboard": "Roles",
      "/addlocation": "Add Location",
      "/empmanagement": "Employee Management",
<<<<<<< HEAD
      "/personaldocuments": "Personal Documents",
      "/permissions": "Permissions",
      "/all-expensives": " Expensives",
      "/recruitment-dashboard":"Recruitment Dashboard"
=======
      "/permissions": "Permissions",
      "/job-applicants": "Job Applicants",
      "/score": "Score Board",
      "/assessment-manager": "Assessments",
      "/documents": "Documents"
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
    };
    return pathMap[path] || "Dashboard";
  };

  // Desktop Hover Expand
  const handleMouseEnterSidebar = () => {
    if (!isMobile) {
      setIsHovering(true);
      setIsCollapsed(false);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (!isMobile) {
      setIsHovering(false);
      if (!openDropdown) {
        setIsCollapsed(true);
      }
    }
  };

  // Tooltip position
  const handleMouseMove = (e, itemName) => {
    setTooltipPosition({
      x: e.clientX + 15,
      y: e.clientY - 10,
    });
    setHoveredItem(itemName);
  };

  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (openDropdown !== name) {
      if (!isMobile && isCollapsed) {
        setIsCollapsed(false);
      }
      setOpenDropdown(name);
    } else {
      setOpenDropdown(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {}
    localStorage.clear();
    navigate("/admin-login");
  };

  const isActive = (path) => activeItem === path;

  const isDropdownActive = (dropdownItems) =>
    dropdownItems?.some((item) => isActive(item.path));

  const elements = [
    {
      icon: <i className="ri-dashboard-fill"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill"></i>,
      name: "Employees",
      path: "/employeelist",
    },
    {
      icon: <i className="ri-calendar-check-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Attendance Summary", path: "/attedancesummary" },
        { name: "Attendance Records", path: "/attendancelist" },
        { name: "Today Attendance", path: "/today-attendance" },
        { name: "Absent Today", path: "/absent-today" },
      ],
    },
    {
      icon: <i className="ri-calendar-close-fill"></i>,
      name: "Leaves",
      path: "/leavelist",
    },
    {
      icon: <i className="ri-shield-keyhole-fill"></i>,
      name: "Permissions",
      path: "/permissions",
    },
    {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Payroll",
      path: "/payroll",
    },
      {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Expensives",
      path: "/all-expensives"
    },


    {
      icon: <i className="ri-history-fill"></i>,
      name: "User Activity",
      path: "/useractivity",
    },
    {
      icon: <i className="ri-shield-user-fill"></i>,
      name: "User Access",
      path: "/useraccess",
    },
    {
      icon: <i className="ri-briefcase-fill"></i>,
      name: "Recruitment",
      dropdown: [
        {name:  "Dashboard", path:"/recruitment-dashboard"},
        { name: "Job Posts", path: "/jobpost" },
        { name: "Job Applicants", path: "/job-applicants" },
        { name: "Score Board", path: "/score" },
        { name: "Assessments", path: "/assessment-manager" },
        { name: "Documents", path: "/personaldocuments" },
        { name: "Employee Journey", path: "/employee-journey" },
      ],
    },
    {
      icon: <i className="ri-map-pin-2-fill"></i>,
      name: "Locations",
      path: "/locationlist",
    },
    {
      icon: <i className="ri-time-fill"></i>,
      name: "Shifts",
      path: "/shift",
    },
    {
      icon: <i className="ri-logout-box-r-line"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  // Handle item click to close dropdown and collapse
  const handleItemClick = (path, action) => {
    if (path) {
      navigate(path);
    }
    
    if (action) {
      action();
    }
    
    setOpenDropdown(null);
    
    if (isMobile) {
      setIsCollapsed(true);
    }
    
    if (onLinkClick) {
      onLinkClick();
    }
    
    setHoveredItem(null);
  };

  // Handle dropdown item click
  const handleDropdownItemClick = (path) => {
    navigate(path);
    setOpenDropdown(null);
    
    if (isMobile) {
      setIsCollapsed(true);
    }
    
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => {
            setIsCollapsed(true);
            setOpenDropdown(null);
          }}
        />
      )}

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

      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-50 transition-all duration-300 border-r border-blue-800/50
        ${
          isMobile
            ? isCollapsed
              ? "-translate-x-full w-52"
              : "translate-x-0 w-52"
            : isCollapsed
            ? "w-16"
            : "w-52"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
          {isCollapsed && !isMobile ? (
            <span className="text-xl text-emerald-300">TM</span>
          ) : (
            <div className="flex flex-col w-full">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
                Team Management
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

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {elements.map((item, idx) => (
            <div key={idx}>
              {item.dropdown ? (
                <>
                  <div
<<<<<<< HEAD
                    className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${isDropdownActive(item.dropdown)
                      ? 'bg-emerald-600/80 text-white shadow-lg'
                      : openDropdown === item.name
                        ? 'bg-blue-700/70'
                        : 'hover:bg-blue-700/60'
                      }`}
                    onClick={() => {
                      navigate(item.dropdown[0].path);
                      handleAnyClick();
=======
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                      isDropdownActive(item.dropdown)
                        ? "bg-emerald-600/80 text-white shadow-lg"
                        : openDropdown === item.name
                        ? "bg-blue-700/70"
                        : "hover:bg-blue-700/60"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.dropdown && item.dropdown.length > 0) {
                        navigate(item.dropdown[0].path);
                        setOpenDropdown(null);
                        if (isMobile) {
                          setIsCollapsed(true);
                        }
                        if (onLinkClick) onLinkClick();
                      }
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
                    }}
                    onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  >
                    <div className="flex items-center gap-2.5">
<<<<<<< HEAD
                      <span className={`text-lg transition-colors duration-200 ${isDropdownActive(item.dropdown)
                        ? 'text-white'
                        : openDropdown === item.name
                          ? 'text-emerald-300'
                          : 'text-blue-100 group-hover:text-emerald-300'
                        }`}>
=======
                      <span className={`text-lg transition-colors duration-200 ${
                        isDropdownActive(item.dropdown)
                          ? "text-white"
                          : openDropdown === item.name
                          ? "text-emerald-300"
                          : "text-blue-100 group-hover:text-emerald-300"
                      }`}>
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-[14px] font-medium leading-none">
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
                              ? "text-white"
                              : openDropdown === item.name
                              ? "text-emerald-300"
                              : "text-blue-300 hover:text-white"
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
                    <ul className="mt-0.5 space-y-0.5">
                      {item.dropdown.map((sub, i) => (
                        <li key={i}>
                          <Link
                            to={sub.path}
<<<<<<< HEAD
                            onClick={handleAnyClick}
                            className={`block py-1 text-[13px] transition-colors relative before:absolute before:left-[-1.1rem] before:top-1/2 before:w-2 before:h-[1px] before:bg-blue-700 ${isActive(sub.path)
                              ? 'text-emerald-300 font-semibold'
                              : 'text-blue-100 hover:text-emerald-300'
                              }`}
=======
                            onClick={() => handleDropdownItemClick(sub.path)}
                            className={`block py-1 text-[13px] transition-colors pl-8 ${
                              isActive(sub.path)
                                ? "text-emerald-300 font-semibold"
                                : "text-blue-100 hover:text-emerald-300"
                            }`}
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
                          >
                            <div className="flex items-center gap-2">
                              {isActive(sub.path) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                              )}
                              {sub.name}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div
                  onClick={() => handleItemClick(item.path, item.action)}
                  onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                  onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
<<<<<<< HEAD
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isActive(item.path)
                    ? 'bg-emerald-600/80 text-white shadow-lg'
                    : 'hover:bg-blue-700/60'
                    }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
                    ? 'text-white'
                    : 'text-blue-100 group-hover:text-emerald-300'
                    }`}>
=======
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-emerald-600/80 text-white shadow-lg"
                      : "hover:bg-blue-700/60"
                  }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-blue-100 group-hover:text-emerald-300"
                  }`}>
>>>>>>> 3938621476ad962b5a1c70f037c0801f9be7f7e2
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-[14px] font-medium leading-none truncate">
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

        {/* Footer */}
        <div className="px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
          {!isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wider uppercase text-blue-200/80">System v1.2</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-[9px] text-emerald-300 font-medium">Active</span>
                </div>
              </div>
              <p>© 2026 Timely Health</p>
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

export default Sidebar;