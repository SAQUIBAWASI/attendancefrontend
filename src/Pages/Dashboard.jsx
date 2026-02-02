
// import { useEffect, useState } from "react";
// import CountUp from "react-countup";
// import { FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { isEmployeeHidden } from "../utils/employeeStatus"; // ✅ Import utility

// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts';

// // ✅ API Base URL
// const API_BASE_URL = "http://localhost:5000/api";

// const AttendanceDashboard = () => {
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [allAttendance, setAllAttendance] = useState([]);
//   const [leavesData, setLeavesData] = useState([]);
//   const [monthlyAbsence, setMonthlyAbsence] = useState([]);
//   const [lateData, setLateData] = useState([]); // Store late records directly from API
//   const [employees, setEmployees] = useState([]); // Store employee list
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // 1. Fetch Employees (for name mapping)
//       const empRes = await fetch(`${API_BASE_URL}/employees/get-employees`);
//       if (!empRes.ok) throw new Error("Failed to fetch employees");
//       const empData = await empRes.json();
//       setEmployees(empData || []);

//       // 2. Fetch Summary Stats
//       const summaryRes = await fetch(`${API_BASE_URL}/attendance/summary`);
//       if (!summaryRes.ok) throw new Error("Failed to fetch summary");
//       const summaryData = await summaryRes.json();
//       setAttendanceData(summaryData);

//       // 3. Fetch All Attendance for Chart
//       const allAttRes = await fetch(`${API_BASE_URL}/attendance/allattendance`);
//       if (!allAttRes.ok) throw new Error("Failed to fetch attendance records");
//       const allAttData = await allAttRes.json();
//       setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

//       // 4. Fetch Approved Leaves for Chart
//       const leavesRes = await fetch(`${API_BASE_URL}/leaves/leaves?status=approved`);
//       if (!leavesRes.ok) throw new Error("Failed to fetch leaves");
//       const leavesResult = await leavesRes.json();
//       setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

//       // 5. Fetch Monthly Absence
//       const monthlyRes = await fetch(`${API_BASE_URL}/attendance/monthly-absence`);
//       if (monthlyRes.ok) {
//         const monthlyResult = await monthlyRes.json();
//         setMonthlyAbsence(monthlyResult.data || []);
//       }

//       // 6. Fetch Late Attendance (Dedicated API)
//       const lateRes = await fetch(`${API_BASE_URL}/attendance/lateattendance`);
//       if (lateRes.ok) {
//         const lateResult = await lateRes.json();
//         setLateData(lateResult.records || []);
//       }

//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch dashboard data. Please ensure the backend server is running.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     const interval = setInterval(fetchData, 60000); // Update every minute
//     return () => clearInterval(interval);
//   }, []);

//   // 🔹 Helper: Get Employee Name by ID
//   const getEmployeeName = (id) => {
//     if (!id) return "Unknown";
//     const emp = employees.find(e => e.employeeId === id || e._id === id);
//     return emp ? emp.name : id;
//   };

//   // 🔹 Filter Inactive Employees
//   const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

//   // Process Attendance Chart Data (Top 10 Employees)
//   const processAttendanceData = () => {
//     if (!Array.isArray(allAttendance)) return [];

//     const counts = {};
//     allAttendance.forEach(record => {
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const name = getEmployeeName(id); // Resolve name
//       const label = `${name} (${id})`;

//       const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
//       if (isPresent) {
//         counts[label] = (counts[label] || 0) + 1;
//       }
//     });

//     return Object.entries(counts)
//       .map(([name, count]) => ({ name, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);
//   };

//   // Process Leaves Data (With IDs)
//   const processLeavesData = () => {
//     if (!Array.isArray(leavesData)) return [];

//     const counts = {};
//     leavesData.forEach(leave => {
//       const id = (typeof leave.employeeId === 'object' ? leave.employeeId?.employeeId : leave.employeeId);
//       const name = getEmployeeName(id) || "Unknown Staff";
//       // ADDING ID TO LABEL
//       const label = id ? `${name} (${id})` : name;

//       // Count total days of leave
//       const leaveDays = parseFloat(leave.days) || 1;
//       counts[label] = (counts[label] || 0) + leaveDays;
//     });

//     return Object.entries(counts)
//       .map(([name, count]) => ({ name, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);
//   };

//   // Process Late Today Data (From /lateattendance API) - For Pie Chart
//   const processLateTodayData = () => {
//     // Use the dedicated lateData state if available, otherwise filter from allAttendance (fallback)
//     const sourceData = lateData.length > 0 ? lateData : allAttendance.filter(r => {
//       // Fallback robust check
//       if (!r.checkInTime) return false;
//       const today = new Date().toISOString().split('T')[0];
//       const rDate = new Date(r.checkInTime).toISOString().split('T')[0];
//       if (rDate !== today) return false;

//       // Use simplified late check if not 'late' status
//       if (r.status === 'late') return true;

//       // 5 min grace check (backend handles this usually, but double check)
//       // We trust backend 'status' mostly, or time logic
//       return false;
//     });

//     const counts = {};
//     let totalLate = 0;

//     sourceData.forEach(record => {
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       const name = getEmployeeName(id);
//       const label = `${name} (${id})`;
//       counts[label] = (counts[label] || 0) + 1;
//       totalLate++;
//     });

//     // Format for Pie Chart
//     return Object.entries(counts).map(([name, value]) => ({ name, value }));
//   };

//   // Process Absent Today Data - For Pie Chart
//   const processAbsentTodayData = () => {
//     if (employees.length === 0) return [];

//     const today = new Date().toISOString().split('T')[0];
//     const presentIds = new Set();

//     // 1. Find who is present today
//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       if (recordDate === today) {
//         const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//         if (id) presentIds.add(id);
//       }
//     });

//     // 2. Find who is absent
//     const absentData = [];
//     activeEmployees.forEach(emp => { // ✅ Use activeEmployees instead of employees
//       if (!presentIds.has(emp.employeeId)) {
//         const label = `${emp.name} (${emp.employeeId})`;
//         absentData.push({ name: label, value: 1 }); // 'value' for PieChart
//       }
//     });

//     return absentData.slice(0, 10);
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
//         Initializing Dashboard Analytics...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
//         <div className="text-center">
//           <p className="mb-2 text-2xl font-bold">Oops!</p>
//           <p>{error}</p>
//         </div>
//       </div>
//     );

//   const totals = attendanceData?.totals || {};
//   const attendanceChartData = processAttendanceData();
//   const leavesChartData = processLeavesData();
//   const lateTodayChartData = processLateTodayData();
//   const absentTodayChartData = processAbsentTodayData();

//   // Color Palettes
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#FEB019', '#00E396'];

//   return (
//     <div className="min-h-screen p-4 lg:p-8 bg-gray-50/50">

//       {/* 1. Top Summary Stats */}
//       <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-5">
//         <StatCard icon={FiUsers} label="Total Staff" value={totals.employees || 0} color="indigo" onClick={() => navigate("/employeelist")} />
//         <StatCard icon={FiUserCheck} label="Present Today" value={totals.presentToday || 0} color="emerald" onClick={() => navigate("/today-attendance")} />
//         <StatCard icon={FiUserX} label="Absent Today" value={totals.absentToday || 0} color="rose" onClick={() => navigate("/absent-today")} />
//         <StatCard icon={FiClock} label="Late Arrival" value={totals.lateToday || 0} color="amber" onClick={() => navigate("/late-today")} />
//         <StatCard icon={FiTrendingUp} label="Success Rate" value={`${totals.attendanceRate || 0}%`} color="cyan" onClick={() => navigate("/attedancesummary")} />
//       </div>

//       {/* 2. Historical Performance (Top Attendance & Leaves) */}
//       <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
//         {/* Attendance Performance */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Top Attendance Performance</h3>
//               <p className="text-xs text-gray-500">Most consistent present employees</p>
//             </div>
//             <button onClick={() => navigate("/attedancesummary")} className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">View Report →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {attendanceChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={60} />
//                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
//                   <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
//                   <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
//                     {attendanceChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-400">No attendance data available</div>
//             )}
//           </div>
//         </div>

//         {/* Leave Distribution - WITH IDs */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Leave Utilization</h3>
//               <p className="text-xs text-gray-500">Approved leave counts by employee</p>
//             </div>
//             <button onClick={() => navigate("/leavelist")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800">Analyze Leaves →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {leavesChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={leavesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
//                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={60} />
//                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
//                   <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
//                   <Area type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorLeaves)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-400">No leave data available</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 3. Late & Absent Analytics (Pie Charts) */}
//       <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
//         {/* Late Today Pie Chart */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-base font-bold text-gray-800">Late Today Distribution</h3>
//             <button onClick={() => navigate("/late-today")} className="text-xs font-semibold transition-colors text-amber-600 hover:text-amber-800">View Details →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {lateTodayChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={lateTodayChartData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={50}
//                     outerRadius={90}
//                     paddingAngle={3}
//                     dataKey="value"
//                   >
//                     {lateTodayChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => [`${value} people`, 'Count']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
//                   <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
//                 <FiClock className="w-10 h-10 mb-2 opacity-20" />
//                 <p>No late arrivals today</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Absent Today Pie Chart */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-base font-bold text-gray-800">Absent Today Distribution</h3>
//             <button onClick={() => navigate("/absent-today")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800">View Details →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {absentTodayChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={absentTodayChartData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={50}
//                     outerRadius={90}
//                     paddingAngle={3}
//                     dataKey="value"
//                   >
//                     {absentTodayChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => [`${value}`, 'Absent']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
//                   <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
//                 <FiUserX className="w-10 h-10 mb-2 opacity-20" />
//                 <p>No absent employees today</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//     </div >
//   );
// };

// // ✅ Updated Stat Card Component for premium look
// const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
//   const themes = {
//     indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
//     emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
//     amber: "text-amber-600 bg-amber-50 border-amber-100",
//     rose: "text-rose-600 bg-rose-50 border-rose-100",
//     cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
//   };

//   return (
//     <div
//       className="flex flex-row items-center gap-3 p-3 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:translate-y-[-2px] active:scale-95 group"
//       onClick={onClick}
//     >
//       <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${themes[color]} group-hover:bg-white`}>
//         <Icon className="text-base" />
//       </div>
//       <div className="flex flex-col min-w-0">
//         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
//         <p className="text-lg font-black leading-tight text-gray-800">
//           {typeof value === 'string' && value.includes('%') ? (
//             value
//           ) : (
//             <CountUp end={parseFloat(value)} duration={2} />
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AttendanceDashboard;


// import axios from 'axios';
// import { useEffect, useState } from "react";
// import CountUp from "react-countup";
// import { FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import { isEmployeeHidden } from "../utils/employeeStatus";

// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts';

// const API_BASE_URL = "http://localhost:5000/api";

// const AttendanceDashboard = () => {
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [allAttendance, setAllAttendance] = useState([]);
//   const [leavesData, setLeavesData] = useState([]);
//   const [monthlyAbsence, setMonthlyAbsence] = useState([]);
//   const [lateData, setLateData] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [shiftsData, setShiftsData] = useState([]);
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // 1. Fetch Employees
//       const empRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
//       setEmployees(empRes.data || []);

//       // 2. Fetch Master Shifts
//       const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);
//       if (shiftsRes.data.success) {
//         setMasterShifts(shiftsRes.data.data || []);
//       }

