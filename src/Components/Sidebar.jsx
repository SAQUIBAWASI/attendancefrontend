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
    { icon: <i className="ri-user-fill"></i>, name: "Employees", path: "/employeelist" },
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
      path: "/leavelist"
    },
    //   {
    //   icon: <i className="ri-calendar-close-fill"></i>,
    //   name: "Emp Management",
    //   path: "/empmanagement"
    // },
    { icon: <i className="ri-money-dollar-box-fill"></i>, name: "Payroll", path: "/payroll" },
      { icon: <i className="ri-user-fill"></i>, name: "User Activity", path: "/useractivity" },
    { icon: <i className="ri-file-chart-fill"></i>, name: "Reports", path: "/leaves-report" },
    { icon: <i className="ri-map-pin-2-fill"></i>, name: "Locations", path: "/locationlist" },
    { icon: <i className="ri-time-fill"></i>, name: "Shifts", path: "/shift" },
    { icon: <i className="ri-logout-box-fill"></i>, name: "Logout", action: handleLogout },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={handleAnyClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#1E40AF] text-white z-50 transition-all duration-300 border-r border-blue-800/50
        ${isMobile
            ? isCollapsed ? "-translate-x-full w-52" : "translate-x-0 w-52"
            : isCollapsed ? "w-16" : "w-52"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-14 font-bold tracking-tight bg-blue-900/40 border-b border-blue-700/50">
          <div className="flex items-center gap-2 overflow-hidden px-4">
            {isCollapsed && !isMobile ? (
              <span className="text-xl text-emerald-300">TM</span>
            ) : (
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-blue-100">Team Management</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
          {elements.map((item, idx) => (
            <div key={idx}>
              {/* WITH DROPDOWN */}
              {item.dropdown ? (
                <>
                  <div
                    className={`group flex items-center justify-between px-3 py-1.5 transition-all duration-200 rounded-md hover:bg-blue-700/60 cursor-pointer ${openDropdown === item.name ? 'bg-blue-700/60' : ''}`}
                    onClick={() => {
                      navigate(item.dropdown[0].path);
                      handleAnyClick();
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg transition-colors duration-200 ${openDropdown === item.name ? 'text-emerald-300' : 'text-blue-100 group-hover:text-emerald-300'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-[14px] font-normal leading-none">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <FaChevronDown
                        onClick={(e) => toggleDropdown(e, item.name)}
                        className={`text-[9px] text-blue-300 transition-transform duration-300 hover:text-white
                          ${openDropdown === item.name ? "rotate-180" : ""}
                        `}
                      />
                    )}
                  </div>

                  {/* DROPDOWN ITEMS */}
                  {openDropdown === item.name && !isCollapsed && (
                    <ul className="mt-0.5 ml-9 space-y-0.5 relative before:absolute before:left-[-1.1rem] before:top-0 before:bottom-1 before:w-[1px] before:bg-blue-700">
                      {item.dropdown.map((sub, i) => (
                        <li key={i}>
                          <Link
                            to={sub.path}
                            onClick={handleAnyClick}
                            className="block py-1 text-[13px] text-blue-100 hover:text-emerald-300 transition-colors relative before:absolute before:left-[-1.1rem] before:top-1/2 before:w-2 before:h-[1px] before:bg-blue-700"
                          >
                            {sub.name}
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
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-700/60"
                >
                  <span className="text-lg text-blue-100 group-hover:text-emerald-300 transition-colors">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-[14px] font-normal leading-none">
                      {item.name}
                    </span>
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
              <p className="font-semibold uppercase tracking-wider text-blue-200/80">System v1.2</p>
              <p>© 2026 Timely Health</p>
            </div>
          ) : (
            <span className="text-center w-full block">©</span>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
