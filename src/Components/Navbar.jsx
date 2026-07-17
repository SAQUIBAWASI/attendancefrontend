import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    setIsCollapsed(!isCollapsed);
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