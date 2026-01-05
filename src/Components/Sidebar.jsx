// import axios from "axios";
// import { useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = ({ isCollapsed, isMobile }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const navigate = useNavigate();

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//       localStorage.removeItem("employeeEmail");
//       localStorage.removeItem("employeeId");
//       localStorage.removeItem("token");
//       navigate("/admin-login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       localStorage.clear();
//       navigate("/admin-login");
//     }
//   };

//   const elements = [
//     { icon: <i className="text-white ri-dashboard-fill"></i>, name: "Dashboard", path: "/dashboard" },
//     {
//       icon: <i className="text-white ri-user-fill"></i>,
//       name: "Employees",
//       dropdown: [
//         { name: "Add Employee", path: "/addemployee" },
//         { name: "Employee List", path: "/employeelist" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-calendar-check-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "AttendanceSummary", path: "/attedancesummary" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         { name: "Late Today", path: "/late-today" },
//         { name: "Absent Today", path: "/absent-today" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-calendar-close-fill"></i>,
//       name: "Leave Management",
//       dropdown: [
//         { name: "Leave Requests", path: "/leavelist" },
//         { name: "Leave Reports", path: "/leaves-report" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-money-dollar-box-fill"></i>, // use any icon you like
//       name: "Payroll",
//       dropdown: [
//         { name: "Generate Payroll", path: "/payroll" },
      
//       ],
//     },

//     {
//       icon: <i className="text-white ri-file-chart-fill"></i>,
//       name: "Reports",
//       dropdown: [
//         { name: "Attendance Report", path: "/attendancelist" },
//         { name: "Leave Report", path: "/leaves-report" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-user-settings-fill"></i>,
//       name: "Roles & Permissions",
//       dropdown: [
//         { name: "Role Management", path: "/role-management" },
//         { name: "Permission Settings", path: "/permission-settings" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-map-pin-2-fill"></i>,
//       name: "Locations",
//       dropdown: [
//         { name: "Add Location", path: "/addlocation" },
//         { name: "Location List", path: "/locationlist" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-time-fill"></i>,
//       name: "Shifts",
//       dropdown: [
//         { name: "Shift Management", path: "/shift" },
//         { name: "Shift List", path: "/shiftlist" },
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
//       {/* Overlay for mobile (click outside to close) */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-black bg-opacity-50"
//           onClick={() => {
//             const event = new Event("collapseSidebar");
//             window.dispatchEvent(event);
//           }}
//         ></div>
//       )}

//       {/* Sidebar container */}
//       <div
//         className={`fixed md:static top-0 left-0 h-full flex flex-col bg-blue-800 text-white transition-all duration-300 ease-in-out z-50
//         ${isMobile
//             ? isCollapsed
//               ? "-translate-x-full w-64"
//               : "translate-x-0 w-64"
//             : isCollapsed
//               ? "w-16"
//               : "w-64"
//           }`}
//       >
//         {/* Header */}
//         <div className="sticky top-0 flex items-center justify-center p-4 text-xl font-bold bg-blue-900 shadow-sm">
//           <span className="truncate">
//             {isCollapsed && !isMobile ? "AD" : "Team Management System"}
//           </span>
//         </div>

//         <div className="my-2 border-b border-gray-700"></div>

//         {/* Navigation */}
//         <nav
//           className={`flex-1 overflow-y-auto no-scrollbar space-y-2 px-2 ${isCollapsed && !isMobile ? "items-center" : ""
//             }`}
//         >
//           {elements.map((item, idx) => (
//             <div key={idx}>
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
//                     onClick={() => toggleDropdown(item.name)}
//                   >
//                     <span className="text-lg">{item.icon}</span>
//                     <span
//                       className={`ml-4 flex-1 ${isCollapsed && !isMobile ? "hidden" : "block"
//                         }`}
//                     >
//                       {item.name}
//                     </span>
//                     <FaChevronDown
//                       className={`text-xs transition-transform duration-300 ${openDropdown === item.name ? "rotate-180" : "rotate-0"
//                         } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
//                     />
//                   </div>

//                   {/* Dropdown menu */}
//                   {openDropdown === item.name && (
//                     <ul
//                       className={`ml-8 space-y-1 ${isCollapsed && !isMobile ? "hidden" : "block"
//                         }`}
//                     >
//                       {item.dropdown.map((subItem, subIdx) => (
//                         <li key={subIdx}>
//                           <Link
//                             to={subItem.path}
//                             className="block py-2 pl-2 text-sm hover:text-[#00B074] transition"
//                             onClick={() => setOpenDropdown(null)}
//                           >
//                             • {subItem.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               ) : (
//                 <Link
//                   to={item.path || "#"}
//                   onClick={item.action ? item.action : null}
//                   className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
//                 >
//                   <span className="text-lg">{item.icon}</span>
//                   <span
//                     className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"
//                       }`}
//                   >
//                     {item.name}
//                   </span>
//                 </Link>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* Footer (optional) */}
//         <div className="p-3 text-xs text-center text-gray-300 border-t border-gray-700">
//           © 2025 Attendance System
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;

