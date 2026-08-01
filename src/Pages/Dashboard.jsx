
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
//   Legend,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts';

// const API_BASE_URL = "https://api.timelyhealth.in/api";

// const AttendanceDashboard = () => {
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [allAttendance, setAllAttendance] = useState([]);
//   const [leavesData, setLeavesData] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [shiftsData, setShiftsData] = useState([]);
//   const [masterShifts, setMasterShifts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lateDate, setLateDate] = useState("");
//   const [lateMonth, setLateMonth] = useState(new Date().toISOString().slice(0, 7));
//   const [absentDate, setAbsentDate] = useState("");
//   const [absentMonth, setAbsentMonth] = useState(new Date().toISOString().slice(0, 7));

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
//     const shiftAssignment = shiftsData.find(s =>
//       s.employeeAssignment?.employeeId === employeeId ||
//       s.employeeId === employeeId
//     );

//     if (!shiftAssignment) return null;

//     const shiftType = shiftAssignment.shiftType;

//     const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

//     if (!masterShift) {
//       return getDefaultShiftTime(shiftType);
//     }

//     if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
//       return {
//         start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
//         end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
//         grace: 5,
//         isBrakeShift: true
//       };
//     }

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

//   // Filter Inactive Employees
//   const activeEmployees = employees.filter(emp => !isEmployeeHidden(emp));

//   // Process Attendance Data with Color Coding
//   const getAttendanceColor = (count, max) => {
//     const percentage = (count / max) * 100;
//     if (percentage >= 90) return '#10b981'; // Emerald 500
//     if (percentage >= 75) return '#84cc16'; // Lime 500
//     if (percentage >= 50) return '#EF4444'; // Amber 500
//     if (percentage >= 25) return '#DC2626'; // Orange 500
//     return '#ef4444'; // Red 500
//   };

//   const processAttendanceData = () => {
//     if (!Array.isArray(allAttendance)) return [];

//     const counts = {};
//     allAttendance.forEach(record => {
//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const name = getEmployeeName(id);
//       // ✅ Count only Full Days (Total Hours >= 9)
//       const isFullDay = record.totalHours >= 9;
//       if (isFullDay) {
//         counts[id] = (counts[id] || 0) + 1;
//       }
//     });

//     const result = Object.entries(counts)
//       .map(([id, count]) => ({
//         id,
//         name: getEmployeeName(id),
//         count
//       }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10);

//     const maxCount = Math.max(...result.map(item => item.count), 1);

//     return result.map(item => ({
//       id: item.id,
//       name: item.name,
//       displayId: item.id,
//       count: item.count,
//       color: getAttendanceColor(item.count, maxCount)
//     }));
//   };

//   // Process Late Analysis Data (Pie Chart)
//   const processLateAnalysisData = () => {
//     // 1. Date View: Late Minutes
//     if (lateDate) {
//       const lateMap = {};
//       allAttendance.forEach(record => {
//         if (!record.checkInTime) return;
//         const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//         if (recordDate !== lateDate) return;

//         const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//         if (!id) return;

//         const shift = getEmployeeShift(id);
//         if (!shift) return;

//         const checkInDateTime = new Date(record.checkInTime);
//         const [hours, minutes] = shift.start.split(':').map(Number);
//         const shiftStartTime = new Date(checkInDateTime);
//         shiftStartTime.setHours(hours, minutes, 0, 0);
//         const graceTime = new Date(shiftStartTime);
//         graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//         if (checkInDateTime > graceTime) {
//           const diffMs = checkInDateTime - graceTime;
//           const lateMinutes = Math.floor(diffMs / (1000 * 60));
//           const name = getEmployeeName(id);
//           const label = `${name} (${id})`;
//           lateMap[label] = { name: label, value: lateMinutes, type: 'minutes' };
//         }
//       });
//       return Object.values(lateMap).sort((a, b) => b.value - a.value);
//     }

//     // 2. Month View: Late Days
//     const [year, month] = lateMonth.split('-').map(Number);
//     const lateCounts = {};

//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);
//       if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const shift = getEmployeeShift(id);
//       if (!shift) return;

//       const checkInDateTime = new Date(record.checkInTime);
//       const [hours, minutes] = shift.start.split(':').map(Number);
//       const shiftStartTime = new Date(checkInDateTime);
//       shiftStartTime.setHours(hours, minutes, 0, 0);
//       // Fix: Ensure we compare with the correct date's shift time
//       shiftStartTime.setFullYear(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

//       const graceTime = new Date(shiftStartTime);
//       graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//       if (checkInDateTime > graceTime) {
//         const name = getEmployeeName(id);
//         const label = `${name} (${id})`;
//         lateCounts[label] = (lateCounts[label] || 0) + 1;
//       }
//     });

//     return Object.entries(lateCounts)
//       .map(([name, count]) => ({ name, value: count, type: 'days' }))
//       .sort((a, b) => b.value - a.value);
//   };

//   // ✅ Process Top Late Comers (for the new bar chart)
//   const processTopLateComersData = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth() + 1;
//     const lateCounts = {};

//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);
//       if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const shift = getEmployeeShift(id);
//       if (!shift) return;

//       const checkInDateTime = new Date(record.checkInTime);
//       const [hours, minutes] = shift.start.split(':').map(Number);
//       const shiftStartTime = new Date(checkInDateTime);
//       shiftStartTime.setHours(hours, minutes, 0, 0);
//       shiftStartTime.setFullYear(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

//       const graceTime = new Date(shiftStartTime);
//       graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//       if (checkInDateTime > graceTime) {
//         lateCounts[id] = (lateCounts[id] || 0) + 1;
//       }
//     });

//     return Object.entries(lateCounts)
//       .map(([id, count]) => ({
//         id,
//         name: getEmployeeName(id),
//         count
//       }))
//       .sort((a, b) => a.count - b.count) // ✅ Ascending Order (1, 2, 3...)
//       .slice(-10); // ✅ Take the last 10 (highest ones) in ascending order
//   };

//   const COLORS = [
//     '#DC2626',  // Rose 600
//     '#EF4444',  // Rose 600
//     '#E11D48',  // Rose 600
//     // '#F43F5E', // Rose 500
//     // '#FB7185', // Rose 400

