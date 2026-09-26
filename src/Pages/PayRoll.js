import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaUserTag,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";
import {
  FiFilter,
  FiMapPin,
  FiUserCheck,
  FiUsers,
  FiCoffee,
  FiTrendingUp,
  FiChevronUp,
  FiChevronDown,
  FiUserMinus,
  FiX
} from "react-icons/fi";
import companyStamp from "../Images/company-stamp-1780465131172.png";
import { useNavigate } from "react-router-dom";
import StatCard from "../Components/StatCard";
import { API_BASE_URL } from "../config";
import logo from "../Images/Timelyhealth logo.png";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "../index.css";
import "./EmployeeDashboard.css";
import "./AttendanceSummary.css";

// ============================================
// 📅 HELPER: Format date to YYYY-MM-DD (LOCAL)
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
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getManualDeduction = (employeeId, month) => {
  try {
    const saved = localStorage.getItem(`manualDeduction_${month}`);
    if (!saved) return { amount: 0, reason: '' };
    const map = JSON.parse(saved);
    return map[employeeId] || { amount: 0, reason: '' };
  } catch {
    return { amount: 0, reason: '' };
  }
};

// ============================================
// ✅ WEEK-OFF HELPERS
// ============================================
const getWeekOffDatesForEmployee = (weekOffDatesMap, employeeId) => {
  if (!weekOffDatesMap || !employeeId) return [];
  return weekOffDatesMap[employeeId] || [];
};

// ============================================
// ✅ COMP-OFF HELPERS
// ============================================
const getCompOffDatesForEmployee = (compOffDatesMap, employeeId) => {
  if (!compOffDatesMap || !employeeId) return [];
  return compOffDatesMap[employeeId] || [];
};

// ============================================
// ✅ HOLIDAY DEPARTMENT HELPERS
// ============================================
const holidayAppliesToDepartment = (holiday, employeeDepartment) => {
  if (!holiday) return false;

  let depts = [];

  // Priority 1: departments array
  if (Array.isArray(holiday.departments) && holiday.departments.length > 0) {
    depts = holiday.departments.filter(d => d && typeof d === 'string');
  }

  // Priority 2: department string (agar array empty hai)
  if (depts.length === 0 && holiday.department && typeof holiday.department === 'string') {
    const depStr = holiday.department.trim();
    if (depStr.toLowerCase() !== "all" && depStr.toLowerCase() !== "all departments") {
      depts = depStr.split(",").map(d => d.trim()).filter(Boolean);
    }
  }

  // ✅ Agar koi specific dept nahi → sab employees ko milega
  if (depts.length === 0) return true;

  // ✅ Agar "All" hai → sab ko milega
  if (depts.some(d => d.toLowerCase() === "all" || d.toLowerCase() === "all departments")) {
    return true;
  }

  // ✅ Agar employee ka dept nahi hai → sab ko milega (safe fallback)
  if (!employeeDepartment) return true;

  // ✅ Strict match
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

// Calculate earned week-offs based on admin-assigned dates only
const calculateEarnedWeekOffs = (employeeId, year, monthNum, dailyAttendance, employeeLeavesData, weekOffDates, shiftHours = 8, holidayDaysInMonth = 0) => {
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);

  const weekOffDateSet = new Set(weekOffDates || []);
  const totalWeekOffDays = weekOffDateSet.size;

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

  const weeklyBreakdown = [];
  let currentWeekStart = new Date(firstDay);
  while (currentWeekStart.getDay() !== 1) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 1);
  }

  let weekNumber = 1;
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
      const isWeekOff = weekOffDateSet.has(dateKey);

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

    if (isEligibleForWeekoff) eligibleWeeks++;

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  const totalActiveDays = totalWorkingDays + totalLeaves + holidayDaysInMonth;
  let earnedWeekOffs = Math.max(eligibleWeeks, Math.floor(totalActiveDays / 5));
  earnedWeekOffs = Math.min(earnedWeekOffs, totalWeekOffDays);

  return {
    weeklyBreakdown: weeklyBreakdown,
    earnedWeekOffs: earnedWeekOffs,
    totalWeekOffDays: totalWeekOffDays,
    weekOffDates: Array.from(weekOffDateSet).sort()
  };
};

