// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config";

// const EmployeeSidebar = ({ isCollapsed, setIsCollapsed, isMobile, onClose }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [currentPage, setCurrentPage] = useState("Dashboard");
//   const [activeItem, setActiveItem] = useState("/employeedashboard");
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
//   const [isHovering, setIsHovering] = useState(false);

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
//       "/emp-all-expensives-management": "Expense Management",
//       "/emp-job-posts": "Job Posts",
//       "/emp-job-applicants": "Job Applicants",
//       "/emp-score-board": "Score Board",
//       "/emp-assessments": "Assessments",
//       "/emp-documents": "Documents",
//       "/emp-my-jobs": "My Jobs",
//       "/emp-personal-documents": "Personal Documents",
//       "/emp-letters": "My Letters",
//     };

//     return pathMap[path] || "Dashboard";
//   };

//   // Desktop Hover Expand
//   const handleMouseEnterSidebar = () => {
//     if (!isMobile && setIsCollapsed) {
//       setIsHovering(true);
//       setIsCollapsed(false);
//     }
//   };

//   const handleMouseLeaveSidebar = () => {
//     if (!isMobile && setIsCollapsed) {
//       setIsHovering(false);
//       if (!openDropdown) {
//         setIsCollapsed(true);
//       }
//     }
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
//     e.preventDefault();

//     if (openDropdown !== name) {
//       if (!isMobile && isCollapsed && setIsCollapsed) {
//         setIsCollapsed(false);
//       }
//       setOpenDropdown(name);
//     } else {
//       setOpenDropdown(null);
//     }
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
//     if (permission === "ALLOW_ALWAYS") return true;
//     if (loading) return false;
//     if (!permissions || permissions.length === 0) return false;
//     return permissions.includes(permission);
//   };

//   // Build the final elements with merged dropdowns
//   const buildElements = () => {
//     const enhancedElements = [];

//     // 1. ALWAYS SHOW DASHBOARD
//     enhancedElements.push({
//       icon: <i className="ri-dashboard-fill"></i>,
//       name: "Dashboard",
//       path: "/employeedashboard",
//       permission: "ALLOW_ALWAYS"
//     });

//     // 2. ALWAYS SHOW MY PERMISSIONS
//     // enhancedElements.push({
//     //   icon: <i className="ri-shield-keyhole-fill"></i>,
//     //   name: "My Permissions",
//     //   path: "/mypermissions",
//     //   permission: "ALLOW_ALWAYS"
//     // });

//     // 3. ATTENDANCE DROPDOWN
//     const attendanceDropdown = {
//       icon: <i className="ri-file-chart-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Check In", path: "/attendance-capture", permission: "ALLOW_ALWAYS" },
//         { name: " My Attendance", path: "/myattendance", permission: "ALLOW_ALWAYS" },
//         { name: "My Shift", path: "/my-shift", permission: "ALLOW_ALWAYS" },
//         { name: "My Assigned Location", path: "/mylocation", permission: "ALLOW_ALWAYS" },
//       ],
//       permission: "ALLOW_ALWAYS"
//     };

//     const hasAttendanceAdmin = hasPermission("attendance_view_all");
//     const hasShiftsManage = hasPermission("shifts_manage");

//     if (hasAttendanceAdmin || hasShiftsManage) {
//       attendanceDropdown.dropdown.push({ name: "--- Admin ---", path: "#", permission: "ALLOW_ALWAYS", disabled: true, divider: true });

//       if (hasAttendanceAdmin) {
//         attendanceDropdown.dropdown.push(
//           { name: "Attendance Summary", path: "/emp-attendance-summary", permission: "attendance_view_all" },
//           { name: "Attendance Records", path: "/emp-attendance-records", permission: "attendance_view_all" },
//           { name: "Today Attendance", path: "/emp-today-attendance", permission: "attendance_view_all" },
//           { name: "Absent Today", path: "/emp-absent-today", permission: "attendance_view_all" }
//         );
//       }

//       if (hasShiftsManage) {
//         attendanceDropdown.dropdown.push(
//           { name: "Shift Management", path: "/emp-shifts", permission: "shifts_manage" }
//         );
//       }
//     }
//     enhancedElements.push(attendanceDropdown);

