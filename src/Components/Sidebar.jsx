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
//           className="fixed inset-0 z-40 bg-[#1E3A8A] "
//           onClick={handleAnyClick}
//         />
//       )}

//       {/* Tooltip for collapsed sidebar */}
//       {isCollapsed && hoveredItem && !isMobile && (
//         <div
//           className="fixed z-[100] bg-[#16A34A] text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
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
//         className={`fixed top-0 left-0 h-full bg-[#16A34A] text-white z-50 transition-all duration-300 border-blue-500 border-blue-500
//         ${isMobile
//             ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
//             : isCollapsed ? "w-16" : "w-52"
//           }`}
//       >
//         {/* Header with Current Page */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight bg-blue-700 border-blue-500 h-14">
//           <div className="flex items-center w-full gap-2 overflow-hidden">
//             {isCollapsed && !isMobile ? (
//               <span className="text-xl text-white">TM</span>
//             ) : (
//               <div className="flex flex-col w-full">
//                 <span className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-0.5">
//                   Team Management
//                 </span>
//                 <div className="flex items-center gap-1.5">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
//                   <span className="text-xs font-medium truncate text-white/80">
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
//                         ? 'bg-blue-600/80 text-white shadow-lg'
//                         : openDropdown === item.name 
//                           ? 'bg-blue-700/70' 
//                           : 'hover:bg-[#1D4ED8]/60/70/70/60'
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
//                             ? 'text-white' 
//                             : 'text-white group-hover:text-white'
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
//                                 ? 'text-white' 
//                                 : 'text-white'
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
//                                 ? 'text-white font-semibold'
//                                 : 'text-white hover:text-white'
//                             }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
//                       ? 'bg-blue-600/80 text-white shadow-lg'
//                       : 'hover:bg-[#1D4ED8]/60/70/70/60'
//                   }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${
//                     isActive(item.path) 
//                       ? 'text-white' 
//                       : 'text-white group-hover:text-white'
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
//         <div className="px-4 py-3 text-[10px] text-white border-blue-500 border-blue-500 bg-blue-700">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider text-white uppercase">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                   <span className="text-[9px] text-white font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
//               <div className="pt-1 mt-1 border-blue-500 border-blue-500/30">
//                 <p className="text-[9px] text-white/70">
//                   Current: <span className="text-white">{currentPage}</span>
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 bg-blue-400 rounded-full animate-pulse"></div>
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
//           className="fixed inset-0 z-40 bg-[#1E3A8A] "
//           onClick={handleAnyClick}
//         />
//       )}

//       {/* Tooltip for collapsed sidebar */}
//       {isCollapsed && hoveredItem && !isMobile && (
//         <div
//           className="fixed z-[100] bg-[#16A34A] text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
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
//         className={`fixed top-0 left-0 h-full bg-[#16A34A] text-white z-50 transition-all duration-300 border-blue-500 border-blue-500
//         ${isMobile
//             ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
//             : isCollapsed ? "w-16" : "w-52"
//           }`}
//       >
//         {/* Header with Current Page */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight bg-blue-700 border-blue-500 h-14">
//           <div className="flex items-center w-full gap-2 overflow-hidden">
//             {isCollapsed && !isMobile ? (
//               <span className="text-xl text-white">TM</span>
//             ) : (
//               <div className="flex flex-col w-full">
//                 <span className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-0.5">
//                   Team Management
//                 </span>
//                 <div className="flex items-center gap-1.5">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
//                   <span className="text-xs font-medium truncate text-white/80">
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
//                         ? 'bg-blue-600/80 text-white shadow-lg'
//                         : openDropdown === item.name
//                           ? 'bg-blue-700/70'
//                           : 'hover:bg-[#1D4ED8]/60/70/70/60'
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
//                             ? 'text-white'
//                             : 'text-white group-hover:text-white'
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
//                           className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600 rounded cursor-pointer ${isDropdownActive(item.dropdown)
//                             ? 'text-white'
//                             : openDropdown === item.name
//                               ? 'text-white'
//                               : 'text-white'
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
//                                 ? 'text-white font-semibold'
//                                 : 'text-white hover:text-white'
//                               }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
//                       ? 'bg-blue-600/80 text-white shadow-lg'
//                       : 'hover:bg-[#1D4ED8]/60/70/70/60'
//                     }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
//                       ? 'text-white'
//                       : 'text-white group-hover:text-white'
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
//         <div className="px-4 py-3 text-[10px] text-white border-blue-500 border-blue-500 bg-blue-700">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider text-white uppercase">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                   <span className="text-[9px] text-white font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
//               <div className="pt-1 mt-1 border-blue-500 border-blue-500/30">
//                 <p className="text-[9px] text-white/70">
//                   Current: <span className="text-white">{currentPage}</span>
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 bg-blue-400 rounded-full animate-pulse"></div>
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

