import { useEffect, useState } from "react";
import { FiCalendar, FiCamera, FiCheckCircle, FiClock, FiTrendingUp, FiUser, FiXCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../Components/EmployeeSidebar";
import Navbar from "../Components/Navbar";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!email) return;
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`https://attendancebackend-5cgn.onrender.com/api/employees/get-employee?email=${email}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployee();
  }, [email]);

  if (!profile) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar: fixed height, scrollable */}
      <div className="flex-shrink-0 h-full overflow-y-auto">
        <EmployeeSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
          <p className="text-gray-500">Welcome back, {profile.name} 👋</p>

          {/* Profile Card */}
          <div className="p-6 mb-6 bg-white shadow-md rounded-xl mt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 text-blue-600 bg-blue-100 rounded-full">
                <FiUser className="text-3xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.role} — {profile.department}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Employee ID: {profile.employeeId} | Joined: {new Date(profile.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              icon={<FiCamera className="text-3xl text-green-600" />}
              title="Mark Attendance"
              subtitle="Capture photo & location"
              onClick={() => navigate("/attendance-capture")}
            />
            <DashboardCard
              icon={<FiClock className="text-3xl text-blue-600" />}
              title="My Attendance"
              subtitle="View attendance records"
              onClick={() => navigate("/myattendance")}
            />
            <DashboardCard
              icon={<FiCalendar className="text-3xl text-purple-600" />}
              title="Leave Request"
              subtitle="Apply for leave"
              onClick={() => navigate("/leave-application")}
            />
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Days" value={profile.totalDays || 0} icon={<FiCalendar />} color="blue" />
            <StatCard label="Present Days" value={profile.presentDays || 0} icon={<FiCheckCircle />} color="green" />
            <StatCard label="Absent Days" value={profile.absentDays || 0} icon={<FiXCircle />} color="red" />
            <StatCard label="Attendance Rate" value={`${profile.attendanceRate || 0}%`} icon={<FiTrendingUp />} color="purple" />
          </div>

{/* My Leave Requests */}
<div
  onClick={() => navigate("/myleaves")}
  className="mt-10 p-6 bg-white rounded-xl shadow-md cursor-pointer hover:shadow-lg transition"
>
  <h3 className="text-lg font-semibold flex items-center gap-2">
    <FiCalendar /> My Leave Requests
  </h3>
  <p className="text-sm text-gray-500">Track your leave applications and their status</p>
  <div className="flex justify-center mt-10 text-gray-400">
    <FiCalendar className="text-4xl" />
  </div>
</div>

        </main>
      </div>
    </div>
  );
};

// Dashboard Card
const DashboardCard = ({ icon, title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md cursor-pointer transition transform hover:scale-105 hover:shadow-lg"
  >
    <div className="p-4 bg-gray-100 rounded-full mb-3">{icon}</div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

// Stat Card
const StatCard = ({ label, value, icon, color }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
