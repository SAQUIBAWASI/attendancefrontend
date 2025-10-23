import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
const navigate = useNavigate();
const totalNotifications = 5; // Dummy count

const handleNotificationsClick = () => {
navigate("/notifications");
};

return ( <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 px-4 flex items-center justify-between shadow-md z-50">
{/* Sidebar toggle button (left) */}
<button
onClick={() => setIsCollapsed(!isCollapsed)}
className="text-2xl p-2 rounded-md hover:bg-blue-700 transition"
>
{isCollapsed ? ( <RiMenu2Line className="text-[#AAAAAA]" />
) : ( <RiMenu3Line className="text-[#AAAAAA]" />
)} 
</button>
  {/* Center spacer for balance on desktop */}
  <div className="flex-grow hidden md:block"></div>

  {/* Notifications (middle on small screens, left on desktop if needed) */}
  {/* <div className="relative flex items-center md:order-2">
    <button
      onClick={handleNotificationsClick}
      className="relative p-2 hover:bg-blue-700 rounded-full transition"
    >
      <MdNotificationsNone className="text-2xl text-white" />
      {totalNotifications > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center">
          {totalNotifications}
        </span>
      )}
    </button>
  </div> */}

  {/* Logo + Title (right side) */}
  <div className="flex items-center gap-2 md:ml-4 md:order-3">
    <img
      src="https://t3.ftcdn.net/jpg/04/72/65/82/360_F_472658260_9eT6d4HzAt7lDZ8d5SAb5opOZikRH7AC.jpg"
      alt="Vendor Logo"
      className="w-10 h-10 object-cover"
    />
    <span className="font-semibold text-lg sm:text-xl">Attendance</span>
  </div>
</nav>
);
};

export default Navbar;
