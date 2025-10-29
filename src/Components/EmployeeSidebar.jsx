import axios from "axios";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://credenhealth.onrender.com/api/employees/logout",
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("employeeEmail");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("token");

      navigate("/employee-login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/employee-login");
    }
  };

  const elements = [
    {
      icon: <i className="text-white ri-dashboard-fill"></i>,
      name: "Employee Dashboard",
      path: "/employeedashboard",
    },
    {
      icon: <i className="text-white ri-calendar-close-fill"></i>,
      name: "Leave",
      dropdown: [
        { name: "Leave Application", path: "/leave-application" },
        { name: "My Leaves", path: "/myleaves" },
      ],
    },
    {
      icon: <i className="text-white ri-file-chart-fill"></i>,
      name: "Attendance",
      dropdown: [
        { name: "Attendance Report", path: "/myattendance" },
        { name: "Check In", path: "/attendance-capture" },
        { name: "My Shift", path: "/my-shift" },
        { name: "My AssignedLocation", path: "/mylocation" },
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
      {/* Mobile overlay background */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar container */}
      <div
        className={`fixed md:static top-0 left-0 h-screen bg-blue-800 text-white flex flex-col transition-all duration-300 ease-in-out z-50
          ${isMobile ? (isCollapsed ? "-translate-x-full" : "translate-x-0 w-64") : isCollapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-center items-center p-4 text-xl font-bold border-b border-blue-700">
          <span className="truncate text-center">
            {isCollapsed && !isMobile ? "AD" : "Team Management System"}
          </span>
        </div>

        {/* Navigation */}
        <nav
          className={`flex flex-col flex-grow overflow-y-auto no-scrollbar mt-4 space-y-1 ${
            isCollapsed && !isMobile ? "items-center" : "px-3"
          }`}
        >
          {elements.map((item, idx) => (
            <div key={idx}>
              {item.dropdown ? (
                <>
                  <div
                    onClick={() => toggleDropdown(item.name)}
                    className="flex items-center py-3 px-3 rounded-lg font-medium text-sm hover:bg-gray-700 hover:text-[#00B074] transition duration-300 cursor-pointer"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`ml-4 flex-grow ${
                        isCollapsed && !isMobile ? "hidden" : "block"
                      }`}
                    >
                      {item.name}
                    </span>
                    {!isCollapsed && (
                      <FaChevronDown
                        className={`ml-auto text-xs transform transition-transform duration-300 ${
                          openDropdown === item.name ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    )}
                  </div>

                  {/* Dropdown items */}
                  <ul
                    className={`overflow-hidden transition-all duration-300 pl-10 ${
                      openDropdown === item.name
                        ? "max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  >
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          onClick={() => {
                            setOpenDropdown(null);
                            if (isMobile) onClose();
                          }}
                          className="block py-2 text-sm font-normal hover:text-[#00B074] transition duration-200"
                        >
                          • {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => {
                    if (item.action) item.action();
                    if (isMobile) onClose();
                  }}
                  className="flex items-center py-3 px-3 rounded-lg font-medium text-sm hover:bg-gray-700 hover:text-[#00B074] transition duration-300 cursor-pointer"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={`ml-4 ${
                      isCollapsed && !isMobile ? "hidden" : "block"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