//       // 3. Fetch Employee Shift Assignments
//       const assignmentsRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);
//       if (assignmentsRes.data.success) {
//         setShiftsData(assignmentsRes.data.data || []);
//       }

//       // 4. Fetch Summary Stats
//       const summaryRes = await axios.get(`${API_BASE_URL}/attendance/summary`);
//       setAttendanceData(summaryRes.data);

//       // 5. Fetch All Attendance for Chart
//       const allAttRes = await axios.get(`${API_BASE_URL}/attendance/allattendance`);
//       const allAttData = allAttRes.data;
//       setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

//       // 6. Fetch Approved Leaves
//       const leavesRes = await axios.get(`${API_BASE_URL}/leaves/leaves?status=approved`);
//       const leavesResult = leavesRes.data;
//       setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

//       // 7. Fetch Monthly Absence
//       try {
//         const monthlyRes = await axios.get(`${API_BASE_URL}/attendance/monthly-absence`);
//         if (monthlyRes.data) {
//           setMonthlyAbsence(monthlyRes.data.data || []);
//         }
//       } catch (e) {
//         console.log("Monthly absence not available");
//       }

//       // 8. Fetch Late Attendance (Dedicated API)
//       try {
//         const lateRes = await axios.get(`${API_BASE_URL}/attendance/lateattendance`);
//         if (lateRes.data) {
//           setLateData(lateRes.data.records || []);
//         }
//       } catch (e) {
//         console.log("Late attendance API not available");
//       }

//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch dashboard data. Please ensure the backend server is running.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Get Employee Name by ID
//   const getEmployeeName = (id) => {
//     if (!id) return "Unknown";
//     const emp = employees.find(e => e.employeeId === id || e._id === id);
//     return emp ? emp.name : id;
//   };

//   // Get Employee Shift Time from Master Shifts
//   const getEmployeeShift = (employeeId) => {
//     // Find the shift assignment for this employee
//     const shiftAssignment = shiftsData.find(s => 
//       s.employeeAssignment?.employeeId === employeeId || 
//       s.employeeId === employeeId
//     );
    
//     if (!shiftAssignment) return null;
    
//     const shiftType = shiftAssignment.shiftType;
    
//     // Find the master shift details
//     const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
    
//     if (!masterShift) {
//       // If no master shift found, use default based on shift type
//       return getDefaultShiftTime(shiftType);
//     }
    
//     // Check if it's a brake shift
//     if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
//       return {
//         start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
//         end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
//         grace: 5,
//         isBrakeShift: true
//       };
//     }
    
//     // Regular shift with single time slot
//     if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//       const timeSlot = masterShift.timeSlots[0];
//       if (timeSlot.timeRange) {
//         const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
//         return {
//           start: start || "09:00",
//           end: end || "18:00",
//           grace: 5,
//           isBrakeShift: false
//         };
//       }
//     }
    
//     // Fallback to default
//     return getDefaultShiftTime(shiftType);
//   };

//   // Default shift timings if no master shift found
//   const getDefaultShiftTime = (shiftType) => {
//     const shiftTimes = {
//       "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
//       "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
//       "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
//       "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
//       "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
//       "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
//       "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//       "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
//       "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
//       "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
//     };
    
//     return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
//   };

//   // Calculate if employee is late based on their shift time
//   const isEmployeeLate = (employeeId, checkInTime) => {
//     const shift = getEmployeeShift(employeeId);
//     if (!shift || !checkInTime) return false;
    
//     const today = new Date().toISOString().split('T')[0];
//     const checkInDate = new Date(checkInTime).toISOString().split('T')[0];
    
//     if (checkInDate !== today) return false;
    
//     const checkInDateTime = new Date(checkInTime);
//     const [hours, minutes] = shift.start.split(':').map(Number);
    
//     const shiftStartTime = new Date(checkInDateTime);
//     shiftStartTime.setHours(hours, minutes, 0, 0);
    
//     const graceTime = new Date(shiftStartTime);
//     graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
    
//     return checkInDateTime > graceTime;
//   };

//   // Calculate late minutes
//   const calculateLateMinutes = (employeeId, checkInTime) => {
//     const shift = getEmployeeShift(employeeId);
//     if (!shift || !checkInTime) return 0;
    
//     const checkInDateTime = new Date(checkInTime);
//     const [hours, minutes] = shift.start.split(':').map(Number);
    
//     const shiftStartTime = new Date(checkInDateTime);
//     shiftStartTime.setHours(hours, minutes, 0, 0);
    
//     const graceTime = new Date(shiftStartTime);
//     graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
    
//     if (checkInDateTime > graceTime) {
//       const diffMs = checkInDateTime - graceTime;
//       return Math.floor(diffMs / (1000 * 60));
//     }
    
//     return 0;
//   };

//   // Filter Inactive Employees
//   const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

//   // Process Attendance Data with Color Coding
//   const processAttendanceData = () => {
//     if (!Array.isArray(allAttendance)) return [];

//     const counts = {};
//     allAttendance.forEach(record => {
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const name = getEmployeeName(id);
//       const label = `${name} (${id})`;

//       const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
//       if (isPresent) {
//         counts[label] = (counts[label] || 0) + 1;
//       }
//     });

//     const result = Object.entries(counts)
//       .map(([name, count]) => ({ name, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);
    
//     const maxCount = Math.max(...result.map(item => item.count), 1);
    
//     return result.map(item => ({
//       ...item,
//       color: getAttendanceColor(item.count, maxCount)
//     }));
//   };

//   // Get Color based on attendance count
//   const getAttendanceColor = (count, maxCount) => {
//     if (maxCount <= 0) return '#4f46e5';
    
//     const percentage = (count / maxCount) * 100;
    
