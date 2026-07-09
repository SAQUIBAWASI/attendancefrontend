import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./EmployeeSidebar.css";

const EmployeeSidebar = ({ isCollapsed, setIsCollapsed, isMobile, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [activeItem, setActiveItem] = useState("/employeedashboard");
  
  const [isAdminView, setIsAdminView] = useState(() => {
    const saved = localStorage.getItem("isAdminView");
    return saved === "true";
  });
  
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAnyAdminPermission, setHasAnyAdminPermission] = useState(false);
  const [isManager, setIsManager] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_PERMISSIONS = [
    "dashboard_view", "attendance_view_all", "shifts_manage", "leave_approve",
    "leave_approve_manager", "reports_view", "payroll_manage", "employee_view_all", "employee_add",
    "user_activity_view", "user_access_manage", "expenses_manage", "expense_manage",
    "locations_manage", "job_posts_view", "job_applicants_view", "score_board_view",
    "assessments_view", "documents_view", "job_recruitment_manage", "holidays_view",
    "events_manage", "events_create", "events_edit", "events_delete", 
    "events_view_all", "events_register_participants", "issues_view", "issues_manage",
    "tasks_view", "tasks_manage"
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
      "/attendance-capture": "Attendance Capture",
      "/myattendance": "My Attendance",
      "/my-shift": "My Shift",
      "/mylocation": "My Location",
      "/mysalary": "Payslips",
      "/mypermissions": "My Permissions",
      "/myleaves": "My Leaves",
      "/emp-admin-dashboard": "Dashboard",
      "/emp-employees": "Employees",
      "/emp-add-employee": "Add Employee",
      "/emp-attendance-summary": "Attendance Summary",
      "/emp-attendance-records": "Attendance Records",
      "/emp-today-attendance": "Today Attendance",
      "/emp-absent-today": "Absent Today",
      "/emp-leaves": "Leaves",
      "/emp-pending-leaves": "Manager Approve",
      "/emp-payroll": "Payroll",
      "/emp-reports": "Reports",
      "/emp-locations": "Locations",
      "/emp-shifts": "Shifts",
      "/emp-user-activity": "User Activity",
      "/emp-user-access": "User Access",
      "/emp-all-expensives-management": "Expenses",
      "/emp-job-posts": "Job Posts",
      "/emp-job-applicants": "Job Applicants",
      "/emp-score-board": "Score Board",
      "/emp-assessments": "Assessments",
      "/emp-documents": "Documents",
      "/emp-my-jobs": "My Jobs",
      "/emp-personal-documents": "Personal Documents",
      "/emp-letters": "My Letters",
      "/my-medical-certificate": "My Certificate",
      "/emp-holidays-calendar": "Holidays Calendar",
      "/emp-permissions": "Permissions",
      "/emp-events": "Events",
      "/emp-issues": "Issues",
      "/emp-tasks": "Tasks"
    };
    return pathMap[path] || "Dashboard";
  };

  const handleMouseEnterSidebar = () => {
    if (!isMobile && setIsCollapsed && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeaveSidebar = () => {
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

  const handleItemClick = (path, action, isExternal = false) => {
    if (isExternal) {
      // ⭐ FIX: Same tab mein open karein
      window.location.href = path;
    } else if (path) {
      navigate(path);
    }
    if (action) {
      action();
    }
    setOpenDropdown(null);
    if (isMobile && setIsCollapsed) {
      setIsCollapsed(true);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleDropdownItemClick = (path, isExternal = false) => {
    if (isExternal) {
      // ⭐ FIX: Same tab mein open karein
      window.location.href = path;
    } else {
      navigate(path);
    }
    setOpenDropdown(null);
    if (isMobile && setIsCollapsed) {
      setIsCollapsed(true);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/employees/logout`, {}, { withCredentials: true });
      localStorage.clear();
      localStorage.removeItem("isAdminView");
      navigate("/employee-login");
      handleItemClick(null, null);
    } catch (error) {
      localStorage.clear();
      navigate("/employee-login");
    }
  };

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
      const adminMenu = buildAdminMenu();
      const firstNavigableItem = adminMenu.find(item => item.path && item.name !== "Logout");
      const firstDropdownItem = adminMenu.find(item => item.dropdown && item.dropdown.length > 0)?.dropdown[0];
      const targetPath = firstNavigableItem ? firstNavigableItem.path : (firstDropdownItem ? firstDropdownItem.path : "/emp-admin-dashboard");
      navigate(targetPath);
    } else {
      navigate("/employeedashboard");
    }
  }, [hasAnyAdminPermission, isAdminView, navigate]);

  const isActive = (path) => {
    if (path && path.startsWith('http')) return false;
    return activeItem === path;
  };
  
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

      const checkManagerStatus = (data) => {
        if (!data) return false;
        const role = (data.role || data.designation || "").toLowerCase();
        return role === "manager" || role === "team lead";
      };

      const checkHRManagementStatus = (data) => {
        if (!data) return false;
        const role = (data.role || data.designation || "").toLowerCase();
        const dept = (data.department || "").toLowerCase();
        return dept.includes("management") || role.includes("hr") || role.includes("admin");
      };

      try {
        const response = await axios.get(`${API_BASE_URL}/employees/get-employee?employeeId=${storedId}&t=${new Date().getTime()}`);
        let fetchedPermissions = [];
        
        if (response.data.data?.permissions) fetchedPermissions = response.data.data.permissions;
        else if (response.data.permissions) fetchedPermissions = response.data.permissions;
        
        const empLocal = JSON.parse(localStorage.getItem("employeeData") || "{}");
        const dataToUse = response.data.data || response.data || empLocal;
        
        const isManagerUser = checkManagerStatus(dataToUse);
        const isHRManagement = checkHRManagementStatus(dataToUse);
        
        setIsManager(isManagerUser);
        
        if (isHRManagement) {
          const allPerms = new Set([...fetchedPermissions, ...ADMIN_PERMISSIONS]);
          fetchedPermissions = Array.from(allPerms);
        } else if (isManagerUser) {
          if (!fetchedPermissions.includes("leave_approve_manager")) fetchedPermissions.push("leave_approve_manager");
          if (!fetchedPermissions.includes("shifts_manage")) fetchedPermissions.push("shifts_manage");
          if (!fetchedPermissions.includes("events_view_all")) fetchedPermissions.push("events_view_all");
          if (!fetchedPermissions.includes("events_manage")) fetchedPermissions.push("events_manage");
          if (!fetchedPermissions.includes("issues_view")) fetchedPermissions.push("issues_view");
          if (!fetchedPermissions.includes("issues_manage")) fetchedPermissions.push("issues_manage");
          if (!fetchedPermissions.includes("tasks_view")) fetchedPermissions.push("tasks_view");
          if (!fetchedPermissions.includes("tasks_manage")) fetchedPermissions.push("tasks_manage");
        }

        setPermissions(fetchedPermissions);
        localStorage.setItem("employeePermissions", JSON.stringify(fetchedPermissions));
        
        const hasAdminPerm = fetchedPermissions.some(perm => ADMIN_PERMISSIONS.includes(perm));
        setHasAnyAdminPermission(hasAdminPerm);
        
        if (!hasAdminPerm) {
          setIsAdminView(false);
          localStorage.setItem("isAdminView", "false");
        }
      } catch (error) {
        let localPermissions = JSON.parse(localStorage.getItem("employeePermissions") || "[]");
        const empLocal = JSON.parse(localStorage.getItem("employeeData") || "{}");
        const isManagerUser = checkManagerStatus(empLocal);
        const isHRManagement = checkHRManagementStatus(empLocal);

        setIsManager(isManagerUser);

        if (isHRManagement) {
          const allPerms = new Set([...localPermissions, ...ADMIN_PERMISSIONS]);
          localPermissions = Array.from(allPerms);
        } else if (isManagerUser) {
          if (!localPermissions.includes("leave_approve_manager")) localPermissions.push("leave_approve_manager");
          if (!localPermissions.includes("shifts_manage")) localPermissions.push("shifts_manage");
          if (!localPermissions.includes("events_view_all")) localPermissions.push("events_view_all");
          if (!localPermissions.includes("events_manage")) localPermissions.push("events_manage");
          if (!localPermissions.includes("issues_view")) localPermissions.push("issues_view");
          if (!localPermissions.includes("issues_manage")) localPermissions.push("issues_manage");
          if (!localPermissions.includes("tasks_view")) localPermissions.push("tasks_view");
          if (!localPermissions.includes("tasks_manage")) localPermissions.push("tasks_manage");
        }

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

  // ─── Navigate to Ingrain Hire ───
  const navigateToIngrainHire = () => {
    console.log('========================================');
    console.log('🔍 NAVIGATING TO INGRAIN HIRE');
    console.log('========================================');
    
    // Get employee data from localStorage
    const employeeDataRaw = localStorage.getItem("employeeData");
    console.log('📄 Raw employeeData from localStorage:', employeeDataRaw);
    
    let employeeData = {};
    try {
      employeeData = JSON.parse(employeeDataRaw || "{}");
      console.log('✅ Parsed employeeData:', employeeData);
    } catch (e) {
      console.error('❌ Failed to parse employeeData:', e);
    }
    
    // Get email
    const email = employeeData.email || employeeData.employeeEmail || '';
    console.log('📧 Email found:', email);
    
    // Get password
    const password = employeeData.password || employeeData.employeePassword || '';
    console.log('🔐 Password found in employeeData:', password);
    
    // Also check other storage locations
    const storedPassword = localStorage.getItem("employeePassword") || '';
    console.log('🔐 employeePassword from localStorage:', storedPassword);
    
    // Determine final password
    let finalPassword = password || storedPassword || '';
    console.log('🔐 Final password before fallback:', finalPassword);
    
    // If still empty, use fallback
    if (!finalPassword) {
      console.log('⚠️ No password found, using fallback: 456789');
      finalPassword = '456789';
    }
    
    // Build URL with query params
    const baseUrl = 'https://ingrainhire.ingrainsystems.com/candidate-login';
    const params = new URLSearchParams();
    
    if (email) params.append('email', email);
    if (finalPassword) params.append('password', finalPassword);
    params.append('autoLogin', 'true');
    
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    console.log('========================================');
    console.log('🚀 FINAL URL:', url);
    console.log('📧 Email being sent:', email);
    console.log('🔐 Password being sent:', finalPassword);
    console.log('========================================');
    
    // ⭐ FIX: Same tab mein navigate karein
    window.location.href = url;
  };

  const buildEmployeeMenu = () => {
    const employeeId = localStorage.getItem("employeeId") || '';
    const tasksUrl = `https://taskmanagement.iryax.com?employeeId=${employeeId}`;
    
    const menu = [
      { icon: <i className="ri-dashboard-fill"></i>, name: "Dashboard", path: "/employeedashboard" },
      {
        icon: <i className="ri-calendar-check-fill"></i>,
        name: "Attendance",
        dropdown: [
          { name: "Attendance Capture", path: "/attendance-capture" },
          { name: "My Attendance", path: "/myattendance" },
          { name: "My Shift", path: "/my-shift" },
          { name: "My Location", path: "/mylocation" },
        ]
      },
      { icon: <i className="ri-calendar-check-fill"></i>, name: "Leave", path: "/myleaves" },
      { icon: <i className="ri-account-circle-fill"></i>, name: "Profile", path: "/emp-profile" },
      { icon: <i className="ri-money-rupee-circle-fill"></i>, name: "Payslips", path: "/mysalary" },
      { icon: <i className="ri-funds-fill"></i>, name: "Expenses", path: "/expense-management" },
      { icon: <i className="ri-calendar-event-fill"></i>, name: "Holidays", path: "/HolidayList" },
      { 
        icon: <i className="ri-error-warning-fill"></i>, 
        name: "Issues", 
        path: "/emp-issues",
        badge: "NEW"
      },
      { 
        icon: <i className="ri-task-fill"></i>, 
        name: "Tasks", 
        path: tasksUrl,
        isExternal: true,
        badge: "NEW"
      },
      { 
        icon: <i className="ri-building-fill"></i>, 
        name: "Hire", 
        action: navigateToIngrainHire,
        isExternal: true,
        badge: "HIRE"
      },
      { icon: <i className="ri-logout-box-r-line"></i>, name: "Logout", action: handleLogout }
    ];
    return menu;
  };

  const buildAdminMenu = () => {
    const employeeId = localStorage.getItem("employeeId") || '';
    const tasksUrl = `https://taskmanagement.iryax.com?employeeId=${employeeId}`;
    
    const menu = [];

    if (hasPermission("dashboard_view")) {
      menu.push({ icon: <i className="ri-dashboard-fill"></i>, name: "Dashboard", path: "/emp-admin-dashboard" });
    }

    if (hasPermission("employee_view_all")) {
      menu.push({ icon: <i className="ri-user-fill"></i>, name: "Employees", path: "/emp-employees" });
    }

    if (hasPermission("employee_add")) {
      menu.push({ icon: <i className="ri-user-add-fill"></i>, name: "Add Employee", path: "/emp-add-employee" });
    }

    const attendanceDropdown = [
      { name: "Attendance Capture", path: "/attendance-capture" },
      { name: "My Attendance", path: "/myattendance" },
      { name: "My Shift", path: "/my-shift" },
      { name: "My Location", path: "/mylocation" },
    ];
    if (hasPermission("attendance_view_all")) {
      attendanceDropdown.push({ name: "Attendance Summary", path: "/emp-attendance-summary" });
      attendanceDropdown.push({ name: "Attendance Records", path: "/emp-attendance-records" });
      attendanceDropdown.push({ name: "Today Attendance", path: "/emp-today-attendance" });
      attendanceDropdown.push({ name: "Absent Today", path: "/emp-absent-today" });
    }
    menu.push({
      icon: <i className="ri-calendar-check-fill"></i>,
      name: "Attendance",
      dropdown: attendanceDropdown
    });

    if (hasPermission("leave_approve")) {
      menu.push({ icon: <i className="ri-calendar-fill"></i>, name: "Leaves", path: "/emp-leaves" });
    }
    
    if (hasPermission("leave_approve_manager")) {
      menu.push({ icon: <i className="ri-user-star-fill"></i>, name: "Manager Approve", path: "/emp-pending-leaves" });
    }

    if (hasPermission("holidays_view") || hasPermission("user_access_manage") || hasPermission("employee_view_all")) {
      menu.push({ icon: <i className="ri-calendar-fill"></i>, name: "Holidays", path: "/emp-holidays-calendar" });
    }

    if (hasPermission("user_access_manage")) {
      menu.push({ icon: <i className="ri-shield-keyhole-fill"></i>, name: "Permissions", path: "/emp-permissions" });
    }

    if (hasPermission("payroll_manage")) {
      menu.push({ icon: <i className="ri-money-dollar-box-fill"></i>, name: "Payroll", path: "/emp-payroll" });
    }

    if (hasPermission("expenses_manage") || hasPermission("expense_manage")) {
      menu.push({ icon: <i className="ri-money-dollar-circle-fill"></i>, name: "Expenses", path: "/emp-all-expensives-management" });
    }

    if (hasPermission("issues_view") || hasPermission("issues_manage")) {
      menu.push({ 
        icon: <i className="ri-error-warning-fill"></i>, 
        name: "Issues", 
        path: "/emp-issues",
        badge: "NEW"
      });
    }

    if (hasPermission("tasks_view") || hasPermission("tasks_manage")) {
      menu.push({ 
        icon: <i className="ri-task-fill"></i>, 
        name: "Tasks", 
        path: tasksUrl,
        isExternal: true,
        badge: "NEW"
      });
    }

    if (hasPermission("user_activity_view")) {
      menu.push({ icon: <i className="ri-history-fill"></i>, name: "User Activity", path: "/emp-user-activity" });
    }

    if (hasPermission("user_access_manage")) {
      menu.push({ icon: <i className="ri-shield-user-fill"></i>, name: "User Access", path: "/emp-user-access" });
    }

    const recruitmentDropdown = [];
    if (hasPermission("job_posts_view")) recruitmentDropdown.push({ name: "Job Posts", path: "/emp-job-posts" });
    if (hasPermission("job_applicants_view")) recruitmentDropdown.push({ name: "Job Applicants", path: "/emp-job-applicants" });
    if (hasPermission("score_board_view")) recruitmentDropdown.push({ name: "Score Board", path: "/emp-score-board" });
    if (hasPermission("assessments_view")) recruitmentDropdown.push({ name: "Assessments", path: "/emp-assessments" });
    if (hasPermission("documents_view")) recruitmentDropdown.push({ name: "Documents", path: "/emp-documents" });
    
    if (recruitmentDropdown.length > 0) {
      menu.push({
        icon: <i className="ri-briefcase-fill"></i>,
        name: "Recruitment",
        dropdown: recruitmentDropdown
      });
    }

    if (hasPermission("events_view_all") || hasPermission("events_manage") || 
        hasPermission("events_create") || hasPermission("events_register_participants")) {
      menu.push({
        icon: <i className="ri-calendar-event-fill"></i>,
        name: "Events",
        path: "/emp-events",
      });
    }

    if (hasPermission("locations_manage")) {
      menu.push({ icon: <i className="ri-map-pin-2-fill"></i>, name: "Locations", path: "/emp-locations" });
    }

    if (hasPermission("shifts_manage")) {
      menu.push({ icon: <i className="ri-time-fill"></i>, name: "Shifts", path: "/emp-shifts" });
    }

    // ─── Ingrain Hire in Admin Menu ───
    menu.push({ 
      icon: <i className="ri-building-fill"></i>, 
      name: "Ingrain Hire", 
      action: navigateToIngrainHire,
      isExternal: true,
      badge: "HIRE"
    });

    menu.push({ icon: <i className="ri-logout-box-r-line"></i>, name: "Logout", action: handleLogout });

    return menu;
  };

  const getCurrentMenu = () => {
    if (!hasAnyAdminPermission) return buildEmployeeMenu();
    return isAdminView ? buildAdminMenu() : buildEmployeeMenu();
  };

  const menuItems = getCurrentMenu();

  if (loading) {
    return (
      <div className="emp-sidebar emp-sidebar__loading">
        <div className="emp-sidebar__spinner" />
      </div>
    );
  }

  const sidebarClass = [
    "emp-sidebar",
    !isMobile && isCollapsed ? "emp-sidebar--collapsed" : "",
    isMobile && isCollapsed ? "emp-sidebar--mobile-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="emp-sidebar__overlay"
          onClick={() => {
            if (setIsCollapsed) setIsCollapsed(true);
            setOpenDropdown(null);
          }}
        />
      )}

      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={sidebarClass}
      >
        <div className="emp-sidebar__header">
          {isCollapsed && !isMobile ? (
            <span className="emp-sidebar__brand-mark">TM</span>
          ) : (
            <div className="w-full min-w-0">
              <div className="emp-sidebar__brand-label">
                {hasAnyAdminPermission && isAdminView ? "Admin Portal" : "Employee Portal"}
              </div>
              <div className="emp-sidebar__brand-page">
                <span className="emp-sidebar__brand-dot" />
                <span className="truncate">{currentPage}</span>
              </div>
            </div>
          )}
        </div>

        <nav className="emp-sidebar__nav">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              {item.dropdown ? (
                <>
                  <div
                    className={`emp-sidebar__dropdown-trigger ${
                      isDropdownActive(item.dropdown) || openDropdown === item.name
                        ? "emp-sidebar__dropdown-trigger--active"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.dropdown || item.dropdown.length === 0) return;

                      if (isCollapsed) {
                        const firstItem = item.dropdown[0];
                        if (firstItem.isExternal) {
                          // ⭐ FIX: Same tab mein open karein
                          window.location.href = firstItem.path;
                        } else {
                          navigate(firstItem.path);
                        }
                        setOpenDropdown(null);
                        if (isMobile && setIsCollapsed) setIsCollapsed(true);
                        if (onClose) onClose();
                        return;
                      }

                      setOpenDropdown((current) => (current === item.name ? null : item.name));
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="emp-sidebar__item-icon">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="emp-sidebar__item-label">{item.name}</span>
                      )}
                    </div>

                    {/* ─── CHEVRON DOWN ICON - BLUE COLOR ─── */}
                    {!isCollapsed && (
                      <div className="flex items-center gap-1">
                        {isDropdownActive(item.dropdown) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        )}
                        <FaChevronDown
                          onClick={(e) => toggleDropdown(e, item.name)}
                          className={`text-[10px] transition-transform duration-300 p-0 rounded cursor-pointer ${
                            isDropdownActive(item.dropdown)
                              ? "text-blue-500"
                              : openDropdown === item.name
                                ? "text-blue-500"
                                : "text-blue-400"
                          } ${openDropdown === item.name ? "rotate-180" : ""}`}
                          style={{
                            width: '16px',
                            height: '16px',
                            minWidth: '16px',
                            minHeight: '16px'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {openDropdown === item.name && !isCollapsed && (
                    <ul className="emp-sidebar__submenu">
                      {item.dropdown.map((sub, i) => (
                        <li key={i}>
                          {sub.isExternal ? (
                            <a
                              href={sub.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setOpenDropdown(null);
                                if (isMobile && setIsCollapsed) setIsCollapsed(true);
                                if (onClose) onClose();
                              }}
                              className={`emp-sidebar__subitem ${
                                isActive(sub.path) ? "emp-sidebar__subitem--active" : ""
                              }`}
                            >
                              {sub.name}
                              {sub.badge && (
                                <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                                  {sub.badge}
                                </span>
                              )}
                              <i className="ri-external-link-line ml-1 text-xs" />
                            </a>
                          ) : (
                            <Link
                              to={sub.path}
                              onClick={() => handleDropdownItemClick(sub.path)}
                              className={`emp-sidebar__subitem ${
                                isActive(sub.path) ? "emp-sidebar__subitem--active" : ""
                              }`}
                            >
                              {sub.name}
                              {sub.badge && (
                                <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div
                  onClick={() => {
                    if (item.action === navigateToIngrainHire) {
                      navigateToIngrainHire();
                    } else {
                      handleItemClick(item.path, item.action, item.isExternal);
                    }
                  }}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 relative ${
                    isActive(item.path) && !item.isExternal
                      ? "bg-[#16A34A] text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
                      : "hover:bg-blue-600"
                  }`}
                >
                  <span className="emp-sidebar__item-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-[14px] font-medium leading-none truncate">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {item.isExternal && (
                        <i className="ri-external-link-line text-xs opacity-60" />
                      )}
                      {isActive(item.path) && !item.isExternal && (
                        <div className="w-2 h-2 ml-auto rounded-full bg-emerald-300 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="emp-sidebar__footer">
          {!isCollapsed ? (
            <div className="emp-sidebar__footer-expanded">
              {hasAnyAdminPermission && (
                <button type="button" onClick={toggleView} className="emp-sidebar__toggle">
                  <span className="flex items-center gap-2">
                    <i className={`emp-sidebar__toggle-icon ${isAdminView ? "ri-admin-fill" : "ri-user-fill"}`} />
                    {isAdminView ? "Switch to Employee View" : "Switch to Admin View"}
                  </span>
                  <i className="ri-swap-line emp-sidebar__toggle-icon" />
                </button>
              )}
              <div className="emp-sidebar__meta">
                <span className="emp-sidebar__meta-title">
                  {hasAnyAdminPermission && isAdminView ? "Admin Portal v1.0" : "Employee Portal v1.0"}
                </span>
                <span
                  className={`emp-sidebar__meta-badge ${
                    hasAnyAdminPermission && isAdminView ? "emp-sidebar__meta-badge--admin" : ""
                  }`}
                >
                  <span className="emp-sidebar__meta-badge-dot" />
                  {hasAnyAdminPermission && isAdminView ? "Admin" : "Employee"}
                </span>
              </div>
              <p className="emp-sidebar__copyright">© {new Date().getFullYear()} Timely Health</p>
            </div>
          ) : (
            <div className="emp-sidebar__footer-collapsed">
              {hasAnyAdminPermission && (
                <button
                  type="button"
                  onClick={toggleView}
                  className="emp-sidebar__toggle-icon"
                  title={isAdminView ? "Switch to Employee View" : "Switch to Admin View"}
                >
                  <i className={isAdminView ? "ri-admin-fill" : "ri-user-fill"} />
                </button>
              )}
              <span className="emp-sidebar__copyright">©</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeSidebar;