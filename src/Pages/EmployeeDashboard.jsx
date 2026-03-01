// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   FiCalendar,
//   FiCamera,
//   FiCheckCircle,
//   FiClock as FiHistory,
//   FiList
// } from "react-icons/fi";
// import { useLocation, useNavigate } from "react-router-dom";
// import { subscribeToPushNotifications } from "../utils/pushNotification";
// import { API_BASE_URL } from "../config";


// const EmployeeDashboard = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const email = location.state?.email || localStorage.getItem("employeeEmail");
//   const [profile, setProfile] = useState(null);
//   const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
//   const [shiftTiming, setShiftTiming] = useState("Not Assigned");
//   const [stats, setStats] = useState({
//     presentDays: 0,
//     pendingLeaves: 0,
//     activePermissions: 0,
//   });

//   useEffect(() => {
//     if (!email) return;

//     const fetchData = async () => {
//       try {
//         const BASE_URL = API_BASE_URL.replace(/\/api$/, "/");
//         const API_5000 = API_BASE_URL.replace(/\/api$/, "/");

//         // 1. Fetch Profile
//         const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
//         const profileData = profileRes.data.data || profileRes.data;
//         setProfile(profileData);

//         if (profileData) {
//           // Subscribe to Push Notifications using the unique _id
//           if (profileData._id) {
//             subscribeToPushNotifications(profileData._id);
//           }

//           // Also support using employeeId if _id is missing (fallback)
//           const empId = profileData.employeeId;
//           const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
//           const targetId = empId || localStorageId;

//           // 2. Attendance Stats
//           const attRes = await axios.get(`${BASE_URL}api/attendance/myattendance/${targetId}`);
//           const presentCount = attRes.data?.records?.filter(r => r.status === "checked-in" || r.status === "present").length || 0;

//           // 3. Leaves Stats
//           const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
//           const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;

//           // 4. Permissions Stats
//           try {
//             const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
//             const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
//             setStats(prev => ({ ...prev, activePermissions: activePermsCount }));
//           } catch (e) {
//             console.warn("Permissions fetch failed", e);
//           }

//           // 5. Assigned Location
//           const fetchLocation = async (url) => {
//             const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
//             const data = res.data?.data || res.data;
//             if (data?.location?.name) return data.location.name;
//             return null;
//           };

//           try {
//             let locName = await fetchLocation(API_5000);
//             if (!locName) locName = await fetchLocation(API_5000);
//             if (!locName && profileData.location?.name) locName = profileData.location.name;
//             setAssignedLocation(locName || "Not Assigned");
//           } catch (e) {
//             setAssignedLocation("Not Assigned");
//           }

//           // 6. Shift Timing
//           const fetchShift = async (url) => {
//             const res = await axios.get(`${url}api/shifts/employee/${targetId}`);
//             const data = res.data?.data || res.data;
//             if (data?.startTime) return `${data.startTime} - ${data.endTime}`;
//             if (data?.employeeAssignment?.startTime) return `${data.employeeAssignment.startTime} - ${data.employeeAssignment.endTime}`;
//             return null;
//           };

//           try {
//             let shiftTime = await fetchShift(API_5000);
//             if (!shiftTime) shiftTime = await fetchShift(API_5000);
//             setShiftTiming(shiftTime || "No Shift Assigned");
//           } catch (e) {
//             setShiftTiming("Not Assigned");
//           }



//           setStats(prev => ({
//             ...prev,
//             presentDays: presentCount,
//             pendingLeaves: pendingLeavesCount
//           }));
//         }
//       } catch (err) {
//         console.error("Dashboard data fetch error:", err);
//       }
//     };

//     fetchData();
//   }, [email]);



