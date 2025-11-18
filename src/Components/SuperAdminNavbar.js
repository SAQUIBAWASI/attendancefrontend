import { Menu, X } from "lucide-react";

const SuperAdminNavbar = ({ isCollapsed, setIsCollapsed, isMobile, setIsMobile }) => {
  return (
    <header className="flex items-center justify-between w-full p-4 text-white bg-blue-800 shadow">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => {
          if (window.innerWidth < 768) setIsMobile(!isMobile);
          else setIsCollapsed(!isCollapsed);
        }}
        className="text-2xl text-white"
      >
        {isMobile ? <X /> : <Menu />}
      </button>

      <h1 className="text-lg font-bold">Super Admin Panel</h1>

      <div></div>
    </header>
  );
};

export default SuperAdminNavbar;