// const Sidebar = ({ isMobile, onLinkClick, isCollapsed, setIsCollapsed }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/dashboard");
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//   const [isHovering, setIsHovering] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Detect active page
//   useEffect(() => {
//     const path = location.pathname;
//     setActiveItem(path);
//     setCurrentPage(getPageNameFromPath(path));
//   }, [location]);

//   const getPageNameFromPath = (path) => {
//     const pathMap = {
//       "/dashboard": "Dashboard",
//       "/employeelist": "Employees",
//       "/attedancesummary": "Attendance Summary",
//       "/all-medical-certificates": "Medical Certificates",
//       "/attendancelist": "Attendance Records",
//       "/today-attendance": "Today Attendance",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leaves",
//       "/payroll": "Payroll",
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       "/jobpost": "Job Posts",
//       "/locationlist": "Locations",
//       "/shift": "Shifts",
//       "/addemployee": "Add Employee",
//       "/editemployee": "Edit Employee",
//       "/departmentdashboard": "Departments",
//       "/roledashboard": "Roles",
//       "/addlocation": "Add Location",
//       "/empmanagement": "Employee Management",
//       "/permissions": "Permissions",
//       "/job-applicants": "Job Applicants",
//       "/score": "Score Board",
//       "/assessment-manager": "Assessments",
//       "/documents": "Documents",
//       "/all-expensives": "Expenses"
//     };
//     return pathMap[path] || "Dashboard";
//   };

//   // Desktop Hover Expand
//   const handleMouseEnterSidebar = () => {
//     if (!isMobile) {
//       setIsHovering(true);
//       setIsCollapsed(false);
//     }
//   };

//   const handleMouseLeaveSidebar = () => {
//     if (!isMobile) {
//       setIsHovering(false);
//       if (!openDropdown) {
//         setIsCollapsed(true);
//       }
//     }
//   };

//   // Tooltip position
//   const handleMouseMove = (e, itemName) => {
//     setTooltipPosition({
//       x: e.clientX + 15,
//       y: e.clientY - 10,
//     });
//     setHoveredItem(itemName);
//   };

//   const toggleDropdown = (e, name) => {
//     e.stopPropagation();
//     e.preventDefault();

//     if (openDropdown !== name) {
//       if (!isMobile && isCollapsed) {
//         setIsCollapsed(false);
//       }
//       setOpenDropdown(name);
//     } else {
//       setOpenDropdown(null);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) {}
//     localStorage.clear();
//     navigate("/admin-login");
//   };

//   const isActive = (path) => activeItem === path;

//   const isDropdownActive = (dropdownItems) =>
//     dropdownItems?.some((item) => isActive(item.path));

//   const elements = [
//     {
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/dashboard",
//     },
//     {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employees",
//       path: "/employeelist",
//     },
//     {
//       icon: <i className="ri-calendar-check-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/attedancesummary" },
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         { name: "Absent Today", path: "/absent-today" },
//         { name: "Regularization", path: "/regularization" },
//         { name: "Medical Certificates", path: "/all-medical-certificates" },
//       ],
//     },
//     {
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "Leaves",
//       path: "/leavelist",
//     },
//     {
//       icon: <i className="ri-shield-keyhole-fill"></i>,
//       name: "Permissions",
//       path: "/permissions",
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Payroll",
//       path: "/payroll",
//     },
//       {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Expensives",
//       path: "/all-expensives"
//     },