// import axios from "axios";
// import { useState } from "react";
// import { FaChevronDown } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = ({ isCollapsed, isMobile, onLinkClick }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const navigate = useNavigate();

//   const toggleDropdown = (name) => {
//     setOpenDropdown(openDropdown === name ? null : name);
//   };

//   // Auto close function for ALL devices
//   const handleAnyClick = () => {
//     console.log("Closing sidebar");
//     if (onLinkClick) {
//       onLinkClick(); // Close sidebar on all devices
//     }
//     setOpenDropdown(null); // Close dropdown
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(
//         "https://credenhealth.onrender.com/api/admin/logout",
//         {},
//         { withCredentials: true }
//       );
//       localStorage.removeItem("employeeEmail");
//       localStorage.removeItem("employeeId");
//       localStorage.removeItem("token");
//       navigate("/admin-login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       localStorage.clear();
//       navigate("/admin-login");
//     }
//   };

//   const elements = [
//     { icon: <i className="text-white ri-dashboard-fill"></i>, name: "Dashboard", path: "/dashboard" },
//     {
//       icon: <i className="text-white ri-user-fill"></i>,
//       name: "Employees",
//       dropdown: [
//         { name: "Add Employee", path: "/addemployee" },
//         { name: "Employee List", path: "/employeelist" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-calendar-check-fill"></i>,
//       name: "Attendance",
//       dropdown: [
//         { name: "Attendance Records", path: "/attendancelist" },
//         { name: "AttendanceSummary", path: "/attedancesummary" },
//         { name: "Today Attendance", path: "/today-attendance" },
//         // { name: "Late Today", path: "/late-today" },
//         { name: "Absent Today", path: "/absent-today" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-calendar-close-fill"></i>,
//       name: "Leave Management",
//       dropdown: [
//         { name: "Leave Requests", path: "/leavelist" },
//         { name: "Leave Reports", path: "/leaves-report" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-money-dollar-box-fill"></i>,
//       name: "Payroll",
//       dropdown: [
//         { name: "Generate Payroll", path: "/payroll" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-file-chart-fill"></i>,
//       name: "Reports",
//       dropdown: [
//         { name: "Attendance Report", path: "/attendancelist" },
//         { name: "Leave Report", path: "/leaves-report" },
//       ],
//     },
//     // {
//     //   icon: <i className="text-white ri-user-settings-fill"></i>,
//     //   name: "Roles & Permissions",
//     //   dropdown: [
//     //     { name: "Role Management", path: "/role-management" },
//     //     { name: "Permission Settings", path: "/permission-settings" },
//     //   ],
//     // },
//     {
//       icon: <i className="text-white ri-map-pin-2-fill"></i>,
//       name: "Locations",
//       dropdown: [
//         { name: "Add Location", path: "/addlocation" },
//         { name: "Location List", path: "/locationlist" },
//       ],
//     },
//     {
//       icon: <i className="text-white ri-time-fill"></i>,
//       name: "Shifts",
//       dropdown: [
//         { name: "Shift Management", path: "/shift" },
//         { name: "Shift List", path: "/shiftlist" },
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
//       {/* Overlay for mobile (click outside to close) */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-40 bg-black bg-opacity-50"
//           onClick={handleAnyClick}
//         ></div>
//       )}

//       {/* Sidebar container - Fixed width issues */}
//       <div
//         className={`fixed top-0 left-0 h-full flex flex-col bg-blue-800 text-white transition-all duration-300 ease-in-out z-50
//         ${isMobile
//             ? isCollapsed
//               ? "-translate-x-full w-64"
//               : "translate-x-0 w-64"
//             : isCollapsed
//               ? "w-16"
//               : "w-64"
//           }`}
//       >
//         {/* Header */}
//         <div className="sticky top-0 flex items-center justify-center p-4 text-xl font-bold bg-blue-900 shadow-sm">
//           <span className="truncate">
//             {isCollapsed && !isMobile ? "AD" : "Team Management System"}
//           </span>
//         </div>

//         <div className="my-2 border-b border-gray-700"></div>

//         {/* Navigation */}
//         <nav
//           className={`flex-1 overflow-y-auto no-scrollbar space-y-2 px-2 ${isCollapsed && !isMobile ? "items-center" : ""
//             }`}
//         >
//           {elements.map((item, idx) => (
//             <div key={idx}>
//               {item.dropdown ? (
//                 <>
//                   <div
//                     className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
//                     onClick={() => toggleDropdown(item.name)}
//                   >
//                     <span className="text-lg">{item.icon}</span>
//                     <span
//                       className={`ml-4 flex-1 ${isCollapsed && !isMobile ? "hidden" : "block"
//                         }`}
//                     >
//                       {item.name}
//                     </span>
//                     <FaChevronDown
//                       className={`text-xs transition-transform duration-300 ${openDropdown === item.name ? "rotate-180" : "rotate-0"
//                         } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
//                     />
//                   </div>

//                   {/* Dropdown menu */}
//                   {openDropdown === item.name && (
//                     <ul
//                       className={`ml-8 space-y-1 ${isCollapsed && !isMobile ? "hidden" : "block"
//                         }`}
//                     >
//                       {item.dropdown.map((subItem, subIdx) => (
//                         <li key={subIdx}>
//                           <Link
//                             to={subItem.path}
//                             className="block py-2 pl-2 text-sm hover:text-[#00B074] transition"
//                             onClick={handleAnyClick}
//                           >
//                             • {subItem.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               ) : (
//                 <div
//                   onClick={() => {
//                     if (item.path) {
//                       navigate(item.path);
//                     }
//                     if (item.action) {
//                       item.action();
//                     }
//                     handleAnyClick();
//                   }}
//                   className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
//                 >
//                   <span className="text-lg">{item.icon}</span>
//                   <span
//                     className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"
//                       }`}
//                   >
//                     {item.name}
//                   </span>
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* Footer */}
//         <div className="p-3 text-xs text-center text-gray-300 border-t border-gray-700">
//           © 2025 Attendance System
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;


