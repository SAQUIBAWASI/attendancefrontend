

// AttendanceSummary.jsx - Complete fixed OT calculation

// AttendanceSummary.jsx - Complete Fixed Code

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaUserTag, FaTimes } from "react-icons/fa";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config";
import "../index.css";
import "./AttendanceSummary.css";
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

  const handleBulkSaveAttendance = async () => {
    try {
      const editedKeys = Object.keys(editedRows);
      if (editedKeys.length === 0) {
        showSaveStatus("No changes to save.", "error");
        return;
      }
      setLoading(true);
      let successCount = 0;
      const keysToSave = editedKeys.filter(dateKey => editedRows[dateKey] && editedRows[dateKey].edited);
      if (keysToSave.length === 0) {
        setLoading(false);
        showSaveStatus("No records to update in bulk.", "error");
        return;
      }
      for (const dateKey of keysToSave) {
        const edited = editedRows[dateKey];
        if (edited) {
          const rec = employeeDetails.find(r =>
            r.checkInTime &&
            new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey
          );
          const currentReason = edited.reason !== undefined ? edited.reason : (rec?.reason || "");
          const currentComment = edited.comment !== undefined ? edited.comment : (rec?.comment || "");
          const currentHours = edited.hours !== undefined ? edited.hours : (rec ? (rec.totalHours || rec.hours) : 0);
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
          const finalCheckIn = edited.checkInTime !== undefined ? combineDateTime(edited.checkInTime) : undefined;
          const finalCheckOut = edited.checkOutTime !== undefined ? combineDateTime(edited.checkOutTime) : undefined;
          const checkInToSend = finalCheckIn !== undefined ? finalCheckIn : (!rec ? combineDateTime(currentCheckIn) : undefined);
          const checkOutToSend = finalCheckOut !== undefined ? finalCheckOut : (!rec ? combineDateTime(currentCheckOut) : undefined);
          if (!checkInToSend && !rec) continue;
          const payload = {
            attendanceId: rec?._id,
            employeeId: selectedEmployee,
            date: dateKey,
            hours: currentHours,
            region: null,
            comment: currentComment || "Admin Bulk Update",
            reason: currentReason || "Onsite",
            checkInTime: checkInToSend,
            checkOutTime: checkOutToSend
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
            }
          } catch (err) {
            console.error(`Failed to update ${dateKey}:`, err);
          }
        }
      }
      if (successCount > 0) {
        showSaveStatus(`✅ ${successCount} records updated successfully!`);
      } else {
        showSaveStatus(`❌ No records were updated successfully.`, "error");
      }
      if (selectedEmployee) {
        await handleViewDetails(selectedEmployee);
      }
      await calculateSummaryFromBackend();
      fetchAllData();
    } catch (error) {
      console.error(error);
      showSaveStatus("🚨 Error saving bulk records", "error");
    } finally {
      setLoading(false);
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
        sortedDetails.forEach((detail, index) => {
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
    if (!selectedEmployee) return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded">Unknown</span>;
    const dayType = calculateDayType(selectedEmployee, hours);
    switch (dayType) {
      case "full":
        return <span className="px-2 py-1 text-xs text-white bg-green-600 rounded">Full Day</span>;
      case "half":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded">Half Day</span>;
      case "full_leave":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded">Full Day Leave</span>;
      default:
        return <span className="px-2 py-1 text-xs text-white bg-gray-500 rounded">Unknown</span>;
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

  // Attendance Popup Modal
  const AttendancePopupModal = () => {
    if (!showAttendancePopup) return null;
    
    const getEmployeeShiftHoursPopup = (employeeId) => employeesMasterData[employeeId]?.shiftHours || 8;

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

    const shiftHours = getEmployeeShiftHoursPopup(selectedEmployee?.employeeId);

    const attendanceMap = new Map();
    selectedEmployeeAttendance.forEach(record => {
      if (record.checkInTime) {
        const dateKey = new Date(record.checkInTime).toLocaleDateString('en-CA');
        attendanceMap.set(dateKey, record);
      }
    });

    const targetWeekOffCount = selectedEmployee?.targetWeekOffCount || selectedEmployee?.weekOffs || 4;
    
    const getWeekOffDatesForMonth = () => {
      const weekOffDatesSet = new Set();
      if (!selectedEmployee || monthDates.length === 0) return weekOffDatesSet;
      const employeeId = selectedEmployee.employeeId;
      if (targetWeekOffCount === 4) {
        monthDates.forEach(date => {
          if (date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday') {
            weekOffDatesSet.add(date.toLocaleDateString('en-CA'));
          }
        });
        return weekOffDatesSet;
      }
      const absentDays = [];
      monthDates.forEach(date => {
        const dateKey = date.toLocaleDateString('en-CA');
        const hasAttendance = attendanceMap.has(dateKey);
        const isLeave = isLeaveDay(date, employeeId, employeeLeaves);
        const isSunday = date.toLocaleDateString('en-US', { weekday: 'long' }) === 'Sunday';
        if (!hasAttendance && !isLeave && !isSunday) {
          absentDays.push(date);
        }
      });
      absentDays.sort((a, b) => a - b);
      const weekOffDaysCount = Math.min(targetWeekOffCount, absentDays.length);
      for (let i = 0; i < weekOffDaysCount; i++) {
        weekOffDatesSet.add(absentDays[i].toLocaleDateString('en-CA'));
      }
      return weekOffDatesSet;
    };
    
    const weekOffDatesSet = getWeekOffDatesForMonth();

    const isWeekOffDay = (date) => {
      if (!date || !selectedEmployee) return false;
      return weekOffDatesSet.has(date.toLocaleDateString('en-CA'));
    };

    let weekOffCount = 0, leaveCount = 0, absentCount = 0, presentCount = 0;

    monthDates.forEach(date => {
      const dateKey = date.toLocaleDateString('en-CA');
      const record = attendanceMap.get(dateKey);
      const isWO = isWeekOffDay(date);
      const hasAttendance = !!record;
      const isLV = !isWO && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
      if (isWO && !hasAttendance) weekOffCount++;
      else if (isLV) leaveCount++;
      else if (!record) absentCount++;
      else presentCount++;
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-7xl mx-4 max-h-[85vh] flex flex-col">
          <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b rounded-t-lg">
            <div>
              <h2 className="text-lg font-bold text-gray-700">Attendance Records - {selectedEmployee?.name}</h2>
              <p className="text-xs text-gray-500">ID: {selectedEmployee?.employeeId} | Shift: {shiftHours} hrs/day | Week-offs: {targetWeekOffCount} days</p>
            </div>
            <button onClick={() => setShowAttendancePopup(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
            <div className="flex gap-4 text-xs">
              <span className="font-medium">Total Days: <strong>{monthDates.length}</strong></span>
              <span className="text-orange-600">Week Off: <strong>{weekOffCount}</strong></span>
              <span className="text-red-600">Leaves: <strong>{leaveCount}</strong></span>
              <span className="text-gray-500">Absent: <strong>{absentCount}</strong></span>
              <span className="text-green-600">Present: <strong>{presentCount}</strong></span>
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div><span>Week Off</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div><span>Leave</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div><span>Absent</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-green-300 rounded"></div><span>Present</span></div>
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
                      const record = attendanceMap.get(dateKey);
                      const hasAttendance = !!record;
                      const workHours = record ? calculateWorkHours(record.checkInTime, record.checkOutTime) : null;
                      const isWeekOff = isWeekOffDay(date);
                      const isLeave = !isWeekOff && isLeaveDay(date, selectedEmployee?.employeeId, employeeLeaves);
                      const effectiveWeekOff = isWeekOff && !hasAttendance;
                      let bgColor = '';
                      let dayType = '';
                      let statusText = '';
                      if (effectiveWeekOff) {
                        bgColor = 'bg-orange-50';
                        dayType = 'Week Off';
                        statusText = 'Week Off';
                      } else if (isLeave) {
                        bgColor = 'bg-red-50';
                        dayType = 'Leave';
                        statusText = 'On Leave';
                      } else if (!hasAttendance) {
                        bgColor = 'bg-white';
                        dayType = 'Absent';
                        statusText = 'Absent';
                      } else {
                        bgColor = 'bg-white';
                        const hoursNum = parseFloat(workHours);
                        if (hoursNum >= shiftHours * 0.9) dayType = 'Full Day';
                        else if (hoursNum >= shiftHours * 0.5) dayType = 'Half Day';
                        else dayType = 'Absent';
                        statusText = record?.checkOutTime ? 'Completed' : (record?.status === "checked-in" ? 'Active' : 'Unknown');
                      }
                      const checkInTime = record?.checkInTime ? formatTimeWithAMPM(record.checkInTime) : '--:--';
                      const checkOutTime = record?.checkOutTime ? formatTimeWithAMPM(record.checkOutTime) : '--:--';
                      return (
                        <tr key={dateKey} className={`${bgColor} hover:bg-gray-50 transition-colors`}>
                          <td className="px-2 py-1 text-xs text-center">{formatDateDisplay(date)}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? checkInTime : '--:--'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance ? checkOutTime : '--:--'}</td>
                          <td className="px-2 py-1 text-xs text-center">{record?.reason || '-'}</td>
                          <td className="px-2 py-1 text-xs text-center">{!effectiveWeekOff && !isLeave && hasAttendance && workHours ? `${workHours}h` : '-'}</td>
                          <td className="px-2 py-1 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${effectiveWeekOff ? 'bg-orange-100 text-orange-700' : isLeave ? 'bg-red-100 text-red-700' : !hasAttendance ? 'bg-gray-100 text-gray-500' : dayType === 'Full Day' ? 'bg-green-100 text-green-700' : dayType === 'Half Day' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                              {dayType}
                            </span>
                          </td>
                          <td className="px-2 py-1 text-xs text-center">{statusText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end p-3 bg-white border-t rounded-b-lg">
            <button onClick={() => setShowAttendancePopup(false)} className="px-4 py-1.5 text-sm text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg font-semibold text-blue-600">Loading attendance records...</div>
  </div>;

  if (error) return <div className="flex items-center justify-center min-h-screen">
    <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
  </div>;

  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${saveStatus.includes("✅") || saveStatus.includes("successfully")
            ? "bg-green-600 border-l-4 border-green-700"
            : "bg-red-500 border-l-4 border-red-600"
            }`}>
            {saveStatus}
          </div>
        )}

        {/* Filters Section */}
        <div className="p-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDepartment 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <FaBuilding className="text-xs" /> Dept {filterDepartment && `: ${filterDepartment}`}
              </button>
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map(dept => (
                    <div 
                      key={dept}
                      onClick={() => {
                        setFilterDepartment(dept);
                        setShowDepartmentFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map(des => (
                    <div 
                      key={des}
                      onClick={() => {
                        setFilterDesignation(des);
                        setShowDesignationFilter(false);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-[200px]">
                <span className="absolute text-xs text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2">
                  From:
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="relative w-[200px]">
                <span className="absolute text-xs text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2">
                  To:
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="relative min-w-[130px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
              />
            </div>

            <button
              onClick={handleDateRangeFilter}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply
            </button>

            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>

            <button
              onClick={downloadCombinedExcel}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* TABLE - With gradient header and bottom table style */}
        {employeeSummary.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 font-medium">
            No attendance records found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Employee ID</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-center font-medium">Department</th>
                  <th className="px-4 py-3 text-center font-medium">Designation</th>
                  <th className="px-4 py-3 text-center font-medium">Month</th>
                  <th className="px-4 py-3 text-center font-medium">Present</th>
                  <th className="px-4 py-3 text-center font-medium">Late</th>
                  <th className="px-4 py-3 text-center font-medium">Onsite</th>
                  <th className="px-4 py-3 text-center font-medium">Remote</th>
                  <th className="px-4 py-3 text-center font-medium">Half Day</th>
                  <th className="px-4 py-3 text-center font-medium">Full Day</th>
                  <th className="px-4 py-3 text-center font-medium">Over Time</th>
                  <th className="px-4 py-3 text-center font-medium">Working Days</th>
                  <th className="px-4 py-3 text-center font-medium">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
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
                      className="hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{emp.employeeId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{department}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{designation}</td>
                      <td className="px-4 py-3 text-center text-gray-900">{emp.month}</td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">{emp.presentDays}</td>
                      <td className="px-4 py-3 text-center font-semibold text-orange-600">{lateDays}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-600">{onsiteDays}</td>
                      <td className="px-4 py-3 text-center font-semibold text-teal-600">{calculateEmployeeRemoteDays(emp.employeeId)}</td>
                      <td className="px-4 py-3 text-center font-semibold text-yellow-600">{emp.halfDayWorking ?? 0}</td>
                      <td className="px-4 py-3 text-center font-semibold text-red-600">{emp.fullDayNotWorking ?? 0}</td>
                      <td className="px-4 py-3 text-center font-semibold text-indigo-600">{formatDecimalHours(totalOT)}</td>
                      <td className="px-4 py-3 text-center font-bold text-purple-600">{workingDays.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSingleEmployeeExcel(emp.employeeId);
                          }}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                          title={`Download ${emp.name}'s report`}
                        >
                          ⬇
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {employeeSummary.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-4 pb-4 sm:flex-row px-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 text-sm border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-500">entries</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === 1
                  ? "text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "text-blue-500 bg-white hover:bg-gray-100 border-gray-300"
                  }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-4 py-1 text-sm border rounded-lg ${currentPage === page
                    ? "text-white bg-blue-600 border-blue-600"
                    : "text-blue-500 bg-white hover:bg-gray-100 border-gray-300"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === totalPages
                  ? "text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed"
                  : "text-blue-500 bg-white hover:bg-gray-100 border-gray-300"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedEmployee && (() => {
          const activeMonth = selectedMonth;

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

          const monthDates = getAllDatesOfMonth(activeMonth);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
              <div className="relative w-full max-w-7xl flex flex-col max-h-[90vh]">
                <div className="flex flex-wrap items-center justify-end gap-2 w-full mb-2">
                  <div className="flex items-center px-2 sm:px-3 py-1 space-x-1 sm:space-x-2 bg-white border border-gray-300 rounded-full shadow-lg text-xs sm:text-sm whitespace-nowrap overflow-hidden">
                    <span className="text-sm font-bold text-gray-700">Half Days ({(() => {
                      return monthDates.filter(date => {
                        const dateKey = date.toLocaleDateString('en-CA');
                        const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                        const originalHours = rec ? (rec.totalHours || rec.hours) : 0;
                        return calculateDayType(selectedEmployee, originalHours) === "half";
                      }).length;
                    })()}) ➔</span>
                    <input 
                      type="number" 
                      id="bulkHalfDayHours"
                      defaultValue="9" 
                      className="w-10 sm:w-14 px-1 py-0.5 text-gray-900 bg-white border border-gray-600 rounded text-xs sm:text-sm text-center"
                      step="0.25"
                    />
                    <span className="text-sm text-gray-700">Hrs</span>
                    <button
                      onClick={closeModal}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      title="Close modal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center px-2 sm:px-3 py-1 space-x-1 sm:space-x-2 bg-white border border-gray-300 rounded-full shadow-lg text-xs sm:text-sm whitespace-nowrap overflow-hidden">
                    <span className="text-sm font-bold text-gray-700">Full Day Leaves ({(() => {
                      return monthDates.filter(date => {
                        const dateKey = date.toLocaleDateString('en-CA');
                        const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                        const originalHours = rec ? (rec.totalHours || rec.hours) : 0;
                        return rec && calculateDayType(selectedEmployee, originalHours) === "full_leave";
                      }).length;
                    })()}) ➔</span>
                    <input 
                      type="number" 
                      id="bulkFullLeaveHours"
                      defaultValue="9" 
                      className="w-10 sm:w-14 px-1 py-0.5 text-gray-900 bg-white border border-gray-600 rounded text-xs sm:text-sm text-center"
                      step="0.25"
                    />
                    <span className="text-sm text-gray-700">Hrs</span>
                    <button
                      onClick={() => {
                        const val = parseFloat(document.getElementById('bulkFullLeaveHours').value) || 9;
                        const newEdited = { ...editedRows };
                        let count = 0;
                        monthDates.forEach(date => {
                           const dateKey = date.toLocaleDateString('en-CA');
                           const rec = employeeDetails.find(r => r.checkInTime && new Date(r.checkInTime).toLocaleDateString('en-CA') === dateKey);
                           const originalHours = rec ? (rec.totalHours || rec.hours) : 0;
                           
                           if (rec && calculateDayType(selectedEmployee, originalHours) === "full_leave") {
                              newEdited[dateKey] = {
                                ...newEdited[dateKey],
                                hours: val,
                                edited: true,
                                timestamp: Date.now()
                              };
                              count++;
                           }
                        });
                        setEditedRows(newEdited);
                        if (count > 0) {
                          showSaveStatus(`✅ Applied ${val} hrs to ${count} Full Day Leaves! Click 'Save Bulk Edits' to confirm.`);
                        } else {
                          showSaveStatus(`❌ No Full Day Leaves found to update.`, "error");
                        }
                      }}
                      className="px-3 py-0.5 text-sm font-bold text-white transition-colors bg-purple-600 rounded shadow hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>

                  {(() => {
                    const editedCount = Object.keys(editedRows).filter(key => editedRows[key].edited).length;
                    
                    if (editedCount > 0) {
                      return (
                        <button
                          onClick={handleBulkSaveAttendance}
                          className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-white transition-colors bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                          Save Bulk Edits ({editedCount})
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={closeModal}
                    className="px-2 sm:px-3 py-1 text-sm sm:text-lg font-bold text-white transition-colors bg-red-600 rounded shadow-lg hover:bg-red-700 shrink-0"
                  >
                    ✖
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Check-In</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Check-Out</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Hours</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Admin Comment</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Over Time</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Day Type</th>
                            <th className="px-4 py-3 text-xs font-semibold text-center text-gray-500 uppercase tracking-wider">Action</th>
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

                            const currentReason =
                              edited.reason !== undefined
                                ? edited.reason
                                : (rec?.reason || "");

                            const currentComment =
                              edited.comment !== undefined
                                ? edited.comment
                                : (rec?.comment || "");

                            const baseHours = rec ? (rec.totalHours || rec.hours) : 0;
                            const currentHours =
                              edited.hours !== undefined ? edited.hours : baseHours;

                            const formatTimeForInput = (isoString) => {
                              if (!isoString) return "";
                              const d = new Date(isoString);
                              const h = String(d.getHours()).padStart(2, '0');
                              const m = String(d.getMinutes()).padStart(2, '0');
                              return `${h}:${m}`;
                            };

                            const baseCheckIn = rec?.checkInTime
                              ? formatTimeForInput(rec.checkInTime)
                              : "";

                            const baseCheckOut = rec?.checkOutTime
                              ? formatTimeForInput(rec.checkOutTime)
                              : "";

                            const currentCheckIn =
                              edited.checkInTime !== undefined
                                ? edited.checkInTime
                                : baseCheckIn;

                            const currentCheckOut =
                              edited.checkOutTime !== undefined
                                ? edited.checkOutTime
                                : baseCheckOut;

                            const combineDateTime = (timeStr) => {
                              if (!timeStr) return null;
                              return `${dateKey}T${timeStr}:00`;
                            };

                            const otHours = calculateOTForRecord(selectedEmployee, currentHours);

                            return (
                              <tr key={dateKey} className="border-t border-gray-200 hover:bg-blue-50">
                                <td className="py-2 text-center">
                                  {date.toLocaleDateString("en-IN")}
                                  {regReq && (
                                    <div className={`mt-1 text-[10px] font-bold uppercase ${
                                      regReq.status === 'pending' ? 'text-orange-500' : 
                                      regReq.status === 'approved' ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                      {regReq.status === 'pending' ? '⏳ Request' : regReq.status === 'approved' ? '✅ Edited' : '❌ Denied'}
                                    </div>
                                  )}
                                </td>

                                <td className="py-2 text-center">
                                  <input
                                    type="time"
                                    className="w-full px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded focus:border-blue-500"
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

                                <td className="py-2 text-center">
                                  <input
                                    type="time"
                                    className="w-full px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded focus:border-blue-500"
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

                                <td className="py-2 text-center">
                                  <select
                                    className="w-full px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded"
                                    value={currentReason}
                                    onChange={e =>
                                      handleReasonChange(dateKey, e.target.value)
                                    }
                                  >
                                    <option value="">Select</option>
                                    <option value="Onsite">Onsite</option>
                                    <option value="Field Work">Field Work</option>
                                    <option value="Work From Home">Work From Home</option>
                                  </select>
                                </td>

                                <td className="py-2 text-center">
                                  <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    max="24"
                                    className="w-20 px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded"
                                    value={currentHours}
                                    onChange={e =>
                                      handleHoursChange(dateKey, e.target.value)
                                    }
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatDecimalHours(currentHours)}
                                  </div>
                                </td>

                                <td className="py-2 text-center">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded"
                                    placeholder="Admin comment"
                                    value={currentComment}
                                    onChange={e =>
                                      handleCommentChange(dateKey, e.target.value)
                                    }
                                  />
                                </td>

                                <td className="py-2 font-semibold text-center text-indigo-600">
                                  {rec ? formatDecimalHours(otHours) : "-"}
                                </td>

                                <td className="py-2 text-center">
                                  {rec ? getDayTypeBadge(currentHours) : "-"}
                                </td>

                                <td className="py-2 text-center">
                                  <button
                                    onClick={() => {
                                      const finalCheckIn =
                                        edited.checkInTime !== undefined ? combineDateTime(currentCheckIn) : (!rec ? combineDateTime(currentCheckIn) : undefined);
                                      const finalCheckOut =
                                        edited.checkOutTime !== undefined ? combineDateTime(currentCheckOut) : (!rec ? combineDateTime(currentCheckOut) : undefined);

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
                                    className={`px-4 py-1 text-white rounded ${
                                      (currentCheckIn || rec)
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-400 cursor-not-allowed"
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
      </div>

      <AttendancePopupModal />

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