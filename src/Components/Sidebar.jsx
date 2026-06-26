
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
      "/admin-issue-management": "Issue Management"
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
      icon: <i className="ri-time-fill"></i>,  // Changed icon to clock for OverTime
      name: "OverTime",
      path: "/over-time",
    },
    {
      icon: <i className="ri-settings-3-fill"></i>,  // Settings icon for Comp Off
      name: "Comp Off",
      path: "/comp-off-settings",
    },
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
      icon: <i className="ri-shield-user-fill"></i>,
      name: "Issue Management",
      path: "/admin-issue-management",
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
        className={`fixed top-0 left-0 h-full bg-white border-r border-[#e4e7ec] z-50 transition-all duration-300 shadow-sm
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
        <div className="flex items-center justify-center px-3 font-bold tracking-tight border-b border-[#e4e7ec] h-14">
          {isCollapsed && !isMobile ? (
            <span className="text-xl text-[#175cd3]">TM</span>
          ) : (
            <div className="flex flex-col w-full">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#667085] mb-0.5">
                Team Management
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#175cd3] animate-pulse"></div>
                <span className="text-xs font-medium truncate text-[#101828]">
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
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                      isDropdownActive(item.dropdown)
                        ? "bg-[#175cd3] text-white shadow-[0_0_10px_rgba(23,92,211,0.2)]"
                        : openDropdown === item.name
                        ? "bg-[#f0f2f5]"
                        : "hover:bg-[#f0f2f5]"
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
                      <span className={`text-lg transition-colors duration-200 ${
                        isDropdownActive(item.dropdown)
                          ? "text-white"
                          : openDropdown === item.name
                          ? "text-[#175cd3]"
                          : "text-[#667085] group-hover:text-[#101828]"
                      }`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className={`text-[14px] font-medium leading-none ${
                          isDropdownActive(item.dropdown) ? "text-white" : "text-[#101828]"
                        }`}>
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        {isDropdownActive(item.dropdown) && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                        <FaChevronDown
                          onClick={(e) => toggleDropdown(e, item.name)}
                          className={`text-xs transition-transform duration-300 p-0 hover:bg-[#e4e7ec] rounded cursor-pointer ${
                            isDropdownActive(item.dropdown)
                              ? "text-white"
                              : openDropdown === item.name
                              ? "text-[#667085]"
                              : "text-[#667085]"
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
                            className={`block py-1 text-[13px] transition-colors pl-8 ${
                              isActive(sub.path)
                                ? "text-[#175cd3] font-semibold"
                                : "text-[#667085] hover:text-[#101828]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isActive(sub.path) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#175cd3]"></div>
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
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-[#175cd3] text-white shadow-[0_0_10px_rgba(23,92,211,0.2)]"
                      : "hover:bg-[#f0f2f5]"
                  }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-[#667085] group-hover:text-[#101828]"
                  }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className={`text-[14px] font-medium leading-none truncate ${
                        isActive(item.path) ? "text-white" : "text-[#101828]"
                      }`}>
                        {item.name}
                      </span>
                      {isActive(item.path) && (
                        <div className="w-2 h-2 ml-auto rounded-full bg-white animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 text-[10px] text-[#667085] border-t border-[#e4e7ec] bg-[#f9fafb]">
          {!isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold tracking-wider text-[#667085] uppercase">System v1.2</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#175cd3]/10 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#175cd3]"></div>
                  <span className="text-[9px] text-[#175cd3] font-medium">Active</span>
                </div>
              </div>
              <p>© 2026 Timely Health</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-3 h-3 mx-auto mb-1 bg-[#175cd3] rounded-full animate-pulse"></div>
              <span>©</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;