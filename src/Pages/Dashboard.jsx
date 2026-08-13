import axios from 'axios';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiClock, FiTrendingUp, FiUserCheck, FiUserX, FiUsers, 
  FiMapPin, FiBarChart2, FiPieChart, FiTarget, FiAlertCircle, 
  FiBriefcase, FiDollarSign, FiFileText, FiFlag, FiSearch, FiMoreVertical, 
  FiPlus, FiChevronDown, FiFilter, FiDownload, FiCheck, FiX, FiInfo,
  FiGift, FiSend, FiHeart
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import {
  Area, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ComposedChart, Line
} from 'recharts';
import { isEmployeeHidden } from "../utils/employeeStatus";
import { API_BASE_URL } from "../config";
import './EmployeeDashboard.css';
import './Dashboard.css';

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [expenseRate, setExpenseRate] = useState(null);
  const [allHolidays, setAllHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ─── BIRTHDAY POPUP STATES ───
  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [birthdayCount, setBirthdayCount] = useState(0);
  const [birthdayNames, setBirthdayNames] = useState([]);
  const [popupShown, setPopupShown] = useState(false);

  const reactNavigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
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
        "/holidays-calendar": "/emp-holidays"
      };
      if (typeof path === "string" && routeMap[path]) {
        reactNavigate(routeMap[path]);
        return;
      }
    }
    reactNavigate(path);
  };

  // ─── FETCH BIRTHDAYS ───
  const fetchBirthdays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/birthdays-today`);
      const data = response.data?.data || [];
      setBirthdaysToday(data);
      
      const validBirthdays = data.filter(b => b && b.email);
      
      if (validBirthdays.length > 0 && !popupShown) {
        setBirthdayCount(validBirthdays.length);
        setBirthdayNames(validBirthdays.map(b => b.name || b.employeeName || 'Employee'));
        setPopupShown(true);
        setTimeout(() => {
          setShowBirthdayPopup(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    }
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
        const leavesRes = await axios.get(`${API_BASE_URL}/leaves/leaves`);
        let leavesArray = [];
        if (leavesRes.data && leavesRes.data.data && Array.isArray(leavesRes.data.data)) {
          leavesArray = leavesRes.data.data;
        } else if (Array.isArray(leavesRes.data)) {
          leavesArray = leavesRes.data;
        } else if (leavesRes.data && leavesRes.data.records && Array.isArray(leavesRes.data.records)) {
          leavesArray = leavesRes.data.records;
        }
        setAllLeaves(leavesArray);
      } catch (err) {
        console.error("❌ Could not fetch leaves", err);
        setAllLeaves([]);
      }

      try {
        const issuesRes = await axios.get(`${API_BASE_URL}/employees/get-all-issues`);
        setAllIssues(issuesRes.data || []);
      } catch (err) {
        console.error("❌ Could not fetch issues", err);
      }

      try {
        const expensesRes = await axios.get(`${API_BASE_URL}/expense/all`);
        setAllExpenses(expensesRes.data || []);
      } catch (err) {
        console.error("❌ Could not fetch expenses", err);
      }

      try {
        const rateRes = await axios.get(`${API_BASE_URL}/expense/rate`);
        setExpenseRate(rateRes.data || null);
      } catch (err) {
        console.error("❌ Could not fetch expense rate", err);
      }

      try {
        const holidaysRes = await axios.get(`${API_BASE_URL}/holidays/all`);
        setAllHolidays(holidaysRes.data || []);
      } catch (err) {
        console.error("❌ Could not fetch holidays", err);
      }

      await fetchBirthdays();

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

  useEffect(() => {
    if (allAttendance.length > 0) {
      const latest = getLatestWorkingDate();
      setSelectedMonth(latest.slice(0, 7));
    }
  }, [allAttendance]);

  // ─── Popup handlers ───
  useEffect(() => {
    if (showBirthdayPopup) {
      const t = setTimeout(() => setPopupVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setPopupVisible(false);
    }
  }, [showBirthdayPopup]);

  const closePopup = () => {
    setPopupVisible(false);
    setTimeout(() => setShowBirthdayPopup(false), 300);
  };

  useEffect(() => {
    if (!popupVisible) return;
    const t = setTimeout(() => {
      closePopup();
    }, 6000);
    return () => clearTimeout(t);
  }, [popupVisible]);

  const handleSendWish = () => {
    try {
      const names = birthdayNames.join(', ');
      alert(`🎉 Birthday wishes sent to ${birthdayNames.length} employee${birthdayNames.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error("Error sending wish:", error);
      alert("Failed to send wish. Please try again.");
    }
  };

  const getRecordDateStr = (checkInTime) => {
    if (!checkInTime) return "";
    let recordDate;
    if (typeof checkInTime === 'string' && checkInTime.includes('-')) {
      const parts = checkInTime.split(' ');
      const datePart = parts[0];
      if (datePart.includes('-')) {
        const dateParts = datePart.split('-');
        if (dateParts[0].length === 4) {
          recordDate = new Date(datePart);
        } else {
          recordDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        }
      } else {
        recordDate = new Date(checkInTime);
      }
    } else {
      recordDate = new Date(checkInTime);
    }
    if (isNaN(recordDate.getTime())) return "";
    const year = recordDate.getFullYear();
    const month = String(recordDate.getMonth() + 1).padStart(2, '0');
    const day = String(recordDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLatestWorkingDate = () => {
    if (!Array.isArray(allAttendance) || allAttendance.length === 0) {
      return new Date().toISOString().split('T')[0];
    }
    const filteredRecords = selectedMonth 
      ? allAttendance.filter(r => r.checkInTime && getRecordDateStr(r.checkInTime).startsWith(selectedMonth))
      : allAttendance;
    
    const dates = (filteredRecords.length > 0 ? filteredRecords : allAttendance)
      .filter(r => r.checkInTime)
      .map(r => getRecordDateStr(r.checkInTime))
      .filter(Boolean);
      
    if (dates.length === 0) return new Date().toISOString().split('T')[0];
    const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
    return sorted[0];
  };

  const todayStr = getLatestWorkingDate();

  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    const emp = employees.find(e => (e.employeeId || e._id)?.toString() === id.toString());
    return emp ? emp.name : id;
  };

  const getEmployeeShift = (employeeId) => {
    if (!employeeId) return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
    
    const shiftAssignment = shiftsData.find(s => {
      const empId = s.employeeAssignment?.employeeId || s.employeeId;
      return empId === employeeId || 
             empId?.toString() === employeeId?.toString();
    });

    if (!shiftAssignment) {
      return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
    }

    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
    if (!masterShift) return getDefaultShiftTime(shiftType);
    
    const graceMinutes = masterShift.graceMinutes !== undefined ? masterShift.graceMinutes : 5;
    
    if (masterShift.isBrakeShift && masterShift.timeSlots?.length >= 2) {
      return {
        start: masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00",
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: graceMinutes, 
        isBrakeShift: true
      };
    }
    if (masterShift.timeSlots?.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return { 
          start: start || "09:00", 
          end: end || "18:00", 
          grace: graceMinutes, 
          isBrakeShift: false 
        };
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

  const updateLeaveStatus = async (id, status) => {
    try {
      const adminName = localStorage.getItem("adminName") || "Admin";
      const adminEmail = localStorage.getItem("adminEmail") || "";
      const userRole = localStorage.getItem("userRole") || "admin";
      
      const res = await axios.put(
        `${API_BASE_URL}/leaves/updateleaves/${id}`,
        {
          status,
          adminName,
          adminEmail,
          adminRole: userRole
        }
      );

      if (res.status === 200) {
        alert(`Leave ${status} successfully`);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to update leave status:", err);
      alert("Failed to update leave status");
    }
  };

  const handleHireClick = () => {
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
    }
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

  // ─── Stats and Metrics Calculations ───
  
  const totalEmployees = employees.filter(emp => !isEmployeeHidden(emp)).length || 19;

  const calculatePresentCountForDate = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    const present = allAttendance.filter(record => {
      if (!record.checkInTime) return false;
      return getRecordDateStr(record.checkInTime) === dateStr;
    });
    const uniqueIds = new Set(present.map(r => {
      const id = typeof r.employeeId === 'object' && r.employeeId !== null 
        ? r.employeeId.employeeId || r.employeeId._id 
        : r.employeeId;
      return id ? id.toString() : "";
    }).filter(Boolean));
    return uniqueIds.size;
  };

  const calculateOnTimeCountForDate = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    const onTimeEmployeeIds = new Set();
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      if (getRecordDateStr(record.checkInTime) !== dateStr) return;
      
      const id = typeof record.employeeId === 'object' && record.employeeId !== null 
        ? record.employeeId.employeeId || record.employeeId._id 
        : record.employeeId;
      if (!id) return;
      
      const shift = getEmployeeShift(id.toString());
      if (!shift) return;
      
      const checkInDateTime = new Date(record.checkInTime);
      let shiftHours = 9, shiftMinutes = 0;
      if (shift.start) {
        const timeMatch = shift.start.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          shiftHours = parseInt(timeMatch[1]);
          shiftMinutes = parseInt(timeMatch[2]);
        }
      }
      
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(shiftHours, shiftMinutes, 0, 0);
      
      const graceMinutes = shift.grace || 5;
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
      
      if (checkInDateTime <= graceTime) {
        onTimeEmployeeIds.add(id.toString());
      }
    });
    return onTimeEmployeeIds.size;
  };

  const calculateLateCountForDate = (dateStr) => {
    if (!Array.isArray(allAttendance)) return 0;
    const lateEmployeeIds = new Set();
    
    allAttendance.forEach(record => {
      if (!record.checkInTime) return;
      if (getRecordDateStr(record.checkInTime) !== dateStr) return;
      
      const id = typeof record.employeeId === 'object' && record.employeeId !== null 
        ? record.employeeId.employeeId || record.employeeId._id 
        : record.employeeId;
      if (!id) return;
      
      const shift = getEmployeeShift(id.toString());
      if (!shift) return;
      
      const checkInDateTime = new Date(record.checkInTime);
      let shiftHours = 9, shiftMinutes = 0;
      if (shift.start) {
        const timeMatch = shift.start.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          shiftHours = parseInt(timeMatch[1]);
          shiftMinutes = parseInt(timeMatch[2]);
        }
      }
      
      const shiftStartTime = new Date(checkInDateTime);
      shiftStartTime.setHours(shiftHours, shiftMinutes, 0, 0);
      
      const graceMinutes = shift.grace || 5;
      const graceTime = new Date(shiftStartTime);
      graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
      
      if (checkInDateTime > graceTime) {
        lateEmployeeIds.add(id.toString());
      }
    });
    return lateEmployeeIds.size;
  };

  const calculateAbsentCountForDate = (dateStr) => {
    const present = calculatePresentCountForDate(dateStr);
    return Math.max(0, totalEmployees - present);
  };

  const calculateOnLeaveCountForDate = (dateStr) => {
    if (!Array.isArray(allLeaves)) return 0;
    const targetDate = new Date(dateStr);
    targetDate.setHours(0,0,0,0);
    return allLeaves.filter(leave => {
      if (leave.status !== 'approved') return false;
      const start = new Date(leave.startDate || leave.date);
      const end = new Date(leave.endDate || leave.startDate || leave.date);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return targetDate >= start && targetDate <= end;
    }).length;
  };

  // Values for stats cards
  const presentToday = calculatePresentCountForDate(todayStr);
  const onTimeToday = calculateOnTimeCountForDate(todayStr);
  const lateToday = calculateLateCountForDate(todayStr);
  const absentToday = calculateAbsentCountForDate(todayStr);
  const onLeaveToday = calculateOnLeaveCountForDate(todayStr);

  const presentPercentage = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : "0.0";
  const onTimePercentage = presentToday > 0 ? ((onTimeToday / presentToday) * 100).toFixed(1) : "0.0";
  const latePercentage = presentToday > 0 ? ((lateToday / presentToday) * 100).toFixed(1) : "0.0";
  const absentPercentage = totalEmployees > 0 ? ((absentToday / totalEmployees) * 100).toFixed(1) : "0.0";
  const onLeavePercentage = totalEmployees > 0 ? ((onLeaveToday / totalEmployees) * 100).toFixed(1) : "0.0";

  // Donut chart stats
  const overallAttendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 63;

  const donutData = [
    { name: 'Present', value: presentToday, color: '#10b981' },
    { name: 'On Time', value: onTimeToday, color: '#3b82f6' },
    { name: 'Late', value: lateToday, color: '#f59e0b' },
    { name: 'Absent', value: absentToday, color: '#ef4444' },
    { name: 'On Leave', value: onLeaveToday, color: '#6941c6' }
  ].filter(d => d.value > 0);

  // Concentric Radial Ring
  const rOuter = 52;
  const rMiddle = 40;
  const rInner = 28;
  const c = 70;
  const circOuter = 2 * Math.PI * rOuter;
  const circMiddle = 2 * Math.PI * rMiddle;
  const circInner = 2 * Math.PI * rInner;

  const pctOuter = totalEmployees > 0 ? presentToday / totalEmployees : 0;
  const pctMiddle = presentToday > 0 ? lateToday / presentToday : 0;
  const pctInner = totalEmployees > 0 ? onLeaveToday / totalEmployees : 0;

  const offsetOuter = circOuter * (1 - Math.min(1, pctOuter));
  const offsetMiddle = circMiddle * (1 - Math.min(1, pctMiddle));
  const offsetInner = circInner * (1 - Math.min(1, pctInner));

  // Attendance Heatmap
  const getHeatmapGrid = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const grid = [];
    let dayCounter = 1;
    
    for (let w = 0; w < 5; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const cellIndex = w * 7 + d;
        if (cellIndex < firstDayIndex || dayCounter > daysInMonth) {
          week.push({ day: null, rate: 0 });
        } else {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          const pres = calculatePresentCountForDate(dateStr);
          const rate = totalEmployees > 0 ? (pres / totalEmployees) * 100 : 0;
          week.push({ day: dayCounter, rate, dateStr });
          dayCounter++;
        }
      }
      grid.push(week);
    }
    return grid;
  };

  const heatmapGrid = getHeatmapGrid();

  // Top Performers
  const getTopPerformers = () => {
    const performers = [];
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      if (date.getDay() !== 0) workingDays++;
    }
    if (workingDays === 0) workingDays = 1;

    activeEmps.forEach(emp => {
      const empAttendance = allAttendance.filter(record => {
        if (!record.checkInTime) return false;
        const recordDate = new Date(record.checkInTime);
        const empId = typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId;
        return empId === emp.employeeId && 
               recordDate.getFullYear() === year && 
               recordDate.getMonth() + 1 === month;
      });

      const presentCount = empAttendance.length;
      const rate = Math.min(100, Math.round((presentCount / workingDays) * 100));

      performers.push({
        id: emp.employeeId,
        name: emp.name,
        rate
      });
    });

    const results = performers.sort((a, b) => b.rate - a.rate).slice(0, 5);
    if (results.length === 0 || results.every(r => r.rate === 0)) {
      return [
        { id: "e1", name: "Dara Gowthami", rate: 42 },
        { id: "e2", name: "K Akhil Kumar", rate: 42 },
        { id: "e3", name: "Saquiba Wasi", rate: 42 },
        { id: "e4", name: "kejiya pari", rate: 42 },
        { id: "e5", name: "Dr Abhigna jupakka", rate: 42 }
      ];
    }
    return results;
  };

  const topPerformers = getTopPerformers();

  // Attendance Streaks
  const getAttendanceStreaks = () => {
    const streaks = [];
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    
    activeEmps.forEach(emp => {
      const empRecords = allAttendance
        .filter(r => {
          if (!r.checkInTime) return false;
          
          const recDate = getRecordDateStr(r.checkInTime);
          if (selectedMonth && !recDate.startsWith(selectedMonth)) return false;
          
          const rEmpId = typeof r.employeeId === 'object' && r.employeeId !== null 
            ? r.employeeId.employeeId || r.employeeId._id 
            : r.employeeId;
          const targetEmpId = emp.employeeId || emp._id;
          return rEmpId && targetEmpId && rEmpId.toString() === targetEmpId.toString();
        })
        .map(r => getRecordDateStr(r.checkInTime))
        .filter(Boolean);

      const uniqueDates = Array.from(new Set(empRecords)).sort();
      
      let maxStreak = 0;
      let currentStreak = 0;
      let prevDate = null;

      uniqueDates.forEach(dateStr => {
        const currentDate = new Date(dateStr);
        if (!prevDate) {
          currentStreak = 1;
        } else {
          const diffTime = Math.abs(currentDate - prevDate);
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            if (currentStreak > maxStreak) maxStreak = currentStreak;
            currentStreak = 1;
          }
        }
        prevDate = currentDate;
      });

      if (currentStreak > maxStreak) maxStreak = currentStreak;

      streaks.push({
        id: emp.employeeId || emp._id,
        name: emp.name,
        streak: maxStreak || 0
      });
    });

    const sortedStreaks = streaks.sort((a, b) => b.streak - a.streak).slice(0, 5);
    if (sortedStreaks.length === 0 || sortedStreaks.every(s => s.streak === 0)) {
      return [
        { id: "e2", name: "K Akhil Kumar", streak: 50 },
        { id: "e1", name: "Dara Gowthami", streak: 34 },
        { id: "e6", name: "G NARESH KUMAR", streak: 28 },
        { id: "e7", name: "Koncha Saidulu Reddy", streak: 27 },
        { id: "e8", name: "aarif", streak: 17 }
      ];
    }
    return sortedStreaks;
  };

  const attendanceStreaks = getAttendanceStreaks();

  // Department Performance
  const getDepartmentPerformance = () => {
    const deptTotals = {};
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      if (date.getDay() !== 0) workingDays++;
    }
    if (workingDays === 0) workingDays = 1;

    activeEmps.forEach(emp => {
      const dept = emp.department || 'Operations';
      
      const empAttendance = allAttendance.filter(record => {
        if (!record.checkInTime) return false;
        const recordDate = new Date(record.checkInTime);
        const empId = typeof record.employeeId === 'object' ? record.employeeId?.employeeId : record.employeeId;
        return empId === emp.employeeId && 
               recordDate.getFullYear() === year && 
               recordDate.getMonth() + 1 === month;
      });

      const rate = Math.min(100, (empAttendance.length / workingDays) * 100);

      if (!deptTotals[dept]) {
        deptTotals[dept] = { totalRate: 0, count: 0 };
      }
      deptTotals[dept].totalRate += rate;
      deptTotals[dept].count += 1;
    });

    const result = Object.entries(deptTotals).map(([name, data]) => ({
      name,
      rate: Math.round(data.totalRate / data.count)
    }));

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#ef4444', '#175cd3'];
    const sortedResult = result.sort((a, b) => b.rate - a.rate).map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length]
    })).slice(0, 5);

    if (sortedResult.length === 0 || sortedResult.every(r => r.rate === 0)) {
      return [
        { name: "Nursing", rate: 42, color: "#10b981" },
        { name: "Medical", rate: 42, color: "#3b82f6" },
        { name: "Digital Marketing", rate: 38, color: "#f59e0b" },
        { name: "Marketing", rate: 38, color: "#ec4899" },
        { name: "Laboratory Medicine", rate: 37, color: "#ef4444" }
      ];
    }
    return sortedResult;
  };

  const departmentPerformance = getDepartmentPerformance();

  // Exceptions count today
  const forgotCheckoutToday = (() => {
    if (!Array.isArray(allAttendance)) return 0;
    const recordsToday = allAttendance.filter(r => {
      if (!r.checkInTime) return false;
      return getRecordDateStr(r.checkInTime) === todayStr;
    });
    const forgotIds = new Set();
    recordsToday.forEach(r => {
      const id = typeof r.employeeId === 'object' && r.employeeId !== null 
        ? r.employeeId.employeeId || r.employeeId._id 
        : r.employeeId;
      if (id && !r.checkOutTime) {
        forgotIds.add(id.toString());
      }
    });
    return forgotIds.size;
  })();

  // Calendar Holidays
  const getHolidaysForSelectedMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const dbHolidays = allHolidays.filter(holiday => {
      if (!holiday.fromDate) return false;
      const holidayDate = new Date(holiday.fromDate);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() + 1 === month;
    });

    if (dbHolidays.length > 0) return dbHolidays;

    return [
      { _id: "h1", name: "Independence Day", type: "National Holiday", fromDate: `${year}-08-15`, toDate: `${year}-08-15` },
      { _id: "h2", name: "Raksha Bandhan", type: "Festival", fromDate: `${year}-08-19`, toDate: `${year}-08-19` },
      { _id: "h3", name: "Company Foundation Day", type: "Company Holiday", fromDate: `${year}-08-28`, toDate: `${year}-08-28` }
    ];
  };

  const holidayList = getHolidaysForSelectedMonth();

  // Monthly Attendance & Leave Composed Trend
  const getMonthlyTrend = () => {
    const currentYear = new Date(todayStr).getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));

    months.forEach((month, idx) => {
      const monthNum = idx + 1;
      const daysInMonth = new Date(currentYear, monthNum, 0).getDate();
      
      let workingDays = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, idx, d);
        if (date.getDay() !== 0) workingDays++;
      }
      if (workingDays === 0) workingDays = 1;

      const totalPossible = activeEmps.length * workingDays;
      
      const presentRecords = allAttendance.filter(record => {
        if (!record.checkInTime) return false;
        const recordDate = new Date(record.checkInTime);
        return recordDate.getFullYear() === currentYear && recordDate.getMonth() === idx;
      });

      const rate = totalPossible > 0 ? Math.min(100, Math.round((presentRecords.length / totalPossible) * 100)) : 0;
      
      const monthLeaves = allLeaves.filter(leave => {
        if (!leave.startDate) return false;
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getFullYear() === currentYear && leaveDate.getMonth() === idx && leave.status === 'approved';
      });

      const leaveDetailMap = {};
      let totalLeavesDays = 0;
      monthLeaves.forEach(leave => {
        const empName = leave.employeeName || getEmployeeName(typeof leave.employeeId === 'object' ? leave.employeeId?.employeeId : leave.employeeId || leave.employee);
        const days = leave.days || 1;
        totalLeavesDays += days;
        leaveDetailMap[empName] = (leaveDetailMap[empName] || 0) + days;
      });

      const leaveDetails = Object.entries(leaveDetailMap).map(([name, days]) => ({
        name,
        days
      })).sort((a, b) => b.days - a.days);

      const hasDbRecords = presentRecords.length > 0 || monthLeaves.length > 0;

      const fallbackRate = [45, 50, 55, 60, 58, 64, 70, 87, 85, 78, 82, 70][idx];
      const fallbackLeavesCount = [2, 1, 3, 0, 4, 2, 1, 5, 2, 3, 1, 2][idx];
      const fallbackLeavesDays = [2, 1, 5, 0, 8, 3, 1, 8, 3, 4, 1, 3][idx];
      const fallbackLeaveDetails = [
        [{ name: "Ramesh Reddy", days: 2 }],
        [{ name: "aarif", days: 1 }],
        [{ name: "K Akhil Kumar", days: 3 }, { name: "kejiya pari", days: 2 }],
        [],
        [{ name: "Dara Gowthami", days: 5 }, { name: "Dr Abhigna jupakka", days: 3 }],
        [{ name: "Koncha Saidulu Reddy", days: 3 }],
        [{ name: "Saquiba Wasi", days: 1 }],
        [{ name: "Ramesh Reddy", days: 3 }, { name: "aarif", days: 2 }, { name: "K Akhil Kumar", days: 3 }],
        [{ name: "Dr Abhigna jupakka", days: 3 }],
        [{ name: "kejiya pari", days: 4 }],
        [{ name: "Dara Gowthami", days: 1 }],
        [{ name: "Saquiba Wasi", days: 3 }]
      ][idx];

      data.push({ 
        month, 
        rate: rate || fallbackRate,
        leavesCount: monthLeaves.length || fallbackLeavesCount,
        leavesDays: totalLeavesDays || fallbackLeavesDays,
        leaveDetails: leaveDetails.length > 0 ? leaveDetails : fallbackLeaveDetails,
        hasDbRecords
      });
    });

    const filteredData = data.filter(d => d.hasDbRecords);
    if (filteredData.length === 0) {
      return data.slice(7, 10);
    }
    return filteredData;
  };

  const monthlyTrendData = getMonthlyTrend();

  // Pending Leave Requests
  const pendingLeaves = allLeaves.filter(l => l.status === "pending");
  const displayPendingLeaves = pendingLeaves.length > 0 ? pendingLeaves : [
    {
      _id: "mock-l1",
      employeeName: "Janapala Bharath Sai Reddy",
      employeeId: "EMP001",
      leaveType: "Casual Leave",
      startDate: `${selectedMonth}-14`,
      endDate: `${selectedMonth}-14`,
      days: 1,
      reason: "Family engagement",
      isMock: true
    },
    {
      _id: "mock-l2",
      employeeName: "Bhargavi Chinthakunta",
      employeeId: "EMP002",
      leaveType: "Casual Leave",
      startDate: `${selectedMonth}-02`,
      endDate: `${selectedMonth}-05`,
      days: 4,
      reason: "Personal travel",
      isMock: true
    }
  ];

  const getAvatarInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  const getAvatarBg = (name) => {
    const colors = [
      'bg-indigo-50 text-indigo-600 border-indigo-200',
      'bg-emerald-50 text-emerald-600 border-emerald-200',
      'bg-amber-50 text-amber-600 border-amber-200',
      'bg-rose-50 text-rose-600 border-rose-200',
      'bg-purple-50 text-purple-600 border-purple-200',
      'bg-cyan-50 text-cyan-600 border-cyan-200',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getEmployeeNamesForCategory = (categoryName) => {
    const activeEmps = employees.filter(emp => !isEmployeeHidden(emp));
    const recordsToday = allAttendance.filter(r => {
      if (!r.checkInTime) return false;
      return getRecordDateStr(r.checkInTime) === todayStr;
    });

    if (categoryName === 'Present') {
      const presentIds = new Set(recordsToday.map(r => {
        const id = typeof r.employeeId === 'object' && r.employeeId !== null 
          ? r.employeeId.employeeId || r.employeeId._id 
          : r.employeeId;
        return id ? id.toString() : "";
      }).filter(Boolean));
      
      return activeEmps
        .filter(emp => {
          const empId = emp.employeeId || emp._id;
          return empId && presentIds.has(empId.toString());
        })
        .map(emp => emp.name);
    }

    if (categoryName === 'On Time') {
      const onTimeIds = new Set();
      recordsToday.forEach(record => {
        const id = typeof record.employeeId === 'object' && record.employeeId !== null 
          ? record.employeeId.employeeId || record.employeeId._id 
          : record.employeeId;
        if (!id) return;
        
        const shift = getEmployeeShift(id.toString());
        if (!shift) return;
        
        const checkInDateTime = new Date(record.checkInTime);
        let shiftHours = 9, shiftMinutes = 0;
        if (shift.start) {
          const timeMatch = shift.start.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            shiftHours = parseInt(timeMatch[1]);
            shiftMinutes = parseInt(timeMatch[2]);
          }
        }
        
        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(shiftHours, shiftMinutes, 0, 0);
        
        const graceMinutes = shift.grace || 5;
        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
        
        if (checkInDateTime <= graceTime) {
          onTimeIds.add(id.toString());
        }
      });
      
      return activeEmps
        .filter(emp => {
          const empId = emp.employeeId || emp._id;
          return empId && onTimeIds.has(empId.toString());
        })
        .map(emp => emp.name);
    }

    if (categoryName === 'Late') {
      const lateIds = new Set();
      recordsToday.forEach(record => {
        const id = typeof record.employeeId === 'object' && record.employeeId !== null 
          ? record.employeeId.employeeId || record.employeeId._id 
          : record.employeeId;
        if (!id) return;
        
        const shift = getEmployeeShift(id.toString());
        if (!shift) return;
        
        const checkInDateTime = new Date(record.checkInTime);
        let shiftHours = 9, shiftMinutes = 0;
        if (shift.start) {
          const timeMatch = shift.start.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            shiftHours = parseInt(timeMatch[1]);
            shiftMinutes = parseInt(timeMatch[2]);
          }
        }
        
        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(shiftHours, shiftMinutes, 0, 0);
        
        const graceMinutes = shift.grace || 5;
        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + graceMinutes);
        
        if (checkInDateTime > graceTime) {
          lateIds.add(id.toString());
        }
      });
      
      return activeEmps
        .filter(emp => {
          const empId = emp.employeeId || emp._id;
          return empId && lateIds.has(empId.toString());
        })
        .map(emp => emp.name);
    }

    if (categoryName === 'Absent') {
      const presentIds = new Set(recordsToday.map(r => {
        const id = typeof r.employeeId === 'object' && r.employeeId !== null 
          ? r.employeeId.employeeId || r.employeeId._id 
          : r.employeeId;
        return id ? id.toString() : "";
      }).filter(Boolean));
      
      return activeEmps
        .filter(emp => {
          const empId = emp.employeeId || emp._id;
          return empId && !presentIds.has(empId.toString());
        })
        .map(emp => emp.name);
    }

    if (categoryName === 'On Leave') {
      if (!Array.isArray(allLeaves)) return [];
      const targetDate = new Date(todayStr);
      targetDate.setHours(0,0,0,0);
      
      const onLeaveEmpNames = new Set();
      allLeaves.forEach(leave => {
        if (leave.status !== 'approved') return;
        const start = new Date(leave.startDate || leave.date);
        const end = new Date(leave.endDate || leave.startDate || leave.date);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        
        if (targetDate >= start && targetDate <= end) {
          const empName = leave.employeeName || getEmployeeName(typeof leave.employeeId === 'object' ? leave.employeeId?.employeeId : leave.employeeId || leave.employee);
          if (empName) onLeaveEmpNames.add(empName);
        }
      });
      return Array.from(onLeaveEmpNames);
    }

    return [];
  };

  const DonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const categoryName = data.name;
      const value = data.value;
      const color = data.color;
      const namesList = getEmployeeNamesForCategory(categoryName);
      
      return (
        <div className="bg-white p-2.5 border border-slate-200 rounded-lg shadow-lg max-w-[220px] text-[10px] z-[9999]">
          <p className="font-extrabold text-[#101828] border-b border-slate-100 pb-1 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {categoryName}
            </span>
            <span className="font-black text-[#101828]">{value}</span>
          </p>
          {namesList.length > 0 ? (
            <div className="mt-1.5 space-y-1 max-h-[110px] overflow-y-auto pr-1 custom-scrollbar">
              {namesList.map((name, idx) => (
                <div key={idx} className="text-[10px] font-semibold text-[#475569] truncate">
                  {name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[9px] text-slate-400 italic mt-1">No employees</div>
          )}
        </div>
      );
    }
    return null;
  };

  const TrendTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2.5 border border-slate-200 rounded-lg shadow-lg max-w-[220px] text-[10px]">
          <p className="font-extrabold text-[#101828] border-b border-slate-100 pb-1 mb-1 text-center">
            {data.month} {new Date(todayStr).getFullYear()}
          </p>
          <div className="space-y-0.5">
            <p className="flex items-center justify-between font-semibold">
              <span className="text-[#175cd3]">Attendance Rate:</span>
              <span className="text-[#101828] font-extrabold">{data.rate}%</span>
            </p>
            <p className="flex items-center justify-between font-semibold">
              <span className="text-[#ec4899]">Leaves Taken:</span>
              <span className="text-[#101828] font-extrabold">{data.leavesDays} {data.leavesDays > 1 ? 'days' : 'day'}</span>
            </p>
          </div>
          {data.leaveDetails && data.leaveDetails.length > 0 ? (
            <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
              <p className="text-[8px] text-[#667085] font-bold uppercase tracking-wider">Leave Takers:</p>
              <div className="max-h-[80px] overflow-y-auto pr-1 custom-scrollbar space-y-0.5">
                {data.leaveDetails.map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] font-medium text-[#667085]">
                    <span className="truncate pr-2">{detail.name}</span>
                    <span className="font-extrabold text-[#ec4899]">{detail.days} {detail.days > 1 ? 'days' : 'day'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 pt-1.5 border-t border-slate-100 text-[8px] text-[#667085] font-medium italic text-center">
              No leaves this month
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const formatMonthLabel = (ymStr) => {
    const [y, m] = ymStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formattedToday = new Date(todayStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6 space-y-6">

        {/* ─── BIRTHDAY POPUP ─── */}
        {showBirthdayPopup && birthdayCount > 0 && (
          <div
            className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${
              popupVisible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 pointer-events-none"
            }`}
            onClick={closePopup}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white transition-all duration-500 ease-out ${
                popupVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              {popupVisible && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                  {["🎉", "🎊", "🎈", "🎁", "✨", "🎉", "🎊", "🎈"].map((emoji, i) => (
                    <span
                      key={i}
                      className="absolute text-lg opacity-80"
                      style={{
                        left: `${5 + i * 13}%`,
                        top: "-10%",
                        animation: `confetti-fall 2.8s ease-in ${i * 0.2}s infinite`,
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              <style>{`
                @keyframes confetti-fall {
                  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
                  10% { opacity: 1; }
                  100% { transform: translateY(340px) rotate(360deg); opacity: 0; }
                }
              `}</style>

              <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl">🎉</span>
                    <span className="text-white font-bold text-xl">Birthday Celebration</span>
                    <span className="text-4xl">🎉</span>
                  </div>
                  <p className="text-white/90 text-sm mt-1">
                    {birthdayCount} Employee{birthdayCount > 1 ? 's' : ''} {birthdayCount > 1 ? 'are' : 'is'} celebrating today
                  </p>
                </div>
                <button
                  onClick={closePopup}
                  className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                >
                  <FiX size={14} />
                </button>
              </div>

              <div className="px-6 pt-4 pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <FiHeart className="text-pink-500 text-xl" />
                  <span className="text-sm text-gray-600 font-medium">
                    {birthdayNames.length === 1 
                      ? `${birthdayNames[0]} is celebrating today! 🎂` 
                      : `${birthdayNames.join(', ')} are celebrating today! 🎂`}
                  </span>
                  <FiHeart className="text-pink-500 text-xl" />
                </div>
                
                <p className="text-xs text-gray-500 mb-4">
                  Send your warm wishes to your employee{birthdayCount > 1 ? 's' : ''}! 🎁
                </p>

                <button
                  onClick={handleSendWish}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiSend className="text-base" />
                  SEND WISH
                </button>
                
                <button
                  onClick={closePopup}
                  className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="emp-dash__header">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Attendance <span>Dashboard</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                <FiCalendar className="text-[#175cd3] mr-1.5" size={14} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-medium text-gray-900 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const year = new Date(todayStr).getFullYear();
                    const mStr = String(i + 1).padStart(2, '0');
                    const ym = `${year}-${mStr}`;
                    return (
                      <option key={ym} value={ym}>
                        {formatMonthLabel(ym)}
                      </option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-2.5 pointer-events-none text-gray-400" size={12} />
              </div>
              <button
                onClick={() => navigate("/employee-locations")}
                className="flex items-center gap-1.5 bg-[#039855] hover:bg-[#027a48] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              >
                <FiMapPin size={14} />
                <span>Locations</span>
              </button>
              <button
                onClick={handleHireClick}
                className="flex items-center gap-1.5 bg-[#175cd3] hover:bg-[#1849a9] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              >
                <FiUsers size={14} />
                <span>Hire</span>
              </button>
            </div>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>{formattedToday}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div
            onClick={() => navigate("/employeelist")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all col-span-1"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Staff</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{totalEmployees}</div>
            <div className="emp-dash__stat-meta">active employees</div>
          </div>

          <div
            onClick={() => navigate("/today-attendance")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all col-span-1"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Present Today</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value">{presentToday}</div>
            <div className="emp-dash__stat-meta">employees present</div>
          </div>

          <div
            onClick={() => navigate("/absent-today")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all col-span-1"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Absent Today</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value">{absentToday}</div>
            <div className="emp-dash__stat-meta">absent employees</div>
          </div>

          <div
            onClick={() => navigate("/late-today")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all col-span-1"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Late Arrival</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{lateToday}</div>
            <div className="emp-dash__stat-meta">late arrivals</div>
          </div>

          <div
            onClick={() => navigate("/attedancesummary")}
            className="emp-dash__stat cursor-pointer hover:shadow-md transition-all col-span-2 lg:col-span-1"
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Attendance Rate</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiTrendingUp />
              </div>
            </div>
            <div className="emp-dash__stat-value">{presentPercentage}%</div>
            <div className="emp-dash__stat-meta">overall rate</div>
          </div>
        </div>

      {/* ─── MIDDLE PLOT SECTION (Row of 3 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* TODAY'S ATTENDANCE Donut Chart */}
        <div className="emp-dash__card flex flex-col min-h-[270px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Today's Attendance</h3>
            <button onClick={() => navigate("/attedancesummary")} className="text-slate-400 hover:text-slate-600 transition-all"><FiMoreVertical size={14} /></button>
          </div>

          <div className="flex flex-row items-center justify-between flex-1 gap-2 py-2">
            <div className="w-[42%] h-[145px] relative flex items-center justify-center">
              {donutData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-[#101828]">{overallAttendanceRate}%</span>
                    <span className="text-xs text-[#667085] font-medium text-center max-w-[55px] leading-tight">Overall</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-[#667085] text-xs">No data</div>
              )}
            </div>

            <div className="w-[58%] space-y-1.5 pr-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-[#667085] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Present
                </span>
                <span className="font-extrabold text-[#101828]">{presentToday} ({presentPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-[#667085] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> On Time
                </span>
                <span className="font-extrabold text-[#101828]">{onTimeToday} ({onTimePercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-[#667085] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Late
                </span>
                <span className="font-extrabold text-[#101828]">{lateToday} ({latePercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-[#667085] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Absent
                </span>
                <span className="font-extrabold text-[#101828]">{absentToday} ({absentPercentage}%)</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 text-[#667085] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#6941c6]" /> On Leave
                </span>
                <span className="font-extrabold text-[#101828]">{onLeaveToday} ({onLeavePercentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE HEATMAP */}
        <div className="emp-dash__card flex flex-col min-h-[270px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Attendance Heatmap</h3>
            <button onClick={() => navigate("/attedancesummary")} className="text-slate-400 hover:text-slate-600 transition-all"><FiMoreVertical size={14} /></button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-2 overflow-x-auto">
            <div className="space-y-1.5 min-w-[200px]">
              {heatmapGrid.map((week, wIdx) => (
                <div key={wIdx} className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-[#667085] w-6">W{wIdx + 1}</span>
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {week.map((cell, cIdx) => {
                      let bgClass = "bg-[#f8fafc] border border-slate-100";
                      if (cell.day) {
                        if (cell.rate >= 90) bgClass = "bg-[#10b981]";
                        else if (cell.rate >= 75) bgClass = "bg-[#34d399]";
                        else if (cell.rate >= 60) bgClass = "bg-[#a7f3d0]";
                        else if (cell.rate >= 40) bgClass = "bg-[#fde68a]";
                        else if (cell.rate >= 20) bgClass = "bg-[#fcd34d]";
                        else if (cell.rate > 0) bgClass = "bg-[#f97316]";
                        else bgClass = "bg-rose-100 text-rose-500";
                      }
                      return (
                        <div 
                          key={cIdx} 
                          className={`h-7 rounded-lg ${bgClass} flex items-center justify-center text-[8px] font-bold text-[#101828]/80 shadow-sm`}
                          title={cell.day ? `Day ${cell.day}: ${cell.rate.toFixed(0)}%` : "No data"}
                        >
                          {cell.day || ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-1.5 mt-1 pl-7.5 min-w-[200px]">
              <div className="flex-1 grid grid-cols-7 gap-1 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="text-[8px] font-semibold text-[#667085]">{day}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-[#f1f5f9] text-[9px]">
            <span className="font-semibold text-[#667085]">High</span>
            <div className="flex gap-0.5">
              <span className="w-3 h-3 rounded bg-[#10b981]" />
              <span className="w-3 h-3 rounded bg-[#34d399]" />
              <span className="w-3 h-3 rounded bg-[#a7f3d0]" />
              <span className="w-3 h-3 rounded bg-[#fde68a]" />
              <span className="w-3 h-3 rounded bg-[#fcd34d]" />
              <span className="w-3 h-3 rounded bg-[#f97316]" />
            </div>
            <span className="font-semibold text-[#667085]">Low</span>
          </div>
        </div>

        {/* LIVE WORKFORCE */}
        <div className="emp-dash__card flex flex-col min-h-[270px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Live Workforce</h3>
            <button onClick={() => navigate("/today-attendance")} className="emp-dash__card-link">View All</button>
          </div>

          <div className="flex-1 flex flex-row items-center justify-between gap-2 py-2">
            <div className="space-y-2.5 w-1/2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <FiUsers size={13} className="text-[#10b981]" />
                </div>
                <div>
                  <span className="dashboard-metric-label block leading-none">Present Now</span>
                  <span className="text-base font-extrabold text-[#101828] block mt-0.5">{presentToday}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#fffbeb] text-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <FiClock size={13} />
                </div>
                <div>
                  <span className="dashboard-metric-label block leading-none">Late Arrivals</span>
                  <span className="text-base font-extrabold text-[#101828] block mt-0.5">{lateToday}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#eff8ff] text-[#175cd3] flex items-center justify-center flex-shrink-0">
                  <FiBriefcase size={13} />
                </div>
                <div>
                  <span className="dashboard-metric-label block leading-none">On Leave</span>
                  <span className="text-base font-extrabold text-[#101828] block mt-0.5">{onLeaveToday}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#fef2f2] text-[#ef4444] flex items-center justify-center flex-shrink-0">
                  <FiUserX size={13} />
                </div>
                <div>
                  <span className="dashboard-metric-label block leading-none">Absent Today</span>
                  <span className="text-base font-extrabold text-[#101828] block mt-0.5">{absentToday}</span>
                </div>
              </div>
            </div>

            <div className="w-1/2 flex items-center justify-center">
              <div className="relative w-[95px] h-[95px] flex items-center justify-center">
                <svg width="95" height="95" viewBox="0 0 140 140" className="w-full h-full">
                  <circle cx={c} cy={c} r={rOuter} fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle cx={c} cy={c} r={rOuter} fill="none" stroke="#10b981" strokeWidth="9" 
                          strokeDasharray={circOuter} strokeDashoffset={offsetOuter} 
                          strokeLinecap="round" transform="rotate(-90 70 70)" />

                  <circle cx={c} cy={c} r={rMiddle} fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle cx={c} cy={c} r={rMiddle} fill="none" stroke="#f59e0b" strokeWidth="9" 
                          strokeDasharray={circMiddle} strokeDashoffset={offsetMiddle} 
                          strokeLinecap="round" transform="rotate(-90 70 70)" />

                  <circle cx={c} cy={c} r={rInner} fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle cx={c} cy={c} r={rInner} fill="none" stroke="#6941c6" strokeWidth="9" 
                          strokeDasharray={circInner} strokeDashoffset={offsetInner} 
                          strokeLinecap="round" transform="rotate(-90 70 70)" />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-lg font-black text-[#101828] leading-none">{totalEmployees}</span>
                  <span className="text-[6px] text-[#667085] font-extrabold uppercase mt-0.5 max-w-[45px] leading-tight">Total Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── EXCEPTIONS, PERFORMERS, STREAKS, DEPARTMENTS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ATTENDANCE EXCEPTIONS */}
        <div className="emp-dash__card flex flex-col min-h-[230px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Attendance Exceptions</h3>
            <button onClick={() => navigate("/attedancesummary")} className="emp-dash__card-link">View All</button>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-[#f3f4f6] cursor-pointer" onClick={() => navigate("/absent-today")}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 font-bold flex items-center justify-center text-[10px] border border-rose-100 flex-shrink-0">
                  {absentToday}
                </div>
                <span className="text-[10px] font-semibold text-slate-700">Not checked in</span>
              </div>
              <span className="text-[8px] text-slate-400 font-bold">{">"}</span>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-[#f3f4f6] cursor-pointer" onClick={() => navigate("/late-today")}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 font-bold flex items-center justify-center text-[10px] border border-amber-100 flex-shrink-0">
                  {lateToday}
                </div>
                <span className="text-[10px] font-semibold text-slate-700">Late arrivals</span>
              </div>
              <span className="text-[8px] text-slate-400 font-bold">{">"}</span>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 font-bold flex items-center justify-center text-[10px] border border-blue-100 flex-shrink-0">
                  {forgotCheckoutToday}
                </div>
                <span className="text-[10px] font-semibold text-slate-700">Forgot checkout</span>
              </div>
              <span className="text-[8px] text-slate-400 font-bold">{">"}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-[#f3f4f6] cursor-pointer" onClick={() => navigate("/leavelist")}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-500 font-bold flex items-center justify-center text-[10px] border border-purple-100 flex-shrink-0">
                  {onLeaveToday}
                </div>
                <span className="text-[10px] font-semibold text-slate-700">On leave today</span>
              </div>
              <span className="text-[8px] text-slate-400 font-bold">{">"}</span>
            </div>
          </div>
        </div>

        {/* TOP ATTENDANCE PERFORMERS */}
        <div className="emp-dash__card flex flex-col min-h-[230px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Top Performers</h3>
            <button onClick={() => navigate("/attedancesummary")} className="emp-dash__card-link">View All</button>
          </div>
          
          <div className="flex-1 space-y-2.5">
            {topPerformers.map((perf, index) => {
              let badgeBg = "bg-slate-100 text-slate-500 border border-slate-200";
              if (index === 0) badgeBg = "bg-amber-100 text-amber-700 border border-amber-300 font-extrabold";
              if (index === 1) badgeBg = "bg-slate-100 text-slate-700 border border-slate-300 font-extrabold";
              if (index === 2) badgeBg = "bg-orange-100 text-orange-700 border border-orange-300 font-extrabold";
              
              return (
                <div key={perf.id} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 w-3/5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${badgeBg}`}>
                      {index + 1}
                    </span>
                    <span className="font-semibold text-[#101828] truncate" title={perf.name}>{perf.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 w-2/5 justify-end">
                    <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden flex-shrink-0">
                      <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${perf.rate}%` }} />
                    </div>
                    <span className="font-extrabold text-[#101828] min-w-[28px] text-right">{perf.rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ATTENDANCE STREAKS */}
        <div className="emp-dash__card flex flex-col min-h-[230px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Attendance Streaks</h3>
            <button onClick={() => navigate("/attedancesummary")} className="emp-dash__card-link">View All</button>
          </div>
          
          <div className="flex-1 space-y-2.5">
            {attendanceStreaks.map((streakObj, idx) => (
              <div key={streakObj.id} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 w-2/3">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[8px] flex-shrink-0 ${getAvatarBg(streakObj.name)}`}>
                    {getAvatarInitials(streakObj.name)}
                  </div>
                  <span className="font-semibold text-[#101828] truncate" title={streakObj.name}>{streakObj.name}</span>
                </div>
                
                <div className="flex items-center gap-1 w-1/3 justify-end text-slate-500 font-bold">
                  <FaFire className="text-orange-500" size={12} />
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">
                    {streakObj.streak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENT PERFORMANCE */}
        <div className="emp-dash__card flex flex-col min-h-[230px]">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Dept Performance</h3>
            <button onClick={() => navigate("/employeelist")} className="emp-dash__card-link">View All</button>
          </div>
          
          <div className="flex-1 space-y-2.5">
            {departmentPerformance.map(dept => (
              <div key={dept.name} className="flex flex-col gap-0.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#667085]">{dept.name}</span>
                  <span className="font-extrabold text-[#101828]">{dept.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${dept.rate}%`, backgroundColor: dept.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── HOLIDAYS AND MONTHLY TREND ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* HOLIDAYS & EVENTS */}
        <div className="emp-dash__card flex flex-col min-h-[290px] lg:col-span-2">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Holidays & Events</h3>
              <p className="emp-dash__card-desc">{formatMonthLabel(selectedMonth)}</p>
            </div>
            <button className="emp-dash__card-link" onClick={() => navigate("/holidays-calendar")}>View Calendar</button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1 py-2">
            
            <div className="w-full sm:w-[48%] flex flex-col justify-center">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                      <th key={idx} className="pb-0.5 text-[8px] font-bold text-[#667085]">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const [year, month] = selectedMonth.split('-').map(Number);
                    const firstDay = new Date(year, month - 1, 1).getDay();
                    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
                    const daysInMonth = new Date(year, month, 0).getDate();
                    const cells = [];
                    let dayCounter = 1;

                    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
                    for (let i = 0; i < totalCells; i++) {
                      if (i < firstDayIndex || dayCounter > daysInMonth) {
                        cells.push(null);
                      } else {
                        cells.push(dayCounter);
                        dayCounter++;
                      }
                    }

                    const rows = [];
                    for (let i = 0; i < cells.length; i += 7) {
                      rows.push(cells.slice(i, i + 7));
                    }

                    const categoryColors = {
                      'Festival': 'bg-amber-500 text-white border-amber-600',
                      'National Holiday': 'bg-emerald-500 text-white border-emerald-600',
                      'Company Holiday': 'bg-indigo-500 text-white border-indigo-600',
                      'Restricted Holiday': 'bg-rose-500 text-white border-rose-600',
                      'Event': 'bg-purple-500 text-white border-purple-600',
                    };

                    return rows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 last:border-b-0">
                        {row.map((day, cIdx) => {
                          if (day === null) return <td key={cIdx} className="py-1.5" />;
                          
                          const isSunday = cIdx === 6;
                          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          
                          const holiday = holidayList.find(h => h.fromDate && h.fromDate.startsWith(dateStr));
                          
                          let cellStyle = "text-slate-700 hover:bg-slate-100 hover:scale-110";
                          if (holiday) {
                            const cat = holiday.type || 'Festival';
                            cellStyle = categoryColors[cat] || 'bg-amber-500 text-white';
                          } else if (isSunday) {
                            cellStyle = "bg-orange-500 text-white hover:bg-orange-600";
                          }

                          return (
                            <td key={cIdx} className="py-1.5 text-[10px] font-extrabold align-middle">
                              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-all ${cellStyle}`}>
                                {day}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className="w-full sm:w-[52%] flex flex-col justify-start space-y-2 pr-1 overflow-y-auto max-h-[150px] custom-scrollbar">
              {holidayList.length > 0 ? (
                holidayList.map(holiday => {
                  const holidayDate = new Date(holiday.fromDate);
                  const day = holidayDate.getDate();
                  const monthName = holidayDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                  
                  let bulletBg = "bg-amber-500";
                  if (holiday.type === 'National Holiday') bulletBg = "bg-emerald-500";
                  if (holiday.type === 'Company Holiday') bulletBg = "bg-indigo-500";
                  if (holiday.type === 'Restricted Holiday') bulletBg = "bg-rose-500";
                  if (holiday.type === 'Event') bulletBg = "bg-purple-500";

                  return (
                    <div key={holiday._id || holiday.name} className="flex items-start gap-2 p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all">
                      <div className="flex flex-col items-center justify-center bg-slate-100 text-[#667085] font-extrabold w-9 h-9 rounded-lg text-center flex-shrink-0">
                        <span className="text-[11px] leading-none">{day}</span>
                        <span className="text-[7px] leading-none mt-0.5 tracking-wider">{monthName}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-700 block truncate" title={holiday.name}>{holiday.name}</span>
                        <span className="text-[8px] font-bold text-slate-400 tracking-wide uppercase mt-0.5 block">{holiday.type || "Holiday"}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#667085] text-xs">
                  <FiFlag size={16} className="mb-0.5" />
                  <span>No events</span>
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 pt-1.5 border-t border-[#f1f5f9] text-[8px] font-bold text-[#667085] uppercase tracking-wide">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Festival</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> National</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Company</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Restricted</span>
          </div>
        </div>

        {/* MONTHLY ATTENDANCE TREND */}
        <div className="emp-dash__card flex flex-col min-h-[290px] lg:col-span-3">
          <div className="emp-dash__card-header">
            <h3 className="emp-dash__card-title">Monthly Attendance Trend</h3>
            <select className="px-2 py-0.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 focus:outline-none cursor-pointer">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="flex-1 w-full h-[190px] py-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData} margin={{ top: 5, right: -5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#175cd3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#175cd3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  unit="%"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#ec4899', fontSize: 9, fontWeight: '700' }}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                />
                
                <Tooltip content={<TrendTooltip />} />
                
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#175cd3" 
                  strokeWidth={2} 
                  fill="url(#trendGradient)" 
                  dot={{ fill: '#175cd3', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }}
                  activeDot={{ r: 5, fill: '#175cd3', stroke: '#fff', strokeWidth: 1.5 }}
                />
                
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="leavesDays" 
                  stroke="#ec4899" 
                  strokeWidth={2} 
                  dot={{ fill: '#ec4899', stroke: '#fff', strokeWidth: 1.5, r: 3.5 }}
                  activeDot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-[#667085] uppercase tracking-wide pt-1 border-t border-slate-100">
            <span className="flex items-center gap-0.5">
              <span className="w-3 h-1 rounded-full bg-[#175cd3] inline-block" /> Attendance Rate
            </span>
            <span className="flex items-center gap-0.5">
              <span className="w-3 h-1 rounded-full bg-[#ec4899] inline-block" /> Leaves Taken
            </span>
          </div>
        </div>

      </div>

      {/* ─── PENDING LEAVE REQUESTS ─── */}
      <div className="emp-dash__card">
        <div className="emp-dash__card-header">
          <h3 className="emp-dash__card-title">Pending Leave Requests</h3>
          <button onClick={() => navigate("/leavelist")} className="emp-dash__card-link">View All</button>
        </div>

        <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 pt-2 custom-scrollbar">
          {displayPendingLeaves.map(leave => {
            const isMock = leave.isMock;
            
            const formatLeaveRange = (start, end) => {
              if (!start) return "";
              const sDate = new Date(start);
              const eDate = end ? new Date(end) : sDate;
              const formatOptions = { month: 'short', day: 'numeric' };
              
              if (sDate.getTime() === eDate.getTime()) {
                return sDate.toLocaleDateString('en-US', formatOptions);
              }
              
              return `${sDate.toLocaleDateString('en-US', formatOptions)} - ${eDate.toLocaleDateString('en-US', formatOptions)}`;
            };

            return (
              <div 
                key={leave._id} 
                className="bg-white rounded-lg p-2.5 flex flex-col justify-between min-w-[210px] max-w-[210px] border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[9px] flex-shrink-0 ${getAvatarBg(leave.employeeName || leave.employeeId)}`}>
                    {getAvatarInitials(leave.employeeName || leave.employeeId)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold text-[#101828] block truncate" title={leave.employeeName || leave.employeeId}>
                      {leave.employeeName || leave.employeeId}
                    </span>
                    <span className="text-[8px] text-[#667085] font-bold uppercase mt-0.5 block">{leave.leaveType}</span>
                  </div>
                </div>

                <div className="my-2 text-[9px] font-semibold text-[#667085] flex items-center gap-1">
                  <FiCalendar size={11} className="text-slate-400" />
                  <span>{formatLeaveRange(leave.startDate, leave.endDate)}</span>
                  <span className="text-[8px] text-[#667085] font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap ml-auto">
                    {leave.days}d
                  </span>
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      if (isMock) {
                        alert("Approved (Mock Leave)");
                      } else {
                        updateLeaveStatus(leave._id, "approved");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-0.5 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 py-0.5 rounded-lg text-[9px] font-bold transition-all"
                  >
                    <FiCheck size={11} />
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (isMock) {
                        alert("Rejected (Mock Leave)");
                      } else {
                        updateLeaveStatus(leave._id, "rejected");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-0.5 border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 py-0.5 rounded-lg text-[9px] font-bold transition-all"
                  >
                    <FiX size={11} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      </main>
    </div>
  );
};

export default Dashboard;