//     '#D97706', // Amber 600
//     '#F59E0B', // Amber 500
//     '#FBBF24', // Amber 400

//     '#0891B2', // Cyan 600
//     '#06B6D4', // Cyan 500
//     '#22D3EE', // Cyan 400

//     '#4F46E5', // Indigo 600
//     '#6366F1', // Indigo 500
//     '#818CF8', // Indigo 400

//     '#059669',// Emerald 600
//     '#10B981', // Emerald 500
//     '#34D399' // Emerald 400



//   ];


//   // Get Color based on late minutes
//   const getLateMinutesColor = (minutes) => {

//     // 🟢 0–5
//     if (minutes <= 5) return '#34D399';   // Emerald 400

//     // 🟢 6–10
//     if (minutes <= 10) return '#10B981';  // Emerald 500

//     // 🟢 11–20
//     if (minutes <= 20) return '#059669';  // Emerald 600

//     // 🔵 21–30
//     if (minutes <= 30) return '#6366F1';  // Indigo 500

//     // 🔷 31–40
//     if (minutes <= 40) return '#06B6D4';  // Cyan 500

//     // 🟡 41–50
//     if (minutes <= 50) return '#FBBF24';  // Amber 400

//     // 🟠 51–60
//     if (minutes <= 60) return '#F59E0B';  // Amber 500

//     // 🔴 60+ (Critical)
//     return '#EF4444'; // Rose 600
//   };


//   // Get Color based on days absent
//   const getAbsentColor = (daysSince) => {

//     // 🟢 0–1 Day
//     if (daysSince <= 1) return '#34D399';   // Emerald 400

//     // 🟢 2–3 Days
//     if (daysSince <= 3) return '#10B981';   // Emerald 500

//     // 🟢 4–5 Days
//     if (daysSince <= 5) return '#059669';   // Emerald 600

//     // 🔵 6–7 Days
//     if (daysSince <= 7) return '#6366F1';   // Indigo 500

//     // 🔷 8–10 Days
//     if (daysSince <= 10) return '#06B6D4';  // Cyan 500

//     // 🟡 11–14 Days
//     if (daysSince <= 14) return '#FBBF24';  // Amber 400

//     // 🟠 15–21 Days
//     if (daysSince <= 21) return '#F59E0B';  // Amber 500

//     // 🔴 21+ Days (Critical)
//     return '#EF4444'; // Rose 600
//   };

//   // Process Absent Analysis Data (Bar Chart)
//   const processAbsentAnalysisData = () => {
//     // Ensure employees are loaded
//     if (!employees.length) return [];

//     const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));

//     // 1. Date View: Days Since Last Attendance
//     if (absentDate) {
//       const selectedDate = new Date(absentDate);
//       const selectedDateStr = absentDate;
//       const presentIds = new Set();

//       allAttendance.forEach(record => {
//         if (!record.checkInTime) return;
//         const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
//         if (recordDate === selectedDateStr) {
//           const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//           if (id) presentIds.add(id);
//         }
//       });

//       const absentData = [];
//       activeEmps.forEach(emp => {
//         if (!presentIds.has(emp.employeeId)) {
//           let lastAttendanceDate = null;
//           allAttendance.forEach(record => {
//             const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//             if (id === emp.employeeId && record.checkInTime) {
//               const recordDate = new Date(record.checkInTime);
//               if (!lastAttendanceDate || recordDate > lastAttendanceDate) {
//                 lastAttendanceDate = recordDate;
//               }
//             }
//           });

//           let daysSince = 0;
//           if (lastAttendanceDate) {
//             const diffTime = selectedDate - lastAttendanceDate;
//             daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//           } else {
//             const joinDate = emp.joinDate ? new Date(emp.joinDate) : selectedDate;
//             const diffTime = Math.max(0, selectedDate - joinDate);
//             daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//           }

//           absentData.push({
//             name: `${emp.name} (${emp.employeeId})`,
//             value: Math.max(0, daysSince),
//             type: 'daysSince',
//             color: getAbsentColor(daysSince)
//           });
//         }
//       });
//       return absentData.sort((a, b) => b.value - a.value).slice(0, 10);
//     }

//     // 2. Month View: Total Absent Days
//     const [year, month] = absentMonth.split('-').map(Number);
//     const absentCounts = {};
//     const totalDaysInMonth = new Date(year, month, 0).getDate();

//     const now = new Date();
//     const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
//     const daysToCount = isCurrentMonth ? now.getDate() : totalDaysInMonth;

//     // Initialize counts for all active employees
//     activeEmps.forEach(emp => {
//       absentCounts[emp.employeeId] = {
//         name: `${emp.name} (${emp.employeeId})`,
//         present: 0
//       };
//     });

//     // Count present days
//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       const recordDate = new Date(record.checkInTime);
//       if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;

//       if (recordDate.getDate() > daysToCount) return;

//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (absentCounts[id]) {
//         absentCounts[id].present++;
//       }
//     });

//     // Calculate absent
//     const results = Object.values(absentCounts).map(emp => {
//       const absentDays = Math.max(0, daysToCount - emp.present);
//       return {
//         name: emp.name,
//         value: absentDays,
//         type: 'absentDays',
//         color: getAttendanceColor(emp.present, daysToCount)
//       };
//     }).filter(r => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 15);

//     return results;
//   };


//   // Calculate Present Count for Today
//   const calculatePresentCount = (dateStr) => {
//     if (!Array.isArray(allAttendance)) return 0;
//     const present = allAttendance.filter(record => {
//       if (!record.checkInTime) return false;
//       return record.checkInTime.startsWith(dateStr);
//     });
//     const uniqueIds = new Set(present.map(r =>
//       (typeof r.employeeId === 'object' ? r.employeeId?.employeeId : r.employeeId)
//     ));
//     return uniqueIds.size;
//   };

//   // Calculate Absent Count for Today
//   const calculateAbsentCount = (dateStr) => {
//     const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
//     const presentCount = calculatePresentCount(dateStr);
//     return Math.max(0, activeEmps.length - presentCount);
//   };

