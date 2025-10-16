import { useEffect, useState } from "react";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

export default function EmployeeLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Employee Sidebar */}
      <EmployeeSidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />

        {/* Content Area */}
        <div className="p-4 overflow-y-scroll no-scrollbar bg-[#EFF0F1]">
          {children}
        </div>
      </div>
    </div>
  );
}