//     if (percentage >= 90) return '#10b981';
//     if (percentage >= 75) return '#22c55e';
//     if (percentage >= 60) return '#84cc16';
//     if (percentage >= 50) return '#eab308';
//     if (percentage >= 40) return '#f97316';
//     return '#ef4444';
//   };

//   // Process Late Data with Late Minutes
//   const processLateDataForChart = () => {
//     const today = new Date().toISOString().split('T')[0];
//     const lateMap = {};
    
//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
      
//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       if (recordDate !== today) return;
      
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;
      
//       const lateMinutes = calculateLateMinutes(id, record.checkInTime);
//       if (lateMinutes > 0) {
//         const name = getEmployeeName(id);
//         const label = `${name} (${id})`;
//         lateMap[label] = lateMinutes;
//       }
//     });
    
//     return Object.entries(lateMap)
//       .map(([name, minutes]) => ({ 
//         name, 
//         value: minutes,
//         color: getLateMinutesColor(minutes)
//       }))
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 10);
//   };

//   // Get Color based on late minutes
//   const getLateMinutesColor = (minutes) => {
//     if (minutes <= 5) return '#10b981';
//     if (minutes <= 10) return '#84cc16';
//     if (minutes <= 20) return '#eab308';
//     if (minutes <= 30) return '#f97316';
//     if (minutes <= 45) return '#ef4444';
//     if (minutes <= 55) return '#dc2626';
//     if (minutes <= 65) return '#991b1b';
//     return '#7f1d1d';
//   };

//   // Process Late Today for Bar Chart
//   const processLateTodayBarChart = () => {
//     const lateChartData = processLateDataForChart();
    
//     if (lateChartData.length === 0) return [];
    
//     return lateChartData.map((item, index) => ({
//       ...item,
//       barColor: item.color
//     }));
//   };

//   // Process Absent Today with Days Since Last Attendance
//   const processAbsentTodayData = () => {
//     if (employees.length === 0) return [];

//     const today = new Date();
//     const todayStr = today.toISOString().split('T')[0];
//     const presentIds = new Set();

//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       if (recordDate === todayStr) {
//         const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//         if (id) presentIds.add(id);
//       }
//     });

//     const absentData = [];
//     activeEmployees.forEach(emp => {
//       if (!presentIds.has(emp.employeeId)) {
//         let lastAttendanceDate = null;
//         allAttendance.forEach(record => {
//           const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//           if (id === emp.employeeId && record.checkInTime) {
//             const recordDate = new Date(record.checkInTime);
//             if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
//               lastAttendanceDate = recordDate;
//             }
//           }
//         });

//         let daysSince = "Never";
//         if (lastAttendanceDate) {
//           const diffTime = today - lastAttendanceDate;
//           const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//           daysSince = `${diffDays} days ago`;
//         }

//         const label = `${emp.name} (${emp.employeeId})`;
//         absentData.push({ 
//           name: label, 
//           value: 1,
//           daysSince,
//           color: getAbsentColor(daysSince)
//         });
//       }
//     });

//     return absentData.sort((a, b) => {
//       const aDays = a.daysSince === "Never" ? Infinity : parseInt(a.daysSince);
//       const bDays = b.daysSince === "Never" ? Infinity : parseInt(b.daysSince);
//       return bDays - aDays;
//     }).slice(0, 10);
//   };

//   // Get Color based on days absent
//   const getAbsentColor = (daysSince) => {
//     if (daysSince === "Never") return '#7f1d1d';
    
//     const days = parseInt(daysSince);
//     if (days === 1) return '#10b981';
//     if (days <= 3) return '#84cc16';
//     if (days <= 7) return '#eab308';
//     if (days <= 14) return '#f97316';
//     if (days <= 30) return '#ef4444';
//     return '#7f1d1d';
//   };

//   // Process Leaves Data with Color Coding
//   const processLeavesData = () => {
//     if (!Array.isArray(leavesData)) return [];

//     const counts = {};
//     leavesData.forEach(leave => {
//       const id = (typeof leave.employeeId === 'object' ? leave.employeeId?.employeeId : leave.employeeId);
//       const name = getEmployeeName(id) || "Unknown Staff";
//       const label = id ? `${name} (${id})` : name;

//       const leaveDays = parseFloat(leave.days) || 1;
//       counts[label] = (counts[label] || 0) + leaveDays;
//     });

//     const result = Object.entries(counts)
//       .map(([name, count]) => ({ name, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);
    
//     const maxCount = Math.max(...result.map(item => item.count), 1);
    
//     return result.map(item => ({
//       ...item,
//       color: getLeaveColor(item.count, maxCount)
//     }));
//   };

//   // Get Color based on leave count
//   const getLeaveColor = (count, maxCount) => {
//     if (maxCount <= 0) return '#f43f5e';
    
//     const percentage = (count / maxCount) * 100;
    
//     if (percentage <= 10) return '#10b981';
//     if (percentage <= 30) return '#84cc16';
//     if (percentage <= 50) return '#eab308';
//     if (percentage <= 70) return '#f97316';
//     return '#ef4444';
//   };

//   // Calculate Late Today Count Based on Shift Time
//   const calculateLateTodayCount = () => {
//     const today = new Date().toISOString().split('T')[0];
//     let lateCount = 0;
    
//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
      
//       const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//       if (recordDate !== today) return;
      
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;
      
//       if (isEmployeeLate(id, record.checkInTime)) {
//         lateCount++;
//       }
//     });
    
//     return lateCount;
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
//         Initializing Dashboard Analytics...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
//         <div className="text-center">
//           <p className="mb-2 text-2xl font-bold">Oops!</p>
//           <p>{error}</p>
//         </div>
//       </div>
//     );

//   const totals = attendanceData?.totals || {};
//   const attendanceChartData = processAttendanceData();
//   const leavesChartData = processLeavesData();
//   const lateTodayBarChartData = processLateTodayBarChart();
//   const absentTodayChartData = processAbsentTodayData();
  