//   // Calculate Late Count for Today
//   const calculateLateCount = (dateStr) => {
//     if (!Array.isArray(allAttendance)) return 0;
//     let count = 0;

//     // We iterate through all attendance records to find lates for the given date
//     allAttendance.forEach(record => {
//       if (!record.checkInTime) return;
//       if (!record.checkInTime.startsWith(dateStr)) return;

//       const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
//       if (!id) return;

//       const shift = getEmployeeShift(id);
//       if (!shift) return;

//       const checkInDateTime = new Date(record.checkInTime);
//       const [hours, minutes] = shift.start.split(':').map(Number);

//       // Construct shift start time for the *attendance record's date*
//       const shiftStartTime = new Date(checkInDateTime);
//       shiftStartTime.setHours(hours, minutes, 0, 0);

//       const graceTime = new Date(shiftStartTime);
//       graceTime.setMinutes(graceTime.getMinutes() + shift.grace);

//       if (checkInDateTime > graceTime) {
//         count++;
//       }
//     });
//     return count;
//   };


//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-blue-600 font-medium animate-pulse">
//         Initializing Dashboard Analytics...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-[80vh] text-red-500 bg-red-50 rounded-xl m-6 p-10 shadow-inner border border-red-100">
//         <div className="text-center">
//           <p className="mb-2 text-2xl font-bold">Oops!</p>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   const totals = attendanceData?.totals || {};
//   const attendanceChartData = processAttendanceData();
//   const lateComersData = processTopLateComersData();

//   const lateChartData = processLateAnalysisData();
//   const absentChartData = processAbsentAnalysisData();

//   const presentToday = calculatePresentCount(new Date().toISOString().split('T')[0]);
//   const absentToday = calculateAbsentCount(new Date().toISOString().split('T')[0]);
//   const lateToday = calculateLateCount(new Date().toISOString().split('T')[0]);

//   // Custom tooltip formatter for attendance chart
//   const AttendanceTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="p-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
//           <p className="font-semibold">{data.name} ({data.id})</p>
//           <p className="text-gray-500">Full Days: {data.count}</p>
//         </div>
//       );
//     }
//     return null;
//   };


//   // Custom tooltip formatter for late chart
//   const LateTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-xl">
//           <p className="font-bold text-gray-700 mb-0.5 leading-none">{data.name}</p>
//           <p className="leading-none text-gray-500">
//             {data.type === 'minutes' ? `Late Duration: ${data.value} mins` : `Late Days: ${data.value}`}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom tooltip formatter for absent chart
//   const AbsentTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-xl">
//           <p className="font-bold text-gray-700 mb-0.5 leading-none">{data.name}</p>
//           <p className="leading-none text-gray-500">
//             {data.type === 'daysSince' ? `Days Since Last: ${data.value}` : `Absent Days: ${data.value}`}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const RADIAN = Math.PI / 180;
//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   return (
//     <div className="min-h-screen p-2 lg:p-6 bg-white/50">
//       {/* 1. Top Summary Stats - Updated Cards */}
//       <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-5">
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
//           value={presentToday || 0}
//           color="emerald"
//           onClick={() => navigate("/today-attendance")}
//         />
//         <StatCard
//           icon={FiUserX}
//           label="Absent Today"
//           value={absentToday || 0}
//           color="rose"
//           onClick={() => navigate("/absent-today")}
//         />
//         <StatCard
//           icon={FiClock}
//           label="Late Arrival"
//           value={lateToday || 0}
//           color="amber"
//           onClick={() => navigate("/late-today")}
//         />
//         <StatCard
//           icon={FiTrendingUp}
//           label="Attendance Rate"
//           value={totals.attendanceRate || 0}
//           isPercentage={true}
//           color="cyan"
//           onClick={() => navigate("/attedancesummary")}
//         />
//       </div>


//       {/* 3. Historical Performance */}
//       <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
//         {/* Attendance Performance */}
//         <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <h3 className="text-base font-bold text-gray-700">Attendance Performance (Full Days)</h3>
//               {/* <p className="text-xs text-gray-500">Most consistent present employees</p> */}
//             </div>
//             <button onClick={() => navigate("/attedancesummary")} className="font-bold text-indigo-600 transition-colors text-s hover:text-indigo-800">View Report →</button>
//           </div>
//           <div className="flex-1 w-full">
//             {attendanceChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis
//                     dataKey="id"
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
//                   <Tooltip content={<AttendanceTooltip />} cursor={{ fill: '#f8fafc' }} />
//                   <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
//                     {attendanceChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-500">No attendance data available</div>
//             )}
//           </div>
//         </div>

//         {/* Top Late Comers */}
//         <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[380px]">
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <h3 className="text-base font-bold text-gray-700">Top Late Comers</h3>
//             </div>
//             <button
//               onClick={() => navigate("/late-today")}
//               className="font-bold transition-colors text-s text-rose-600 hover:text-rose-800"
//             >
//               View All Lates →
//             </button>
//           </div>

//           <div className="flex-1 w-full">
//             {lateComersData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={lateComersData}
//                   margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
//                 >
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     stroke="#f1f5f9"
//                     vertical={false}
//                   />

//                   <XAxis
//                     dataKey="id"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#64748b", fontSize: 11 }}
//                     angle={-25}
//                     textAnchor="end"
//                     interval={0}
//                     height={60}
//                   />

//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#64748b", fontSize: 11 }}
//                     allowDecimals={false}
//                   />

//                   <Tooltip content={<AttendanceTooltip />} cursor={{ fill: '#f8fafc' }} />

