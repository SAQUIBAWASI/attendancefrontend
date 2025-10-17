import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
  FiUserX,
  FiXCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AttendanceDashboard = () => {
  const [attendanceFilter, setAttendanceFilter] = useState("weekly");
  const [departmentFilter, setDepartmentFilter] = useState("weekly");
  const [locationFilter, setLocationFilter] = useState("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const employeesPerPage = 5;
  const pendingPerPage = 5;

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockData = {
            totals: {
              employees: 156,
              presentToday: 142,
              absentToday: 8,
              lateToday: 6,
              attendanceRate: 91.2
            },
            todayStats: {
              pendingApproval: 12,
              regularized: 8,
              onLeave: 14,
              wfh: 18
            },
            charts: {
              attendanceTrendData: {
                weekly: [
                  { day: "Mon", present: 148, absent: 8 },
                  { day: "Tue", present: 152, absent: 4 },
                  { day: "Wed", present: 145, absent: 11 },
                  { day: "Thu", present: 150, absent: 6 },
                  { day: "Fri", present: 142, absent: 14 },
                  { day: "Sat", present: 138, absent: 18 },
                  { day: "Sun", present: 120, absent: 36 }
                ],
                monthly: [
                  { week: "Week 1", present: 720, absent: 60 },
                  { week: "Week 2", present: 735, absent: 45 },
                  { week: "Week 3", present: 710, absent: 70 },
                  { week: "Week 4", present: 725, absent: 55 }
                ]
              },
              departmentData: {
                weekly: [
                  { name: "Engineering", present: 45, absent: 3 },
                  { name: "Sales", present: 38, absent: 2 },
                  { name: "Marketing", present: 28, absent: 4 },
                  { name: "HR", present: 12, absent: 0 },
                  { name: "Finance", present: 19, absent: 1 }
                ]
              },
              locationData: {
                weekly: [
                  { name: "Main Office", present: 89, absent: 4 },
                  { name: "Branch A", present: 32, absent: 3 },
                  { name: "Branch B", present: 21, absent: 1 },
                  { name: "Remote", present: 18, absent: 2 }
                ]
              }
            },
            tables: {
              todayAttendance: [
                { employee: "John Doe", department: "Engineering", checkIn: "09:05 AM", checkOut: "06:15 PM", status: "Present", location: "Main Office" },
                { employee: "Jane Smith", department: "Sales", checkIn: "08:55 AM", checkOut: "05:45 PM", status: "Present", location: "Branch A" },
                { employee: "Mike Johnson", department: "Marketing", checkIn: "09:25 AM", checkOut: "06:30 PM", status: "Late", location: "Main Office" },
                { employee: "Sarah Wilson", department: "HR", checkIn: "-", checkOut: "-", status: "Absent", location: "-" },
                { employee: "David Brown", department: "Engineering", checkIn: "09:15 AM", checkOut: "06:20 PM", status: "Late", location: "Main Office" },
                { employee: "Emily Davis", department: "Finance", checkIn: "08:45 AM", checkOut: "05:30 PM", status: "Present", location: "Branch B" },
                { employee: "Robert Lee", department: "Sales", checkIn: "-", checkOut: "-", status: "WFH", location: "Remote" }
              ],
              pendingAttendance: [
                { employee: "Chris Evans", department: "Engineering", date: "2024-01-15", reason: "Doctor Appointment", type: "Late Come", status: "Pending" },
                { employee: "Lisa Ray", department: "Marketing", date: "2024-01-15", reason: "Family Emergency", type: "Early Leave", status: "Pending" },
                { employee: "Tom Hanks", department: "Sales", date: "2024-01-14", reason: "Vehicle Breakdown", type: "Absent", status: "Pending" },
                { employee: "Emma Watson", department: "HR", date: "2024-01-15", reason: "Personal Work", type: "Late Come", status: "Pending" },
                { employee: "James Bond", department: "Finance", date: "2024-01-13", reason: "Health Issues", type: "Absent", status: "Pending" }
              ]
            }
          };
          setAttendanceData(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading Attendance Data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!attendanceData) {
    return <div className="flex items-center justify-center h-screen">No attendance data available</div>;
  }

  // Pagination logic for today's attendance
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = attendanceData.tables.todayAttendance.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(attendanceData.tables.todayAttendance.length / employeesPerPage);

  // Pagination logic for pending attendance
  const indexOfLastPending = pendingPage * pendingPerPage;
  const indexOfFirstPending = indexOfLastPending - pendingPerPage;
  const currentPending = attendanceData.tables.pendingAttendance.slice(indexOfFirstPending, indexOfLastPending);
  const totalPendingPages = Math.ceil(attendanceData.tables.pendingAttendance.length / pendingPerPage);

  // Pie chart data for attendance distribution
  const attendanceDistribution = [
    { name: 'Present', value: attendanceData.totals.presentToday, color: '#10B981' },
    { name: 'Absent', value: attendanceData.totals.absentToday, color: '#EF4444' },
    { name: 'Late', value: attendanceData.totals.lateToday, color: '#F59E0B' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-100';
      case 'Absent': return 'text-red-600 bg-red-100';
      case 'Late': return 'text-yellow-600 bg-yellow-100';
      case 'WFH': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-orange-600 bg-orange-100';
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Navigation handlers for stat cards
  const handleTotalEmployeesClick = () => navigate("/employeelist");
  const handlePresentTodayClick = () => navigate("/today-attendance");
  const handleAbsentTodayClick = () => navigate("/absent-today?filter=absent");
  const handleLateTodayClick = () => navigate("/late-today?filter=late");
  const handleAttendanceRateClick = () => navigate("/attendance-reports");
  const handleTodaysAttendanceClick = () => navigate("/today-attendance");
  const handlePendingApprovalClick = () => navigate("/pendings-attendance");
  // const handleRegularizedClick = () => navigate("/attendance-regularization");
  // const handleOnLeaveWFHClick = () => navigate("/leave-applications");

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          icon={FiUsers} 
          label="Total Employees" 
          value={attendanceData.totals.employees} 
          color="blue" 
          onClick={handleTotalEmployeesClick}
        />
        <StatCard 
          icon={FiUserCheck} 
          label="Present Today" 
          value={attendanceData.totals.presentToday} 
          color="green" 
          onClick={handlePresentTodayClick}
        />
        <StatCard 
          icon={FiUserX} 
          label="Absent Today" 
          value={attendanceData.totals.absentToday} 
          color="red" 
          onClick={handleAbsentTodayClick}
        />
        <StatCard 
          icon={FiClock} 
          label="Late Today" 
          value={attendanceData.totals.lateToday} 
          color="yellow" 
          onClick={handleLateTodayClick}
        />
        <StatCard 
          icon={FiTrendingUp} 
          label="Attendance Rate" 
          value={`${attendanceData.totals.attendanceRate}%`} 
          color="emerald" 
          onClick={handleAttendanceRateClick}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={FiCalendar} 
          label="Today's Attendance" 
          value={attendanceData.totals.presentToday + attendanceData.totals.lateToday} 
          color="purple" 
          onClick={handleTodaysAttendanceClick}
        />
        <StatCard 
          icon={FiClock} 
          label="Pending Approval" 
          value={attendanceData.todayStats.pendingApproval} 
          color="orange" 
          onClick={handlePendingApprovalClick}
        />
        {/* <StatCard 
          icon={FiCheckCircle} 
          label="Regularized" 
          value={attendanceData.todayStats.regularized} 
          color="green" 
          onClick={handleRegularizedClick}
        /> */}
        {/* <StatCard 
          icon={FiGrid} 
          label="On Leave/WFH" 
          value={attendanceData.todayStats.onLeave + attendanceData.todayStats.wfh} 
          color="blue" 
          onClick={handleOnLeaveWFHClick}
        /> */}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        {/* Attendance Trend Chart */}
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
              <BarChart data={attendanceData.charts.attendanceTrendData[attendanceFilter]}>
                <XAxis dataKey={attendanceFilter === "weekly" ? "day" : "week"} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution Pie Chart */}
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

      {/* Department & Location Charts */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
        {/* Department-wise Attendance */}
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
              <BarChart data={attendanceData.charts.departmentData[departmentFilter]}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location-wise Attendance */}
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
              <BarChart data={attendanceData.charts.locationData[locationFilter]}>
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

      {/* Today's Attendance Table */}
      <div className="p-4 mt-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Today's Attendance</h3>
          <button
            onClick={() => navigate("/today-attendance")}
            className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded hover:bg-blue-700"
          >
            View All Records
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-gray-700 bg-gray-100">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Check In</th>
                <th className="px-4 py-2">Check Out</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, idx) => (
                <tr key={idx} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/employee-details/${employee.employee.replace(/\s+/g, '-').toLowerCase()}`)}>
                  <td className="px-4 py-2 font-medium">{employee.employee}</td>
                  <td className="px-4 py-2">{employee.department}</td>
                  <td className="px-4 py-2">{employee.checkIn}</td>
                  <td className="px-4 py-2">{employee.checkOut}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{employee.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstEmployee + 1}-{Math.min(indexOfLastEmployee, attendanceData.tables.todayAttendance.length)} of {attendanceData.tables.todayAttendance.length} records
          </p>
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      

      {/* Leave  Requests Table */}
      <div className="p-4 mt-8 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Leave Requests</h3>
          <button
            onClick={() => navigate("/leavelist")}
            className="px-4 py-2 text-sm text-white transition bg-orange-600 rounded hover:bg-orange-700"
          >
            Manage All Requests
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-gray-700 bg-gray-100">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPending.map((request, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{request.employee}</td>
                  <td className="px-4 py-2">{request.department}</td>
                  <td className="px-4 py-2">{request.date}</td>
                  <td className="px-4 py-2">{request.reason}</td>
                  <td className="px-4 py-2">{request.type}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button 
                        className="text-green-600 hover:text-green-800"
                        onClick={() => navigate(`/attendance-requests?action=approve&id=${idx}`)}
                      >
                        <FiCheckCircle size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => navigate(`/attendance-requests?action=reject&id=${idx}`)}
                      >
                        <FiXCircle size={16} />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/attendance-requests?action=view&id=${idx}`)}
                      >
                        <FiAlertCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstPending + 1}-{Math.min(indexOfLastPending, attendanceData.tables.pendingAttendance.length)} of {attendanceData.tables.pendingAttendance.length} requests
          </p>
          <div className="flex space-x-2">
            {Array.from({ length: totalPendingPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPendingPage(i + 1)}
                className={`px-3 py-1 rounded ${pendingPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>




      {/* Quick Actions */}
      <div className="p-4 mt-8 bg-white rounded-lg shadow-md">
        <h3 className="mb-4 text-2xl font-bold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* <button
            onClick={() => navigate("/attendancelist")}
            className="flex flex-col items-center justify-center px-4 py-3 text-white transition bg-purple-600 rounded hover:bg-purple-700"
          >
            <FiCalendar className="mb-1 text-xl" />
            <span>Mark Attendance</span>
          </button> */}
          <button
            onClick={() => navigate("/leavelist")}
            className="flex flex-col items-center justify-center px-4 py-3 text-white transition bg-orange-600 rounded hover:bg-orange-700"
          >
            <FiClock className="mb-1 text-xl" />
            <span>Manage Requests</span>
          </button>
          <button
            onClick={() => navigate("/attendancelist")}
            className="flex flex-col items-center justify-center px-4 py-3 text-white transition bg-green-600 rounded hover:bg-green-700"
          >
            <FiTrendingUp className="mb-1 text-xl" />
            <span>Generate Reports</span>
          </button>
          <button
            onClick={() => navigate("/employeelist")}
            className="flex flex-col items-center justify-center px-4 py-3 text-white transition bg-blue-600 rounded hover:bg-blue-700"
          >
            <FiUsers className="mb-1 text-xl" />
            <span>Employee Management</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated Stat Card Component with Navigation
const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    yellow: "text-yellow-600 bg-yellow-100",
    orange: "text-orange-600 bg-orange-100",
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
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default AttendanceDashboard;