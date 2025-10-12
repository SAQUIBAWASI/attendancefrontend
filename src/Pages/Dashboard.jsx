import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiTrendingUp,
  FiGrid,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

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
    return <div className="flex justify-center items-center h-screen">Loading Attendance Data...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!attendanceData) {
    return <div className="flex justify-center items-center h-screen">No attendance data available</div>;
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
  const handlePresentTodayClick = () => navigate("/attendance-records?filter=present");
  const handleAbsentTodayClick = () => navigate("/attendance-records?filter=absent");
  const handleLateTodayClick = () => navigate("/attendance-records?filter=late");
  const handleAttendanceRateClick = () => navigate("/attendance-reports");
  const handleTodaysAttendanceClick = () => navigate("/mark-attendance");
  const handlePendingApprovalClick = () => navigate("/attendance-requests");
  const handleRegularizedClick = () => navigate("/attendance-regularization");
  const handleOnLeaveWFHClick = () => navigate("/leave-applications");

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        <StatCard 
          icon={FiCheckCircle} 
          label="Regularized" 
          value={attendanceData.todayStats.regularized} 
          color="green" 
          onClick={handleRegularizedClick}
        />
        <StatCard 
          icon={FiGrid} 
          label="On Leave/WFH" 
          value={attendanceData.todayStats.onLeave + attendanceData.todayStats.wfh} 
          color="blue" 
          onClick={handleOnLeaveWFHClick}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Attendance Trend</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
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
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-xl font-semibold mb-2">Today's Distribution</h3>
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
          <div className="flex justify-center space-x-4 mt-2">
            {attendanceDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department & Location Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Department-wise Attendance */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Department-wise Attendance</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
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
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Location-wise Attendance</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
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
      <div className="bg-white rounded-lg shadow-md p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Today's Attendance</h3>
          <button
            onClick={() => navigate("/attendance-records")}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm"
          >
            View All Records
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
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
                <tr key={idx} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/employee-details/${employee.employee.replace(/\s+/g, '-').toLowerCase()}`)}>
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
        <div className="flex justify-between items-center mt-4">
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

      {/* Pending Attendance Requests Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Pending Attendance Requests</h3>
          <button
            onClick={() => navigate("/attendance-requests")}
            className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition text-sm"
          >
            Manage All Requests
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
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
        <div className="flex justify-between items-center mt-4">
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
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/attendancelist")}
            className="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 transition flex flex-col items-center justify-center"
          >
            <FiCalendar className="text-xl mb-1" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate("/attendancelist")}
            className="bg-orange-600 text-white py-3 px-4 rounded hover:bg-orange-700 transition flex flex-col items-center justify-center"
          >
            <FiClock className="text-xl mb-1" />
            <span>Manage Requests</span>
          </button>
          <button
            onClick={() => navigate("/attendance-reports")}
            className="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition flex flex-col items-center justify-center"
          >
            <FiTrendingUp className="text-xl mb-1" />
            <span>Generate Reports</span>
          </button>
          <button
            onClick={() => navigate("/employeelist")}
            className="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition flex flex-col items-center justify-center"
          >
            <FiUsers className="text-xl mb-1" />
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
      className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default AttendanceDashboard;