//     // 4. MY LEAVES (Standalone Link)
//     enhancedElements.push({
//       icon: <i className="ri-calendar-close-fill"></i>,
//       name: "My Leaves",
//       path: "/myleaves",
//       permission: "ALLOW_ALWAYS"
//     });

//        enhancedElements.push({
//       icon: <i className="ri-wallet-3-fill"></i>,
//       name: "My Expensives",
//       path: "/expense-management",
//       permission: "ALLOW_ALWAYS"
//     });



    

//     // 4.0 PROFILE DROPDOWN (Contains My Jobs, Personal Docs and My Letters)
//     enhancedElements.push({
//       icon: <i className="ri-profile-fill"></i>,
//       name: "Profile",
//       permission: "ALLOW_ALWAYS",
//       dropdown: [
//         { name: "My Jobs", path: "/emp-my-jobs", permission: "ALLOW_ALWAYS" },
//         { name: "Personal Docs", path: "/emp-personal-documents", permission: "ALLOW_ALWAYS" },
//         { name: "My Letters", path: "/emp-letters", permission: "ALLOW_ALWAYS" },
//         {name: "My Certificate", path: "/my-medical-certificate", permission: "ALLOW_ALWAYS" }
      
//       ]
//     });

//     // 4.1 LEAVE ADMIN (Dropdown only if has permissions)
//     const hasLeaveApprove = hasPermission("leave_approve");
//     const hasReportsView = hasPermission("reports_view");

//     if (hasLeaveApprove || hasReportsView) {
//       const leaveAdminDropdown = {
//         icon: <i className="ri-calendar-event-fill"></i>,
//         name: "Leave Admin",
//         dropdown: [],
//         permission: "ALLOW_ALWAYS"
//       };

//       if (hasLeaveApprove) {
//         leaveAdminDropdown.dropdown.push({ name: "Leave Approval", path: "/emp-leaves", permission: "leave_approve" });
//       }
//       if (hasReportsView) {
//         leaveAdminDropdown.dropdown.push({ name: "Reports", path: "/emp-reports", permission: "reports_view" });
//       }

//       if (leaveAdminDropdown.dropdown.length > 0) {
//         enhancedElements.push(leaveAdminDropdown);
//       }
//     }

//     // 5. SALARY (Standalone Link)
//     enhancedElements.push({
//       icon: <i className="ri-money-dollar-box-fill"></i>,
//       name: "Salary",
//       path: "/mysalary",
//       permission: "ALLOW_ALWAYS"
//     });

//     // 5.1 PAYROLL ADMIN (Dropdown only if has permissions)
//     if (hasPermission("payroll_manage")) {
//       const payrollAdminDropdown = {
//         icon: <i className="ri-money-dollar-circle-fill"></i>,
//         name: "Payroll Admin",
//         dropdown: [
//           { name: "Payroll", path: "/emp-payroll", permission: "payroll_manage" }
//         ],
//         permission: "ALLOW_ALWAYS"
//       };

//       if (payrollAdminDropdown.dropdown.length > 0) {
//         enhancedElements.push(payrollAdminDropdown);
//       }
//     }

//     // 6. EMPLOYEE DROPDOWN
//     const employeeDropdown = {
//       icon: <i className="ri-user-fill"></i>,
//       name: "Employee",
//       dropdown: [],
//       permission: "ALLOW_ALWAYS"
//     };

//     if (hasPermission("employee_view_all")) {
//       employeeDropdown.dropdown.push(
//         { name: "Employee Management", path: "/emp-employees", permission: "employee_view_all" }
//       );
//     }
//     if (hasPermission("employee_add")) {
//       employeeDropdown.dropdown.push(
//         { name: "Add Employee", path: "/emp-add-employee", permission: "employee_add" }
//       );
//     }

//     if (employeeDropdown.dropdown.length > 0) {
//       enhancedElements.push(employeeDropdown);
//     }

//     // 7. USER MANAGEMENT (ONLY User Activity + User Access - NO EXPENSE)
//     const hasUserActivity = hasPermission("user_activity_view");
//     const hasUserAccess = hasPermission("user_access_manage");

