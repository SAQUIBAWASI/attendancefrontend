import { RiMenu2Line, RiMenu3Line, RiCalendarCheckLine, RiBriefcaseLine, RiCheckboxMultipleLine, RiBuildingFill, RiLayoutGridFill, RiDropperFill } from "react-icons/ri";
import { FiGrid } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigateToIngrainHire = () => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    let employeeData = {};
    try {
      employeeData = JSON.parse(employeeDataRaw || "{}");
    } catch (e) {
      console.error('Failed to parse employeeData:', e);
    }
    
    const email = employeeData.email || employeeData.employeeEmail || '';
    const password = employeeData.password || employeeData.employeePassword || '';
    const storedPassword = localStorage.getItem("employeePassword") || '';
    let finalPassword = password || storedPassword || '';
    if (!finalPassword) {
      finalPassword = '456789';
    }
    
    const baseUrl = 'https://ingrainhire.ingrainsystems.com/candidate-login';
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (finalPassword) params.append('password', finalPassword);
    params.append('autoLogin', 'true');
    
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    window.location.href = url;
  };

  const getPageTitle = () => {
    const routes = {
      "/dashboard": "",
      "/addemployee": "",
      "/employeelist": "",
      "/attendancelist": "",
      "/attendancesummary": "",
      "/attedancesummary": "",
      "/today-attendance": "",
      "/late-today": "",
      "/absent-today": "",
      "/leavelist": "",
      "/leaves-report": "",
      "/payroll": "",
      "/role-management": "",
      "/permission-settings": "",
      "/addlocation": "",
      "/locationlist": "",
      "/useractivity": "",
      "/useraccess": "",
      "/jobpost": "",
      "/job-applicants": "",
      "/score": "",
      "/assessment-manager": "",
      "/personaldocuments": "",
      "/permissions": "",
      "/shift": "",
      "/shiftlist": "",
      "/all-expensives": "",
      "/regularization": "",
      "/holidays-calendar": "",
      "/all-medical-certificates": "",
    };

    return routes[location.pathname] || "";
  };

  // ===== JOB MODULE =====
  const jobTabs = [
    { path: "/jobpost", label: "Job Post" },
    { path: "/job-applicants", label: "Applicants" },
    { path: "/score", label: "Score" },
    { path: "/assessment-manager", label: "Assessment" },
    { path: "/personaldocuments", label: "Documents" },
  ];

  const isJobModule = jobTabs.some(
    (tab) => tab.path === location.pathname
  );

  // ===== ATTENDANCE MODULE =====
  // ✅ Only ONE "Summary" tab that handles both paths
  const attendanceTabs = [
    { path: "/attedancesummary", label: "Summary" },  // Sirf ek Summary
    { path: "/attendancelist", label: "Records" },
    { path: "/today-attendance", label: "Today" },
    { path: "/absent-today", label: "Absent" },
    { path: "/late-today", label: "Late" },
    { path: "/regularization", label: "Regularization" },
  ];

  // ✅ Check if current path is ANY attendance related page
  const isAttendanceModule = attendanceTabs.some(
    (tab) => tab.path === location.pathname
  ) || location.pathname === "/attendancesummary"; // Also check alternate spelling

  // ===== DASHBOARD MODULE CHECK =====
  const isDashboardModule = location.pathname === "/dashboard";

  // ✅ Navigation handler for attendance tabs
  const handleAttendanceTabClick = (path) => {
    navigate(path);
  };

  // ✅ Check if a tab is active (handles both spellings)
  const isTabActive = (tabPath) => {
    if (tabPath === "/attedancesummary") {
      return location.pathname === "/attedancesummary" || location.pathname === "/attendancesummary";
    }
    return location.pathname === tabPath;
  };

  return (
    <nav className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#e4e7ec] bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleMenuClick}
          className="rounded-lg p-2 text-[#667085] transition hover:bg-[#f0f2f5] hover:text-[#101828]"
        >
          {isCollapsed ? <RiMenu2Line className="text-xl" /> : <RiMenu3Line className="text-xl" />}
        </button>

        <div>
          <span className="text-sm font-semibold text-[#101828] md:text-base">
            {getPageTitle()}
          </span>
        </div>

        {/* ===== ATTENDANCE MODULE TABS - LEFT SIDE ===== */}
        {isAttendanceModule && (
          <div className="flex items-center gap-1 ml-4">
            {attendanceTabs.map((tab) => {
              const isActive = isTabActive(tab.path);

              return (
                <button
                  key={tab.path}
                  onClick={() => handleAttendanceTabClick(tab.path)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md"
                      : "bg-[#f0f2f5] text-[#667085] hover:bg-[#e4e7ec] hover:text-[#101828]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ===== JOB MODULE TABS - LEFT SIDE ===== */}
        {isJobModule && (
          <div className="flex items-center gap-1 ml-4">
            {jobTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === tab.path
                    ? "bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md"
                    : "bg-[#f0f2f5] text-[#667085] hover:bg-[#e4e7ec] hover:text-[#101828]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Dashboard Circles - Only show on Dashboard */}
        {isDashboardModule && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/leavelist")}
              className="rounded-lg bg-[#f0f2f5] px-3 py-1.5 text-xs font-medium text-[#667085] transition hover:bg-[#e4e7ec] hover:text-[#101828]"
              title="Leave Requests"
            >
              Leave
            </button>
            <button
              onClick={() => navigate("/permissions")}
              className="rounded-lg bg-[#f0f2f5] px-3 py-1.5 text-xs font-medium text-[#667085] transition hover:bg-[#e4e7ec] hover:text-[#101828]"
              title="Permissions"
            >
              Perm
            </button>
          </div>
        )}

        {/* Products Dropdown */}
        <div className="relative group">
          <button
            type="button"
            className="relative rounded-lg p-2 text-[#667085] transition hover:bg-[#f0f2f5] hover:text-[#101828] flex items-center justify-center"
            title="Products"
          >
            <FiGrid className="text-2xl" />
          </button>
          
          <div className="absolute right-0 top-full pt-2 z-50 w-60 hidden group-hover:block">
            <div className="rounded-xl border border-[#e4e7ec] bg-white p-3 shadow-xl">

              {/* ── Section 1: Apps & Products ── */}
              <div className="px-1 pb-2 text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#f0f2f5] mb-2">
                Apps &amp; Products
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">

                {/* Attendance */}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#eff8ff] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff8ff] text-[#175cd3]">
                    <RiCalendarCheckLine className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#175cd3]">Attendance</span>
                </button>

                {/* Recruitment */}
                <button
                  type="button"
                  onClick={navigateToIngrainHire}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#fdf2fa] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf2fa] text-[#c11574]">
                    <RiBriefcaseLine className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#c11574]">Recruitment</span>
                </button>

                {/* Tasks */}
                <button
                  type="button"
                  onClick={() => {
                    const employeeId = localStorage.getItem("employeeId") || '';
                    window.location.href = `https://taskmanagement.iryax.com?employeeId=${employeeId}`;
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#edfcf2] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edfcf2] text-[#027a48]">
                    <RiCheckboxMultipleLine className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#027a48]">Tasks</span>
                </button>

              </div>

              {/* ── Section 2: Explore Products ── */}
              <div className="px-1 pb-2 text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#f0f2f5] mb-2">
                Explore Products
              </div>
              <div className="grid grid-cols-3 gap-2">

                {/* Camp Management */}
                <button
                  type="button"
                  onClick={() => window.open("https://iryax.com/camp", "_blank")}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#fff7ed] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7ed] text-[#c4690a]">
                    <RiBuildingFill className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#c4690a] leading-tight">Camp Mgmt</span>
                </button>

                {/* Workspace Management */}
                <button
                  type="button"
                  onClick={() => window.open("https://iryax.com/workspace", "_blank")}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#f5f3ff] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f3ff] text-[#6d28d9]">
                    <RiLayoutGridFill className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#6d28d9] leading-tight">Workspace</span>
                </button>

                {/* Lab Management */}
                <button
                  type="button"
                  onClick={() => window.open("https://iryax.com/products", "_blank")}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition hover:bg-[#fef2f2] group/card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef2f2] text-[#dc2626]">
                    <RiDropperFill className="text-xl" />
                  </div>
                  <span className="text-xs font-medium text-[#344054] group-hover/card:text-[#dc2626] leading-tight">Lab Mgmt</span>
                </button>

              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <img
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="text-sm font-semibold text-[#101828]">Timely Health</span>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;