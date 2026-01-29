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

import axios from "axios";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const EmployeeSidebar = ({ isCollapsed, isMobile, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/employeedashboard");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
    };

    return pathMap[path] || "Dashboard";
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
    setOpenDropdown(openDropdown === name ? null : name);
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
        "https://credenhealth.onrender.com/api/employees/logout",
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

  const elements = [
    {
      icon: <i className="ri-dashboard-fill"></i>,
      name: "Dashboard",
      path: "/employeedashboard",
      exact: true
    },

    {
      icon: <i className="ri-calendar-close-fill"></i>,
      name: "Leave",
      path: "/leave-application"
    },
    {
      icon: <i className="ri-calendar-close-fill"></i>,
      name: "My Permissions",
      path: "/mypermissions"
    },
    {
      icon: <i className="ri-file-chart-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Check In", path: "/attendance-capture" },
        { name: "Attendance Report", path: "/myattendance" },
        { name: "My Shift", path: "/my-shift" },
        { name: "My Assigned Location", path: "/mylocation" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-box-fill"></i>,
      name: "Salary",
      path: "/mysalary"
    },
    {
      icon: <i className="ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout
    },
  ];

  return (
    <>
      {/* Mobile Overlay - FIXED Z-INDEX */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40"
          onClick={handleAnyClick}
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

      {/* Sidebar - FIXED Z-INDEX */}
      <div
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
                    className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md cursor-pointer ${isDropdownActive(item.dropdown)
                      ? 'bg-emerald-600/80 text-white shadow-lg'
                      : openDropdown === item.name
                        ? 'bg-blue-700/70'
                        : 'hover:bg-blue-700/60'
                      }`}
                    onClick={() => {
                      navigate(item.dropdown[0].path);
                      handleAnyClick();
                    }}
                    onMouseEnter={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseMove={(e) => isCollapsed && !isMobile && handleMouseMove(e, item.name)}
                    onMouseLeave={() => isCollapsed && !isMobile && setHoveredItem(null)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg transition-colors duration-200 ${isDropdownActive(item.dropdown)
                        ? 'text-white'
                        : openDropdown === item.name
                          ? 'text-emerald-300'
                          : 'text-blue-100 group-hover:text-emerald-300'
                        }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className={`text-[14px] font-medium leading-none ${isDropdownActive(item.dropdown) ? 'text-white' : ''
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
                          className={`text-xs transition-transform duration-300 p-0 hover:bg-blue-600/50 rounded cursor-pointer ${isDropdownActive(item.dropdown)
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
                            <Link
                              to={sub.path}
                              onClick={handleAnyClick}
                              className={`flex items-center gap-2.5 py-1.5 px-0 text-[13px] transition-colors rounded ${isActive(sub.path)
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
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${isActive(item.path)
                    ? 'bg-emerald-600/80 text-white shadow-lg'
                    : 'hover:bg-blue-700/60'
                    }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${isActive(item.path)
                    ? 'text-white'
                    : 'text-blue-100 group-hover:text-emerald-300'
                    }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className={`text-[14px] font-medium leading-none truncate ${isActive(item.path) ? 'text-white' : ''
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




