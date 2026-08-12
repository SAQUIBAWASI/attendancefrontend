import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { runAdminMissedLoginCheck } from "../utils/adminMissedLoginAlert";
import { getAdminEmail } from "../utils/adminSession";

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile only
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Only auto collapse when entering mobile first time
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar after link click
  const handleSidebarClose = () => {
    setIsCollapsed(true);
  };

  // Check all employees for missed login every minute and notify admin
  useEffect(() => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) return;

    const runCheck = () => {
      runAdminMissedLoginCheck(true);
    };

    runCheck();
    const intervalId = setInterval(runCheck, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runCheck();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        onLinkClick={handleSidebarClose}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
        ${
          isMobile
            ? "ml-0"
            : isCollapsed
            ? "ml-16"
            : "ml-52"
        }`}
      >
        {/* Navbar */}
        <Navbar
          setIsCollapsed={setIsCollapsed}
          isCollapsed={isCollapsed}
        />

        {/* Page Content */}
        <main className="flex-1 p-2 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};


export default AdminLayout;