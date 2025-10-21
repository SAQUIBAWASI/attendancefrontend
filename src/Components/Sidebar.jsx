import axios from "axios";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);


  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // const handleLogout = async () => {
  //   try {
  //     await axios.post(
  //       "https://credenhealth.onrender.com/api/admin/logout",
  //       {},
  //       { withCredentials: true }
  //     );
  //     localStorage.removeItem("authToken");
  //     alert("Logout successful");
  //     window.location.href = "/";
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     alert("Logout failed. Please try again.");
  //   }
  // };

  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    // Call employee logout API if you have one
    await axios.post(
      "https://credenhealth.onrender.com/api/admin/logout",
      {}, 
      { withCredentials: true }
    );

    // Clear localStorage
    localStorage.removeItem("employeeEmail");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("token");

    // Redirect to login page
    navigate("/admin-login");
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback: still clear storage & redirect even if API fails
    localStorage.clear();
    navigate("/admin-login");
  }
};


  const elements = [
    {
      icon: <i className="text-white ri-dashboard-fill"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    // {
    //   icon: <i className="text-white ri-dashboard-fill"></i>,
    //   name: "EmployeeDashboard",
    //   path: "/employeedashboard",
    // },
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
        { name: "Today Attendance ", path: "/today-attendance" },
        // { name: "Pendings Attendance", path: "/pendings-attendance" },
        { name: "Late Today", path: "/late-today" },
        { name: "Absent Today", path: "/absent-today" },
      ],
    },
    {
      icon: <i className="text-white ri-calendar-close-fill"></i>,
      name: "Leave Management",
      dropdown: [
        { name: "Leave Requests", path: "/leavelist" },
        { name: "Leave Reports ", path: "/leaves-report" },
        // { name: "Leave Balance", path: "/leave-balance" },
        // { name: "Leave Application", path: "/leave-application" },
      ],
    },
    {
      icon: <i className="text-white ri-file-chart-fill"></i>,
      name: "Reports",
      dropdown: [
        { name: "Attendance Report", path: "/attendancelist" },
        { name: "Leave Report", path: "/leaves-report" },
        // { name: "Monthly Summary", path: "/monthly-summary" },
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
      icon: <i className="text-white ri-settings-3-fill"></i>,
      name: "Settings",
      dropdown: [
        // { name: "Attendance Settings", path: "/attendance-settings" },
        { name: "Shift Management", path: "/shift" },
        { name: "Shift List", path: "/shiftlist" },
        // { name: "Holiday Calendar", path: "/holiday-calendar" },
      ],
    },
    {
      icon: <i className="text-white ri-logout-box-fill"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${
        isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
      } h-screen overflow-y-scroll no-scrollbar flex flex-col bg-blue-800`}
    >
      <div className="sticky top-0 flex justify-center p-4 text-xl font-bold text-white">
        <span>{isCollapsed && !isMobile ? "AD" : "Attendance System"}</span>
      </div>
      <div className="my-2 border-b-4 border-gray-800"></div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${
                      openDropdown === item.name ? "rotate-180" : "rotate-0"
                    } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className={`text-sm text-white space-y-1 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline ml-10"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;