//                   <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
//                     {lateComersData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={index >= lateComersData.length - 3 ? "#EF4444" : "#F59E0B"} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-full text-sm text-gray-500">
//                 No monthly late data available
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* 3. Late & Absent Analysis */}
//       <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
//         {/* Late Analysis (Pie Chart) */}
//         <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
//           <div className="flex flex-col mb-2">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-base font-bold text-gray-700">Late Analysis</h3>
//               <div className="flex items-center gap-2">
//                 {/* Month Filter */}
//                 <input
//                   type="month"
//                   value={lateMonth}
//                   onChange={(e) => {
//                     setLateMonth(e.target.value);
//                     setLateDate(""); // Clear date when month changes to default to month view
//                   }}
//                   className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
//                 />
//                 {/* Date Filter */}
//                 <input
//                   type="date"
//                   value={lateDate}
//                   onChange={(e) => setLateDate(e.target.value)}
//                   className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
//                 />
//                 <button
//                   onClick={() => navigate("/late-today")}
//                   className="font-bold text-s text-amber-600 hover:text-amber-800 whitespace-nowrap"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//             <p className="text-xs text-gray-500">
//               {lateDate ? `Late Minutes on ${lateDate}` : `Late Days in ${lateMonth}`}
//             </p>
//           </div>

//           <div className="flex-1 w-full">
//             {lateChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={lateChartData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={100}
//                     paddingAngle={2}
//                     dataKey="value"
//                   >
//                     {lateChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip content={<LateTooltip />} />
//                   <Legend
//                     layout="vertical"
//                     align="right"
//                     verticalAlign="middle"
//                     wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
//                 <FiClock className="w-10 h-10 mb-2 opacity-20" />
//                 <p>No late records found</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Absent Analysis (Bar Chart) */}
//         <div className="bg-white px-2 py-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
//           <div className="flex flex-col mb-2">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-base font-bold text-gray-700">Absent Analysis</h3>
//               <div className="flex items-center gap-2">
//                 {/* Month Filter */}
//                 <input
//                   type="month"
//                   value={absentMonth}
//                   onChange={(e) => {
//                     setAbsentMonth(e.target.value);
//                     setAbsentDate("");
//                   }}
//                   className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
//                 />
//                 {/* Date Filter */}
//                 <input
//                   type="date"
//                   value={absentDate}
//                   onChange={(e) => setAbsentDate(e.target.value)}
//                   className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-600"
//                 />
//                 <button
//                   onClick={() => navigate("/absent-today")}
//                   className="font-bold text-s text-rose-600 hover:text-rose-800 whitespace-nowrap"
//                 >
//                   View Details
//                 </button>
//               </div>
//             </div>
//             <p className="text-xs text-gray-500">
//               {absentDate ? `Days Since Last Attendance (as of ${absentDate})` : `Total Absent Days in ${absentMonth}`}
//             </p>
//           </div>

//           <div className="flex-1 w-full">
//             {absentChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={absentChartData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={100}
//                     paddingAngle={2}
//                     dataKey="value"
//                   >
//                     {absentChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip content={<AbsentTooltip />} />
//                   <Legend
//                     layout="vertical"
//                     align="right"
//                     verticalAlign="middle"
//                     wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
//                 <FiUserX className="w-8 h-8 mb-2 opacity-20" />
//                 <p>No absent records found</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon: Icon, label, value, color, onClick, isPercentage }) => {
//   const themes = {
//     indigo: "border-indigo-500",
//     emerald: "border-blue-500",
//     amber: "border-amber-500",
//     rose: "border-rose-500",
//     cyan: "border-cyan-500",
//   };

//   const currentTheme = themes[color] || themes.indigo;

//   return (
//     <div
//       className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${currentTheme} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}
//       onClick={onClick}
//     >
//       <div className="flex items-center gap-2">
//         <Icon className="text-gray-500 text-base flex-shrink-0" />
//         <div className="text-sm font-medium text-gray-700">{label}</div>
//       </div>
//       <div className="text-sm font-bold">
//         <CountUp end={value} duration={2} separator="," />
//         {isPercentage && "%"}
//       </div>
//     </div>
//   );
// };

// export default AttendanceDashboard;

import axios from 'axios';
import { useEffect, useState } from "react";
import { 
  FiCalendar, FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers, 
  FiX, FiExternalLink, FiMapPin, FiBarChart2, FiPieChart, FiActivity,
  FiAward, FiStar, FiZap, FiTarget, FiCheckCircle, FiAlertCircle,
  FiUser, FiBriefcase, FiHome, FiArrowUp, FiArrowDown, FiMoreHorizontal,
  FiTrendingDown, FiInfo
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { isEmployeeHidden } from "../utils/employeeStatus";

import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, 
  ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Area, AreaChart, ComposedChart
} from 'recharts';

const API_BASE_URL = "https://api.timelyhealth.in/api";

// ─── Premium Color Palette ───
const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF',
  '#F97316', '#14B8A6', '#6366F1', '#8B5CF6', '#EC4899',
  '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'
];