//     {
//       icon: <i className="ri-history-fill"></i>,
//       name: "User Activity",
//       path: "/useractivity",
//     },
//     {
//       icon: <i className="ri-shield-user-fill"></i>,
//       name: "User Access",
//       path: "/useraccess",
//     },
//     {
//       icon: <i className="ri-briefcase-fill"></i>,
//       name: "Recruitment",
//       dropdown: [
//         {name:  "Dashboard", path:"/recruitment-dashboard"},
//         { name: "Job Posts", path: "/jobpost" },
//         { name: "Job Applicants", path: "/job-applicants" },
//         { name: "Score Board", path: "/score" },
//         { name: "Assessments", path: "/assessment-manager" },
//         { name: "Documents", path: "/personaldocuments" },
//         { name: "Employee Journey", path: "/employee-journey" },
//       ],
//     },
//     {
//       icon: <i className="ri-map-pin-2-fill"></i>,
//       name: "Locations",
//       path: "/locationlist",
//     },
//     {
//       icon: <i className="ri-time-fill"></i>,
//       name: "Shifts",
//       path: "/shift",
//     },
//     {
//       icon: <i className="ri-logout-box-r-line"></i>,
//       name: "Logout",
//       action: handleLogout,
//     },
//   ];

//   // Handle item click to close dropdown and collapse
//   const handleItemClick = (path, action) => {
//     if (path) {
//       navigate(path);
//     }

//     if (action) {
//       action();
//     }

//     setOpenDropdown(null);

//     if (isMobile) {
//       setIsCollapsed(true);
//     }

//     if (onLinkClick) {
//       onLinkClick();
//     }

//     setHoveredItem(null);
//   };

//   // Handle dropdown item click
//   const handleDropdownItemClick = (path) => {
//     navigate(path);
//     setOpenDropdown(null);

//     if (isMobile) {
//       setIsCollapsed(true);
//     }

//     if (onLinkClick) {
//       onLinkClick();
//     }
//   };

