

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch Summary Stats
      const summaryRes = await fetch("http://localhost:5000/api/attendance/summary");
      const summaryData = await summaryRes.json();
      setAttendanceData(summaryData);

      // Fetch All Attendance for Chart
      const allAttRes = await fetch("http://localhost:5000/api/attendance/allattendance");
      const allAttData = await allAttRes.json();
      setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

      // Fetch Approved Leaves for Chart
      const leavesRes = await fetch("http://localhost:5000/api/leaves/leaves?status=approved");
      const leavesResult = await leavesRes.json();
      setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Process Attendance Chart Data (Top 10 Employees)
  const processAttendanceData = () => {
    if (!Array.isArray(allAttendance)) return [];

    const counts = {};
    allAttendance.forEach(record => {
      // Robust name extraction
      const name = record.employeeName ||
        (typeof record.employeeId === 'object' ? record.employeeId?.name : null) ||
        record.employeeId ||
        "Unknown Staff";

      const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
      if (isPresent) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Process Leaves Chart Data (Top 10 Employees)
  const processLeavesData = () => {
    if (!Array.isArray(leavesData)) return [];

    const counts = {};
    leavesData.forEach(leave => {
      const name = leave.employeeName ||
        (typeof leave.employeeId === 'object' ? leave.employeeId?.name : null) ||
        leave.employeeId ||
        "Unknown Staff";

      // Count total days of leave instead of incidents
      const leaveDays = parseFloat(leave.days) || 1;
      counts[name] = (counts[name] || 0) + leaveDays;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
        Initializing Dashboard Analytics...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Oops!</p>
          <p>{error}</p>
        </div>
      </div>
    );

  const totals = attendanceData?.totals || {};
  const attendanceChartData = processAttendanceData();
  const leavesChartData = processLeavesData();

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gray-50/50">


      {/* ✅ Top Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          icon={FiUsers}
          label="Total Staff"
          value={totals.employees || 0}
          color="indigo"
          onClick={() => navigate("/employeelist")}
        />
        <StatCard
          icon={FiUserCheck}
          label="Present Today"
          value={totals.presentToday || 0}
          color="emerald"
          onClick={() => navigate("/today-attendance")}
        />
        <StatCard
          icon={FiUserX}
          label="Absent Today"
          value={totals.absentToday || 0}
          color="rose"
          onClick={() => navigate("/absent-today")}
        />
        <StatCard
          icon={FiClock}
          label="Late Arrival"
          value={totals.lateToday || 0}
          color="amber"
          onClick={() => navigate("/late-today")}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Success Rate"
          value={`${totals.attendanceRate || 0}%`}
          color="cyan"
          onClick={() => navigate("/attedancesummary")}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Top Attendance Performance</h3>
              <p className="text-sm text-gray-500">Most consistent present employees</p>
            </div>
            <button
              onClick={() => navigate("/attedancesummary")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View Detailed Report →
            </button>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={25}>
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Leave Utilization</h3>
              <p className="text-sm text-gray-500">Approved leave counts by employee</p>
            </div>
            <button
              onClick={() => navigate("/leavelist")}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
            >
              Analyze Leaves →
            </button>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leavesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLeaves)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Updated Stat Card Component for premium look
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const themes = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
  };

  return (
    <div
      className="flex flex-row items-center gap-3 p-3 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:translate-y-[-2px] active:scale-95 group"
      onClick={onClick}
    >
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${themes[color]} group-hover:bg-white`}>
        <Icon className="text-base" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg font-black text-gray-800 leading-tight">
          {typeof value === 'string' && value.includes('%') ? (
            value
          ) : (
            <CountUp end={parseFloat(value)} duration={2} />
          )}
        </p>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
