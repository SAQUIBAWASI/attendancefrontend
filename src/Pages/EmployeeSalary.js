import axios from "axios";
import { Download, Eye, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { FiDollarSign, FiDownloadCloud, FiFileText, FiPieChart } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timely-Health-Logo.png";
import timelyHealthLogo from "../Images/Timelyhealth logo.png";
import companyStamp from "../Images/company-stamp-1780465131172.png";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import "./AttendanceSummary.css";

// ============================================
// 📅 HELPERS
// ============================================
const formatDateLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getCarryForwardKey = (employeeId, month) =>
  `payroll_carryForward_${employeeId}_${month}`;

const getPreviousMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getDaysInMonth = (monthStr) => {
  if (!monthStr) return new Date().getDate();
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

const holidayAppliesToDepartment = (holiday, employeeDepartment) => {
  if (!holiday) return false;
  let depts = [];
  if (Array.isArray(holiday.departments) && holiday.departments.length > 0) {
    depts = holiday.departments.filter(d => d && typeof d === 'string');
  }
  if (depts.length === 0 && holiday.department && typeof holiday.department === 'string') {
    const depStr = holiday.department.trim();
    if (depStr.toLowerCase() !== "all" && depStr.toLowerCase() !== "all departments") {
      depts = depStr.split(",").map(d => d.trim()).filter(Boolean);
    }
  }
  if (depts.length === 0) return true;
  if (depts.some(d => d.toLowerCase() === "all" || d.toLowerCase() === "all departments")) return true;
  if (!employeeDepartment) return true;
  const empDept = employeeDepartment.toLowerCase().trim();
  return depts.some(d => d.toLowerCase().trim() === empDept);
};

const calculateHolidayCountForDepartment = (holidaysData, targetMonth, employeeDepartment, attendanceMap = null, weekOffDatesSet = null, leaveDatesSet = null) => {
  if (!Array.isArray(holidaysData)) return 0;
  let count = 0;
  const [sYear, sMonth] = targetMonth.split('-').map(Number);
  const monthPrefix = `${sYear}-${String(sMonth).padStart(2, '0')}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  holidaysData.forEach(h => {
    if (h.isActive === false) return;
    if (!holidayAppliesToDepartment(h, employeeDepartment)) return;
    const hStartStr = h.fromDate;
    const hEndStr = h.toDate;
    if (!hStartStr || !hEndStr) return;
    const hStart = new Date(hStartStr + 'T00:00:00');
    const hEnd = new Date(hEndStr + 'T00:00:00');

    for (let d = new Date(hStart); d <= hEnd; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDateLocal(d);
      if (!dateKey.startsWith(monthPrefix)) continue;
      const checkDate = new Date(dateKey + 'T00:00:00');
      if (checkDate > today) continue;
      if (attendanceMap && attendanceMap.has(dateKey) && attendanceMap.get(dateKey) > 0) continue;
      if (weekOffDatesSet && weekOffDatesSet.has(dateKey)) continue;
      if (leaveDatesSet && leaveDatesSet.has(dateKey)) continue;
      count++;
    }
  });
  return count;
};

// ✅ EXACT PAYROLL calculateWeekOffData
const calculateWeekOffData = (employeeId, year, monthNum, dailyAttendance, employeeLeavesData, weekOffDates, shiftHours = 8, holidayDaysInMonth = 0, weekOffPerMonth = 4) => {
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekOffDateSet = new Set(weekOffDates || []);
  const totalWeekOffDaysInMonth = weekOffDateSet.size;

  const attendanceMap = new Map();
  (dailyAttendance || []).forEach(record => {
    if (record.date || record.checkInTime) {
      const dateKey = formatDateLocal(record.date || record.checkInTime);
      let hours = 0;
      if (record.totalHours && parseFloat(record.totalHours) > 0) hours = parseFloat(record.totalHours);
      else if (record.workingHours && parseFloat(record.workingHours) > 0) hours = parseFloat(record.workingHours);
      else if (record.checkInTime && record.checkOutTime) {
        hours = (new Date(record.checkOutTime) - new Date(record.checkInTime)) / (1000 * 60 * 60);
      }
      if (hours > 0) {
        const existing = attendanceMap.get(dateKey) || 0;
        attendanceMap.set(dateKey, existing + hours);
      }
    }
  });

  const isLeaveDay = (date) => {
    if (!date || !employeeId) return false;
    const leaves = employeeLeavesData[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = formatDateLocal(date);
    return leaves.leaveDetails.some(leave => {
      const startStr = formatDateLocal(leave.startDate);
      const endStr = formatDateLocal(leave.endDate);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const allWeekOffDates = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateLocal(d);
    if (weekOffDateSet.has(dateKey)) allWeekOffDates.push(dateKey);
  }

  const usedWeekOffDates = [];
  const workedOnWeekOffDates = [];

  allWeekOffDates.forEach(dateKey => {
    const hoursWorked = attendanceMap.get(dateKey);
    const isLeave = isLeaveDay(new Date(dateKey + 'T00:00:00'));
    if (isLeave) {
      usedWeekOffDates.push(dateKey);
    } else if (hoursWorked !== undefined && hoursWorked > 0) {
      workedOnWeekOffDates.push(dateKey);
    } else {
      usedWeekOffDates.push(dateKey);
    }
  });

  let presentDays = 0, halfDays = 0, leavesCount = 0, totalWorkingDays = 0;
  const presentDates = [], halfDayDates = [], leaveDates = [];

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateLocal(d);
    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate > today) continue;

    if (isLeaveDay(d)) {
      leavesCount++;
      leaveDates.push(dateKey);
      continue;
    }

    const hoursWorked = attendanceMap.get(dateKey);
    if (hoursWorked !== undefined && hoursWorked > 0) {
      if (hoursWorked >= shiftHours * 0.8) {
        presentDays++;
        presentDates.push(dateKey);
        totalWorkingDays += 1;
      } else if (hoursWorked >= shiftHours * 0.4) {
        halfDays += 0.5;
        halfDayDates.push(dateKey);
        totalWorkingDays += 0.5;
      }
    }
  }

  let earnedWeekOffs = Math.floor(totalWorkingDays / 5);
  const effectiveCap = weekOffPerMonth || 4;
  earnedWeekOffs = Math.min(earnedWeekOffs, effectiveCap);

  const workedOnWeekOff = workedOnWeekOffDates.length;
  const carryForwardWeekOffs = workedOnWeekOff;
  const rawUsedWeekOffs = usedWeekOffDates.length;
  const usedWeekOffs = Math.min(rawUsedWeekOffs, earnedWeekOffs);
  const unearnedAbsentDays = Math.max(0, rawUsedWeekOffs - earnedWeekOffs);

  const weeklyBreakdown = [];
  let currentWeekStart = new Date(firstDay);
  while (currentWeekStart.getDay() !== 1) currentWeekStart.setDate(currentWeekStart.getDate() - 1);

  let weekNumber = 1;
  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    let weekPresent = 0, weekHalf = 0, weekLeaves = 0, weekOffsUsed = 0, weekOffsWorked = 0, daysInMonthInThisWeek = 0;

    for (let d = new Date(currentWeekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (d < firstDay || d > lastDay) continue;
      daysInMonthInThisWeek++;
      const dateKey = formatDateLocal(d);
      if (weekOffDateSet.has(dateKey)) {
        if (workedOnWeekOffDates.includes(dateKey)) weekOffsWorked++;
        else weekOffsUsed++;
        continue;
      }
      if (isLeaveDay(d)) { weekLeaves++; continue; }
      const hoursWorked = attendanceMap.get(dateKey);
      if (hoursWorked !== undefined && hoursWorked > 0) {
        if (hoursWorked >= shiftHours * 0.8) weekPresent++;
        else if (hoursWorked >= shiftHours * 0.4) weekHalf += 0.5;
      }
    }

    weeklyBreakdown.push({
      weekNumber, daysInMonth: daysInMonthInThisWeek,
      presentDays: weekPresent, halfDays: weekHalf, leaves: weekLeaves,
      weekOffsUsed, weekOffsWorked,
      effectiveWorkingDays: Math.round((weekPresent + weekHalf + weekLeaves) * 10) / 10
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  return {
    weeklyBreakdown, earnedWeekOffs, usedWeekOffs, unearnedAbsentDays,
    workedOnWeekOff, carryForwardWeekOffs, totalWeekOffDays: totalWeekOffDaysInMonth,
    maxAllowedWeekOffs: effectiveCap, weekOffDates: Array.from(weekOffDateSet).sort(),
    usedWeekOffDates: usedWeekOffDates.sort(),
    workedOnWeekOffDates: workedOnWeekOffDates.sort(),
    presentDates, halfDayDates, leaveDates,
    presentDays, halfDays, leavesCount, totalWorkingDaysInMonth: totalWorkingDays
  };
};

export default function EmployeeSalary() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthInfo, setMonthInfo] = useState({
    isHistorical: false, isCurrent: false, includeWeekOff: false, canDownload: false
  });
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  const recordsPerPage = 10;

  useEffect(() => {
    const savedTemplate = localStorage.getItem("payrollTemplateConfig");
    if (savedTemplate) {
      try { setTemplateConfig(JSON.parse(savedTemplate)); } catch (e) {}
    }
  }, []);

  const getCurrentEmployee = () => {
    try {
      const employeeData = JSON.parse(localStorage.getItem("employeeData") || "{}");
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const employeeId = localStorage.getItem("employeeId") || employeeData?.employeeId || userData?.employeeId || localStorage.getItem("adminId") || "";
      const employeeEmail = localStorage.getItem("employeeEmail") || employeeData?.email || userData?.email || localStorage.getItem("adminEmail") || "";
      const employeeName = localStorage.getItem("employeeName") || employeeData?.name || userData?.name || localStorage.getItem("adminName") || "";
      return {
        ...userData, ...employeeData,
        employeeId: String(employeeId).trim(),
        email: employeeEmail,
        name: employeeName
      };
    } catch (e) { return {}; }
  };

  const isHistoricalMonth = (month) => {
    if (!month) return false;
    const today = new Date();
    const [year, monthNum] = month.split('-').map(Number);
    if (year < today.getFullYear()) return true;
    if (year === today.getFullYear() && monthNum < today.getMonth() + 1) return true;
    return false;
  };

  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const [year, monthNum] = month.split('-').map(Number);
    return year === today.getFullYear() && monthNum === today.getMonth() + 1;
  };

  const shouldIncludeWeekOffInSalary = (month) => {
    if (!month) return false;
    const today = new Date();
    const [year, monthNum] = month.split('-').map(Number);
    if (year < today.getFullYear()) return true;
    if (year === today.getFullYear() && monthNum < today.getMonth() + 1) return true;
    if (year === today.getFullYear() && monthNum === today.getMonth() + 1) {
      return today.getDate() >= 26;
    }
    return false;
  };

  const isPayslipDownloadAllowed = (month) => {
    if (!month) return false;
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      return new Date().getDate() >= getDaysInMonth(month);
    }
    return true;
  };

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthDisplay = (monthStr) => {
    if (!monthStr || monthStr === "Not specified") return "Current Month";
    const [year, month] = monthStr.split("-");
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) return `${hours + 1}h 0m`;
    return `${hours}h ${minutes}m`;
  };

  const processLeavesData = (leavesData, selectedMonthStr) => {
    const leavesMap = {};
    const [year, monthNum] = (selectedMonthStr || getCurrentMonth()).split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

    (leavesData || []).forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
      const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

      const safeStartOfMonth = new Date(startOfMonth);
      safeStartOfMonth.setDate(startOfMonth.getDate() - 6);
      const overlapSafeStart = new Date(Math.max(leaveStart, safeStartOfMonth));
      const inExtendedMonth = overlapSafeStart <= overlapEnd;

      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = { CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
      }
      const leaveType = leave.leaveType || 'Other';

      if (currentMonthDays > 0) {
        if (leavesMap[employeeId][leaveType] !== undefined) {
          leavesMap[employeeId][leaveType] += currentMonthDays;
        } else if (["Casual Leave", "Casual", "casual", "Earned Leave", "Earned", "earned", "Sick Leave", "Sick", "sick", "Comp Off", "comp off"].includes(leaveType)) {
          const typeMap = {
            "Casual Leave": "CL", "Casual": "CL", "casual": "CL",
            "Earned Leave": "EL", "Earned": "EL", "earned": "EL",
            "Sick Leave": "SL", "Sick": "SL", "sick": "SL",
            "Comp Off": "COFF", "comp off": "COFF"
          };
          leavesMap[employeeId][typeMap[leaveType]] += currentMonthDays;
        } else {
          leavesMap[employeeId].Other += currentMonthDays;
        }
      }

      if (inExtendedMonth) {
        leavesMap[employeeId].leaveDetails.push({
          type: leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: Math.ceil(Math.abs(leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1,
          reason: leave.reason || '',
          status: leave.status || 'pending'
        });
      }
    });
    return leavesMap;
  };

  const wasEmployeeEmployedInMonth = (employee, monthStr) => {
    if (!monthStr || !employee.joinDate) return true;
    const [year, month] = monthStr.split('-').map(Number);
    const joiningDate = new Date(employee.joinDate);
    if (joiningDate.getFullYear() > year) return false;
    if (joiningDate.getFullYear() === year && joiningDate.getMonth() + 1 > month) return false;
    return true;
  };

  const medicalRoles = [
    "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
    "Nurse", "Doctor", "Lab Technician", "Medical Officer",
    "Physician", "Surgeon", "Radiologist", "Pathologist",
    "Therapist", "Healthcare", "Medical", "Clinical"
  ];
  const isMedicalRole = (role) => {
    if (!role) return false;
    return medicalRoles.some(medRole => role.toLowerCase().includes(medRole.toLowerCase()));
  };

  // ============================================
  // 🚀 SAME BULK API AS PAYROLL — SINGLE EMPLOYEE
  // ============================================
  const fetchSalaryData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      const loggedEmployee = getCurrentEmployee();
      const currentEmployeeId = loggedEmployee?.employeeId;

      let monthsToCompute = [];
      if (month) {
        monthsToCompute = [month];
      } else {
        const cur = new Date();
        for (let i = 0; i < 12; i++) {
          const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
          const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthsToCompute.push(mStr);
        }
      }

      const recordsPromises = monthsToCompute.map(async (m) => {
        try {
          // 🚀 SAME BULK API AS PAYROLL
          const res = await fetch(`${API_BASE_URL}/attendancesummary/bulk-payroll?month=${m}`);
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          const json = await res.json();
          if (!json.success) throw new Error(json.message || "Failed to fetch");

          const {
            employees: employeesData,
            attendanceByEmployee,
            leavesByEmployee,
            compOffsByEmployee,
            weekOffDatesMap: weekOffMap,
            summaryMap,
            holidays: holidaysData
          } = json.data;

          const daysInMonthValue = json.daysInMonth;

          // Find logged-in employee
          let fullEmp = employeesData.find(e =>
            String(e.employeeId).trim().toLowerCase() === String(currentEmployeeId).trim().toLowerCase() ||
            (loggedEmployee.email && e.email && e.email.toLowerCase() === loggedEmployee.email.toLowerCase())
          );

          if (!fullEmp && employeesData.length > 0) {
            fullEmp = employeesData[0];
          }
          if (!fullEmp) return null;

          // Filter by joining date
          if (!wasEmployeeEmployedInMonth(fullEmp, m)) return null;

          // Leaves data
          const allLeavesArray = [];
          Object.keys(leavesByEmployee).forEach(empId => {
            leavesByEmployee[empId].forEach(l => allLeavesArray.push(l));
          });
          const currentLeavesMap = processLeavesData(allLeavesArray, m);

          // Comp-offs
          const compOffMap = {};
          Object.keys(compOffsByEmployee).forEach(empId => {
            compOffMap[empId] = compOffsByEmployee[empId].map(co => ({
              date: co.workDate,
              count: co.count || 1,
              reason: co.reason || '',
              workDate: co.workDate,
              _id: co._id
            }));
          });

          // Summary
          const summaryData = Object.values(summaryMap);
          const summary = summaryData.find(x => x.employeeId === fullEmp.employeeId) || {};

          const [year, monthNum] = m.split('-').map(Number);
          const deptLower = (fullEmp.department || '').toLowerCase().trim();
          const isConsultant = deptLower.includes("consultant");
          const employeeRole = summary.role || fullEmp.role || fullEmp.designation || '';
          const isMedicalStaff = isMedicalRole(employeeRole);

          const attendanceForEmployee = attendanceByEmployee[fullEmp.employeeId] || [];
          const weekOffDates = weekOffMap[fullEmp.employeeId] || [];

          // Attendance map for holiday calc
          const attendanceMapForHoliday = new Map();
          attendanceForEmployee.forEach(record => {
            const dateKey = formatDateLocal(record.date || record.checkInTime);
            let hours = 0;
            if (record.totalHours && parseFloat(record.totalHours) > 0) hours = parseFloat(record.totalHours);
            else if (record.workingHours && parseFloat(record.workingHours) > 0) hours = parseFloat(record.workingHours);
            else if (record.checkInTime && record.checkOutTime) {
              hours = (new Date(record.checkOutTime) - new Date(record.checkInTime)) / (1000 * 60 * 60);
            }
            if (hours > 0) attendanceMapForHoliday.set(dateKey, hours);
          });

          const weekOffDatesSetForHoliday = new Set(weekOffDates || []);
          const leaveDatesSetForHoliday = new Set();
          const empLeaveDetails = currentLeavesMap[fullEmp.employeeId]?.leaveDetails || [];
          empLeaveDetails.forEach(leave => {
            const s = new Date(leave.startDate);
            const e = new Date(leave.endDate);
            for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
              leaveDatesSetForHoliday.add(formatDateLocal(d));
            }
          });

          const employeeHolidayCount = calculateHolidayCountForDepartment(
            holidaysData, m, fullEmp.department || '',
            attendanceMapForHoliday, weekOffDatesSetForHoliday, leaveDatesSetForHoliday
          );

          const weekOffData = calculateWeekOffData(
            fullEmp.employeeId, year, monthNum,
            attendanceForEmployee, currentLeavesMap, weekOffDates,
            fullEmp.shiftHours || 8, employeeHolidayCount,
            fullEmp.weekOffPerMonth || 4
          );

          const earnedWeekOffs = weekOffData.earnedWeekOffs;
          const usedWeekOffs = weekOffData.usedWeekOffs;
          const unearnedAbsentDays = weekOffData.unearnedAbsentDays || 0;
          const workedOnWeekOff = weekOffData.workedOnWeekOff;
          const carryForwardWeekOffs = weekOffData.carryForwardWeekOffs;
          const totalWeekOffDaysInMonth = weekOffData.totalWeekOffDays;

          let defaultWeekOffs = weekOffDates.length || (isConsultant ? 2 : (fullEmp.weekOffPerMonth || 4));

          let salaryForMonth = fullEmp.salaryPerMonth || 0;
          let originalSalary = fullEmp.originalSalary || fullEmp.salaryPerMonth;
          let incrementDetails = null;

          if (fullEmp.salaryIncrements && fullEmp.salaryIncrements.length > 0) {
            const targetDate = new Date(year, monthNum - 1, 15);
            let applicableSalary = fullEmp.originalSalary || fullEmp.salaryPerMonth;
            fullEmp.salaryIncrements.forEach(inc => {
              const effDate = new Date(inc.effectiveFrom);
              if (effDate <= targetDate && inc.newSalary) applicableSalary = inc.newSalary;
            });
            salaryForMonth = applicableSalary;
          }

          const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;

          let presentDaysCount = weekOffData.presentDays ?? summary.presentDays ?? 0;
          let halfDaysCount = weekOffData.halfDays ?? summary.halfDayWorking ?? 0;
          let totalWorkingDays = summary.totalWorkingDays ?? (presentDaysCount + (halfDaysCount * 0.5));

          const fullDayNotWorking = summary.fullDayNotWorking ?? 0;
          const overTimeHours = summary.overTimeHours ?? 0;

          const employeeCompOffDates = compOffMap[fullEmp.employeeId] || [];
          const totalCompOffDays = employeeCompOffDates.reduce((sum, co) => sum + (co.count || 1), 0);
          const compOffAmount = totalCompOffDays * dailyRate;

          const payablePresentDays = presentDaysCount + (halfDaysCount * 0.5);
          const weekOffsForSalary = usedWeekOffs;

          let calculatedSalary = 0;
          if (salaryForMonth > 0 && daysInMonthValue > 0) {
            if (presentDaysCount === 0 && halfDaysCount === 0 && usedWeekOffs === 0 && totalCompOffDays === 0 && employeeHolidayCount === 0) {
              calculatedSalary = 0;
            } else {
              const effectivePaidDaysRaw = payablePresentDays + weekOffsForSalary + totalCompOffDays + employeeHolidayCount;
              const effectivePaidDays = Math.min(effectivePaidDaysRaw, daysInMonthValue);
              calculatedSalary = effectivePaidDays * dailyRate;
            }
          }

          const expectedWorkingDays = Math.max(0, daysInMonthValue - usedWeekOffs);
          const prevMonth = getPreviousMonth(m);
          const prevCarryForwardRaw = prevMonth
            ? parseFloat(localStorage.getItem(getCarryForwardKey(fullEmp.employeeId, prevMonth)) || '0')
            : 0;
          const prevCarryForward = Math.max(0, prevCarryForwardRaw || 0);

          let carryForwardDays = Math.max(0, carryForwardWeekOffs || 0);
          localStorage.setItem(getCarryForwardKey(fullEmp.employeeId, m), String(carryForwardDays));

          // OT
          let totalOTHours = overTimeHours || 0;
          let calculatedOTHours = 0;
          attendanceForEmployee.forEach(record => {
            let hoursWorked = 0;
            if (record.hours) hoursWorked = parseFloat(record.hours);
            else if (record.totalHours) hoursWorked = parseFloat(record.totalHours);
            else if (record.checkInTime && record.checkOutTime) {
              hoursWorked = (new Date(record.checkOutTime) - new Date(record.checkInTime)) / (1000 * 60 * 60);
            }
            const shiftHrs = fullEmp.shiftHours || 8;
            if (hoursWorked > shiftHrs) calculatedOTHours += (hoursWorked - shiftHrs);
          });
          if (totalOTHours === 0 && calculatedOTHours > 0) totalOTHours = calculatedOTHours;
          totalOTHours = Number(totalOTHours.toFixed(2));
          const formattedOTHours = formatDecimalHours(totalOTHours);

          // Approved OT
          let approvedOTAmount = 0, approvedOTHours = 0;
          try {
            const otRes = await fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`);
            if (otRes.ok) {
              const otJson = await otRes.json();
              if (otJson.success) {
                const [sY, sM] = m.split('-').map(Number);
                const mStart = new Date(sY, sM - 1, 1);
                const mEnd = new Date(sY, sM, 0);
                const empClaims = (otJson.claims || []).filter(c => {
                  if (String(c.employeeId).trim() !== String(fullEmp.employeeId).trim()) return false;
                  const cDate = new Date(c.date);
                  return cDate >= mStart && cDate <= mEnd;
                });
                empClaims.forEach(claim => {
                  approvedOTAmount += claim.otAmount || 0;
                  approvedOTHours += claim.otHours || 0;
                });
              }
            }
          } catch (e) {}

          const savedOTMap = (() => {
            try {
              const saved = localStorage.getItem(`otApplied_${m}`);
              return saved ? JSON.parse(saved) : {};
            } catch { return {}; }
          })();

          const savedManualDeductionMap = (() => {
            try {
              const saved = localStorage.getItem(`manualDeduction_${m}`);
              return saved ? JSON.parse(saved) : {};
            } catch { return {}; }
          })();

          const baseCalculatedSalary = Math.round(calculatedSalary);
          const dashboardOTHours = savedOTMap[fullEmp.employeeId] !== undefined ? savedOTMap[fullEmp.employeeId] : null;

          let finalOTAmount = 0;
          let otSource = 'none';

          if (approvedOTAmount > 0) {
            finalOTAmount = approvedOTAmount;
            otSource = 'approved';
          } else if (dashboardOTHours !== null && dashboardOTHours > 0) {
            const shiftHours = fullEmp.shiftHours || 8;
            const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
            finalOTAmount = dashboardOTHours * otRatePerHour * 2;
            otSource = 'dashboard';
          } else {
            const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
            const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
            const isApprovedInOTPage = localStorage.getItem(`otStatus_${fullEmp.employeeId}_${m}`) === "approved";
            if (totalOTHours > 0 && (savedOTEmps.has(fullEmp.employeeId) || isApprovedInOTPage)) {
              const multiplier = Number(localStorage.getItem(`otMultiplier_${fullEmp.employeeId}_${m}`)) || 2;
              const shiftHours = fullEmp.shiftHours || 8;
              const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
              finalOTAmount = totalOTHours * otRatePerHour * multiplier;
              otSource = 'manual';
            }
          }

          const manualEntry = savedManualDeductionMap[fullEmp.employeeId] || { amount: 0, reason: '' };
          const manualDeductionAmount = manualEntry.amount || 0;
          const manualDeductionReason = manualEntry.reason || '';

          const finalPay = Math.max(0, Math.round(baseCalculatedSalary + finalOTAmount - manualDeductionAmount));
          const holidayAmount = Math.round(employeeHolidayCount * dailyRate);

          const isHistorical = isHistoricalMonth(m);
          const isCurrent = isCurrentMonth(m);
          const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(m);
          const canDownload = isPayslipDownloadAllowed(m);

          return {
            employeeId: fullEmp.employeeId,
            name: fullEmp.name,
            department: fullEmp.department || 'N/A',
            designation: employeeRole,
            role: employeeRole,
            month: m,
            monthFormatted: formatMonthDisplay(m),

            presentDays: presentDaysCount,
            halfDays: halfDaysCount,
            halfDayWorking: halfDaysCount,
            totalWorkingDays: totalWorkingDays,
            workingDays: totalWorkingDays,
            fullDayNotWorking: fullDayNotWorking,
            overTimeHours: totalOTHours,
            overTimeHoursFormatted: formattedOTHours,

            earnedWeekOffs: earnedWeekOffs,
            usedWeekOffs: usedWeekOffs,
            unearnedAbsentDays: unearnedAbsentDays,
            workedOnWeekOff: workedOnWeekOff,
            carryForwardWeekOffs: carryForwardWeekOffs,
            weekOffs: weekOffsForSalary,
            defaultWeekOffs: defaultWeekOffs,
            totalWeekOffDays: totalWeekOffDaysInMonth,
            maxAllowedWeekOffs: weekOffData.maxAllowedWeekOffs,

            weekOffDay: fullEmp.weekOffDay,
            weekOffDates: weekOffDates,
            usedWeekOffDates: weekOffData.usedWeekOffDates || [],
            workedOnWeekOffDates: weekOffData.workedOnWeekOffDates || [],
            weeklyBreakdown: weekOffData.weeklyBreakdown,

            compOffDates: employeeCompOffDates,
            compOffDays: totalCompOffDays,
            compOffAmount: Math.round(compOffAmount),
            compOffEarned: totalCompOffDays,
            compOffUsed: 0,
            compOffBalance: totalCompOffDays,

            salaryPerMonth: salaryForMonth,
            currentSalary: fullEmp.salaryPerMonth,
            originalSalary: originalSalary,
            salaryPerDay: dailyRate.toFixed(2),
            dailyRate: dailyRate.toFixed(2),
            calculatedSalary: baseCalculatedSalary,
            baseCalculatedSalary: baseCalculatedSalary,

            shiftHours: fullEmp.shiftHours || 8,
            finalOTAmount: Math.round(finalOTAmount),
            otAmount: Math.round(finalOTAmount),
            finalPay: finalPay,
            hasApprovedOT: approvedOTAmount > 0,
            approvedOTAmount: approvedOTAmount,
            approvedOTHours: approvedOTHours,
            dashboardOTHours: dashboardOTHours,
            otSource: otSource,

            manualDeduction: manualDeductionAmount,
            manualDeductionReason: manualDeductionReason,

            holidayCount: employeeHolidayCount,
            holidayAmount: holidayAmount,
            monthDays: daysInMonthValue,
            includeWeekOffInSalary: includeWeekOffInSalary,
            isHistoricalMonth: isHistorical,
            isCurrentMonth: isCurrent,
            canDownload: canDownload,
            role: employeeRole,
            isMedicalStaff: isMedicalStaff,
            incrementDetails: incrementDetails,

            _id: fullEmp._id,
            basicPay: fullEmp.basicPay,
            hra: fullEmp.hra,
            conveyanceAllowance: fullEmp.conveyanceAllowance,
            medicalAllowance: fullEmp.medicalAllowance,
            performanceAllowance: fullEmp.performanceAllowance,
            specialAllowance: fullEmp.specialAllowance,
            gmcAmount: fullEmp.gmc,
            ptax: fullEmp.profTax,
            otherDeductions: fullEmp.otherDeductions,
            bankAccount: fullEmp.bankAccount || '',
            bankName: fullEmp.bankName || '',
            panNo: fullEmp.panCard || '',
            pfNo: fullEmp.pfNo || '',
            uanNo: fullEmp.uanNo || '',
            esicNo: fullEmp.esicNo || '',
            branch: fullEmp.branch || '',
            joiningDate: fullEmp.joinDate || fullEmp.joiningDate || '',
            location: fullEmp.location || 'HYDERABAD',

            totalLeaves: 0,
            leavesBreakdown: currentLeavesMap[fullEmp.employeeId] || { CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 },

            expectedWorkingDays: expectedWorkingDays,
            payablePresentDays: payablePresentDays,
            carryForwardDays: carryForwardDays,
            carryForwardFromPrev: prevCarryForward
          };
        } catch (err) {
          console.error(`Error for month ${m}:`, err);
          return null;
        }
      });

      const recordsList = (await Promise.all(recordsPromises)).filter(Boolean);
      recordsList.sort((a, b) => b.month.localeCompare(a.month));

      if (isMounted) {
        setRecords(recordsList);
        setFilteredRecords(recordsList);
      }

      const targetMonth = month || getCurrentMonth();
      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(targetMonth);
      const isHistorical = isHistoricalMonth(targetMonth);
      const isCurrent = isCurrentMonth(targetMonth);
      const canDownload = isPayslipDownloadAllowed(targetMonth);

      if (isMounted) {
        setMonthInfo({ isHistorical, isCurrent, includeWeekOff: includeWeekOffInSalary, canDownload });
      }

    } catch (err) {
      console.error("❌ Salary fetch error:", err);
      if (isMounted) setError(err.message || "Failed to load salary data");
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSalaryData(selectedMonth);
  }, [fetchSalaryData, selectedMonth]);

  const handleMonthSelect = async (e) => {
    const monthValue = e.target.value;
    setSelectedMonth(monthValue);
    setIsLoadingMonth(true);
    await fetchSalaryData(monthValue);
    setIsLoadingMonth(false);
  };

  const handleClearFilter = async () => {
    setSearchTerm("");
    setSelectedMonth("");
    await fetchSalaryData("");
  };

  useEffect(() => {
    let filtered = [...records];
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        (record.monthFormatted && record.monthFormatted.toLowerCase().includes(searchLower)) ||
        (record.month && record.month.toLowerCase().includes(searchLower))
      );
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (pageNumber) => { setCurrentPage(pageNumber); };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmployee(null);
  };

  const getLeaveTypes = (employee) => {
    const leaves = employee.leavesBreakdown || { CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const arr = [];
    if (leaves.CL > 0) arr.push(`CL: ${leaves.CL}`);
    if (leaves.SL > 0) arr.push(`SL: ${leaves.SL}`);
    if (leaves.EL > 0) arr.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) arr.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) arr.push(`LOP: ${leaves.LOP}`);
    if (leaves.Other > 0) arr.push(`Other: ${leaves.Other}`);
    return arr.length > 0 ? arr.join(', ') : 'No Leaves';
  };

  const extractDayNumbers = (datesArray, keyField = null) => {
    if (!datesArray || datesArray.length === 0) return "";
    return datesArray
      .map(item => {
        const dateStr = keyField ? item[keyField] : item;
        if (!dateStr) return null;
        const day = parseInt(String(dateStr).split("-")[2], 10);
        return isNaN(day) ? null : day;
      })
      .filter(d => d !== null)
      .sort((a, b) => a - b)
      .join(", ");
  };

  // ============================================
  // PAYSLIP GENERATION
  // ============================================
  const generateInvoiceHTML = (employee) => {
    if (!employee.salaryPerMonth || employee.salaryPerMonth === 0) {
      return `<!DOCTYPE html><html><head><title>Payslip</title></head><body style="font-family:Arial;text-align:center;padding:40px;"><h2>Salary Data Not Available</h2></body></html>`;
    }

    const daysInMonth = employee.monthDays || getDaysInMonth(employee.month);
    const dailyRate = parseFloat(employee.dailyRate) || 0;
    const presentDays = employee.presentDays ?? 0;
    const halfDays = employee.halfDays || 0;
    const holidays = employee.holidayCount || 0;
    const actualWeekOffDaysNumeric = employee.usedWeekOffs || 0;
    const compOffDays = employee.compOffDays || 0;

    const netPayFromPage = employee.finalPay || employee.calculatedSalary || 0;
    const calculatedBaseFromPage = employee.calculatedSalary || 0;
    const otAmountFromPage = employee.finalOTAmount || 0;

    let lopDays = Math.max(0, daysInMonth - (presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays + compOffDays));
    lopDays = Math.round(lopDays * 10) / 10;
    let lopAmount = Math.round(lopDays * dailyRate * 100) / 100;

    const earningsItems = [];
    if (calculatedBaseFromPage > 0) earningsItems.push({ label: 'Base Salary (Calculated)', amount: Math.round(calculatedBaseFromPage), isBase: true });
    if (otAmountFromPage > 0) earningsItems.push({ label: 'Overtime Pay', amount: Math.round(otAmountFromPage) });
    if (employee.holidayAmount > 0 && holidays > 0) earningsItems.push({ label: `Holiday Pay (${holidays} day${holidays > 1 ? 's' : ''})`, amount: employee.holidayAmount });

    earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
    earningsItems.push({ label: `Week Off Days (${actualWeekOffDaysNumeric})`, amount: 0, isInfo: true });
    if (holidays > 0) earningsItems.push({ label: `Public Holidays (${holidays})`, amount: 0, isInfo: true });
    if (compOffDays > 0) earningsItems.push({ label: `Comp-off Days (${compOffDays})`, amount: 0, isInfo: true });

    const deductionsItems = [];
    if (lopDays > 0) deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: Math.round(lopAmount) });
    else deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });

    const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
    if (halfDays > 0) deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: Math.round(halfDayDeductionAmount) });
    else deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });

    const gmcAmt = employee.gmcAmount || 0;
    const ptaxAmt = employee.ptax || 0;
    const extraDeductions = employee.otherDeductions || 0;
    const manualDeductionAmount = employee.manualDeduction || 0;
    const manualDeductionReason = employee.manualDeductionReason || '';
    const totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    deductionsItems.push({ label: `Other Deductions`, amount: Math.round(totalOtherDeductions) });

    if (manualDeductionAmount > 0) {
      deductionsItems.push({
        label: `Manual Deduction${manualDeductionReason ? ` (${manualDeductionReason})` : ''}`,
        amount: manualDeductionAmount
      });
    }

    let totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
    let totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
    const finalNetPay = Math.round(netPayFromPage);

    const targetEarnings = finalNetPay + Math.round(totalDeductionsAmt);
    const baseIdx = earningsItems.findIndex(item => item.isBase);
    if (baseIdx !== -1) {
      const otherEarnings = earningsItems.filter((item, idx) => idx !== baseIdx && !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
      earningsItems[baseIdx].amount = Math.max(0, targetEarnings - otherEarnings);
      totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
    }

    let tableRowsHTML = '';
    const maxRows = Math.max(earningsItems.length, deductionsItems.length);
    for (let i = 0; i < maxRows; i++) {
      const earn = earningsItems[i];
      const ded = deductionsItems[i];
      const earnLabel = earn ? earn.label : '';
      const earnAmountStr = earn ? (earn.isInfo ? '-' : `₹${Math.round(earn.amount).toFixed(2)}`) : '';
      const dedLabel = ded ? ded.label : '';
      const dedAmountStr = ded ? `₹${Math.round(ded.amount).toFixed(2)}` : '';
      tableRowsHTML += `<tr>
        <td style="border:1px solid #000;padding:6px 8px;font-size:12px;${earn?.isInfo ? 'background:#fafafa;' : ''}">${earnLabel}</td>
        <td style="border:1px solid #000;padding:6px 8px;text-align:right;font-size:12px;${earn?.isInfo ? 'background:#fafafa;' : ''}">${earnAmountStr}</td>
        <td style="border:1px solid #000;padding:6px 8px;font-size:12px;">${dedLabel}</td>
        <td style="border:1px solid #000;padding:6px 8px;text-align:right;font-size:12px;">${dedAmountStr}</td>
      </tr>`;
    }

    const numberToWords = (num) => {
      if (num === 0) return 'Zero Rupees Only';
      const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      const numStr = Math.abs(Math.round(num)).toString();
      if (numStr.length > 9) return 'Amount too large';
      const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
      return str.replace(/\b\w/g, l => l.toUpperCase()).trim();
    };

    const amountInWords = numberToWords(finalNetPay);
    const logoData = timelyHealthLogo || logo || '';
    const stampData = companyStamp || '';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip - ${employee.name}</title>
    <style>@page{size:A4;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;padding:20px;background:#fff}.invoice-container{max-width:210mm;margin:0 auto;border:1px solid #000;border-radius:4px}table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border:1px solid #000;font-size:12px;color:#000}.header-cell{border:none!important;padding:12px;border-bottom:1px solid #000!important}.section-header{text-align:center;padding:8px;font-weight:bold;background:#f5f5f5}.total-row{font-weight:bold;background:#f9f9f9}.gross-row{font-weight:bold;background:#f0f0f0}.logo-image{height:80px;width:auto;max-width:200px;object-fit:contain}.stamp-image{width:90px;height:auto;opacity:.8}.header-wrapper{display:flex;align-items:center;justify-content:space-between}.logo-wrapper{width:200px;flex-shrink:0}.company-info{flex:1;text-align:center}.company-name{margin:0;font-size:16px;font-weight:bold}.company-address{margin:2px 0 0;font-size:7px;line-height:1.4}.stamp-bottom{display:flex;justify-content:flex-end;padding:10px 20px;border-top:1px solid #000;margin-top:5px}.stamp-bottom-content{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.amount-word{font-size:11px;font-weight:bold;padding:8px 0;text-align:center}</style>
    </head><body><div class="invoice-container"><table>
    <tr><td colspan="6" class="header-cell"><div class="header-wrapper">
    <div class="logo-wrapper">${logoData ? `<img src="${logoData}" class="logo-image" onerror="this.style.display='none'"/>` : ''}</div>
    <div class="company-info"><h2 class="company-name">Timely Healthtech Private Limited</h2>
    <p class="company-address">Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081</p></div>
    <div style="width:200px"></div></div></td></tr>
    <tr><td colspan="6" class="section-header">PAYSLIP FOR ${formatMonthDisplay(employee.month).toUpperCase()}</td></tr></table>
    <table>
    <tr><td><strong>Name:</strong></td><td>${employee.name || '-'}</td><td><strong>Employee No:</strong></td><td>${employee.employeeId || '-'}</td></tr>
    <tr><td><strong>Joining Date:</strong></td><td>${employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '-'}</td><td><strong>Bank Name:</strong></td><td>${employee.bankName || '-'}</td></tr>
    <tr><td><strong>Designation:</strong></td><td>${employee.designation || employee.role || '-'}</td><td><strong>Bank Account No:</strong></td><td>${employee.bankAccount || '-'}</td></tr>
    <tr><td><strong>Department:</strong></td><td>${employee.department || '-'}</td><td><strong>PAN Number:</strong></td><td>${employee.panNo || '-'}</td></tr>
    <tr><td><strong>Location:</strong></td><td>${employee.location || 'HYDERABAD'}</td><td><strong>EMP EFFECTIVE</strong></td><td>:30</td></tr>
    <tr><td><strong>LOP:</strong></td><td>${lopDays > 0 ? lopDays : '0'}</td><td></td><td></td></tr></table>
    <table><tr style="background:#f0f0f0"><td><strong>Earnings</strong></td><td style="text-align:center"><strong>Amount</strong></td><td><strong>Deductions</strong></td><td style="text-align:center"><strong>Amount</strong></td></tr>
    ${tableRowsHTML}
    <tr class="gross-row"><td><strong>Total Earnings</strong></td><td style="text-align:right"><strong>₹${Math.round(totalEarningsAmt).toFixed(2)}</strong></td><td><strong>Total Deductions</strong></td><td style="text-align:right"><strong>₹${Math.round(totalDeductionsAmt).toFixed(2)}</strong></td></tr>
    <tr class="total-row"><td colspan="2"></td><td><strong>Net Pay for the month</strong></td><td style="text-align:right"><strong>₹${finalNetPay.toFixed(2)}</strong></td></tr>
    <tr><td colspan="4" class="amount-word">(${amountInWords})</td></tr></table>
    <div class="stamp-bottom"><div class="stamp-bottom-content">
    ${stampData ? `<img src="${stampData}" class="stamp-image" onerror="this.style.display='none'"/>` : ''}
    <div><strong style="font-size:7px">Authorized Signatory</strong><br/><span style="font-size:6px">Timely Healthtech Private Limited</span></div>
    </div></div></div></body></html>`;
  };

  const downloadSalarySlip = async (employee) => {
    if (!employee.canDownload) {
      alert(`Salary slip for current month will be available for download from last day of the month onwards.`);
      return;
    }
    const slipContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(slipContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading your salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "1rem" }}>
          <div className="emp-dash__card" style={{ maxWidth: 520, width: "100%" }}>
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load salary</h3>
                <p className="emp-dash__card-desc">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => fetchSalaryData(selectedMonth)}>Retry</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalSalary = filteredRecords.reduce((sum, emp) => {
    return sum + (typeof emp.calculatedSalary === 'number' ? emp.calculatedSalary : 0);
  }, 0);

  const avgSalary = filteredRecords.length > 0 ? Math.round(totalSalary / filteredRecords.length) : 0;
  const availableDocs = filteredRecords.filter((emp) => emp.canDownload).length;

  return (
    <div className="emp-dash">
      <main>
        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">My <span>Salary</span></h1>
            <p className="emp-dash__subtitle">View monthly salary summary and download payslips.</p>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
        </div>

        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiFileText /></div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">months</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Net Pay</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiDollarSign /></div>
            </div>
            <div className="emp-dash__stat-value">
              {totalSalary > 0 ? <CountUp end={Math.round(totalSalary)} duration={1.2} separator="," prefix="₹" /> : '₹0'}
            </div>
            <div className="emp-dash__stat-meta">sum</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Payslips</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiDownloadCloud /></div>
            </div>
            <div className="emp-dash__stat-value">{availableDocs}</div>
            <div className="emp-dash__stat-meta">available</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Salary</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiPieChart /></div>
            </div>
            <div className="emp-dash__stat-value">
              {avgSalary > 0 ? <CountUp end={avgSalary} duration={1.2} separator="," prefix="₹" /> : '₹0'}
            </div>
            <div className="emp-dash__stat-meta">per month</div>
          </div>
        </div>

        <div className="emp-dash__card" style={{ marginBottom: "1.5rem" }}>
          <div className="emp-dash__card-header">
            <div><h3 className="emp-dash__card-title">Filters</h3></div>
            <button type="button" className="emp-dash__card-link" onClick={() => fetchSalaryData(selectedMonth)} disabled={isLoadingMonth}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <RefreshCw size={12} className={isLoadingMonth ? "animate-spin" : ""} />
                {isLoadingMonth ? "Refreshing" : "Refresh"}
              </span>
            </button>
          </div>
          <div className="emp-dash__card-body">
            <div className="emp-leaves__filters">
              <div className="emp-leaves__field" style={{ minWidth: 220 }}>
                <label>Search</label>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }} />
                  <input type="text" placeholder="Search by month..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="emp-leaves__input" style={{ paddingLeft: "2rem" }} />
                </div>
              </div>
              <div className="emp-leaves__field">
                <label>Month</label>
                <input type="month" value={selectedMonth} onChange={handleMonthSelect} className="emp-leaves__input" max={getCurrentMonth()} />
              </div>
              <button type="button" className="emp-leaves__btn emp-leaves__btn--primary" onClick={() => { setSelectedMonth(""); fetchSalaryData(""); }}>All Months</button>
              <button type="button" className="emp-leaves__btn emp-leaves__btn--primary" onClick={() => { setSelectedMonth(""); fetchSalaryData(); }}>Current</button>
              {(searchTerm || selectedMonth) && (
                <button type="button" className="emp-leaves__btn emp-leaves__btn--ghost" onClick={handleClearFilter}>Clear</button>
              )}
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
              Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
            </div>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Salary Records</h3>
              <p className="emp-dash__card-desc">Month-wise salary and payslip availability (matches Payroll calculation)</p>
            </div>
          </div>
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ed-text-muted)", margin: 0 }}>No salary records found.</p>
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Present</th>
                      <th>Working</th>
                      <th>Half</th>
                      <th>Carry Fwd</th>
                      <th>Used WO</th>
                      <th>Week Off Dates</th>
                      <th>Comp-off</th>
                      <th>Holiday</th>
                      <th>OT</th>
                      <th>Monthly Salary</th>
                      <th style={{ textAlign: "center" }}>Calculated</th>
                      <th style={{ textAlign: "center" }}>Final Pay</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((emp, idx) => {
                      const statusText = emp.canDownload ? "Available" : "From Last Day";
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--ed-text-muted)" }}>
                              {emp.monthDays} days
                            </div>
                          </td>
                          <td><span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{emp.presentDays || 0}</span></td>
                          <td><span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{emp.workingDays || 0}</span></td>
                          <td><span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">{emp.halfDays || 0}</span></td>
                          <td>
                            {(emp.carryForwardDays > 0 || emp.carryForwardFromPrev > 0) ? (
                              <div className="flex flex-col items-center gap-0.5">
                                {emp.carryForwardDays > 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300" title="Worked on week off - carried forward">+{emp.carryForwardDays}→</span>
                                )}
                                {emp.carryForwardFromPrev > 0 && (
                                  <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200" title="Carried from previous month">←{emp.carryForwardFromPrev}</span>
                                )}
                              </div>
                            ) : (<span className="text-gray-300 text-xs">—</span>)}
                          </td>
                          <td><span className="px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200">{emp.usedWeekOffs || 0}</span></td>
                          <td>
                            {emp.weekOffDates && emp.weekOffDates.length > 0 ? (
                              <span className="font-mono text-[11px] font-bold text-orange-700" title={emp.weekOffDates.join(", ")}>
                                {extractDayNumbers(emp.weekOffDates)}
                              </span>
                            ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                          </td>
                          <td>
                            {emp.compOffDates && emp.compOffDates.length > 0 ? (
                              <span className="font-mono text-[11px] font-bold text-teal-700" title={emp.compOffDates.map(co => co.date).join(", ")}>
                                {extractDayNumbers(emp.compOffDates, 'date')}
                              </span>
                            ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                          </td>
                          <td>
                            {emp.holidayCount > 0 ? (
                              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">{emp.holidayCount}</span>
                            ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                          </td>
                          <td>{emp.finalOTAmount > 0 ? (<span className="font-bold text-green-600">₹{emp.finalOTAmount}</span>) : (<span className="text-gray-400">-</span>)}</td>
                          <td>
                            <div className="font-semibold text-slate-700">₹{(emp.salaryPerMonth || 0).toLocaleString()}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--ed-text-muted)" }}>₹{emp.salaryPerDay}/day</div>
                          </td>
                          <td style={{ textAlign: "center" }}><span className="font-bold text-blue-700" style={{ fontSize: "0.95rem" }}>₹{Math.round(emp.calculatedSalary || 0).toLocaleString()}</span></td>
                          <td style={{ textAlign: "center" }}><div style={{ fontWeight: 800, color: "var(--ed-success)", fontSize: "1rem" }}>₹{Math.round(emp.finalPay || 0).toLocaleString()}</div></td>
                          <td><span className={`emp-dash__table-status ${emp.canDownload ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>{statusText}</span></td>
                          <td style={{ textAlign: "right" }}>
                            <div className="flex justify-end space-x-1.5">
                              <button onClick={() => handleViewDetails(emp)} className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50 border border-blue-100" title="View Details"><Eye size={14} /></button>
                              <button onClick={() => downloadSalarySlip(emp)} disabled={!emp.canDownload} className={`p-1.5 rounded-md border ${emp.canDownload ? 'text-purple-600 hover:bg-purple-50 border-purple-100' : 'text-gray-300 border-gray-100 cursor-not-allowed'}`} title="Download Payslip"><Download size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length > 0 && (
                <div className="emp-dash__card-body" style={{ borderTop: "1px solid var(--ed-border-light)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--ed-text-secondary)" }}>
                      Showing <strong>{indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                      <button type="button" onClick={handlePrevious} disabled={currentPage === 1} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>Prev</button>
                      {getPageNumbers().map((p) => (
                        <button key={p} type="button" onClick={() => handlePageClick(p)} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem", minWidth: "2.25rem", borderColor: currentPage === p ? "var(--ed-primary)" : "var(--ed-border)", color: currentPage === p ? "var(--ed-primary)" : "var(--ed-text-secondary)", background: currentPage === p ? "var(--ed-primary-soft)" : "#fff" }}>{p}</button>
                      ))}
                      <button type="button" onClick={handleNext} disabled={currentPage === totalPages} className="emp-leaves__btn emp-leaves__btn--ghost" style={{ height: "2rem" }}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--ed-border-light)" }}>
              <div>
                <h3 className="text-base font-bold text-gray-800">Salary Details - {selectedEmployee.name}</h3>
                <p className="text-xs text-gray-500">{selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><FaTimes size={16} /></button>
            </div>

            <div className="p-4">
              <div className="flex items-start space-x-4 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full shrink-0 text-base">{selectedEmployee.name?.charAt(0) || 'E'}</div>
                <div className="flex flex-col flex-1 space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-800">{selectedEmployee.name}</h4>
                  <div className="grid grid-cols-2 text-xs text-gray-500 gap-x-4 gap-y-0.5">
                    <p><span className="font-medium text-gray-700">Emp ID:</span> {selectedEmployee.employeeId}</p>
                    <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Month Days:</span> {selectedEmployee.monthDays}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 text-xs sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Present Days</span><span className="font-bold text-emerald-700">{selectedEmployee.presentDays || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Working Days</span><span className="font-bold text-blue-700">{selectedEmployee.totalWorkingDays || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Half Days</span><span className="font-bold text-amber-700">{selectedEmployee.halfDays || 0}</span></div>

                {/* ONLY USED WEEK OFF SHOWN HERE */}
                <div className="flex justify-between py-1 border-b border-green-100 bg-green-50 rounded px-1"><span className="text-green-600 font-semibold">Used Week Offs (Paid)</span><span className="font-bold text-green-700">{selectedEmployee.usedWeekOffs || 0}</span></div>
                
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Total Week Off Days</span><span className="font-bold text-gray-600">{selectedEmployee.totalWeekOffDays || 0}</span></div>

                {selectedEmployee.holidayCount > 0 && (
                  <div className="flex justify-between py-1 border-b border-purple-100 bg-purple-50 rounded px-1 sm:col-span-2">
                    <span className="text-purple-600 font-semibold">Holiday Pay ({selectedEmployee.holidayCount} day{selectedEmployee.holidayCount > 1 ? 's' : ''})</span>
                    <span className="font-bold text-purple-700">₹{(selectedEmployee.holidayAmount || 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Month Days</span><span className="font-bold text-slate-700">{selectedEmployee.monthDays}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Payable Present Days</span><span className="font-bold text-blue-700">{selectedEmployee.payablePresentDays}</span></div>

                {selectedEmployee.unearnedAbsentDays > 0 && (
                  <div className="flex justify-between py-1 border-b border-red-100 bg-red-50 rounded px-1 sm:col-span-2">
                    <span className="text-red-600 font-semibold">Unearned Absent Days (LOP)</span>
                    <span className="font-bold text-red-700">{selectedEmployee.unearnedAbsentDays}</span>
                  </div>
                )}

                {selectedEmployee.compOffDays > 0 && (
                  <div className="flex justify-between py-1 border-b border-teal-100 bg-teal-50 rounded px-1 sm:col-span-2">
                    <span className="text-teal-600 font-semibold">Comp-off Days ({selectedEmployee.compOffDays})</span>
                    <span className="font-bold text-teal-700">₹{selectedEmployee.compOffAmount?.toLocaleString() || 0}</span>
                  </div>
                )}

                {selectedEmployee.weekOffDates && selectedEmployee.weekOffDates.length > 0 && (
                  <div className="flex flex-col py-1 border-b border-orange-100 bg-orange-50 rounded px-1 sm:col-span-2">
                    <span className="text-orange-600 font-semibold mb-1">Week Off Dates ({selectedEmployee.weekOffDates.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEmployee.weekOffDates.map((d) => (
                        <span key={d} className={`px-2 py-0.5 border rounded text-[10px] font-semibold ${
                          selectedEmployee.usedWeekOffDates?.includes(d)
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-purple-100 text-purple-700 border-purple-300'
                        }`}>
                          {new Date(d + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          {selectedEmployee.workedOnWeekOffDates?.includes(d) && ' (W)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Monthly Assigned Salary</span><span className="font-bold text-slate-800">₹{(selectedEmployee.salaryPerMonth || 0).toLocaleString()}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Daily Rate</span><span className="font-bold text-slate-700">₹{selectedEmployee.dailyRate}/day</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">OT Amount</span><span className="font-bold text-emerald-600">₹{selectedEmployee.finalOTAmount || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 font-medium text-blue-600">Calculated Base Salary</span><span className="font-bold text-blue-600">₹{Math.round(selectedEmployee.calculatedSalary || 0).toLocaleString()}</span></div>

                {selectedEmployee.manualDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-rose-100 bg-rose-50 rounded px-1 sm:col-span-2">
                    <span className="text-rose-600 font-semibold">Manual Deduction{selectedEmployee.manualDeductionReason ? ` (${selectedEmployee.manualDeductionReason})` : ''}</span>
                    <span className="font-bold text-rose-700">- ₹{selectedEmployee.manualDeduction.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2 bg-green-50/60 px-2 rounded"><span className="text-gray-800 font-bold text-sm">Final Net Payout</span><span className="font-extrabold text-emerald-700 text-sm">₹{Math.round(selectedEmployee.finalPay || 0).toLocaleString()}</span></div>

                <div className="flex flex-col py-1 border-b border-gray-100 sm:col-span-2">
                  <div className="flex justify-between"><span className="text-gray-500">Approved Leaves</span><span className="font-bold text-rose-600">{getLeaveTypes(selectedEmployee)}</span></div>
                </div>
              </div>

              {/* 📊 WEEKLY BREAKDOWN REMOVED AS PER REQUEST */}

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button onClick={() => downloadSalarySlip(selectedEmployee)} disabled={!selectedEmployee.canDownload} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition duration-200 ${selectedEmployee.canDownload ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Download Payslip</button>
                <button onClick={handleCloseModal} className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}