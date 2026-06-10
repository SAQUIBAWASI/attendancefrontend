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
  FiInfo,
  FiTrash2,
  FiPlus,
  FiCoffee
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { subscribeToPushNotifications } from "../utils/pushNotification";
import { FaBirthdayCake, FaGift, FaSmile, FaAward } from "react-icons/fa";
import CelebrationCard from "../Components/CelebrationCard";

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

// ✅ Helper function to format break minutes
const formatBreakMinutes = (minutes) => {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

// ✅ Helper function to calculate total break minutes
const calculateTotalBreakMinutes = (breaks) => {
  if (!breaks || breaks.length === 0) return 0;
  return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
};

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
  const [userAttendance, setUserAttendance] = useState([]);
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
          let resolvedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

          if (filteredAttendance.length > 0) {
            const validDates = filteredAttendance
              .map(r => r.checkInTime ? new Date(r.checkInTime) : null)
              .filter(d => d && !isNaN(d.getTime()));

            if (validDates.length > 0) {
              const latestDate = new Date(Math.max(...validDates));
              resolvedMonth = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}`;
            }
          }

          setLateMonth(resolvedMonth);
          setAbsentMonth(resolvedMonth);
          updateChartDataWithMonth(filteredAttendance, profileData, resolvedMonth);
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

          // 11. Fetch Leaves Today
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile?._id) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("profile_image", file);
    formData.append("image", file);

    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedData = response.data?.data || response.data?.employee || response.data;
      
      if (updatedData) {
        const refreshed = await axios.get(`${API_BASE_URL}/employees/get-employee?email=${profile.email}`);
        const finalProfile = refreshed.data.data || refreshed.data;
        setProfile(finalProfile);
        
        const stored = localStorage.getItem("employeeData");
        if (stored) {
          const data = JSON.parse(stored);
          const newImg = finalProfile.profileImage || finalProfile.profile_image || finalProfile.image;
          if (newImg) data.profileImage = newImg;
          localStorage.setItem("employeeData", JSON.stringify(data));
        }
        
        alert("✅ Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      alert("❌ Failed to update profile image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (e) => {
    e?.stopPropagation();
    if (!profile?._id || !window.confirm("Are you sure you want to remove your profile image?")) return;

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/employees/update/${profile._id}`, {
        profileImage: ""
      });

      setProfile(prev => ({ ...prev, profileImage: "" }));
      
      const stored = localStorage.getItem("employeeData");
      if (stored) {
        const data = JSON.parse(stored);
        data.profileImage = "";
        localStorage.setItem("employeeData", JSON.stringify(data));
      }
      
      alert("✅ Profile image removed successfully!");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      alert("❌ Failed to remove profile image.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate employee specific stats for selected month
  const calculateEmployeeStats = (attendance, profileData) => {
    if (!lateMonth) return;
    const parts = lateMonth.split('-');
    if (parts.length < 2) return;
    const [year, month] = parts.map(Number);
    if (isNaN(year) || isNaN(month)) return;

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
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        workingDays.push(day);
        workingDayMap[day] = true;
      }
    }

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
    calculateEmployeeStats(userAttendance, profile);
  }, [lateMonth, absentMonth, lateDate, absentDate]);

  const updateChartData = (userAttendance, profileData) => {
    const lateAnalysis = analyzeLateDays(userAttendance, profileData);
    const absentAnalysis = analyzeAbsentDays(userAttendance, profileData);
    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  const updateChartDataWithMonth = (attendance, profileData, month) => {
    const lateAnalysis = analyzeLateDaysForMonth(attendance, profileData, month, "");
    const absentAnalysis = analyzeAbsentDaysForMonth(attendance, profileData, month, "");
    setLateChartData(lateAnalysis.chartData);
    setAbsentChartData(absentAnalysis.chartData);
  };

  const analyzeLateDays = (attendance, profileData) =>
    analyzeLateDaysForMonth(attendance, profileData, lateMonth, lateDate);

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

  const analyzeAbsentDays = (attendance, profileData) =>
    analyzeAbsentDaysForMonth(attendance, profileData, absentMonth, absentDate);

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

  const CHART_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const LateTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
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
          <p className="font-bold text-gray-700">{payload[0].payload.name}</p>
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
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 bg-[#F8FAFC] text-gray-900">
      <main className="max-w-full">
        
        {/* Welcome Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) return <>Good morning, 🌅</>;
                if (hour >= 12 && hour < 17) return <>Good afternoon, ☀️</>;
                if (hour >= 17 && hour < 21) return <>Good evening, 🌆</>;
                return <>Good night, 🌙</>;
              })()}
              <span className="text-blue-600">{profile.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Here's what's happening with your attendance today.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 text-gray-500 rounded-lg shadow-sm border border-gray-200">
            <FiCalendar className="text-blue-600 text-sm" />
            <span className="text-[11px] font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Celebrations & Announcements Row */}
        {(() => {
          const isMyBirthday = birthdaysToday.some(b => b.email === email);
          const myAnniversary = anniversariesToday.find(a => a.email === email);
          const deptBirthdays = birthdaysToday.filter(b => b.email !== email);
          const deptAnniversaries = anniversariesToday.filter(a => a.email !== email);
          const deptLeaves = leavesToday.filter(l => l.email !== email);

          if (!isMyBirthday && !myAnniversary && deptBirthdays.length === 0 && deptAnniversaries.length === 0 && deptLeaves.length === 0) return null;

          const totalEvents = (isMyBirthday ? 1 : 0) + (myAnniversary ? 1 : 0) + (deptBirthdays.length > 0 ? 1 : 0) + (deptAnniversaries.length > 0 ? 1 : 0) + (deptLeaves.length > 0 ? 1 : 0);

          return (
            <div className="mb-4 sm:mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                  <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Today's Celebrations & Updates</h3>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">
                  {totalEvents} event{totalEvents !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {isMyBirthday && (
                  <CelebrationCard 
                    type="birthday"
                    name={profile.name}
                    isPersonal={true}
                    onAction={() => alert("Happy Birthday! 🎂")}
                  />
                )}
                {myAnniversary && (
                  <CelebrationCard 
                    type="anniversary"
                    name={profile.name}
                    detail={`${myAnniversary.yearsOfService} Year${myAnniversary.yearsOfService > 1 ? 's' : ''}`}
                    isPersonal={true}
                    onAction={() => alert("Congratulations! 🏆")}
                  />
                )}
                {deptBirthdays.length > 0 && (
                  <CelebrationCard 
                    type="birthday"
                    name={`${deptBirthdays.length} Colleague${deptBirthdays.length > 1 ? 's' : ''}`}
                    detail="Birthday"
                    onAction={() => { setModalType("birthday"); setShowModal(true); }}
                  />
                )}
                {deptAnniversaries.length > 0 && (
                  <CelebrationCard 
                    type="anniversary"
                    name={`${deptAnniversaries.length} Colleague${deptAnniversaries.length > 1 ? 's' : ''}`}
                    detail="Anniversary"
                    onAction={() => { setModalType("anniversary"); setShowModal(true); }}
                  />
                )}
                {deptLeaves.length > 0 && (
                  <CelebrationCard 
                    type="leave"
                    name={`${deptLeaves.length} Colleague${deptLeaves.length > 1 ? 's' : ''}`}
                    detail="Leave"
                    onAction={() => { setModalType("leave"); setShowModal(true); }}
                  />
                )}
              </div>

              {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                      <h3 className="text-lg font-bold text-gray-700">
                        {modalType === 'birthday' ? `Today's Birthdays` : 
                         modalType === 'anniversary' ? `Work Anniversaries` :
                         `Employees on Leave`}
                      </h3>
                      <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-slate-500 hover:bg-white rounded-xl transition-all">
                        <FiX className="text-xl" />
                      </button>
                    </div>
                    <div className="p-2 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2 p-2">
                        {(modalType === 'birthday' ? deptBirthdays : modalType === 'anniversary' ? deptAnniversaries : deptLeaves).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                                modalType === 'birthday' ? 'bg-rose-100 text-rose-600' : 
                                modalType === 'anniversary' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {(item.name || item.employeeName).split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{item.name || item.employeeName}</h4>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {modalType === 'anniversary' ? `${item.yearsOfService} Year Celebration` : item.role || 'Team Member'}
                                </p>
                              </div>
                            </div>
                            {(modalType === 'birthday' || modalType === 'anniversary') && (
                              <button className={`px-3 py-1.5 bg-white border rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                                modalType === 'birthday' ? 'text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-gray-900' : 
                                'text-blue-700 border-emerald-100 hover:bg-blue-600 hover:text-gray-900'
                              }`} onClick={() => alert(`Celebration wish sent to ${item.name}! 🎊`)}>
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
                    <div className="p-4 bg-white border-t border-gray-200 flex justify-end">
                      <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-gray-100 text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all shadow-md shadow-gray-200">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-12">

          {/* Left Column: Profile Card + Employee Stats */}
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:block lg:space-y-4 lg:col-span-3">
            {/* Profile Card */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
                <div className="relative w-14 h-14">
                  {(() => {
                    const imgPath = profile.profileImage || profile.profile_image || profile.image;
                    const name = profile.name || "User";
                    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    if (imgPath) {
                      const fullUrl = imgPath.startsWith('http')
                        ? imgPath
                        : `${API_BASE_URL.replace(/\/api$/, '')}/${imgPath.replace(/^\/+/, '')}`;
                      return (
                        <img
                          src={`${fullUrl}${fullUrl.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
                          alt={name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-blue-100 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0f7ff&color=2563eb&bold=true&size=128`;
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {initials}
                        </div>
                      );
                    }
                  })()}
                  <label htmlFor="profileImageUpload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 rounded-xl cursor-pointer transition">
                    <FiCamera className="text-white opacity-0 hover:opacity-100 transition" size={20} />
                  </label>
                  <input id="profileImageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {profile.profileImage && (
                    <button onClick={handleImageDelete} className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
                      <FiX className="text-red-500" size={12} />
                    </button>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-none text-gray-900">{profile.name}</h2>
                  <p className="text-[11px] font-medium text-blue-600 mt-0.5">{profile.department || "Developer"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <MiniDetail label="Employee ID" value={profile.employeeId} />
                <MiniDetail label="Status" value="Active" isStatus />
                <MiniDetail label="Location" value={assignedLocation} />
                <MiniDetail label="Work Shift" value={shiftTiming} />
                <MiniDetail label="Join Date" value={new Date(profile.joinDate).toLocaleDateString()} />
              </div>

              <button
                onClick={() => navigate("/myattendance")}
                className="w-full mt-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold transition-all"
              >
                View Full Attendance Report
              </button>

              <button
                onClick={() => navigate("/candidate-login")}
                className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg text-[11px] font-bold transition-all shadow-sm"
              >
                Complete Profile
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 sm:p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-1">QUICK ACTIONS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
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
          </div>

          {/* Right Column */}
          <div className="space-y-4 lg:col-span-9">
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Late Analysis Card */}
              <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-gray-900">
                  <div>
                    <h3 className="text-sm font-bold">Late Minutes by Week</h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Weekly distribution for {lateMonth}</p>
                  </div>
                  <div className="shrink-0">
                    <input
                      type="month"
                      value={lateMonth}
                      onChange={(e) => {
                        setLateMonth(e.target.value);
                        setLateDate("");
                      }}
                      className="px-2 py-1 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                    />
                  </div>
                </div>
                <div className="h-52 sm:h-64">
                  {lateChartData.some(d => d.value > 0) || lateDate ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 10']} />
                        <Tooltip content={<LateTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No late records for {lateMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Absent Analysis Card */}
              <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 text-gray-900">
                  <div>
                    <h3 className="text-sm font-bold">Absent Days by Week</h3>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">Weekly breakdown for {absentMonth}</p>
                  </div>
                  <div className="shrink-0">
                    <input
                      type="month"
                      value={absentMonth}
                      onChange={(e) => {
                        setAbsentMonth(e.target.value);
                        setAbsentDate("");
                      }}
                      className="px-2 py-1 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                    />
                  </div>
                </div>
                <div className="h-52 sm:h-64">
                  {absentChartData.some(d => d.value > 0) || absentDate ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={absentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 1']} allowDecimals={false} />
                        <Tooltip content={<AbsentTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FiUserX className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No absent records for {absentMonth}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Attendance Registry - UPDATED with Break Time */}
            <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Recent Attendance Activity</h3>
                <button
                  onClick={() => navigate("/myattendance")}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto -mx-4">
                <table className="w-full min-w-[500px] text-left">
                  <thead className="bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">DATE</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">CHECK IN</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">CHECK OUT</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider">BREAK TIME</th>
                      <th className="px-4 py-2 text-[11px] font-bold text-white uppercase tracking-wider text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userAttendance.slice(0, 5).map((record, index) => {
                      const breakMinutes = record.totalBreakMinutes || calculateTotalBreakMinutes(record.breaks);
                      const breakReason = record.breaks && record.breaks.length > 0 ? record.breaks[0].reason : null;
                      return (
                        <tr key={index} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">
                            {new Date(record.checkInTime).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-500">
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-500">
                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-4 py-2.5">
                            {breakMinutes > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <FiCoffee className="w-3 h-3 text-orange-500" />
                                <span className="text-xs font-medium text-orange-600">
                                  {formatBreakMinutes(breakMinutes)}
                                </span>
                                {breakReason && (
                                  <span className="text-[9px] text-gray-400 hidden sm:inline">
                                    ({breakReason})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              record.status === 'present' || record.status === 'checked-in' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {record.status === 'checked-in' ? 'In' : (record.status === 'present' ? 'Present' : record.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {userAttendance.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs text-slate-500 italic">
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
  <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    {isStatus ? (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
      </div>
    ) : (
      <span className="text-[11px] font-semibold text-gray-700">{value}</span>
    )}
  </div>
);

// SleekAction Component
const SleekAction = ({ icon, title, desc, color, onClick }) => {
  const themes = {
    blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-md",
    slate: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
  };

  const iconColors = {
    blue: "text-white",
    slate: "text-blue-600"
  };

  return (
    <div
      onClick={onClick}
      className={`p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all duration-200 flex items-center gap-2 sm:gap-2.5 ${themes[color]}`}
    >
      <div className={`text-xs sm:text-sm p-1 sm:p-1.5 rounded-lg ${color === 'blue' ? 'bg-white/10' : 'bg-gray-50'} ${iconColors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-[10px] sm:text-[11px] font-bold tracking-tight leading-none mb-0.5 truncate">{title}</h4>
        <p className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider truncate ${color === 'blue' ? 'opacity-80' : 'text-gray-400'}`}>
          {desc}
        </p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;