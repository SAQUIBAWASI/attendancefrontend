import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiClock,
  FiUser,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Email from location or localStorage
  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);

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
    <div className="min-h-screen bg-gray-100">
      <main className="p-2">
        <p className="text-2xl font-bold text-gray-800 mb-4">
          Welcome back, {profile.name} 👋
        </p>

        {/* Top Row: Profile Card and Mark Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Profile Card */}
          <div className="p-4 bg-white shadow-md rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 text-blue-600 bg-blue-100 rounded-full">
                <FiUser className="text-2xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
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

          {/* Mark Attendance Card */}
          <DashboardCard
            icon={<FiCamera className="text-xl text-green-600" />}
            title="Mark Attendance"
            subtitle="Capture photo & location"
            onClick={() => navigate("/attendance-capture")}
          />
        </div>

        {/* Bottom Row: My Records, My Leaves, Leave Request */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            icon={<FiClock className="text-xl text-blue-600" />}
            title="My Records"
            subtitle="View attendance records"
            onClick={() => navigate("/myattendance")}
          />
          
          <div
            onClick={() => navigate("/myleaves")}
            className="flex flex-col items-center justify-center p-6 transition transform bg-white shadow-md cursor-pointer rounded-xl hover:scale-105 hover:shadow-lg"
          >
            <div className="p-4 mb-3 bg-gray-100 rounded-full">
              <FiCalendar className="text-xl text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800">My Leaves</h4>
            <p className="text-sm text-gray-500">Track leave applications</p>
          </div>
          
          <DashboardCard
            icon={<FiCalendar className="text-xl text-orange-600" />}
            title="Leave Request"
            subtitle="Apply for leave"
            onClick={() => navigate("/leave-application")}
          />
        </div>
      </main>
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