//   const actualLateToday = calculateLateTodayCount();

//   return (
//     <div className="min-h-screen p-4 lg:p-8 bg-gray-50/50">

//       {/* 1. Top Summary Stats - UNIFORM FONT SIZES */}
//       <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-5">
//         <StatCard 
//           icon={FiUsers} 
//           label="Total Staff" 
//           value={totals.employees || 0} 
//           color="indigo" 
//           onClick={() => navigate("/employeelist")} 
//         />
//         <StatCard 
//           icon={FiUserCheck} 
//           label="Present Today" 
//           value={totals.presentToday || 0} 
//           color="emerald" 
//           onClick={() => navigate("/today-attendance")} 
//         />
//         <StatCard 
//           icon={FiUserX} 
//           label="Absent Today" 
//           value={totals.absentToday || 0} 
//           color="rose" 
//           onClick={() => navigate("/absent-today")} 
//         />
//         <StatCard 
//           icon={FiClock} 
//           label="Late Arrival" 
//           value={actualLateToday || 0} 
//           color="amber" 
//           onClick={() => navigate("/late-today")} 
//         />
//         <StatCard 
//           icon={FiTrendingUp} 
//           label="Success Rate" 
//           value={`${totals.attendanceRate || 0}%`} 
//           color="cyan" 
//           onClick={() => navigate("/attedancesummary")} 
//         />
//       </div>

//       {/* 2. Historical Performance */}
//       <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
//         {/* Attendance Performance */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Top Attendance Performance</h3>
//               <p className="text-xs text-gray-500">Most consistent present employees</p>
//             </div>
//             <button onClick={() => navigate("/attedancesummary")} className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">View Report →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {attendanceChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }} 
//                     angle={-25} 
//                     textAnchor="end" 
//                     interval={0} 
//                     height={60} 
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }}
//                   />
//                   <Tooltip 
//                     cursor={{ fill: '#f8fafc' }} 
//                     contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
//                     formatter={(value, name, props) => {
//                       return [`${value} days`, 'Attendance'];
//                     }}
//                   />
//                   <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
//                     {attendanceChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-400">No attendance data available</div>
//             )}
//           </div>
//         </div>

//         {/* Leave Distribution - IMPROVED DESIGN */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Leave Utilization</h3>
//               <p className="text-xs text-gray-500">Approved leave counts by employee</p>
//             </div>
//             <button onClick={() => navigate("/leavelist")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800">Analyze Leaves →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {leavesChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={leavesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
//                       <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
//                     </linearGradient>
//                     <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
//                       <stop offset="0%" stopColor="#10b981" />
//                       <stop offset="30%" stopColor="#eab308" />
//                       <stop offset="70%" stopColor="#f97316" />
//                       <stop offset="100%" stopColor="#ef4444" />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" vertical={false} />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
//                     angle={-25} 
//                     textAnchor="end" 
//                     interval={0} 
//                     height={60}
//                     tickMargin={5}
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }}
//                     tickCount={6}
//                     domain={[0, 'auto']}
//                   />
//                   <Tooltip 
//                     contentStyle={{ 
//                       borderRadius: '12px', 
//                       border: '1px solid #e5e7eb', 
//                       fontSize: '12px',
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                       background: 'white'
//                     }}
//                     formatter={(value, name, props) => {
//                       return [`${value} days`, 'Leaves Taken'];
//                     }}
//                     labelStyle={{ fontWeight: 'bold', color: '#374151' }}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="count" 
//                     stroke="url(#colorLine)"
//                     strokeWidth={3}
//                     fill="url(#colorLeaves)" 
//                     fillOpacity={0.6}
//                     activeDot={{ 
//                       r: 6, 
//                       stroke: '#ffffff', 
//                       strokeWidth: 2,
//                       fill: '#8b5cf6'
//                     }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-400">No leave data available</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 3. Late Today and Absent Today - BOTH IN ONE ROW */}
//       <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
//         {/* Late Today Analysis */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-2">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Late Today Analysis</h3>
//               <p className="text-xs text-gray-500">Late minutes by employee (shift-based)</p>
//             </div>
//             <button onClick={() => navigate("/late-today")} className="text-xs font-semibold transition-colors text-amber-600 hover:text-amber-800">View Details →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {lateTodayBarChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={lateTodayBarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }} 
//                     angle={-25} 
//                     textAnchor="end" 
//                     interval={0} 
//                     height={60} 
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }}
//                     domain={[-5, 70]}
//                     ticks={[-5, 5, 10, 20, 30, 45, 55, 65]}
//                   />
//                   <Tooltip 
//                     cursor={{ fill: '#f8fafc' }} 
//                     contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
//                     formatter={(value, name, props) => {
//                       return [`${value} minutes late`, 'Late Duration'];
//                     }}
//                   />
//                   <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
//                     {lateTodayBarChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.barColor} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
//                 <FiClock className="w-10 h-10 mb-2 opacity-20" />
//                 <p>No late arrivals today</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Absent Today Analysis */}
//         <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-2">
//             <div>
//               <h3 className="text-base font-bold text-gray-800">Absent Today Analysis</h3>
//               <p className="text-xs text-gray-500">Days since last attendance</p>
//             </div>
//             <button onClick={() => navigate("/absent-today")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800">View Details →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {absentTodayChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={absentTodayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }} 
//                     angle={-25} 
//                     textAnchor="end" 
//                     interval={0} 
//                     height={60} 
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fill: '#64748b', fontSize: 11 }}
//                   />
//                   <Tooltip 
//                     cursor={{ fill: '#f8fafc' }} 
//                     contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
//                     formatter={(value, name, props) => {
//                       const entry = props.payload;
//                       return [`${entry.daysSince}`, 'Last Attendance'];
//                     }}
//                   />
//                   <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
//                     {absentTodayChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
//                 <FiUserX className="w-10 h-10 mb-2 opacity-20" />
//                 <p>No absent employees today</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// const StatCard = ({ icon: Icon, label, value, color, onClick }) => {
//   const themes = {
//     indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
//     emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
//     amber: "text-amber-600 bg-amber-50 border-amber-100",
//     rose: "text-rose-600 bg-rose-50 border-rose-100",
//     cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
//   };