//     if (hasUserActivity || hasUserAccess) {
//       const userManagementDropdown = {
//         icon: <i className="ri-group-fill"></i>,
//         name: "User Management",
//         permission: "ALLOW_ALWAYS",
//         dropdown: []
//       };

//       if (hasUserActivity) {
//         userManagementDropdown.dropdown.push({
//           name: "User Activity",
//           path: "/emp-user-activity",
//           permission: "user_activity_view"
//         });
//       }

//       if (hasUserAccess) {
//         userManagementDropdown.dropdown.push({
//           name: "User Access",
//           path: "/emp-user-access",
//           permission: "user_access_manage"
//         });
//       }

//       if (userManagementDropdown.dropdown.length > 0) {
//         enhancedElements.push(userManagementDropdown);
//       }
//     }

//     // 8. EXPENSE MANAGEMENT - STANDALONE ITEM
//     const hasExpensesManage = hasPermission("expenses_manage") || hasPermission("expense_manage");

//     if (hasExpensesManage) {
//       enhancedElements.push({
//         icon: <i className="ri-money-dollar-circle-fill"></i>,
//         name: "Expense Management",
//         path: "/emp-all-expensives-management",
//         permission: "ALLOW_ALWAYS"
//       });
//     }

//     // 9. LOCATIONS (Standalone)
//     if (hasPermission("locations_manage")) {
//       enhancedElements.push({
//         icon: <i className="ri-map-pin-user-fill"></i>,
//         name: "Locations",
//         path: "/emp-locations",
//         permission: "locations_manage"
//       });
//     }

//     // 10. SHIFTS (Standalone if alag chahiye)
//     if (hasPermission("shifts_manage") && !hasPermission("attendance_view_all")) {
//       enhancedElements.push({
//         icon: <i className="ri-time-fill"></i>,
//         name: "Shifts",
//         path: "/emp-shifts",
//         permission: "shifts_manage"
//       });
//     }

//     // 11. RECRUITMENT DROPDOWN
//     const hasAnyRecruitmentPermission =
//       hasPermission("job_posts_view") ||
//       hasPermission("job_applicants_view") ||
//       hasPermission("score_board_view") ||
//       hasPermission("assessments_view") ||
//       hasPermission("documents_view") ||
//       hasPermission("job_recruitment_manage");

//     if (hasAnyRecruitmentPermission) {
//       const recruitmentDropdown = {
//         icon: <i className="ri-briefcase-fill"></i>,
//         name: "Recruitment",
//         permission: "ALLOW_ALWAYS",
//         dropdown: []
//       };

//       if (hasPermission("job_posts_view")) {
//         recruitmentDropdown.dropdown.push({ name: "Job Posts", path: "/emp-job-posts", permission: "job_posts_view" });
//       }
//       if (hasPermission("job_applicants_view")) {
//         recruitmentDropdown.dropdown.push({ name: "Job Applicants", path: "/emp-job-applicants", permission: "job_applicants_view" });
//       }
//       if (hasPermission("score_board_view")) {
//         recruitmentDropdown.dropdown.push({ name: "Score Board", path: "/emp-score-board", permission: "score_board_view" });
//       }
//       if (hasPermission("assessments_view")) {
//         recruitmentDropdown.dropdown.push({ name: "Assessments", path: "/emp-assessments", permission: "assessments_view" });
//       }
//       if (hasPermission("documents_view")) {
//         recruitmentDropdown.dropdown.push({ name: "Documents", path: "/emp-documents", permission: "documents_view" });
//       }

//       if (recruitmentDropdown.dropdown.length > 0) {
//         enhancedElements.push(recruitmentDropdown);
//       }
//     }

//     // 12. MAIN DASHBOARD (Standalone)
//     if (hasPermission("dashboard_view")) {
//       enhancedElements.push({
//         icon: <i className="ri-dashboard-3-fill"></i>,
//         name: "Main Dashboard",
//         path: "/emp-admin-dashboard",
//         permission: "dashboard_view"
//       });
//     }

//     // 13. LOGOUT
//     enhancedElements.push({
//       icon: <i className="ri-logout-box-fill"></i>,
//       name: "Logout",
//       action: handleLogout,
//       permission: "ALLOW_ALWAYS"
//     });

//     return enhancedElements;
//   };

