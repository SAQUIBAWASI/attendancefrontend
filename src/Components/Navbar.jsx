// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
// const navigate = useNavigate();
// const totalNotifications = 5; // Dummy count

// const handleNotificationsClick = () => {
// navigate("/notifications");
// };

// return ( <nav className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 text-white bg-blue-800 shadow-md">
// {/* Sidebar toggle button (left) */}
// <button
// onClick={() => setIsCollapsed(!isCollapsed)}
// className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
// >
// {isCollapsed ? ( <RiMenu2Line className="text-[#AAAAAA]" />
// ) : ( <RiMenu3Line className="text-[#AAAAAA]" />
// )} 
// </button>
//   {/* Center spacer for balance on desktop */}
//   <div className="flex-grow hidden md:block"></div>

//   {/* Notifications (middle on small screens, left on desktop if needed) */}
//   {/* <div className="relative flex items-center md:order-2">
//     <button
//       onClick={handleNotificationsClick}
//       className="relative p-2 transition rounded-full hover:bg-blue-700"
//     >
//       <MdNotificationsNone className="text-2xl text-white" />
//       {totalNotifications > 0 && (
//         <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
//           {totalNotifications}
//         </span>
//       )}
//     </button>
//   </div> */}

//   {/* Logo + Title (right side) */}
//   <div className="flex items-center gap-2 md:ml-4 md:order-3">
//     <img
//       src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//       alt="Vendor Logo"
//       className="object-cover w-10 h-10"
//     />
//     <span className="text-lg font-semibold sm:text-xl">Attendance</span>
//   </div>
// </nav>
// );
// };

// export default Navbar;


// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useLocation, useNavigate } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleMenuClick = () => {
//     console.log("Navbar: Toggling sidebar");
//     setIsCollapsed(!isCollapsed);
//   };

//   const getPageTitle = () => {
//     const path = location.pathname;
//     const routes = {
//       '/dashboard': 'Dashboard',
//       '/addemployee': 'Add Employee',
//       '/employeelist': 'Employee List',
//       '/attendancelist': 'All Employee Attendance',
//       '/attedancesummary': 'Attendance Summary',
//       '/today-attendance': "Today's Attendance",
//       '/late-today': 'Late Today',
//       '/absent-today': 'Absent Today',
//       '/leavelist': 'Leave Requests',
//       '/leaves-report': 'Leave Reports',
//       '/payroll': 'Payroll Management',
//       '/role-management': 'Role Management',
//       '/permission-settings': 'Permission Settings',
//       '/addlocation': 'Add Location',
//       '/locationlist': 'Location List',
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       "/jobpost":"Job Post", 
//       "/job-applicants":"Job Applicants",
//       "/score":"score",
//       "/assessment-manager":"Assessment Manager",
//       "/documents":"Documents",
//       "/permissions": "Permissions",
//       '/shift': 'Shift Management',
//       '/shiftlist': 'Shift List',
//     };

//     return routes[path] || 'Dashboard';
//   };




//   return (
//     <nav className="sticky top-0 z-40 flex items-center justify-between w-full h-14 px-4 text-white bg-blue-800 shadow-md">

//       {/* Left Section - Menu Button & Page Title */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar toggle button */}
//         <button
//           onClick={handleMenuClick}
//           className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
//         >
//           {isCollapsed ? (
//             <RiMenu2Line className="text-white" />
//           ) : (
//             <RiMenu3Line className="text-white" />
//           )}
//         </button>

//         {/* Page Title - Show on all screens */}
//         <div className="px-3 py-1 bg-blue-700 rounded-md">
//           <span className="text-sm font-semibold md:text-base">
//             {getPageTitle()}
//           </span>
//         </div>
//       </div>

//       {/* Logo + Title (right side) */}
//       <div className="flex items-center gap-2">
//         <img
//           src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//           alt="Vendor Logo"
//           className="object-cover w-10 h-10 rounded-lg"
//         />
//         <span className="hidden text-lg font-semibold sm:text-xl sm:block">Attendance</span>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useLocation, useNavigate, Link } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleMenuClick = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const getPageTitle = () => {
//     const path = location.pathname;

//     const routes = {
//       "/dashboard": "Dashboard",
//       "/addemployee": "Add Employee",
//       "/employeelist": "Employee List",
//       "/attendancelist": "All Employee Attendance",
//       "/attedancesummary": "Attendance Summary",
//       "/today-attendance": "Today's Attendance",
//       "/late-today": "Late Today",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leave Requests",
//       "/leaves-report": "Leave Reports",
//       "/payroll": "Payroll Management",
//       "/role-management": "Role Management",
//       "/permission-settings": "Permission Settings",
//       "/addlocation": "Add Location",
//       "/locationlist": "Location List",
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       "/jobpost": "Job Post",
//       "/job-applicants": "Job Applicants",
//       "/score": "Score",
//       "/assessment-manager": "Assessment Manager",
//       "/documents": "Documents",
//       "/permissions": "Permissions",
//       "/shift": "Shift Management",
//       "/shiftlist": "Shift List",
//     };

