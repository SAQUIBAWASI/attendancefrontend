import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';
import { isEmployeeHidden } from '../utils/employeeStatus';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { FaBuilding, FaUserTag } from 'react-icons/fa';
import * as XLSX from 'xlsx';

function OverTime() {
  const [employees, setEmployees]           = useState([]);
  const [attendance, setAttendance]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [selectedMonth, setSelectedMonth]   = useState(new Date().toISOString().slice(0, 7));
  const [masterShifts, setMasterShifts]     = useState([]);
  const [shiftsData, setShiftsData]         = useState([]);
  const [otStatus, setOtStatus]             = useState({});
  const [otMultipliers, setOtMultipliers]   = useState({});
  const [saveStatus, setSaveStatus]         = useState('');
  const [searchTerm, setSearchTerm]         = useState('');

  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage]     = useState(1);
  const [itemsPerPage, setItemsPerPage]   = useState(10);

  const saveStatusTimeoutRef = useRef(null);

  const showSaveStatus = (msg) => {
    setSaveStatus(msg);
    clearTimeout(saveStatusTimeoutRef.current);
    saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus(''), 3500);
  };

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes] = await Promise.all([
          fetch(`${API_BASE_URL}/employees/get-employees`),
          fetch(`${API_BASE_URL}/attendance/allattendance`),
        ]);
        if (!empRes.ok) throw new Error('Failed to fetch employees');
        if (!attRes.ok) throw new Error('Failed to fetch attendance');
        const empData = await empRes.json();
        const attData = await attRes.json();
        setEmployees(empData);
        setAttendance(attData.records || []);

        try {
          const shiftsRes = await fetch(`${API_BASE_URL}/shifts/master`);
          if (shiftsRes.ok) {
            const sr = await shiftsRes.json();
            if (sr.success) setMasterShifts(sr.data || []);
          }
          const assignRes = await fetch(`${API_BASE_URL}/shifts/assignments`);
          if (assignRes.ok) {
            const ar = await assignRes.json();
            if (ar.success) setShiftsData(ar.data || []);
          }
        } catch (shiftErr) {
          console.error('Error fetching shift data:', shiftErr);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Load localStorage OT state whenever month / employees change ────────────
  useEffect(() => {
    if (!selectedMonth) return;
    const initialStatus = {};
    const initialMultipliers = {};
    employees.forEach(emp => {
      const statusKey = `otStatus_${emp.employeeId}_${selectedMonth}`;
      const saved = localStorage.getItem(statusKey);
      if (saved === 'approved')  initialStatus[emp.employeeId] = true;
      else if (saved === 'rejected') initialStatus[emp.employeeId] = false;

      const mKey = `otMultiplier_${emp.employeeId}_${selectedMonth}`;
      const savedM = localStorage.getItem(mKey);
      initialMultipliers[emp.employeeId] = savedM ? Number(savedM) : 2;
    });
    setOtStatus(initialStatus);
    setOtMultipliers(initialMultipliers);
  }, [employees, selectedMonth]);

  // ── Click outside handlers for filter dropdowns ──────────────────────────────
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

  // ── Extract unique departments and designations from employees ───────────────
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    const depts = new Set();
    const designations = new Set();
    
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
      if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
    });
    
    setUniqueDepartments(Array.from(depts).sort());
    setUniqueDesignations(Array.from(designations).sort());
  }, [employees]);

  // ── Shift helpers ────────────────────────────────────────────────────────────
  const parseTimeStr = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/(\d{1,2})[:.](\\d{2})\s*(AM|PM|am|pm)?/i);
    if (!match) return null;
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const parseShiftTimeRange = (timeRange) => {
    if (!timeRange) return { start: null, end: null };
    const parts = timeRange.split(/[-]| to /i).map(t => t.trim());
    if (parts.length >= 2) return { start: parseTimeStr(parts[0]), end: parseTimeStr(parts[1]) };
    return { start: null, end: null };
  };

  const getDefaultShiftTime = (shiftType) => {
    const map = {
      A:  { start: '10:00', end: '19:00', grace: 5, isBrakeShift: false },
      B:  { start: '14:00', end: '22:00', grace: 5, isBrakeShift: false },
      C:  { start: '18:00', end: '21:00', grace: 5, isBrakeShift: false },
      D:  { start: '09:00', end: '18:00', grace: 5, isBrakeShift: false },
      E:  { start: '10:00', end: '21:00', grace: 5, isBrakeShift: false },
      F:  { start: '14:00', end: '23:00', grace: 5, isBrakeShift: false },
      G:  { start: '09:00', end: '21:00', grace: 5, isBrakeShift: false },
      H:  { start: '09:00', end: '21:00', grace: 5, isBrakeShift: false },
      I:  { start: '07:00', end: '17:00', grace: 5, isBrakeShift: false },
      BR: { start: '07:00', end: '21:30', grace: 5, isBrakeShift: true  },
    };
    return map[shiftType] || { start: '09:00', end: '18:00', grace: 5, isBrakeShift: false };
  };

  const getEmployeeShift = (employeeId) => {
    const sa = shiftsData.find(
      s => s.employeeAssignment?.employeeId === employeeId || s.employeeId === employeeId
    );
    if (!sa) return null;
    const shiftType = sa.shiftType;
    const master = masterShifts.find(s => s.shiftType === shiftType);
    if (!master) return getDefaultShiftTime(shiftType);
    if (master.isBrakeShift && master.timeSlots?.length >= 2) {
      const s1 = parseShiftTimeRange(master.timeSlots[0]?.timeRange);
      const s2 = parseShiftTimeRange(master.timeSlots[1]?.timeRange);
      return { start: s1.start || '07:00', end: s2.end || '21:30', grace: 5, isBrakeShift: true };
    }
    if (master.timeSlots?.length > 0 && master.timeSlots[0].timeRange) {
      const p = parseShiftTimeRange(master.timeSlots[0].timeRange);
      return { start: p.start || '09:00', end: p.end || '18:00', grace: 5, isBrakeShift: false };
    }
    return getDefaultShiftTime(shiftType);
  };

  const getEmployeeShiftHours = (employeeId) => {
    const shift = getEmployeeShift(employeeId);
    if (!shift) return 9;
    const [sh, sm] = shift.start.split(':').map(Number);
    const [eh, em] = shift.end.split(':').map(Number);
    let start = sh * 60 + sm;
    let end = eh * 60 + em;
    if (end <= start) end += 24 * 60;
    return (end - start) / 60;
  };

  const calculateOT = (employeeId, hours) => {
    const h = Number(hours) || 0;
    const sh = getEmployeeShiftHours(employeeId);
    return h > sh ? Number((h - sh).toFixed(2)) : 0;
  };

  const formatDecimalHours = (val) => {
    if (!val && val !== 0) return '0h 0m';
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return m === 60 ? `${h + 1}h 0m` : `${h}h ${m}m`;
  };

  const computeOT = (empId) => {
    let total = 0;
    attendance.forEach(rec => {
      if (rec.employeeId !== empId) return;
      if (selectedMonth && rec.checkInTime) {
        const d = new Date(rec.checkInTime);
        const [fy, fm] = selectedMonth.split('-');
        if (d.getFullYear() !== Number(fy) || d.getMonth() + 1 !== Number(fm)) return;
      }
      total += calculateOT(empId, rec.hours || rec.totalHours || 0);
    });
    return total;
  };

  const computeHourlyRateNumeric = (emp) => {
    const sh = getEmployeeShiftHours(emp.employeeId);
    if (!emp.salaryPerMonth || !sh) return null;
    const [y, m] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    return emp.salaryPerMonth / (sh * days);
  };

  const computeHourlyRate = (emp) => {
    const r = computeHourlyRateNumeric(emp);
    return r ? `₹${r.toFixed(2)}` : '-';
  };

  const computeOTPay = (empId) => {
    const emp = employees.find(e => e.employeeId === empId);
    const rate = computeHourlyRateNumeric(emp);
    const otH = computeOT(empId);
    const mult = otMultipliers[empId] ?? 2;
    const approved = otStatus[empId] ?? true;
    if (!rate || !otH || !approved) return '-';
    return `₹${(rate * mult * otH).toFixed(2)}`;
  };

  const handleApprove = (emp) => {
    const key = `otStatus_${emp.employeeId}_${selectedMonth}`;
    localStorage.setItem(key, 'approved');
    setOtStatus(prev => ({ ...prev, [emp.employeeId]: true }));
    showSaveStatus(`✅ OT Approved for ${emp.name}`);
  };

  const handleReject = (emp) => {
    const key = `otStatus_${emp.employeeId}_${selectedMonth}`;
    localStorage.setItem(key, 'rejected');
    setOtStatus(prev => ({ ...prev, [emp.employeeId]: false }));
    showSaveStatus(`❌ OT Rejected for ${emp.name}`);
  };

  // ── Helper functions for Department & Designation ─────────────────────────
  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.department || '-';
  };

  const getEmployeeDesignation = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.role || employee?.designation || '-';
  };

  // New getter for Role (same as designation but ensures role field)
  const getEmployeeRole = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee?.role || '-';
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "-";

  // ── Download Single Employee Excel ──────────────────────────────────────────
  const downloadSingleEmployeeExcel = async (employeeId) => {
    try {
      const employee = employees.find(emp => emp.employeeId === employeeId);
      if (!employee) {
        alert("Employee not found");
        return;
      }

      let empAttendance = [...attendance].filter(rec => rec.employeeId === employeeId);

      if (selectedMonth) {
        empAttendance = empAttendance.filter(r => {
          if (!r.checkInTime) return false;
          const recordMonth = new Date(r.checkInTime).toISOString().slice(0, 7);
          return recordMonth === selectedMonth;
        });
      }

      if (empAttendance.length === 0) {
        alert("No attendance records found for this employee for the selected month");
        return;
      }

      const sortedAttendance = empAttendance.sort((a, b) => {
        return new Date(a.checkInTime) - new Date(b.checkInTime);
      });

      const zip = new JSZip();

      const shift = getEmployeeShift(employeeId);
      const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
      const shiftHours = getEmployeeShiftHours(employeeId);
      const otHours = computeOT(employeeId);
      const hourlyRateVal = computeHourlyRateNumeric(employee);
      const mult = otMultipliers[employeeId] ?? 2;
      const approved = otStatus[employeeId] ?? true;
      const otPayVal = (hourlyRateVal && otHours && approved) ? (hourlyRateVal * mult * otHours) : 0;

      // Summary Sheet
      const summaryWorkbook = XLSX.utils.book_new();
      const summaryData = [{
        "Employee ID": employeeId,
        "Name": employee.name,
        "Department": getEmployeeDepartment(employeeId),
        "Designation": getEmployeeDesignation(employeeId),
        "Month": selectedMonth,
        "Shift Time": shiftInfo,
        "Shift Hours": `${shiftHours}h`,
        "Hourly Rate": hourlyRateVal ? `₹${hourlyRateVal.toFixed(2)}` : "-",
        "OT Multiplier": `${mult}x`,
        "OT Rate (₹/h)": hourlyRateVal ? `₹${(hourlyRateVal * mult).toFixed(2)}` : "-",
        "Over Time Hours": formatDecimalHours(otHours),
        "OT Pay (₹)": approved ? `₹${otPayVal.toFixed(2)}` : "0.00",
        "Status": approved === true ? "Approved" : (approved === false ? "Rejected" : "Pending")
      }];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");

      const summaryExcelBuffer = XLSX.write(summaryWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      let summaryFileName = `${employeeId}_${employee.name || "Employee"}_OT_Summary_${selectedMonth}.xlsx`;
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });

      // Detail Sheet
      const detailWorkbook = XLSX.utils.book_new();
      const detailData = sortedAttendance.map(rec => {
        const checkIn = new Date(rec.checkInTime);
        const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
        const hours = rec.totalHours || rec.hours ||
          (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

        const dayOtHours = calculateOT(employeeId, hours);
        const dayOtPay = (hourlyRateVal && dayOtHours && approved) ? (hourlyRateVal * mult * dayOtHours) : 0;

        return {
          "Date": checkIn.toLocaleDateString("en-IN"),
          "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
          "Department": getEmployeeDepartment(employeeId),
          "Designation": getEmployeeDesignation(employeeId),
          "Check-In": formatDate(rec.checkInTime),
          "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
          "Shift Hours": `${shiftHours}h`,
          "Actual Hours": formatDecimalHours(parseFloat(hours)),
          "Over Time": formatDecimalHours(dayOtHours),
          "OT Pay (₹)": approved ? dayOtPay.toFixed(2) : "0.00",
          "Reason": rec.reason || "",
          "Admin Comment": rec.comment || ""
        };
      });

      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(detailWorkbook, detailSheet, "Attendance");

      const detailExcelBuffer = XLSX.write(detailWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      let detailFileName = `${employeeId}_${employee.name || "Employee"}_Detailed_OT_${selectedMonth}.xlsx`;
      zip.file(detailFileName, detailExcelBuffer, { binary: true });

      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = `${employeeId}_${employee.name || "Employee"}_OT_Report_${selectedMonth}.zip`;
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded ${employee.name}'s OT report (ZIP)`);

    } catch (err) {
      console.error("Error downloading single employee report:", err);
      showSaveStatus("❌ Failed to download report");
    }
  };

  // ── Download Combined CSV (OT Summary) ───────────────────────────────────────
  const downloadAllOTCSV = () => {
    if (!visibleEmployees.length) return;
    const header = [
      "Employee ID",
      "Name",
      "Role",
      "Department",
      "Salary (₹/mo)",
      "Shift Hrs",
      "Hourly Rate",
      "Over Time Hours",
      "OT Rate (₹/h)",
      "OT Pay (₹)",
      "Status"
    ];
    const rows = visibleEmployees.map(emp => {
      const shiftHours = getEmployeeShiftHours(emp.employeeId);
      const rate = computeHourlyRateNumeric(emp);
      const mult = otMultipliers[emp.employeeId] ?? 2;
      const otHours = computeOT(emp.employeeId);
      const otRateVal = rate ? rate * mult : null;
      const otPay = computeOTPay(emp.employeeId);
      const approved = otStatus[emp.employeeId];
      let status = "Pending";
      if (approved === true) status = "Approved";
      else if (approved === false) status = "Rejected";
      return [
        emp.employeeId,
        emp.name,
        getEmployeeRole(emp.employeeId),
        getEmployeeDepartment(emp.employeeId),
        emp.salaryPerMonth ? emp.salaryPerMonth : "-",
        `${shiftHours}h`,
        rate ? `₹${rate.toFixed(2)}` : "-",
        formatDecimalHours(otHours),
        otRateVal ? `₹${otRateVal.toFixed(2)}` : "-",
        otPay,
        status
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OT_Summary_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Download Combined Excel ──────────────────────────────────────────────────
  const downloadCombinedExcel = async () => {
    if (visibleEmployees.length === 0) {
      alert("No data available to download");
      return;
    }

    try {
      showSaveStatus("📦 Preparing ZIP file...");
      const zip = new JSZip();

      // Combined Summary File
      const summaryWorkbook = XLSX.utils.book_new();
      const summaryData = visibleEmployees.map(emp => {
        const shift = getEmployeeShift(emp.employeeId);
        const shiftInfo = shift ? `${shift.start} - ${shift.end}` : "Not Assigned";
        const shiftHours = getEmployeeShiftHours(emp.employeeId);
        const otHours = computeOT(emp.employeeId);
        const hourlyRateVal = computeHourlyRateNumeric(emp);
        const mult = otMultipliers[emp.employeeId] ?? 2;
        const approved = otStatus[emp.employeeId];
        const otPay = computeOTPay(emp.employeeId);
        
        let statusStr = "Pending";
        if (approved === true) statusStr = "Approved";
        else if (approved === false) statusStr = "Rejected";

        return {
          "Employee ID": emp.employeeId,
          "Name": emp.name,
          "Department": getEmployeeDepartment(emp.employeeId),
          "Designation": getEmployeeDesignation(emp.employeeId),
          "Salary (₹/mo)": emp.salaryPerMonth || 0,
          "Shift Time": shiftInfo,
          "Shift Hours": `${shiftHours}h`,
          "Hourly Rate": hourlyRateVal ? `₹${hourlyRateVal.toFixed(2)}` : "-",
          "OT Multiplier": `${mult}x`,
          "OT Rate (₹/h)": hourlyRateVal ? `₹${(hourlyRateVal * mult).toFixed(2)}` : "-",
          "Over Time Hours": formatDecimalHours(otHours),
          "OT Pay (₹)": otPay,
          "Status": statusStr
        };
      });

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(summaryWorkbook, summarySheet, "Summary");

      const summaryExcelBuffer = XLSX.write(summaryWorkbook, {
        bookType: "xlsx",
        type: "array",
      });

      let summaryFileName = `All_Employees_OT_Summary_${selectedMonth}.xlsx`;
      zip.file(summaryFileName, summaryExcelBuffer, { binary: true });

      // Individual reports folder
      const employeesFolder = zip.folder("Individual_Reports");
      for (const emp of visibleEmployees) {
        try {
          const empRecords = attendance.filter(rec => rec.employeeId === emp.employeeId);
          let filteredEmpRecords = empRecords;
          if (selectedMonth) {
            filteredEmpRecords = empRecords.filter(r => {
              if (!r.checkInTime) return false;
              const recordMonth = new Date(r.checkInTime).toISOString().slice(0, 7);
              return recordMonth === selectedMonth;
            });
          }
          if (filteredEmpRecords.length === 0) continue;

          const sortedEmpRecords = filteredEmpRecords.sort((a, b) => {
            return new Date(a.checkInTime) - new Date(b.checkInTime);
          });

          const empWorkbook = XLSX.utils.book_new();
          const shiftHours = getEmployeeShiftHours(emp.employeeId);
          const hourlyRateVal = computeHourlyRateNumeric(emp);
          const mult = otMultipliers[emp.employeeId] ?? 2;
          const approved = otStatus[emp.employeeId] ?? true;

          const detailData = sortedEmpRecords.map(rec => {
            const checkIn = new Date(rec.checkInTime);
            const checkOut = rec.checkOutTime ? new Date(rec.checkOutTime) : null;
            const hours = rec.totalHours || rec.hours ||
              (checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : "0");

            const dayOtHours = calculateOT(emp.employeeId, hours);
            const dayOtPay = (hourlyRateVal && dayOtHours && approved) ? (hourlyRateVal * mult * dayOtHours) : 0;

            return {
              "Date": checkIn.toLocaleDateString("en-IN"),
              "Day": checkIn.toLocaleDateString("en-IN", { weekday: 'short' }),
              "Department": getEmployeeDepartment(emp.employeeId),
              "Designation": getEmployeeDesignation(emp.employeeId),
              "Check-In": formatDate(rec.checkInTime),
              "Check-Out": rec.checkOutTime ? formatDate(rec.checkOutTime) : "-",
              "Shift Hours": `${shiftHours}h`,
              "Actual Hours": formatDecimalHours(parseFloat(hours)),
              "Over Time": formatDecimalHours(dayOtHours),
              "OT Pay (₹)": approved ? dayOtPay.toFixed(2) : "0.00",
              "Reason": rec.reason || "",
              "Admin Comment": rec.comment || ""
            };
          });

          const empSheet = XLSX.utils.json_to_sheet(detailData);
          XLSX.utils.book_append_sheet(empWorkbook, empSheet, "Attendance");

          const empExcelBuffer = XLSX.write(empWorkbook, {
            bookType: "xlsx",
            type: "array",
          });

          let empFileName = `${emp.employeeId}_${emp.name || "Employee"}_OT_${selectedMonth}.xlsx`;
          employeesFolder.file(empFileName, empExcelBuffer, { binary: true });

        } catch (err) {
          console.error(`Error creating file for employee ${emp.employeeId}:`, err);
          continue;
        }
      }

      const zipContent = await zip.generateAsync({ type: "blob" });
      let zipFileName = `Complete_OT_Report_${selectedMonth}.zip`;
      saveAs(zipContent, zipFileName);
      showSaveStatus(`✅ Downloaded complete OT report (${visibleEmployees.length} employees)`);

    } catch (err) {
      console.error("Error downloading combined report:", err);
      showSaveStatus("❌ Failed to download combined report");
    }
  };

  // ── Filtered + paginated list ─────────────────────────────────────────────
  const visibleEmployees = employees.filter(emp => {
    if (isEmployeeHidden(emp)) return false;
    if (filterDepartment && emp.department !== filterDepartment) return false;
    const empDesig = emp.role || emp.designation;
    if (filterDesignation && empDesig !== filterDesignation) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.name?.toLowerCase().includes(q)
    );
  });

  const totalPages  = Math.ceil(visibleEmployees.length / itemsPerPage);
  const startIdx    = (currentPage - 1) * itemsPerPage;
  const currentItems = visibleEmployees.slice(startIdx, startIdx + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1);
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-semibold text-blue-600">Loading Over Time data...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-2 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-9xl">

        {/* Toast notification */}
        {saveStatus && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-white animate-fade-in ${
            saveStatus.includes('✅') ? 'bg-green-600 border-l-4 border-green-700' : 'bg-red-500 border-l-4 border-red-600'
          }`}>
            {saveStatus}
          </div>
        )}

        {/* ── Filter bar (same as AttendanceSummary) ── */}
        <div className="p-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter Button */}
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
              
              {/* Department Filter Dropdown */}
              {showDepartmentFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDepartment('');
                      setShowDepartmentFilter(false);
                      setCurrentPage(1);
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
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Designation Filter Button */}
            <div className="relative" ref={designationFilterRef}>
              <button
                onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  filterDesignation 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <FaUserTag className="text-xs" /> Desig {filterDesignation && `: ${filterDesignation}`}
              </button>
              
              {/* Designation Filter Dropdown */}
              {showDesignationFilter && (
                <div className="absolute z-50 w-48 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                  <div 
                    onClick={() => {
                      setFilterDesignation('');
                      setShowDesignationFilter(false);
                      setCurrentPage(1);
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
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${
                        filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Month selector */}
            <div className="relative min-w-[130px]">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={e => e.target.showPicker && e.target.showPicker()}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('');
                setFilterDesignation('');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>

            {/* Download Button */}
            <button
              onClick={downloadCombinedExcel}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 whitespace-nowrap"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ZIP
            </button>
            <button
              onClick={downloadAllOTCSV}
              className="ml-2 flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 whitespace-nowrap"
            >
              CSV
            </button>
          </div>
        </div>

        {/* ── Table card (same as AttendanceSummary) ── */}
        <div className="p-0 mb-0 bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-blue-600">
                <tr>
                  <th className="py-2 px-3 text-center">Employee ID</th>
                  <th className="py-2 px-3 text-center">Name</th>
                  <th className="py-2 px-3 text-center">Department</th>
                  <th className="py-2 px-3 text-center">Designation</th>
                  <th className="py-2 px-3 text-center">Role</th>
                  <th className="py-2 px-3 text-center">Salary (₹/mo)</th>
                  <th className="py-2 px-3 text-center">Shift Hrs</th>
                  <th className="py-2 px-3 text-center">Hourly Rate</th>
                  <th className="py-2 px-3 text-center">Over Time</th>
                  <th className="py-2 px-3 text-center">OT Rate (₹/h)</th>
                  <th className="py-2 px-3 text-center">OT Pay (₹)</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                  <th className="py-2 px-3 text-center">Download</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((emp) => {
                  const otHours    = computeOT(emp.employeeId);
                  const rate       = computeHourlyRateNumeric(emp);
                  const mult       = otMultipliers[emp.employeeId] ?? 2;
                  const otRateVal  = rate ? (rate * mult) : null;
                  const approved   = otStatus[emp.employeeId];

                  return (
                    <tr
                      key={emp.employeeId}
                      className="border-t border-gray-200 hover:bg-blue-50"
                    >
                      {/* Employee ID */}
                      <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                        {emp.employeeId}
                      </td>

                      {/* Name */}
                      <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                        {emp.name}
                      </td>

                      {/* Department */}
                      <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                        {getEmployeeDepartment(emp.employeeId)}
                      </td>

                      {/* Designation */}
                      <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                        {getEmployeeDesignation(emp.employeeId)}
                      </td>
                      {/* Role */}
                      <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                        {getEmployeeRole(emp.employeeId)}
                      </td>
                      {/* Salary */}
                      <td className="px-2 py-2 text-center text-gray-600">
                        {emp.salaryPerMonth ? `₹${emp.salaryPerMonth.toLocaleString()}` : '-'}
                      </td>

                      {/* Shift hours */}
                      <td className="px-2 py-2 text-center text-gray-600">
                        {getEmployeeShiftHours(emp.employeeId)}h
                      </td>

                      {/* Hourly rate */}
                      <td className="px-2 py-2 text-center text-gray-600">
                        {computeHourlyRate(emp)}
                      </td>

                      {/* OT hours */}
                      <td className="px-2 py-2 font-semibold text-center text-indigo-600">
                        {formatDecimalHours(otHours)}
                      </td>

                      {/* OT Rate (multiplier selector) */}
                      <td className="px-2 py-2 text-center text-gray-600">
                        <div className="flex items-center justify-center gap-1">
                          <select
                            value={mult}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const key = `otMultiplier_${emp.employeeId}_${selectedMonth}`;
                              localStorage.setItem(key, val);
                              setOtMultipliers(prev => ({ ...prev, [emp.employeeId]: val }));
                            }}
                            className="px-1 py-0.5 text-xs border border-gray-300 rounded bg-white text-gray-900"
                          >
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={3}>3x</option>
                          </select>
                          <span className="text-xs font-medium text-gray-700">
                            {otRateVal ? `₹${otRateVal.toFixed(2)}` : '-'}
                          </span>
                        </div>
                      </td>

                      {/* OT Pay */}
                      <td className="px-2 py-2 font-semibold text-center text-green-600">
                        {computeOTPay(emp.employeeId)}
                      </td>

                      {/* Status badge */}
                      <td className="px-2 py-2 text-center">
                        {approved === true && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        )}
                        {approved === false && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                        {approved === undefined && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-500">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Approve OT"
                            onClick={() => handleApprove(emp)}
                            className={`p-1.5 rounded transition-all duration-150 ${
                              approved === true
                                ? 'bg-green-100 scale-110 border border-green-500 shadow-sm'
                                : 'opacity-40 hover:opacity-100 hover:scale-105'
                            }`}
                          >✅</button>
                          <button
                            title="Reject OT"
                            onClick={() => handleReject(emp)}
                            className={`p-1.5 rounded transition-all duration-150 ${
                              approved === false
                                ? 'bg-red-100 scale-110 border border-red-500 shadow-sm'
                                : 'opacity-40 hover:opacity-100 hover:scale-105'
                            }`}
                          >❌</button>
                        </div>
                      </td>

                      {/* Download */}
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => downloadSingleEmployeeExcel(emp.employeeId)}
                          className="inline-flex items-center justify-center px-4 py-1 font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                          title={`Download ${emp.name}'s report (ZIP)`}
                        >
                          ⬇
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Pagination (same as AttendanceSummary) ── */}
            {visibleEmployees.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-6 pb-4 sm:flex-row px-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Show:</label>
                    <select
                      value={itemsPerPage}
                      onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-1 text-sm border rounded-lg ${
                        currentPage === page
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-1 text-sm border rounded-lg ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
                        : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {visibleEmployees.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No records found for {selectedMonth}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default OverTime;