//   const elements = buildElements();

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
//           onClick={() => {
//             if (setIsCollapsed) setIsCollapsed(true);
//             setOpenDropdown(null);
//           }}
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
//         onMouseEnter={handleMouseEnterSidebar}
//         onMouseLeave={handleMouseLeaveSidebar}
//         className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 transition-all duration-300 border-r border-blue-800/50
//         ${isMobile
//             ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
//             : isCollapsed ? "w-16" : "w-52"
//           }`}
//       >
//         {/* Header */}
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
//                       if (item.dropdown && item.dropdown.length > 0) {
//                         const firstValidItem = item.dropdown.find(d => !d.disabled);
//                         if (firstValidItem) {
//                           navigate(firstValidItem.path);
//                           handleAnyClick();
//                         }
//                       }
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

//                     {!isCollapsed && item.dropdown && item.dropdown.length > 0 && (
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
//                   {openDropdown === item.name && !isCollapsed && item.dropdown && item.dropdown.length > 0 && (
//                     <div className="mt-0.5 bg-blue-900/30 rounded-lg p-1.5">
//                       <ul className="space-y-0.5">
//                         {item.dropdown.map((sub, i) => (
//                           <li key={i}>
//                             {sub.divider ? (
//                               <div className="px-2 py-1 text-[10px] text-blue-300/50 uppercase tracking-wider">
//                                 {sub.name}
//                               </div>
//                             ) : sub.disabled ? (
//                               <div className="flex items-center gap-2.5 py-1.5 px-0 text-[13px] text-blue-300/50 cursor-not-allowed">
//                                 <i className="text-xs ri-subtract-line"></i>
//                                 <span className="truncate">{sub.name}</span>
//                               </div>
//                             ) : (
//                               <Link
//                                 to={sub.path}
//                                 onClick={handleAnyClick}
//                                 className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${isActive(sub.path)
//                                   ? 'text-emerald-300 font-semibold bg-emerald-900/20'
//                                   : 'text-blue-100 hover:text-emerald-300 hover:bg-blue-800/40'
//                                   }`}
//                               >
//                                 <div className="flex items-center w-full gap-2">
//                                   {isActive(sub.path) ? (
//                                     <i className="text-xs ri-checkbox-circle-fill text-emerald-400"></i>
//                                   ) : (
//                                     <i className="text-xs text-blue-300 ri-checkbox-blank-circle-line"></i>
//                                   )}
//                                   <span className="truncate">{sub.name}</span>
//                                 </div>
//                               </Link>
//                             )}
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

