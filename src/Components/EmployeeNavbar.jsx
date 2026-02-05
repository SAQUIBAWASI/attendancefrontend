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


// import { useEffect, useState } from "react"; // ✅ Import Hooks
// import { MdNotificationsNone } from "react-icons/md"; // ✅ Import Icon
// import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
// import { useLocation, useNavigate } from "react-router-dom";

// const EmployeeNavbar = ({ isCollapsed, setIsCollapsed }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [unreadCount, setUnreadCount] = useState(0);

//   // ✅ Fetch Unread Count for Employee
//   useEffect(() => {
//     const fetchUnreadCount = async () => {
//       try {
//         const employeeId = localStorage.getItem("employeeId");
//         if (!employeeId) return;

//         const API_BASE_URL = "https://api.timelyhealth.in";
//         const res = await fetch(`${API_BASE_URL}/notifications/unread/${employeeId}`);
//         if (res.ok) {
//           const data = await res.json();
//           setUnreadCount(data.unreadCount || 0);
//         }
//       } catch (error) {
//         console.error("Error fetching notification count:", error);
//       }
//     };

//     fetchUnreadCount();
//     const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
//     return () => clearInterval(interval);
//   }, []);


//   const titles = {
//     "/employeedashboard": "Employee Dashboard",
//     "/leave-application": "Leave Application",
//     "/myleaves": "My Leaves",
//     "/myattendance": "My Attendance Records",
//     "/attendance-capture": "Check In",
//     "/my-shift": "My Shift",
//     "/mylocation": "My Assigned Location",
//     "/mysalary": "My Salary",
//     "/mypermissions": "My Permissions",
//     "/notifications": "Notifications",
//     "/emp-notifications": "Notifications", // ✅ Added
//   };

//   const handleMenuClick = () => {
//     if (setIsCollapsed && typeof setIsCollapsed === 'function') {
//       setIsCollapsed(prev => !prev);
//     }
//   };

//   return (
//     <nav className="bg-blue-800 text-white sticky top-0 w-full h-14 px-4 flex items-center justify-between shadow-md z-40">
//       <div className="flex items-center gap-4">
//         {/* Menu Button */}
//         <button
//           onClick={handleMenuClick}
//           className="text-2xl p-2 rounded-md hover:bg-blue-700 transition"
//         >
//           {isCollapsed ? (
//             <RiMenu2Line className="text-white" />
//           ) : (
//             <RiMenu3Line className="text-white" />
//           )}
//         </button>

//         {/* Page Title */}
//         <div className="bg-blue-700 px-3 py-1 rounded-md">
//           <span className="font-semibold text-sm md:text-base">
//             {titles[location.pathname] || "Employee Dashboard"}
//           </span>
//         </div>
//       </div>

//       {/* Right Section: Notifications & Logo */}
//       <div className="flex items-center gap-4">

//         {/* 🔔 Notification Bell */}
//         <button
//           onClick={() => {
//             navigate("/emp-notifications");
//             setUnreadCount(0);
//           }}
//           className="relative p-2 transition rounded-full hover:bg-blue-700"
//         >
//           <MdNotificationsNone className="text-2xl text-white" />
//           {unreadCount > 0 && (
//             <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
//               {unreadCount}
//             </span>
//           )}
//         </button>

//         {/* Logo */}
//         <div className="flex items-center gap-2">
//           <img
//             src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
//             alt="Logo"
//             className="w-10 h-10 object-cover rounded-lg"
//           />
//           <span className="font-semibold text-lg hidden sm:block">
//             Attendance
//           </span>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default EmployeeNavbar;


import axios from "axios"; // ✅ Axios import करें
import { useEffect, useState } from "react";
import { MdNotificationsNone } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const EmployeeNavbar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch Unread Count for Employee
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const employeeId = localStorage.getItem("employeeId");
        if (!employeeId) {
          console.log("No employeeId found in localStorage");
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }

        console.log("Fetching notifications for employeeId:", employeeId);

        // Method 1: Try with axios first
        try {
          const response = await axios.get(`${API_BASE_URL}/notifications/unread/${employeeId}`);
          console.log("Notifications API response:", response.data);

          if (response.data && response.data.unreadCount !== undefined) {
            setUnreadCount(response.data.unreadCount);
          } else if (response.data && response.data.count !== undefined) {
            setUnreadCount(response.data.count);
          } else if (Array.isArray(response.data)) {
            setUnreadCount(response.data.length);
          }
        } catch (axiosError) {
          console.error("Axios error fetching notifications:", axiosError);

          // Method 2: Fallback to fetch API
          try {
            const res = await fetch(`${API_BASE_URL}/notifications/unread/${employeeId}`);
            if (res.ok) {
              const data = await res.json();
              console.log("Fetch API notifications data:", data);

              if (data.unreadCount !== undefined) {
                setUnreadCount(data.unreadCount);
              } else if (data.count !== undefined) {
                setUnreadCount(data.count);
              }
            } else {
              console.error("Fetch API failed with status:", res.status);
              setUnreadCount(0);
            }
          } catch (fetchError) {
            console.error("Fetch API error:", fetchError);
            setUnreadCount(0);
          }
        }
      } catch (error) {
        console.error("Overall error fetching notification count:", error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 10000);

    // Listen for custom events from other components
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notification-updated', handleNotificationUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-updated', handleNotificationUpdate);
    };
  }, []);

  // ✅ Handle notification click
  const handleNotificationClick = () => {
    // Reset counter
    setUnreadCount(0);

    // Dispatch event for other components
    window.dispatchEvent(new Event('notification-read'));

    // Navigate to notifications page
    navigate("/emp-notifications");
  };

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
    "/emp-notifications": "Notifications",
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
        {/* 🔔 Notification Bell with real-time count */}
        <button
          onClick={handleNotificationClick}
          className="relative p-2 transition rounded-full hover:bg-blue-700"
          title="Notifications"
          disabled={isLoading}
        >
          <MdNotificationsNone className="text-2xl text-white" />

          {!isLoading && unreadCount > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {isLoading && (
            <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full -top-1 -right-1">
              ...
            </span>
          )}
        </button>

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