//   if (!profile) return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 uppercase tracking-widest text-xs font-bold text-blue-600">
//       <div className="flex flex-col items-center gap-3">
//         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         Processing Dashboard...
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] text-[#334155]">


//       <main className="max-w-6xl mx-auto p-6 lg:p-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

//           {/* Left Column: Compact Profile & Info */}
//           <div className="lg:col-span-4 space-y-6">
//             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
//               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
//                 <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
//                   {profile.name.split(' ').map(n => n[0]).join('')}
//                 </div>
//                 <div>
//                   <h2 className="text-base font-bold text-gray-900 leading-none mb-1">{profile.name}</h2>
//                   <p className="text-xs text-blue-600 font-medium">{profile.department}</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <MiniDetail label="Employee ID" value={profile.employeeId} />
//                 <MiniDetail label="Status" value="Active" isStatus />
//                 <MiniDetail label="Location" value={assignedLocation} />
//                 <MiniDetail label="Shift" value={shiftTiming} />
//                 <MiniDetail label="Joined" value={new Date(profile.joinDate).toLocaleDateString()} />
//               </div>

//               <button
//                 onClick={() => navigate("/myattendance")}
//                 className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-100"
//               >
//                 View My Attendance
//               </button>
//             </div>
//           </div>

//           {/* Right Column: Stats & Sleek Actions */}
//           <div className="lg:col-span-8 space-y-8">

//             {/* Compact Stats Row */}
//             <div className="grid grid-cols-3 gap-4">
//               <CompactStat label="Attendance" value={stats.presentDays} icon={<FiCheckCircle />} color="emerald" />
//               <CompactStat label="Leaves" value={stats.pendingLeaves} icon={<FiCalendar />} color="amber" />
//               <CompactStat label="Permissions" value={stats.activePermissions} icon={<FiList />} color="blue" />
//             </div>

//             {/* Action Center - Now horizontal and sleek */}
//             <div className="space-y-4">
//               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Quick Actions</h3>
//               <div className="grid grid-cols-2 gap-4">

//                 <SleekAction
//                   icon={<FiCamera />}
//                   title="Attendance"
//                   desc="Check-In/Out"
//                   color="emerald"
//                   onClick={() => navigate("/attendance-capture")}
//                 />
//                 <SleekAction
//                   icon={<FiHistory />}
//                   title="History"
//                   desc="View logs"
//                   color="blue"
//                   onClick={() => navigate("/myattendance")}
//                 />
//                 <SleekAction
//                   icon={<FiList />}
//                   title="Permissions"
//                   desc="Short leaves"
//                   color="purple"
//                   onClick={() => navigate("/mypermissions")}
//                 />
//                 <SleekAction
//                   icon={<FiCalendar />}
//                   title="Leave Request"
//                   desc="Apply now"
//                   color="orange"
//                   onClick={() => navigate("/myleaves")}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// // ✅ Minimalist Helper Components
// const MiniDetail = ({ label, value, isStatus }) => (
//   <div className="flex justify-between items-center">
//     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
//     {isStatus ? (
//       <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Active</span>
//     ) : (
//       <span className="text-xs font-bold text-gray-700">{value}</span>
//     )}
//   </div>
// );

// const CompactStat = ({ label, value, icon, color }) => {
//   const colors = {
//     emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
//     amber: "bg-amber-50 text-amber-600 border-amber-100",
//     blue: "bg-blue-50 text-blue-600 border-blue-100"
//   };

//   return (
//     <div className={`p-3 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center shadow-sm`}>
//       <div className="mb-1 text-base opacity-70">{icon}</div>
//       <div className="text-xl font-black">{value}</div>
//       <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 leading-none mt-0.5">{label}</p>
//     </div>
//   );
// };

// const SleekAction = ({ icon, title, desc, color, onClick, badge }) => { // ✅ Added badge prop
//   const themes = {
//     rose: "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100",
//     emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100",
//     blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-100",
//     purple: "bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border-purple-100",
//     orange: "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white border-orange-100"
//   };

//   return (
//     <div
//       onClick={onClick}
//       className={`relative group p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${themes[color]} hover:shadow-lg hover:translate-y-[-2px]`}
//     >
//       {/* ✅ Badge Indicator */}
//       {badge > 0 && (
//         <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm z-10">
//           {badge > 99 ? '99+' : badge}
//         </div>
//       )}

//       <div className="text-xl">{icon}</div>
//       <div>
//         <h4 className="text-[13px] font-bold tracking-tight leading-none mb-0.5">{title}</h4>
//         <p className="text-[9px] opacity-60 font-medium uppercase tracking-wider">{desc}</p>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;




import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCamera,
  FiClock as FiHistory,
  FiList,
  FiUserX
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { subscribeToPushNotifications } from "../utils/pushNotification";

// Recharts imports
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("employeeEmail");
  const [profile, setProfile] = useState(null);
  const [assignedLocation, setAssignedLocation] = useState("Not Assigned");
  const [shiftTiming, setShiftTiming] = useState("Not Assigned");

  // Filter states
  const [lateDate, setLateDate] = useState("");
  const [lateMonth, setLateMonth] = useState("2026-02"); // February 2026 as per your data
  const [absentDate, setAbsentDate] = useState("");
  const [absentMonth, setAbsentMonth] = useState("2026-02");

  // Employee specific stats
  const [employeeStats, setEmployeeStats] = useState({
    presentThisMonth: 0,
    absentThisMonth: 0,
    lateThisMonth: 0,
    totalWorkingDays: 0
  });

  // Chart data states
  const [lateChartData, setLateChartData] = useState([]);
  const [absentChartData, setAbsentChartData] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const BASE_URL = API_BASE_URL.replace(/\/api$/, "/");
        const API_5000 = API_BASE_URL.replace(/\/api$/, "/");

        // 1. Fetch Profile
        const profileRes = await axios.get(`${BASE_URL}api/employees/get-employee?email=${email}`);
        const profileData = profileRes.data.data || profileRes.data;
        setProfile(profileData);

        if (profileData) {
          if (profileData._id) {
            subscribeToPushNotifications(profileData._id);
          }

          const empId = profileData.employeeId;
          const localStorageId = JSON.parse(localStorage.getItem("employeeData"))?.employeeId;
          const targetId = empId || localStorageId;

          // 2. Fetch All Attendance
          const allAttRes = await axios.get(`${BASE_URL}api/attendance/allattendance`);
          const allAttendanceData = Array.isArray(allAttRes.data) ? allAttRes.data :
            allAttRes.data.records || allAttRes.data.allAttendance || [];
          setAllAttendance(allAttendanceData);

          // 3. Filter current user's attendance
          const userAttendance = allAttendanceData.filter(record => {
            const recordId = typeof record.employeeId === 'object' ?
              record.employeeId?.employeeId : record.employeeId;
            return recordId === targetId;
          });

          // 4. Calculate employee stats for February 2026
          calculateEmployeeStats(userAttendance, profileData);

          // 5. Leaves Stats
          const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
          const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;

          // 6. Permissions Stats
          try {
            const permRes = await axios.get(`${API_5000}api/permissions/my-permissions/${targetId}`);
            const activePermsCount = permRes.data?.filter(p => p.status === "APPROVED").length || 0;
            setEmployeeStats(prev => ({ ...prev, permissions: activePermsCount }));
          } catch (e) {
            console.warn("Permissions fetch failed", e);
          }

          // 7. Assigned Location
          const fetchLocation = async (url) => {
            const res = await axios.get(`${url}api/employees/mylocation/${targetId}`);
            const data = res.data?.data || res.data;
            if (data?.location?.name) return data.location.name;
            return null;
          };

          try {
            let locName = await fetchLocation(API_5000);
            if (!locName && profileData.location?.name) locName = profileData.location.name;
            setAssignedLocation(locName || "Not Assigned");
          } catch (e) {
            setAssignedLocation("Not Assigned");
          }

          // 8. Shift Timing
          const fetchShift = async (url) => {
            const res = await axios.get(`${url}api/shifts/employee/${targetId}`);
            const data = res.data?.data || res.data;
            if (data?.startTime) return `${data.startTime} - ${data.endTime}`;
            if (data?.employeeAssignment?.startTime) return `${data.employeeAssignment.startTime} - ${data.employeeAssignment.endTime}`;
            return null;
          };

          try {
            let shiftTime = await fetchShift(API_5000);
            setShiftTiming(shiftTime || "No Shift Assigned");
          } catch (e) {
            setShiftTiming("Not Assigned");
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  // Calculate employee specific stats for selected month
  const calculateEmployeeStats = (attendance, profileData) => {
    const [year, month] = lateMonth.split('-').map(Number);

    // Get working days in month (Monday to Friday, 6-day week if applicable)
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = [];
    const workingDayMap = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // For 6-day week (Monday to Saturday)
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDays.push(day);
        workingDayMap[day] = true;
      }
    }

    // Get present days and late days
    const presentDays = new Set();
    let lateDays = 0;

    attendance.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime);
      if (recordDate.getMonth() + 1 !== month || recordDate.getFullYear() !== year) return;

      const day = recordDate.getDate();

      if (record.status === "present" || record.status === "checked-in") {
        if (workingDayMap[day]) {
          presentDays.add(day);
        }

        // Check for late (using your data logic)
        // In your table, Saquiba has 20 late entries for 13 present days
        // That means some days might have multiple late entries or different logic
        const shiftStart = getShiftStartTime(profileData?.shift || "D");
        const [hours, minutes] = shiftStart.split(':').map(Number);
        const shiftStartTime = new Date(recordDate);
        shiftStartTime.setHours(hours, minutes, 0, 0);

        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + 5);

        if (recordDate > graceTime) {
          lateDays++;
        }
      }
    });

    // Calculate absent days
    let absentDays = 0;
    workingDays.forEach(day => {
      if (!presentDays.has(day)) {
        absentDays++;
      }
    });

    setEmployeeStats({
      presentThisMonth: presentDays.size,
      absentThisMonth: absentDays,
      lateThisMonth: lateDays,
      totalWorkingDays: workingDays.length
    });
  };

  // Update charts when filters change
  useEffect(() => {
    if (!profile || !allAttendance.length) return;

    const targetId = profile.employeeId;
    const userAttendance = allAttendance.filter(record => {
      const recordId = typeof record.employeeId === 'object' ?
        record.employeeId?.employeeId : record.employeeId;
      return recordId === targetId;
    });

    updateChartData(userAttendance, profile);
    calculateEmployeeStats(userAttendance, profile); // Recalculate stats when month changes
  }, [lateMonth, absentMonth, lateDate, absentDate]);

  const updateChartData = (userAttendance, profileData) => {
    // Late Analysis
    const lateAnalysis = analyzeLateDays(userAttendance, profileData);
    // Absent Analysis
    const absentAnalysis = analyzeAbsentDays(userAttendance, profileData);

    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  // Late Analysis with proper weekly grouping
  const analyzeLateDays = (attendance, profileData) => {
    const [year, month] = lateMonth.split('-').map(Number);

    // Weekly late minutes (Week 1: Days 1-7, Week 2: Days 8-14, etc.)
    const weeklyLate = {
      'Week 1': 0,
      'Week 2': 0,
      'Week 3': 0,
      'Week 4': 0,
      'Week 5': 0
    };

    attendance.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime);

      // Filter by date if selected
      if (lateDate) {
        const recordDateStr = recordDate.toISOString().split('T')[0];
        if (recordDateStr !== lateDate) return;
      } else {
        // Filter by month
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }

      const shiftStart = getShiftStartTime(profileData?.shift || "D");

      const checkInTime = new Date(record.checkInTime);
      const [hours, minutes] = shiftStart.split(':').map(Number);
      const shiftStartTime = new Date(checkInTime);
      shiftStartTime.setHours(hours, minutes, 0, 0);

      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + 5);

      if (checkInTime > graceTime) {
        const lateMins = Math.floor((checkInTime - graceTime) / (1000 * 60));

        // Group by week (Days 1-7 = Week 1, 8-14 = Week 2, etc.)
        const day = recordDate.getDate();
        let weekNum = 1;
        if (day >= 1 && day <= 7) weekNum = 1;
        else if (day >= 8 && day <= 14) weekNum = 2;
        else if (day >= 15 && day <= 21) weekNum = 3;
        else if (day >= 22 && day <= 28) weekNum = 4;
        else weekNum = 5;

        weeklyLate[`Week ${weekNum}`] += lateMins;
      }
    });

    const isSingleDate = !!lateDate;

    // Convert to chart data 
    // Always show all weeks for month view so the x-axis is steady
    let chartData = Object.entries(weeklyLate)
      .map(([week, minutes]) => ({
        name: week,
        value: minutes,
        label: `${minutes} min`
      }));

    if (isSingleDate) {
      // Find the specific week that got updated, or return the single date
      chartData = chartData.filter(d => d.value > 0);
      if (chartData.length === 0) {
        chartData = [{ name: lateDate, value: 0, label: '0 min' }];
      } else {
        chartData[0].name = lateDate; // replace "Week X" with the specific date
      }
    }

    return { chartData };
  };

  // Absent Analysis with proper weekly grouping
  const analyzeAbsentDays = (attendance, profileData) => {
    const [year, month] = absentMonth.split('-').map(Number);

    // Get working days (Monday to Saturday for 6-day week)
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDayMap = {};
    const workingDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // 6-day week: Monday to Saturday (1-6)
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDayMap[day] = true;
        workingDays.push(day);
      }
    }

    // Get present days
    const presentDays = new Set();

    attendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);

      if (absentDate) {
        const recordDateStr = recordDate.toISOString().split('T')[0];
        if (recordDateStr !== absentDate) return;
      } else {
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }

      if (record.status === "present" || record.status === "checked-in") {
        const day = recordDate.getDate();
        if (workingDayMap[day]) {
          presentDays.add(day);
        }
      }
    });

    // For single date view
    if (absentDate) {
      const selectedDate = new Date(absentDate);
      const dayOfWeek = selectedDate.getDay();
      const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 6;

      if (isWorkingDay) {
        const day = selectedDate.getDate();
        const isPresent = presentDays.has(day);
        return {
          chartData: [{
            name: absentDate,
            value: isPresent ? 0 : 1,
            label: isPresent ? 'Present' : 'Absent'
          }]
        };
      } else {
        return { chartData: [] };
      }
    }

    // For month view - Group absent days by week
    const weeklyAbsent = {
      'Week 1': 0,
      'Week 2': 0,
      'Week 3': 0,
      'Week 4': 0,
      'Week 5': 0
    };

    workingDays.forEach(day => {
      if (!presentDays.has(day)) {
        // Determine week (Days 1-7 = Week 1, 8-14 = Week 2, etc.)
        let weekNum = 1;
        if (day >= 1 && day <= 7) weekNum = 1;
        else if (day >= 8 && day <= 14) weekNum = 2;
        else if (day >= 15 && day <= 21) weekNum = 3;
        else if (day >= 22 && day <= 28) weekNum = 4;
        else weekNum = 5;

        weeklyAbsent[`Week ${weekNum}`]++;
      }
    });

    // Convert to chart data 
    // Always show all weeks for month view so the x-axis is steady
    const chartData = Object.entries(weeklyAbsent)
      .map(([week, days]) => ({
        name: week,
        value: days,
        label: `${days} day${days > 1 ? 's' : ''}`
      }));

    return { chartData };
  };

  const getShiftStartTime = (shiftType) => {
    const shiftTimes = {
      "A": "10:00", "B": "14:00", "C": "18:00", "D": "09:00",
      "E": "10:00", "F": "14:00", "G": "09:00", "H": "09:00",
      "I": "07:00", "BR": "07:00"
    };
    return shiftTimes[shiftType] || "09:00";
  };

  // Chart colors
  const CHART_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  // Custom tooltips
  const LateTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-rose-600 font-medium">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  const AbsentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-red-500 font-medium">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !profile) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] uppercase tracking-widest text-xs font-bold text-blue-600">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Processing Dashboard...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155]">
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Profile Card + Employee Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-none mb-1">{profile.name}</h2>
                  <p className="text-xs text-blue-600 font-medium">{profile.department || "Developer"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <MiniDetail label="EMPLOYEE ID" value={profile.employeeId} />
                <MiniDetail label="STATUS" value="Active" isStatus />
                <MiniDetail label="LOCATION" value={assignedLocation} />
                <MiniDetail label="SHIFT" value={shiftTiming} />
                <MiniDetail label="JOINED" value={new Date(profile.joinDate).toLocaleDateString()} />
              </div>

              <button
                onClick={() => navigate("/myattendance")}
                className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-100"
              >
                View My Attendance
              </button>
            </div>

            {/* Quick Actions (Moved from Right Column) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-4">
                <SleekAction
                  icon={<FiCamera />}
                  title="Attendance"
                  desc="CHECK-IN/OUT"
                  color="emerald"
                  onClick={() => navigate("/attendance-capture")}
                />
                <SleekAction
                  icon={<FiHistory />}
                  title="History"
                  desc="VIEW LOGS"
                  color="blue"
                  onClick={() => navigate("/myattendance")}
                />
                <SleekAction
                  icon={<FiList />}
                  title="Permissions"
                  desc="SHORT LEAVES"
                  color="purple"
                  onClick={() => navigate("/mypermissions")}
                />
                <SleekAction
                  icon={<FiCalendar />}
                  title="Leave Request"
                  desc="APPLY NOW"
                  color="orange"
                  onClick={() => navigate("/myleaves")}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Late Analysis Card */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Late Minutes by Week</h3>
                    <p className="text-xs text-gray-500">Weekly distribution for {lateMonth}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      value={lateMonth}
                      onChange={(e) => {
                        setLateMonth(e.target.value);
                        setLateDate("");
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-rose-500"
                    />
                    <input
                      type="date"
                      value={lateDate}
                      onChange={(e) => setLateDate(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="h-64">
                  {lateChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lateChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {lateChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<LateTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No late records for {lateMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Absent Analysis Card */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Absent Days by Week</h3>
                    <p className="text-xs text-gray-500">Weekly breakdown for {absentMonth}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      value={absentMonth}
                      onChange={(e) => {
                        setAbsentMonth(e.target.value);
                        setAbsentDate("");
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="date"
                      value={absentDate}
                      onChange={(e) => setAbsentDate(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="h-64">
                  {absentChartData.some(d => d.value > 0) || absentDate ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={absentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          domain={[0, 'dataMax + 1']}
                          allowDecimals={false}
                        />
                        <Tooltip content={<AbsentTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <FiUserX className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No absent records for {absentMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// MiniDetail Component
const MiniDetail = ({ label, value, isStatus }) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    {isStatus ? (
      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">ACTIVE</span>
    ) : (
      <span className="text-xs font-bold text-gray-700">{value}</span>
    )}
  </div>
);

// StatRow Component
const StatRow = ({ icon, label, value, color }) => {
  const colors = {
    emerald: "text-emerald-600",
    purple: "text-purple-600",
    rose: "text-rose-600"
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-slate-600 font-medium">{label}</span>
      </div>
      <span className={`text-base font-bold ${colors[color]}`}>{value}</span>
    </div>
  );
};

// SleekAction Component
const SleekAction = ({ icon, title, desc, color, onClick }) => {
  const themes = {
    rose: "bg-rose-50 text-emerald-600 border-emerald-50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100"
  };

  const textColors = {
    rose: "text-rose-600",
    emerald: "text-emerald-700",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${themes[color]} hover:shadow-sm`}
    >
      <div className={`text-xl ${textColors[color]}`}>{icon}</div>
      <div>
        <h4 className={`text-sm font-bold tracking-tight leading-none mb-1 ${textColors[color]}`}>{title}</h4>
        <p className={`text-[10px] opacity-60 font-medium uppercase tracking-wider ${textColors[color]}`}>{desc}</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