const getEmployeeColor = (name) => {
  if (!name) return '#6366F1';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const AttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lateMonth, setLateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [absentMonth, setAbsentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [topLateMonth, setTopLateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const reactNavigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname.startsWith("/emp-")) {
      const routeMap = {
        "/employeelist": "/emp-employees",
        "/today-attendance": "/emp-today-attendance",
        "/absent-today": "/emp-absent-today",
        "/late-today": "/emp-late-today",
        "/attedancesummary": "/emp-attendance-summary",
        "/leavelist": "/emp-leaves",
        "/employee-locations": "/emp-employee-locations",
      };
      if (typeof path === "string" && routeMap[path]) {
        reactNavigate(routeMap[path]);
        return;
      }
    }
    reactNavigate(path);
  };

  const getCredentials = () => {
    const userRole = localStorage.getItem('userRole');
    let email = '', password = '';
    if (userRole === 'admin') {
      email = localStorage.getItem('adminEmail') || '';
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      password = userData.password || localStorage.getItem('adminPassword') || '';
    } else if (userRole === 'employee') {
      const employeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');
      email = employeeData.email || localStorage.getItem('employeeEmail') || '';
      password = employeeData.password || localStorage.getItem('employeePassword') || '';
    } else if (userRole === 'client') {
      const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
      email = clientData.email || localStorage.getItem('clientEmail') || '';
      password = clientData.password || localStorage.getItem('clientPassword') || '';
    }
    return { email, password, userRole };
  };

  const handleHireClick = () => {
    const { email, password, userRole } = getCredentials();
    if (!email || !password) {
      alert('Please login first to access Hire.');
      return;
    }
    const url = "https://ingrainhire.ingrainsystems.com/client-login";
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('autoLogin', 'true');
    params.append('role', userRole || 'employee');
    params.append('clientLogin', 'true');
    params.append('skipOtp', 'true');
    window.open(`${url}?${params.toString()}`, '_blank');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const empRes = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      setEmployees(empRes.data || []);

      const shiftsRes = await axios.get(`${API_BASE_URL}/shifts/master`);
      if (shiftsRes.data.success) {
        setMasterShifts(shiftsRes.data.data || []);
      }

      const assignmentsRes = await axios.get(`${API_BASE_URL}/shifts/assignments`);
      if (assignmentsRes.data.success) {
        setShiftsData(assignmentsRes.data.data || []);
      }

      const summaryRes = await axios.get(`${API_BASE_URL}/attendance/summary`);
      setAttendanceData(summaryRes.data);

      const allAttRes = await axios.get(`${API_BASE_URL}/attendance/allattendance`);
      const allAttData = allAttRes.data;
      setAllAttendance(Array.isArray(allAttData) ? allAttData : allAttData.records || allAttData.allAttendance || []);

      try {
        console.log("Fetching leaves from:", `${API_BASE_URL}/leaves/leaves`);
        const leavesRes = await axios.get(`${API_BASE_URL}/leaves/leaves`);
        
        let leavesArray = [];
        if (leavesRes.data && leavesRes.data.data && Array.isArray(leavesRes.data.data)) {
          leavesArray = leavesRes.data.data;
        } 
        else if (Array.isArray(leavesRes.data)) {
          leavesArray = leavesRes.data;
        }
        else if (leavesRes.data && leavesRes.data.records && Array.isArray(leavesRes.data.records)) {
          leavesArray = leavesRes.data.records;
        }
        
        setAllLeaves(leavesArray);
      } catch (err) {
        console.error("❌ Could not fetch leaves", err);
        setAllLeaves([]);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Helper Functions ───
  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    const emp = employees.find(e => e.employeeId === id || e._id === id);
    return emp ? emp.name : id;
  };

  const getEmployeeShift = (employeeId) => {
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId || s.employeeId === employeeId
    );
    if (!shiftAssignment) return null;
    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
    if (!masterShift) return getDefaultShiftTime(shiftType);
    if (masterShift.isBrakeShift && masterShift.timeSlots?.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: 5, isBrakeShift: true
      };
    }
    if (masterShift.timeSlots?.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return { start: start || "09:00", end: end || "18:00", grace: 5, isBrakeShift: false };
      }
    }
    return getDefaultShiftTime(shiftType);
  };

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

  // ─── Data Processors ───
  const processAttendanceData = () => {
    if (!Array.isArray(allAttendance)) return [];
    const [year, month] = attendanceMonth.split('-').map(Number);
    const counts = {};
    allAttendance.forEach(record => {
      if (year && month) {
        if (!record.checkInTime) return;
        const recordDate = new Date(record.checkInTime);
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;
      if (record.status === "present" || record.status === "checked-in" || record.checkInTime) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([id, count]) => {
      const name = getEmployeeName(id);
      return { id, name, count, color: getEmployeeColor(name), fill: getEmployeeColor(name) };
    }).sort((a, b) => b.count - a.count).slice(0, 8);
  };

  const processLeaveWaveData = () => {
    if (!Array.isArray(allLeaves)) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthCounts = {};
    
    months.forEach(month => { monthCounts[month] = 0; });
    
    allLeaves.forEach(record => {
      const date = record.startDate || record.date;
      if (!date) return;
      const recordDate = new Date(date);
      if (recordDate.getFullYear() !== currentYear) return;
      
      const monthName = months[recordDate.getMonth()];
      if (monthName) {
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });
    
    return months.map(month => ({
      month: month,
      leaves: monthCounts[month] || 0
    }));
  };

  const processLeaveDataWithNames = () => {
    if (!Array.isArray(allLeaves)) return [];
    const [year, month] = topLateMonth.split('-').map(Number); 
    
    const leaveMap = {};
    allLeaves.forEach(record => {
      const date = record.startDate || record.date;
      if (!date) return;
      const recordDate = new Date(date);
      if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;
      
      const name = getEmployeeName(id);
      if (!leaveMap[id]) {
        leaveMap[id] = { id, name, count: 0, color: getEmployeeColor(name) };
      }
      leaveMap[id].count += 1;
    });

    return Object.values(leaveMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processLateAnalysisData = () => {
    const [year, month] = lateMonth.split('-').map(Number);
    const lateCounts = {};
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (!id) return;
      const shift = getEmployeeShift(id);
      if (!shift) return;
      const checkInDateTime = new Date(record.checkInTime);
      const [hours, minutes] = shift.start.split(':').map(Number);
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);
      shiftStartTime.setFullYear(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
      if (checkInDateTime > graceTime) {
        const name = getEmployeeName(id);
        lateCounts[name] = (lateCounts[name] || 0) + 1;
      }
    });
    return Object.entries(lateCounts).map(([name, count]) => ({ 
      name, value: count, type: 'days', color: getEmployeeColor(name) 
    })).sort((a, b) => b.value - a.value);
  };

  const processAbsentAnalysisData = () => {
    if (!employees.length) return [];
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    const [year, month] = absentMonth.split('-').map(Number);
    const absentCounts = {};
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const daysToCount = isCurrentMonth ? now.getDate() : totalDaysInMonth;
    
    activeEmps.forEach(emp => { 
      absentCounts[emp.employeeId] = { name: emp.name, present: 0 }; 
    });
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      if (recordDate.getDate() > daysToCount) return;
      const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
      if (absentCounts[id]) absentCounts[id].present++;
    });
    
    return Object.values(absentCounts).map(emp => {
      const absentDays = Math.max(0, daysToCount - emp.present);
      return { name: emp.name, value: absentDays, type: 'absentDays', color: getEmployeeColor(emp.name), fill: getEmployeeColor(emp.name) };
    }).filter(r => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 15);
  };

  const calculatePresentCount = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    const present = allAttendance.filter(record => record.checkInTime && record.checkInTime.startsWith(dateStr));
    return new Set(present.map(r => (typeof r.employeeId === 'object' ? r.employeeId?.employeeId : r.employeeId))).size;
  };

  const calculateAbsentCount = (dateStr) => {
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    return Math.max(0, activeEmps.length - calculatePresentCount(dateStr));
  };

  const calculateLateCount = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    let count = 0;
    allAttendance.forEach(record => {
      if (!record.checkInTime || !record.checkInTime.startsWith(dateStr)) return;
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
      if (checkInDateTime > graceTime) count++;
    });
    return count;
  };

  const getWeekData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      let present = 0, absent = 0;
      allAttendance.forEach(record => {
        if (record.checkInTime && record.checkInTime.startsWith(dateStr)) {
          const id = (typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId);
          if (id) {
            if (record.status === "present" || record.status === "checked-in" || record.checkInTime) present++;
            else absent++;
          }
        }
      });
      return { day, present, absent };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <FiAlertCircle size={32} color="#EF4444" style={{ marginBottom: '8px' }} />
          <p style={{ color: '#EF4444', fontSize: '16px', fontWeight: '600' }}>Oops!</p>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ─── Computed Data ───
  const totals = attendanceData?.totals || {};
  const attendanceChartData = processAttendanceData();
  const leaveWaveData = processLeaveWaveData();
  const leaveDataWithNames = processLeaveDataWithNames();
  const lateChartData = processLateAnalysisData();
  const absentChartData = processAbsentAnalysisData();
  const weekData = getWeekData();

  const presentToday = calculatePresentCount(new Date().toISOString().split('T')[0]);
  const absentToday = calculateAbsentCount(new Date().toISOString().split('T')[0]);
  const lateToday = calculateLateCount(new Date().toISOString().split('T')[0]);
  const attendanceRateValue = typeof totals.attendanceRate === 'number' ? totals.attendanceRate : parseFloat(totals.attendanceRate) || 0;

  // ─── Custom Tooltip ───
  const CustomTooltip = ({ active, payload, labelKey = 'name' }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = data?.color || '#6366F1';
      const label = data[labelKey] || data.name || data.day || data.month || 'N/A';
      const value = data?.count !== undefined ? `${data.count} days` :
                     data?.value !== undefined ? `${data.value}` :
                     data?.leaves !== undefined ? `${data.leaves} leaves` :
                     data?.present !== undefined ? `Present: ${data.present}` : '';
      return (
        <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: `1px solid ${color}` }}>
          <p style={{ fontWeight: '600', fontSize: '12px', color: '#0f172a', margin: '0 0 2px 0' }}>{label}</p>
          <p style={{ color: color, fontWeight: '500', fontSize: '11px', margin: '0' }}>{value}</p>
        </div>
      );
    }
    return null;
  };

  // ─── Styles ───
  const styles = {
    container: { background: '#f1f5f9', minHeight: '100vh', padding: isMobile ? '12px' : '24px', width: '100%', fontFamily: "'Inter', system-ui, sans-serif" },
    header: { marginBottom: isMobile ? '16px' : '24px' },
    statsGrid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', 
      gap: isMobile ? '10px' : '16px', 
      marginBottom: isMobile ? '16px' : '24px' 
    },
    statsCardFullWidth: {
      gridColumn: '1 / -1'
    },
    cardBase: { background: 'white', borderRadius: '12px', padding: isMobile ? '12px' : '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'all 0.3s ease' },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chartContainer: { height: isMobile ? '180px' : '220px', marginTop: isMobile ? '4px' : '8px' },
    smallChartContainer: { height: isMobile ? '130px' : '160px', marginTop: isMobile ? '2px' : '6px' },
    footer: { marginTop: isMobile ? '16px' : '24px', paddingTop: isMobile ? '12px' : '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: isMobile ? '9px' : '11px', color: '#94a3b8' },
    leaveNameList: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '4px', 
      marginTop: '4px',
      paddingTop: '6px',
      borderTop: '1px solid #f1f5f9'
    },
    leaveNameTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: isMobile ? '1px 8px' : '2px 10px',
      borderRadius: '20px',
      fontSize: isMobile ? '8px' : '10px',
      fontWeight: '600',
      color: 'white'
    }
  };

  // ─── LEAVE NAMES SECTION ───
  const renderLeaveNames = () => {
    if (!leaveDataWithNames || leaveDataWithNames.length === 0) {
      return <p style={{ fontSize: isMobile ? '9px' : '11px', color: '#94a3b8', marginTop: '4px' }}>No leaves taken this month</p>;
    }
    return (
      <div style={styles.leaveNameList}>
        {leaveDataWithNames.map((item) => (
          <span key={item.id} style={{ ...styles.leaveNameTag, background: item.color }}>
            {item.name} ({item.count})
          </span>
        ))}
      </div>
    );
  };

  // ─── Stats Cards Data ───
  const statsData = [
    { label: 'Total Staff', value: totals.employees || 0, icon: FiUsers, color: '#6366F1', bg: '#EEF2FF', sub: 'active employees', onClick: () => navigate("/employeelist") },
    { label: 'Present Today', value: presentToday || 0, icon: FiUserCheck, color: '#10B981', bg: '#ECFDF5', sub: 'employees present', onClick: () => navigate("/today-attendance") },
    { label: 'Absent Today', value: absentToday || 0, icon: FiUserX, color: '#EF4444', bg: '#FEF2F2', sub: 'absent employees', onClick: () => navigate("/absent-today") },
    { label: 'Late Arrival', value: lateToday || 0, icon: FiClock, color: '#F59E0B', bg: '#FFFBEB', sub: 'late arrivals', onClick: () => navigate("/late-today") },
    { label: 'Attendance Rate', value: `${attendanceRateValue.toFixed(1)}%`, icon: FiTrendingUp, color: '#8B5CF6', bg: '#F5F3FF', sub: 'overall rate', onClick: () => navigate("/attedancesummary") },
  ];

  return (
    <div style={styles.container}>
      
      {/* ─── 1. HEADER ─── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? '8px' : '12px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '16px' : '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Attendance <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
            </h1>
            {/* <p style={{ color: '#64748b', fontSize: isMobile ? '10px' : '13px', margin: isMobile ? '1px 0 0 0' : '4px 0 0 0' }}>
              Real-time attendance monitoring & analytics
            </p> */}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate("/employee-locations")} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: isMobile ? '4px 8px' : '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: isMobile ? '9px' : '12px', fontWeight: '600', cursor: 'pointer' }}><FiMapPin size={isMobile ? 10 : 16} /> Locations</button>
            <button onClick={handleHireClick} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: isMobile ? '4px 8px' : '8px 16px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', border: 'none', borderRadius: '8px', fontSize: isMobile ? '9px' : '12px', fontWeight: '600', cursor: 'pointer' }}><FiUsers size={isMobile ? 10 : 16} /> Hire</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: isMobile ? '3px 6px' : '8px 14px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <FiCalendar size={isMobile ? 10 : 16} style={{ color: '#6366F1' }} />
              <span style={{ fontSize: isMobile ? '9px' : '12px', fontWeight: '500', color: '#0f172a' }}>{new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. STATS CARDS ─── */}
      <div style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            onClick={stat.onClick} 
            style={{ 
              ...styles.cardBase, 
              ...(isMobile && index === 4 ? styles.statsCardFullWidth : {}),
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: isMobile ? '10px 12px' : '16px 20px' 
            }}
          >
            <div>
              <p style={{ fontSize: isMobile ? '8px' : '11px', color: '#94a3b8', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: isMobile ? '0.2px' : '0.5px' }}>{stat.label}</p>
              <p style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', color: '#0f172a', margin: isMobile ? '1px 0 0 0' : '4px 0 0 0' }}>{stat.value}</p>
              {stat.sub && <p style={{ fontSize: isMobile ? '7px' : '10px', color: '#94a3b8', margin: isMobile ? '0px 0 0 0' : '2px 0 0 0' }}>{stat.sub}</p>}
            </div>
            <div style={{ width: isMobile ? '32px' : '44px', height: isMobile ? '32px' : '44px', borderRadius: isMobile ? '8px' : '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={isMobile ? 14 : 22} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── 3. CHARTS SECTION ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '20px', marginBottom: isMobile ? '12px' : '20px' }}>
        
        {/* Card A: Attendance Distribution - FIXED: Names cut issue resolved */}
        <div style={{ ...styles.cardBase, borderTop: '4px solid #6366F1' }}>
          <div style={styles.flexBetween}>
            <div>
              <h3 style={{ fontSize: isMobile ? '11px' : '14px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiBarChart2 color="#6366F1" size={isMobile ? 12 : 16} /> Attendance Distribution
              </h3>
              <p style={{ fontSize: isMobile ? '8px' : '11px', color: '#94a3b8', margin: '1px 0 0 0' }}>Top performers this month</p>
            </div>
            <input type="month" value={attendanceMonth} onChange={(e) => setAttendanceMonth(e.target.value)} style={{ padding: isMobile ? '2px 6px' : '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: isMobile ? '8px' : '11px', fontWeight: '500', background: '#f8fafc', maxWidth: isMobile ? '90px' : '140px' }} />
          </div>
          <div style={styles.chartContainer}>
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {attendanceChartData.map((entry, index) => (
                      <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: isMobile ? 8 : 10, fontWeight: '500' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#0f172a", fontSize: isMobile ? 8 : 10, fontWeight: '500' }} 
                    width={isMobile ? 75 : 100} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={isMobile ? 10 : 16}>
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} stroke={entry.color} strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: isMobile ? '9px' : '12px' }}>No data available</div>
            )}
          </div>
          <div style={{ marginTop: isMobile ? '6px' : '10px', paddingTop: isMobile ? '6px' : '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: isMobile ? '8px' : '11px', color: '#94a3b8' }}><span style={{ fontWeight: '600', color: '#0f172a' }}>{attendanceChartData.length}</span> employees tracked</span>
            <button onClick={() => navigate("/attedancesummary")} style={{ fontSize: isMobile ? '8px' : '11px', color: '#6366F1', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View Full Report →</button>
          </div>
        </div>

        {/* Card B: Leave Analysis with Names */}
        <div style={{ ...styles.cardBase, borderTop: '4px solid #8B5CF6' }}>
          <div style={styles.flexBetween}>
            <div>
              <h3 style={{ fontSize: isMobile ? '11px' : '14px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiBriefcase color="#8B5CF6" size={isMobile ? 12 : 16} /> Leave Analysis
              </h3>
              <p style={{ fontSize: isMobile ? '8px' : '11px', color: '#94a3b8', margin: '1px 0 0 0' }}>Monthly leave distribution {new Date().getFullYear()}</p>
            </div>
            <input type="month" value={topLateMonth} onChange={(e) => setTopLateMonth(e.target.value)} style={{ padding: isMobile ? '2px 6px' : '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: isMobile ? '8px' : '11px', fontWeight: '500', background: '#f8fafc', maxWidth: isMobile ? '90px' : '140px' }} />
          </div>
          <div style={styles.chartContainer}>
            {leaveWaveData.length > 0 && leaveWaveData.some(d => d.leaves > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leaveWaveData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="leaveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: isMobile ? 7 : 10, fontWeight: '500' }} 
                    interval={isMobile ? 2 : 0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: isMobile ? 7 : 10, fontWeight: '500' }} 
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip labelKey="month" />} />
                  <Area 
                    type="monotone" 
                    dataKey="leaves" 
                    stroke="#8B5CF6" 
                    strokeWidth={isMobile ? 2 : 3}
                    fill="url(#leaveGradient)" 
                    activeDot={{ r: isMobile ? 4 : 6, fill: '#8B5CF6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: isMobile ? '9px' : '12px' }}>No leave data available</div>
            )}
          </div>
          
          {/* ─── LEAVE NAMES SECTION ─── */}
          {renderLeaveNames()}

          <div style={{ marginTop: isMobile ? '6px' : '8px', paddingTop: isMobile ? '6px' : '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: isMobile ? '8px' : '11px', color: '#94a3b8' }}>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>
                {leaveWaveData.reduce((sum, d) => sum + d.leaves, 0)}
              </span> total leaves this year
            </span>
            <button onClick={() => navigate("/leavelist")} style={{ fontSize: isMobile ? '8px' : '11px', color: '#8B5CF6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
          </div>
        </div>
      </div>

      {/* ─── 4. SECOND ROW ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '16px', marginBottom: isMobile ? '10px' : '16px' }}>

        {/* Card C: Late Analysis */}
        <div style={{ ...styles.cardBase, borderBottom: '3px solid #EC4899' }}>
          <div style={styles.flexBetween}>
            <div>
              <h3 style={{ fontSize: isMobile ? '9px' : '12px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiAlertCircle color="#EC4899" size={isMobile ? 10 : 14} /> Late Analysis
              </h3>
              <p style={{ fontSize: isMobile ? '7px' : '10px', color: '#94a3b8', margin: '1px 0 0 0' }}>{lateMonth}</p>
            </div>
            <input type="month" value={lateMonth} onChange={(e) => setLateMonth(e.target.value)} style={{ padding: isMobile ? '1px 4px' : '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: isMobile ? '7px' : '10px', background: '#f8fafc', width: isMobile ? '60px' : '85px' }} />
          </div>
          <div style={styles.smallChartContainer}>
            {lateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {lateChartData.map((entry, index) => (
                      <radialGradient key={`late-pie-${index}`} id={`late-pie-${index}`}><stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/><stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/></radialGradient>
                    ))}
                  </defs>
                  <Pie data={lateChartData} cx="50%" cy="50%" innerRadius={isMobile ? 20 : 30} outerRadius={isMobile ? 38 : 55} paddingAngle={2} dataKey="value" animationDuration={1000}>
                    {lateChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#late-pie-${index})`} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <FiClock size={isMobile ? 14 : 20} /><span style={{ fontSize: isMobile ? '7px' : '10px' }}>No late records</span>
              </div>
            )}
          </div>
        </div>

        {/* Card D: Absent Analysis */}
        <div style={{ ...styles.cardBase, borderBottom: '3px solid #EF4444' }}>
          <div style={styles.flexBetween}>
            <div>
              <h3 style={{ fontSize: isMobile ? '9px' : '12px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiUserX color="#EF4444" size={isMobile ? 10 : 14} /> Absent Analysis
              </h3>
              <p style={{ fontSize: isMobile ? '7px' : '10px', color: '#94a3b8', margin: '1px 0 0 0' }}>{absentMonth}</p>
            </div>
            <input type="month" value={absentMonth} onChange={(e) => setAbsentMonth(e.target.value)} style={{ padding: isMobile ? '1px 4px' : '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: isMobile ? '7px' : '10px', background: '#f8fafc', width: isMobile ? '60px' : '85px' }} />
          </div>
          <div style={styles.smallChartContainer}>
            {absentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {absentChartData.map((entry, index) => (
                      <radialGradient key={`absent-pie-${index}`} id={`absent-pie-${index}`}><stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/><stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/></radialGradient>
                    ))}
                  </defs>
                  <Pie data={absentChartData} cx="50%" cy="50%" innerRadius={isMobile ? 20 : 30} outerRadius={isMobile ? 38 : 55} paddingAngle={2} dataKey="value" animationDuration={1000}>
                    {absentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#absent-pie-${index})`} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <FiUserX size={isMobile ? 14 : 20} /><span style={{ fontSize: isMobile ? '7px' : '10px' }}>No absent records</span>
              </div>
            )}
          </div>
        </div>

        {/* Card E: Weekly Progress */}
        <div style={{ ...styles.cardBase, borderBottom: '3px solid #10B981' }}>
          <div style={styles.flexBetween}>
            <div>
              <h3 style={{ fontSize: isMobile ? '9px' : '12px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <FiTrendingUp color="#10B981" size={isMobile ? 10 : 14} /> Weekly Progress
              </h3>
              <p style={{ fontSize: isMobile ? '7px' : '10px', color: '#94a3b8', margin: '1px 0 0 0' }}>This week attendance</p>
            </div>
          </div>
          <div style={styles.smallChartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: isMobile ? 6 : 9, fontWeight: '500' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: isMobile ? 6 : 9, fontWeight: '500' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={isMobile ? 1.5 : 2} dot={{ fill: '#10B981', r: isMobile ? 2 : 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: isMobile ? 3 : 6 }} />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={isMobile ? 1.5 : 2} dot={{ fill: '#EF4444', r: isMobile ? 2 : 4, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: isMobile ? 3 : 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card F: Completion Progress */}
        <div style={{ ...styles.cardBase, borderBottom: '3px solid #8B5CF6' }}>
          <div>
            <h3 style={{ fontSize: isMobile ? '9px' : '12px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <FiTarget color="#8B5CF6" size={isMobile ? 10 : 14} /> Completion Progress
            </h3>
            <p style={{ fontSize: isMobile ? '7px' : '10px', color: '#94a3b8', margin: '1px 0 0 0' }}>Overall attendance metrics</p>
          </div>
          <div style={styles.smallChartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'Present', value: presentToday || 10, fullMark: 100 },
                { subject: 'Absent', value: absentToday || 5, fullMark: 100 },
                { subject: 'Late', value: lateToday || 3, fullMark: 100 },
                { subject: 'On Leave', value: Math.floor(Math.random() * 10) + 2, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: isMobile ? 6 : 9, fontWeight: '500' }} />
                <PolarRadiusAxis angle={30} domain={[0, 50]} tick={{ fill: "#64748b", fontSize: isMobile ? 6 : 8 }} />
                <Radar name="Employees" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── 5. FOOTER ─── */}
      <div style={styles.footer}>
        <span>© {new Date().getFullYear()} Timely Health. All rights reserved.</span>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
          <span>Total Employees: <strong style={{ color: '#0f172a' }}>{totals.employees || 0}</strong></span>
          <span>Attendance Rate: <strong style={{ color: '#10B981' }}>{attendanceRateValue.toFixed(1)}%</strong></span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AttendanceDashboard;