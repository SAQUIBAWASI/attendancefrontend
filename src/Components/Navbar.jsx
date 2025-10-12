import { MdNotificationsNone } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  const totalNotifications = 5; // Dummy count

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-4 flex items-center shadow-lg z-50">
      {/* Sidebar toggle button */}
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl p-2">
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-[#AAAAAA]" />
        ) : (
          <RiMenu3Line className="text-2xl text-[#AAAAAA]" />
        )}
      </button>

      {/* Notifications */}
   

      {/* Spacer to push logo to right */}
      <div className="flex-grow"></div>

      {/* Logo + Redemly title on the right side */}
      <div className="flex items-center gap-2 pr-4">
        <img
          src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
          alt="Vendor Logo"
          className="w-[40px] h-auto" // No border or circle
        />
        <span className="text-white-400 font-bold text-lg">Attendance</span>
      </div>
    </nav>
  );
};

export default Navbar;
