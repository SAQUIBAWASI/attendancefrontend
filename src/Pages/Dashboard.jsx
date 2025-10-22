import { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
  FiClock,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendanceFilter, setAttendanceFilter] = useState("weekly");
  const [departmentFilter, setDepartmentFilter] = useState("weekly");
  const [locationFilter, setLocationFilter] = useState("weekly");

  const navigate = useNavigate();

  // Fetch Attendance Data
  const fetchAttendanceData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance/summary");
      const data = await res.json();
      setAttendanceData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch attendance data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading Attendance Data...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );

  if (!attendanceData)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No attendance data available
      </div>
    );

  const totals = attendanceData.totals || [];
  const charts = attendanceData.charts || [];

  // Pie chart for attendance distribution
  const attendanceDistribution = [
    { name: "Present", value: totals.presentToday || 0, color: "#10B981" },
    { name: "Absent", value: totals.absentToday || 0, color: "#EF4444" },
    { name: "Late", value: totals.lateToday || 0, color: "#F59E0B" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "text-green-600 bg-green-100";
      case "Absent":
        return "text-red-600 bg-red-100";
      case "Late":
        return "text-yellow-600 bg-yellow-100";
      case "WFH":
        return "text-blue-600 bg-blue-100";
      case "Pending":
        return "text-orange-600 bg-orange-100";
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Navigation Handlers
  const handleTotalEmployeesClick = () => navigate("/employeelist");
  const handlePresentTodayClick = () => navigate("/today-attendance");
  const handleAbsentTodayClick = () => navigate("/absent-today?filter=absent");
  const handleLateTodayClick = () => navigate("/late-today?filter=late");
  const handleAttendanceRateClick = () => navigate("/attendance-reports");

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="mb-6 text-3xl font-bold text-gray-800">
        Attendance Dashboard
      </h2>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={FiUsers}
          label="Total Employees"
          value={totals.employees || 0}
          color="blue"
          onClick={handleTotalEmployeesClick}
        />
        <StatCard
          icon={FiUserCheck}
          label="Present Today"
          value={totals.presentToday || 0}
          color="green"
          onClick={handlePresentTodayClick}
        />
        <StatCard
          icon={FiUserX}
          label="Absent Today"
          value={totals.absentToday || 0}
          color="red"
          onClick={handleAbsentTodayClick}
        />
        <StatCard
          icon={FiClock}
          label="Late Today"
          value={totals.lateToday || 0}
          color="yellow"
          onClick={handleLateTodayClick}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Attendance Rate"
          value={`${totals.attendanceRate || 0}%`}
          color="emerald"
          onClick={handleAttendanceRateClick}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        {/* Attendance Trend */}
        <div className="p-4 bg-white rounded-lg shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Attendance Trend</h3>
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.attendanceTrendData?.[attendanceFilter] || []}>
                <XAxis dataKey={attendanceFilter === "weekly" ? "day" : "week"} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="mb-2 text-xl font-semibold">Today's Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 space-x-4">
            {attendanceDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department & Location */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
        {/* Department */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Department-wise Attendance</h3>
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentData?.[departmentFilter] || []}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Location-wise Attendance</h3>
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.locationData?.[locationFilter] || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100",
    red: "text-red-600 bg-red-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div
      className="flex items-center justify-between p-4 transition-shadow duration-300 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg"
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">
          <CountUp end={parseFloat(value)} duration={1.5} />
        </p>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
