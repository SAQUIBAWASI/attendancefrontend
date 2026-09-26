import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import {
  FiTrendingUp,
  FiUsers,
  FiUserCheck,
  FiActivity,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from "recharts";
import "../index.css";
import "./EmployeeDashboard.css";
import "./AttendanceSummary.css";

// ============================================
// 📅 HELPERS
// ============================================
const formatDateLocal = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatMonthLocal = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const getCarryForwardKey = (employeeId, month) =>
  `payroll_carryForward_${employeeId}_${month}`;

const getPreviousMonth = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getDaysInMonth = (monthStr) => {
  if (!monthStr) return new Date().getDate();
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

const isMedicalRole = (role) => {
  if (!role) return false;
  const medicalRoles = [
    "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
    "Lab Technician", "Doctor", "Physiotherapist", "Lab Intern"
  ];
  return medicalRoles.some(r => role.toLowerCase().includes(r.toLowerCase()));
};

// ============================================
// ✅ HOLIDAY DEPARTMENT HELPERS
// ============================================
const holidayAppliesToDepartment = (holiday, employeeDepartment) => {
  if (!holiday) return false;

  let depts = [];
  if (Array.isArray(holiday.departments) && holiday.departments.length > 0) {
    depts = holiday.departments;
  } else if (holiday.department && holiday.department !== "All" && holiday.department !== "All Departments") {
    depts = holiday.department.split(",").map(d => d.trim()).filter(Boolean);
  }

  if (depts.length === 0) return true;
  if (depts.some(d => d.toLowerCase() === "all" || d.toLowerCase() === "all departments")) return true;
  if (!employeeDepartment) return true;

  const empDept = employeeDepartment.toLowerCase().trim();
  return depts.some(d => d.toLowerCase().trim() === empDept);
};

const calculateHolidayCountForDepartment = (holidaysData, targetMonth, employeeDepartment) => {
  if (!Array.isArray(holidaysData)) return 0;

  let count = 0;
  const [sYear, sMonth] = targetMonth.split('-').map(Number);
  const monthPrefix = `${sYear}-${String(sMonth).padStart(2, '0')}`;
  const startOfMonth = new Date(sYear, sMonth - 1, 1);
  const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);

  holidaysData.forEach(h => {
    if (h.isActive === false) return;
    if (!holidayAppliesToDepartment(h, employeeDepartment)) return;

    const hStartStr = h.fromDate;
    const hEndStr = h.toDate;

    if (hStartStr && hStartStr.startsWith(monthPrefix) &&
        hEndStr && hEndStr.startsWith(monthPrefix)) {
      count += h.totalDays || 1;
    } else if (hStartStr && hEndStr) {
      const hStart = new Date(hStartStr);
      const hEnd = new Date(hEndStr);
      const overlapStart = new Date(Math.max(hStart.getTime(), startOfMonth.getTime()));
      const overlapEnd = new Date(Math.min(hEnd.getTime(), endOfMonth.getTime()));
      if (overlapStart <= overlapEnd) {
        const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
        count += Math.max(1, days);
      }
    }
  });

  return count;
};

// ============================================
// ✅ NEW: Get list of holidays that apply to employee + their departments
// ============================================
const getEmployeeHolidaysForMonth = (holidaysData, targetMonth, employeeDepartment) => {
  if (!Array.isArray(holidaysData)) return [];

  const [sYear, sMonth] = targetMonth.split('-').map(Number);
  const monthPrefix = `${sYear}-${String(sMonth).padStart(2, '0')}`;
  const startOfMonth = new Date(sYear, sMonth - 1, 1);
  const endOfMonth = new Date(sYear, sMonth, 0, 23, 59, 59);

  return holidaysData.filter(h => {
    if (h.isActive === false) return false;
    if (!holidayAppliesToDepartment(h, employeeDepartment)) return false;

    const hStart = h.fromDate || '';
    const hEnd = h.toDate || '';

    if (hStart.startsWith(monthPrefix) && hEnd.startsWith(monthPrefix)) return true;

    try {
      const hStartDate = new Date(hStart);
      const hEndDate = new Date(hEnd);
      return hStartDate <= endOfMonth && hEndDate >= startOfMonth;
    } catch {
      return false;
    }
  });
};

// ============================================
// ✅ NEW: Extract unique assigned departments from holiday list
// ============================================
const extractAssignedDepartments = (holidayList) => {
  const deptSet = new Set();
  holidayList.forEach(h => {
    let depts = [];
    if (Array.isArray(h.departments) && h.departments.length > 0) {
      depts = h.departments;
    } else if (h.department && h.department !== "All" && h.department !== "All Departments") {
      depts = h.department.split(",").map(d => d.trim()).filter(Boolean);
    }

    if (depts.length === 0 || depts.some(d => d.toLowerCase() === "all" || d.toLowerCase() === "all departments")) {
      deptSet.add("All");
    } else {
      depts.forEach(d => deptSet.add(d));
    }
  });
  return Array.from(deptSet);
};

const calculateEarnedWeekOffs = (employeeId, year, monthNum, dailyAttendance, employeeLeavesData, weekOffDay, shiftHours = 8, holidayDaysInMonth = 0) => {
  const weekOffDayNum = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekOffDay);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);

  const attendanceMap = new Map();
  dailyAttendance.forEach(record => {
    if (record.date || record.checkInTime) {
      const dateKey = formatDateLocal(record.date || record.checkInTime);
      let hours = 0;
      if (record.totalHours) {
        hours = parseFloat(record.totalHours);
      } else if (record.workingHours) {
        hours = parseFloat(record.workingHours);
      } else if (record.checkOutTime) {
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
    const leaves = employeeLeavesData[employeeId];
    if (!leaves || !leaves.leaveDetails) return false;
    const dateStr = formatDateLocal(date);
    return leaves.leaveDetails.some(leave => {
      const startStr = formatDateLocal(leave.startDate);
      const endStr = formatDateLocal(leave.endDate);
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  let currentWeekStart = new Date(firstDay);
  while (currentWeekStart.getDay() !== 1) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 1);
  }

  let eligibleWeeks = 0;
  let totalWorkingDays = 0;
  let totalLeaves = 0;

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
          totalWorkingDays += 1;
        } else {
          halfDays += 0.5;
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

    if (isEligibleForWeekoff) {
      eligibleWeeks++;
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
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

  return { earnedWeekOffs, totalWeekOffDays };
};

const PayrollDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("active");

  const [showOTModal, setShowOTModal] = useState(false);
  const [otModalEmployee, setOtModalEmployee] = useState(null);
  const [otHoursInput, setOtHoursInput] = useState("");
  const [otAppliedMap, setOtAppliedMap] = useState({});

  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [deductionModalEmployee, setDeductionModalEmployee] = useState(null);
  const [deductionAmountInput, setDeductionAmountInput] = useState("");
  const [deductionReasonInput, setDeductionReasonInput] = useState("");
  const [manualDeductionMap, setManualDeductionMap] = useState({});

  const navigate = useNavigate();
  const isFetchingRef = useRef(false);

  const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
  const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
  const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
  const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
  const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
  const APPROVED_OT_API_URL = `${API_BASE_URL}/employees/allotclaimed?status=approved`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`otApplied_${selectedMonth}`);
      setOtAppliedMap(saved ? JSON.parse(saved) : {});
    } catch { setOtAppliedMap({}); }
  }, [selectedMonth]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`manualDeduction_${selectedMonth}`);
      setManualDeductionMap(saved ? JSON.parse(saved) : {});
    } catch { setManualDeductionMap({}); }
  }, [selectedMonth]);

  const saveOTApplied = (map) => {
    try {
      localStorage.setItem(`otApplied_${selectedMonth}`, JSON.stringify(map));
    } catch (e) { console.error(e); }
  };

  const saveManualDeduction = (map) => {
    try {
      localStorage.setItem(`manualDeduction_${selectedMonth}`, JSON.stringify(map));
    } catch (e) { console.error(e); }
  };

  const handleOpenOTModal = (employee) => {
    if (employee.hasApprovedOT && employee.approvedOTAmount > 0) {
      alert(`⚠️ This employee already has approved OT of ₹${employee.approvedOTAmount.toFixed(2)} (${employee.approvedOTHours}h) from OT Claims page. It will be used automatically.`);
      return;
    }

    setOtModalEmployee(employee);
    const existing = otAppliedMap[employee.employeeId];
    setOtHoursInput(existing !== undefined ? existing : (employee.totalOtHours || 0));
    setShowOTModal(true);
  };

  const handleSaveOT = () => {
    if (!otModalEmployee) return;
    const hours = parseFloat(otHoursInput) || 0;
    const newMap = { ...otAppliedMap, [otModalEmployee.employeeId]: hours };
    setOtAppliedMap(newMap);
    saveOTApplied(newMap);
    setShowOTModal(false);
    fetchData(selectedMonth);
  };

  const handleRemoveOT = () => {
    if (!otModalEmployee) return;
    const newMap = { ...otAppliedMap };
    delete newMap[otModalEmployee.employeeId];
    setOtAppliedMap(newMap);
    saveOTApplied(newMap);
    setShowOTModal(false);
    fetchData(selectedMonth);
  };

  const handleOpenDeductionModal = (employee) => {
    setDeductionModalEmployee(employee);
    const existing = manualDeductionMap[employee.employeeId];
    setDeductionAmountInput(existing?.amount ?? "");
    setDeductionReasonInput(existing?.reason ?? "");
    setShowDeductionModal(true);
  };

  const handleSaveDeduction = () => {
    if (!deductionModalEmployee) return;
    const amount = parseFloat(deductionAmountInput) || 0;
    const reason = deductionReasonInput.trim();
    if (amount <= 0) {
      alert("Please enter a valid deduction amount");
      return;
    }
    const newMap = {
      ...manualDeductionMap,
      [deductionModalEmployee.employeeId]: { amount, reason }
    };
    setManualDeductionMap(newMap);
    saveManualDeduction(newMap);
    setShowDeductionModal(false);
    fetchData(selectedMonth);
  };

  const handleRemoveDeduction = () => {
    if (!deductionModalEmployee) return;
    const newMap = { ...manualDeductionMap };
    delete newMap[deductionModalEmployee.employeeId];
    setManualDeductionMap(newMap);
    saveManualDeduction(newMap);
    setShowDeductionModal(false);
    fetchData(selectedMonth);
  };

  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const wasEmployeeEmployedInMonth = (employee, monthStr) => {
    if (!monthStr || !employee.joinDate) return true;
    const [year, month] = monthStr.split('-').map(Number);
    const joiningDate = new Date(employee.joinDate);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth() + 1;
    if (joiningYear > year || (joiningYear === year && joiningMonth > month)) return false;
    return true;
  };

  const isCurrentMonth = (month) => {
    if (!month) return true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [year, monthNum] = month.split('-').map(Number);
    return year === currentYear && monthNum === currentMonth;
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

  const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
    if (!monthStr || !employees.length) return employees;
    return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
  }, []);

  const processLeavesData = useCallback((leavesData, selectedMonth) => {
    const leavesMap = {};
    const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

    leavesData.forEach(leave => {
      const employeeId = leave.employeeId;
      if (!employeeId) return;

      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      const overlapStart = new Date(Math.max(leaveStart, startOfMonth));
      const overlapEnd = new Date(Math.min(leaveEnd, endOfMonth));
      const currentMonthDays = overlapStart <= overlapEnd
        ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
        : 0;

      const safeStartOfMonth = new Date(startOfMonth);
      safeStartOfMonth.setDate(startOfMonth.getDate() - 6);
      const overlapSafeStart = new Date(Math.max(leaveStart, safeStartOfMonth));
      const inExtendedMonth = overlapSafeStart <= overlapEnd;

      if (!leavesMap[employeeId]) {
        leavesMap[employeeId] = {
          CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0,
          leaveDetails: []
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
  }, []);

  const getLiveAttendanceCounts = (employeeId, allAttendanceRecords, targetMonth, employeesMap) => {
    let presentDays = 0;
    let halfDays = 0;
    let totalOtHours = 0;

    const dailyRecords = {};
    allAttendanceRecords.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (!rec.checkInTime) return;

      if (targetMonth) {
        const recMonth = formatMonthLocal(rec.checkInTime);
        if (recMonth !== targetMonth) return;
      }

      const dateKey = formatDateLocal(rec.checkInTime);
      if (!dailyRecords[dateKey]) dailyRecords[dateKey] = [];
      dailyRecords[dateKey].push(rec);
    });

    const shiftHours = employeesMap[employeeId]?.shiftHours || 9;

    Object.values(dailyRecords).forEach((recsForDay) => {
      const lastRec = recsForDay[recsForDay.length - 1];
      const hours = lastRec.totalHours || lastRec.hours || 0;
      const fullDayThreshold = shiftHours * 0.90;
      const halfDayThreshold = shiftHours * 0.50;

      if (hours >= fullDayThreshold) {
        presentDays++;
        if (hours > shiftHours) {
          totalOtHours += (hours - shiftHours);
        }
      } else if (hours >= halfDayThreshold) {
        halfDays++;
      }
    });

    return {
      presentDays,
      halfDayWorking: halfDays,
      totalWorkingDays: presentDays + (halfDays * 0.5),
      totalOtHours: Number(totalOtHours.toFixed(2))
    };
  };

  const fetchData = useCallback(async (month = "") => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      setError("");

      const targetMonth = month || selectedMonth;
      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(targetMonth);
      const isHistorical = isHistoricalMonth(targetMonth);
      const isCurrent = isCurrentMonth(targetMonth);

      const [employeesRes, leavesRes, holidaysRes, summaryRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL),
        fetch(LEAVES_API_URL),
        fetch(`${API_BASE_URL}/holidays/all`),
        fetch(`${ATTENDANCE_SUMMARY_API_URL}${targetMonth ? `?month=${targetMonth}` : ""}`)
      ]);

      let employeesData = [];
      if (employeesRes.ok) {
        const raw = await employeesRes.json();
        employeesData = Array.isArray(raw) ? raw : (raw.data || []);
      }

      let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];

      let summaryData = [];
      if (summaryRes.ok) {
        const json = await summaryRes.json();
        summaryData = json.summary || [];
      }

      let allAttendanceRecords = [];
      try {
        const attendanceRes = await fetch(`${ATTENDANCE_DETAILS_API_URL}?month=${targetMonth}`);
        if (attendanceRes.ok) {
          const attData = await attendanceRes.json();
          allAttendanceRecords = attData.records || [];
        }
      } catch (err) {
        console.warn("Failed to fetch attendance records:", err);
      }

      const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);

      // ✅ FETCH APPROVED OT CLAIMS
      let approvedOTMapLocal = {};
      try {
        const [year, monthNum] = targetMonth.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);

        const otRes = await fetch(APPROVED_OT_API_URL);
        const otData = await otRes.json();

        if (otData.success) {
          const monthClaims = (otData.claims || []).filter(claim => {
            const claimDate = new Date(claim.date);
            return claimDate >= startDate && claimDate <= endDate;
          });

          monthClaims.forEach(claim => {
            const empId = claim.employeeId;
            if (!approvedOTMapLocal[empId]) {
              approvedOTMapLocal[empId] = {
                totalOTHours: 0,
                totalOTAmount: 0,
                count: 0,
                claims: []
              };
            }
            approvedOTMapLocal[empId].totalOTHours += claim.otHours || 0;
            approvedOTMapLocal[empId].totalOTAmount += claim.otAmount || 0;
            approvedOTMapLocal[empId].count += 1;
            approvedOTMapLocal[empId].claims.push(claim);
          });
        }
      } catch (err) {
        console.warn("Failed to fetch approved OT claims:", err);
      }

      // ✅ FETCH COMP-OFF DATES
      let compOffDatesMapLocal = {};
      try {
        const [year, monthNum] = targetMonth.split('-').map(Number);
        const startOfMonth = new Date(year, monthNum - 1, 1);
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

        const compRes = await axios.get(COMPOFF_API_URL);
        const compOffs = compRes.data || [];

        for (const co of compOffs) {
          if (co.status === "approved") {
            const employeeId = co.employeeId;
            const workDate = new Date(co.workDate);

            if (workDate >= startOfMonth && workDate <= endOfMonth) {
              if (!compOffDatesMapLocal[employeeId]) {
                compOffDatesMapLocal[employeeId] = [];
              }
              compOffDatesMapLocal[employeeId].push({
                date: formatDateLocal(co.workDate),
                count: co.count || 1,
                reason: co.reason || '',
                workDate: co.workDate,
                _id: co._id
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch comp-offs:", err);
      }

      const employeesMap = {};
      employeesForMonth.forEach(emp => {
        employeesMap[emp.employeeId] = {
          salaryPerMonth: emp.salaryPerMonth || 0,
          shiftHours: emp.shiftHours || 9,
          weekOffPerMonth: emp.weekOffPerMonth || 4,
          weekOffDay: emp.weekOffDay || 'Sunday',
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department || '',
          designation: emp.role || emp.designation || '',
          joiningDate: emp.joinDate || emp.joiningDate || '',
          bankAccount: emp.bankAccount || emp.bankAccountNo || '',
          panCard: emp.panCard || emp.panNumber || '',
          pfNo: emp.pfNumber || emp.pfNo || '',
          uanNo: emp.uanNumber || emp.uanNo || '',
          esicNo: emp.esicNumber || emp.esicNo || '',
          branch: emp.branch || '',
          weekOffType: emp.weekOffType || '0+4',
          _id: emp._id,
          originalSalary: emp.originalSalary || emp.salaryPerMonth,
          basicPay: emp.basicPay || 0,
          hra: emp.hra || 0,
          conveyanceAllowance: emp.conveyanceAllowance || 0,
          medicalAllowance: emp.medicalAllowance || 0,
          performanceAllowance: emp.performanceAllowance || 0,
          specialAllowance: emp.specialAllowance || 0,
          gmc: emp.gmc || emp.gmcAmount || 0,
          profTax: emp.ptax || emp.profTax || 0,
          otherDeductions: emp.otherDeductions || 0,
          status: emp.status || 'active',
          isActive: emp.isActive !== false
        };
      });

      const [year, monthNum] = targetMonth.split("-").map(Number);
      const daysInMonthValue = getDaysInMonth(targetMonth);
      const processedSalaries = [];

      const savedOTMap = (() => {
        try {
          const saved = localStorage.getItem(`otApplied_${targetMonth}`);
          return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
      })();

      const savedManualDeductionMap = (() => {
        try {
          const saved = localStorage.getItem(`manualDeduction_${targetMonth}`);
          return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
      })();

      for (const emp of employeesForMonth) {
        const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

        const deptLower = (emp.department || '').toLowerCase().trim();
        const isDevOrMarketing = deptLower.includes("developer") || deptLower.includes("digital marketing") || deptLower.includes("development");
        const isConsultant = deptLower.includes("consultant");
        const isSpecialDept = ["laboratory medicine", "nursing", "medical"].includes(deptLower) || deptLower.includes("laboratory") || deptLower.includes("nursing") || deptLower.includes("medical") || isConsultant;

        const employeeRole = summary.role || emp.role || emp.designation || '';
        const isMedicalStaff = isMedicalRole(employeeRole);

        let attendanceForEmployee = allAttendanceRecords.filter(r => r.employeeId === emp.employeeId);

        // ============================================
        // ✅ Per-employee holiday count based on department
        // ============================================
        const employeeHolidayCount = calculateHolidayCountForDepartment(
          holidaysData,
          targetMonth,
          emp.department || ''
        );

        // ✅ NEW: Get employee's holidays + their assigned departments
        const employeeHolidayList = getEmployeeHolidaysForMonth(
          holidaysData,
          targetMonth,
          emp.department || ''
        );
        const assignedHolidayDepartments = extractAssignedDepartments(employeeHolidayList);

        const weekOffDay = emp.weekOffDay || 'Sunday';
        const weekOffData = calculateEarnedWeekOffs(
          emp.employeeId,
          year,
          monthNum,
          attendanceForEmployee,
          processLeavesData(leavesData, targetMonth),
          weekOffDay,
          emp.shiftHours || 8,
          employeeHolidayCount
        );

        let earnedWeekOffs = weekOffData.earnedWeekOffs;
        let defaultWeekOffs = isConsultant ? 2 : (emp.weekOffPerMonth || 4);
        if (isDevOrMarketing) {
          defaultWeekOffs = weekOffData.totalWeekOffDays || 5;
          earnedWeekOffs = defaultWeekOffs;
        }
        const finalWeekOffs = Math.min(earnedWeekOffs, defaultWeekOffs);

        let salaryForMonth = emp.salaryPerMonth || 0;
        let historicalEffectiveFrom = emp.joinDate;
        let originalSalary = emp.originalSalary || emp.salaryPerMonth;
        let incrementDetails = null;

        try {
          const targetDate = new Date(year, monthNum - 1, 15);
          const formattedDate = targetDate.toISOString().split('T')[0];

          const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
          if (salaryRes.ok) {
            const salaryData = await salaryRes.json();
            if (salaryData.success && salaryData.data) {
              salaryForMonth = salaryData.data.salaryPerMonth;
              historicalEffectiveFrom = salaryData.data.effectiveFrom || emp.joinDate;
              originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
              incrementDetails = salaryData.data.incrementDetails;
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch salary for ${emp.name}:`, err.message);
        }

        const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;

        const liveCounts = getLiveAttendanceCounts(emp.employeeId, allAttendanceRecords, targetMonth, employeesMap);

        let presentDaysCount = liveCounts.presentDays;
        let halfDaysCount = liveCounts.halfDayWorking;
        let totalWorkingDays = liveCounts.totalWorkingDays;
        let totalOtHours = liveCounts.totalOtHours;

        if (presentDaysCount === 0 && halfDaysCount === 0) {
          presentDaysCount = summary.presentDays ?? 0;
          halfDaysCount = summary.halfDayWorking ?? 0;
          totalWorkingDays = summary.totalWorkingDays ?? 0;
        }

        const fullDayNotWorking = summary.fullDayNotWorking ?? 0;

        // ============================================
        // ✅ COMP-OFF CALCULATION
        // ============================================
        const employeeCompOffDates = compOffDatesMapLocal[emp.employeeId] || [];
        const totalCompOffDays = employeeCompOffDates.reduce((sum, co) => sum + (co.count || 1), 0);
        const compOffAmount = Math.round(totalCompOffDays * dailyRate);

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
          carryForwardDays = Math.round((carryForwardDays + employeeHolidayCount) * 100) / 100;
        }

        localStorage.setItem(getCarryForwardKey(emp.employeeId, targetMonth), String(carryForwardDays));

        const basicPay = emp.basicPay || 0;
        const hra = emp.hra || 0;
        const conveyanceAllowance = emp.conveyanceAllowance || 0;
        const medicalAllowance = emp.medicalAllowance || 0;
        const performanceAllowance = emp.performanceAllowance || 0;
        const specialAllowance = emp.specialAllowance || 0;

        const totalEarnings = basicPay + hra + conveyanceAllowance + medicalAllowance + performanceAllowance + specialAllowance;

        const holidayAmount = Math.round(employeeHolidayCount * dailyRate);
        const publicHolidayCount = employeeHolidayCount;

        // ✅ BASE SALARY CALCULATION
        let calculatedSalary = 0;
        if (salaryForMonth > 0 && daysInMonthValue > 0) {
          if (presentDaysCount === 0 && halfDaysCount === 0) {
            calculatedSalary = 0;
          } else {
            const holidayAddition = isSpecialDept ? 0 : employeeHolidayCount;
            const effectivePaidDays =
              payablePresentDays +
              (includeWeekOffInSalary ? finalWeekOffs : 0) +
              holidayAddition +
              totalCompOffDays;
            calculatedSalary = Math.round(effectivePaidDays * dailyRate);
          }
        }

        // ✅ DEDUCTIONS
        const totalPaidDays = actualDaysWorked + finalWeekOffs + employeeHolidayCount + totalCompOffDays;
        const lopDays = Math.max(0, daysInMonthValue - totalPaidDays);
        const lopAmount = Math.round(lopDays * dailyRate);

        const halfDayDeductionAmount = Math.round(halfDaysCount * 0.5 * dailyRate);
        const gmcAmount = emp.gmc || emp.gmcAmount || 0;
        const profTax = emp.ptax || emp.profTax || 0;
        const otherDeductions = emp.otherDeductions || 0;

        const manualDeductionEntry = savedManualDeductionMap[emp.employeeId];
        const manualDeductionAmount = manualDeductionEntry?.amount || 0;
        const manualDeductionReason = manualDeductionEntry?.reason || "";

        const totalDeductions =
          lopAmount +
          halfDayDeductionAmount +
          gmcAmount +
          profTax +
          otherDeductions +
          manualDeductionAmount;

        // ✅ OT CALCULATION
        const hourlyRate = (emp.shiftHours && emp.shiftHours > 0) ? dailyRate / emp.shiftHours : 0;

        const approvedOTData = approvedOTMapLocal[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
        const approvedOTAmount = approvedOTData.totalOTAmount || 0;
        const approvedOTHours = approvedOTData.totalOTHours || 0;

        const otAppliedHours = savedOTMap[emp.employeeId] !== undefined ? savedOTMap[emp.employeeId] : null;
        const otAppliedAmount = otAppliedHours !== null ? Math.round(otAppliedHours * hourlyRate * 2) : 0;

        let finalOTAmount = 0;
        let finalOTHours = 0;
        let otSource = 'none';

        if (approvedOTAmount > 0) {
          finalOTAmount = approvedOTAmount;
          finalOTHours = approvedOTHours;
          otSource = 'approved';
        } else if (otAppliedHours !== null && otAppliedHours > 0) {
          finalOTAmount = otAppliedAmount;
          finalOTHours = otAppliedHours;
          otSource = 'manual';
        }

        const baseCalculatedSalary = calculatedSalary;
        const finalPay = Math.max(0, baseCalculatedSalary + finalOTAmount - manualDeductionAmount);

        const isInactive = isEmployeeHidden(emp);

        let paymentStatus = summary.paymentStatus;
        if (!paymentStatus) {
          paymentStatus = isHistoricalMonth(targetMonth) ? "Paid" : "Pending";
        }

        processedSalaries.push({
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department || "Other",
          designation: employeeRole,
          role: employeeRole,

          presentDays: presentDaysCount,
          halfDayWorking: halfDaysCount,
          workingDays: totalWorkingDays,
          fullDayNotWorking: fullDayNotWorking,

          totalOtHours: totalOtHours,
          otAppliedHours: otAppliedHours,
          otHours: finalOTHours,
          otAmount: finalOTAmount,
          hourlyRate: hourlyRate,
          otSource: otSource,
          hasApprovedOT: approvedOTAmount > 0,
          approvedOTAmount: approvedOTAmount,
          approvedOTHours: approvedOTHours,

          salaryPerMonth: salaryForMonth,
          calculatedSalary: baseCalculatedSalary,
          finalPay: finalPay,

          basicPay: basicPay,
          hra: hra,
          conveyanceAllowance: conveyanceAllowance,
          medicalAllowance: medicalAllowance,
          performanceAllowance: performanceAllowance,
          specialAllowance: specialAllowance,
          totalEarnings: totalEarnings,

          // ✅ Holiday info with departments
          holidayCount: publicHolidayCount,
          holidayAmount: holidayAmount,
          holidayList: employeeHolidayList.map(h => ({
            name: h.name,
            fromDate: h.fromDate,
            toDate: h.toDate,
            type: h.type,
            departments: Array.isArray(h.departments) && h.departments.length > 0
              ? h.departments
              : (h.department ? h.department.split(",").map(d => d.trim()).filter(Boolean) : ["All"])
          })),
          assignedHolidayDepartments: assignedHolidayDepartments,

          compOffDates: employeeCompOffDates,
          compOffDays: totalCompOffDays,
          compOffAmount: compOffAmount,

          lopDays: lopDays,
          lopAmount: lopAmount,
          halfDayDeduction: halfDayDeductionAmount,
          gmcAmount: gmcAmount,
          profTax: profTax,
          otherDeductions: otherDeductions,
          manualDeduction: manualDeductionAmount,
          manualDeductionReason: manualDeductionReason,
          deductions: totalDeductions,

          weekOffs: finalWeekOffs,
          isInactive: isInactive,
          paymentStatus: paymentStatus,
          isProcessed: paymentStatus === "Paid"
        });
      }

      setRecords(processedSalaries);
    } catch (err) {
      console.error("ERROR Loading Dashboard Data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [selectedMonth, filterEmployeesByJoiningDate, processLeavesData]);

  useEffect(() => {
    fetchData(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const handleToggleStatus = async (employeeId, currentStatus) => {
    const newStatus = currentStatus === "Paid" ? "Pending" : "Paid";
    try {
      const response = await fetch(`${API_BASE_URL}/attendancesummary/updatePayroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          month: selectedMonth,
          paymentStatus: newStatus
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setRecords(prev => prev.map(rec =>
          rec.employeeId === employeeId
            ? { ...rec, paymentStatus: newStatus, isProcessed: newStatus === "Paid" }
            : rec
        ));
      } else {
        alert("Failed to update status: " + (result.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status: " + e.message);
    }
  };

  const activeRecords = records.filter(record => {
    if (filterStatus === "active") return !record.isInactive;
    if (filterStatus === "inactive") return record.isInactive;
    return true;
  });

  const totalEmployeesCount = activeRecords.length;
  const processedRecords = activeRecords.filter(r => r.paymentStatus === "Paid");
  const pendingRecords = activeRecords.filter(r => r.paymentStatus === "Pending");

  const totalGrossPayroll = activeRecords.reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalNetPay = activeRecords.filter(r => r.paymentStatus === "Paid").reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalPendingAmount = activeRecords.filter(r => r.paymentStatus === "Pending").reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalDeductions = activeRecords.reduce((sum, emp) => sum + emp.deductions, 0);

  const totalBasic = activeRecords.reduce((sum, emp) => sum + emp.basicPay, 0);
  const totalHra = activeRecords.reduce((sum, emp) => sum + emp.hra, 0);
  const totalConveyance = activeRecords.reduce((sum, emp) => sum + emp.conveyanceAllowance, 0);
  const totalMedical = activeRecords.reduce((sum, emp) => sum + emp.medicalAllowance, 0);
  const totalPerformance = activeRecords.reduce((sum, emp) => sum + emp.performanceAllowance, 0);
  const totalSpecial = activeRecords.reduce((sum, emp) => sum + emp.specialAllowance, 0);
  const totalAllowances = totalConveyance + totalMedical + totalPerformance + totalSpecial;
  const totalHolidayAmount = activeRecords.reduce((sum, emp) => sum + emp.holidayAmount, 0);
  const totalOT = activeRecords.reduce((sum, emp) => sum + emp.otAmount, 0);
  const totalCompOffDays = activeRecords.reduce((sum, emp) => sum + (emp.compOffDays || 0), 0);
  const totalCompOffAmount = activeRecords.reduce((sum, emp) => sum + (emp.compOffAmount || 0), 0);

  const totalLOP = activeRecords.reduce((sum, emp) => sum + emp.lopAmount, 0);
  const totalHalfDayDed = activeRecords.reduce((sum, emp) => sum + emp.halfDayDeduction, 0);
  const totalGMC = activeRecords.reduce((sum, emp) => sum + emp.gmcAmount, 0);
  const totalProfTax = activeRecords.reduce((sum, emp) => sum + emp.profTax, 0);
  const totalOtherDed = activeRecords.reduce((sum, emp) => sum + emp.otherDeductions, 0);
  const totalManualDeduction = activeRecords.reduce((sum, emp) => sum + (emp.manualDeduction || 0), 0);

  const totalPresentDays = activeRecords.reduce((sum, emp) => sum + emp.presentDays, 0);
  const totalLeavesDays = activeRecords.reduce((sum, emp) => sum + emp.halfDayWorking * 0.5, 0);
  const totalWeekoffs = activeRecords.reduce((sum, emp) => sum + emp.weekOffs, 0);
  const totalOTHours = activeRecords.reduce((sum, emp) => sum + emp.otHours, 0);

  const filteredEmployeesList = activeRecords.filter(emp => {
    const matchesSearch = !searchTerm ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === "All" || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(records.map(r => r.department))).filter(Boolean);

  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const trendData = months.map((m, idx) => {
    const scaleFactor = 0.8 + (idx * 0.04);
    return {
      name: m,
      "Gross Payroll": Math.round(totalGrossPayroll * scaleFactor),
      "Net Payroll": Math.round(totalNetPay * scaleFactor)
    };
  });

  const paymentStatusData = [
    { name: "Paid", value: processedRecords.length, color: "#10b981" },
    { name: "Pending", value: pendingRecords.length, color: "#f59e0b" },
    { name: "Failed", value: 0, color: "#ef4444" },
    { name: "Draft", value: 0, color: "#6b7280" }
  ].filter(d => d.value > 0 || d.name === "Paid" || d.name === "Pending");

  const processedPercentage = totalEmployeesCount > 0
    ? Math.round((processedRecords.length / totalEmployeesCount) * 100)
    : 0;

  const radialData = [
    { name: "Processed", value: processedPercentage, fill: "#4f46e5" }
  ];

  const grandGross = totalBasic + totalHra + totalAllowances + totalHolidayAmount + totalOT + totalCompOffAmount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-lg font-semibold text-blue-600 animate-pulse">Loading Payroll Dashboard Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen text-slate-800">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Payroll Dashboard <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-white border rounded-lg p-1 shadow-sm text-xs font-semibold mr-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                filterStatus === "all" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All ({records.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                filterStatus === "active" ? "bg-green-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Active ({records.filter(r => !r.isInactive).length})
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                filterStatus === "inactive" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Inactive ({records.filter(r => r.isInactive).length})
            </button>
          </div>

          <div className="relative flex items-center bg-white border rounded-lg px-3 py-1.5 shadow-sm text-xs font-semibold">
            <FaCalendarAlt className="text-slate-400 mr-2" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-none outline-none focus:ring-0 bg-transparent text-slate-700 cursor-pointer font-bold"
            />
          </div>

          <button
            onClick={() => navigate("/payroll")}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Total Payroll</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--salary"><FiTrendingUp /></div>
          </div>
          <div className="emp-dash__stat-value">₹{totalGrossPayroll.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">paid + pending net payroll</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Paid Amount</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div>
          </div>
          <div className="emp-dash__stat-value text-green-600">₹{totalNetPay.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">{totalGrossPayroll > 0 ? Math.round((totalNetPay / totalGrossPayroll) * 100) : 0}% of total payroll</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Pending Amount</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--absent"><FiActivity /></div>
          </div>
          <div className="emp-dash__stat-value text-amber-500">₹{totalPendingAmount.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">{totalGrossPayroll > 0 ? Math.round((totalPendingAmount / totalGrossPayroll) * 100) : 0}% of total payroll</div>
        </div>

        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Total Employees</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div>
          </div>
          <div className="emp-dash__stat-value">{totalEmployeesCount}</div>
          <div className="emp-dash__stat-meta">{processedRecords.length} Paid • {pendingRecords.length} Pending</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Payroll Trend (Last 6 Months)</h3>
            <select className="border text-[11px] rounded p-1 text-slate-600 outline-none">
              <option>6 Months</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Gross Payroll" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Net Payroll" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 font-sans">Payment Status</h3>
          <div className="flex items-center justify-around h-60">
            <div className="w-[150px] h-[150px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={3} dataKey="value">
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Employees`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                <span className="text-lg font-black text-slate-900">{processedPercentage}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paid</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {paymentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="text-slate-400 font-normal">
                    {item.value} ({totalEmployeesCount > 0 ? Math.round((item.value / totalEmployeesCount) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 font-sans">Payroll Processing Progress</h3>
          <div className="flex flex-col items-center justify-center h-60">
            <div className="w-[160px] h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={radialData} startAngle={180} endAngle={-180}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-indigo-600">{processedPercentage}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Processed</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] w-full text-center mt-3 border-t pt-3">
              <div className="flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 font-bold">✓</span>
                <span className="text-slate-500 font-medium">Attendance</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 font-bold">✓</span>
                <span className="text-slate-500 font-medium">Calculations</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 font-bold">✓</span>
                <span className="text-slate-500 font-medium">Deductions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center mb-1 font-bold ${processedPercentage === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {processedPercentage === 100 ? '✓' : '●'}
                </span>
                <span className="text-slate-500 font-medium">Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            💰 Earnings Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Basic Salary</span><span className="font-bold text-slate-800">₹{totalBasic.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">HRA</span><span className="font-bold text-slate-800">₹{totalHra.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Conveyance</span><span className="font-bold text-slate-800">₹{totalConveyance.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Medical</span><span className="font-bold text-slate-800">₹{totalMedical.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Performance</span><span className="font-bold text-slate-800">₹{totalPerformance.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Special Allowance</span><span className="font-bold text-slate-800">₹{totalSpecial.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Public Holiday</span><span className="font-bold text-purple-600">₹{totalHolidayAmount.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Comp-off ({totalCompOffDays} days)</span><span className="font-bold text-teal-600">₹{totalCompOffAmount.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Overtime</span><span className="font-bold text-emerald-600">₹{totalOT.toLocaleString()}</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Gross Salary</span>
              <span className="text-indigo-600">₹{grandGross.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            🛑 Deductions Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">LOP / Absent</span><span className="font-bold text-rose-500">- ₹{totalLOP.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Half Day Deduction</span><span className="font-bold text-rose-500">- ₹{totalHalfDayDed.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">GMC</span><span className="font-bold text-slate-800">- ₹{totalGMC.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Professional Tax</span><span className="font-bold text-slate-800">- ₹{totalProfTax.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Other Deductions</span><span className="font-bold text-slate-800">- ₹{totalOtherDed.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Manual Deduction</span><span className="font-bold text-rose-500">- ₹{totalManualDeduction.toLocaleString()}</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Total Deductions</span>
              <span className="text-rose-600">- ₹{totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            📅 Attendance Impact
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Present Days</span><span className="font-bold text-slate-800">{totalPresentDays} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Half Days</span><span className="font-bold text-slate-800">{totalLeavesDays} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Weekoffs</span><span className="font-bold text-slate-800">{totalWeekoffs} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Comp-offs</span><span className="font-bold text-teal-600">{totalCompOffDays} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Overtime Hours</span><span className="font-bold text-emerald-600">{totalOTHours.toFixed(1)} hrs</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Active Headcount</span>
              <span className="text-indigo-600">{totalEmployeesCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Employee Payroll Details</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border rounded-lg text-xs p-1 text-slate-600 bg-white cursor-pointer"
            >
              <option value="All">All Departments</option>
              {uniqueDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-500 text-slate-200 font-bold border-b">
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3 text-center">Present</th>
                <th className="p-3 text-center">Half</th>
                <th className="p-3 text-center">OT Hrs</th>
                <th className="p-3 text-right">Basic</th>
                <th className="p-3 text-right">HRA</th>
                <th className="p-3 text-right">Allowances</th>
                <th className="p-3 text-right">Holiday </th>
                <th className="p-3 text-right">Comp-off</th>
                <th className="p-3 text-right">OT (₹)</th>
                <th className="p-3 text-right">LOP (₹)</th>
                <th className="p-3 text-right">Other Ded.</th>
                <th className="p-3 text-right">Manual Ded.</th>
                <th className="p-3 text-right">Net Salary</th>
                <th className="p-3 text-center">OT Action</th>
                <th className="p-3 text-center">Deduction</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployeesList.map((emp) => {
                const otherAllowances = (emp.conveyanceAllowance || 0) + (emp.medicalAllowance || 0) + (emp.performanceAllowance || 0) + (emp.specialAllowance || 0);
                const otherDeductions = (emp.halfDayDeduction || 0) + (emp.gmcAmount || 0) + (emp.profTax || 0) + (emp.otherDeductions || 0);
                return (
                  <tr key={emp.employeeId} className="border-b hover:bg-slate-50/50 transition">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.employeeId}</div>
                    </td>
                    <td className="p-3 text-slate-600">{emp.department}</td>
                    <td className="p-3 text-center font-bold text-emerald-600">{emp.presentDays || 0}</td>
                    <td className="p-3 text-center font-bold text-amber-600">{emp.halfDayWorking || 0}</td>
                    <td className="p-3 text-center font-bold text-blue-600">
                      {emp.totalOtHours ? emp.totalOtHours.toFixed(1) : "0.0"}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">
                      {emp.basicPay > 0 ? `₹${emp.basicPay.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">
                      {emp.hra > 0 ? `₹${emp.hra.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">
                      {otherAllowances > 0 ? `₹${otherAllowances.toLocaleString()}` : "-"}
                    </td>
                   {/* ✅ Holiday Column — sirf amount */}
<td className="p-3 text-right font-bold text-purple-600">
  {emp.holidayAmount > 0 ? (
    <span
      title={
        emp.holidayList && emp.holidayList.length > 0
          ? emp.holidayList.map(h => `${h.name} (${h.departments.join(", ")})`).join("\n")
          : ""
      }
    >
      ₹{emp.holidayAmount.toLocaleString()}
    </span>
  ) : (
    <span className="text-slate-300">-</span>
  )}
</td>
                    <td className="p-3 text-right font-bold text-teal-600">
                      {emp.compOffAmount > 0 ? (
                        <span title={`${emp.compOffDays} day(s)`}>₹{emp.compOffAmount.toLocaleString()}</span>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {emp.otAmount > 0 ? (
                        <span title={emp.otSource === 'approved' ? `Approved: ${emp.approvedOTHours}h` : ''}>
                          ₹{emp.otAmount.toLocaleString()}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-right font-semibold text-rose-500">
                      {emp.lopAmount > 0 ? `₹${emp.lopAmount.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-semibold text-rose-500">
                      {otherDeductions > 0 ? `₹${otherDeductions.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-semibold text-rose-600">
                      {emp.manualDeduction > 0 ? `₹${emp.manualDeduction.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-bold text-indigo-600">₹{emp.finalPay.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      {emp.hasApprovedOT ? (
                        <span
                          className="px-2 py-1 rounded text-[10px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-300"
                          title={`Approved OT: ${emp.approvedOTHours}h = ₹${emp.approvedOTAmount.toFixed(2)}`}
                        >
                          ✓ Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenOTModal(emp)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                            emp.otAppliedHours !== null && emp.otAppliedHours !== undefined
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {emp.otAppliedHours !== null && emp.otAppliedHours !== undefined
                            ? `✓ ${emp.otAppliedHours}h`
                            : '+ Add OT'}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenDeductionModal(emp)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                          emp.manualDeduction > 0
                            ? 'bg-rose-100 text-rose-700 border-rose-300'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {emp.manualDeduction > 0
                          ? `✓ ₹${emp.manualDeduction}`
                          : '+ Add Deduction'}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(emp.employeeId, emp.paymentStatus)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border cursor-pointer hover:opacity-80 transition-all ${
                          emp.paymentStatus === "Paid"
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {emp.paymentStatus}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployeesList.length === 0 && (
                <tr>
                  <td colSpan="18" className="text-center p-8 text-slate-400 font-semibold">
                    No employee records found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showOTModal && otModalEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Add Overtime</h2>
            <p className="text-xs text-slate-500 mb-4">
              {otModalEmployee.name} ({otModalEmployee.employeeId})
            </p>

            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Rate:</span>
                <span className="font-bold text-slate-800">₹{Math.round(otModalEmployee.salaryPerMonth / getDaysInMonth(selectedMonth)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Rate:</span>
                <span className="font-bold text-slate-800">₹{otModalEmployee.hourlyRate ? otModalEmployee.hourlyRate.toFixed(2) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OT Multiplier:</span>
                <span className="font-bold text-emerald-600">2×</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actual OT Hours:</span>
                <span className="font-bold text-blue-600">{otModalEmployee.totalOtHours ? otModalEmployee.totalOtHours.toFixed(2) : 0} hrs</span>
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              OT Hours to Pay
            </label>
            <input
              type="number"
              value={otHoursInput}
              onChange={(e) => setOtHoursInput(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg mb-2 text-sm font-semibold"
              step="0.25"
              min="0"
              placeholder="Enter OT hours"
            />

            <div className="text-xs text-slate-500 mb-4">
              OT Amount: <span className="font-bold text-emerald-600">
                ₹{Math.round((parseFloat(otHoursInput) || 0) * (otModalEmployee.hourlyRate || 0) * 2).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              {otAppliedMap[otModalEmployee.employeeId] !== undefined && (
                <button
                  onClick={handleRemoveOT}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowOTModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOT}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save OT
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeductionModal && deductionModalEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Add Manual Deduction</h2>
            <p className="text-xs text-slate-500 mb-4">
              {deductionModalEmployee.name} ({deductionModalEmployee.employeeId})
            </p>

            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Net Salary:</span>
                <span className="font-bold text-slate-800">
                  ₹{(deductionModalEmployee.finalPay || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Existing Total Deductions:</span>
                <span className="font-bold text-rose-500">
                  ₹{(deductionModalEmployee.deductions || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Deduction Amount (₹)
            </label>
            <input
              type="number"
              value={deductionAmountInput}
              onChange={(e) => setDeductionAmountInput(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg mb-3 text-sm font-semibold"
              step="1"
              min="0"
              placeholder="Enter deduction amount"
            />

            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={deductionReasonInput}
              onChange={(e) => setDeductionReasonInput(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg mb-4 text-sm"
              placeholder="e.g. Advance, Penalty, Damage"
            />

            <div className="text-xs text-slate-500 mb-4">
              New Net Salary:{" "}
              <span className="font-bold text-rose-600">
                ₹{Math.max(
                  0,
                  (deductionModalEmployee.finalPay || 0) -
                    (parseFloat(deductionAmountInput) || 0)
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              {manualDeductionMap[deductionModalEmployee.employeeId] !== undefined && (
                <button
                  onClick={handleRemoveDeduction}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowDeductionModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDeduction}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Save Deduction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDashboard;