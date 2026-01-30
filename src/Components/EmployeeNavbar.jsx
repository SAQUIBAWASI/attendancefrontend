// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useNavigate } from "react-router-dom";

// const Navbar = ({ isCollapsed = false, setIsCollapsed }) => {
//   const navigate = useNavigate();

//   // 🟩 Safe toggle handler
//   const handleToggle = () => {
//     if (typeof setIsCollapsed === "function") {
//       setIsCollapsed((prev) => !prev);
//     } else {
//       console.warn("⚠️ setIsCollapsed not provided to Navbar, skipping toggle.");
//     }
//   };

//   return (
//     <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-4 flex items-center shadow-md z-50">
//       {/* Sidebar Toggle Button */}
//       <button onClick={handleToggle} className="text-2xl p-2 focus:outline-none">
//         {isCollapsed ? (
//           <RiMenu2Line className="text-[#AAAAAA]" />
//         ) : (
//           <RiMenu3Line className="text-[#AAAAAA]" />
//         )}
//       </button>

//       {/* Title */}
//       <div className="ml-3 text-lg font-semibold tracking-wide">
//         Employee Dashboard
//       </div>

//       {/* Spacer */}
//       <div className="flex-grow"></div>

//       {/* Logo */}
//       <div className="flex items-center gap-2 pl-4">
//         <img
//           src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//           alt="Logo"
//           className="w-[38px] h-auto rounded-full"
//         />
//         <span className="hidden sm:block text-white font-bold text-lg">
//           Attendance
//         </span>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const EmployeeNavbar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();


  const titles = {
    "/employeedashboard": "Employee Dashboard",
    "/leave-application": "Leave Application",
    "/myleaves": "My Leaves",
    "/myattendance": "My Attendance Records",
    "/attendance-capture": "Check In",
    "/my-shift": "My Shift",
    "/mylocation": "My Assigned Location",
    "/mysalary": "My Salary",
    "/mypermissions": "My Permissions",
    "/notifications": "Notifications",
  };

  const handleMenuClick = () => {
    if (setIsCollapsed && typeof setIsCollapsed === 'function') {
      setIsCollapsed(prev => !prev);
    }
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-14 px-4 flex items-center justify-between shadow-md z-40">
      <div className="flex items-center gap-4">
        {/* Menu Button */}
        <button
          onClick={handleMenuClick}
          className="text-2xl p-2 rounded-md hover:bg-blue-700 transition"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-white" />
          ) : (
            <RiMenu3Line className="text-white" />
          )}
        </button>

        {/* Page Title */}
        <div className="bg-blue-700 px-3 py-1 rounded-md">
          <span className="font-semibold text-sm md:text-base">
            {titles[location.pathname] || "Employee Dashboard"}
          </span>
        </div>
      </div>

      {/* Right Section: Notifications & Logo */}
      <div className="flex items-center gap-4">


        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
            alt="Logo"
            className="w-10 h-10 object-cover rounded-lg"
          />
          <span className="font-semibold text-lg hidden sm:block">
            Attendance
          </span>
        </div>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;