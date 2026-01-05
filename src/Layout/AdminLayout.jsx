// import { useState, useEffect, Children } from "react";
// import { FiMenu } from "react-icons/fi";
// import { FaHome, FaUser, FaCog } from "react-icons/fa";
// import Sidebar from "../Components/Sidebar";
// import Navbar from "../Components/Navbar";

// export default function AdminLayout({children}) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <Sidebar isCollapsed={isCollapsed} isMobile={isMobile} setIsCollapsed={setIsCollapsed}/>

//       {/* Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Navbar */}
//        <Navbar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed}/>
//         <div className="p-4 overflow-y-scroll no-scrollbar bg-[#EFF0F1]">{children}</div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto collapse on mobile, keep open on desktop by default
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false); // Desktop pe by default open
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar close function - FOR ALL DEVICES
  const handleSidebarClose = () => {
    console.log("Layout: Closing sidebar");
    setIsCollapsed(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onLinkClick={handleSidebarClose} // This will close sidebar on ALL devices
      />
      
      {/* Main Content - Fixed space calculation */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : isCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-64'
      }`}>
        {/* Navbar */}
        <Navbar 
          setIsCollapsed={setIsCollapsed}
          isCollapsed={isCollapsed}
        />
        
        {/* Page Content - Remove extra padding if needed */}
        <main className="flex-1 p-0 overflow-auto bg-gray-100 md:p-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;