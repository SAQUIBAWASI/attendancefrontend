

// AttendanceSummary.jsx - Complete fixed OT calculation

// AttendanceSummary.jsx - Complete Fixed Code

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaUserTag, FaTimes, FaCalendarAlt, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiFilter, FiMapPin, FiUserCheck, FiUsers, FiCoffee, FiTrendingUp, 
  FiDownload, 
  FiTrash2, 
  FiPlus,
  FiChevronUp as FiChevronUpIcon,
  FiChevronDown as FiChevronDownIcon } from "react-icons/fi";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config";
import "../index.css";
import "./AttendanceSummary.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
const BASE_URL = API_BASE_URL;

export default function AttendanceSummary() {
  const [editedRows, setEditedRows] = useState({});
  const [shiftsData, setShiftsData] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [regularizationRequests, setRegularizationRequests] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const previousSummaryRef = useRef([]);
  const autoSaveIntervalRef = useRef(null);
  const saveStatusTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const lastSaveTimestampRef = useRef(0);

  // Popup states
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedEmployeeAttendance, setSelectedEmployeeAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [employeeLeaves, setEmployeeLeaves] = useState({});
  const [employeesMasterData, setEmployeesMasterData] = useState({});

  // Helper function to format decimal hours to HH:MM
  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Calculate OT Hours
  const calculateOTHours = (totalHours, assignedShiftHours) => {
    if (!totalHours || totalHours === 0) return 0;
    if (!assignedShiftHours || assignedShiftHours === 0) return 0;
    const ot = totalHours - assignedShiftHours;
    return ot > 0 ? ot : 0;
  };

  // Calculate work hours
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  // Format time with AM/PM for popup
  const formatTimeWithAMPM = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Format date for popup
  const formatDateDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleHoursChange = (index, value) => {
    const numericValue = parseFloat(value) || 0;
    setEditedRows(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        hours: numericValue,
        edited: true,
        timestamp: Date.now()
      }
    }));
  };

  const handleCommentChange = (index, value) => {
    setEditedRows(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        comment: value,
        timestamp: Date.now()
      }
    }));
  };

  const handleReasonChange = (index, value) => {
    setEditedRows(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        reason: value,
        timestamp: Date.now()
      }
    }));
  };

  // Click outside handlers for filter dropdowns
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

  const parseTimeStr = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const parseShiftTimeRange = (timeRange) => {
    if (!timeRange) return { start: null, end: null };
    let parts = timeRange.split(/[-]| to /i).map(t => t.trim());
    if (parts.length >= 2) {
      return {
        start: parseTimeStr(parts[0]),
        end: parseTimeStr(parts[1])
      };
    }
    return { start: null, end: null };
  };

  const getEmployeeShift = (employeeId) => {
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId ||
      s.employeeId === employeeId
    );
    if (!shiftAssignment) {
      return null;
    }
    const shiftType = shiftAssignment.shiftType;
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
    if (!masterShift) {
      return getDefaultShiftTime(shiftType);
    }
    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      const slot1 = parseShiftTimeRange(masterShift.timeSlots[0]?.timeRange);
      const slot2 = parseShiftTimeRange(masterShift.timeSlots[1]?.timeRange);
      return {
        start: slot1.start || "07:00",
        end: slot2.end || "21:30",
        grace: 5,
        isBrakeShift: true
      };
    }
    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const parsed = parseShiftTimeRange(timeSlot.timeRange);
        return {
          start: parsed.start || "09:00",
          end: parsed.end || "18:00",
          grace: 5,
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

  const getEmployeeShiftHours = (employeeId) => {
    const attendanceRecord = records.find(r => r.employeeId === employeeId);
    if (attendanceRecord && attendanceRecord.assignedShiftHours) {
      return attendanceRecord.assignedShiftHours;
    }
    const employee = employees.find(emp => emp.employeeId === employeeId);
    if (employee && employee.shiftHours) {
      return employee.shiftHours;
    }
    const shiftAssignment = shiftsData.find(s =>
      s.employeeAssignment?.employeeId === employeeId ||
      s.employeeId === employeeId
    );
    if (shiftAssignment) {
      const shiftType = shiftAssignment.shiftType;
      const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);
      if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
        const timeSlot = masterShift.timeSlots[0];
        if (timeSlot.timeRange) {
          const parsed = parseShiftTimeRange(timeSlot.timeRange);
          if (parsed.start && parsed.end) {
            const [startHour, startMinute] = parsed.start.split(':').map(Number);
            const [endHour, endMinute] = parsed.end.split(':').map(Number);
            let startMinutes = startHour * 60 + startMinute;
            let endMinutes = endHour * 60 + endMinute;
            if (endMinutes <= startMinutes) endMinutes += 24 * 60;
            const hours = (endMinutes - startMinutes) / 60;
            return hours;
          }
        }
      }
    }
    return 9;
  };

  const calculateDayType = (employeeId, hours) => {
    const numericHours = parseFloat(hours) || 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    if (shiftHours >= 3 && shiftHours <= 6) {
      if (numericHours >= shiftHours * 0.9) return "full";
      if (numericHours >= shiftHours * 0.5) return "half";
      return "full_leave";
    } else if (shiftHours >= 7 && shiftHours <= 12) {
      if (numericHours >= 8.8) return "full";
      if (numericHours >= 4.5) return "half";
      return "full_leave";
    } else {
      if (numericHours >= shiftHours * 0.9) return "full";
      if (numericHours >= shiftHours * 0.5) return "half";
      return "full_leave";
    }
  };

  const calculateOTForRecord = (employeeId, totalHours) => {
    const shiftHours = getEmployeeShiftHours(employeeId);
    const ot = calculateOTHours(totalHours, shiftHours);
    return ot;
  };

  const calculateEmployeeOT = (employeeId) => {
    let totalOT = 0;
    const shiftHours = getEmployeeShiftHours(employeeId);
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      const hours = rec.totalHours || rec.hours || 0;
      const assignedShift = rec.assignedShiftHours || shiftHours || 9;
      const ot = calculateOTHours(hours, assignedShift);
      totalOT += ot;
    });
    return Number(totalOT.toFixed(2));
  };

  const calculateEmployeeWorkingDays = (employeeId) => {
    let presentDays = 0;
    let halfDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      const hours = rec.totalHours || rec.hours || 0;
      const dayType = calculateDayType(employeeId, hours);
      if (dayType === "full") presentDays++;
      else if (dayType === "half") halfDays++;
    });
    return presentDays + (halfDays * 0.5);
  };

  const calculateEmployeeLateDays = (employeeId) => {
    let lateDays = 0;
    const shift = getEmployeeShift(employeeId);
    if (!shift) return 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.checkInTime) {
        const checkInDateTime = new Date(rec.checkInTime);
        const [hours, minutes] = shift.start.split(':').map(Number);
        const shiftStartTime = new Date(checkInDateTime);
        shiftStartTime.setHours(hours, minutes, 0, 0);
        const graceTime = new Date(shiftStartTime);
        graceTime.setMinutes(graceTime.getMinutes() + shift.grace);
        if (checkInDateTime > graceTime) lateDays++;
      }
    });
    return lateDays;
  };

  const calculateEmployeeOnsiteDays = (employeeId) => {
    let onsiteDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.reason === "Onsite") onsiteDays++;
    });
    return onsiteDays;
  };

  const calculateEmployeeRemoteDays = (employeeId) => {
    let remoteDays = 0;
    records.forEach((rec) => {
      if (rec.employeeId !== employeeId) return;
      if (selectedMonth && rec.checkInTime) {
        const recMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        if (recMonth !== selectedMonth) return;
      }
      if (fromDate && toDate && rec.checkInTime) {
        const recordDate = new Date(rec.checkInTime).toISOString().split('T')[0];
        if (recordDate < fromDate || recordDate > toDate) return;
      }
      if (rec.reason === "Work From Home") remoteDays++;
    });
    return remoteDays;
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.department || '-';
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.role || employee?.designation || '-';
  };

  // Helper function to get all dates of a month
  const getAllDatesOfMonth = (month) => {
    if (!month) return [];
    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const downloadSingleEmployeeExcel = async (employeeId) => {
    try {
      const employee = employees.find(emp => emp.employeeId === employeeId);
      if (!employee) {
        alert("Employee not found");
        return;
      }
      const empSummary = filteredSummary.find(emp => emp.employeeId === employeeId);
      if (!empSummary) {
        alert("No summary data found for this employee");
        return;
      }
      let empAttendance = [...records].filter(rec => rec.employeeId === employeeId);
      if (selectedMonth) {
        empAttendance = empAttendance.filter(r => {
          if (!r.checkInTime) return false;
          const recordMonth = new Date(r.checkInTime).toISOString().slice(0, 7);
          return recordMonth === selectedMonth;
        });
      }
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        empAttendance = empAttendance.filter(r => {
          if (!r.checkInTime) return false;
          const recordDate = new Date(r.checkInTime);
          return recordDate >= from && recordDate <= to;
        });
      }
      if (empAttendance.length === 0) {
        alert("No attendance records found for this employee with current filters");
        return;
      }
      const sortedAttendance = empAttendance.sort((a, b) => {
        return new Date(a.checkInTime) - new Date(b.checkInTime);
      });
      const zip = new JSZip();
      const shift = getEmployeeShift(employeeId);
      const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
      const shiftHours = getEmployeeShiftHours(employeeId);

      const summaryWorkbook = XLSX.utils.book_new();
      const totalOT = calculateEmployeeOT(employeeId);
      const summaryData = [{
        "Employee ID": empSummary.employeeId,
        "Name": empSummary.name,
        "Department": getEmployeeDepartment(employeeId),
        "Designation": getEmployeeDesignation(employeeId),
        "Shift Time": shiftInfo,
        "Shift Hours": formatDecimalHours(shiftHours),
        "Month": empSummary.month,
        "Present Days": empSummary.presentDays,
        "Late Days": calculateEmployeeLateDays(employeeId),
        "Onsite Days": calculateEmployeeOnsiteDays(employeeId),
        "Half Day": empSummary.halfDayWorking || 0,
        "Full Day Leave": empSummary.fullDayNotWorking || 0,
        "Over Time": formatDecimalHours(totalOT),
        "Working Days": calculateEmployeeWorkingDays(employeeId).toFixed(1),
        "Total Hours": formatDecimalHours(sortedAttendance.reduce((sum, rec) =>
          sum + (Number(rec.totalHours) || 0), 0
        ))
      }];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");
      const summaryExcelBuffer = XLSX.write(summaryWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      let summaryFileName = `${employeeId}_${employee.name || "Employee"}_Summary`;
      if (fromDate && toDate) {
        summaryFileName += `_${fromDate}_to_${toDate}`;
      } else if (selectedMonth) {
        summaryFileName += `_${selectedMonth}`;
      }
      summaryFileName += ".xlsx";
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });

      const detailWorkbook = XLSX.utils.book_new();
      const detailData = sortedAttendance.map(rec => {
        const checkIn = new Date(rec.checkInTime);
        const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
        const hours = rec.totalHours ||
          (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");
        const adminComment = rec.comment !== undefined && rec.comment !== null ? rec.comment : "";
        const otHours = calculateOTForRecord(employeeId, hours);
        return {
          "Date": checkIn.toLocaleDateString("en-IN"),
          "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
          "Department": getEmployeeDepartment(employeeId),
          "Designation": getEmployeeDesignation(employeeId),
          "Check-In": formatDate(rec.checkInTime),
          "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
          "Hours": formatDecimalHours(parseFloat(hours)),
          "Over Time": formatDecimalHours(otHours),
          "Day Type": calculateDayType(employeeId, hours),
          "Reason": rec.reason || "",
          "Admin Comment": adminComment
        };
      });
      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(detailWorkbook, detailSheet, "Attendance");
      const detailExcelBuffer = XLSX.write(detailWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      let detailFileName = `${employeeId}_${employee.name || "Employee"}_Detailed_Attendance`;
      if (fromDate && toDate) {
        detailFileName += `_${fromDate}_to_${toDate}`;
      } else if (selectedMonth) {
        detailFileName += `_${selectedMonth}`;
      }
      detailFileName += ".xlsx";
      zip.file(detailFileName, detailExcelBuffer, { binary: true });
      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = `${employeeId}_${employee.name || "Employee"}_Attendance_Report`;
      if (fromDate && toDate) {
        zipFileName += `_${fromDate}_to_${toDate}`;
      } else if (selectedMonth) {
        zipFileName += `_${selectedMonth}`;
      }
      zipFileName += ".zip";
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded ${employee.name}'s attendance report (ZIP)`);
    } catch (error) {
      console.error("Error downloading single employee report:", error);
      showSaveStatus("❌ Failed to download report", "error");
    }
  };

  const downloadCombinedExcel = async () => {
    if (filteredSummary.length === 0) {
      alert("No summary data available");
      return;
    }
    try {
      showSaveStatus("📦 Preparing ZIP file...");
      const zip = new JSZip();

      const summaryWorkbook = XLSX.utils.book_new();
      const summaryData = filteredSummary.map(emp => {
        const shift = getEmployeeShift(emp.employeeId);
        const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
        const shiftHours = getEmployeeShiftHours(emp.employeeId);
        const totalOT = calculateEmployeeOT(emp.employeeId);
        return {
          "Employee ID": emp.employeeId,
          "Name": emp.name,
          "Department": getEmployeeDepartment(emp.employeeId),
          "Designation": getEmployeeDesignation(emp.employeeId),
          "Shift Time": shiftInfo,
          "Shift Hours": formatDecimalHours(shiftHours),
          "Month": emp.month,
          "Present Days": emp.presentDays,
          "Late Days": calculateEmployeeLateDays(emp.employeeId),
          "Onsite Days": calculateEmployeeOnsiteDays(emp.employeeId),
          "Half Day": emp.halfDayWorking || 0,
          "Full Day": emp.fullDayNotWorking || 0,
          "Over Time": formatDecimalHours(totalOT),
          "Working Days": calculateEmployeeWorkingDays(emp.employeeId).toFixed(1)
        };
      });
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");
      const summaryExcelBuffer = XLSX.write(summaryWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      let summaryFileName = "All_Employees_Summary";
      if (fromDate && toDate) {
        summaryFileName += `_${fromDate}_to_${toDate}`;
      } else if (selectedMonth) {
        summaryFileName += `_${selectedMonth}`;
      }
      summaryFileName += ".xlsx";
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });

      let filteredDetails = [...records];
      if (selectedMonth) {
        filteredDetails = filteredDetails.filter(r => {
          if (!r.checkInTime) return false;
          const recordMonth = new Date(r.checkInTime).toISOString().slice(0, 7);
          return recordMonth === selectedMonth;
        });
      }
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filteredDetails = filteredDetails.filter(r => {
          if (!r.checkInTime) return false;
          const recordDate = new Date(r.checkInTime);
          return recordDate >= from && recordDate <= to;
        });
      }
      const summaryEmployeeIds = filteredSummary.map(emp => emp.employeeId);
      filteredDetails = filteredDetails.filter(r =>
        summaryEmployeeIds.includes(r.employeeId)
      );
      const employeesFolder = zip.folder("Individual_Reports");
      const uniqueEmployees = [...new Set(filteredDetails.map(r => r.employeeId))];
      for (const empId of uniqueEmployees) {
        try {
          const empRecords = filteredDetails.filter(rec => rec.employeeId === empId);
          const employee = employees.find(e => e.employeeId === empId);
          if (empRecords.length === 0) continue;
          const sortedEmpRecords = empRecords.sort((a, b) => {
            const dateA = new Date(a.checkInTime);
            const dateB = new Date(b.checkInTime);
            return dateA - dateB;
          });
          const empWorkbook = XLSX.utils.book_new();
          const detailData = sortedEmpRecords.map(rec => {
            const checkIn = new Date(rec.checkInTime);
            const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
            const hours = rec.totalHours ||
              (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");
            const adminComment = rec.comment !== undefined && rec.comment !== null ? rec.comment : "";
            const otHours = calculateOTForRecord(empId, hours);
            return {
              "Date": checkIn.toLocaleDateString("en-IN"),
              "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
              "Department": getEmployeeDepartment(empId),
              "Designation": getEmployeeDesignation(empId),
              "Check-In": formatDate(rec.checkInTime),
              "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
              "Hours": formatDecimalHours(parseFloat(hours)),
              "Over Time": formatDecimalHours(otHours),
              "Day Type": calculateDayType(empId, hours),
              "Reason": rec.reason || "",
              "Admin Comment": adminComment
            };
          });
          const empSheet = XLSX.utils.json_to_sheet(detailData);
          XLSX.utils.book_append_sheet(empWorkbook, empSheet, "Attendance");
          const empExcelBuffer = XLSX.write(empWorkbook, {
            bookType: "xlsx",
            type: "array",
          });
          let empFileName = `${empId}_${employee?.name || "Employee"}_Attendance`;
          if (fromDate && toDate) {
            empFileName += `_${fromDate}_to_${toDate}`;
          } else if (selectedMonth) {
            empFileName += `_${selectedMonth}`;
          }
          empFileName += ".xlsx";
          employeesFolder.file(empFileName, empExcelBuffer, { binary: true });
        } catch (error) {
          console.error(`Error creating file for employee ${empId}:`, error);
          continue;
        }
      }
      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = "Complete_Attendance_Report";
      if (fromDate && toDate) {
        zipFileName += `_${fromDate}_to_${toDate}`;
      } else if (selectedMonth) {
        zipFileName += `_${selectedMonth}`;
      }
      zipFileName += ".zip";
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded complete report (${filteredSummary.length} employees)`);
    } catch (error) {
      console.error("Error downloading combined report:", error);
      showSaveStatus("❌ Failed to download combined report", "error");
    }
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    setEmployeeDetails([]);
    setEditedRows({});
  };

  const fixSummaryDataInFrontend = (summary, month) => {
    if (!summary.length || !month) return summary;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    const currentDay = today.getDate();
    const [selectedYear, selectedMonthNum] = month.split('-').map(Number);
    const isFutureMonth = selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonthNum > currentMonthNum);
    if (isFutureMonth) {
      return summary.map(emp => ({
        ...emp,
        presentDays: 0,
        lateDays: 0,
        onsiteDays: 0,
        halfDayWorking: 0,
        fullDayNotWorking: 0,
        overTimeHours: 0,
        totalWorkingDays: 0
      }));
    }
    const isCurrentMonth = selectedYear === currentYear && selectedMonthNum === currentMonthNum;
    if (isCurrentMonth) {
      return summary.map(emp => {
        const needsCorrection =
          emp.presentDays > currentDay ||
          emp.lateDays > currentDay ||
          emp.onsiteDays > currentDay ||
          emp.totalWorkingDays > currentDay;
        if (!needsCorrection) return emp;
        const correctedPresent = Math.min(emp.presentDays, currentDay);
        const correctedLate = Math.min(emp.lateDays, currentDay);
        const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
        const correctedRemote = Math.min(emp.reasonCount?.workFromHome || 0, currentDay);
        const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
        const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
        const correctedTotal = correctedPresent + (correctedHalf * 0.5);
        return {
          ...emp,
          presentDays: correctedPresent,
          lateDays: correctedLate,
          onsiteDays: correctedOnsite,
          reasonCount: {
            ...emp.reasonCount,
            workFromHome: correctedRemote
          },
          halfDayWorking: correctedHalf,
          fullDayNotWorking: correctedFullLeave,
          totalWorkingDays: correctedTotal
        };
      });
    }
    return summary;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const empRes = await fetch(`${BASE_URL}/employees/get-employees`);
      if (!empRes.ok) throw new Error("Failed to fetch employees");
      const empData = await empRes.json();
      const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];
      const activeEmployees = empData.filter(emp => {
        if (emp.status === 'inactive') return false;
        if (emp.status === 'active') return true;
        return !INACTIVE_EMPLOYEE_IDS.includes(emp.employeeId);
      });
      setEmployees(activeEmployees);
      extractUniqueValues(activeEmployees);
      
      try {
        const shiftsRes = await fetch(`${BASE_URL}/shifts/master`);
        if (shiftsRes.ok) {
          const shiftsResult = await shiftsRes.json();
          if (shiftsResult.success) {
            setMasterShifts(shiftsResult.data || []);
          }
        }
        const assignmentsRes = await fetch(`${BASE_URL}/shifts/assignments`);
        if (assignmentsRes.ok) {
          const assignmentsResult = await assignmentsRes.json();
          if (assignmentsResult.success) {
            setShiftsData(assignmentsResult.data || []);
          }
        }
      } catch (shiftError) {
        console.error("Error fetching shift data:", shiftError);
      }
      
      const attRes = await fetch(`${BASE_URL}/attendance/allattendance`);
      if (!attRes.ok) throw new Error("Failed to fetch attendance records");
      const attData = await attRes.json();
      
      try {
        const regRes = await fetch(`${API_BASE_URL}/attendance-edit-requests/all`);
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegularizationRequests(regData.data || []);
        }
      } catch (regError) {
        console.error("Error fetching regularization requests:", regError);
      }
      
      const sortedRecords = (attData.records || []).sort(
        (a, b) => new Date(b.checkInTime) - new Date(a.checkInTime)
      );
      setRecords(sortedRecords);
      setFilteredRecords(sortedRecords);
      await calculateSummaryFromBackend();
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryFromBackend = async () => {
    try {
      const response = await fetch(`${BASE_URL}/attendancesummary/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: fromDate || null,
          toDate: toDate || null,
          month: selectedMonth || null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const correctedSummary = fixSummaryDataInFrontend(result.summary, selectedMonth);
        const INACTIVE_EMPLOYEE_IDS = ['EMP002', 'EMP003', 'EMP004', 'EMP008', 'EMP010', 'EMP018', 'EMP019'];
        const activeSummary = correctedSummary.filter(emp => {
          const master = employees.find(e => e.employeeId === emp.employeeId);
          if (master?.status === 'inactive') return false;
          if (master?.status === 'active') return true;
          return !INACTIVE_EMPLOYEE_IDS.includes(emp.employeeId);
        });
        setEmployeeSummary(activeSummary);
        previousSummaryRef.current = JSON.parse(JSON.stringify(activeSummary));
      } else {
        throw new Error(result.message || "Failed to calculate summary");
      }
    } catch (error) {
      console.error("Error calculating summary:", error);
      setError("Failed to calculate attendance summary");
    }
  };

  const handleFixWrongData = async () => {
    if (!selectedMonth) {
      alert("Please select a month first");
      return;
    }
    try {
      setLoading(true);
      showSaveStatus("🔧 Fixing wrong data...");
      const response = await fetch(`${BASE_URL}/attendancesummary/fix-summary-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          month: selectedMonth
        }),
      });
      const result = await response.json();
      if (result.success) {
        showSaveStatus(`✅ Fixed ${result.fixedCount} records for ${selectedMonth}`);
        await calculateSummaryFromBackend();
      } else {
        showSaveStatus("❌ Failed to fix data: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error fixing data:", error);
      showSaveStatus("🚨 Error fixing data", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceRecord = async (attendanceId, hours, region, comment, reason) => {
    try {
      const response = await fetch(`${BASE_URL}/attendancesummary/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendanceId,
          hours: hours !== undefined ? parseFloat(hours) : undefined,
          region,
          comment,
          reason
        }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating attendance:", error);
      return { success: false, message: "Network error" };
    }
  };

  const handleSaveAttendance = async (rec, hours, region, comment, reason, index, dateKey, checkInTime, checkOutTime) => {
    try {
      const hoursValue = hours !== undefined ? parseFloat(hours) : rec?.totalHours;
      const commentValue = comment || rec?.comment || "Admin Update";
      const reasonValue = reason || rec?.reason || "Onsite";
      const payload = {
        attendanceId: rec?._id,
        employeeId: selectedEmployee,
        date: dateKey,
        hours: hoursValue,
        region: region,
        comment: commentValue,
        reason: reasonValue,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime
      };
      const response = await fetch(`${BASE_URL}/attendancesummary/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        showSaveStatus("✅ Record updated successfully!");
        if (selectedEmployee) {
          await handleViewDetails(selectedEmployee);
        }
        await calculateSummaryFromBackend();
        fetchAllData();
      } else {
        showSaveStatus("❌ Failed: " + (result.message || "Unknown error"), "error");
      }
    } catch (error) {
      console.error(error);
      showSaveStatus("🚨 Error updating record", "error");
    }
  };

  // FIXED: handleBulkAction - collects records, updates state, waits, then saves
  const handleBulkAction = async (actionType, inputId, defaultHours) => {
    try {
      const val = parseFloat(document.getElementById(inputId)?.value) || defaultHours;
      
      let count = 0;
      const newEdited = { ...editedRows };
      const recordsToUpdate = [];
      
      const monthDates = getAllDatesOfMonth(selectedMonth);
      
      monthDates.forEach(date => {
        const dateKey = date.toLocaleDateString('en-CA');
        const rec = employeeDetails.find(r => 
          r.checkInTime && 
          new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey
        );
        
        if (!rec) return;
        
        const originalHours = rec.totalHours || rec.hours || 0;
        let shouldUpdate = false;
        let updateData = {};
        
        switch(actionType) {
          case 'halfDay':
            if (calculateDayType(selectedEmployee, originalHours) === "half") {
              shouldUpdate = true;
              updateData = { hours: val };
            }
            break;
          case 'fullLeave':
            if (calculateDayType(selectedEmployee, originalHours) === "full_leave") {
              shouldUpdate = true;
              updateData = { hours: val };
            }
            break;
          case 'singlePunch':
            if (rec.checkInTime && !rec.checkOutTime) {
              shouldUpdate = true;
              updateData = { 
                hours: val, 
                checkOutTime: "23:59" 
              };
            }
            break;
        }
        
        if (shouldUpdate) {
          const updatedEntry = {
            ...newEdited[dateKey],
            ...updateData,
            edited: true,
            timestamp: Date.now()
          };
          newEdited[dateKey] = updatedEntry;
          count++;
          recordsToUpdate.push({
            dateKey,
            rec,
            updateData: updatedEntry
          });
        }
      });
      
      if (count === 0) {
        showSaveStatus(`❌ No matching records found to update.`, "error");
        return;
      }
      
      // Update state
      setEditedRows(newEdited);
      showSaveStatus(`✅ Found ${count} records! Saving...`);
      
      // CRITICAL: Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Call bulk save with pre-collected records
      await handleBulkSaveAttendanceWithRecords(recordsToUpdate);
      
    } catch (error) {
      console.error("Bulk action error:", error);
      showSaveStatus("🚨 Error in bulk action: " + error.message, "error");
    }
  };

  // NEW: Bulk save with pre-collected records - NO STATE READ
  const handleBulkSaveAttendanceWithRecords = async (recordsToUpdate) => {
    try {
      if (recordsToUpdate.length === 0) {
        showSaveStatus("No records to update.", "error");
        return;
      }
      
      setLoading(true);
      let successCount = 0;
      const errors = [];
      
      // Process each record
      for (const item of recordsToUpdate) {
        const { dateKey, rec, updateData } = item;
        
        // Use the data from updateData directly (no state read)
        const currentReason = updateData.reason !== undefined ? updateData.reason : (rec?.reason || "");
        const currentComment = updateData.comment !== undefined ? updateData.comment : (rec?.comment || "");
        const currentHours = updateData.hours !== undefined ? updateData.hours : (rec ? (rec.totalHours || rec.hours) : 0);
        
        const formatTimeForInput = (isoString) => {
          if (!isoString) return "";
          const d = new Date(isoString);
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          return `${h}:${m}`;
        };
        
        const baseCheckIn = rec?.checkInTime ? formatTimeForInput(rec.checkInTime) : "";
        const baseCheckOut = rec?.checkOutTime ? formatTimeForInput(rec.checkOutTime) : "";
        const currentCheckIn = updateData.checkInTime !== undefined ? updateData.checkInTime : baseCheckIn;
        const currentCheckOut = updateData.checkOutTime !== undefined ? updateData.checkOutTime : baseCheckOut;
        
        const combineDateTime = (timeStr) => {
          if (!timeStr) return null;
          return `${dateKey}T${timeStr}:00`;
        };
        
        const finalCheckIn = updateData.checkInTime !== undefined ? combineDateTime(updateData.checkInTime) : 
                            (rec?.checkInTime ? rec.checkInTime : undefined);
        const finalCheckOut = updateData.checkOutTime !== undefined ? combineDateTime(updateData.checkOutTime) : 
                             (rec?.checkOutTime ? rec.checkOutTime : undefined);
        
        if (!finalCheckIn && !rec) {
          errors.push(`No check-in time for ${dateKey}`);
          continue;
        }
        
        const payload = {
          attendanceId: rec?._id,
          employeeId: selectedEmployee,
          date: dateKey,
          hours: currentHours,
          region: null,
          comment: currentComment || "Admin Bulk Update",
          reason: currentReason || "Onsite",
          checkInTime: finalCheckIn,
          checkOutTime: finalCheckOut
        };
        
        try {
          const res = await fetch(`${BASE_URL}/attendancesummary/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (result.success) {
            successCount++;
            // Clear the edited flag
            setEditedRows(prev => {
              const newRows = { ...prev };
              if (newRows[dateKey]) {
                newRows[dateKey].edited = false;
              }
              return newRows;
            });
          } else {
            errors.push(`Failed to update ${dateKey}: ${result.message || "Unknown error"}`);
          }
        } catch (err) {
          console.error(`Failed to update ${dateKey}:`, err);
          errors.push(`Network error for ${dateKey}`);
        }
      }
      
      if (successCount > 0) {
        showSaveStatus(`✅ ${successCount}/${recordsToUpdate.length} records updated successfully!${errors.length > 0 ? ` (${errors.length} failed)` : ''}`);
        
        // Refresh data
        if (selectedEmployee) {
          await handleViewDetails(selectedEmployee);
        }
        await calculateSummaryFromBackend();
        await fetchAllData();
      } else {
        showSaveStatus(`❌ No records were updated successfully. ${errors.length > 0 ? errors.join('. ') : ''}`, "error");
      }
      
    } catch (error) {
      console.error("Bulk save error:", error);
      showSaveStatus("🚨 Error saving bulk records: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Kept for backward compatibility
  const handleBulkSaveAttendance = async () => {
    try {
      const currentEditedRows = { ...editedRows };
      const editedKeys = Object.keys(currentEditedRows).filter(key => 
        currentEditedRows[key] && currentEditedRows[key].edited
      );
      
      if (editedKeys.length === 0) {
        showSaveStatus("No records to update in bulk.", "error");
        return;
      }
      
      const recordsToUpdate = [];
      for (const dateKey of editedKeys) {
        const rec = employeeDetails.find(r =>
          r.checkInTime &&
          new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey
        );
        if (rec) {
          recordsToUpdate.push({
            dateKey,
            rec,
            updateData: currentEditedRows[dateKey]
          });
        }
      }
      
      if (recordsToUpdate.length === 0) {
        showSaveStatus("No valid records to update.", "error");
        return;
      }
      
      await handleBulkSaveAttendanceWithRecords(recordsToUpdate);
      
    } catch (error) {
      console.error("Bulk save error:", error);
      showSaveStatus("🚨 Error saving bulk records: " + error.message, "error");
    }
  };

  const autoSaveSummary = async (type = "auto", changeTimestamp = null) => {
    if (changeTimestamp && changeTimestamp < lastSaveTimestampRef.current) {
      return;
    }
    if (isSavingRef.current || employeeSummary.length === 0) {
      return;
    }
    isSavingRef.current = true;
    lastSaveTimestampRef.current = changeTimestamp || Date.now();
    try {
      const response = await fetch(`${BASE_URL}/attendancesummary/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summaries: employeeSummary,
          fromDate: fromDate || null,
          toDate: toDate || null,
          month: selectedMonth || "",
        }),
      });
      const result = await response.json();
      if (result.success) {
        previousSummaryRef.current = JSON.parse(JSON.stringify(employeeSummary));
        if (type === "scheduled") {
          showSaveStatus("✅ Data auto-saved successfully!");
        } else if (type === "auto") {
          showSaveStatus("✅ Changes saved automatically!");
        } else {
          showSaveStatus("✅ Data saved successfully!");
        }
      } else {
        console.error("❌ Save Failed:", result.message);
        showSaveStatus("❌ Failed to save data!", "error");
      }
    } catch (err) {
      console.error("🚨 Save Error:", err);
      showSaveStatus("🚨 Error saving data!", "error");
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleViewDetails = async (employeeId) => {
    try {
      setSelectedEmployee(employeeId);
      setEditedRows({});
      
      const params = new URLSearchParams({
        employeeId,
        ...(fromDate && toDate && { fromDate, toDate }),
        ...(selectedMonth && { month: selectedMonth })
      });
      
      const response = await fetch(`${BASE_URL}/attendancesummary/employee-details?${params}`);
      const result = await response.json();
      
      if (result.success) {
        const sortedDetails = result.details.sort((a, b) =>
          new Date(a.checkInTime) - new Date(b.checkInTime)
        );
        setEmployeeDetails(sortedDetails);
        
        const initialEditedRows = {};
        sortedDetails.forEach((detail) => {
          const dateKey = new Date(detail.checkInTime).toLocaleDateString('en-CA');
          if (detail.comment || detail.reason) {
            initialEditedRows[dateKey] = {
              comment: detail.comment || "",
              reason: detail.reason || "",
              hours: detail.totalHours || detail.hours || 0,
              timestamp: Date.now()
            };
          }
        });
        setEditedRows(initialEditedRows);
      } else {
        throw new Error(result.message || "Failed to fetch employee details");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      showSaveStatus("❌ Error loading employee details", "error");
    }
  };

  const handleDateRangeFilter = async () => {
    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error applying date filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = async (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");
    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error applying month filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    try {
      setLoading(true);
      await calculateSummaryFromBackend();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error clearing filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await autoSaveSummary("manual");
    } catch (err) {
      console.error("Manual save failed:", err);
      showSaveStatus("❌ Failed to save data!", "error");
    }
  };

  const showSaveStatus = (message, type = "success") => {
    setSaveStatus(message);
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus("");
    }, 3000);
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "-";

  const updateRegularizationStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance-edit-requests/update-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminComment: `Request ${status} by Admin from Summary Page`
        }),
      });
      const result = await response.json();
      if (result.success) {
        showSaveStatus(`✅ Request ${status} successfully`);
        fetchAllData();
      } else {
        showSaveStatus("❌ Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showSaveStatus("🚨 Error updating status", "error");
    }
  };

  const getDayTypeBadge = (hours) => {
    if (!selectedEmployee) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Unknown</span>;
    const dayType = calculateDayType(selectedEmployee, hours);
    switch (dayType) {
      case "full":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Full Day</span>;
      case "half":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">Half Day</span>;
      case "full_leave":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">Leave</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Unknown</span>;
    }
  };

  useEffect(() => {
    let filtered = [...employeeSummary];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(emp =>
        emp.employeeId?.toString().toLowerCase().includes(term) ||
        emp.name?.toLowerCase().includes(term)
      );
    }
    if (filterDepartment) {
      filtered = filtered.filter(emp =>
        getEmployeeDepartment(emp.employeeId) === filterDepartment
      );
    }
    if (filterDesignation) {
      filtered = filtered.filter(emp =>
        getEmployeeDesignation(emp.employeeId) === filterDesignation
      );
    }
    setFilteredSummary(filtered);
    setCurrentPage(1);
  }, [employeeSummary, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    fetchAllData();
    autoSaveIntervalRef.current = setInterval(() => { }, 5 * 60 * 1000);
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSummary.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSummary.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  const getPeriodLabel = () => {
    try {
      const format = (d) =>
        new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

      if (fromDate && toDate) {
        if (fromDate === toDate) return format(fromDate);
        return `${format(fromDate)} - ${format(toDate)}`;
      }
      if (fromDate && !toDate) return format(fromDate);
      if (selectedMonth) {
        return new Date(`${selectedMonth}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      }
      return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "Selected period";
    }
  };

  // KPI Card Calculations
  const averageWorkingDays = filteredSummary.length > 0
    ? (filteredSummary.reduce((sum, emp) => sum + calculateEmployeeWorkingDays(emp.employeeId), 0) / filteredSummary.length).toFixed(1)
    : "0.0";
  const totalLateDays = filteredSummary.reduce((sum, emp) => sum + calculateEmployeeLateDays(emp.employeeId), 0);
  const totalOnsiteDays = filteredSummary.reduce((sum, emp) => sum + calculateEmployeeOnsiteDays(emp.employeeId), 0);
  const totalOvertime = filteredSummary.reduce((sum, emp) => sum + calculateEmployeeOT(emp.employeeId), 0);

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dash">
        <main className="grid place-items-center min-h-[60vh] p-4">
          <div className="emp-dash__card max-w-[520px] w-full">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load attendance records</h3>
                <p className="emp-dash__card-desc text-red-600 mt-1">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes("✅") || saveStatus.includes("successfully")
              ? "bg-green-600 border-l-4 border-green-700"
              : "bg-red-500 border-l-4 border-red-600"
            }`}
          >
            {saveStatus}
          </div>
        )}

        {/* Header */}
        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Attendance <span>Summary</span>
            </h1>
            {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Monthly summary of work hours, overtime, and presence metrics per employee.
            </p> */}
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Total Employees</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{filteredSummary.length}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">active in view</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Avg Work Days</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiTrendingUp className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{averageWorkingDays}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">days per employee</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Total Onsite</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiMapPin className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{totalOnsiteDays}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">office check-ins</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Total Late Days</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUserCheck className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl text-amber-600">{totalLateDays}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">grace exceeded</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Total Overtime</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCoffee className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl text-indigo-600 font-bold truncate">
              {formatDecimalHours(totalOvertime)}
            </div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">accumulated</div>
          </div>
        </div>

        {/* Filters Card - Mobile Toggle */}
        <div className="emp-dash__card mb-6">
          {/* Desktop View */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              {/* Left - Filters */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-[140px] flex-1 max-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Department */}
                <div className="relative" ref={departmentFilterRef}>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDepartment
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaBuilding className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[100px]">{filterDepartment || "Departments"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: departmentFilterRef.current ? departmentFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDepartment("");
                          setShowDepartmentFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Departments
                      </div>
                      {uniqueDepartments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => {
                            setFilterDepartment(dept);
                            setShowDepartmentFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Designation */}
                <div className="relative" ref={designationFilterRef}>
                  <button
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                      filterDesignation
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FaUserTag className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[100px]">{filterDesignation || "Designations"}</span>
                    <span className="text-gray-400 text-[10px]">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div 
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[200px] max-h-60 overflow-y-auto"
                      style={{
                        zIndex: 99999,
                        top: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                        left: designationFilterRef.current ? designationFilterRef.current.getBoundingClientRect().left : 'auto',
                      }}
                    >
                      <div
                        onClick={() => {
                          setFilterDesignation("");
                          setShowDesignationFilter(false);
                        }}
                        className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Designations
                      </div>
                      {uniqueDesignations.map((des) => (
                        <div
                          key={des}
                          onClick={() => {
                            setFilterDesignation(des);
                            setShowDesignationFilter(false);
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                            filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {des}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date From - Compact */}
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="From"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Date To - Compact */}
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="To"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Month Picker - Compact */}
                <div className="relative">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Right - Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleDateRangeFilter}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                >
                  <FaSearch className="w-3 h-3" />
                  Apply
                </button>

                <button
                  onClick={handleFixWrongData}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm whitespace-nowrap"
                  title="Fix data corrections for the selected month"
                >
                  🔧 Fix
                </button>

                {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}

                <button
                  onClick={downloadCombinedExcel}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                >
                  <FiDownload className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden">
            {/* Mobile Header with Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <FiFilter className="text-blue-600 text-base" />
                <span>Filters &amp; Actions</span>
                {showMobileFilters ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredSummary.length}</strong> employees
              </span>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
                {/* Search */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Employee</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search ID or Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="relative" ref={departmentFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                  <button
                    onClick={() => {
                      setShowDepartmentFilter(!showDepartmentFilter);
                      setShowDesignationFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDepartment
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FaBuilding className="text-gray-400" />
                      {filterDepartment || "All Departments"}
                    </span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDepartmentFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFilterDepartment("");
                          setShowDepartmentFilter(false);
                        }}
                        className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Departments
                      </div>
                      {uniqueDepartments.map((dept) => (
                        <div
                          key={dept}
                          onClick={() => {
                            setFilterDepartment(dept);
                            setShowDepartmentFilter(false);
                          }}
                          className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                            filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {dept}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Designation */}
                <div className="relative" ref={designationFilterRef}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                  <button
                    onClick={() => {
                      setShowDesignationFilter(!showDesignationFilter);
                      setShowDepartmentFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg border transition-all bg-white ${
                      filterDesignation
                        ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FaUserTag className="text-gray-400" />
                      {filterDesignation || "All Designations"}
                    </span>
                    <span className="text-gray-400">▾</span>
                  </button>
                  {showDesignationFilter && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setFilterDesignation("");
                          setShowDesignationFilter(false);
                        }}
                        className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                      >
                        All Designations
                      </div>
                      {uniqueDesignations.map((des) => (
                        <div
                          key={des}
                          onClick={() => {
                            setFilterDesignation(des);
                            setShowDesignationFilter(false);
                          }}
                          className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${
                            filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {des}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date From & To */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Month Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>

                {/* Mobile Action Buttons */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDateRangeFilter}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <FaSearch className="w-4 h-4" />
                      Apply
                    </button>
                    <button
                      onClick={handleFixWrongData}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm"
                    >
                      🔧 Fix
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadCombinedExcel}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                    >
                      <FiDownload className="w-4 h-4" />
                      Export
                    </button>
                    {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="emp-dash__card">
          {employeeSummary.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">📭</div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No summary records found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">There are no records matching the selected search query or filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th style={{ textAlign: "center" }} className="hidden sm:table-cell">Department</th>
                      <th style={{ textAlign: "center" }} className="hidden md:table-cell">Designation</th>
                      <th style={{ textAlign: "center" }}>Month</th>
                      <th style={{ textAlign: "center" }}>Present</th>
                      <th style={{ textAlign: "center" }}>Late</th>
                      <th style={{ textAlign: "center" }} className="hidden sm:table-cell">Onsite</th>
                      <th style={{ textAlign: "center" }} className="hidden sm:table-cell">Remote</th>
                      <th style={{ textAlign: "center" }} className="hidden lg:table-cell">Half Day</th>
                      <th style={{ textAlign: "center" }} className="hidden lg:table-cell">Full Day</th>
                      <th style={{ textAlign: "center" }}>OT</th>
                      <th style={{ textAlign: "center" }}>Work Days</th>
                      <th style={{ textAlign: "right" }}>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((emp) => {
                      const workingDays = calculateEmployeeWorkingDays(emp.employeeId);
                      const lateDays = calculateEmployeeLateDays(emp.employeeId);
                      const onsiteDays = calculateEmployeeOnsiteDays(emp.employeeId);
                      const department = getEmployeeDepartment(emp.employeeId);
                      const designation = getEmployeeDesignation(emp.employeeId);
                      const totalOT = calculateEmployeeOT(emp.employeeId);

                      return (
                        <tr
                          key={emp.employeeId}
                          onClick={() => handleViewDetails(emp.employeeId)}
                          className="transition-colors hover:bg-slate-50/50 cursor-pointer"
                        >
                          <td className="font-semibold text-slate-800 text-[11px]">
                            {emp.employeeId}
                          </td>
                          <td>
                            <div className="flex items-center justify-start gap-2">
                              <div className="flex items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner">
                                {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                                {emp.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap hidden sm:table-cell">
                            {department}
                          </td>
                          <td className="text-center text-slate-600 text-[11px] font-medium whitespace-nowrap hidden md:table-cell">
                            {designation}
                          </td>
                          <td className="text-center text-slate-600 text-[11px] font-bold whitespace-nowrap">
                            {emp.month}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {emp.presentDays}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              {lateDays}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap hidden sm:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {onsiteDays}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap hidden sm:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                              {calculateEmployeeRemoteDays(emp.employeeId)}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap hidden lg:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                              {emp.halfDayWorking ?? 0}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap hidden lg:table-cell">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                              {emp.fullDayNotWorking ?? 0}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {formatDecimalHours(totalOT)}
                            </span>
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                              {workingDays.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadSingleEmployeeExcel(emp.employeeId);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-all shadow-sm"
                              title={`Download ${emp.name}'s report`}
                            >
                              ⬇ Excel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredSummary.length)}</strong> of{" "}
                    <strong className="text-gray-800">{filteredSummary.length}</strong> employees
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === 1
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                        currentPage === page
                          ? "text-white bg-blue-600 border-blue-600 shadow-sm"
                          : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === totalPages
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-55 border-gray-300 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedEmployee && (() => {
        const monthDates = getAllDatesOfMonth(selectedMonth);
        const empDetailsRecord = employees.find(e => e.employeeId === selectedEmployee);
        const empName = empDetailsRecord?.name || selectedEmployee;

        return (
          <div className="emp-dash-modal fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl w-full flex flex-col max-h-[90vh]" style={{ maxWidth: 1280 }}>
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between p-4 border-b gap-3" style={{ borderColor: "var(--ed-border-light)" }}>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Attendance Details - {empName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Employee ID: {selectedEmployee} | Shift Hours: {getEmployeeShiftHours(selectedEmployee)} hrs/day
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Half Days - Full Day Button */}
                  <div className="flex items-center px-2.5 py-1 space-x-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700">
                    <span>Half Days ({
                      monthDates.filter(date => {
                        const dateKey = date.toLocaleDateString('en-CA');
                        const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                        const originalHours = rec ? (rec.totalHours || rec.hours) : 0;
                        return calculateDayType(selectedEmployee, originalHours) === "half";
                      }).length
                    }) ➔</span>
                    <input 
                      type="number" 
                      id="bulkHalfDayHours"
                      defaultValue="9" 
                      className="w-12 px-1 py-0.5 text-gray-900 bg-white border border-gray-300 rounded text-center font-bold focus:outline-none"
                      step="0.25"
                    />
                    <span className="text-gray-400">Hrs</span>
                    <button
                      onClick={() => handleBulkAction('halfDay', 'bulkHalfDayHours', 9)}
                      className="px-2 py-0.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                    >
                      Full Day
                    </button>
                  </div>

                  {/* Full Leaves - Double Punch Button */}
                  <div className="flex items-center px-2.5 py-1 space-x-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700">
                    <span>Single Punch ({
                      monthDates.filter(date => {
                        const dateKey = date.toLocaleDateString('en-CA');
                        const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                        const originalHours = rec ? (rec.totalHours || rec.hours) : 0;
                        return rec && calculateDayType(selectedEmployee, originalHours) === "full_leave";
                      }).length
                    }) ➔</span>
                    <input 
                      type="number" 
                      id="bulkFullLeaveHours"
                      defaultValue="9" 
                      className="w-12 px-1 py-0.5 text-gray-900 bg-white border border-gray-300 rounded text-center font-bold focus:outline-none"
                      step="0.25"
                    />
                    <span className="text-gray-400">Hrs</span>
                    <button
                      onClick={() => handleBulkAction('fullLeave', 'bulkFullLeaveHours', 9)}
                      className="px-2 py-0.5 text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded transition"
                    >
                      Double Punch
                    </button>
                  </div>

                  {/* Single Punch - New Button */}
                  {/* <div className="flex items-center px-2.5 py-1 space-x-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700">
                    <span>Single Punch ({
                      monthDates.filter(date => {
                        const dateKey = date.toLocaleDateString('en-CA');
                        const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                        return rec && rec.checkInTime && !rec.checkOutTime;
                      }).length
                    }) ➔</span>
                    <input 
                      type="number" 
                      id="bulkSinglePunchHours"
                      defaultValue="9" 
                      className="w-12 px-1 py-0.5 text-gray-900 bg-white border border-gray-300 rounded text-center font-bold focus:outline-none"
                      step="0.25"
                    />
                    <span className="text-gray-400">Hrs</span>
                    <button
                      onClick={() => handleBulkAction('singlePunch', 'bulkSinglePunchHours', 9)}
                      className="px-2 py-0.5 text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded transition"
                    >
                      Single Punch
                    </button>
                  </div> */}

                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Close Modal"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="emp-dash__modal-body flex-1 overflow-y-auto p-4 bg-slate-50/50">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="emp-dash__table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th style={{ textAlign: "center" }}>Check-In</th>
                          <th style={{ textAlign: "center" }}>Check-Out</th>
                          <th style={{ textAlign: "center" }}>Reason</th>
                          <th style={{ textAlign: "center" }}>Hours</th>
                          <th>Admin Comment</th>
                          <th style={{ textAlign: "center" }}>Over Time</th>
                          <th style={{ textAlign: "center" }}>Day Type</th>
                          <th style={{ textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {monthDates.map((date, index) => {
                          const dateKey = date.toLocaleDateString('en-CA');
                          const rec = employeeDetails.find(r =>
                            r.checkInTime &&
                            new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey
                          );
                          const regReq = regularizationRequests.find(r => 
                            r.employeeId === selectedEmployee && 
                            r.selectedDates.some(d => new Date(d).toLocaleDateString('en-CA') === dateKey)
                          );
                          const edited = editedRows[dateKey] || {};
                          const currentReason = edited.reason !== undefined ? edited.reason : (rec?.reason || "");
                          const currentComment = edited.comment !== undefined ? edited.comment : (rec?.comment || "");
                          const baseHours = rec ? (rec.totalHours || rec.hours) : 0;
                          const currentHours = edited.hours !== undefined ? edited.hours : baseHours;

                          const formatTimeForInput = (isoString) => {
                            if (!isoString) return "";
                            const d = new Date(isoString);
                            const h = String(d.getHours()).padStart(2, '0');
                            const m = String(d.getMinutes()).padStart(2, '0');
                            return `${h}:${m}`;
                          };

                          const baseCheckIn = rec?.checkInTime ? formatTimeForInput(rec.checkInTime) : "";
                          const baseCheckOut = rec?.checkOutTime ? formatTimeForInput(rec.checkOutTime) : "";
                          const currentCheckIn = edited.checkInTime !== undefined ? edited.checkInTime : baseCheckIn;
                          const currentCheckOut = edited.checkOutTime !== undefined ? edited.checkOutTime : baseCheckOut;

                          const combineDateTime = (timeStr) => {
                            if (!timeStr) return null;
                            return `${dateKey}T${timeStr}:00`;
                          };

                          const otHours = calculateOTForRecord(selectedEmployee, currentHours);

                          return (
                            <tr key={dateKey} className="transition-colors hover:bg-slate-50/50">
                              <td className="font-semibold text-slate-800 text-[11px]">
                                {date.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                {regReq && (
                                  <div className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    regReq.status === 'pending' ? 'text-amber-600' : 
                                    regReq.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                                  }`}>
                                    {regReq.status === 'pending' ? '⏳ Request' : regReq.status === 'approved' ? '✅ Edited' : '❌ Denied'}
                                  </div>
                                )}
                              </td>

                              <td className="text-center">
                                <input
                                  type="time"
                                  className="px-2 py-1 text-slate-800 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                  value={currentCheckIn}
                                  onChange={(e) => {
                                    const newval = e.target.value;
                                    setEditedRows(prev => {
                                      const newRows = { ...prev };
                                      const currentRow = { ...newRows[dateKey], checkInTime: newval };
                                      const checkOut = currentRow.checkOutTime !== undefined ? currentRow.checkOutTime : baseCheckOut;
                                      if (newval && checkOut) {
                                        const start = new Date(`2000-01-01T${newval}:00`);
                                        const end = new Date(`2000-01-01T${checkOut}:00`);
                                        if (end >= start) {
                                          const diffHours = (end - start) / (1000 * 60 * 60);
                                          currentRow.hours = parseFloat(diffHours.toFixed(2));
                                        }
                                      }
                                      newRows[dateKey] = currentRow;
                                      return newRows;
                                    });
                                  }}
                                />
                              </td>

                              <td className="text-center">
                                <input
                                  type="time"
                                  className="px-2 py-1 text-slate-800 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                  value={currentCheckOut}
                                  onChange={(e) => {
                                    const newval = e.target.value;
                                    setEditedRows(prev => {
                                      const newRows = { ...prev };
                                      const currentRow = { ...newRows[dateKey], checkOutTime: newval };
                                      const checkIn = currentRow.checkInTime !== undefined ? currentRow.checkInTime : baseCheckIn;
                                      if (newval && checkIn) {
                                        const start = new Date(`2000-01-01T${checkIn}:00`);
                                        const end = new Date(`2000-01-01T${newval}:00`);
                                        if (end >= start) {
                                          const diffHours = (end - start) / (1000 * 60 * 60);
                                          currentRow.hours = parseFloat(diffHours.toFixed(2));
                                        }
                                      }
                                      newRows[dateKey] = currentRow;
                                      return newRows;
                                    });
                                  }}
                                />
                              </td>

                              <td className="text-center">
                                <select
                                  className="px-2 py-1 text-slate-800 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                  value={currentReason}
                                  onChange={e => handleReasonChange(dateKey, e.target.value)}
                                >
                                  <option value="">Select</option>
                                  <option value="Onsite">Onsite</option>
                                  <option value="Field Work">Field Work</option>
                                  <option value="Work From Home">Work From Home</option>
                                </select>
                              </td>

                              <td className="text-center">
                                <div className="flex flex-col items-center">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="24"
                                    className="w-16 px-2 py-1 text-slate-800 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-center"
                                    value={currentHours}
                                    onChange={e => handleHoursChange(dateKey, e.target.value)}
                                  />
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {formatDecimalHours(currentHours)}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-slate-800 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                                  placeholder="Comment..."
                                  value={currentComment}
                                  onChange={e => handleCommentChange(dateKey, e.target.value)}
                                />
                              </td>

                              <td className="font-semibold text-center text-indigo-700 text-xs">
                                {rec ? formatDecimalHours(otHours) : "-"}
                              </td>

                              <td className="text-center">
                                {rec ? getDayTypeBadge(currentHours) : "-"}
                              </td>

                              <td className="text-right">
                                <button
                                  onClick={() => {
                                    const finalCheckIn = edited.checkInTime !== undefined ? combineDateTime(currentCheckIn) : (!rec ? combineDateTime(currentCheckIn) : undefined);
                                    const finalCheckOut = edited.checkOutTime !== undefined ? combineDateTime(currentCheckOut) : (!rec ? combineDateTime(currentCheckOut) : undefined);
                                    handleSaveAttendance(
                                      rec,
                                      currentHours,
                                      null,
                                      currentComment,
                                      currentReason,
                                      index,
                                      dateKey,
                                      finalCheckIn,
                                      finalCheckOut
                                    );
                                  }}
                                  className={`px-3 py-1 text-xs font-bold text-white rounded transition-colors ${
                                    (currentCheckIn || rec)
                                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                      : "bg-slate-300 cursor-not-allowed"
                                  }`}
                                  disabled={!currentCheckIn && !rec}
                                >
                                  {rec ? "Update" : "Save"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}