//   return (
//     <div
//       className="flex flex-row items-center gap-3 p-3 transition-all duration-300 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:translate-y-[-2px] active:scale-95 group"
//       onClick={onClick}
//     >
//       <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${themes[color]} group-hover:bg-white`}>
//         <Icon className="text-base" />
//       </div>
//       <div className="flex flex-col min-w-0">
//         <p className="text-xs font-bold tracking-wider text-gray-400 uppercase truncate">{label}</p>
//         <p className="text-lg font-black leading-tight text-gray-800">
//           {typeof value === 'string' && value.includes('%') ? (
//             value
//           ) : (
//             <CountUp end={parseFloat(value)} duration={2} />
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AttendanceDashboard;

import axios from 'axios';
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { FiCalendar, FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const API_BASE_URL = "http://localhost:5000/api";

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leavesData, setLeavesData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lateDate, setLateDate] = useState(new Date().toISOString().split('T')[0]);
  const [absentDate, setAbsentDate] = useState(new Date().toISOString().split('T')[0]);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Employees
      const empRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      setEmployees(empRes.data || []);

      // 2. Fetch Master Shifts
      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);
      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data || []);
      }

      // 3. Fetch Employee Shift Assignments
      const assignmentsRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);
      if (assignmentsRes.data.success) {
        setShiftsData(assignmentsRes.data.data || []);
      }

      // 4. Fetch Summary Stats
      const summaryRes = await axios.get(`${API_BASE_URL}/attendance/summary`);
      setAttendanceData(summaryRes.data);

      // 5. Fetch All Attendance for Chart
      const allAttRes = await axios.get(`${API_BASE_URL}/attendance/allattendance`);
      const allAttData = allAttRes.data;
      setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

      // 6. Fetch Approved Leaves
      const leavesRes = await axios.get(`${API_BASE_URL}/leaves/leaves?status=approved`);
      const leavesResult = leavesRes.data;
      setLeavesData(Array.isArray(leavesResult) ? leavesResult : leavesResult.records || leavesResult.leaves || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Please ensure the backend server is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get Employee Name by ID
  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    const emp = employees.find(e => e.employeeId === id || e._id === id);
    return emp ? emp.name : id;
  };

  // Get Employee Shift Time from Master Shifts
  const getEmployeeShift = (employeeId) => {
    const shiftAssignment = shiftsData.find(s => 
      s.employeeAssignment?.employeeId === employeeId || 
      s.employeeId === employeeId
    );
    
    if (!shiftAssignment) return null;
    
    const shiftType = shiftAssignment.shiftType;
    
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
    
    if (!masterShift) {
      return getDefaultShiftTime(shiftType);
    }
    
    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5,
        isBrakeShift: true
      };
    }
    
    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return {
          start: start || "09:00",
          end: end || "18:00",
          grace: 5,
          isBrakeShift: false
        };
      }
    }
    
    return getDefaultShiftTime(shiftType);
  };

  // Default shift timings if no master shift found
  const getDefaultShiftTime = (shiftType) => {
    const shiftTimes = {
      "A": { start: "10:00", end: "19:00", grace: 5, isBrakeShift: false },
      "B": { start: "14:00", end: "22:00", grace: 5, isBrakeShift: false },
      "C": { start: "18:00", end: "21:00", grace: 5, isBrakeShift: false },
      "D": { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false },
      "E": { start: "10:00", end: "21:00", grace: 5, isBrakeShift: false },
      "F": { start: "14:00", end: "23:00", grace: 5, isBrakeShift: false },
      "G": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "H": { start: "09:00", end: "21:00", grace: 5, isBrakeShift: false },
      "I": { start: "07:00", end: "17:00", grace: 5, isBrakeShift: false },
      "BR": { start: "07:00", end: "21:30", grace: 5, isBrakeShift: true },
    };
    
    return shiftTimes[shiftType] || { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
  };

  // Filter Inactive Employees
  const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

  // Process Attendance Data with Color Coding
  const processAttendanceData = () => {
    if (!Array.isArray(allAttendance)) return [];

    const counts = {};
    allAttendance.forEach(record => {
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;

      const name = getEmployeeName(id);
      const label = `${name} (${id})`;

      const isPresent = record.status === "present" || record.status === "checked-in" || record.checkInTime;
      if (isPresent) {
        counts[label] = (counts[label] || 0) + 1;
      }
    });

    const result = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const maxCount = Math.max(...result.map(item => item.count), 1);
    
    return result.map(item => ({
      ...item,
      color: getAttendanceColor(item.count, maxCount)
    }));
  };

  // Get Color based on attendance count
  const getAttendanceColor = (count, maxCount) => {
    if (maxCount <= 0) return '#4f46e5';
    
    const percentage = (count / maxCount) * 100;
    
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 60) return '#84cc16';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 40) return '#f97316';
    return '#ef4444';
  };

  // Process Late Data with Late Minutes for selected date
  const processLateDataForChart = (date) => {
    const lateMap = {};
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate !== date) return;
      
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;
      
      const shift = getEmployeeShift(id);
      if (!shift) return;
      
      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);
      
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);
      
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
      
      if (checkInDateTime > graceTime) {
        const diffMs = checkInDateTime - graceTime;
        const lateMinutes = Math.floor(diffMs / (1000 * 60));
        
        const name = getEmployeeName(id);
        const label = `${name} (${id})`;
        lateMap[label] = lateMinutes;
      }
    });
    
    const result = Object.entries(lateMap)
      .map(([name, minutes]) => ({ 
        name, 
        value: minutes,
        color: getLateMinutesColor(minutes)
      }))
      .sort((a, b) => b.value - a.value);
    
    const maxEntries = Math.max(result.length, 1);
    const barSize = Math.max(20, 30 - (maxEntries * 0.5));
    
    return {
      data: result,
      barSize
    };
  };

  // Get Color based on late minutes
  const getLateMinutesColor = (minutes) => {
    if (minutes <= 5) return '#10b981';
    if (minutes <= 10) return '#84cc16';
    if (minutes <= 20) return '#eab308';
    if (minutes <= 30) return '#f97316';
    if (minutes <= 45) return '#ef4444';
    if (minutes <= 55) return '#dc2626';
    if (minutes <= 65) return '#991b1b';
    return '#7f1d1d';
  };

  // Process Absent Data for selected date
  const processAbsentDataForChart = (date) => {
    if (employees.length === 0) return { data: [], barSize: 20 };

    const selectedDate = new Date(date);
    const selectedDateStr = date;
    const presentIds = new Set();

    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate === selectedDateStr) {
        const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
        if (id) presentIds.add(id);
      }
    });

    const absentData = [];
    activeEmployees.forEach(emp => {
      if (!presentIds.has(emp.employeeId)) {
        let lastAttendanceDate = null;
        allAttendance.forEach(record => {
          const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
          if (id === emp.employeeId && record.checkInTime) {
            const recordDate = new Date(record.checkInTime);
            if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
              lastAttendanceDate = recordDate;
            }
          }
        });

        let daysSince = 0;
        if (lastAttendanceDate) {
          const diffTime = selectedDate - lastAttendanceDate;
          daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        } else {
          // If never attended, use a large number
          const joinDate = emp.joinDate ? new Date(emp.joinDate) : selectedDate;
          const diffTime = selectedDate - joinDate;
          daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        const label = `${emp.name} (${emp.employeeId})`;
        absentData.push({ 
          name: label, 
          daysSince: daysSince,
          color: getAbsentColor(daysSince)
        });
      }
    });

    const sortedData = absentData.sort((a, b) => b.daysSince - a.daysSince);
    
    const maxEntries = Math.max(sortedData.length, 1);
    const barSize = Math.max(20, 30 - (maxEntries * 0.5));
    
    return {
      data: sortedData,
      barSize
    };
  };

  // Get Color based on days absent
  const getAbsentColor = (daysSince) => {
    if (daysSince === 0) return '#10b981';
    if (daysSince === 1) return '#10b981';
    if (daysSince <= 3) return '#84cc16';
    if (daysSince <= 7) return '#eab308';
    if (daysSince <= 14) return '#f97316';
    if (daysSince <= 30) return '#ef4444';
    return '#7f1d1d';
  };

  // Process Leaves Data with Color Coding
  const processLeavesData = () => {
    if (!Array.isArray(leavesData)) return [];

    const counts = {};
    leavesData.forEach(leave => {
      const id = (typeof leave.employeeId === 'object' ? leave.employeeId?.employeeId : leave.employeeId);
      const name = getEmployeeName(id) || "Unknown Staff";
      const label = id ? `${name} (${id})` : name;

      const leaveDays = parseFloat(leave.days) || 1;
      counts[label] = (counts[label] || 0) + leaveDays;
    });

    const result = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const maxCount = Math.max(...result.map(item => item.count), 1);
    
    return result.map(item => ({
      ...item,
      color: getLeaveColor(item.count, maxCount)
    }));
  };

  // Get Color based on leave count
  const getLeaveColor = (count, maxCount) => {
    if (maxCount <= 0) return '#f43f5e';
    
    const percentage = (count / maxCount) * 100;
    
    if (percentage <= 10) return '#10b981';
    if (percentage <= 30) return '#84cc16';
    if (percentage <= 50) return '#eab308';
    if (percentage <= 70) return '#f97316';
    return '#ef4444';
  };

  // Calculate Late Count for selected date
  const calculateLateCount = (date) => {
    let lateCount = 0;
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate !== date) return;
      
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;
      
      const shift = getEmployeeShift(id);
      if (!shift) return;
      
      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);
      
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);
      
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
      
      if (checkInDateTime > graceTime) {
        lateCount++;
      }
    });
    
    return lateCount;
  };

  // Calculate Present Count for selected date
  const calculatePresentCount = (date) => {
    const presentIds = new Set();
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate === date) {
        const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
        if (id) presentIds.add(id);
      }
    });
    
    return presentIds.size;
  };

  // Calculate Absent Count for selected date
  const calculateAbsentCount = (date) => {
    const presentIds = new Set();
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      
      const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
      if (recordDate === date) {
        const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
        if (id) presentIds.add(id);
      }
    });
    
    const totalActive = activeEmployees.length;
    const presentCount = presentIds.size;
    
    return Math.max(0, totalActive - presentCount);
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
          <p className="mb-2 text-2xl font-bold">Oops!</p>
          <p>{error}</p>
        </div>
      </div>
    );

  const totals = attendanceData?.totals || {};
  const attendanceChartData = processAttendanceData();
  const leavesChartData = processLeavesData();
  
  const lateChartData = processLateDataForChart(lateDate);
  const absentChartData = processAbsentDataForChart(absentDate);
  
  const presentToday = calculatePresentCount(new Date().toISOString().split('T')[0]);
  const absentToday = calculateAbsentCount(new Date().toISOString().split('T')[0]);
  const lateToday = calculateLateCount(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gray-50/50">
      {/* <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
          <p className="text-gray-600">Analyze attendance data</p>
        </div>
      </div> */}

      {/* 1. Top Summary Stats */}
      <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-5">
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
          value={presentToday || 0} 
          color="emerald" 
          onClick={() => navigate("/today-attendance")} 
        />
        <StatCard 
          icon={FiUserX} 
          label="Absent Today" 
          value={absentToday || 0} 
          color="rose" 
          onClick={() => navigate("/absent-today")} 
        />
        <StatCard 
          icon={FiClock} 
          label="Late Arrival" 
          value={lateToday || 0} 
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

      {/* 2. Historical Performance */}
      <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
        {/* Attendance Performance */}
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Top Attendance Performance</h3>
              <p className="text-xs text-gray-500">Most consistent present employees</p>
            </div>
            <button onClick={() => navigate("/attedancesummary")} className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800">View Report →</button>
          </div>
          <div className="flex-1 w-full">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    height={60} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                    formatter={(value, name, props) => {
                      return [`${value} days`, 'Attendance'];
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No attendance data available</div>
            )}
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">

  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-base font-bold text-gray-800">Leave Utilization</h3>
      <p className="text-xs text-gray-500">Approved leave counts by employee</p>
    </div>
    <button
      onClick={() => navigate("/leavelist")}
      className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800"
    >
      Analyze Leaves →
    </button>
  </div>

  <div className="flex-1 w-full">
    {leavesChartData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={leavesChartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>

            {/* COLOR SWAPPED: LOW → RED, HIGH → GREEN */}
            <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="30%" stopColor="#f97316" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="1 1"
            stroke="#f1f5f9"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
            angle={-25}
            textAnchor="end"
            interval={0}
            height={60}
            tickMargin={5}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickCount={6}
            domain={[0, "auto"]}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              background: "white",
            }}
            formatter={(value) => [`${value} days`, "Leaves Taken"]}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="url(#colorLine)"
            strokeWidth={3}
            fill="url(#colorLeaves)"
            fillOpacity={0.6}
            activeDot={{
              r: 6,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#8b5cf6",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No leave data available

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Leave Utilization</h3>
              <p className="text-xs text-gray-500">Approved leaves counts by employee</p>
            </div>
            <button onClick={() => navigate("/leavelist")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800">Analyze Leaves →</button>
          </div>
          <div className="flex-1 w-full">
            {leavesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leavesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="30%" stopColor="#eab308" />
                      <stop offset="70%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    height={60}
                    tickMargin={5}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickCount={6}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      background: 'white'
                    }}
                    formatter={(value, name, props) => {
                      return [`${value} days`, 'Leaves Taken'];
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="url(#colorLine)"
                    strokeWidth={3}
                    fill="url(#colorLeaves)" 
                    fillOpacity={0.6}
                    activeDot={{ 
                      r: 6, 
                      stroke: '#ffffff', 
                      strokeWidth: 2,
                      fill: '#8b5cf6'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No leave data available</div>
            )}
          </div>
        </div>
      )}
  </div>
</div>
</div>

      {/* 3. Late Today and Absent Today - BOTH IN ONE ROW */}
      <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
        {/* Late Today Analysis */}
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
  <div className="flex items-center justify-between mb-2">
    <div>
      <h3 className="text-base font-bold text-gray-800">Late Analysis</h3>
      <p className="text-xs text-gray-500">Late minutes by employee</p>
    </div>
    <div className="flex items-center gap-2">
      <FiCalendar className="text-gray-400 text-sm" />
      <input
        type="date"
        value={lateDate}
        onChange={(e) => setLateDate(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={() => navigate("/late-today")}
        className="text-xs font-semibold transition-colors text-amber-600 hover:text-amber-800 whitespace-nowrap"
      >
        View Details →
      </button>
    </div>
  </div>

  <div className="flex-1 w-full">
    {lateChartData.data.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={lateChartData.data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            angle={-25}
            textAnchor="end"
            interval={0}
            height={60}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10 }}
            domain={[-5, 70]}
            ticks={[-5, 5, 10, 20, 30, 45, 55, 65]}
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} minutes late`, "Late Duration"]}
          />

          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            barSize={lateChartData.barSize}
          >
            {/* COLOR SWAPPED */}
            {lateChartData.data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  lateChartData.data[
                    lateChartData.data.length - 1 - index
                  ].color
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
        <FiClock className="w-10 h-10 mb-2 opacity-20" />
        <p>No late arrivals on {lateDate}</p>
      </div>
    )}
  </div>
</div>


        {/* Absent Today Analysis */}
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">Absent Analysis</h3>
              <p className="text-xs text-gray-500">Days since last attendance</p>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400 text-sm" />
              <input
                type="date"
                value={absentDate}
                onChange={(e) => setAbsentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button onClick={() => navigate("/absent-today")} className="text-xs font-semibold transition-colors text-rose-600 hover:text-rose-800 whitespace-nowrap">View Details →</button>
            </div>
          </div>
          <div className="flex-1 w-full">
            {absentChartData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={absentChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }} 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    height={60} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    domain={[0, 70]}
                    ticks={[0, 5, 10, 20, 30, 45, 55, 70]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                    formatter={(value, name, props) => {
                      const daysSince = props.payload.daysSince;
                      return [`${daysSince} days`, 'Days Since Last Attendance'];
                    }}
                  />
                  <Bar dataKey="daysSince" radius={[4, 4, 0, 0]} barSize={absentChartData.barSize}>
                    {absentChartData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                <FiUserX className="w-10 h-10 mb-2 opacity-20" />
                <p>No absent employees on {absentDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
 </div>
  );
};

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
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase truncate">{label}</p>
        <p className="text-lg font-black leading-tight text-gray-800">
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