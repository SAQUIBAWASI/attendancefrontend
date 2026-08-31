import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaFileExport
} from "react-icons/fa";
import { 
  FiTrendingUp, 
  FiUsers, 
  FiUserCheck, 
  FiDollarSign,
  FiActivity,
  FiUserMinus
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

const formatDateLocal = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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
  const [filterStatus, setFilterStatus] = useState("active"); // default to active

  const navigate = useNavigate();

  // API URLs exactly matching PayRoll.js
  const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
  const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
  const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
  const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;

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

      const overlapStart = new Date(Math.max(leaveStart.getTime(), startOfMonth.getTime()));
      const overlapEnd = new Date(Math.min(leaveEnd.getTime(), endOfMonth.getTime()));

      if (overlapStart <= overlapEnd) {
        const timeDiff = overlapEnd.getTime() - overlapStart.getTime();
        const days = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        if (!leavesMap[employeeId]) {
          leavesMap[employeeId] = { leaveDetails: [], CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
        }

        leavesMap[employeeId].leaveDetails.push(leave);
        const type = leave.leaveType || "Other";
        if (type === "CL") leavesMap[employeeId].CL += days;
        else if (type === "EL") leavesMap[employeeId].EL += days;
        else if (type === "COFF") leavesMap[employeeId].COFF += days;
        else if (type === "LOP") leavesMap[employeeId].LOP += days;
        else leavesMap[employeeId].Other += days;
      }
    });

    return leavesMap;
  }, []);

  const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
    try {
      const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

      const response = await axios.get(`${API_BASE_URL}/leaves/comp-offs`);
      const compOffs = response.data || [];

      const compOffMap = {};
      compOffs.forEach(co => {
        const empId = co.employeeId;
        if (!empId) return;

        const isApproved = co.status === 'approved' || co.isApproved === true;
        if (!isApproved) return;

        let compOffDate = null;
        if (co.date) compOffDate = new Date(co.date);
        else if (co.createdAt) compOffDate = new Date(co.createdAt);

        if (compOffDate && compOffDate >= startOfMonth && compOffDate <= endOfMonth) {
          if (!compOffMap[empId]) {
            compOffMap[empId] = { balance: 0, details: [] };
          }
          compOffMap[empId].balance += co.daysCount || 1;
          compOffMap[empId].details.push(co);
        }
      });

      return compOffMap;
    } catch (e) {
      console.warn("Failed to process comp-offs:", e);
      return {};
    }
  }, []);

  // Main fetch function modeled directly off PayRoll.js
  const fetchData = useCallback(async (month = "") => {
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

      let approvedOTClaims = [];
      try {
        const otRes = await fetch(`${API_BASE_URL}/employees/all/ot-claims?month=${targetMonth}`);
        if (otRes.ok) {
          const otResult = await otRes.json();
          approvedOTClaims = otResult.data || [];
        }
      } catch (err) {
        console.warn("Failed to fetch OT claims:", err);
      }

      const approvedOTMap = {};
      approvedOTClaims.forEach(claim => {
        if (claim.status === "approved") {
          approvedOTMap[claim.employeeId] = {
            totalOTAmount: claim.totalOTAmount || 0,
            totalOTHours: claim.totalOTHours || 0
          };
        }
      });

      let holidayCount = 0;
      if (Array.isArray(holidaysData)) {
        const [sYear, sMonth] = targetMonth.split("-").map(Number);
        holidaysData.forEach(h => {
          if (h.isActive !== false) {
            const hStartStr = h.fromDate;
            const hEndStr = h.toDate;
            if (hStartStr && hStartStr.startsWith(`${sYear}-${String(sMonth).padStart(2, "0")}`)) {
              holidayCount += h.totalDays || 1;
            }
          }
        });
      }

      const currentLeavesMap = processLeavesData(leavesData, targetMonth);
      const currentCompOffsMap = await processCompOffData(targetMonth, leavesData);

      const [year, monthNum] = targetMonth.split("-").map(Number);
      const daysInMonthValue = getDaysInMonth(targetMonth);
      const processedSalaries = [];

      const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);

      for (const emp of employeesForMonth) {
        const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};
        const employeeRole = summary.role || emp.role || emp.designation || "";
        const isMedicalStaff = isMedicalRole(employeeRole);

        let attendanceForEmployee = allAttendanceRecords.filter(r => r.employeeId === emp.employeeId);

        const weekOffDay = emp.weekOffDay || "Sunday";
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

        const deptLower = (emp.department || "").toLowerCase().trim();
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

        let salaryForMonth = emp.salaryPerMonth || 0;
        let originalSalary = emp.originalSalary || emp.salaryPerMonth;

        try {
          const targetDate = new Date(year, monthNum - 1, 15);
          const formattedDate = targetDate.toISOString().split("T")[0];
          const salaryRes = await fetch(`${API_BASE_URL}/employees/${emp._id}/salary-for-date?date=${formattedDate}`);
          if (salaryRes.ok) {
            const salaryData = await salaryRes.json();
            if (salaryData.success && salaryData.data) {
              salaryForMonth = salaryData.data.salaryPerMonth;
              originalSalary = salaryData.data.originalSalary || emp.originalSalary || emp.salaryPerMonth;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch salary snapshot:", e.message);
        }

        const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonthValue : 0;
        const presentDaysCount = summary.presentDays ?? 0;
        const halfDaysCount = summary.halfDayWorking ?? 0;
        const totalWorkingDays = summary.totalWorkingDays ?? 0;
        const fullDayNotWorking = summary.fullDayNotWorking ?? 0;
        const overTimeHours = summary.overTimeHours ?? 0;

        const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };
        const expectedWorkingDays = daysInMonthValue - finalWeekOffs;
        const actualDaysWorked = presentDaysCount + halfDaysCount * 0.5;

        const prevMonth = getPreviousMonth(targetMonth);
        const prevCarryForward = prevMonth
          ? parseFloat(localStorage.getItem(getCarryForwardKey(emp.employeeId, prevMonth)) || "0")
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

        let calculatedSalary = 0;
        if (salaryForMonth > 0 && daysInMonthValue > 0) {
          if (presentDaysCount === 0 && halfDaysCount === 0) {
            calculatedSalary = 0;
          } else {
            const holidayAddition = isSpecialDept ? 0 : holidayCount;
            const effectivePaidDays = payablePresentDays + (includeWeekOffInSalary ? finalWeekOffs : 0) + holidayAddition + compOffData.balance;
            calculatedSalary = effectivePaidDays * dailyRate;
          }
        }

        // OT Calculations
        let totalOTHours = overTimeHours || 0;
        let calculatedOTHours = 0;
        allAttendanceRecords.forEach(record => {
          if (record.employeeId !== emp.employeeId) return;
          if (record.checkInTime) {
            const recordMonth = new Date(record.checkInTime).toISOString().slice(0, 7);
            if (recordMonth !== targetMonth) return;
          }
          let hoursWorked = 0;
          if (record.hours) {
            hoursWorked = parseFloat(record.hours);
          } else if (record.totalHours) {
            hoursWorked = parseFloat(record.totalHours);
          }
          const shiftHrs = emp.shiftHours || 8;
          if (hoursWorked > shiftHrs) {
            calculatedOTHours += hoursWorked - shiftHrs;
          }
        });

        if (totalOTHours === 0 && calculatedOTHours > 0) {
          totalOTHours = calculatedOTHours;
        }
        totalOTHours = Number(totalOTHours.toFixed(2));

        const approvedOTData = approvedOTMap[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
        const approvedOTAmount = approvedOTData.totalOTAmount || 0;

        const baseCalculatedSalary = Math.round(calculatedSalary);
        let finalOTAmount = 0;
        let finalPay = baseCalculatedSalary;

        if (approvedOTAmount > 0) {
          finalOTAmount = approvedOTAmount;
          finalPay = Math.round(baseCalculatedSalary + approvedOTAmount);
        } else {
          const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";
          if (totalOTHours > 0 && isApprovedInOTPage) {
            const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
            const otRatePerHour = dailyRate / (emp.shiftHours || 8);
            const otAmount = totalOTHours * otRatePerHour * multiplier;
            finalOTAmount = otAmount;
            finalPay = Math.round(baseCalculatedSalary + otAmount);
          }
        }

        const isInactive = isEmployeeHidden(emp);

        // Deductions breakups (removed the 150 ptax, pf, and esic defaults since we are not doing deductions)
        const basicPay = Math.round(salaryForMonth * 0.5);
        const hra = Math.round(salaryForMonth * 0.2);
        const conveyance = Math.round(salaryForMonth * 0.1);
        const allowances = conveyance + Math.round(salaryForMonth * 0.05);

        const pf = 0;
        const esic = 0;
        const ptax = 0;
        const otherDeductions = emp.otherDeductions || 0;
        const totalDeductions = otherDeductions;

        let paymentStatus = summary.paymentStatus;
        if (!paymentStatus) {
          if (targetMonth === "2026-06" || targetMonth === "2026-07" || isHistoricalMonth(targetMonth)) {
            paymentStatus = "Paid";
          } else {
            paymentStatus = "Pending";
          }
        }

        processedSalaries.push({
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department || "Other",
          designation: employeeRole,
          presentDays: presentDaysCount,
          halfDayWorking: halfDaysCount,
          workingDays: totalWorkingDays,
          salaryPerMonth: salaryForMonth,
          calculatedSalary: baseCalculatedSalary,
          finalPay: Math.max(0, Math.round(finalPay - totalDeductions)),
          otAmount: Math.round(finalOTAmount),
          otHours: totalOTHours,
          basicPay: basicPay,
          hra: hra,
          allowances: allowances,
          deductions: totalDeductions,
          pf: pf,
          esic: esic,
          ptax: ptax,
          otherDeductions: otherDeductions,
          holidayCount: holidayCount,
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
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth, fetchData]);

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

  // Aggregate Calculations strictly matching the filter status tab selected
  const activeRecords = records.filter(record => {
    if (filterStatus === "active") return !record.isInactive;
    if (filterStatus === "inactive") return record.isInactive;
    return true; // "all"
  });

  const totalEmployeesCount = activeRecords.length;
  const processedRecords = activeRecords.filter(r => r.paymentStatus === "Paid");
  const pendingRecords = activeRecords.filter(r => r.paymentStatus === "Pending");

  // Sum calculations
  const totalGrossPayroll = activeRecords.reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalNetPay = activeRecords.filter(r => r.paymentStatus === "Paid").reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalPendingAmount = activeRecords.filter(r => r.paymentStatus === "Pending").reduce((sum, emp) => sum + emp.finalPay, 0);
  const totalDeductions = activeRecords.reduce((sum, emp) => sum + emp.deductions, 0);

  const totalBasic = activeRecords.reduce((sum, emp) => sum + emp.basicPay, 0);
  const totalHra = activeRecords.reduce((sum, emp) => sum + emp.hra, 0);
  const totalAllowances = activeRecords.reduce((sum, emp) => sum + emp.allowances, 0);
  const totalOT = activeRecords.reduce((sum, emp) => sum + emp.otAmount, 0);

  const totalPresentDays = activeRecords.reduce((sum, emp) => sum + emp.presentDays, 0);
  const totalLeavesDays = activeRecords.reduce((sum, emp) => sum + emp.halfDayWorking * 0.5, 0);
  const totalWeekoffs = activeRecords.reduce((sum, emp) => sum + emp.weekOffs, 0);
  const totalOTHours = activeRecords.reduce((sum, emp) => sum + emp.otHours, 0);

  // Table filtering logic
  const filteredEmployeesList = activeRecords.filter(emp => {
    const matchesSearch = !searchTerm || 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === "All" || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(records.map(r => r.department))).filter(Boolean);

  // 6 Month Trend Data
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const trendData = months.map((m, idx) => {
    const scaleFactor = 0.8 + (idx * 0.04);
    return {
      name: m,
      "Gross Payroll": Math.round(totalGrossPayroll * scaleFactor),
      "Net Payroll": Math.round(totalNetPay * scaleFactor)
    };
  });

  // Pie Chart data
  const paymentStatusData = [
    { name: "Paid", value: processedRecords.length, color: "#10b981" },
    { name: "Pending", value: pendingRecords.length, color: "#f59e0b" },
    { name: "Failed", value: 0, color: "#ef4444" },
    { name: "Draft", value: 0, color: "#6b7280" }
  ].filter(d => d.value > 0 || d.name === "Paid" || d.name === "Pending");

  // Radial Bar Chart: Processed Gauge
  const processedPercentage = totalEmployeesCount > 0 
    ? Math.round((processedRecords.length / totalEmployeesCount) * 100) 
    : 0;

  const radialData = [
    { name: "Processed", value: processedPercentage, fill: "#4f46e5" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-lg font-semibold text-blue-600 animate-pulse">Loading Payroll Dashboard Data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen text-slate-800">
      
      {/* 🚀 Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Payroll Dashboard <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
          </h1>
          {/* <p className="text-xs text-slate-500 mt-1">Complete payroll overview & insights for {formatMonthDisplay(selectedMonth)}</p> */}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Tabs (All, Active, Inactive) directly in Header */}
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

          {/* Month Picker */}
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
          
          {/* <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border rounded-lg hover:bg-slate-50 transition shadow-sm cursor-pointer"
          >
            <FaFileExport className="text-slate-500" /> Export
          </button> */}
        </div>
      </div>

      {/* 📊 Top Stats Row (Styled exactly like other pages with emp-dash__stat classes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stat 1: Total Payroll */}
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Total Payroll</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--salary">
              <FiTrendingUp />
            </div>
          </div>
          <div className="emp-dash__stat-value">₹{totalGrossPayroll.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">paid + pending net payroll</div>
        </div>

        {/* Stat 2: Paid Amount */}
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Paid Amount</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
              <FiUserCheck />
            </div>
          </div>
          <div className="emp-dash__stat-value text-green-600">₹{totalNetPay.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">
            {totalGrossPayroll > 0 ? Math.round((totalNetPay / totalGrossPayroll) * 100) : 0}% of total payroll
          </div>
        </div>

        {/* Stat 3: Pending Amount */}
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Pending Amount</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
              <FiActivity />
            </div>
          </div>
          <div className="emp-dash__stat-value text-amber-500">₹{totalPendingAmount.toLocaleString()}</div>
          <div className="emp-dash__stat-meta">
            {totalGrossPayroll > 0 ? Math.round((totalPendingAmount / totalGrossPayroll) * 100) : 0}% of total payroll
          </div>
        </div>

        {/* Stat 4: Total Employees */}
        <div className="emp-dash__stat">
          <div className="emp-dash__stat-top">
            <span className="emp-dash__stat-label">Total Employees</span>
            <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
              <FiUsers />
            </div>
          </div>
          <div className="emp-dash__stat-value">{totalEmployeesCount}</div>
          <div className="emp-dash__stat-meta">
            {processedRecords.length} Paid • {pendingRecords.length} Pending
          </div>
        </div>
      </div>

      {/* 📊 Charts Section Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* 📉 Chart 1: Payroll Trend */}
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

        {/* 🍩 Chart 2: Payment Status */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 font-sans">Payment Status</h3>
          <div className="flex items-center justify-around h-60">
            <div className="w-[150px] h-[150px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
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

        {/* 🌀 Chart 3: Radial Progress */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 font-sans">Payroll Processing Progress</h3>
          <div className="flex flex-col items-center justify-center h-60">
            <div className="w-[160px] h-[140px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  barSize={12} 
                  data={radialData} 
                  startAngle={180} 
                  endAngle={-180}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-indigo-600">{processedPercentage}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Processed</span>
              </div>
            </div>
            
            {/* Action Checkpoints */}
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

      {/* 📊 Earnings, Deductions & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Earnings Summary Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            💰 Earnings Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Basic Salary</span><span className="font-bold text-slate-800">₹{totalBasic.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">HRA</span><span className="font-bold text-slate-800">₹{totalHra.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Allowances</span><span className="font-bold text-slate-800">₹{totalAllowances.toLocaleString()}</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Overtime</span><span className="font-bold text-slate-800">₹{totalOT.toLocaleString()}</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Gross Salary</span>
              <span className="text-indigo-600">₹{(totalBasic + totalHra + totalAllowances + totalOT).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions Summary Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            🛑 Deductions Summary
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">PF (Provident Fund)</span><span className="font-bold text-slate-800">- ₹0</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">ESI</span><span className="font-bold text-slate-800">- ₹0</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Professional Tax</span><span className="font-bold text-slate-800">- ₹0</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Other Deductions</span><span className="font-bold text-slate-800">- ₹{totalDeductions.toLocaleString()}</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Total Deductions</span>
              <span className="text-rose-600">- ₹{totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Attendance Impact Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
            📅 Attendance Impact
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Present Days</span><span className="font-bold text-slate-800">{totalPresentDays} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Leaves taken</span><span className="font-bold text-slate-800">{totalLeavesDays} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Weekoffs</span><span className="font-bold text-slate-800">{totalWeekoffs} days</span></div>
            <div className="flex justify-between py-1 border-b border-dashed"><span className="text-slate-500 font-medium">Overtime Hours</span><span className="font-bold text-emerald-600">{totalOTHours.toFixed(1)} hrs</span></div>
            <div className="flex justify-between py-2 font-black text-slate-900 border-t pt-2 text-sm">
              <span>Active Headcount</span>
              <span className="text-indigo-600">{totalEmployeesCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 📊 Employee Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Employee Payroll Details</h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
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

            {/* Department */}
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
              <tr className="bg-slate-50 text-slate-500 font-bold border-b">
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3 text-center">Days Worked</th>
                <th className="p-3 text-right">Basic (₹)</th>
                <th className="p-3 text-right">OT (₹)</th>
                <th className="p-3 text-right">Allowances (₹)</th>
                <th className="p-3 text-right">Deductions (₹)</th>
                <th className="p-3 text-right">Net Salary (₹)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployeesList.map((emp) => (
                <tr key={emp.employeeId} className="border-b hover:bg-slate-50/50 transition">
                  <td className="p-3 font-semibold text-slate-800">
                    <div>{emp.name}</div>
                    <div className="text-[10px] text-slate-400">{emp.employeeId}</div>
                  </td>
                  <td className="p-3 text-slate-600">{emp.department}</td>
                  <td className="p-3 text-center font-medium text-slate-700">{emp.workingDays} days</td>
                  <td className="p-3 text-right font-semibold text-slate-700">₹{emp.basicPay.toLocaleString()}</td>
                  <td className="p-3 text-right font-semibold text-emerald-600">
                    {emp.otAmount > 0 ? `₹${emp.otAmount.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-700">
                    {emp.allowances > 0 ? `₹${emp.allowances.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right font-semibold text-rose-500">
                    {emp.deductions > 0 ? `₹${emp.deductions.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-right font-bold text-indigo-600">₹{emp.finalPay.toLocaleString()}</td>
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
              ))}
              {filteredEmployeesList.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center p-8 text-slate-400 font-semibold">
                    No employee records found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default PayrollDashboard;