//   return (
//     <>
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-[#1E3A8A] "
//           onClick={() => {
//             setIsCollapsed(true);
//             setOpenDropdown(null);
//           }}
//         />
//       )}

//       {isCollapsed && hoveredItem && !isMobile && (
//         <div
//           className="fixed z-[100] bg-[#16A34A] text-white text-sm px-3 py-2 rounded-md shadow-lg pointer-events-none"
//           style={{
//             left: `${tooltipPosition.x}px`,
//             top: `${tooltipPosition.y}px`,
//           }}
//         >
//           {hoveredItem}
//         </div>
//       )}

//       <div
//         onMouseEnter={handleMouseEnterSidebar}
//         onMouseLeave={handleMouseLeaveSidebar}
//         className={`fixed top-0 left-0 h-full bg-[#16A34A] text-white z-50 transition-all duration-300 border-blue-500 border-blue-500
//         ${
//           isMobile
//             ? isCollapsed
//               ? "-translate-x-full w-52"
//               : "translate-x-0 w-52"
//             : isCollapsed
//             ? "w-16"
//             : "w-52"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight bg-blue-700 border-blue-500 h-14">
//           {isCollapsed && !isMobile ? (
//             <span className="text-xl text-white">TM</span>
//           ) : (
//             <div className="flex flex-col w-full">
//               <span className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-0.5">
//                 Team Management
//               </span>
//               <div className="flex items-center gap-1.5">
//                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
//                 <span className="text-xs font-medium truncate text-white/80">
//                   {currentPage}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Menu */}
//         <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
//           {elements.map((item, idx) => (
//             <div key={idx}>
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
//                       isDropdownActive(item.dropdown)
//                         ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
//                         : openDropdown === item.name
//                         ? "bg-[#1E3A8A]"
//                         : "hover:bg-blue-600"
//                     }`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (item.dropdown && item.dropdown.length > 0) {
//                         navigate(item.dropdown[0].path);
//                         setOpenDropdown(null);
//                         if (isMobile) {
//                           setIsCollapsed(true);
//                         }
//                         if (onLinkClick) onLinkClick();
//                       }
//                     }}
//                     onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                     onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <span className={`text-lg transition-colors duration-200 ${
//                         isDropdownActive(item.dropdown)
//                           ? "text-white"
//                           : openDropdown === item.name
//                           ? "text-white"
//                           : "text-white group-hover:text-white"
//                       }`}>
//                         {item.icon}
//                       </span>
//                       {!isCollapsed && (
//                         <span className="text-[14px] font-medium leading-none">
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
//                           className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600 rounded cursor-pointer ${
//                             isDropdownActive(item.dropdown)
//                               ? "text-white"
//                               : openDropdown === item.name
//                               ? "text-white"
//                               : "text-white"
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
//                     <ul className="mt-0.5 space-y-0.5">
//                       {item.dropdown.map((sub, i) => (
//                         <li key={i}>
//                           <Link
//                             to={sub.path}
//                             onClick={() => handleDropdownItemClick(sub.path)}
//                             className={`block py-1 text-[13px] transition-colors pl-8 ${
//                               isActive(sub.path)
//                                 ? "text-white font-semibold"
//                                 : "text-white hover:text-white"
//                             }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
//                 <div
//                   onClick={() => handleItemClick(item.path, item.action)}
//                   onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
//                   onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
//                   className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
//                     isActive(item.path)
//                       ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
//                       : "hover:bg-blue-600"
//                   }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${
//                     isActive(item.path)
//                       ? "text-white"
//                       : "text-white group-hover:text-white"
//                   }`}>
//                     {item.icon}
//                   </span>
//                   {!isCollapsed && (
//                     <div className="flex items-center flex-1 min-w-0 gap-2">
//                       <span className="text-[14px] font-medium leading-none truncate">
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

//         {/* Footer */}
//         <div className="px-4 py-3 text-[10px] text-white border-blue-500 border-blue-500 bg-blue-700">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider text-white uppercase">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                   <span className="text-[9px] text-white font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 bg-blue-400 rounded-full animate-pulse"></div>
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

// const Sidebar = ({ isMobile, onLinkClick, isCollapsed, setIsCollapsed }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/dashboard");

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Detect active page
//   useEffect(() => {
//     const path = location.pathname;
//     setActiveItem(path);
//     setCurrentPage(getPageNameFromPath(path));
//   }, [location]);

//   const getPageNameFromPath = (path) => {
//     const pathMap = {
//       "/dashboard": "Dashboard",
//       "/employeelist": "Employees",
//       "/attedancesummary": "Attendance Summary",
//       "/all-medical-certificates": "Medical Certificates",
//       "/attendancelist": "Attendance Records",
//       "/today-attendance": "Today Attendance",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leaves",
//       "/payroll": "Payroll",
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       "/jobpost": "Job Posts",
//       "/locationlist": "Locations",
//       "/shift": "Shifts",
//       "/addemployee": "Add Employee",
//       "/editemployee": "Edit Employee",
//       "/departmentdashboard": "Departments",
//       "/roledashboard": "Roles",
//       "/addlocation": "Add Location",
//       "/empmanagement": "Employee Management",
//       "/permissions": "Permissions",
//       "/job-applicants": "Job Applicants",
//       "/score": "Score Board",
//       "/assessment-manager": "Assessments",
//       "/documents": "Documents",
//       "/all-expensives": "Expenses",
//       "/events": "Events",
//       "/over-time": "Over Time",
//       "/comp-off-settings": "Comp Off Settings",
//       "/employee-resignation": "Resignation",
//       "/holidays-calendar": "Holidays",
//       "/recruitment-dashboard": "Recruitment Dashboard",
//       "/personaldocuments": "Personal Documents",
//       "/employee-journey": "Employee Journey"
//     };
//     return pathMap[path] || "Dashboard";
//   };

//   // Desktop Hover Expand/Collapse
//   const handleMouseEnterSidebar = () => {
//     if (!isMobile && isCollapsed) {
//       setIsCollapsed(false);
//     }
//   };

//   const handleMouseLeaveSidebar = () => {
//     if (!isMobile && !openDropdown) {
//       setIsCollapsed(true);
//     }
//   };

//   const toggleDropdown = (e, name) => {
//     e.stopPropagation();
//     e.preventDefault();

//     if (openDropdown !== name) {
//       if (!isMobile && isCollapsed) {
//         setIsCollapsed(false);
//       }
//       setOpenDropdown(name);
//     } else {
//       setOpenDropdown(null);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) { }
//     localStorage.clear();
//     navigate("/admin-login");
//   };

//   const isActive = (path) => activeItem === path;

//   const isDropdownActive = (dropdownItems) =>
//     dropdownItems?.some((item) => isActive(item.path));

//   const elements = [
//     {
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/dashboard",
//     },
//     {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employees",
//       path: "/employeelist",
//     },
//     {
//       icon: <i className="ri-calendar-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Summary", path: "/attedancesummary" },
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         { name: "Absent Today", path: "/absent-today" },
//         { name: "Regularization", path: "/regularization" },
//       ],
//     },
//     {
//       icon: <i className="ri-calendar-fill"></i>,
//       name: "Leaves",
//       path: "/leavelist",
//     },
//     {
//       icon: <i className="ri-exchange-fill"></i>,
//       name: "Comp Off Requests",
//       path: "/comp-off-requests",
//     },
//     {
//       icon: <i className="ri-calendar-fill"></i>,
//       name: "Holidays",
//       path: "/holidays-calendar",
//     },
//     {
//       icon: <i className="ri-calendar-event-fill"></i>,
//       name: "Events",
//       path: "/events",
//     },
//     {
//       icon: <i className="ri-shield-keyhole-fill"></i>,
//       name: "Permissions",
//       path: "/permissions",
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Payroll",
//       path: "/payroll",
//     },
//     {
//       icon: <i className="ri-time-fill"></i>,  // Changed icon to clock for OverTime
//       name: "OverTime",
//       path: "/ot-claims",
//     },
//     // {
//     //   icon: <i className="ri-settings-3-fill"></i>,  // Settings icon for Comp Off
//     //   name: "Comp Off",
//     //   path: "/comp-off-settings",
//     // },
//     {
//       icon: <i className="ri-user-unfollow-line"></i>,
//       name: "Resignation",
//       path: "/employee-resignation",
//     },
//     {
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Expensives",
//       path: "/all-expensives"
//     },
//     {
//       icon: <i className="ri-history-fill"></i>,
//       name: "User Activity",
//       path: "/useractivity",
//     },
//     {
//       icon: <i className="ri-shield-user-fill"></i>,
//       name: "User Access",
//       path: "/useraccess",
//     },
//     {
//       icon: <i className="ri-stethoscope-fill"></i>,
//       name: "Medical Certificates",
//       path: "/all-medical-certificates",
//     },
//     {
//       icon: <i className="ri-briefcase-fill"></i>,
//       name: "Recruitment",
//       dropdown: [
//         { name: "Dashboard", path: "/recruitment-dashboard" },
//         { name: "Job Posts", path: "/jobpost" },
//         { name: "Job Applicants", path: "/job-applicants" },
//         { name: "Score Board", path: "/score" },
//         { name: "Assessments", path: "/assessment-manager" },
//         { name: "Documents", path: "/personaldocuments" },
//         { name: "Employee Journey", path: "/employee-journey" },
//       ],
//     },
//     {
//       icon: <i className="ri-map-pin-2-fill"></i>,
//       name: "Locations",
//       path: "/locationlist",
//     },
//     {
//       icon: <i className="ri-time-fill"></i>,
//       name: "Shifts",
//       path: "/shift",
//     },
//     {
//       icon: <i className="ri-logout-box-r-line"></i>,
//       name: "Logout",
//       action: handleLogout,
//     },
//   ];

//   // Handle item click to close dropdown and collapse
//   const handleItemClick = (path, action) => {
//     if (path) {
//       navigate(path);
//     }

//     if (action) {
//       action();
//     }

//     setOpenDropdown(null);

//     if (isMobile) {
//       setIsCollapsed(true);
//     }

//     if (onLinkClick) {
//       onLinkClick();
//     }
//   };

//   // Handle dropdown item click
//   const handleDropdownItemClick = (path) => {
//     navigate(path);
//     setOpenDropdown(null);

//     if (isMobile) {
//       setIsCollapsed(true);
//     }

//     if (onLinkClick) {
//       onLinkClick();
//     }
//   };

//   return (
//     <>
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-[#1E3A8A] "
//           onClick={() => {
//             setIsCollapsed(true);
//             setOpenDropdown(null);
//           }}
//         />
//       )}

//       <div
//         onMouseEnter={handleMouseEnterSidebar}
//         onMouseLeave={handleMouseLeaveSidebar}
//         className={`fixed top-0 left-0 h-full bg-[#1D4ED8] text-white z-50 transition-all duration-300 border-blue-500 border-blue-500
//         ${isMobile
//             ? isCollapsed
//               ? "-translate-x-full w-52"
//               : "translate-x-0 w-52"
//             : isCollapsed
//               ? "w-16"
//               : "w-52"
//           }`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-center px-3 font-bold tracking-tight bg-blue-700 border-blue-500 h-14">
//           {isCollapsed && !isMobile ? (
//             <span className="text-xl text-white">TM</span>
//           ) : (
//             <div className="flex flex-col w-full">
//               <span className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-0.5">
//                 Team Management
//               </span>
//               <div className="flex items-center gap-1.5">
//                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
//                 <span className="text-xs font-medium truncate text-white/80">
//                   {currentPage}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Menu */}
//         <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
//           {elements.map((item, idx) => (
//             <div key={idx}>
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isDropdownActive(item.dropdown)
//                         ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
//                         : openDropdown === item.name
//                           ? "bg-[#1E3A8A]"
//                           : "hover:bg-blue-600"
//                       }`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (item.dropdown && item.dropdown.length > 0) {
//                         navigate(item.dropdown[0].path);
//                         setOpenDropdown(null);
//                         if (isMobile) {
//                           setIsCollapsed(true);
//                         }
//                         if (onLinkClick) onLinkClick();
//                       }
//                     }}
//                   >
//                     <div className="flex items-center gap-2.5">
//                       <span className={`text-lg transition-colors duration-200 ${isDropdownActive(item.dropdown)
//                           ? "text-white"
//                           : openDropdown === item.name
//                             ? "text-white"
//                             : "text-white group-hover:text-white"
//                         }`}>
//                         {item.icon}
//                       </span>
//                       {!isCollapsed && (
//                         <span className="text-[14px] font-medium leading-none">
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
//                           className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600 rounded cursor-pointer ${isDropdownActive(item.dropdown)
//                               ? "text-white"
//                               : openDropdown === item.name
//                                 ? "text-white"
//                                 : "text-white"
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
//                     <ul className="mt-0.5 space-y-0.5">
//                       {item.dropdown.map((sub, i) => (
//                         <li key={i}>
//                           <Link
//                             to={sub.path}
//                             onClick={() => handleDropdownItemClick(sub.path)}
//                             className={`block py-1 text-[13px] transition-colors  ${isActive(sub.path)
//                                 ? "text-white font-semibold"
//                                 : "text-white hover:text-white"
//                               }`}
//                           >
//                             <div className="flex items-center gap-2">
//                               {isActive(sub.path) && (
//                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
//                 <div
//                   onClick={() => handleItemClick(item.path, item.action)}
//                   className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isActive(item.path)
//                       ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
//                       : "hover:bg-blue-600"
//                     }`}
//                 >
//                   <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
//                       ? "text-white"
//                       : "text-white group-hover:text-white"
//                     }`}>
//                     {item.icon}
//                   </span>
//                   {!isCollapsed && (
//                     <div className="flex items-center flex-1 min-w-0 gap-2">
//                       <span className="text-[14px] font-medium leading-none truncate">
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

//         {/* Footer */}
//         <div className="px-4 py-3 text-[10px] text-white border-blue-500 border-blue-500 bg-blue-700">
//           {!isCollapsed ? (
//             <div className="flex flex-col gap-0.5">
//               <div className="flex items-center justify-between">
//                 <p className="font-semibold tracking-wider text-white uppercase">System v1.2</p>
//                 <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 rounded">
//                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
//                   <span className="text-[9px] text-white font-medium">Active</span>
//                 </div>
//               </div>
//               <p>© 2026 Timely Health</p>
//             </div>
//           ) : (
//             <div className="text-center">
//               <div className="w-3 h-3 mx-auto mb-1 bg-blue-400 rounded-full animate-pulse"></div>
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
      "/all-medical-certificates": "Medical Certificates",
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
      "/permissions": "Permissions",
      "/job-applicants": "Job Applicants",
      "/score": "Score Board",
      "/assessment-manager": "Assessments",
      "/documents": "Documents",
      "/all-expensives": "Expenses",
      "/events": "Events",
      "/over-time": "Over Time",
      "/comp-off-settings": "Comp Off Settings",
      "/employee-resignation": "Resignation",
      "/holidays-calendar": "Holidays",
      "/recruitment-dashboard": "Recruitment Dashboard",
      "/personaldocuments": "Personal Documents",
      "/employee-journey": "Employee Journey",
      "/employeesissues": "Employee Issues"
    };
    return pathMap[path] || "Dashboard";
  };

  // Desktop Hover Expand/Collapse
  const handleMouseEnterSidebar = () => {
    if (!isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (!isMobile && !openDropdown) {
      setIsCollapsed(true);
    }
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
    } catch (error) { }
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
      icon: <i className="ri-calendar-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Attendance Summary", path: "/attedancesummary" },
        { name: "Attendance Records", path: "/attendancelist" },
        { name: "Today Attendance", path: "/today-attendance" },
        { name: "Absent Today", path: "/absent-today" },
        { name: "Regularization", path: "/regularization" },
      ],
    },
    {
      icon: <i className="ri-calendar-fill"></i>,
      name: "Leaves",
      path: "/leavelist",
    },
    {
      icon: <i className="ri-exchange-fill"></i>,
      name: "Comp Off Requests",
      path: "/comp-off-requests",
    },
    {
      icon: <i className="ri-calendar-fill"></i>,
      name: "Holidays",
      path: "/holidays-calendar",
    },
    {
      icon: <i className="ri-calendar-event-fill"></i>,
      name: "Events",
      path: "/events",
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
      icon: <i className="ri-time-fill"></i>,
      name: "OverTime",
      path: "/ot-claims",
    },
    // {
    //   icon: <i className="ri-settings-3-fill"></i>,
    //   name: "Comp Off",
    //   path: "/comp-off-settings",
    // },
    {
      icon: <i className="ri-user-unfollow-line"></i>,
      name: "Resignation",
      path: "/employee-resignation",
    },
    {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Expensives",
      path: "/all-expensives"
    },
    // Employee Issues Section with NEW badge and blink effect
    {
      icon: <i className="ri-error-warning-fill"></i>,
      name: "Employee Issues",
      path: "/employeesissues",
      badge: "NEW",
      blink: true
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
      icon: <i className="ri-stethoscope-fill"></i>,
      name: "Medical Certificates",
      path: "/all-medical-certificates",
    },
    {
      icon: <i className="ri-briefcase-fill"></i>,
      name: "Recruitment",
      dropdown: [
        { name: "Dashboard", path: "/recruitment-dashboard" },
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
          className="fixed inset-0 z-40 bg-[#1E3A8A] "
          onClick={() => {
            setIsCollapsed(true);
            setOpenDropdown(null);
          }}
        />
      )}

      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed top-0 left-0 h-full bg-[#1D4ED8] text-white z-50 transition-all duration-300 border-blue-500 border-blue-500
        ${isMobile
            ? isCollapsed
              ? "-translate-x-full w-52"
              : "translate-x-0 w-52"
            : isCollapsed
              ? "w-16"
              : "w-52"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-3 font-bold tracking-tight bg-blue-700 border-blue-500 h-14">
          {isCollapsed && !isMobile ? (
            <span className="text-xl text-white">TM</span>
          ) : (
            <div className="flex flex-col w-full">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-white mb-0.5">
                Team Management
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-xs font-medium truncate text-white/80">
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
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isDropdownActive(item.dropdown)
                        ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
                        : openDropdown === item.name
                          ? "bg-[#1E3A8A]"
                          : "hover:bg-blue-600"
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
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg transition-colors duration-200 ${isDropdownActive(item.dropdown)
                          ? "text-white"
                          : openDropdown === item.name
                            ? "text-white"
                            : "text-white group-hover:text-white"
                        }`}>
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
                          className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600 rounded cursor-pointer ${isDropdownActive(item.dropdown)
                              ? "text-white"
                              : openDropdown === item.name
                                ? "text-white"
                                : "text-white"
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
                            onClick={() => handleDropdownItemClick(sub.path)}
                            className={`block py-1 text-[13px] transition-colors  ${isActive(sub.path)
                                ? "text-white font-semibold"
                                : "text-white hover:text-white"
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              {isActive(sub.path) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
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
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 relative ${isActive(item.path)
                      ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
                      : "hover:bg-blue-600"
                    }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
                      ? "text-white"
                      : "text-white group-hover:text-white"
                    }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-[14px] font-medium leading-none truncate">
                        {item.name}
                      </span>
                      {/* Badge with Blink Effect */}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full ${item.blink ? 'animate-pulse' : ''}`}>
                          {item.badge}
                        </span>
                      )}
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
        <div className="px-4 py-3 text-[10px] text-white border-blue-500 border-blue-500 bg-blue-700">
          {!isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wider text-white uppercase">System v1.2</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-[9px] text-white font-medium">Active</span>
                </div>
              </div>
              <p>© 2026 Timely Health</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 bg-blue-400 rounded-full animate-pulse"></div>
              <span>©</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;