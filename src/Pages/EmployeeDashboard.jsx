import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCamera,
  FiClock as FiHistory,
  FiList,
  FiUserX,
  FiX,
  FiInfo
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { subscribeToPushNotifications } from "../utils/pushNotification";
import { FaBirthdayCake, FaGift, FaSmile, FaAward } from "react-icons/fa";

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
  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [lateDate, setLateDate] = useState("");
  const [lateMonth, setLateMonth] = useState(getCurrentMonth());
  const [absentDate, setAbsentDate] = useState("");
  const [absentMonth, setAbsentMonth] = useState(getCurrentMonth());

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
  const [userAttendance, setUserAttendance] = useState([]); // Added state for table
  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [anniversariesToday, setAnniversariesToday] = useState([]);
  const [leavesToday, setLeavesToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "birthday" or "leave"

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
          const filteredAttendance = allAttendanceData.filter(record => {
            const recordId = typeof record.employeeId === 'object' ?
              record.employeeId?.employeeId : record.employeeId;
            return recordId === targetId;
          });
          setUserAttendance(filteredAttendance);

          // 4. Smart initialization: find the latest month THIS user has data for
          let resolvedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`; // fallback: current month

          if (filteredAttendance.length > 0) {
            const validDates = filteredAttendance
              .map(r => r.checkInTime ? new Date(r.checkInTime) : null)
              .filter(d => d && !isNaN(d.getTime()));

            if (validDates.length > 0) {
              const latestDate = new Date(Math.max(...validDates));
              resolvedMonth = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
            }
          }

          // Set state for the month pickers
          setLateMonth(resolvedMonth);
          setAbsentMonth(resolvedMonth);

          // *** KEY FIX: call chart update directly with the resolved month ***
          // (we can't rely on the state-change useEffect firing on first load)
          updateChartDataWithMonth(filteredAttendance, profileData, resolvedMonth);

          // 5. Calculate employee stats for selected month
          calculateEmployeeStats(filteredAttendance, profileData);

          // 5. Leaves Stats
          const leaveRes = await axios.get(`${BASE_URL}api/leaves/employeeleaves/${targetId}`);
          const pendingLeavesCount = leaveRes.data?.records?.filter(l => l.status === "pending").length || 0;
          setEmployeeStats(prev => ({ ...prev, pendingLeaves: pendingLeavesCount }));

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

          // 9. Fetch Birthdays
          try {
            const bdayRes = await axios.get(`${BASE_URL}api/employees/birthdays-today?department=${encodeURIComponent(profileData.department || "")}`);
            setBirthdaysToday(bdayRes.data.data || []);
          } catch (e) {
            console.warn("Birthdays fetch failed", e);
          }

          // 10. Fetch Anniversaries
          try {
            const annivRes = await axios.get(`${BASE_URL}api/employees/anniversaries-today?department=${encodeURIComponent(profileData.department || "")}`);
            setAnniversariesToday(annivRes.data.data || []);
          } catch (e) {
            console.warn("Anniversaries fetch failed", e);
          }

          // 10. Fetch Leaves Today
          try {
            const leaveTodayRes = await axios.get(`${BASE_URL}api/leaves/on-leave-today?department=${encodeURIComponent(profileData.department || "")}`);
            setLeavesToday(leaveTodayRes.data.data || []);
          } catch (e) {
            console.warn("Leaves today fetch failed", e);
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
    if (!lateMonth) return;
    const parts = lateMonth.split('-');
    if (parts.length < 2) return;
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return;

    // Get working days in month (up to today if current/future month)
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    let maxDayToCheck = daysInMonth;
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      maxDayToCheck = 0;
    } else if (year === currentYear && month === currentMonth) {
      maxDayToCheck = today.getDate();
    }

    const workingDays = [];
    const workingDayMap = {};

    for (let day = 1; day <= maxDayToCheck; day++) {
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

  // Version that takes month as a parameter — used on initial load to avoid state async race condition
  const updateChartDataWithMonth = (attendance, profileData, month) => {
    const lateAnalysis = analyzeLateDaysForMonth(attendance, profileData, month, "");
    const absentAnalysis = analyzeAbsentDaysForMonth(attendance, profileData, month, "");
    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  // Late Analysis with proper weekly grouping
  const analyzeLateDays = (attendance, profileData) =>
    analyzeLateDaysForMonth(attendance, profileData, lateMonth, lateDate);

  // Parameterized version (used on initial load to avoid async state race)
  const analyzeLateDaysForMonth = (attendance, profileData, theMonth, theDate) => {
    if (!theMonth) return { chartData: [] };
    const parts = theMonth.split('-');
    if (parts.length < 2) return { chartData: [] };
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return { chartData: [] };

    const weeklyLate = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };

    attendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);

      if (theDate) {
        if (recordDate.toISOString().split('T')[0] !== theDate) return;
      } else {
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }

      const shiftStart = getShiftStartTime(profileData?.shift || "D");
      const checkInTime = new Date(record.checkInTime);
      const [hours, mins] = shiftStart.split(':').map(Number);
      const shiftStartTime = new Date(checkInTime);
      shiftStartTime.setHours(hours, mins, 0, 0);
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + 5);

      if (checkInTime > graceTime) {
        const lateMins = Math.floor((checkInTime - graceTime) / (1000 * 60));
        const day = recordDate.getDate();
        let weekNum = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
        weeklyLate[`Week ${weekNum}`] += lateMins;
      }
    });

    let chartData = Object.entries(weeklyLate).map(([week, minutes]) => ({ name: week, value: minutes, label: `${minutes} min` }));

    if (theDate) {
      chartData = chartData.filter(d => d.value > 0);
      if (chartData.length === 0) chartData = [{ name: theDate, value: 0, label: '0 min' }];
      else chartData[0].name = theDate;
    }

    return { chartData };
  };

  // Absent Analysis with proper weekly grouping
  const analyzeAbsentDays = (attendance, profileData) =>
    analyzeAbsentDaysForMonth(attendance, profileData, absentMonth, absentDate);

  // Parameterized version (used on initial load to avoid async state race)
  const analyzeAbsentDaysForMonth = (attendance, profileData, theMonth, theDate) => {
    if (!theMonth) return { chartData: [] };
    const parts = theMonth.split('-');
    if (parts.length < 2) return { chartData: [] };
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return { chartData: [] };

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    let maxDayToCheck = daysInMonth;
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      maxDayToCheck = 0;
    } else if (year === currentYear && month === currentMonth) {
      maxDayToCheck = today.getDate();
    }

    const workingDayMap = {};
    const workingDays = [];
    for (let day = 1; day <= maxDayToCheck; day++) {
      const d = new Date(year, month - 1, day).getDay();
      if (d >= 1 && d <= 6) { workingDayMap[day] = true; workingDays.push(day); }
    }

    const presentDays = new Set();
    attendance.forEach(record => {
      if (!record.checkInTime) return;
      const recordDate = new Date(record.checkInTime);
      if (theDate) {
        if (recordDate.toISOString().split('T')[0] !== theDate) return;
      } else {
        if (recordDate.getFullYear() !== year || recordDate.getMonth() + 1 !== month) return;
      }
      if (record.status === "present" || record.status === "checked-in") {
        const day = recordDate.getDate();
        if (workingDayMap[day]) presentDays.add(day);
      }
    });

    if (theDate) {
      const selectedDate = new Date(theDate);
      const dow = selectedDate.getDay();
      if (dow >= 1 && dow <= 6) {
        const day = selectedDate.getDate();
        const isPresent = presentDays.has(day);
        return { chartData: [{ name: theDate, value: isPresent ? 0 : 1, label: isPresent ? 'Present' : 'Absent' }] };
      }
      return { chartData: [] };
    }

    const weeklyAbsent = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0, 'Week 5': 0 };
    workingDays.forEach(day => {
      if (!presentDays.has(day)) {
        const wk = day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
        weeklyAbsent[`Week ${wk}`]++;
      }
    });

    const chartData = Object.entries(weeklyAbsent).map(([week, days]) => ({ name: week, value: days, label: `${days} day${days > 1 ? 's' : ''}` }));
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
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="font-medium text-rose-600">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  const AbsentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
          <p className="font-medium text-red-500">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !profile) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] uppercase tracking-widest text-xs font-bold text-blue-600">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        Processing Dashboard...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-sans">
      <main className="p-6 lg:p-10 max-w-full overflow-hidden">
        
        {/* Welcome Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Welcome back, <span className="text-blue-600">{profile.name.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Here's what's happening with your attendance today.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 text-slate-600 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <FiCalendar className="text-blue-500" />
            <span className="text-xs font-bold tracking-tight">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Birthday Special Section */}
        {(() => {
          const isMyBirthday = birthdaysToday.some(b => b.email === email);
          const myAnniversary = anniversariesToday.find(a => a.email === email);
          const deptBirthdays = birthdaysToday.filter(b => b.email !== email);
          const deptAnniversaries = anniversariesToday.filter(a => a.email !== email);
          const deptLeaves = leavesToday.filter(l => l.email !== email);

          if (!isMyBirthday && !myAnniversary && deptBirthdays.length === 0 && deptAnniversaries.length === 0 && deptLeaves.length === 0) return null;

          return (
            <div className="mb-8 space-y-4">
              {/* Personal Celebration Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isMyBirthday && (
                  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                        <FaBirthdayCake className="text-3xl text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Happy Birthday, {profile.name.split(' ')[0]}! 🎊</h2>
                        <p className="text-white/80 text-xs font-medium">Wishing you a fantastic day and a wonderful year ahead!</p>
                      </div>
                    </div>
                  </div>
                )}

                {myAnniversary && (
                  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                        <FaAward className="text-3xl text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Happy {myAnniversary.yearsOfService}{myAnniversary.yearsOfService === 1 ? 'st' : myAnniversary.yearsOfService === 2 ? 'nd' : myAnniversary.yearsOfService === 3 ? 'rd' : 'th'} Work Anniversary! 🏆</h2>
                        <p className="text-white/80 text-xs font-medium">Thank you for your dedication and brilliant work over the past {myAnniversary.yearsOfService} year{myAnniversary.yearsOfService > 1 ? 's' : ''}!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Departmental Celebrations & Leaves */}
              <div className="grid grid-cols-1 gap-3">
                {deptBirthdays.length > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 bg-white border border-rose-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => { setModalType("birthday"); setShowModal(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 overflow-hidden">
                        {deptBirthdays.slice(0, 3).map((b, i) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100" title={b.name}>
                            {b.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {deptBirthdays.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                            +{deptBirthdays.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">
                          {deptBirthdays.length === 1 
                            ? deptBirthdays[0].name 
                            : `${deptBirthdays[0].name} and ${deptBirthdays.length - 1} other${deptBirthdays.length > 2 ? 's' : ''}`
                          }
                        </span> from your department are celebrating their Birthday today! 🎂
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">View All</div>
                      <button 
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); alert(`Departmental wishes sent! 🎊`); }}
                      >
                        Send Wishes
                      </button>
                    </div>
                  </div>
                )}

                {deptAnniversaries.length > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 bg-white border border-emerald-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => { setModalType("anniversary"); setShowModal(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 overflow-hidden">
                        {deptAnniversaries.slice(0, 3).map((a, i) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600 border border-emerald-100" title={a.name}>
                            {a.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {deptAnniversaries.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                            +{deptAnniversaries.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">
                          {deptAnniversaries.length === 1 
                            ? deptAnniversaries[0].name 
                            : `${deptAnniversaries[0].name} and ${deptAnniversaries.length - 1} other${deptAnniversaries.length > 2 ? 's' : ''}`
                          }
                        </span> from your department are celebrating their Work Anniversary! 🏆
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">View All</div>
                      <button 
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); alert(`Anniversary congratulations sent! 🎊`); }}
                      >
                        Celebrate
                      </button>
                    </div>
                  </div>
                )}

                {deptLeaves.length > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => { setModalType("leave"); setShowModal(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 overflow-hidden">
                        {deptLeaves.slice(0, 3).map((l, i) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600 border border-amber-100" title={l.employeeName}>
                            {l.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {deptLeaves.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white">
                            +{deptLeaves.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        <span className="font-bold text-slate-900">
                          {deptLeaves.length === 1 
                            ? deptLeaves[0].employeeName 
                            : `${deptLeaves[0].employeeName} and ${deptLeaves.length - 1} other${deptLeaves.length > 2 ? 's' : ''}`
                          }
                        </span> from your department {deptLeaves.length === 1 ? 'is' : 'are'} on Leave today. 🏠
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">View Details</div>
                      <div className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-md tracking-widest">
                        Out of Office
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Celebration Modal */}
              {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">
                          {modalType === 'birthday' ? `Today's Birthdays` : 
                           modalType === 'anniversary' ? `Work Anniversaries` :
                           `Employees on Leave`}
                        </h3>
                      <button 
                        onClick={() => setShowModal(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>
                    <div className="p-2 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2 p-2">
                        {(modalType === 'birthday' ? deptBirthdays : modalType === 'anniversary' ? deptAnniversaries : deptLeaves).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                             <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                                 modalType === 'birthday' ? 'bg-rose-100 text-rose-600' : 
                                 modalType === 'anniversary' ? 'bg-emerald-100 text-emerald-600' :
                                 'bg-amber-100 text-amber-600'
                               }`}>
                                 {(item.name || item.employeeName).split(' ').map(n => n[0]).join('')}
                               </div>
                               <div>
                                 <h4 className="text-sm font-bold text-gray-900">{item.name || item.employeeName}</h4>
                                 <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                   {modalType === 'anniversary' ? `${item.yearsOfService} Year Celebration` : item.role || 'Team Member'}
                                 </p>
                               </div>
                             </div>
                             {(modalType === 'birthday' || modalType === 'anniversary') && (
                               <button 
                                 className={`px-3 py-1.5 bg-white border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                                   modalType === 'birthday' ? 'text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white' : 
                                   'text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                 }`}
                                 onClick={() => alert(`Celebration wish sent to ${item.name}! 🎊`)}
                               >
                                 {modalType === 'birthday' ? 'Wish' : 'Celebrate'}
                               </button>
                             )}
                             {modalType === 'leave' && (
                               <div className="text-[9px] font-bold uppercase text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-lg">
                                 {item.leaveType || 'On Leave'}
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                       <button 
                         onClick={() => setShowModal(false)}
                         className="px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-200"
                       >
                         Close
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left Column: Profile Card + Employee Stats */}
          <div className="space-y-6 lg:col-span-4">
            {/* Profile Card */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-50">
                <div className="flex items-center justify-center text-xl font-bold text-blue-600 w-14 h-14 rounded-2xl bg-blue-50">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="mb-1 text-base font-bold leading-none text-gray-900">{profile.name}</h2>
                  <p className="text-xs font-medium text-blue-600">{profile.department || "Developer"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <MiniDetail label="Employee ID" value={profile.employeeId} />
                <MiniDetail label="Status" value="Active" isStatus />
                <MiniDetail label="Location" value={assignedLocation} />
                <MiniDetail label="Work Shift" value={shiftTiming} />
                <MiniDetail label="Join Date" value={new Date(profile.joinDate).toLocaleDateString()} />
              </div>

              <button
                onClick={() => navigate("/myattendance")}
                className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all"
              >
                View Full Attendance Report
              </button>

              <button
                onClick={() => navigate("/candidate-login")}
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-100"
              >
                Complete Profile
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">QUICK ACTIONS</h3>
              <div className="grid grid-cols-1 gap-2">
                <SleekAction
                  icon={<FiCamera />}
                  title="Check Attendance"
                  desc="MARK IN / OUT"
                  color="blue"
                  onClick={() => navigate("/attendance-capture")}
                />
                <SleekAction
                  icon={<FiHistory />}
                  title="Attendance History"
                  desc="VIEW PREVIOUS RECORDS"
                  color="slate"
                  onClick={() => navigate("/myattendance")}
                />
                <SleekAction
                  icon={<FiList />}
                  title="Permission Request"
                  desc="APPLY FOR SHORT LEAVE"
                  color="slate"
                  onClick={() => navigate("/mypermissions")}
                />
                <SleekAction
                  icon={<FiCalendar />}
                  title="Leave Management"
                  desc="APPLY FOR LEAVE"
                  color="slate"
                  onClick={() => navigate("/myleaves")}
                />
              </div>
            </div>
          </div>          {/* Right Column */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Late Analysis Card */}
              <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="flex items-center justify-between gap-4 mb-6 text-slate-900">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold whitespace-nowrap">Late Minutes by Week</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1 whitespace-nowrap">Weekly distribution for {lateMonth}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="month"
                      value={lateMonth}
                      onChange={(e) => {
                        setLateMonth(e.target.value);
                        setLateDate("");
                      }}
                      className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white cursor-pointer transition-all"
                    />
                  </div>
                </div>
 
                <div className="h-64">
                  {lateChartData.some(d => d.value > 0) || lateDate ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          domain={[0, 'dataMax + 10']}
                        />
                        <Tooltip content={<LateTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No late records for {lateMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Absent Analysis Card */}
              <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                <div className="flex items-center justify-between gap-4 mb-6 text-slate-900">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold whitespace-nowrap">Absent Days by Week</h3>
                    <p className="text-sm font-medium text-slate-400 mt-1 whitespace-nowrap">Weekly breakdown for {absentMonth}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="month"
                      value={absentMonth}
                      onChange={(e) => {
                        setAbsentMonth(e.target.value);
                        setAbsentDate("");
                      }}
                      className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white cursor-pointer transition-all"
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
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FiUserX className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No absent records for {absentMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Attendance Registry */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-900">Recent Attendance Activity</h3>
                <button
                  onClick={() => navigate("/myattendance")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All Activity
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">DATE</th>
                      <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">CHECK IN</th>
                      <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">CHECK OUT</th>
                      <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userAttendance.slice(0, 5).map((record, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-xs font-bold text-slate-700">
                          {new Date(record.checkInTime).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-600">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-600">
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {userAttendance.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-xs text-slate-400 italic">
                          No recent activity found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
  <div className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
    <span className="text-[11px] font-semibold text-slate-400">{label}</span>
    {isStatus ? (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
      </div>
    ) : (
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    )}
  </div>
);

// SleekAction Component - Compact and Professional
const SleekAction = ({ icon, title, desc, color, onClick }) => {
  const themes = {
    blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
  };

  const iconColors = {
    blue: "text-white",
    slate: "text-blue-600"
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3 ${themes[color]}`}
    >
      <div className={`text-lg p-1.5 rounded-lg ${color === 'blue' ? 'bg-white/10' : 'bg-white shadow-sm'} ${iconColors[color]}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold tracking-tight leading-none mb-0.5">{title}</h4>
        <p className={`text-[9px] font-medium uppercase tracking-wider ${color === 'blue' ? 'opacity-80' : 'text-slate-400'}`}>
          {desc}
        </p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;