import axios from "axios";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile, onLinkClick }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  // Toggle dropdown ONLY from arrow
  const toggleDropdown = (e, name) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close sidebar + dropdown
  const handleAnyClick = () => {
    if (onLinkClick) onLinkClick();
    setOpenDropdown(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      navigate("/admin-login");
    } catch (error) {
      localStorage.clear();
      navigate("/admin-login");
    }
  };

  const elements = [
    { icon: <i className="ri-dashboard-fill"></i>, name: "Dashboard", path: "/dashboard" },

    {
      icon: <i className="ri-user-fill"></i>,
      name: "Employees",path: "/employeelist" },
    //   dropdown: [
    //     { name: "Employee List", path: "/employeelist" },
    //     // { name: "Add Employee", path: "/addemployee" },
    //   ],
    // },
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
      name: "Leave Management",path: "/leavelist" },
    //   dropdown: [
    //     { name: "Leave Reports", path: "/leaves-report" },
    //     { name: "Leave Requests", path: "/leavelist" },
        
    //   ],
    // },
    {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Payroll",path: "/payroll" },
    //   dropdown: [{ name: "Generate Payroll", path: "/payroll" }],
    // },
    {
      icon: <i className="ri-file-chart-fill"></i>,
      name: "Reports",path: "/leaves-report" },
    //   dropdown: [
    //      { name: "Leave Report", path: "/leaves-report" },
    //     { name: "Attendance Report", path: "/attendancelist" },
       
    //   ],
    // },
    {
      icon: <i className="ri-map-pin-2-fill"></i>,
      name: "Locations",path: "/locationlist" },
    //   dropdown: [
    //     { name: "Location List", path: "/locationlist" },
    //     { name: "Add Location", path: "/addlocation" },
       
    //   ],
    // },
    {
      icon: <i className="ri-time-fill"></i>,
      name: "Shifts", path: "/shiftlist" },
    //   dropdown: [
    //     { name: "Shift List", path: "/shiftlist" },
    //     { name: "Shift Management", path: "/shift" },
       
    //   ],
    // },
    {
      icon: <i className="ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={handleAnyClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-blue-800 text-white z-50 transition-all duration-300
        ${isMobile
            ? isCollapsed ? "-translate-x-full w-64" : "translate-x-0 w-64"
            : isCollapsed ? "w-16" : "w-64"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 font-bold bg-blue-900">
          {isCollapsed && !isMobile ? "AD" : "Team Management System"}
        </div>

        {/* Menu */}
        <nav className="px-2 py-4 space-y-2">
          {elements.map((item, idx) => (
            <div key={idx}>
              {/* WITH DROPDOWN */}
              {item.dropdown ? (
                <>
                  <div className="flex items-center justify-between px-3 py-3 transition rounded-lg hover:bg-blue-700">

                    {/* NAME CLICK → FIRST PAGE */}
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        navigate(item.dropdown[0].path);
                        handleAnyClick();
                      }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>

                    {/* ARROW CLICK → DROPDOWN */}
                    {!isCollapsed && (
                      <FaChevronDown
                        onClick={(e) => toggleDropdown(e, item.name)}
                        className={`text-xs cursor-pointer transition-transform
                          ${openDropdown === item.name ? "rotate-180" : ""}
                        `}
                      />
                    )}
                  </div>

                  {/* DROPDOWN ITEMS */}
                  {openDropdown === item.name && !isCollapsed && (
                    <ul className="mt-1 ml-10 space-y-1">
                      {item.dropdown.map((sub, i) => (
                        <li key={i}>
                          <Link
                            to={sub.path}
                            onClick={handleAnyClick}
                            className="block py-2 text-sm hover:text-[#00B074]"
                          >
                            • {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
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
                  className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full py-3 text-xs text-center text-gray-300 border-t border-blue-700">
          © 2025 Attendance System
        </div>
      </div>
    </>
  );
};

export default Sidebar;
