// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import EmployeeNavbar from "../Components/EmployeeNavbar";
// import EmployeeSidebar from "../Components/EmployeeSidebar";

// export default function EmployeeLayout({ children }) {
//   const location = useLocation();

//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [isCollapsed, setIsCollapsed] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       if (mobile) setIsCollapsed(true);
//       else setIsCollapsed(false);
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize(); // Initial check
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     if (isMobile) setIsCollapsed(true);
//   }, [location.pathname, isMobile]);

//   const sidebarMargin = isMobile
//     ? "ml-0"
//     : isCollapsed
//       ? "ml-16"
//       : "ml-52";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Sidebar - FIXED POSITION */}
//       <div className={`${isMobile ? 'fixed' : 'fixed'} h-screen z-30`}>
//         <EmployeeSidebar
//           isCollapsed={isCollapsed}
//           isMobile={isMobile}
//           onClose={() => setIsCollapsed(true)}
//         />
//       </div>

//       {/* Main Content */}
//       <div
//         className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarMargin}`}
//       >
//         {/* Navbar - FIXED AT TOP */}
//         <div className="sticky top-0 z-20 bg-white shadow-sm">
//           <EmployeeNavbar
//             isCollapsed={isCollapsed}
//             setIsCollapsed={setIsCollapsed}
//           />
//         </div>

//         {/* Page Content - NO EXTRA PADDING */}
//         <main className="flex-1">
//           {children}
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {isMobile && !isCollapsed && (
//         <div
//           className="fixed inset-0 z-10 bg-black bg-opacity-50"
//           onClick={() => setIsCollapsed(true)}
//         />
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import EmployeeNavbar from "../Components/EmployeeNavbar";
import EmployeeSidebar from "../Components/EmployeeSidebar";

export default function EmployeeLayout({ children }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const closeSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ${
        isMobile 
          ? (isSidebarCollapsed ? "-translate-x-full" : "translate-x-0") 
          : ""
      } ${isSidebarCollapsed ? "w-16" : "w-52"}`}>
        <EmployeeSidebar
          isCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          onClose={closeSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${
        isMobile 
          ? "ml-0" 
          : isSidebarCollapsed ? "ml-16" : "ml-52"
      }`}>
        {/* Navbar */}
        <div className="sticky top-0 z-20">
          <EmployeeNavbar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Page Content */}
        <main className="p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay - Shows when sidebar is open on mobile */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}