//     return routes[path] || "Dashboard";
//   };

//   // ✅ Job Module Links
//   const jobSubLinks = [
//     { path: "/jobpost", label: "Job Post" },
//     { path: "/job-applicants", label: "Job Applicants" },
//     { path: "/score", label: "Score" },
//     { path: "/assessment-manager", label: "Assessment Manager" },
//     { path: "/documents", label: "Documents" },
//   ];

//   // Check if user is inside Job Module
//   const isJobModule = jobSubLinks.some(
//     (link) => link.path === location.pathname
//   );

//  return (
//   <nav className="sticky top-0 z-40 flex items-center justify-between w-full h-14 px-4 text-white bg-blue-800 shadow-md">

//     {/* LEFT SECTION */}
//     <div className="flex items-center gap-4">
//       <button
//         onClick={handleMenuClick}
//         className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
//       >
//         {isCollapsed ? (
//           <RiMenu2Line />
//         ) : (
//           <RiMenu3Line />
//         )}
//       </button>

//       <div className="px-3 py-1 bg-blue-700 rounded-md">
//         <span className="text-sm font-semibold md:text-base">
//           {getPageTitle()}
//         </span>
//       </div>
//     </div>

//     {/* CENTER SECTION - Job Module Tabs */}
//     {[
//       "/jobpost",
//       "/job-applicants",
//       "/score",
//       "/assessment-manager",
//       "/documents",
//     ].includes(location.pathname) && (
//       <div className="hidden md:flex items-center gap-6">
//         {[
//           { path: "/jobpost", label: "Job Post" },
//           { path: "/job-applicants", label: "Applicants" },
//           { path: "/score", label: "Score" },
//           { path: "/assessment-manager", label: "Assessment" },
//           { path: "/documents", label: "Documents" },
//         ].map((item) => (
//           <button
//             key={item.path}
//             onClick={() => navigate(item.path)}
//             className={`text-sm font-medium transition ${
//               location.pathname === item.path
//                 ? "border-b-2 border-white pb-1"
//                 : "hover:text-gray-200"
//             }`}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div>
//     )}

//     {/* RIGHT SECTION */}
//     <div className="flex items-center gap-2">
//       <img
//         src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//         alt="Vendor Logo"
//         className="object-cover w-10 h-10 rounded-lg"
//       />
//       <span className="hidden text-lg font-semibold sm:block">
//         Attendance
//       </span>
//     </div>
//   </nav>
// );
// };

// export default Navbar;






// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useLocation, useNavigate } from "react-router-dom";

// const Navbar = ({ setIsCollapsed, isCollapsed }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleMenuClick = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const getPageTitle = () => {
//     const routes = {
//       "/dashboard": "Dashboard",
//       "/addemployee": "Add Employee",
//       "/employeelist": "Employee List",
//       "/attendancelist": "Attendance Records",
//       "/attedancesummary": "Attendance Summary",
//       "/today-attendance": "Today's Attendance",
//       "/late-today": "Late Today",
//       "/absent-today": "Absent Today",
//       "/leavelist": "Leave Requests",
//       "/leaves-report": "Leave Reports",
//       "/payroll": "Payroll Management",
//       "/role-management": "Role Management",
//       "/permission-settings": "Permission Settings",
//       "/addlocation": "Add Location",
//       "/locationlist": "Location List",
//       "/useractivity": "User Activity",
//       "/useraccess": "User Access",
//       "/jobpost": "Job Post",
//       "/job-applicants": "Job Applicants",
//       "/score": "Score",
//       "/assessment-manager": "Assessment Manager",
//       "/documents": "Documents",
//       "/permissions": "Permissions",
//       "/shift": "Shift Management",
//       "/shiftlist": "Shift List",
//     };

//     return routes[location.pathname] || "Dashboard";
//   };

//   // ================= JOB MODULE =================
//   const jobTabs = [
//     { path: "/jobpost", label: "Job Post" },
//     { path: "/job-applicants", label: "Applicants" },
//     { path: "/score", label: "Score" },
//     { path: "/assessment-manager", label: "Assessment" },
//     { path: "/documents", label: "Documents" },
//   ];

//   const jobRoutes = jobTabs.map((tab) => tab.path);
//   const isJobModule = jobRoutes.includes(location.pathname);

//   // ================= ATTENDANCE MODULE =================
//   const attendanceTabs = [
//     { path: "/attedancesummary", label: "Summary" },
//     { path: "/attendancelist", label: "Records" },
//     { path: "/today-attendance", label: "Today" },
//     { path: "/absent-today", label: "Absent Today" },
//   ];