const PayRoll = () => {
  const [records, setRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [employeeAttendanceDetails, setEmployeeAttendanceDetails] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});
  const navigate = useNavigate();

  const [weekOffDatesMap, setWeekOffDatesMap] = useState({});
  const [compOffDatesMap, setCompOffDatesMap] = useState({});

  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [employeeCompOffs, setEmployeeCompOffs] = useState({});
  const [compOffDetails, setCompOffDetails] = useState({});

  const [editFormData, setEditFormData] = useState({});
  const [extraWorkData, setExtraWorkData] = useState({
    extraDays: 0,
    extraHours: 0,
    overtimeRate: 0,
    bonus: 0,
    deductions: 0,
    reason: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  const [filterStatus, setFilterStatus] = useState("active");

  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthDays, setMonthDays] = useState(30);
  const [showOTModal, setShowOTModal] = useState(false);
  const [selectedOTEmployees, setSelectedOTEmployees] = useState(() => {
    const saved = localStorage.getItem("payrollSelectedOTEmployees");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [weekOffConfig, setWeekOffConfig] = useState({
    weekOffDay: "",
    weekOffType: "0+4",
    manualDays: ""
  });

  const [manualDeductionMap, setManualDeductionMap] = useState({});

  const getSavedItemsPerPage = () => {
    try {
      const saved = localStorage.getItem('payroll_itemsPerPage');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [5, 10, 20, 50].includes(parsed)) {
          return parsed;
        }
      }
      return 10;
    } catch (e) {
      return 10;
    }
  };

  const [itemsPerPage, setItemsPerPage] = useState(getSavedItemsPerPage);

  useEffect(() => {
    const saved = getSavedItemsPerPage();
    setItemsPerPage(saved);
  }, []);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    companyName: "Timely Health Tech Pvt Ltd",
    address: "H. No: 1-98/9/25/p, # 301, 3rd Floor, Sri Sai Balaji Avenue,\nArunodaya Colony, Madhapur, Hyderabad, TG - 500081",
    logo: logo
  });

  const [approvedOTClaims, setApprovedOTClaims] = useState([]);
  const [approvedOTMap, setApprovedOTMap] = useState({});

  const medicalRoles = [
    "Phlebotomist", "Staff Nurse", "Consultant", "Pharmacist",
    "Nurse", "Doctor", "Lab Technician", "Medical Officer",
    "Physician", "Surgeon", "Radiologist", "Pathologist",
    "Therapist", "Healthcare", "Medical", "Clinical"
  ];

  const isMedicalRole = (role) => {
    if (!role) return false;
    return medicalRoles.some(medRole =>
      role.toLowerCase().includes(medRole.toLowerCase())
    );
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

  const getEmployeeShiftHours = (employeeId) => {
    const employeeData = employeesMasterData[employeeId] || {};
    return employeeData.shiftHours || 9;
  };

  const calculateOTForEmployee = (employeeId, hoursWorked) => {
    const h = Number(hoursWorked) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);

    if (h > shiftHours) {
      return Number((h - shiftHours).toFixed(2));
    }
    return 0;
  };

  // ============================================
  // ✅ Fetch week-off dates from backend
  // ============================================
  const fetchWeekOffDatesForEmployees = useCallback(async (employeeIds, month) => {
    if (!employeeIds || employeeIds.length === 0 || !month) return {};

    const result = {};
    const BATCH_SIZE = 10;
    for (let i = 0; i < employeeIds.length; i += BATCH_SIZE) {
      const batch = employeeIds.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (empId) => {
          try {
            const url = `${API_BASE_URL}/shifts/employee-weekoff-dates?employeeId=${encodeURIComponent(empId)}&month=${month}`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.weekOffDates)) {
                result[empId] = data.weekOffDates;
              } else {
                result[empId] = [];
              }
            } else {
              result[empId] = [];
            }
          } catch (err) {
            console.warn(`WeekOff fetch failed for ${empId}:`, err.message);
            result[empId] = [];
          }
        })
      );
    }

    return result;
  }, []);

  // ============================================
  // ✅ Fetch comp-off dates from backend
  // ============================================
  const fetchCompOffDatesForEmployees = useCallback(async (employeeIds, month) => {
    if (!employeeIds || employeeIds.length === 0 || !month) return {};

    const result = {};
    try {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      const response = await fetch(`${API_BASE_URL}/leaves/comp-offs?status=approved`);
      const compOffs = await response.json();

      if (Array.isArray(compOffs)) {
        compOffs.forEach(co => {
          const workDate = new Date(co.workDate);
          if (workDate >= startDate && workDate <= endDate) {
            const empId = co.employeeId;
            if (!result[empId]) {
              result[empId] = [];
            }
            result[empId].push({
              date: formatDateLocal(co.workDate),
              count: co.count || 1,
              reason: co.reason || '',
              workDate: co.workDate,
              _id: co._id
            });
          }
        });
      }
    } catch (err) {
      console.warn("CompOff fetch failed:", err.message);
    }

    return result;
  }, []);

  const fetchApprovedOTClaims = useCallback(async (month) => {
    try {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      const response = await fetch(`${API_BASE_URL}/employees/allotclaimed?status=approved`);
      const data = await response.json();

      if (data.success) {
        const monthClaims = data.claims.filter(claim => {
          const claimDate = new Date(claim.date);
          return claimDate >= startDate && claimDate <= endDate;
        });

        setApprovedOTClaims(monthClaims);

        const otMap = {};
        monthClaims.forEach(claim => {
          const empId = claim.employeeId;
          if (!otMap[empId]) {
            otMap[empId] = {
              totalOTHours: 0,
              totalOTAmount: 0,
              count: 0,
              claims: []
            };
          }
          otMap[empId].totalOTHours += claim.otHours || 0;
          otMap[empId].totalOTAmount += claim.otAmount || 0;
          otMap[empId].count += 1;
          otMap[empId].claims.push(claim);
        });

        setApprovedOTMap(otMap);
      }
    } catch (error) {
      console.error("Error fetching approved OT claims:", error);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (selectedMonth) {
      fetchApprovedOTClaims(selectedMonth);
    }
  }, [selectedMonth, fetchApprovedOTClaims]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`manualDeduction_${selectedMonth}`);
      setManualDeductionMap(saved ? JSON.parse(saved) : {});
    } catch {
      setManualDeductionMap({});
    }
  }, [selectedMonth]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith('otApplied_') || e.key.startsWith('manualDeduction_'))) {
        fetchData(selectedMonth);
      }
    };

    const handleOTUpdate = () => {
      fetchData(selectedMonth);
    };

    const handleDeductionUpdate = () => {
      try {
        const saved = localStorage.getItem(`manualDeduction_${selectedMonth}`);
        setManualDeductionMap(saved ? JSON.parse(saved) : {});
      } catch { setManualDeductionMap({}); }
      fetchData(selectedMonth);
    };

    const handlePayrollOTUpdate = () => {
      fetchData(selectedMonth);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('otUpdated', handleOTUpdate);
    window.addEventListener('deductionUpdated', handleDeductionUpdate);
    window.addEventListener('payrollOTUpdated', handlePayrollOTUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('otUpdated', handleOTUpdate);
      window.removeEventListener('deductionUpdated', handleDeductionUpdate);
      window.removeEventListener('payrollOTUpdated', handlePayrollOTUpdate);
    };
  }, [selectedMonth]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem("payrollTemplateConfig");
    if (savedTemplate) {
      setTemplateConfig(JSON.parse(savedTemplate));
    }
  }, []);

  const handleTemplateSave = () => {
    localStorage.setItem("payrollTemplateConfig", JSON.stringify(templateConfig));
    setShowTemplateModal(false);
    alert("✅ Template settings saved successfully!");
  };

  const handleOTEmployeeSelection = (employeeId) => {
    const updated = new Set(selectedOTEmployees);
    if (updated.has(employeeId)) {
      updated.delete(employeeId);
    } else {
      updated.add(employeeId);
    }
    setSelectedOTEmployees(updated);
    localStorage.setItem("payrollSelectedOTEmployees", JSON.stringify(Array.from(updated)));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplateConfig(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const ATTENDANCE_SUMMARY_API_URL = `${API_BASE_URL}/attendancesummary/get`;
  const ATTENDANCE_CALCULATE_API_URL = `${API_BASE_URL}/attendancesummary/calculate`;
  const ATTENDANCE_DETAILS_API_URL = `${API_BASE_URL}/attendance/allattendance`;
  const LEAVES_API_URL = `${API_BASE_URL}/leaves/leaves?status=approved`;
  const COMPOFF_API_URL = `${API_BASE_URL}/leaves/comp-offs`;
  const EMPLOYEES_API_URL = `${API_BASE_URL}/employees/get-employees`;
  const UPDATE_PAYROLL_API_URL = `${API_BASE_URL}/attendancesummary/updatePayroll`;

  const getDaysInMonth = (monthStr) => {
    if (!monthStr) return new Date().getDate();
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
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
      const currentMonthDays = overlapStart <= overlapEnd ? Math.ceil(Math.abs(overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1 : 0;

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

    setEmployeeLeaves(leavesMap);
    return leavesMap;
  }, []);

  const processCompOffData = useCallback(async (selectedMonth, leavesData) => {
    try {
      const [year, monthNum] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

      const response = await axios.get(COMPOFF_API_URL);
      const compOffs = response.data || [];

      const compOffMap = {};
      const compOffDetailsMap = {};

      for (const co of compOffs) {
        if (co.status === "approved") {
          const employeeId = co.employeeId;
          const workDate = new Date(co.workDate);

          if (workDate >= startOfMonth && workDate <= endOfMonth) {
            if (!compOffMap[employeeId]) {
              compOffMap[employeeId] = { earned: 0, used: 0, balance: 0 };
              compOffDetailsMap[employeeId] = [];
            }
            compOffMap[employeeId].earned += 1;
            compOffDetailsMap[employeeId].push({
              type: 'earned',
              date: co.workDate,
              reason: co.reason || 'Comp-off earned'
            });
          }
        }
      }

      setEmployeeCompOffs(compOffMap);
      setCompOffDetails(compOffDetailsMap);
      return compOffMap;

    } catch (error) {
      console.error("Error fetching comp-offs:", error);
      return {};
    }
  }, [COMPOFF_API_URL]);

  const filterEmployeesByJoiningDate = useCallback((employees, monthStr) => {
    if (!monthStr || !employees.length) return employees;
    return employees.filter(emp => wasEmployeeEmployedInMonth(emp, monthStr));
  }, []);

  const extractUniqueValues = (employees) => {
    const depts = new Set();
    const designations = new Set();
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  };

  const fetchEmployeeAttendance = async (employeeId, month) => {
    setAttendanceLoading(true);
    try {
      let url = `${ATTENDANCE_DETAILS_API_URL}?employeeId=${employeeId}`;
      if (month) url += `&month=${month}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.records && data.records.length > 0) {
        let filteredByMonth = data.records;
        if (month) {
          const [year, monthNum] = month.split('-').map(Number);
          filteredByMonth = data.records.filter(record => {
            const recordDate = new Date(record.checkInTime);
            return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === monthNum;
          });
        }
        const sortedRecords = filteredByMonth.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
        setSelectedEmployeeAttendance(sortedRecords);
      } else {
        setSelectedEmployeeAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      setSelectedEmployeeAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  const handleRowClick = async (employee) => {
    setSelectedEmployee(employee);
    const monthToFetch = selectedMonth || new Date().toISOString().slice(0, 7);
    await fetchEmployeeAttendance(employee.employeeId, monthToFetch);
    setShowAttendancePopup(true);
  };

  const getLiveAttendanceCounts = (employeeId, allAttendanceRecords, employeesMap) => {
    let presentDays = 0;
    let halfDays = 0;
    let totalOtHours = 0;

    const dailyRecords = {};
    allAttendanceRecords.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (!rec.checkInTime) return;

      if (selectedMonth) {
        const recMonth = formatMonthLocal(rec.checkInTime);
        if (recMonth !== selectedMonth) return;
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
      presentDays: presentDays,
      halfDayWorking: halfDays,
      totalWorkingDays: presentDays + (halfDays * 0.5),
      totalOtHours: Number(totalOtHours.toFixed(2))
    };
  };

  const fetchData = useCallback(async (month = "") => {
    let isMounted = true;

    try {
      setLoading(true);
      setError("");

      const includeWeekOffInSalary = shouldIncludeWeekOffInSalary(month);
      const isHistorical = isHistoricalMonth(month);
      const isCurrent = isCurrentMonth(month);
      const targetMonth = month || selectedMonth;

      const [employeesRes, leavesRes, holidaysRes, summaryRes] = await Promise.all([
        fetch(EMPLOYEES_API_URL),
        fetch(LEAVES_API_URL),
        fetch(`${API_BASE_URL}/holidays/all`),
        fetch(`${ATTENDANCE_CALCULATE_API_URL}${targetMonth ? `?month=${targetMonth}` : ''}`)
      ]);

      let employeesData = [];
      if (employeesRes.ok) {
        const employeesDataRaw = await employeesRes.json();
        employeesData = Array.isArray(employeesDataRaw) ? employeesDataRaw : (employeesDataRaw.data || []);
      }

      let leavesData = leavesRes.ok ? await leavesRes.json() : [];
      let holidaysData = holidaysRes.ok ? await holidaysRes.json() : [];

      let summaryData = [];
      if (summaryRes.ok) {
        const json = await summaryRes.json();
        summaryData = json.summary || (Array.isArray(json) ? json : []);
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

      const employeesForMonth = filterEmployeesByJoiningDate(employeesData, targetMonth);

      const employeeIds = employeesForMonth.map(e => e.employeeId);
      const weekOffMap = await fetchWeekOffDatesForEmployees(employeeIds, targetMonth);
      const compOffMap = await fetchCompOffDatesForEmployees(employeeIds, targetMonth);

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
          salaryIncrements: emp.salaryIncrements || [],
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

      if (isMounted) {
        setEmployeesMasterData(employeesMap);
        setAllEmployees(employeesData);
        setWeekOffDatesMap(weekOffMap);
        setCompOffDatesMap(compOffMap);
      }

      extractUniqueValues(employeesForMonth);

      // ✅ Global holidayCount REMOVED — ab per-employee calculate hoga

      const currentLeavesMap = processLeavesData(leavesData, targetMonth);
      const currentCompOffsMap = await processCompOffData(targetMonth, leavesData);

      const [year, monthNum] = targetMonth.split('-').map(Number);
      const daysInMonthValue = getDaysInMonth(targetMonth);
      const processedSalaries = [];

      for (const emp of employeesForMonth) {
        const summary = summaryData.find(x => x.employeeId === emp.employeeId) || {};

        const deptLower = (emp.department || '').toLowerCase().trim();
        const isConsultant = deptLower.includes("consultant");

        const employeeRole = summary.role || emp.role || emp.designation || '';
        const isMedicalStaff = isMedicalRole(employeeRole);

        let attendanceForEmployee = allAttendanceRecords.filter(r => r.employeeId === emp.employeeId);

        // ============================================
        // ✅ NEW: Per-employee holiday count based on department
        // ============================================
        const employeeHolidayCount = calculateHolidayCountForDepartment(
          holidaysData,
          targetMonth,
          emp.department || ''
        );

        const weekOffDates = weekOffMap[emp.employeeId] || [];
        const weekOffData = calculateEarnedWeekOffs(
          emp.employeeId,
          year,
          monthNum,
          attendanceForEmployee,
          currentLeavesMap,
          weekOffDates,
          emp.shiftHours || 8,
          employeeHolidayCount // ✅ Per-employee
        );

        let earnedWeekOffs = weekOffData.earnedWeekOffs;
        let defaultWeekOffs = weekOffDates.length || (isConsultant ? 2 : (emp.weekOffPerMonth || 4));
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

        let presentDaysCount = summary.presentDays ?? 0;
        let halfDaysCount = summary.halfDayWorking ?? 0;
        let totalWorkingDays = summary.totalWorkingDays ?? 0;

        if (presentDaysCount === 0 && halfDaysCount === 0) {
          const liveCounts = getLiveAttendanceCounts(emp.employeeId, allAttendanceRecords, employeesMap);
          presentDaysCount = liveCounts.presentDays;
          halfDaysCount = liveCounts.halfDayWorking;
          totalWorkingDays = liveCounts.totalWorkingDays;
        }

        const fullDayNotWorking = summary.fullDayNotWorking ?? 0;
        const overTimeHours = summary.overTimeHours ?? 0;

        const compOffData = currentCompOffsMap[emp.employeeId] || { balance: 0 };

        // ============================================
        // ✅ COMP-OFF CALCULATION (Single source)
        // ============================================
        const employeeCompOffDates = compOffMap[emp.employeeId] || [];
        const totalCompOffDays = employeeCompOffDates.reduce((sum, co) => sum + (co.count || 1), 0);
        const compOffAmount = totalCompOffDays * dailyRate;

        // ============================================
        // ✅ CARRY FORWARD LOGIC
        // ============================================
        const expectedWorkingDays = Math.max(0, daysInMonthValue - finalWeekOffs);
        const actualDaysWorked = presentDaysCount + (halfDaysCount * 0.5);

        const prevMonth = getPreviousMonth(targetMonth);
        const prevCarryForward = prevMonth
          ? parseFloat(localStorage.getItem(getCarryForwardKey(emp.employeeId, prevMonth)) || '0')
          : 0;

        const adjustedActualDays = actualDaysWorked + prevCarryForward;

        let payablePresentDays;
        let carryForwardDays;

        if (adjustedActualDays > expectedWorkingDays) {
          payablePresentDays = expectedWorkingDays;
          carryForwardDays = Math.round((adjustedActualDays - expectedWorkingDays) * 100) / 100;
        } else {
          payablePresentDays = adjustedActualDays;
          carryForwardDays = 0;
        }

        localStorage.setItem(getCarryForwardKey(emp.employeeId, targetMonth), String(carryForwardDays));

        // ============================================
        // ✅ SALARY CALCULATION — Per-employee holiday
        // ============================================
        let calculatedSalary = 0;
        if (salaryForMonth > 0 && daysInMonthValue > 0) {
          if (presentDaysCount === 0 && halfDaysCount === 0) {
            calculatedSalary = 0;
          } else {
            const holidayAddition = employeeHolidayCount; // ✅ Per-employee
            const effectivePaidDays =
              payablePresentDays +
              (includeWeekOffInSalary ? finalWeekOffs : 0) +
              holidayAddition +
              totalCompOffDays;
            calculatedSalary = effectivePaidDays * dailyRate;
          }
        }

        let totalOTHours = overTimeHours || 0;

        let calculatedOTHours = 0;
        allAttendanceRecords.forEach(record => {
          if (record.employeeId !== emp.employeeId) return;
          if (record.checkInTime) {
            const recordMonth = formatMonthLocal(record.checkInTime);
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

        const approvedOTData = approvedOTMap[emp.employeeId] || { totalOTAmount: 0, totalOTHours: 0 };
        const approvedOTAmount = approvedOTData.totalOTAmount || 0;
        const approvedOTHours = approvedOTData.totalOTHours || 0;

        const baseCalculatedSalary = Math.round(calculatedSalary);

        const dashboardOTHours = savedOTMap[emp.employeeId] !== undefined ? savedOTMap[emp.employeeId] : null;

        let finalOTAmount = 0;
        let otSource = 'none';

        if (approvedOTAmount > 0) {
          finalOTAmount = approvedOTAmount;
          otSource = 'approved';
        }
        else if (dashboardOTHours !== null && dashboardOTHours > 0) {
          const multiplier = 2;
          const shiftHours = emp.shiftHours || 8;
          const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
          finalOTAmount = dashboardOTHours * otRatePerHour * multiplier;
          otSource = 'dashboard';
        }
        else {
          const savedOTEmpsString = localStorage.getItem("payrollSelectedOTEmployees");
          const savedOTEmps = savedOTEmpsString ? new Set(JSON.parse(savedOTEmpsString)) : new Set();
          const isApprovedInOTPage = localStorage.getItem(`otStatus_${emp.employeeId}_${targetMonth}`) === "approved";

          if (totalOTHours > 0 && (savedOTEmps.has(emp.employeeId) || isApprovedInOTPage)) {
            const multiplier = Number(localStorage.getItem(`otMultiplier_${emp.employeeId}_${targetMonth}`)) || 2;
            const shiftHours = emp.shiftHours || 8;
            const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
            finalOTAmount = totalOTHours * otRatePerHour * multiplier;
            otSource = 'manual';
          }
        }

        const manualEntry = savedManualDeductionMap[emp.employeeId] || { amount: 0, reason: '' };
        const manualDeductionAmount = manualEntry.amount || 0;
        const manualDeductionReason = manualEntry.reason || '';

        const finalPay = Math.max(0, Math.round(baseCalculatedSalary + finalOTAmount - manualDeductionAmount));

        const isInactive = isEmployeeHidden(emp);

        const salaryObj = {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department || 'N/A',
          month: targetMonth,

          presentDays: presentDaysCount,
          halfDayWorking: halfDaysCount,
          totalWorkingDays: totalWorkingDays,
          fullDayNotWorking: fullDayNotWorking,
          overTimeHours: totalOTHours,
          overTimeHoursFormatted: formattedOTHours,

          weekOffs: finalWeekOffs,
          earnedWeekOffs: earnedWeekOffs,
          defaultWeekOffs: defaultWeekOffs,
          weekOffDay: emp.weekOffDay,
          weekOffDates: weekOffDates,
          weeklyBreakdown: weekOffData.weeklyBreakdown,

          compOffDates: employeeCompOffDates,
          compOffDays: totalCompOffDays,
          compOffAmount: Math.round(compOffAmount),

          salaryPerMonth: salaryForMonth,
          currentSalary: emp.salaryPerMonth,
          originalSalary: originalSalary,
          salaryPerDay: dailyRate,
          calculatedSalary: baseCalculatedSalary,
          baseCalculatedSalary: baseCalculatedSalary,

          shiftHours: emp.shiftHours || 8,
          finalOTAmount: Math.round(finalOTAmount),
          finalPay: finalPay,
          otAmount: Math.round(finalOTAmount),
          hasApprovedOT: approvedOTAmount > 0,
          approvedOTAmount: approvedOTAmount,
          approvedOTHours: approvedOTHours,

          dashboardOTHours: dashboardOTHours,
          otSource: otSource,

          manualDeduction: manualDeductionAmount,
          manualDeductionReason: manualDeductionReason,

          holidayCount: employeeHolidayCount, // ✅ Per-employee
          monthDays: daysInMonthValue,
          includeWeekOffInSalary: includeWeekOffInSalary,
          isHistoricalMonth: isHistorical,
          isCurrentMonth: isCurrent,
          role: employeeRole,
          isMedicalStaff: isMedicalStaff,
          incrementDetails: incrementDetails,
          _id: emp._id,
          basicPay: emp.basicPay,
          hra: emp.hra,
          conveyanceAllowance: emp.conveyanceAllowance,
          medicalAllowance: emp.medicalAllowance,
          performanceAllowance: emp.performanceAllowance,
          specialAllowance: emp.specialAllowance,
          gmcAmount: emp.gmc,
          ptax: emp.profTax,
          otherDeductions: emp.otherDeductions,

          expectedWorkingDays: expectedWorkingDays,
          payablePresentDays: payablePresentDays,
          carryForwardDays: carryForwardDays,
          carryForwardFromPrev: prevCarryForward,

          isInactive: isInactive
        };

        processedSalaries.push(salaryObj);
      }

      if (isMounted) {
        setRecords(processedSalaries);
        setFilteredRecords(processedSalaries);
      }

    } catch (err) {
      console.error("ERROR:", err);
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsLoadingMonth(false);
      }
    }
  }, [EMPLOYEES_API_URL, LEAVES_API_URL, API_BASE_URL, ATTENDANCE_CALCULATE_API_URL, ATTENDANCE_DETAILS_API_URL, processLeavesData, filterEmployeesByJoiningDate, processCompOffData, selectedMonth, approvedOTMap, fetchWeekOffDatesForEmployees, fetchCompOffDatesForEmployees]);

  useEffect(() => {
    if (records.length === 0) return;

    const savedOTMapNow = (() => {
      try {
        const saved = localStorage.getItem(`otApplied_${selectedMonth}`);
        return saved ? JSON.parse(saved) : {};
      } catch { return {}; }
    })();

    const savedDeductionMapNow = (() => {
      try {
        const saved = localStorage.getItem(`manualDeduction_${selectedMonth}`);
        return saved ? JSON.parse(saved) : {};
      } catch { return {}; }
    })();

    const processRecordsWithAdditions = (prevRecords) =>
      prevRecords.map(record => {
        let baseSalary = record.baseCalculatedSalary || record.calculatedSalary || 0;
        let otAmount = 0;

        const dashboardOTHours = savedOTMapNow[record.employeeId] !== undefined ? savedOTMapNow[record.employeeId] : null;

        if (record.hasApprovedOT) {
          otAmount = record.approvedOTAmount || 0;
        } else if (dashboardOTHours !== null && dashboardOTHours > 0) {
          const dailyRate = record.salaryPerDay || 0;
          const shiftHours = record.shiftHours || 8;
          const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
          otAmount = dashboardOTHours * otRatePerHour * 2;
        } else {
          const isApprovedInOTPage = localStorage.getItem(`otStatus_${record.employeeId}_${selectedMonth}`) === "approved";
          if (record.overTimeHours > 0 && (selectedOTEmployees.has(record.employeeId) || isApprovedInOTPage)) {
            const dailyRate = record.salaryPerDay || 0;
            const shiftHours = record.shiftHours || 8;
            const multiplier = Number(localStorage.getItem(`otMultiplier_${record.employeeId}_${selectedMonth}`)) || 2;
            const otRatePerHour = shiftHours > 0 ? dailyRate / shiftHours : 0;
            otAmount = record.overTimeHours * otRatePerHour * multiplier;
          }
        }

        const manualEntry = savedDeductionMapNow[record.employeeId] || { amount: 0, reason: '' };
        const manualDeductionAmount = manualEntry.amount || 0;
        const manualDeductionReason = manualEntry.reason || '';

        return {
          ...record,
          dashboardOTHours: dashboardOTHours,
          calculatedSalary: Math.round(baseSalary),
          otAmount: Math.round(otAmount),
          finalOTAmount: Math.round(otAmount),
          manualDeduction: manualDeductionAmount,
          manualDeductionReason: manualDeductionReason,
          finalPay: Math.max(0, Math.round(baseSalary + otAmount - manualDeductionAmount))
        };
      });

    const updatedRecords = processRecordsWithAdditions(records);
    setRecords(updatedRecords);
    setFilteredRecords(updatedRecords);
  }, [employeeCompOffs, employeeLeaves, employeesMasterData, monthDays, selectedMonth, selectedOTEmployees, approvedOTMap, manualDeductionMap]);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [fetchData, selectedMonth]);

  useEffect(() => {
    let filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.toString().includes(searchTerm)
    );

    if (filterStatus === 'active') {
      filtered = filtered.filter(record => !record.isInactive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(record => record.isInactive);
    }

    if (filterDepartment) {
      filtered = filtered.filter(record => record.department === filterDepartment);
    }

    if (filterDesignation) {
      filtered = filtered.filter(record => record.designation === filterDesignation);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterDesignation, records, filterStatus]);

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");
  };

  const handleDateRangeFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    const fromMonth = fromDate.slice(0, 7);
    const toMonth = toDate.slice(0, 7);

    if (fromMonth !== toMonth) {
      alert("Date range must be within the same month");
      return;
    }

    setSelectedMonth(fromMonth);
    fetchData(fromMonth);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFilterStatus("all");
    setFromDate("");
    setToDate("");
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
    fetchData(currentMonth);
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    try {
      localStorage.setItem('payroll_itemsPerPage', String(newValue));
    } catch (error) {
      console.error('❌ Save error:', error);
    }
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  const getActiveCount = () => records.filter(record => !record.isInactive).length;
  const getInactiveCount = () => records.filter(record => record.isInactive).length;

  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePageClick = (pageNumber) => { setCurrentPage(pageNumber); };

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const calculateSalary = (employee) => employee.calculatedSalary || 0;

  const calculateDailyRate = (employee) => {
    const salary = employee.salaryPerMonth || 0;
    if (!salary || salary === 0) return 0;
    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    return (salary / daysInMonth).toFixed(2);
  };

  const getEmployeeData = (employee) => {
    const masterData = employeesMasterData[employee.employeeId] || {};
    const employeeFromList = allEmployees.find(emp => emp.employeeId === employee.employeeId);

    return {
      ...masterData,
      salaryPerMonth: employee.salaryPerMonth || masterData.salaryPerMonth || 0,
      masterSalaryPerMonth: masterData.salaryPerMonth || 0,
      shiftHours: masterData.shiftHours || 8,
      weekOffPerMonth: employee.weekOffs || masterData.weekOffPerMonth || 0,
      name: employee.name || masterData.name || '',
      designation: employee.designation || masterData.designation || '',
      department: employee.department || masterData.department || '',
      joiningDate: masterData.joiningDate || employee.joinDate || '',
      bankName: employeeFromList?.bankName || masterData.bankName || employee.bankName || '',
      bankAccount: masterData.bankAccount || employeeFromList?.bankAccount || employee.bankAccount || '',
      panNo: masterData.panCard || employeeFromList?.panNumber || employee.panCard || '',
      pfNo: masterData.pfNo || employeeFromList?.pfNumber || '',
      uanNo: masterData.uanNo || employeeFromList?.uanNumber || '',
      esicNo: masterData.esicNo || employeeFromList?.esicNumber || '',
      branch: masterData.branch || employeeFromList?.branch || '',
      employeeId: employee.employeeId,
      weekOffDay: masterData.weekOffDay || '',
      weekOffType: masterData.weekOffType || '0+4',
      status: employee.status || masterData.status || 'active',
      basicPay: employee.basicPay || masterData.basicPay || employeeFromList?.basicPay || 0,
      hra: employee.hra || masterData.hra || employeeFromList?.hra || 0,
      conveyanceAllowance: employee.conveyanceAllowance || masterData.conveyanceAllowance || employeeFromList?.conveyanceAllowance || 0,
      medicalAllowance: employee.medicalAllowance || masterData.medicalAllowance || employeeFromList?.medicalAllowance || 0,
      performanceAllowance: employee.performanceAllowance || masterData.performanceAllowance || employeeFromList?.performanceAllowance || 0,
      specialAllowance: employee.specialAllowance || masterData.specialAllowance || employeeFromList?.specialAllowance || 0,
      gmc: employee.gmcAmount || masterData.gmc || employeeFromList?.gmcAmount || 0,
      profTax: employee.ptax || masterData.profTax || employeeFromList?.ptax || 0,
      otherDeductions: employee.otherDeductions || masterData.otherDeductions || employeeFromList?.otherDeductions || 0
    };
  };

  const getWeekOffDaysForDisplay = (employee) => {
    return employee.weekOffs || 0;
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDaysForSalary = employee.weekOffs || 0;

    setEditFormData({
      presentDays: employee.presentDays || 0,
      workingDays: employee.totalWorkingDays || 0,
      halfDayWorking: employee.halfDayWorking || 0,
      fullDayNotWorking: employee.fullDayNotWorking || 0,
      calculatedSalary: employee.calculatedSalary || 0,
      weekOffDays: weekOffDaysForSalary,
      holidays: employee.holidayCount || 0,
      CL: leaves.CL,
      EL: leaves.EL,
      COFF: leaves.COFF,
      LOP: leaves.LOP,
      dailyRate: calculateDailyRate(employee)
    });

    setExtraWorkData({
      extraDays: employee.extraWork?.extraDays || 0,
      extraHours: employee.extraWork?.extraHours || 0,
      overtimeRate: 0,
      bonus: employee.extraWork?.bonus || 0,
      deductions: employee.extraWork?.deductions || 0,
      reason: employee.extraWork?.reason || ""
    });

    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const leaves = employeeLeaves[selectedEmployee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const weekOffDays = editFormData.weekOffDays || 0;
    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = editFormData.presentDays || 0;
    const halfDays = editFormData.halfDayWorking || 0;
    const holidays = editFormData.holidays || selectedEmployee.holidayCount || 0;
    const effectiveWorkingDays = workingDays + (0.5 * halfDays);
    const compOffData = employeeCompOffs[selectedEmployee.employeeId];
    const compOffBalance = compOffData?.balance || 0;

    const employeeCompOffDates = compOffDatesMap[selectedEmployee.employeeId] || [];
    const totalCompOffDays = employeeCompOffDates.reduce((sum, co) => sum + (co.count || 1), 0);

    const expectedWorkingDays = selectedEmployee.expectedWorkingDays || (daysInMonth - weekOffDays);

    let paidDays = 0;
    if (workingDays > 0 || halfDays > 0) {
      const rawPaidDays = effectiveWorkingDays + weekOffDays + holidays + compOffBalance + totalCompOffDays;
      paidDays = Math.min(rawPaidDays, expectedWorkingDays + weekOffDays + holidays + compOffBalance + totalCompOffDays);
    }
    let baseSalary = paidDays * dailyRate;

    const extraDaysAmount = (extraWorkData.extraDays || 0) * dailyRate;
    const bonus = extraWorkData.bonus || 0;
    const deductions = extraWorkData.deductions || 0;
    const totalExtraAmount = extraDaysAmount + bonus - deductions;

    const manualEntry = getManualDeduction(selectedEmployee.employeeId, selectedEmployee.month || selectedMonth);
    const manualDeductionAmount = manualEntry.amount || 0;

    const finalSalary = baseSalary + totalExtraAmount - manualDeductionAmount;

    const updatedData = {
      ...editFormData,
      calculatedSalary: Math.round(finalSalary),
      manualDeduction: manualDeductionAmount,
      manualDeductionReason: manualEntry.reason || '',
      extraWork: {
        extraDays: extraWorkData.extraDays || 0,
        extraHours: extraWorkData.extraHours || 0,
        overtimeRate: 0,
        overtimeAmount: 0,
        bonus: bonus,
        deductions: deductions,
        totalExtraAmount: totalExtraAmount,
        reason: extraWorkData.reason || ""
      }
    };

    try {
      const response = await fetch(UPDATE_PAYROLL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.employeeId,
          month: selectedEmployee.month || selectedMonth,
          calculatedSalary: Math.round(finalSalary),
          extraWork: updatedData.extraWork,
          presentDays: editFormData.presentDays,
          workingDays: editFormData.workingDays,
          halfDayWorking: editFormData.halfDayWorking,
          fullDayNotWorking: editFormData.fullDayNotWorking,
          weekOffDays: weekOffDays,
          holidays: editFormData.holidays || selectedEmployee.holidayCount || 0,
          compOffDays: totalCompOffDays
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save changes");
      }

      const updatedRecords = records.map(record => {
        if (record.employeeId === selectedEmployee.employeeId) {
          const serverSummary = result.summary || {};
          return {
            ...record,
            ...updatedData,
            extraWork: serverSummary.extraWork || updatedData.extraWork,
            calculatedSalary: serverSummary.calculatedSalary !== undefined ? serverSummary.calculatedSalary : updatedData.calculatedSalary,
            presentDays: serverSummary.presentDays !== undefined ? serverSummary.presentDays : record.presentDays,
            totalWorkingDays: serverSummary.totalWorkingDays !== undefined ? serverSummary.totalWorkingDays : record.totalWorkingDays
          };
        }
        return record;
      });

      setRecords(updatedRecords);
      setFilteredRecords(prev => prev.map(r =>
        r.employeeId === selectedEmployee.employeeId ? updatedRecords.find(ur => ur.employeeId === selectedEmployee.employeeId) : r
      ));

      setShowEditModal(false);
      alert("Salary details saved successfully!");
    } catch (error) {
      console.error("Error saving payroll:", error);
      alert("Failed to save payroll changes: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleExtraWorkChange = (e) => {
    const { name, value } = e.target;
    setExtraWorkData(prev => ({
      ...prev,
      [name]: name === 'reason' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleReset = () => {
    if (!selectedEmployee) return;

    const employeeData = getEmployeeData(selectedEmployee);
    const weekOffDays = selectedEmployee.weekOffs || 0;
    const daysInMonth = selectedEmployee.monthDays || monthDays || getDaysInMonth(selectedEmployee.month || selectedMonth);
    const dailyRate = employeeData.salaryPerMonth / daysInMonth;

    const workingDays = selectedEmployee.presentDays || 0;
    const holidays = selectedEmployee.holidayCount || 0;
    const compOffData = employeeCompOffs[selectedEmployee.employeeId];
    const compOffBalance = compOffData?.balance || 0;

    const employeeCompOffDates = compOffDatesMap[selectedEmployee.employeeId] || [];
    const totalCompOffDays = employeeCompOffDates.reduce((sum, co) => sum + (co.count || 1), 0);

    const expectedWorkingDays = selectedEmployee.expectedWorkingDays || (daysInMonth - weekOffDays);

    let paidDays = 0;
    if (workingDays > 0 || (selectedEmployee.halfDayWorking || 0) > 0) {
      const rawPaidDays = workingDays + (selectedEmployee.halfDayWorking || 0) * 0.5 + weekOffDays + holidays + compOffBalance + totalCompOffDays;
      paidDays = Math.min(rawPaidDays, expectedWorkingDays + weekOffDays + holidays + compOffBalance + totalCompOffDays);
    }

    const manualEntry = getManualDeduction(selectedEmployee.employeeId, selectedEmployee.month || selectedMonth);
    const systemCalculatedSalary = Math.round(paidDays * dailyRate - (manualEntry.amount || 0));

    setEditFormData({
      ...editFormData,
      calculatedSalary: systemCalculatedSalary,
      weekOffDays: weekOffDays,
    });

    setExtraWorkData({
      extraDays: 0,
      extraHours: 0,
      overtimeRate: 0,
      bonus: 0,
      deductions: 0,
      reason: "Reset to system calculation"
    });

    alert("Values reset to system calculation. Click 'Save Changes' to apply.");
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const downloadInvoice = async (employee) => {
    const employeeMonth = employee.month || selectedMonth;
    const allowed = isPayslipDownloadAllowed(employeeMonth);

    if (!allowed) {
      const daysInMonth = getDaysInMonth(employeeMonth);
      alert(`Payslip download for current month is only allowed on or after the last day of the month (${daysInMonth}th).`);
      return;
    }

    const invoiceContent = generateInvoiceHTML(employee);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();

      try {
        const adminName = localStorage.getItem("adminName") || "Admin";
        const adminId = localStorage.getItem("adminId") || "admin";
        const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("employeeEmail") || "admin@system.com";

        await axios.post("https://api.timelyhealth.in/user-activity/log", {
          userId: adminId,
          userName: adminName,
          userEmail: adminEmail,
          userRole: "admin",
          action: "payslip_download",
          actionDetails: `Downloaded payslip for ${employee.name} (${employee.employeeId}) - ${formatMonthDisplay(employee.month || selectedMonth)}`,
          metadata: {
            employeeId: employee.employeeId,
            employeeName: employee.name,
            month: employee.month || selectedMonth,
            salary: employee.calculatedSalary
          }
        });
      } catch (error) {
        console.error("Failed to log payslip download:", error);
      }
    }
  };

  const generateInvoiceHTML = (employee) => {
    const employeeData = getEmployeeData(employee);

    if (!employeeData.salaryPerMonth || employeeData.salaryPerMonth === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head><title>Payslip</title></head>
        <body style="font-family: Arial; text-align:center; padding:40px;">
          <h2 style="color:red;">Salary Data Not Available</h2>
          <p>Salary information is not available for ${employee?.name || 'this employee'}.</p>
        </body>
        </html>
      `;
    }

    const daysInMonth = employee.monthDays || monthDays || getDaysInMonth(employee.month || selectedMonth);
    const dailyRate = parseFloat(calculateDailyRate(employee)) || 0;
    const compOffData = employeeCompOffs[employee.employeeId] || { earned: 0, used: 0, balance: 0 };

    const actualWeekOffDaysNumeric = employee.weekOffs || 0;

    const presentDays = employee.presentDays ?? 0;
    const halfDays = employee.halfDayWorking || 0;
    const holidays = employee.holidayCount || 0;

    const finalNetPay = employee.finalPay || employee.calculatedSalary || 0;

    const manualDeductionAmount = employee.manualDeduction || 0;
    const manualDeductionReason = employee.manualDeductionReason || '';

    const compOffDays = employee.compOffDays || 0;
    const compOffAmount = employee.compOffAmount || 0;

    const earningsItems = [];

    const basicAmt = employeeData.basicPay || employeeData.salaryPerMonth || 0;
    if (basicAmt > 0) earningsItems.push({ label: 'Basic DA', amount: basicAmt });

    const hraAmt = employeeData.hra || 0;
    if (hraAmt > 0) earningsItems.push({ label: 'HRA', amount: hraAmt });

    const convAmt = employeeData.conveyanceAllowance || 0;
    if (convAmt > 0) earningsItems.push({ label: 'Conveyance', amount: convAmt });

    const specialAmt = employeeData.specialAllowance || 0;
    if (specialAmt > 0) earningsItems.push({ label: 'Special Allowance', amount: specialAmt });

    const otAmount = employee.otAmount || employee.finalOTAmount || 0;
    if (otAmount > 0) {
      earningsItems.push({ label: 'Overtime', amount: otAmount });
    }

    if (compOffAmount > 0) {
      earningsItems.push({ label: `Comp-off (${compOffDays} day${compOffDays > 1 ? 's' : ''})`, amount: compOffAmount });
    }

    const compOffPay = compOffData.balance * dailyRate;
    if (compOffPay > 0 && !compOffAmount) {
      earningsItems.push({ label: 'Comp-off / Holiday Pay', amount: compOffPay });
    }

    earningsItems.push({ label: `Working Days (Full: ${presentDays})`, amount: 0, isInfo: true });
    earningsItems.push({ label: `Week Off Days (${actualWeekOffDaysNumeric})`, amount: 0, isInfo: true });

    if (compOffDays > 0) {
      earningsItems.push({ label: `Comp-off Days (${compOffDays})`, amount: 0, isInfo: true });
    }

    if (holidays > 0) {
      earningsItems.push({ label: `Public Holidays (${holidays})`, amount: 0, isInfo: true });
    }

    const deductionsItems = [];

    let totalPaidDays = presentDays + (halfDays * 0.5) + actualWeekOffDaysNumeric + holidays + compOffData.balance + compOffDays;
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

    const gmcAmt = employee.gmcAmount || employeeData.gmc || 0;
    const ptaxAmt = employee.ptax || employeeData.profTax || 0;
    const extraDeductions = (employee.otherDeductions || 0) + (employee.extraWork?.deductions || 0);
    const totalOtherDeductions = gmcAmt + ptaxAmt + extraDeductions;

    deductionsItems.push({ label: `Other Deductions`, amount: totalOtherDeductions });

    if (manualDeductionAmount > 0) {
      deductionsItems.push({
        label: `Manual Deduction${manualDeductionReason ? ` (${manualDeductionReason})` : ''}`,
        amount: manualDeductionAmount
      });
    }

    const totalEarningsAmt = earningsItems.filter(item => !item.isInfo).reduce((sum, item) => sum + item.amount, 0);
    const totalDeductionsAmt = deductionsItems.reduce((sum, item) => sum + item.amount, 0);

    let tableRowsHTML = '';
    const maxRows = Math.max(earningsItems.length, deductionsItems.length);
    for (let i = 0; i < maxRows; i++) {
      const earn = earningsItems[i];
      const ded = deductionsItems[i];

      let earnAmountStr = '';
      let earnLabel = '';
      if (earn) {
        earnLabel = earn.label;
        earnAmountStr = earn.isInfo ? '-' : `₹${earn.amount.toFixed(2)}`;
      }

      let dedAmountStr = '';
      let dedLabel = '';
      if (ded) {
        dedLabel = ded.label;
        dedAmountStr = `₹${ded.amount.toFixed(2)}`;
      }

      tableRowsHTML += `
        <tr>
          <td style="border: 1px solid #000; padding: 8px 10px; font-size: 12px;">${earnLabel}</td>
          <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-size: 12px;">${earnAmountStr}</td>
          <td style="border: 1px solid #000; padding: 8px 10px; font-size: 12px;">${dedLabel}</td>
          <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-size: 12px;">${dedAmountStr}</td>
        </tr>
      `;
    }

    const numberToWords = (num) => {
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
      if ((num = Math.abs(Math.round(num)).toString()).length > 9) return 'overflow';
      const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return '';
      let str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
      return str.trim();
    };

    const logoData = templateConfig.logo || logo || '';
    const stampData = companyStamp || '';

    const formatMonthDisplayFn = (month) => {
      if (!month) return "Current Month";
      const [year, monthNum] = month.split('-');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    };

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
            .header-cell { border: none; padding: 12px; border-bottom: 1px solid #000; }
            .section-header { text-align: center; padding: 8px; font-weight: bold; background: #f5f5f5; color: #000; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .gross-row { font-weight: bold; background: #f0f0f0; }
            .logo-image { height: 80px; width: auto; max-width: 200px; object-fit: contain; display: block; }
            .stamp-image { width: 90px; height: auto; opacity: 0.8; display: block; }
            .stamp-container { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
            .amount-word { font-weight: bold; font-size: 12px; padding: 8px; text-align: center; color: #000; }
            .net-pay-amount { font-weight: bold; font-size: 14px; color: #000; }
            @media print {
              body { padding: 10px; }
              .invoice-container { border: 1px solid #000; }
              .logo-image, .stamp-image { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <table>
              <tr>
                <td colspan="6" class="header-cell">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="width: 200px; flex-shrink: 0;">
                      ${logoData ? `<img src="${logoData}" alt="Logo" class="logo-image">` : ''}
                    </div>
                    <div style="flex: 1; text-align: center; padding: 0 10px;">
                      <h2 style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">Timely Healthtech Private Limited</h2>
                      <p style="margin: 2px 0 0; font-size: 7px; line-height: 1.4; color: #555;">
                        Reg. Address: Flat No:301, H.No:1-68/22, Plot No. 54 & 55, Sri Sai Balaji Avenue, Arunodaya Colony, Madhapur, Hyderabad, Telangana-500081
                      </p>
                    </div>
                    <div style="width: 200px; flex-shrink: 0;"></div>
                  </div>
                </td>
              </tr>
              <tr><td colspan="6" class="section-header">PAYSLIP FOR ${formatMonthDisplayFn(employee.month || selectedMonth).toUpperCase()}</td></tr>
              <tr>
                <td width="15%"><strong>Name:</strong></td>
                <td width="35%">${employee.name || '-'}</td>
                <td width="15%"><strong>Employee No:</strong></td>
                <td width="35%">${employee.employeeId || '-'}</td>
              </tr>
              <tr>
                <td><strong>Joining Date:</strong></td>
                <td>${employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-GB') : '-'}</td>
                <td><strong>Bank Name:</strong></td>
                <td>${employeeData.bankName || '-'}</td>
              </tr>
              <tr>
                <td><strong>Designation:</strong></td>
                <td>${employeeData.designation || employee.designation || '-'}</td>
                <td><strong>Bank Account No:</strong></td>
                <td>${employeeData.bankAccount || '-'}</td>
              </tr>
              <tr>
                <td><strong>Department:</strong></td>
                <td>${employeeData.department || employee.department || '-'}</td>
                <td><strong>PAN Number:</strong></td>
                <td>${employeeData.panNo || '-'}</td>
              </tr>
              <tr>
                <td><strong>Location:</strong></td>
                <td>${employeeData.location || 'HYDERABAD'}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td><strong>EMP EFFECTIVE</strong></td>
                <td>:30</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td><strong>LOP:</strong></td>
                <td>${lopDays > 0 ? lopDays : '0'}</td>
                <td></td>
                <td></td>
              </tr>
            </table>

            <table>
              <tr style="background:#f0f0f0;">
                <td style="width:30%;"><strong>Earnings</strong></td>
                <td style="width:20%; text-align:center;"><strong>Actual</strong></td>
                <td style="width:30%;"><strong>Deductions</strong></td>
                <td style="width:20%; text-align:center;"><strong>Actual</strong></td>
              </tr>
              ${tableRowsHTML}
              <tr class="gross-row">
                <td><strong>Total Earnings: INR.</strong></td>
                <td style="text-align: right;"><strong>₹${totalEarningsAmt.toFixed(2)}</strong></td>
                <td><strong>Total Deductions.</strong></td>
                <td style="text-align: right;"><strong>₹${totalDeductionsAmt.toFixed(2)}</strong></td>
              </tr>
              <tr class="total-row">
                <td colspan="2"></td>
                <td><strong>Net Pay for the month</strong></td>
                <td style="text-align: right;"><strong class="net-pay-amount">₹${finalNetPay.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td colspan="4" class="amount-word">(${numberToWords(finalNetPay)})</td>
              </tr>
            </table>

            <div style="display: flex; justify-content: flex-end; align-items: center; padding: 10px 20px; border-top: 1px solid #000; margin-top: 5px;">
              <div class="stamp-container">
                ${stampData ? `<img src="${stampData}" alt="Company Stamp" class="stamp-image">` : ''}
                <div style="text-align: right; line-height: 1.2;">
                  <strong style="font-size: 7px; color: #333; display: block;">Authorized Signatory</strong>
                  <span style="font-size: 6px; color: #555; display: block;">Timely Healthtech Private Limited</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const getLeaveTypes = (employee) => {
    const leaves = employeeLeaves[employee.employeeId] || { CL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0 };
    const leaveStrings = [];
    if (leaves.CL > 0) leaveStrings.push(`CL: ${leaves.CL} `);
    if (leaves.SL > 0) leaveStrings.push(`SL: ${leaves.SL} `);
    if (leaves.EL > 0) leaveStrings.push(`EL: ${leaves.EL} `);
    if (leaves.COFF > 0) leaveStrings.push(`COFF: ${leaves.COFF} `);
    if (leaves.LOP > 0) leaveStrings.push(`LOP: ${leaves.LOP} `);
    if (leaves.Other > 0) leaveStrings.push(`Other: ${leaves.Other} `);
    return leaveStrings.length > 0 ? leaveStrings.join(', ') : 'No Leaves';
  };

  const formatMonthDisplay = (month) => {
    if (!month) return "Current Month";
    const [year, monthNum] = month.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  // ============================================
  // ✅ ATTENDANCE POPUP MODAL
  // ============================================
  const AttendancePopupModal = () => {
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
      const fetchHolidays = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/holidays/all`);
          const data = await res.json();
          setHolidays(Array.isArray(data) ? data : []);
        } catch (err) {
          setHolidays([]);
        }
      };
      fetchHolidays();
    }, []);

    if (!showAttendancePopup) return null;

    const getEmployeeShiftHoursLocal = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

    const getAllDatesOfMonth = (month) => {
      if (!month) return [];
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      const dates = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    };

    const monthDates = getAllDatesOfMonth(selectedMonth);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const isFutureDate = (date) => {
      if (!date) return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d > todayObj;
    };

    const getDateKey = (record) => {
      if (!record) return null;
      const timeStr = record.checkInTime || record.checkOutTime || record.date;
      if (!timeStr) return null;
      const d = new Date(timeStr);
      return d.toLocaleDateString('en-CA');
    };

    const attendanceMap = new Map();
    selectedEmployeeAttendance.forEach(record => {
      const dateKey = getDateKey(record);
      if (dateKey) {
        const existing = attendanceMap.get(dateKey);
        if (!existing) {
          attendanceMap.set(dateKey, record);
        } else {
          const existingTime = new Date(existing.checkInTime || existing.checkOutTime || 0).getTime();
          const currentTime = new Date(record.checkInTime || record.checkOutTime || 0).getTime();
          if (currentTime > existingTime) {
            attendanceMap.set(dateKey, record);
          }
        }
      }
    });

    const isLeaveDay = (date, employeeId, employeeLeavesData) => {
      if (!date || !employeeId) return false;
      const leaves = employeeLeavesData[employeeId];
      if (!leaves || !leaves.leaveDetails) return false;
      const dateStr = date.toLocaleDateString('en-CA');
      return leaves.leaveDetails.some(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= startDate && checkDate <= endDate;
      });
    };

    const shiftHours = getEmployeeShiftHoursLocal(selectedEmployee?.employeeId);

    const holidayDatesSet = new Set();
    holidays.forEach(h => {
      if (h.isActive === false) return;
      if (!h.fromDate || !h.toDate) return;
      const start = new Date(h.fromDate);
      const end = new Date(h.toDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        holidayDatesSet.add(d.toLocaleDateString('en-CA'));
      }
    });

    const isHoliday = (date) => {
      if (!date) return false;
      return holidayDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    const employeeId = selectedEmployee?.employeeId;
    const weekOffDatesList = getWeekOffDatesForEmployee(weekOffDatesMap, employeeId);
    const weekOffDatesSet = new Set(weekOffDatesList);
    const targetWeekOffCount = weekOffDatesList.length || (selectedEmployee?.weekOffs || 0);

    const compOffDatesList = getCompOffDatesForEmployee(compOffDatesMap, employeeId);
    const compOffDatesSet = new Set(compOffDatesList.map(co => co.date));

    const isWeekOffDay = (date) => {
      if (!date) return false;
      return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    const isCompOffDay = (date) => {
      if (!date) return false;
      return compOffDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0, holidayCount = 0, singlePunchCount = 0, compOffCount = 0, futureCount = 0;

    monthDates.forEach(date => {
      const dateKey = date.toLocaleDateString('en-CA');
      const record = attendanceMap.get(dateKey);
      const isWO = isWeekOffDay(date);
      const isHol = isHoliday(date);
      const hasAttendance = !!record;
      const isLV = !isWO && isLeaveDay(date, employeeId, employeeLeaves);
      const isCO = isCompOffDay(date);
      const futureDate = isFutureDate(date);

      if (futureDate && !hasAttendance) {
        futureCount++;
      } else if (isCO) {
        compOffCount++;
      } else if (isHol && !hasAttendance) {
        holidayCount++;
      } else if (isWO && !hasAttendance) {
        weekOffCount++;
      } else if (isLV && !hasAttendance) {
        leaveCount++;
      } else if (!hasAttendance) {
        absentCount++;
      } else if (record && record.checkInTime && !record.checkOutTime) {
        singlePunchCount++;
        presentCount++;
      } else {
        presentCount++;
      }
    });

    const formatTime = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getRecordForDate = (dateKey) => attendanceMap.get(dateKey) || null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
          <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
            <div>
              <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
              <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day | Week-offs: {targetWeekOffCount} days | Comp-offs: {compOffDatesList.length}</p>
            </div>
            <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2 bg-white border-b flex-wrap gap-2">
            <div className="flex gap-3 text-xs flex-wrap">
              <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
              <span className="text-purple-600">PH: <strong>{holidayCount}</strong></span>
              <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
              <span className="text-teal-600">Comp-off: <strong>{compOffCount}</strong></span>
              <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
              <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
              {/* {futureCount > 0 && (
                <span className="text-gray-400">NA: <strong>{futureCount}</strong></span>
              )} */}
              <span className="text-blue-600">Single Punch: <strong>{singlePunchCount}</strong></span>
              <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
            </div>
            <div className="flex gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div><span>PH</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-teal-100 border border-teal-300 rounded"></div><span>Comp-off</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
              {/* <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-50 border border-dashed border-gray-300 rounded"></div><span>NA</span></div> */}
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div><span>Single Punch</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div><span>Present</span></div>
            </div>
          </div>

          <div className="flex-1 p-2 overflow-y-auto">
            {attendanceLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 text-white bg-gradient-to-r from-green-500 to-blue-600">
                    <tr>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Date</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Check-In</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Check-Out</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Reason</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Hours</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Status</th>
                      <th className="px-2 py-1.5 text-center text-xs font-medium">Admin Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthDates.map((date) => {
                      const dateKey = date.toLocaleDateString('en-CA');
                      const record = getRecordForDate(dateKey);
                      const hasAttendance = !!record;
                      const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;

                      const isWeekOff = isWeekOffDay(date);
                      const isLeave = !isWeekOff && isLeaveDay(date, employeeId, employeeLeaves);
                      const holidayCheck = isHoliday(date);
                      const compOffCheck = isCompOffDay(date);
                      const futureDate = isFutureDate(date);

                      const effectiveWeekOff = isWeekOff && !hasAttendance;
                      const singlePunch = record && record.checkInTime && !record.checkOutTime;

                      let bgColor = '';
                      let dayType = '';

                      if (futureDate && !hasAttendance) {
                        bgColor = 'bg-gray-50';
                        dayType = 'NA';
                      } else if (compOffCheck) {
                        bgColor = 'bg-teal-50';
                        dayType = 'Comp-off';
                      } else if (holidayCheck && !hasAttendance) {
                        bgColor = 'bg-purple-50';
                        dayType = 'Public Holiday';
                      } else if (effectiveWeekOff) {
                        bgColor = 'bg-orange-50';
                        dayType = 'Week Off';
                      } else if (isLeave && !hasAttendance) {
                        bgColor = 'bg-red-50';
                        dayType = 'Leave';
                      } else if (!hasAttendance) {
                        bgColor = 'bg-white';
                        dayType = 'Absent';
                      } else if (singlePunch) {
                        bgColor = 'bg-blue-50';
                        dayType = 'Single Punch';
                      } else {
                        bgColor = 'bg-white';
                        const hoursNum = parseFloat(workHours);
                        if (workHours && hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
                        else if (workHours && hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
                        else if (workHours) dayType = 'Absent';
                        else dayType = 'Full Day';
                      }

                      return (
                        <tr key={dateKey} className={`${bgColor} hover:bg-gray-50 transition-colors`}>
                          <td className={`px-2 py-1 text-xs text-center ${futureDate ? 'text-gray-400' : ''}`}>
                            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && !compOffCheck && !futureDate && hasAttendance ? formatTime(record?.checkInTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && !compOffCheck && !futureDate && hasAttendance ? formatTime(record?.checkOutTime) : '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{record?.reason || (compOffCheck ? 'Comp-off approved' : '-')}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && !compOffCheck && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
                          <td className="px-2 py-1 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                              dayType === 'NA' ? 'bg-gray-100 text-gray-400 border border-dashed border-gray-300'
                              : compOffCheck ? 'bg-teal-100 text-teal-700'
                              : holidayCheck && !hasAttendance ? 'bg-purple-100 text-purple-700'
                              : effectiveWeekOff ? 'bg-orange-100 text-orange-700'
                              : isLeave ? 'bg-red-100 text-red-700'
                              : !hasAttendance ? 'bg-gray-100 text-gray-500'
                              : dayType === 'Single Punch' ? 'bg-blue-100 text-blue-700'
                              : dayType === 'Full Day' ? 'bg-green-100 text-green-700'
                              : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-500'
                            }`}>{dayType}</span>
                          </td>
                          <td className="px-2 py-1 text-xs text-center">{record?.comment || (compOffCheck ? `Comp-off (${compOffDatesList.find(co => co.date === dateKey)?.count || 1} day)` : '-')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-3 bg-white border-t rounded-b-lg">
            <button
              onClick={async () => {
                if (selectedEmployee) {
                  await fetchEmployeeAttendance(selectedEmployee.employeeId, selectedMonth);
                }
              }}
              className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2"
            >
              Refresh
            </button>
            <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-blue-600">Loading payroll data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <button onClick={() => fetchData(selectedMonth)} className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  const activeCount = getActiveCount();
  const inactiveCount = getInactiveCount();

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Employee <span>Payroll</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 mr-2">
              <button onClick={() => { setFilterStatus('all'); setCurrentPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All ({records.length})
              </button>
              <button onClick={() => { setFilterStatus('active'); setCurrentPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${filterStatus === 'active' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Active ({activeCount})
              </button>
              <button onClick={() => { setFilterStatus('inactive'); setCurrentPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${filterStatus === 'inactive' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Inactive ({inactiveCount})
              </button>
            </div>

            <div className="relative min-w-[120px] flex-1 max-w-[160px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
            </div>

            <div className="relative" ref={departmentFilterRef}>
              <button onClick={() => { setShowDepartmentFilter(!showDepartmentFilter); setShowDesignationFilter(false); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${filterDepartment ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                <FaBuilding className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDepartmentFilter && (
                <div className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto" style={{ zIndex: 99999, top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto', left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto' }}>
                  <div onClick={() => { setFilterDepartment(""); setShowDepartmentFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Departments</div>
                  {uniqueDepartments.map((dept) => (
                    <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{dept}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={designationFilterRef}>
              <button onClick={() => { setShowDesignationFilter(!showDesignationFilter); setShowDepartmentFilter(false); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${filterDesignation ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                <FaUserTag className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{filterDesignation || "Desig"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDesignationFilter && (
                <div className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto" style={{ zIndex: 99999, top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto', left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto' }}>
                  <div onClick={() => { setFilterDesignation(""); setShowDesignationFilter(false); }} className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Designations</div>
                  {uniqueDesignations.map((des) => (
                    <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{des}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} placeholder="From" className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white" />
            </div>

            <div className="relative">
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} placeholder="To" className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white" />
            </div>

            <div className="relative">
              <input type="month" value={selectedMonth} onChange={handleMonthChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white font-semibold" />
            </div>

            <button onClick={handleDateRangeFilter} disabled={!fromDate || !toDate} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50">
              <FaSearch className="w-3 h-3" /> Apply
            </button>

            <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap">⚙️</button>

            <button onClick={() => { const currentMonth = new Date().toISOString().slice(0, 7); setSelectedMonth(currentMonth); fetchData(currentMonth); }} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap">Current</button>

            <button onClick={() => fetchData(selectedMonth)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap">⟳</button>

            <button onClick={() => navigate("/bank-reports")} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap">Bank Reports</button>

            <button onClick={() => setShowOTModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap">OT ({selectedOTEmployees.size})</button>

            {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7) || filterStatus !== 'all') && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap">✕ Clear</button>
            )}
          </div>
        </div>

        <div className="sm:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">Employee <span className="text-indigo-600">Payroll</span></h1>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>{formatMonthDisplay(selectedMonth)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer transition-all hover:shadow-md ${filterStatus === 'all' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">All Employees</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{records.length}</div>
            <div className="emp-dash__stat-meta">total in payroll</div>
          </div>

          <div className={`emp-dash__stat cursor-pointer transition-all hover:shadow-md ${filterStatus === 'active' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`} onClick={() => { setFilterStatus('active'); setCurrentPage(1); }}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Active Employees</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-green-600">{activeCount}</div>
            <div className="emp-dash__stat-meta">active in payroll</div>
          </div>

          <div className={`emp-dash__stat cursor-pointer transition-all hover:shadow-md ${filterStatus === 'inactive' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`} onClick={() => { setFilterStatus('inactive'); setCurrentPage(1); }}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Inactive Employees</span><div className="emp-dash__stat-icon emp-dash__stat-icon--absent"><FiUserMinus /></div></div>
            <div className="emp-dash__stat-value text-red-600">{inactiveCount}</div>
            <div className="emp-dash__stat-meta">hidden from reports</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Assigned Salary</span><div className="emp-dash__stat-icon emp-dash__stat-icon--salary"><FiTrendingUp /></div></div>
            <div className="emp-dash__stat-value">₹{Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.salaryPerMonth || 0), 0)).toLocaleString()}</div>
            <div className="emp-dash__stat-meta">total assigned per month</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Net Pay</span><div className="emp-dash__stat-icon emp-dash__stat-icon--salary"><FiTrendingUp /></div></div>
            <div className="emp-dash__stat-value">₹{Math.round(filteredRecords.reduce((sum, emp) => sum + (emp.finalPay || 0), 0)).toLocaleString()}</div>
            <div className="emp-dash__stat-meta">total net pay this month</div>
          </div>
        </div>

        <div className="emp-dash__card mb-6">
          <div className="overflow-x-auto">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th style={{ textAlign: "center" }}>Role</th>
                  <th style={{ textAlign: "center" }}>Dept</th>
                  <th style={{ textAlign: "center" }}>Working</th>
                  <th style={{ textAlign: "center" }}>Present</th>
                  <th style={{ textAlign: "center" }}>Half</th>
                  <th style={{ textAlign: "center" }}>Carry Fwd</th>
                  <th style={{ textAlign: "center" }}>Earned WO</th>
                  <th style={{ textAlign: "center" }}>Week Off Dates</th>
                  <th style={{ textAlign: "center" }}>Comp-off Dates</th>
                  <th style={{ textAlign: "center" }}>Comp-off Amt</th>
                  <th style={{ textAlign: "center" }}>Default WO</th>
                  <th style={{ textAlign: "center" }}>Monthly Salary</th>
                  <th style={{ textAlign: "center" }}>OT Amount</th>
                  <th style={{ textAlign: "center" }}>Calculated</th>
                  <th style={{ textAlign: "center" }}>Manual Ded.</th>
                  <th style={{ textAlign: "center" }}>Final Pay</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr key={item.employeeId} onClick={() => handleRowClick(item)} className={`transition-colors hover:bg-slate-50/50 cursor-pointer ${item.isInactive ? 'bg-red-50/30' : ''}`}>
                    <td className="font-semibold text-slate-800 text-[11px]">{item.employeeId}</td>
                    <td>
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner">{item.name ? item.name.charAt(0).toUpperCase() : "?"}</div>
                        <span className={`font-semibold text-xs whitespace-nowrap ${item.isInactive ? 'text-gray-500' : 'text-slate-800'}`}>{item.name}</span>
                      </div>
                    </td>
                    <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">{item.designation || item.role || '-'}</td>
                    <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">{item.department}</td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>{item.totalWorkingDays || 0}</span></td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{item.presentDays || 0}</span></td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{item.halfDayWorking || 0}</span></td>
                    <td className="text-center whitespace-nowrap">
                      {(item.carryForwardDays > 0 || item.carryForwardFromPrev > 0) ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {item.carryForwardDays > 0 && (<span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-orange-100 text-orange-700 border border-orange-300'}`} title={`${item.carryForwardDays} extra day(s) carried forward to next month (NOT added to salary)`}>+{item.carryForwardDays}→</span>)}
                          {item.carryForwardFromPrev > 0 && (<span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`} title={`${item.carryForwardFromPrev} day(s) carried in from previous month (already counted in payable days)`}>←{item.carryForwardFromPrev}</span>)}
                        </div>
                      ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{item.earnedWeekOffs || 0}</span></td>
                    <td className="text-center whitespace-nowrap">
                      {item.weekOffDates && item.weekOffDates.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-[160px]">
                          {item.weekOffDates.map((d) => (
                            <span key={d} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`} title={d}>
                              {new Date(d + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {item.compOffDates && item.compOffDates.length > 0 ? (
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-[160px]">
                          {item.compOffDates.map((co) => (
                            <span key={co._id || co.date} className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-teal-50 text-teal-700 border border-teal-200'}`} title={`${co.date} (${co.count || 1} day)`}>
                              {new Date(co.date + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      ) : (<span className="text-gray-300 text-[10px]">—</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {item.compOffAmount > 0 ? (
                        <span className={`font-bold ${item.isInactive ? 'text-gray-400' : 'text-teal-600'}`} title={`${item.compOffDays} comp-off day(s) × ₹${item.salaryPerDay?.toFixed(2) || 0}/day`}>
                          ₹{item.compOffAmount.toFixed(0)}
                        </span>
                      ) : (<span className="text-gray-400">-</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isInactive ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>{item.defaultWeekOffs || 0}</span></td>
                    <td className="text-center whitespace-nowrap">
                      <div className={`font-semibold ${item.isInactive ? 'text-gray-400' : 'text-slate-700'}`}>₹{(item.salaryPerMonth || 0).toLocaleString()}</div>
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {item.finalOTAmount > 0 ? (<span className={`font-bold ${item.isInactive ? 'text-gray-400' : 'text-green-600'}`} title={item.otSource === 'dashboard' ? `Dashboard OT: ${item.dashboardOTHours}h` : ''}>₹{item.finalOTAmount.toFixed(0)}</span>) : (<span className="text-gray-400">-</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap"><span className={`font-bold ${item.isInactive ? 'text-gray-400' : 'text-blue-700'}`}>₹{calculateSalary(item).toLocaleString()}</span></td>
                    <td className="text-center whitespace-nowrap">
                      {item.manualDeduction > 0 ? (<span className={`font-bold ${item.isInactive ? 'text-gray-400' : 'text-rose-600'}`} title={item.manualDeductionReason ? `Reason: ${item.manualDeductionReason}` : ''}>- ₹{item.manualDeduction.toLocaleString()}</span>) : (<span className="text-gray-400">-</span>)}
                    </td>
                    <td className="text-center whitespace-nowrap"><span className={`font-extrabold ${item.isInactive ? 'text-gray-400' : 'text-green-700'}`}>₹{(item.finalPay || item.calculatedSalary || 0).toLocaleString()}</span></td>
                    <td className="text-center whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${item.isInactive ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{item.isInactive ? 'INACTIVE' : 'ACTIVE'}</span></td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all shadow-sm" title="View Details">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg transition-all shadow-sm" title="Edit Adjustment">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); downloadInvoice(item); }} disabled={!isPayslipDownloadAllowed(item.month || selectedMonth) || item.isInactive} className={`p-1.5 border rounded-lg transition-all shadow-sm ${isPayslipDownloadAllowed(item.month || selectedMonth) && !item.isInactive ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100' : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'}`} title={item.isInactive ? "Payslip not available" : "Download Payslip"}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Show</span>
                  <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500">
                  Showing <strong>{indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === 1 ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"}`}>Previous</button>
                {getPageNumbers().map((page, index) => (
                  <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${page === "..." ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"}`}>{page}</button>
                ))}
                <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === totalPages ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"}`}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Employee Payroll Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition"><FaTimes size={18} /></button>
            </div>

            <div className="flex items-center space-x-4 mb-6 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white text-lg font-bold rounded-full shadow-md shrink-0">{selectedEmployee.name?.charAt(0) || 'E'}</div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-800">{selectedEmployee.name}</h3>
                <div className="grid grid-cols-2 text-xs text-gray-500 gap-x-4 mt-0.5">
                  <p><span className="font-semibold text-gray-700">ID:</span> {selectedEmployee.employeeId}</p>
                  <p><span className="font-semibold text-gray-700">Role:</span> {selectedEmployee.designation || selectedEmployee.role || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-700">Department:</span> {selectedEmployee.department || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-700">Month:</span> {selectedEmployee.month || selectedMonth}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 text-xs sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Present Days</span><span className="font-bold text-emerald-700">{selectedEmployee.presentDays || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Working Days</span><span className="font-bold text-blue-700">{selectedEmployee.totalWorkingDays || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Half Days</span><span className="font-bold text-amber-700">{selectedEmployee.halfDayWorking || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Earned Weekoffs</span><span className="font-bold text-green-700">{selectedEmployee.earnedWeekOffs || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Default Weekoffs</span><span className="font-bold text-gray-600">{selectedEmployee.defaultWeekOffs || 0}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">WeekOff Days</span><span className="font-bold text-purple-700">{getWeekOffDaysForDisplay(selectedEmployee)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Month Days</span><span className="font-bold text-slate-700">{selectedEmployee.monthDays || monthDays}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Expected Working Days</span><span className="font-bold text-slate-600">{selectedEmployee.expectedWorkingDays ?? ((selectedEmployee.monthDays || monthDays) - (selectedEmployee.weekOffs || 0))}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Payable Present Days</span><span className="font-bold text-blue-700">{typeof selectedEmployee.payablePresentDays === 'number' ? selectedEmployee.payablePresentDays : (selectedEmployee.presentDays || 0)}</span></div>

              {selectedEmployee.compOffDays > 0 && (
                <div className="flex justify-between py-1.5 border-b border-teal-100 bg-teal-50 rounded px-1 sm:col-span-2">
                  <span className="text-teal-600 font-semibold">Comp-off Days ({selectedEmployee.compOffDays})</span>
                  <span className="font-bold text-teal-700">₹{selectedEmployee.compOffAmount?.toLocaleString() || 0}</span>
                </div>
              )}

              {selectedEmployee.weekOffDates && selectedEmployee.weekOffDates.length > 0 && (
                <div className="flex flex-col py-1.5 border-b border-orange-100 bg-orange-50 rounded px-1 sm:col-span-2">
                  <span className="text-orange-600 font-semibold mb-1">Week Off Dates ({selectedEmployee.weekOffDates.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.weekOffDates.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-white text-orange-700 border border-orange-200 rounded text-[10px] font-semibold">
                        {new Date(d + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployee.compOffDates && selectedEmployee.compOffDates.length > 0 && (
                <div className="flex flex-col py-1.5 border-b border-teal-100 bg-teal-50 rounded px-1 sm:col-span-2">
                  <span className="text-teal-600 font-semibold mb-1">Comp-off Dates ({selectedEmployee.compOffDates.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.compOffDates.map((co) => (
                      <span key={co._id || co.date} className="px-2 py-0.5 bg-white text-teal-700 border border-teal-200 rounded text-[10px] font-semibold">
                        {new Date(co.date + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })} ({co.count || 1}d)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Monthly Salary</span>
                <div className="text-right">
                  <span className="font-bold text-slate-800">₹{selectedEmployee.salaryPerMonth || 0}</span>
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">Daily Rate</span><span className="font-bold text-slate-700">₹{calculateDailyRate(selectedEmployee)}/day</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium">OT Amount</span><span className="font-bold text-emerald-600">₹{(selectedEmployee.finalOTAmount || 0).toFixed(0)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500 font-medium text-blue-600">Calculated Base Salary</span><span className="font-bold text-blue-600">₹{Math.round(selectedEmployee.calculatedSalary || 0)}</span></div>

              {selectedEmployee.manualDeduction > 0 && (
                <div className="flex justify-between py-1.5 border-b border-rose-100 bg-rose-50 rounded px-1 sm:col-span-2">
                  <span className="text-rose-600 font-semibold">Manual Deduction{selectedEmployee.manualDeductionReason ? ` (${selectedEmployee.manualDeductionReason})` : ''}</span>
                  <span className="font-bold text-rose-700">- ₹{selectedEmployee.manualDeduction.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-700 font-bold">Final Pay</span><span className="font-bold text-emerald-700">₹{Math.round(selectedEmployee.finalPay || selectedEmployee.calculatedSalary || 0)}</span></div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button onClick={() => downloadInvoice(selectedEmployee)} disabled={!isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth)} className={`px-4 py-2 text-xs font-semibold rounded-lg transition duration-200 ${isPayslipDownloadAllowed(selectedEmployee.month || selectedMonth) ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Download Payslip</button>
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 text-xs font-semibold text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Edit Salary - {selectedEmployee.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition"><FaTimes size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Present Days</label>
                  <input type="number" name="presentDays" value={editFormData.presentDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Working Days</label>
                  <input type="number" name="workingDays" value={editFormData.workingDays || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Half Days</label>
                  <input type="number" name="halfDayWorking" value={editFormData.halfDayWorking || 0} onChange={handleInputChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bonus (₹)</label>
                  <input type="number" name="bonus" value={extraWorkData.bonus || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deductions (₹)</label>
                <input type="number" name="deductions" value={extraWorkData.deductions || 0} onChange={handleExtraWorkChange} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Adjustment Reason</label>
                <input type="text" name="reason" value={extraWorkData.reason || ""} onChange={handleExtraWorkChange} placeholder="e.g. Performance bonus or Loss of Pay" className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>

              {selectedEmployee.compOffDays > 0 && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-xs font-semibold text-teal-700 mb-1">Comp-off Days (Auto-included in salary)</p>
                  <p className="text-sm font-bold text-teal-800">{selectedEmployee.compOffDays} day(s) — ₹{selectedEmployee.compOffAmount?.toLocaleString() || 0}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEmployee.compOffDates?.map((co) => (
                      <span key={co._id || co.date} className="px-1.5 py-0.5 bg-white text-teal-700 border border-teal-200 rounded text-[9px] font-semibold">
                        {new Date(co.date + "T00:00:00").toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                <button type="button" onClick={handleReset} className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm">Reset System</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Edit Payslip Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 transition"><FaTimes size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                <input type="text" value={templateConfig.companyName} onChange={(e) => setTemplateConfig({...templateConfig, companyName: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Address</label>
                <textarea rows="3" value={templateConfig.address} onChange={(e) => setTemplateConfig({...templateConfig, address: e.target.value})} className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                <button onClick={() => setShowTemplateModal(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                <button onClick={handleTemplateSave} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">Save Template</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OT Selection Modal */}
      {showOTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Select Employees for OT Payment</h2>
              <button onClick={() => setShowOTModal(false)} className="text-gray-400 hover:text-gray-600 transition"><FaTimes size={18} /></button>
            </div>
            <div className="flex-1 pr-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-600 font-bold uppercase text-[9px] tracking-wider sticky top-0 z-10">
                  <tr><th className="p-3">Select</th><th className="p-3">ID</th><th className="p-3">Employee Name</th><th className="p-3 text-right">OT Hours</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.length === 0 ? (<tr><td colSpan="4" className="p-4 text-center text-gray-400 font-semibold">No employees found.</td></tr>) : (
                    records.map(r => (
                      <tr key={r.employeeId} className={`hover:bg-slate-50/50 ${r.isInactive ? 'opacity-50 bg-red-50/30' : ''}`}>
                        <td className="p-3"><input type="checkbox" checked={selectedOTEmployees.has(r.employeeId)} onChange={() => handleOTEmployeeSelection(r.employeeId)} disabled={r.isInactive} className={`w-4 h-4 border-gray-300 rounded focus:ring-blue-500 ${r.isInactive ? 'cursor-not-allowed' : 'text-blue-600'}`} /></td>
                        <td className="p-3 text-gray-500 font-semibold">{r.employeeId}</td>
                        <td className="p-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="p-3 font-bold text-right text-blue-600">{r.overTimeHoursFormatted || formatDecimalHours(r.overTimeHours)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => setShowOTModal(false)} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">Done</button>
            </div>
          </div>
        </div>
      )}

      <AttendancePopupModal />
    </div>
  );
};

export default PayRoll;