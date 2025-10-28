import axios from "axios";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/admin/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("employeeEmail");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("token");
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/admin-login");
    }
  };

  const elements = [
    { icon: <i className="text-white ri-dashboard-fill"></i>, name: "Dashboard", path: "/dashboard" },
    {
      icon: <i className="text-white ri-user-fill"></i>,
      name: "Employees",
      dropdown: [
        { name: "Add Employee", path: "/addemployee" },
        { name: "Employee List", path: "/employeelist" },
      ],
    },
    {
      icon: <i className="text-white ri-calendar-check-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Attendance Records", path: "/attendancelist" },
        { name: "Today Attendance", path: "/today-attendance" },
        { name: "Late Today", path: "/late-today" },
        { name: "Absent Today", path: "/absent-today" },
      ],
    },
    {
      icon: <i className="text-white ri-calendar-close-fill"></i>,
      name: "Leave Management",
      dropdown: [
        { name: "Leave Requests", path: "/leavelist" },
        { name: "Leave Reports", path: "/leaves-report" },
      ],
    },
    {
      icon: <i className="text-white ri-file-chart-fill"></i>,
      name: "Reports",
      dropdown: [
        { name: "Attendance Report", path: "/attendancelist" },
        { name: "Leave Report", path: "/leaves-report" },
      ],
    },
    {
      icon: <i className="text-white ri-user-settings-fill"></i>,
      name: "Roles & Permissions",
      dropdown: [
        { name: "Role Management", path: "/role-management" },
        { name: "Permission Settings", path: "/permission-settings" },
      ],
    },
    {
      icon: <i className="text-white ri-map-pin-2-fill"></i>,
      name: "Locations",
      dropdown: [
        { name: "Add Location", path: "/addlocation" },
        { name: "Location List", path: "/locationlist" },
      ],
    },
    {
      icon: <i className="text-white ri-settings-3-fill"></i>,
      name: "Settings",
      dropdown: [
        { name: "Shift Management", path: "/shift" },
        { name: "Shift List", path: "/shiftlist" },
        // { name: "Assign Location", path: "/assignlocation" },
        // { name: "Admin Employee Locations", path: "/admin-employee-locations" },
      ],
    },
    {
      icon: <i className="text-white ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <>
      {/* Overlay for mobile (click outside to close) */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            const event = new Event("collapseSidebar");
            window.dispatchEvent(event);
          }}
        ></div>
      )}

      {/* Sidebar container */}
      <div
        className={`fixed md:static top-0 left-0 h-full flex flex-col bg-blue-800 text-white transition-all duration-300 ease-in-out z-50
        ${isMobile
            ? isCollapsed
              ? "-translate-x-full w-64"
              : "translate-x-0 w-64"
            : isCollapsed
              ? "w-16"
              : "w-64"
          }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-center items-center p-4 text-xl font-bold bg-blue-900 shadow-sm">
          <span className="truncate">
            {isCollapsed && !isMobile ? "AD" : "Attendance System"}
          </span>
        </div>

        <div className="my-2 border-b border-gray-700"></div>

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto no-scrollbar space-y-2 px-2 ${isCollapsed && !isMobile ? "items-center" : ""
            }`}
        >
          {elements.map((item, idx) => (
            <div key={idx}>
              {item.dropdown ? (
                <>
                  <div
                    className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
                    onClick={() => toggleDropdown(item.name)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span
                      className={`ml-4 flex-1 ${isCollapsed && !isMobile ? "hidden" : "block"
                        }`}
                    >
                      {item.name}
                    </span>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                        } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                    />
                  </div>

                  {/* Dropdown menu */}
                  {openDropdown === item.name && (
                    <ul
                      className={`ml-8 space-y-1 ${isCollapsed && !isMobile ? "hidden" : "block"
                        }`}
                    >
                      {item.dropdown.map((subItem, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            to={subItem.path}
                            className="block py-2 pl-2 text-sm hover:text-[#00B074] transition"
                            onClick={() => setOpenDropdown(null)}
                          >
                            • {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path || "#"}
                  onClick={item.action ? item.action : null}
                  className="flex items-center py-3 px-3 font-semibold text-sm rounded-lg hover:bg-blue-700 hover:text-[#00B074] transition cursor-pointer"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span
                    className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"
                      }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer (optional) */}
        <div className="p-3 text-center text-xs text-gray-300 border-t border-gray-700">
          © 2025 Attendance System
        </div>
      </div>
    </>
  );
};

export default Sidebar;
