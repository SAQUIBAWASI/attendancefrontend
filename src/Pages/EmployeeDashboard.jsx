




import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeNavbar from "../Components/EmployeeNavbar"; // ✅ Updated import
import EmployeeSidebar from "../Components/EmployeeSidebar";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Sidebar state (for responsiveness)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Email from location or localStorage
  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);

  // ✅ Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch employee details
  useEffect(() => {
    if (!email) return;
    const fetchEmployee = async () => {
      try {
        const res = await fetch(
          `https://api.timelyhealth.in/api/employees/get-employee?email=${email}`
        );
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };
    fetchEmployee();
  }, [email]);

  if (!profile) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <EmployeeSidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ✅ Employee Navbar */}
        <EmployeeNavbar
          setIsCollapsed={setIsCollapsed}
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          toggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* ✅ Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {profile.name} 👋
          </p>

          {/* Profile Card */}
          <div className="p-4 mt-6 bg-white shadow-md rounded-xl md:p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="p-4 text-blue-600 bg-blue-100 rounded-full">
                <FiUser className="text-3xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold md:text-xl">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {profile.role} — {profile.department}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  ID: {profile.employeeId} | Joined:{" "}
                  {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-3 text-lg">
            <DashboardCard
              icon={<FiCamera className="text-lg text-green-600" />}
              title="Mark Attendance"
              subtitle="Capture photo & location"
              onClick={() => navigate("/attendance-capture")}
            />
            <DashboardCard
              icon={<FiClock className="text-lg text-blue-600" />}
              title="My Records"
              subtitle="View attendance records"
              onClick={() => navigate("/myattendance")}
            />
            <DashboardCard
              icon={<FiCalendar className="text-lg text-purple-600" />}
              title="Leave Request"
              subtitle="Apply for leave"
              onClick={() => navigate("/leave-application")}
            />
          </div>

          {/* My Leave Requests Section */}
          <div
            onClick={() => navigate("/myleaves")}
            className="p-6 mt-10 transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <FiCalendar /> My Leave Requests
            </h3>
            <p className="text-sm text-gray-500">
              Track your leave applications and their status
            </p>
            <div className="flex justify-center mt-10 text-gray-400">
              <FiCalendar className="text-4xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ✅ DashboardCard Component
const DashboardCard = ({ icon, title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 transition transform bg-white shadow-md cursor-pointer rounded-xl hover:scale-105 hover:shadow-lg"
  >
    <div className="p-4 mb-3 bg-gray-100 rounded-full">{icon}</div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default EmployeeDashboard;