//         {/* Footer */}
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
import { useCallback, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EmployeeSidebar = ({ isCollapsed, setIsCollapsed, isMobile, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/employeedashboard");
  
  // View state
  const [isAdminView, setIsAdminView] = useState(() => {
    const saved = localStorage.getItem("isAdminView");
    return saved === "true";
  });
  
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAnyAdminPermission, setHasAnyAdminPermission] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_PERMISSIONS = [
    "dashboard_view", "attendance_view_all", "shifts_manage", "leave_approve",
    "reports_view", "payroll_manage", "employee_view_all", "employee_add",
    "user_activity_view", "user_access_manage", "expenses_manage", "expense_manage",
    "locations_manage", "job_posts_view", "job_applicants_view", "score_board_view",
    "assessments_view", "documents_view", "job_recruitment_manage"
  ];

  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
    setCurrentPage(getPageNameFromPath(path));
  }, [location]);

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
      "/emp-all-expensives-management": "Expense Management",
      "/emp-job-posts": "Job Posts",
      "/emp-job-applicants": "Job Applicants",
      "/emp-score-board": "Score Board",
      "/emp-assessments": "Assessments",
      "/emp-documents": "Documents",
    };
    return pathMap[path] || "Dashboard";
  };

  // Desktop Hover Expand/Collapse
  const handleMouseEnter = () => {
    if (!isMobile && setIsCollapsed && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && setIsCollapsed && !openDropdown) {
      setIsCollapsed(true);
    }
  };

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

  const handleAnyClick = () => {
    if (onClose) onClose();
    setOpenDropdown(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/employees/logout`, {}, { withCredentials: true });
      localStorage.clear();
      localStorage.removeItem("isAdminView");
      navigate("/employee-login");
      handleAnyClick();
    } catch (error) {
      localStorage.clear();
      navigate("/employee-login");
    }
  };

  // Toggle view - switches between Employee and Admin view
  const toggleView = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!hasAnyAdminPermission) return;
    
    const newView = !isAdminView;
    setIsAdminView(newView);
    localStorage.setItem("isAdminView", newView);
    setOpenDropdown(null);
    window.dispatchEvent(new CustomEvent('viewChanged', { detail: { isAdminView: newView } }));
    
    if (newView) {
      // Navigate to first accessible admin page based on permissions
      const adminMenu = buildAdminMenu();
      const firstNavigableItem = adminMenu.find(item => item.path && item.name !== "Logout");
      const firstDropdownItem = adminMenu.find(item => item.dropdown && item.dropdown.length > 0)?.dropdown[0];
      const targetPath = firstNavigableItem ? firstNavigableItem.path : (firstDropdownItem ? firstDropdownItem.path : "/emp-admin-dashboard");
      navigate(targetPath);
    } else {
      navigate("/employeedashboard");
    }
  }, [hasAnyAdminPermission, isAdminView, navigate]);

  const goToPage = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const isActive = (path) => activeItem === path;
  const isDropdownActive = (dropdownItems) => dropdownItems?.some(item => isActive(item.path));

  useEffect(() => {
    const fetchPermissions = async () => {
      const storedId = localStorage.getItem("employeeId");
      if (!storedId || storedId === "undefined") {
        setLoading(false);
        setHasAnyAdminPermission(false);
        setIsAdminView(false);
        localStorage.setItem("isAdminView", "false");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${storedId}&t=${new Date().getTime()}`);
        let fetchedPermissions = [];
        
        if (response.data.data?.permissions) fetchedPermissions = response.data.data.permissions;
        else if (response.data.permissions) fetchedPermissions = response.data.permissions;
        
        setPermissions(fetchedPermissions);
        localStorage.setItem("employeePermissions", JSON.stringify(fetchedPermissions));
        
        const hasAdminPerm = fetchedPermissions.some(perm => ADMIN_PERMISSIONS.includes(perm));
        setHasAnyAdminPermission(hasAdminPerm);
        
        if (!hasAdminPerm) {
          setIsAdminView(false);
          localStorage.setItem("isAdminView", "false");
        }
      } catch (error) {
        const localPermissions = JSON.parse(localStorage.getItem("employeePermissions") || "[]");
        setPermissions(localPermissions);
        const hasAdminPerm = localPermissions.some(perm => ADMIN_PERMISSIONS.includes(perm));
        setHasAnyAdminPermission(hasAdminPerm);
        if (!hasAdminPerm) {
          setIsAdminView(false);
          localStorage.setItem("isAdminView", "false");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const hasPermission = (permission) => {
    if (permission === "ALLOW_ALWAYS") return true;
    if (loading) return false;
    return permissions.includes(permission);
  };

  const buildEmployeeMenu = () => [
    { icon: <i className="ri-dashboard-fill"></i>, name: "Dashboard", path: "/employeedashboard" },
    { icon: <i className="ri-shield-keyhole-fill"></i>, name: "My Permissions", path: "/mypermissions" },
    {
      icon: <i className="ri-file-chart-fill"></i>, name: "Attendance",
      dropdown: [
        { name: "Check In", path: "/attendance-capture" },
        { name: "Attendance Report", path: "/myattendance" },
        { name: "My Shift", path: "/my-shift" },
        { name: "My Assigned Location", path: "/mylocation" },
      ]
    },
    {
      icon: <i className="ri-calendar-close-fill"></i>, name: "Leave",
      dropdown: [
        { name: "My Leaves", path: "/myleaves" },
        { name: "Leave Application", path: "/leave-application" },
      ]
    },
    { icon: <i className="ri-money-dollar-box-fill"></i>, name: "My Salary", path: "/mysalary" },
    { icon: <i className="ri-logout-box-fill"></i>, name: "Logout", action: handleLogout }
  ];

  const buildAdminMenu = () => {
    const menu = [];
    
    // Dashboard (only if permission exists)
    if (hasPermission("dashboard_view")) {
      menu.push({ icon: <i className="ri-dashboard-fill"></i>, name: "Dashboard", path: "/emp-admin-dashboard" });
    }

    // Attendance Management
    const attendanceItems = [];
    if (hasPermission("attendance_view_all")) {
      attendanceItems.push(
        { name: "Attendance Summary", path: "/emp-attendance-summary" },
        { name: "Attendance Records", path: "/emp-attendance-records" },
        { name: "Today Attendance", path: "/emp-today-attendance" },
        { name: "Absent Today", path: "/emp-absent-today" }
      );
    }
    if (hasPermission("shifts_manage")) {
      attendanceItems.push({ name: "Shift Management", path: "/emp-shifts" });
    }
    if (attendanceItems.length) {
      menu.push({ icon: <i className="ri-file-chart-fill"></i>, name: "Attendance", dropdown: attendanceItems });
    }

    // Leave Management
    const leaveItems = [];
    if (hasPermission("leave_approve")) leaveItems.push({ name: "Leave Approval", path: "/emp-leaves" });
    if (hasPermission("reports_view")) leaveItems.push({ name: "Reports", path: "/emp-reports" });
    if (leaveItems.length) {
      menu.push({ icon: <i className="ri-calendar-close-fill"></i>, name: "Leave", dropdown: leaveItems });
    }

    // Payroll Management
    const salaryItems = [];
    if (hasPermission("payroll_manage")) salaryItems.push({ name: "Payroll Management", path: "/emp-payroll" });
    if (salaryItems.length) {
      menu.push({ icon: <i className="ri-money-dollar-box-fill"></i>, name: "Payroll", dropdown: salaryItems });
    }

    // Employee Management
    const employeeItems = [];
    if (hasPermission("employee_view_all")) employeeItems.push({ name: "All Employees", path: "/emp-employees" });
    if (hasPermission("employee_add")) employeeItems.push({ name: "Add Employee", path: "/emp-add-employee" });
    if (employeeItems.length) {
      menu.push({ icon: <i className="ri-user-fill"></i>, name: "Employee Management", dropdown: employeeItems });
    }

    // User Management
    const userItems = [];
    if (hasPermission("user_activity_view")) userItems.push({ name: "User Activity", path: "/emp-user-activity" });
    if (hasPermission("user_access_manage")) userItems.push({ name: "User Access", path: "/emp-user-access" });
    if (userItems.length) {
      menu.push({ icon: <i className="ri-group-fill"></i>, name: "User Management", dropdown: userItems });
    }

    // Expense Management
    if (hasPermission("expenses_manage") || hasPermission("expense_manage")) {
      menu.push({ icon: <i className="ri-money-dollar-circle-fill"></i>, name: "Expense Management", path: "/emp-all-expensives-management" });
    }
    
    // Locations
    if (hasPermission("locations_manage")) {
      menu.push({ icon: <i className="ri-map-pin-user-fill"></i>, name: "Locations", path: "/emp-locations" });
    }

    // Recruitment Management
    const recruitmentItems = [];
    if (hasPermission("job_posts_view")) recruitmentItems.push({ name: "Job Posts", path: "/emp-job-posts" });
    if (hasPermission("job_applicants_view")) recruitmentItems.push({ name: "Job Applicants", path: "/emp-job-applicants" });
    if (hasPermission("score_board_view")) recruitmentItems.push({ name: "Score Board", path: "/emp-score-board" });
    if (hasPermission("assessments_view")) recruitmentItems.push({ name: "Assessments", path: "/emp-assessments" });
    if (hasPermission("documents_view")) recruitmentItems.push({ name: "Documents", path: "/emp-documents" });
    if (recruitmentItems.length) {
      menu.push({ icon: <i className="ri-briefcase-fill"></i>, name: "Recruitment", dropdown: recruitmentItems });
    }

    menu.push({ icon: <i className="ri-logout-box-fill"></i>, name: "Logout", action: handleLogout });
    return menu;
  };

  const getCurrentMenu = () => {
    if (!hasAnyAdminPermission) return buildEmployeeMenu();
    return isAdminView ? buildAdminMenu() : buildEmployeeMenu();
  };

  const menuItems = getCurrentMenu();

  if (loading) {
    return (
      <div className="fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 w-52 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-40" 
          onClick={() => { 
            if (setIsCollapsed) setIsCollapsed(true); 
            setOpenDropdown(null); 
          }} 
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-40 transition-all duration-300 border-r border-blue-800/50
        ${isMobile 
          ? (isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52") 
          : (isCollapsed ? "w-16" : "w-52")
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b h-14 bg-blue-900/40 border-blue-700/50">
          <div className="flex items-center w-full gap-2 overflow-hidden">
            {isCollapsed && !isMobile ? (
              <span className="text-xl text-emerald-300">TM</span>
            ) : (
              <div className="flex flex-col w-full">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100 mb-0.5">
                  {hasAnyAdminPermission && isAdminView ? 'Admin Portal' : 'Employee Portal'}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-medium truncate text-blue-100/80">{currentPage}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative">
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
                      const firstValidItem = item.dropdown?.[0];
                      if (firstValidItem) goToPage(firstValidItem.path);
                      handleAnyClick();
                    }}
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
                    {!isCollapsed && item.dropdown?.length > 0 && (
                      <FaChevronDown
                        onClick={(e) => toggleDropdown(e, item.name)}
                        className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
                      />
                    )}
                  </div>
                  {/* Dropdown Items */}
                  {openDropdown === item.name && !isCollapsed && item.dropdown && (
                    <div className="mt-0.5 bg-blue-900/30 rounded-lg p-1.5">
                      <ul className="space-y-0.5">
                        {item.dropdown.map((sub, i) => (
                          <li key={i}>
                            <Link
                              to={sub.path}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                goToPage(sub.path); 
                                handleAnyClick(); 
                              }}
                              className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${
                                isActive(sub.path) 
                                  ? 'text-emerald-300 font-semibold bg-emerald-900/20' 
                                  : 'text-blue-100 hover:text-emerald-300 hover:bg-blue-800/40'
                              }`}
                            >
                              <div className="flex items-center w-full gap-2">
                                {isActive(sub.path) 
                                  ? <i className="text-xs ri-checkbox-circle-fill text-emerald-400"></i> 
                                  : <i className="text-xs text-blue-300 ri-checkbox-blank-circle-line"></i>
                                }
                                <span className="truncate">{sub.name}</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (item.path) goToPage(item.path); 
                    if (item.action) item.action(); 
                    handleAnyClick(); 
                  }}
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

        {/* Footer with View Toggle Button */}
        <div className="px-4 py-3 text-[10px] text-blue-200/60 border-t border-blue-700/50 bg-blue-900/20">
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              {hasAnyAdminPermission && (
                <button 
                  onClick={toggleView} 
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-blue-200 transition-all rounded-lg bg-blue-800/50 hover:bg-blue-700/70"
                >
                  <span className="flex items-center gap-2">
                    <i className={`${isAdminView ? 'ri-admin-fill' : 'ri-user-fill'}`}></i>
                    {isAdminView ? 'Switch to Employee View' : 'Switch to Admin View'}
                  </span>
                  <i className="ri-swap-line"></i>
                </button>
              )}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold tracking-wider uppercase text-blue-200/80">Portal v1.0</p>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${hasAnyAdminPermission && isAdminView ? 'bg-purple-600/20' : 'bg-emerald-600/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${hasAnyAdminPermission && isAdminView ? 'bg-purple-400' : 'bg-emerald-400'}`}></div>
                    <span className={`text-[9px] font-medium ${hasAnyAdminPermission && isAdminView ? 'text-purple-300' : 'text-emerald-300'}`}>
                      {hasAnyAdminPermission && isAdminView ? 'Admin Mode' : 'Employee Mode'}
                    </span>
                  </div>
                </div>
                <p>© {new Date().getFullYear()} Timely Health</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {hasAnyAdminPermission && (
                <button 
                  onClick={toggleView} 
                  className="p-1 transition-colors rounded hover:bg-blue-700/50" 
                  title={isAdminView ? 'Switch to Employee View' : 'Switch to Admin View'}
                >
                  <i className={`text-lg ${isAdminView ? 'ri-admin-fill' : 'ri-user-fill'}`}></i>
                </button>
              )}
              <div className="w-3 h-3 mx-auto mt-1 mb-1 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>©</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;
