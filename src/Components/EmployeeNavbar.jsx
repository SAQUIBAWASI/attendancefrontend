import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isCollapsed = false, setIsCollapsed }) => {
  const navigate = useNavigate();

  // 🟩 Safe toggle handler
  const handleToggle = () => {
    if (typeof setIsCollapsed === "function") {
      setIsCollapsed((prev) => !prev);
    } else {
      console.warn("⚠️ setIsCollapsed not provided to Navbar, skipping toggle.");
    }
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-4 flex items-center shadow-md z-50">
      {/* Sidebar Toggle Button */}
      <button onClick={handleToggle} className="text-2xl p-2 focus:outline-none">
        {isCollapsed ? (
          <RiMenu2Line className="text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-[#AAAAAA]" />
        )}
      </button>

      {/* Title */}
      <div className="ml-3 text-lg font-semibold tracking-wide">
        Employee Dashboard
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Logo */}
      <div className="flex items-center gap-2 pl-4">
        <img
          src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
          alt="Logo"
          className="w-[38px] h-auto rounded-full"
        />
        <span className="hidden sm:block text-white font-bold text-lg">
          Attendance
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
