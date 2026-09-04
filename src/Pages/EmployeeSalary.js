import axios from "axios";
import { Download, Eye, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { FiDollarSign, FiDownloadCloud, FiFileText, FiPieChart } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timely-Health-Logo.png";
import companyStamp from "../Images/company-stamp-1780465131172.png";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import "./AttendanceSummary.css";

// ============================================
// 📅 HELPER: Date formatter
// ============================================
const formatDateLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ============================================
// 📅 HELPER: Carry-Forward localStorage key
// ============================================
const getCarryForwardKey = (employeeId, month) =>
  `payroll_carryForward_${employeeId}_${month}`;

// ============================================
// 📅 HELPER: Get previous month string (YYYY-MM)
// ============================================
const getPreviousMonth = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ============================================
// 📅 HELPER: Get days in month
// ============================================
const getDaysInMonth = (monthStr) => {
  if (!monthStr) return new Date().getDate();
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

// ============================================
// 📅 HELPER: Calculate earned weekoffs
// ============================================
const calculateEarnedWeekOffs = (employeeId, year, monthNum, dailyAttendance, employeeLeavesData, weekOffDay, shiftHours = 8, holidayDaysInMonth = 0) => {
  const weekOffDayNum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekOffDay);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);
  
  const attendanceMap = new Map();
  (dailyAttendance || []).forEach(record => {
    if (record.date || record.checkInTime) {
      const dateKey = formatDateLocal(record.date || record.checkInTime);
      let hours = 0;
      if (record.totalHours) {
        hours = parseFloat(record.totalHours);
      } else if (record.workingHours) {
        hours = parseFloat(record.workingHours);
      } else if (record.hours) {
        hours = parseFloat(record.hours);
      } else if (record.checkInTime && record.checkOutTime) {
        const cin = new Date(record.checkInTime);
        const cout = new Date(record.checkOutTime);
        hours = (cout - cin) / (1000 * 60 * 60);
      }
      const existing = attendanceMap.get(dateKey) || 0;
      attendanceMap.set(dateKey, existing + hours);
    }
  });

  const isLeaveDay = (date) => {
    if (!date || !employeeId) return false;
    const leaves = employeeLeavesData?.[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = formatDateLocal(date);
    return leaves.leaveDetails.some(leave => {
      const startStr = formatDateLocal(leave.startDate);
      const endStr = formatDateLocal(leave.endDate);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const weeklyBreakdown = [];
  let currentWeekStart = new Date(firstDay);
  while (currentWeekStart.getDay() !== 1) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 1);
  }

  let weekNumber = 1;
  let eligibleWeeks = 0;
  let totalWorkingDays = 0;
  let totalLeaves = 0;
  let totalPresentDaysCount = 0;
  let totalHalfDaysCount = 0;

  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    let presentDays = 0;
    let halfDays = 0;
    let leavesCount = 0;
    let weekOffDays = 0;
    let totalDays = 0;
    let actualWorkingDaysInWeek = 0;

    for (let d = new Date(currentWeekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (d < firstDay || d > lastDay) continue;
      
      const dateKey = formatDateLocal(d);
      const dayOfWeek = d.getDay();
      const isWeekOff = (dayOfWeek === weekOffDayNum);
      
      totalDays++;

      if (isWeekOff) {
        weekOffDays++;
        continue;
      }
      
      actualWorkingDaysInWeek++;

      if (isLeaveDay(d)) {
        leavesCount++;
        totalLeaves++;
        continue;
      }

      const hoursWorked = attendanceMap.get(dateKey);
      if (hoursWorked !== undefined) {
        if (hoursWorked >= shiftHours * 0.8) {
          presentDays++;
          totalPresentDaysCount += 1;
          totalWorkingDays += 1;
        } else {
          halfDays += 0.5;
          totalHalfDaysCount += 1;
          totalWorkingDays += 0.5;
        }
      }
    }

    const effectiveWorkingDays = presentDays + halfDays + leavesCount;
    
    let isEligibleForWeekoff = false;
    if (totalDays === 7) {
      isEligibleForWeekoff = effectiveWorkingDays >= 5;
    } else {
      const employeeAttendedDays = presentDays + halfDays;
      isEligibleForWeekoff = (employeeAttendedDays >= actualWorkingDaysInWeek) && (actualWorkingDaysInWeek >= 3);
    }

    weeklyBreakdown.push({
      weekNumber: weekNumber,
      daysInMonth: totalDays,
      presentDays: presentDays,
      halfDays: halfDays,
      leaves: leavesCount,
      weekOffDays: weekOffDays,
      effectiveWorkingDays: Math.round(effectiveWorkingDays * 10) / 10,
      isEligibleForWeekoff: isEligibleForWeekoff
    });

    if (isEligibleForWeekoff) {
      eligibleWeeks++;
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  let totalWeekOffDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekOffDayNum) {
      totalWeekOffDays++;
    }
  }

  const totalActiveDays = totalWorkingDays + totalLeaves + holidayDaysInMonth;
  let earnedWeekOffs = Math.max(eligibleWeeks, Math.floor(totalActiveDays / 5));
  earnedWeekOffs = Math.min(earnedWeekOffs, totalWeekOffDays);

  return {
    weeklyBreakdown: weeklyBreakdown,
    earnedWeekOffs: earnedWeekOffs,
    totalWeekOffDays: totalWeekOffDays,
    totalWorkingDays: totalWorkingDays,
    totalPresentDays: totalPresentDaysCount,
    totalHalfDays: totalHalfDaysCount
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
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const [monthDays, setMonthDays] = useState(30);
  const [employeeCompOffs, setEmployeeCompOffs] = useState({});
  const [compOffDetails, setCompOffDetails] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [monthInfo, setMonthInfo] = useState({
    isHistorical: false,
    isCurrent: false,
    includeWeekOff: false,
    canDownload: false
  });
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  const recordsPerPage = 10;
  const BASE_URL = "https://api.timelyhealth.in";
  const ATTENDANCE_SUMMARY_API_URL = `${BASE_URL}/api/attendancesummary/get`;
  const ATTENDANCE_DETAILS_API_URL = `${BASE_URL}/api/attendance/allattendance`;
  const LEAVES_API_URL = `${BASE_URL}/api/leaves/leaves?status=approved`;
  const COMPOFF_API_URL = `${BASE_URL}/api/leaves/comp-offs`;
  const EMPLOYEES_API_URL = `${BASE_URL}/api/employees/get-employees`;

  useEffect(() => {
    const savedTemplate = localStorage.getItem("payrollTemplateConfig");
    if (savedTemplate) {
      try {
        setTemplateConfig(JSON.parse(savedTemplate));
      } catch (e) {}
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
        ...userData,
        ...employeeData,
        employeeId: String(employeeId).trim(),
        email: employeeEmail,
        name: employeeName
      };
    } catch (e) {
      return {};
    }
  };

  const isHistoricalMonth = (month) => {
    if (!month) return false;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    if (year < currentYear) return true;
    if (year === currentYear && monthNum < currentMonth) return true;
    return false;
  };

  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    return year === currentYear && monthNum === currentMonth;
  };

  const shouldIncludeWeekOffInSalary = (month) => {
    if (!month) return false;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const [year, monthNum] = month.split('-').map(Number);
    if (year < currentYear) return true;
    if (year === currentYear && monthNum < currentMonth) return true;
    if (year === currentYear && monthNum === currentMonth) {
      return currentDay >= 26;
    }
    return false;
  };

  const isPayslipDownloadAllowed = (month) => {
    if (!month) return false;
    if (isHistoricalMonth(month)) return true;
    if (isCurrentMonth(month)) {
      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = getDaysInMonth(month);
      return currentDay >= daysInMonth;
    }
    return true;
  };

  const getCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Helper to process leaves for given month
  const processLeavesDataForMonth = (leavesData, targetMonth) => {
    const leavesMap = {};
    const [year, monthNum] = targetMonth.split('-').map(Number);
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
        leavesMap[employeeId] = {
          CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: []
        };
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

  // Main Salary Computation for a given employee & month
  const computeSalaryForEmployeeAndMonth = async (emp, targetMonth, allLeaves, allHolidays, allCompOffs, allOTClaims, summaryData, allAttendanceRecords) => {
    const [year, monthNum] = targetMonth.split('-').map(Number);
    const daysInMonthValue = getDaysInMonth(targetMonth);
    const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(targetMonth);
    const isHistorical = isHistoricalMonth(targetMonth);
    const isCurrent = isCurrentMonth(targetMonth);
    const canDownload = isPayslipDownloadAllowed(targetMonth);

    // 1. Process leaves
    const currentLeavesMap = processLeavesDataForMonth(allLeaves, targetMonth);

    // 2. Holidays
    let holidayCount = 0;
    if (Array.isArray(allHolidays)) {
      allHolidays.forEach(h => {
        if (h.isActive !== false) {
          const hStartStr = h.fromDate;
          const hEndStr = h.toDate;
          if (hStartStr && hStartStr.startsWith(`${year}-${String(monthNum).padStart(2, '0')}`) &&
              hEndStr && hEndStr.startsWith(`${year}-${String(monthNum).padStart(2, '0')}`)) {
            holidayCount += h.totalDays || 1;
          } else if (hStartStr && hEndStr) {
            const hStart = new Date(hStartStr);
            const hEnd = new Date(hEndStr);
            const startOfMonth = new Date(year, monthNum - 1, 1);
            const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);
            const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
            const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
            if (overlapStart <= overlapEnd) {
              const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
              holidayCount += Math.max(1, days);
            }
          }
        }
      });
    }

    // 3. Comp-offs
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);
    let compOffEarned = 0;
    if (Array.isArray(allCompOffs)) {
      allCompOffs.forEach(co => {
        if (co.status === "approved" && String(co.employeeId).trim() === String(emp.employeeId).trim()) {
          const workDate = new Date(co.workDate);
          if (workDate >= startOfMonth && workDate <= endOfMonth) {
            compOffEarned += 1;
          }
        }
      });
    }
    const leavesObj = currentLeavesMap[emp.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const totalLeavesCount = (leavesObj.CL || 0) + (leavesObj.EL || 0) + (leavesObj.COFF || 0) + (leavesObj.Other || 0);
    const compOffUsed = Math.min(compOffEarned, totalLeavesCount);
    const compOffBalance = compOffEarned - compOffUsed;

    // 4. Attendance Summary & Details
    const summary = (summaryData || []).find(x => String(x.employeeId).trim() === String(emp.employeeId).trim()) || {};
    const attendanceForEmployee = (allAttendanceRecords || []).filter(r => String(r.employeeId).trim() === String(emp.employeeId).trim());

    // 5. Week-offs Calculation
    const weekOffDay = emp.weekOffDay || 'Sunday';
    const weekOffData = calculateEarnedWeekOffs(
      emp.employeeId,
      year,
      monthNum,
      attendanceForEmployee,
      currentLeavesMap,
      weekOffDay,
      emp.shiftHours || 8,
      holidayCount
    );

    const deptLower = (emp.department || '').toLowerCase().trim();
    const isDevOrMarketing = deptLower.includes("developer") || deptLower.includes("digital marketing") || deptLower.includes("development");
    const isSpecialDept = ["laboratory medicine", "nursing", "medical"].includes(deptLower) || deptLower.includes("laboratory") || deptLower.includes("nursing") || deptLower.includes("medical");

    let earnedWeekOffs = weekOffData.earnedWeekOffs;
    let defaultWeekOffs = emp.weekOffPerMonth || 4;
    if (isDevOrMarketing) {
      defaultWeekOffs = weekOffData.totalWeekOffDays || 5;
      earnedWeekOffs = defaultWeekOffs;
    } else if (isSpecialDept) {
      defaultWeekOffs = 4;
    }
    const finalWeekOffs = Math.min(earnedWeekOffs, defaultWeekOffs);

    // 6. Salary for Month
    let salaryForMonth = emp.salaryPerMonth || emp.salary || 0;
    let originalSalary = emp.originalSalary || emp.salaryPerMonth || salaryForMonth;
    let incrementDetails = null;

    if (emp._id) {
      try {
        const targetDate = new Date(year, monthNum - 1, 15);
        const formattedDate = targetDate.toISOString().split('T')[0];
        const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
        if (salaryRes.ok) {
          const sData = await salaryRes.json();
          if (sData.success && sData.data) {
            salaryForMonth = sData.data.salaryPerMonth || salaryForMonth;
            originalSalary = sData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth || salaryForMonth;
            incrementDetails = sData.data.incrementDetails;
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
      }
    }

    const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
    
    // Check present days count
    let presentDaysCount = summary.presentDays;
    if (presentDaysCount === undefined || presentDaysCount === null || (presentDaysCount === 0 && weekOffData.totalPresentDays > 0)) {
      presentDaysCount = weekOffData.totalPresentDays || 0;
    }
    
    let halfDaysCount = summary.halfDayWorking;
    if (halfDaysCount === undefined || halfDaysCount === null) {
      halfDaysCount = weekOffData.totalHalfDays || 0;
    }
    
    let totalWorkingDays = summary.totalWorkingDays;
    if (totalWorkingDays === undefined || totalWorkingDays === null) {
      totalWorkingDays = presentDaysCount + (halfDaysCount * 0.5);
    }
    
    const fullDayNotWorking = summary.fullDayNotWorking ?? 0;
    const overTimeHours = summary.overTimeHours ?? 0;

    // 7. Carry-Forward Logic
    const expectedWorkingDays = daysInMonthValue - finalWeekOffs;
    const actualDaysWorked = presentDaysCount + (halfDaysCount * 0.5);

    const prevMonth = getPreviousMonth(targetMonth);
    const prevCarryForward = prevMonth
      ? parseFloat(localStorage.getItem(getCarryForwardKey(emp.employeeId, prevMonth)) || '0')
      : 0;

    const adjustedActualDays = actualDaysWorked + prevCarryForward;

    let payablePresentDays, carryForwardDays;
    if (adjustedActualDays > expectedWorkingDays) {
      payablePresentDays = expectedWorkingDays;
      carryForwardDays = Math.round((adjustedActualDays - expectedWorkingDays) * 100) / 100;
    } else {
      payablePresentDays = adjustedActualDays;
      carryForwardDays = 0;
    }

    if (isSpecialDept) {
      carryForwardDays = Math.round((carryForwardDays + holidayCount) * 100) / 100;
    }

    localStorage.setItem(getCarryForwardKey(emp.employeeId, targetMonth), String(carryForwardDays));

    let calculatedSalary = 0;
    if (salaryForMonth > 0 && daysInMonthValue > 0) {
      const holidayAddition = isSpecialDept ? 0 : holidayCount;
      const effectivePaidDays = payablePresentDays + (includeWeekOffInSalary ? finalWeekOffs : 0) + holidayAddition + compOffBalance;
      calculatedSalary = effectivePaidDays * dailyRate;
    }

    // 8. Overtime calculation
    let totalOTHours = overTimeHours || 0;
    let calculatedOTHours = 0;
    attendanceForEmployee.forEach(record => {
      if (record.checkInTime) {
        const recordMonth = new Date(record.checkInTime).toISOString().slice(0, 7);
        if (recordMonth !== targetMonth) return;
      }
      let hoursWorked = 0;
      if (record.hours) {
        hoursWorked = parseFloat(record.hours);
      } else if (record.totalHours) {
        hoursWorked = parseFloat(record.totalHours);
      } else if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(record.checkInTime);
        const checkOut = new Date(record.checkOutTime);
        hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
      }
      const shiftHrs = emp.shiftHours || 8;
      if (hoursWorked > shiftHrs) {
        calculatedOTHours += (hoursWorked - shiftHrs);
      }
    });

    if (totalOTHours === 0 && calculatedOTHours > 0) {
      totalOTHours = calculatedOTHours;
    }
    totalOTHours = Number(totalOTHours.toFixed(2));
    const formattedOTHours = formatDecimalHours(totalOTHours);

    // OT claims for target month
    const [startYear, startMonth] = targetMonth.split('-').map(Number);
    const mStart = new Date(startYear, startMonth - 1, 1);
    const mEnd = new Date(startYear, startMonth, 0);

    const empOTClaims = (allOTClaims || []).filter(c => {
      if (String(c.employeeId).trim() !== String(emp.employeeId).trim()) return false;
      const cDate = new Date(c.date);
      return cDate >= mStart && cDate <= mEnd;
    });

    let approvedOTAmount = 0;
    let approvedOTHours = 0;
    empOTClaims.forEach(claim => {
      approvedOTAmount += claim.otAmount || 0;
      approvedOTHours += claim.otHours || 0;
    });

    const baseCalculatedSalary = Math.round(calculatedSalary);
    let finalOTAmount = 0;
    let finalPay = baseCalculatedSalary;

    if (approvedOTAmount > 0) {
      finalOTAmount = approvedOTAmount;
      finalPay = Math.round(baseCalculatedSalary + approvedOTAmount);
    } else {
      const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
      const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
      const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";
      
      if (totalOTHours > 0 && (savedOTEmps.has(emp.employeeId) || isApprovedInOTPage)) {
        const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
        const otRatePerHour = dailyRate / (emp.shiftHours || 8);
        const otAmount = totalOTHours * otRatePerHour * multiplier;
        finalOTAmount = otAmount;
        finalPay = Math.round(baseCalculatedSalary + otAmount);
      }
    }

    let extraWork = summary.extraWork || null;
    if (summary.calculatedSalary !== undefined && summary.calculatedSalary !== null && summary.extraWork) {
      calculatedSalary = summary.calculatedSalary;
      finalPay = summary.calculatedSalary;
    }

    // Build employee data object
    const empData = {
      employeeId: emp.employeeId,
      name: emp.name,
      department: emp.department || 'N/A',
      designation: emp.designation || emp.role || 'N/A',
      role: emp.role || emp.designation || 'N/A',
      month: targetMonth,
      monthFormatted: formatMonthDisplay(targetMonth),
      
      presentDays: presentDaysCount,
      halfDays: halfDaysCount,
      halfDayWorking: halfDaysCount,
      totalWorkingDays: totalWorkingDays,
      workingDays: totalWorkingDays,
      fullDayNotWorking: fullDayNotWorking,
      overTimeHours: totalOTHours,
      overTimeHoursFormatted: formattedOTHours,
      
      weekOffs: finalWeekOffs,
      earnedWeekOffs: earnedWeekOffs,
      defaultWeekOffs: defaultWeekOffs,
      targetWeekOffCount: defaultWeekOffs,
      weekOffDay: weekOffDay,
      weeklyBreakdown: weekOffData.weeklyBreakdown,
      
      salaryPerMonth: salaryForMonth,
      currentSalary: emp.salaryPerMonth,
      originalSalary: originalSalary,
      salaryPerDay: dailyRate.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
      calculatedSalary: Math.round(calculatedSalary),
      baseCalculatedSalary: baseCalculatedSalary,
      
      shiftHours: emp.shiftHours || 8,
      finalOTAmount: Math.round(finalOTAmount),
      otAmount: Math.round(finalOTAmount),
      finalPay: finalPay,
      hasApprovedOT: approvedOTAmount > 0,
      approvedOTAmount: approvedOTAmount,
      approvedOTHours: approvedOTHours,
      
      holidayCount: holidayCount,
      monthDays: daysInMonthValue,
      includeWeekOffInSalary: includeWeekOffInSalary,
      isHistoricalMonth: isHistorical,
      isCurrentMonth: isCurrent,
      canDownload: canDownload,
      incrementDetails: incrementDetails,
      
      _id: emp._id,
      
      basicPay: emp.basicPay,
      hra: emp.hra,
      conveyanceAllowance: emp.conveyanceAllowance,
      medicalAllowance: emp.medicalAllowance,
      performanceAllowance: emp.performanceAllowance,
      specialAllowance: emp.specialAllowance,
      gmcAmount: emp.gmc || emp.gmcAmount,
      ptax: emp.profTax || emp.ptax,
      otherDeductions: emp.otherDeductions,
      bankAccount: emp.bankAccount || emp.bankAccountNo || '',
      bankName: emp.bankName || '',
      panNo: emp.panCard || emp.panNumber || '',
      pfNo: emp.pfNumber || emp.pfNo || '',
      uanNo: emp.uanNumber || emp.uanNo || '',
      esicNo: emp.esicNumber || emp.esicNo || '',
      branch: emp.branch || '',
      joiningDate: emp.joinDate || emp.joiningDate || '',
      location: emp.location || 'HYDERABAD',
      
      compOffEarned: compOffEarned,
      compOffUsed: compOffUsed,
      compOffBalance: compOffBalance,
      totalLeaves: totalLeavesCount,
      leavesBreakdown: leavesObj,
      
      expectedWorkingDays: expectedWorkingDays,
      payablePresentDays: payablePresentDays,
      carryForwardDays: carryForwardDays,
      carryForwardFromPrev: prevCarryForward,
      extraWork: extraWork
    };

    return empData;
  };

  const processCompOffData = useCallback(async (selectedMonthStr, leavesData) => {
    try {
      const currentEmployee = getCurrentEmployee();
      const currentEmployeeId = currentEmployee?.employeeId;
      
      if (!currentEmployeeId) {
        return {};
      }

      const [year, monthNum] = (selectedMonthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

      const response = await axios.get(COMPOFF_API_URL);
      const compOffs = response.data || [];

      const compOffMap = {};
      const compOffDetailsMap = {};

      for (const co of compOffs) {
        if (co.status === "approved" && co.employeeId === currentEmployeeId) {
          const workDate = new Date(co.workDate);
          if (workDate >= startOfMonth && workDate <= endOfMonth) {
            if (!compOffMap[currentEmployeeId]) {
              compOffMap[currentEmployeeId] = { earned: 0, used: 0, balance: 0 };
              compOffDetailsMap[currentEmployeeId] = [];
            }
            compOffMap[currentEmployeeId].earned += 1;
            compOffDetailsMap[currentEmployeeId].push({
              type: 'earned',
              date: co.workDate,
              reason: co.reason || 'Comp-off earned'
            });
          }
        }
      }

      const leaves = leavesData?.[currentEmployeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
      const totalLeaves = (leaves.CL || 0) + (leaves.EL || 0) + (leaves.COFF || 0) + (leaves.Other || 0);
      const earned = compOffMap[currentEmployeeId]?.earned || 0;
      const used = Math.min(earned, totalLeaves);
      const balance = earned - used;
      
      if (compOffMap[currentEmployeeId]) {
        compOffMap[currentEmployeeId].used = used;
        compOffMap[currentEmployeeId].balance = balance;
      }

      setEmployeeCompOffs(compOffMap);
      setCompOffDetails(compOffDetailsMap);
      return compOffMap;
      
    } catch (error) {
      console.error("Error fetching comp-offs:", error);
      return {};
    }
  }, []);

  const getLeaveTypes = (employee) => {
    const leaves = employee.leavesBreakdown || { CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];
    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL}`);
    if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL}`);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL}`);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF}`);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP}`);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other}`);
    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  // Main fetch function
  const fetchSalaryData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      const loggedEmployee = getCurrentEmployee();
      const currentEmployeeId = loggedEmployee?.employeeId;

      // Fetch master employees list and reference data
      const [empRes, leavesRes, holidaysRes, compOffRes, otClaimsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees/get-employees`),
        fetch(`${API_BASE_URL}/leaves/leaves?status=approved`),
        fetch(`${API_BASE_URL}/holidays/all`),
        fetch(`${API_BASE_URL}/leaves/comp-offs`),
        fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`)
      ]);

      let employeesData = [];
      if (empRes.ok) {
        const raw = await empRes.json();
        employeesData = Array.isArray(raw) ? raw : (raw.data || []);
      }

      const allLeaves = leavesRes.ok ? await leavesRes.json() : [];
      const allHolidays = holidaysRes.ok ? await holidaysRes.json() : [];
      const allCompOffs = compOffRes.ok ? await compOffRes.json() : [];
      
      let allOTClaims = [];
      if (otClaimsRes.ok) {
        const otJson = await otClaimsRes.json();
        allOTClaims = otJson.claims || [];
      }

      // Find full employee matching employeeId or email
      let fullEmp = employeesData.find(e => 
        String(e.employeeId).trim().toLowerCase() === String(currentEmployeeId).trim().toLowerCase() ||
        (loggedEmployee.email && e.email && e.email.toLowerCase() === loggedEmployee.email.toLowerCase())
      );

      if (!fullEmp) {
        if (employeesData.length > 0) {
          fullEmp = employeesData[0];
        } else {
          fullEmp = loggedEmployee;
        }
      }

      // Determine months to compute
      let monthsToCompute = [];
      if (month) {
        monthsToCompute = [month];
      } else {
        // Collect current month + past 11 months
        const cur = new Date();
        for (let i = 0; i < 12; i++) {
          const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
          const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          
          if (fullEmp.joinDate || fullEmp.joiningDate) {
            const jDate = new Date(fullEmp.joinDate || fullEmp.joiningDate);
            const jYear = jDate.getFullYear();
            const jMonth = jDate.getMonth() + 1;
            const [cYear, cMonth] = mStr.split('-').map(Number);
            if (cYear < jYear || (cYear === jYear && cMonth < jMonth)) {
              continue;
            }
          }
          monthsToCompute.push(mStr);
        }
      }

      if (monthsToCompute.length === 0) {
        monthsToCompute = [getCurrentMonth()];
      }

      // Compute salary records for each month in parallel
      const recordsPromises = monthsToCompute.map(async (m) => {
        let summaryData = [];
        try {
          const sumRes = await fetch(`${API_BASE_URL}/attendancesummary/get?month=${m}`);
          if (sumRes.ok) {
            const sumJson = await sumRes.json();
            summaryData = sumJson.summary || [];
          }
        } catch (e) {}

        let allAttendanceRecords = [];
        try {
          const attRes = await fetch(`${API_BASE_URL}/attendance/allattendance?month=${m}&employeeId=${fullEmp.employeeId}`);
          if (attRes.ok) {
            const attJson = await attRes.json();
            allAttendanceRecords = attJson.records || [];
          }
        } catch (e) {}

        return computeSalaryForEmployeeAndMonth(
          fullEmp,
          m,
          allLeaves,
          allHolidays,
          allCompOffs,
          allOTClaims,
          summaryData,
          allAttendanceRecords
        );
      });

      const recordsList = await Promise.all(recordsPromises);

      // Sort newest month first
      recordsList.sort((a, b) => b.month.localeCompare(a.month));

      if (isMounted) {
        setRecords(recordsList);
        setFilteredRecords(recordsList);
      }

      // Set month info
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

  // ============================================
  // 📄 generateInvoiceHTML
  // ============================================
  const generateInvoiceHTML = (employee) => {
    if (!employee.salaryPerMonth || employee.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; text-align: center; }
            .error { color: #000; font-size: 18px; margin-top: 100px; border: 1px solid #000; padding: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Salary Data Not Available</h2>
            <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
            <p>Please contact HR department.</p>
          </div>
        </body>
        </html>
      `;
    }

    const daysInMonth = employee.monthDays || getDaysInMonth(employee.month);
    const dailyRate = parseFloat(employee.dailyRate) || 0;
    const presentDays = employee.presentDays ?? 0;
    const halfDays = employee.halfDays || employee.halfDayWorking || 0;
    const holidays = employee.holidayCount || 0;
    const actualWeekOffDaysNumeric = employee.weekOffs || 0;
    const compOffBalance = employee.compOffBalance || 0;

    // Earnings items
    const earningsItems = [];
    const basicAmt = employee.basicPay || employee.salaryPerMonth || 0;
    if (basicAmt > 0) earningsItems.push({ label: 'Basic DA', amount: basicAmt });
    
    const hraAmt = employee.hra || 0;
    if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });
    
    const convAmt = employee.conveyanceAllowance || 0;
    if (convAmt > 0) earningsItems.push({ label: 'Conveyance', amount: convAmt });
    
    const specialAmt = employee.specialAllowance || 0;
    if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });
    
    const otAmount = employee.otAmount || 0;
    if (otAmount > 0) {
      earningsItems.push({ label: 'Overtime', amount: otAmount });
    }
    
    const compOffPay = compOffBalance * dailyRate;
    if (compOffPay > 0) {
      earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
    }

    earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
    earningsItems.push({ label: `Week Off Days (${actualWeekOffDaysNumeric})`, amount: 0, isInfo: true });
    
    if (holidays > 0) {
      earningsItems.push({ label: `Public Holidays (${holidays})`, amount: 0, isInfo: true });
    }

    // Deductions items
    const deductionsItems = [];
    
    let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays + compOffBalance;
    let lopDays = Math.max(0, daysInMonth - totalPaidDays);
    let lopAmount = lopDays * dailyRate;
    lopDays = Math.round(lopDays * 10) / 10;
    lopAmount = Math.round(lopAmount * 100) / 100;
    
    if (lopDays > 0) {
      deductionsItems.push({ label: `LOP / Absent (${lopDays} days)`, amount: lopAmount });
    } else {
      deductionsItems.push({ label: `LOP / Absent (0 days)`, amount: 0 });
    }
    
    const halfDayDeductionAmount = (halfDays * 0.5) * dailyRate;
    if (halfDays > 0) {
      deductionsItems.push({ label: `Half Day Deductions (${halfDays} HD)`, amount: halfDayDeductionAmount });
    } else {
      deductionsItems.push({ label: `Half Day Deductions (0 HD)`, amount: 0 });
    }
    
    const gmcAmt = employee.gmcAmount || 0;
    const ptaxAmt = employee.ptax || 0;
    const extraDeductions = (employee.extraWork?.deductions || 0) + (employee.otherDeductions || 0);
    let totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;
    
    deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });

    const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
    const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);
    const finalNetPay = totalEarningsAmt - totalDeductionsAmt;

    let tableRowsHTML = '';
    const maxRows = Math.max(earningsItems.length, deductionsItems.length);
    for (let i = 0; i < maxRows; i++) {
      const earn = earningsItems[i];
      const ded = deductionsItems[i];
      
      let earnLabel = '';
      let earnAmountStr = '';
      if (earn) {
        earnLabel = earn.label;
        if (earn.isInfo) {
          earnAmountStr = '-';
        } else {
          earnAmountStr = `₹${earn.amount.toFixed(2)}`;
        }
      }
      
      let dedLabel = '';
      let dedAmountStr = '';
      if (ded) {
        dedLabel = ded.label;
        dedAmountStr = `₹${ded.amount.toFixed(2)}`;
      }
      
      tableRowsHTML += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px 8px; font-size: 12px; color: #000;">${earnLabel}</td>
          <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-size: 12px; color: #000;">${earnAmountStr}</td>
          <td style="border: 1px solid #000; padding: 6px 8px; font-size: 12px; color: #000;">${dedLabel}</td>
          <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-size: 12px; color: #000;">${dedAmountStr}</td>
        </tr>
      `;
    }

    const numberToWords = (num) => {
      if (num === 0) return 'Zero Rupees Only';
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
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

    const getImageSrc = (imgData) => {
      if (!imgData) return '';
      if (imgData.startsWith('data:image')) return imgData;
      if (imgData.startsWith('http') || imgData.startsWith('https')) return imgData;
      if (imgData.startsWith('/')) {
        return window.location.origin + imgData;
      }
      if (imgData.startsWith('blob:')) return imgData;
      if (imgData.length > 100 && !imgData.includes(' ')) {
        if (imgData.startsWith('iVBOR')) {
          return 'data:image/png;base64,' + imgData;
        }
        if (imgData.startsWith('/9j/')) {
          return 'data:image/jpeg;base64,' + imgData;
        }
        return 'data:image/png;base64,' + imgData;
      }
      return imgData;
    };

    const logoData = templateConfig?.logo || logo || '';
    const logoImgSrc = getImageSrc(logoData);
    const stampData = companyStamp || '';
    const stampImgSrc = getImageSrc(stampData);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payslip - ${employee.name}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
            .invoice-container { max-width: 210mm; margin: 0 auto; border: 1px solid #000; border-radius: 4px; padding: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; border: 1px solid #000; font-size: 12px; vertical-align: top; color: #000; }
            .header-cell { border: none !important; padding: 12px; border-bottom: 1px solid #000 !important; }
            .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; color: #000; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .gross-row { font-weight: bold; background: #f0f0f0; }
            .logo-image { height: 80px; width: auto; max-width: 200px; object-fit: contain; display: block; }
            .stamp-image { width: 90px; height: auto; opacity: 0.8; display: block; }
            .company-info { flex: 1; text-align: center; padding: 0 10px; }
            .company-name { margin: 0; font-size: 16px; font-weight: bold; color: #000; }
            .company-address { margin: 2px 0 0; font-size: 7px; line-height: 1.4; color: #000; }
            .header-wrapper { display: flex; align-items: center; justify-content: space-between; width: 100%; }
            .logo-wrapper { width: 200px; flex-shrink: 0; display: flex; justify-content: flex-start; align-items: center; }
            .stamp-wrapper { width: 200px; flex-shrink: 0; }
            .stamp-bottom { display: flex; justify-content: flex-end; padding: 10px 20px; border-top: 1px solid #000; margin-top: 5px; }
            .stamp-bottom-content { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
            .stamp-auth strong { font-size: 7px; color: #000; display: block; }
            .stamp-auth span { font-size: 6px; color: #000; display: block; }
            .amount-word { font-size: 11px; font-weight: bold; color: #000; padding: 8px 0; text-align: center; }
            .employee-info-table td { padding: 4px 8px; font-size: 11px; border: 1px solid #000; color: #000; }
            .employee-info-table .label { font-weight: bold; color: #000; background-color: #f9f9f9; width: 18%; }
            .employee-info-table .value { color: #000; width: 32%; }
            .employee-info-table .label-alt { font-weight: bold; color: #000; background-color: #f9f9f9; width: 18%; }
            .employee-info-table .value-alt { color: #000; width: 32%; }
            .net-pay-amount { font-size: 14px; color: #000; font-weight: bold; }
            @media print {
              body { padding: 10px; }
              .invoice-container { border: 1px solid #000; }
              .logo-image, .stamp-image {
                display: block !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            
            <!-- HEADER -->
            <table>
              <tr>
                <td colspan="6" class="header-cell">
                  <div class="header-wrapper">
                    <div class="logo-wrapper">
                      ${logoImgSrc ? `
                        <img 
                          src="${logoImgSrc}" 
                          alt="Logo" 
                          class="logo-image" 
                          onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'font-size:18px; font-weight:bold; color:#000;\\'>Timely Healthtech</div>';"
                          crossorigin="anonymous"
                        />
                      ` : `
                        <div style="font-size:18px; font-weight:bold; color:#000;">Timely Healthtech</div>
                      `}
                    </div>
                    <div class="company-info">
                      <h2 class="company-name">Timely Healthtech Private Limited</h2>
                      <p class="company-address">
                        Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081
                      </p>
                    </div>
                    <div class="stamp-wrapper"></div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="6" class="section-header">PAYSLIP FOR ${formatMonthDisplay(employee.month).toUpperCase()}</td>
              </tr>
            </table>

            <!-- EMPLOYEE INFO -->
            <table class="employee-info-table">
              <tr>
                <td class="label"><strong>Name:</strong></td>
                <td class="value">${employee.name || '-'}</td>
                <td class="label-alt"><strong>Employee No:</strong></td>
                <td class="value-alt">${employee.employeeId || '-'}</td>
              </tr>
              <tr>
                <td class="label"><strong>Joining Date:</strong></td>
                <td class="value">${employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
                <td class="label-alt"><strong>Bank Name:</strong></td>
                <td class="value-alt">${employee.bankName || '-'}</td>
              </tr>
              <tr>
                <td class="label"><strong>Designation:</strong></td>
                <td class="value">${employee.designation || employee.role || '-'}</td>
                <td class="label-alt"><strong>Bank Account No:</strong></td>
                <td class="value-alt">${employee.bankAccount || '-'}</td>
              </tr>
              <tr>
                <td class="label"><strong>Department:</strong></td>
                <td class="value">${employee.department || '-'}</td>
                <td class="label-alt"><strong>PAN Number:</strong></td>
                <td class="value-alt">${employee.panNo || '-'}</td>
              </tr>
              <tr>
                <td class="label"><strong>Location:</strong></td>
                <td class="value">${employee.location || 'HYDERABAD'}</td>
                <td class="label-alt"><strong>EMP EFFECTIVE</strong></td>
                <td class="value-alt">:30</td>
              </tr>
              <tr>
                <td class="label"><strong>LOP:</strong></td>
                <td class="value">${lopDays > 0 ? lopDays : '0'}</td>
                <td class="label-alt"></td>
                <td class="value-alt"></td>
              </tr>
            </table>

            <!-- EARNINGS & DEDUCTIONS TABLE -->
            <table>
              <tr style="background:#f0f0f0;">
                <td style="width:30%; font-weight: bold; color: #000; border: 1px solid #000; padding: 6px 8px;"><strong>Earnings</strong></td>
                <td style="width:20%; text-align:center; font-weight: bold; color: #000; border: 1px solid #000; padding: 6px 8px;"><strong>Actual</strong></td>
                <td style="width:30%; font-weight: bold; color: #000; border: 1px solid #000; padding: 6px 8px;"><strong>Deductions</strong></td>
                <td style="width:20%; text-align:center; font-weight: bold; color: #000; border: 1px solid #000; padding: 6px 8px;"><strong>Actual</strong></td>
              </tr>
              ${tableRowsHTML}
              
              <tr class="gross-row">
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 12px; color: #000;"><strong>Total Earnings: INR.</strong></td>
                <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-size: 12px; color: #000;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 12px; color: #000;"><strong>Total Deductions.</strong></td>
                <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-size: 12px; color: #000;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
              </tr>
              
              <tr class="total-row net-pay-row">
                <td colspan="2" style="border: 1px solid #000; padding: 6px 8px;"></td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 12px; color: #000;"><strong>Net Pay for the month</strong></td>
                <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-size: 12px; color: #000;"><strong class="net-pay-amount">₹${finalNetPay.toFixed(2)}</strong></td>
              </tr>
              
              <tr>
                <td colspan="4" class="amount-word" style="border: 1px solid #000; padding: 8px; color: #000;">(${amountInWords})</td>
              </tr>
            </table>

            ${(employee.carryForwardDays > 0 || employee.carryForwardFromPrev > 0) ? `
            <table style="margin-top:4px; font-size:11px;">
              ${employee.carryForwardFromPrev > 0 ? `
              <tr>
                <td colspan="4" style="padding:5px 10px; background:#EFF6FF; border:1px solid #BFDBFE; color:#1D4ED8;">
                  ℹ️ <strong>Carry-in from Previous Month:</strong> +${employee.carryForwardFromPrev} day(s) included in this month's payable days.
                </td>
              </tr>` : ''}
              ${employee.carryForwardDays > 0 ? `
              <tr>
                <td colspan="4" style="padding:5px 10px; background:#FFF7ED; border:1px solid #FED7AA; color:#C2410C;">
                  ℹ️ <strong>Carry-forward to Next Month:</strong> ${employee.carryForwardDays} extra day(s) worked beyond expected working days (${employee.expectedWorkingDays || ''} days) will be added to next month's salary.
                </td>
              </tr>` : ''}
            </table>` : ''}

            <!-- STAMP AT BOTTOM -->
            <div class="stamp-bottom">
              <div class="stamp-bottom-content">
                ${stampImgSrc ? `
                  <img 
                    src="${stampImgSrc}" 
                    alt="Company Stamp" 
                    class="stamp-image" 
                    onerror="this.style.display='none';"
                    crossorigin="anonymous"
                  />
                ` : ''}
                <div class="stamp-auth">
                  <strong>Authorized Signatory</strong>
                  <span>Timely Healthtech Private Limited</span>
                </div>
              </div>
            </div>

          </div>
        </body>
      </html>
    `;
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
              <button type="button" className="emp-dash__card-link" onClick={() => fetchSalaryData(selectedMonth)}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // FIXED: Calculate total salary using calculatedSalary instead of finalPay
  const totalSalary = filteredRecords.reduce((sum, emp) => {
    const pay = emp.calculatedSalary || emp.baseCalculatedSalary || 0;
    return sum + (typeof pay === 'number' ? pay : 0);
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
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
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
          
          {/* FIXED: Total Net Pay showing calculatedSalary sum */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Net Pay</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiDollarSign />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {totalSalary > 0 ? (
                <CountUp 
                  end={Math.round(totalSalary)} 
                  duration={1.2} 
                  separator="," 
                  prefix="₹"
                />
              ) : (
                '₹0'
              )}
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
              {avgSalary > 0 ? (
                <CountUp 
                  end={avgSalary} 
                  duration={1.2} 
                  separator="," 
                  prefix="₹"
                />
              ) : (
                '₹0'
              )}
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

              <button type="button" className="emp-leaves__btn emp-leaves__btn--primary" onClick={() => { setSelectedMonth(""); fetchSalaryData(""); }}>
                All Months
              </button>

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

        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() < 26 && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-xs font-medium text-yellow-700">⚠️ Current Month (Before 26th) - Week-off will be added after 26th for salary calculation</p>
          </div>
        )}
        {selectedMonth && isCurrentMonth(selectedMonth) && new Date().getDate() >= 26 && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-green-50 border-l-4 border-green-500">
            <p className="text-xs font-medium text-green-700">✓ Current Month (After 26th) - Week-off included in salary calculation</p>
          </div>
        )}
        {selectedMonth && isHistoricalMonth(selectedMonth) && (
          <div className="mb-3 px-3 py-2 rounded-md shadow-sm bg-green-50 border-l-4 border-green-500">
            <p className="text-xs font-medium text-green-700">✓ Historical Month - Full salary with week-off included</p>
          </div>
        )}

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
                      <th>Earned WO</th>
                      <th>Default WO</th>
                      <th>Leaves</th>
                      <th>Comp-off</th>
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
                              {emp.monthDays} days | WO: {emp.defaultWeekOffs || 4}
                            </div>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {emp.presentDays || 0}
                            </span>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {emp.workingDays || emp.totalWorkingDays || 0}
                            </span>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              {emp.halfDays || 0}
                            </span>
                          </td>
                          <td>
                            {(emp.carryForwardDays > 0 || emp.carryForwardFromPrev > 0) ? (
                              <div className="flex flex-col items-center gap-0.5">
                                {emp.carryForwardDays > 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-300" title={`+${emp.carryForwardDays} extra day(s) carried forward`}>
                                    +{emp.carryForwardDays}→
                                  </span>
                                )}
                                {emp.carryForwardFromPrev > 0 && (
                                  <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200" title={`←${emp.carryForwardFromPrev} day(s) carried from previous month`}>
                                    ←{emp.carryForwardFromPrev}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                              {emp.earnedWeekOffs || 0}
                            </span>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
                              {emp.defaultWeekOffs || 4}
                            </span>
                          </td>
                          <td>{emp.totalLeaves || 0}</td>
                          <td>
                            {emp.compOffBalance > 0 ? (
                              <span className="px-1.5 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                +{emp.compOffEarned} / -{emp.compOffUsed} = {emp.compOffBalance}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">{emp.compOffBalance || 0}</span>
                            )}
                          </td>
                          <td>
                            {emp.finalOTAmount > 0 ? (
                              <span className="font-bold text-green-600">₹{emp.finalOTAmount}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td>
                            <div className="font-semibold text-slate-700">₹{(emp.salaryPerMonth || 0).toLocaleString()}</div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--ed-text-muted)" }}>₹{emp.salaryPerDay}/day</div>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className="font-bold text-blue-700" style={{ fontSize: "0.95rem" }}>
                              ₹{Math.round(emp.calculatedSalary || emp.baseCalculatedSalary || 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, color: "var(--ed-success)", fontSize: "1rem" }}>
                              ₹{Math.round(emp.finalPay || emp.calculatedSalary || 0).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <span className={`emp-dash__table-status ${emp.canDownload ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                              {statusText}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="flex justify-end space-x-1.5">
                              <button onClick={() => handleViewDetails(emp)} className="p-1.5 text-blue-600 rounded-md hover:bg-blue-50 border border-blue-100" title="View Details">
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={() => downloadSalarySlip(emp)} 
                                disabled={!emp.canDownload} 
                                className={`p-1.5 rounded-md border ${emp.canDownload ? 'text-purple-600 hover:bg-purple-50 border-purple-100' : 'text-gray-300 border-gray-100 cursor-not-allowed'}`}
                                title="Download Payslip"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {currentRecords.map((emp, idx) => {
                  const statusText = emp.canDownload ? "Available" : "From Last Day";
                  return (
                    <div key={idx} className="emp-dash__mobile-item">
                      <div className="emp-dash__mobile-item-top">
                        <div className="emp-dash__mobile-date">{emp.monthFormatted || formatMonthDisplay(emp.month)}</div>
                        <span className={`emp-dash__table-status ${emp.canDownload ? "emp-dash__table-status--present" : "emp-dash__table-status--other"}`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="emp-dash__mobile-grid">
                        <div className="emp-dash__mobile-field">
                          <span>Final Pay</span>
                          <span style={{ fontWeight: 800, color: "var(--ed-success)" }}>₹{Math.round(emp.finalPay || emp.calculatedSalary || 0).toLocaleString()}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Calculated Base</span>
                          <span style={{ fontWeight: 700, color: "var(--ed-primary)" }}>₹{Math.round(emp.calculatedSalary || emp.baseCalculatedSalary || 0).toLocaleString()}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Monthly Base</span>
                          <span>₹{(emp.salaryPerMonth || 0).toLocaleString()}</span>
                        </div>
                        <div className="emp-dash__mobile-field">
                          <span>Days (P/W/H/WO)</span>
                          <span>{emp.presentDays || 0}/{emp.workingDays || 0}/{emp.halfDays || 0}/{emp.weekOffs || 0}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.75rem", borderTop: "1px solid var(--ed-border-light)", paddingTop: "0.5rem" }}>
                        <button 
                          onClick={() => handleViewDetails(emp)} 
                          className="emp-leaves__btn emp-leaves__btn--ghost"
                          style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button 
                          onClick={() => downloadSalarySlip(emp)} 
                          disabled={!emp.canDownload} 
                          className={`emp-leaves__btn ${emp.canDownload ? 'emp-leaves__btn--primary' : 'emp-leaves__btn--ghost'}`}
                          style={{ height: "2rem", padding: "0 0.75rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", opacity: emp.canDownload ? 1 : 0.5 }}
                        >
                          <Download size={12} /> Slip
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--ed-border-light)" }}>
              <div>
                <h3 className="text-base font-bold text-gray-800">Salary Details - {selectedEmployee.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedEmployee.monthFormatted || formatMonthDisplay(selectedEmployee.month)}
                </p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-start space-x-4 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full shrink-0 text-base">
                  {selectedEmployee.name?.charAt(0) || 'E'}
                </div>
                <div className="flex flex-col flex-1 space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-800">{selectedEmployee.name}</h4>
                  <div className="grid grid-cols-2 text-xs text-gray-500 gap-x-4 gap-y-0.5">
                    <p><span className="font-medium text-gray-700">Emp ID:</span> {selectedEmployee.employeeId}</p>
                    <p><span className="font-medium text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Month Days:</span> {selectedEmployee.monthDays} | WO: {selectedEmployee.defaultWeekOffs || 4}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 text-xs sm:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Present Days</span><span className="font-bold text-emerald-700">{selectedEmployee.presentDays || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Working Days</span><span className="font-bold text-blue-700">{selectedEmployee.totalWorkingDays || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Half Days</span><span className="font-bold text-amber-700">{selectedEmployee.halfDays || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Earned Weekoffs</span><span className="font-bold text-green-700">{selectedEmployee.earnedWeekOffs || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Default Weekoffs</span><span className="font-bold text-gray-600">{selectedEmployee.defaultWeekOffs || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">WeekOff Days Paid</span><span className="font-bold text-purple-700">{selectedEmployee.weekOffs || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Expected Working Days</span><span className="font-bold text-slate-600">{selectedEmployee.expectedWorkingDays}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Payable Present Days</span><span className="font-bold text-blue-700">{selectedEmployee.payablePresentDays}</span></div>
                
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Monthly Assigned Salary</span>
                  <span className="font-bold text-slate-800">₹{(selectedEmployee.salaryPerMonth || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Daily Rate</span><span className="font-bold text-slate-700">₹{selectedEmployee.dailyRate}/day</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500">OT Amount</span><span className="font-bold text-emerald-600">₹{selectedEmployee.finalOTAmount || 0}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-gray-500 font-medium text-blue-600">Calculated Base Salary</span><span className="font-bold text-blue-600">₹{Math.round(selectedEmployee.calculatedSalary || selectedEmployee.baseCalculatedSalary || 0).toLocaleString()}</span></div>
                <div className="flex justify-between py-1 border-b border-gray-100 sm:col-span-2 bg-green-50/60 px-2 rounded"><span className="text-gray-800 font-bold text-sm">Final Net Payout</span><span className="font-extrabold text-emerald-700 text-sm">₹{Math.round(selectedEmployee.finalPay || selectedEmployee.calculatedSalary || 0).toLocaleString()}</span></div>
                
                <div className="flex flex-col py-1 border-b border-gray-100 sm:col-span-2">
                  <div className="flex justify-between"><span className="text-gray-500">Approved Leaves</span><span className="font-bold text-rose-600">{getLeaveTypes(selectedEmployee)}</span></div>
                </div>
              </div>

              {selectedEmployee.weeklyBreakdown && selectedEmployee.weeklyBreakdown.length > 0 && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mb-4">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">📊 Weekly Attendance Breakdown</h4>
                  <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto">
                    {selectedEmployee.weeklyBreakdown.map((week, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] bg-white p-1 rounded border border-gray-100">
                        <span className="font-medium text-gray-500">Week {week.weekNumber}</span>
                        <span className="text-gray-600">P:{week.presentDays || 0} H:{week.halfDays || 0} L:{week.leaves || 0}</span>
                        <span className="text-gray-600">Total: {week.effectiveWorkingDays || 0}d</span>
                        <span className={`font-bold ${week.isEligibleForWeekoff ? 'text-green-600' : 'text-red-500'}`}>
                          {week.isEligibleForWeekoff ? '✅ Earned' : '❌ No WO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedEmployee.compOffBalance > 0 || selectedEmployee.compOffEarned > 0) && (
                <div className="p-3 mt-4 rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-purple-800">Comp-off Summary - {formatMonthDisplay(selectedEmployee.month || selectedMonth)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Leave Taken</span>
                      <p className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const leaves = employeeLeaves[selectedEmployee.employeeId];
                          return (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                        })()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">-</span>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Comp-off Used</span>
                      <p className="text-2xl font-bold text-purple-600">
                        {(() => {
                          const leaves = employeeLeaves[selectedEmployee.employeeId];
                          const totalLeaves = (leaves?.CL || 0) + (leaves?.EL || 0) + (leaves?.COFF || 0) + (leaves?.Other || 0);
                          const earned = selectedEmployee.compOffEarned || 0;
                          return Math.min(earned, totalLeaves);
                        })()}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">=</span>
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Balance</span>
                      <p className="text-2xl font-bold text-blue-700">{selectedEmployee.compOffBalance || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => downloadSalarySlip(selectedEmployee)}
                  disabled={!selectedEmployee.canDownload}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition duration-200 ${
                    selectedEmployee.canDownload
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Download Payslip
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}