//   const attendanceRoutes = attendanceTabs.map((tab) => tab.path);
//   const isAttendanceModule = attendanceRoutes.includes(location.pathname);

//   return (
//     <nav className="sticky top-0 z-40 flex items-center justify-between w-full h-14 px-4 text-white bg-blue-800 shadow-md">

//       {/* LEFT SECTION */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={handleMenuClick}
//           className="p-2 text-2xl transition rounded-md hover:bg-blue-700"
//         >
//           {isCollapsed ? <RiMenu2Line /> : <RiMenu3Line />}
//         </button>

//         <div className="px-3 py-1 bg-blue-700 rounded-md">
//           <span className="text-sm font-semibold md:text-base">
//             {getPageTitle()}
//           </span>
//         </div>
//       </div>

//       {/* CENTER SECTION */}
//       <div className="hidden md:flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-lg">

//         {/* JOB TABS */}
//         {isJobModule &&
//           jobTabs
//             .filter((tab) => tab.path !== location.pathname)
//             .map((tab) => (
//               <button
//                 key={tab.path}
//                 onClick={() => navigate(tab.path)}
//                 className=" text-sm font-medium text-white rounded-md hover:bg-blue-600 transition-all duration-200"
//               >
//                 {tab.label}
//               </button>
//             ))}

//         {/* ATTENDANCE TABS */}
//         {isAttendanceModule &&
//           attendanceTabs
//             .filter((tab) => tab.path !== location.pathname)
//             .map((tab) => (
//               <button
//                 key={tab.path}
//                 onClick={() => navigate(tab.path)}
//                 className="px-4 py-1.5 text-sm font-medium text-white rounded-md hover:bg-blue-600 transition-all duration-200"
//               >
//                 {tab.label}
//               </button>
//             ))}
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="flex items-center gap-2">
//         <img
//           src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//           alt="Vendor Logo"
//           className="object-cover w-10 h-10 rounded-lg"
//         />
//         <span className="hidden text-lg font-semibold sm:block">
//           Attendance
//         </span>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


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
      "/dashboard": "Dashboard",
      "/addemployee": "Add Employee",
      "/employeelist": "Employee List",
      "/attendancelist": "Attendance Records",
      "/attedancesummary": "Attendance Summary",
      "/today-attendance": "Today's Attendance",
      "/late-today": "Late Today",
      "/absent-today": "Absent Today",
      "/leavelist": "Leave Requests",
      "/leaves-report": "Leave Reports",
      "/payroll": "Payroll Management",
      "/role-management": "Role Management",
      "/permission-settings": "Permission Settings",
      "/addlocation": "Add Location",
      "/locationlist": "Location List",
      "/useractivity": "User Activity",
      "/useraccess": "User Access",
      "/jobpost": "Job Post",
      "/job-applicants": "Job Applicants",
      "/score": "Score",
      "/assessment-manager": "Assessment Manager",
      "/personaldocuments": "Documents",
      "/permissions": "Permissions",
      "/shift": "Shift Management",
      "/shiftlist": "Shift List",
    };

    return routes[location.pathname] || "Dashboard";
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
  const attendanceTabs = [
    { path: "/attedancesummary", label: "Summary" },
    { path: "/attendancelist", label: "Records" },
    { path: "/today-attendance", label: "Today" },
    { path: "/absent-today", label: "Absent Today" },
  ];

  const isAttendanceModule = attendanceTabs.some(
    (tab) => tab.path === location.pathname
  );

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between w-full h-14 px-4 text-white bg-blue-800 shadow-md">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleMenuClick}
          className="p-2 text-2xl rounded-md hover:bg-blue-700 transition"
        >
          {isCollapsed ? <RiMenu2Line /> : <RiMenu3Line />}
        </button>

        <div className="px-3 py-1 bg-blue-700 rounded-md">
          <span className="text-sm font-semibold">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* CENTER - NO EXTRA SPACE */}
      <div className="hidden md:flex items-center gap-2">

        {/* JOB TABS */}
        {isJobModule &&
          jobTabs
            .filter((tab) => tab.path !== location.pathname)
            .map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="px-3 py-1.5 text-sm font-medium text-white rounded-md hover:bg-blue-700 transition"
              >
                {tab.label}
              </button>
            ))}

        {/* ATTENDANCE TABS */}
        {isAttendanceModule &&
          attendanceTabs
            .filter((tab) => tab.path !== location.pathname)
            .map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="px-3 py-1.5 text-sm font-medium text-white rounded-md hover:bg-blue-700 transition"
              >
                {tab.label}
              </button>
            ))}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <img
          src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
          alt="Vendor Logo"
          className="w-10 h-10 rounded-lg object-cover"
        />
        <span className="hidden sm:block text-lg font-semibold">
          Attendance
        </span>
      </div>
    </nav>
  );
};

export default Navbar;