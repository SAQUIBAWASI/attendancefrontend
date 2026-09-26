import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiUser
} from 'react-icons/fi';
import { API_BASE_URL } from '../config';
import { isEmployeeHidden } from '../utils/employeeStatus';
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAY_LABELS = [
  { full: 'Sunday', short: 'Sun', letter: 'Su', isWeekend: true },
  { full: 'Monday', short: 'Mon', letter: 'Mo', isWeekend: false },
  { full: 'Tuesday', short: 'Tue', letter: 'Tu', isWeekend: false },
  { full: 'Wednesday', short: 'Wed', letter: 'We', isWeekend: false },
  { full: 'Thursday', short: 'Thu', letter: 'Th', isWeekend: false },
  { full: 'Friday', short: 'Fri', letter: 'Fr', isWeekend: false },
  { full: 'Saturday', short: 'Sat', letter: 'Sa', isWeekend: true }
];

// Helper to compute calendar grid for a given YYYY-MM string
const getMonthCalendarDays = (monthStr) => {
  if (!monthStr) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const [year, month] = monthStr.split('-').map(Number);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun .. 6 = Sat
  const daysInMonth = new Date(year, month, 0).getDate();

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    return { day, dateStr, dayOfWeek };
  });

  return { blanks, days, daysInMonth, year, month };
};

export default function Rosters() {
  const [employees, setEmployees] = useState([]);
  const [weekOffRecords, setWeekOffRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterShifts, setMasterShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Employee State (Automatically identified)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Month Selection State (Defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchEmployees(),
        fetchWeekOffRecords(),
        fetchShiftAssignments(),
        fetchMasterShifts()
      ]);
    } catch (err) {
      console.error('Error loading roster data:', err);
      setError('Failed to load roster data. Please check connection to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employees/get-employees`);
      if (Array.isArray(res.data)) {
        const activeList = res.data.filter(emp => !isEmployeeHidden(emp));
        setEmployees(activeList);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchWeekOffRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/week-off`);
      if (res.data.success) {
        setWeekOffRecords(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch week-off records:', err);
    }
  };

  const fetchShiftAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/assignments`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch shift assignments:', err);
    }
  };

  const fetchMasterShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shifts/master`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setMasterShifts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch master shifts:', err);
    }
  };

  // Master shifts map for quick timing lookup
  const masterShiftMap = useMemo(() => {
    const map = new Map();
    masterShifts.forEach(s => {
      if (s.shiftType) map.set(s.shiftType.toUpperCase(), s);
    });
    return map;
  }, [masterShifts]);

  // Format month helper: "2026-09" => "September 2026"
  const formatMonthLabel = (monthValue, short = false) => {
    if (!monthValue) return '';
    try {
      const [year, month] = monthValue.split('-');
      const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNamesFull = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const mIdx = parseInt(month, 10) - 1;
      return `${short ? monthNamesShort[mIdx] : monthNamesFull[mIdx]} ${year}`;
    } catch {
      return monthValue;
    }
  };

  // Format time display helper
  const formatTimeDisplay = (time) => {
    if (!time) return '';
    if (/[AP]M/i.test(time)) return time;
    let [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper: Find assigned shift for an employee
  const getEmployeeShift = (emp) => {
    if (!emp) return null;
    const empId = String(emp.employeeId || emp._id);

    const assignment = assignments.find(a => {
      const aEmpId = a.employeeAssignment?.employeeId || a.employeeId;
      return String(aEmpId) === empId;
    });

    if (assignment) {
      const shiftType = assignment.shiftType || 'Regular';
      const master = masterShiftMap.get(shiftType.toUpperCase());

      let timeRange = assignment.employeeAssignment?.selectedTimeRange;
      if (!timeRange && assignment.timeSlots && assignment.timeSlots.length > 0) {
        timeRange = assignment.timeSlots[0].timeRange;
      }
      if (!timeRange && master && master.timeSlots && master.timeSlots.length > 0) {
        timeRange = master.timeSlots[0].timeRange;
      }
      if (!timeRange && assignment.startTime && assignment.endTime) {
        timeRange = `${formatTimeDisplay(assignment.startTime)} - ${formatTimeDisplay(assignment.endTime)}`;
      }

      return {
        shiftType,
        shiftName: assignment.shiftName || master?.shiftName || `Shift ${shiftType}`,
        shiftCategory: assignment.shiftCategory || master?.shiftCategory || 'Regular',
        timeRange: timeRange || '09:00 AM - 06:00 PM',
        isBrakeShift: assignment.isBrakeShift || master?.isBrakeShift || false,
        shiftHours: assignment.shiftHours || 9
      };
    }

    return null;
  };

  // Helper: Find applicable week-off record for an employee
  const getEmployeeWeekOffRecord = (emp) => {
    if (!emp) return null;
    const empId = String(emp.employeeId || emp._id);

    // 1. Employee-specific policy match (highest precedence)
    const specificRecord = weekOffRecords.find(rec =>
      !rec.selectAllEmployees &&
      rec.selectedEmployees?.some(e => String(e.employeeId) === empId || String(e._id) === empId)
    );
    if (specificRecord) return specificRecord;

    // 2. Global policy match (selectAllEmployees: true)
    const globalRecord = weekOffRecords.find(rec => rec.selectAllEmployees === true);
    if (globalRecord) return globalRecord;

    return null;
  };

  // Core week-off calculation
  const calculateDatesFromPattern = (record, targetMonth = null) => {
    if (!record) return [];

    const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

    if (targetMonth && hasSpecificMonths && !record.selectedMonths.includes(targetMonth)) {
      if (Array.isArray(record.specificDates)) {
        return record.specificDates.filter(d => d.startsWith(targetMonth));
      }
      return [];
    }

    const calculatedDates = [];
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

    let monthsToProcess = [];
    if (targetMonth) {
      monthsToProcess = [targetMonth];
    } else if (hasSpecificMonths) {
      monthsToProcess = record.selectedMonths;
    } else {
      const now = new Date();
      monthsToProcess = [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`];
    }

    // Weekly pattern
    if ((record.selectionMode === 'weekly' || !record.selectionMode) && record.weekOffDays && record.weekOffDays.length > 0) {
      monthsToProcess.forEach(monthVal => {
        if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;

        const [year, month] = monthVal.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        record.weekOffDays.forEach(dayName => {
          const fullDay = dayName.length === 3
            ? WEEK_DAYS.find(d => d.startsWith(dayName))
            : dayName;
          const targetDay = dayMap[fullDay];
          if (targetDay !== undefined) {
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month - 1, day);
              if (date.getDay() === targetDay) {
                calculatedDates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
              }
            }
          }
        });
      });
    }

    // Week-wise pattern
    if (record.selectionMode === 'weekwise' && record.weekwiseSelection && record.weekwiseSelection.length > 0) {
      monthsToProcess.forEach(monthVal => {
        if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;

        const [year, month] = monthVal.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        record.weekwiseSelection.forEach(({ week, day }) => {
          const fullDay = day.length === 3
            ? WEEK_DAYS.find(d => d.startsWith(day))
            : day;
          const targetDay = dayMap[fullDay];
          if (targetDay !== undefined) {
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const firstDayOffset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
            const targetDate = 1 + firstDayOffset + (week - 1) * 7;
            if (targetDate <= daysInMonth && targetDate > 0) {
              calculatedDates.push(`${year}-${String(month).padStart(2, '0')}-${String(targetDate).padStart(2, '0')}`);
            }
          }
        });
      });
    }

    // Manual specificDates
    if (Array.isArray(record.specificDates) && record.specificDates.length > 0) {
      record.specificDates.forEach(dateStr => {
        const dateMonth = dateStr.slice(0, 7);
        if (monthsToProcess.includes(dateMonth)) {
          calculatedDates.push(dateStr);
        }
      });
    }

    return Array.from(new Set(calculatedDates)).sort();
  };

  // Automatically determine the active employee
  useEffect(() => {
    if (employees.length === 0) return;

    if (!selectedEmployeeId) {
      // 1. Check localStorage for logged-in employee ID
      let storedId = localStorage.getItem("employeeId");
      if (!storedId) {
        const rawData = localStorage.getItem("employeeData");
        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            storedId = parsed.employeeId || parsed._id;
          } catch {
            storedId = null;
          }
        }
      }

      const matchStored = employees.find(e => e.employeeId === storedId || e._id === storedId);
      if (matchStored) {
        setSelectedEmployeeId(matchStored.employeeId || matchStored._id);
        return;
      }

      // 2. Check for "manager Kumar" (TH029) or name containing Kumar
      const matchKumar = employees.find(e =>
        (e.employeeId && e.employeeId.toUpperCase() === 'TH029') ||
        (e.name && e.name.toLowerCase().includes('kumar'))
      );
      if (matchKumar) {
        setSelectedEmployeeId(matchKumar.employeeId || matchKumar._id);
        return;
      }

      // 3. Check for employee with week-off record
      const matchWithWeekOff = employees.find(e => getEmployeeWeekOffRecord(e));
      if (matchWithWeekOff) {
        setSelectedEmployeeId(matchWithWeekOff.employeeId || matchWithWeekOff._id);
        return;
      }

      // 4. Fallback to first employee
      setSelectedEmployeeId(employees[0].employeeId || employees[0]._id);
    }
  }, [employees, selectedEmployeeId]);

  // Current active employee object
  const currentEmployee = useMemo(() => {
    if (!selectedEmployeeId || employees.length === 0) return null;
    return employees.find(
      e => String(e.employeeId) === String(selectedEmployeeId) || String(e._id) === String(selectedEmployeeId)
    ) || employees[0];
  }, [employees, selectedEmployeeId]);

  // Current employee's resolved data
  const currentEmployeeDetails = useMemo(() => {
    if (!currentEmployee) return null;
    const shift = getEmployeeShift(currentEmployee);
    const weekOff = getEmployeeWeekOffRecord(currentEmployee);
    const calculatedOffDates = weekOff ? calculateDatesFromPattern(weekOff, selectedMonth) : [];
    const hasSpecificMonths = Array.isArray(weekOff?.selectedMonths) && weekOff.selectedMonths.length > 0;
    const isInactiveMonth = hasSpecificMonths && !weekOff.selectedMonths.includes(selectedMonth);

    return {
      employee: currentEmployee,
      shift,
      weekOff,
      calculatedOffDates,
      hasWeekOff: !!weekOff,
      hasSpecificMonths,
      isInactiveMonth,
      isWeekly: (weekOff?.selectionMode || 'weekly') === 'weekly'
    };
  }, [currentEmployee, assignments, weekOffRecords, masterShiftMap, selectedMonth]);

  // Calendar Day Grid calculations
  const { blanks, days, year, month } = useMemo(
    () => getMonthCalendarDays(selectedMonth),
    [selectedMonth]
  );
  const currentMonthLabel = formatMonthLabel(selectedMonth);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const newDate = new Date(y, m - 2, 1);
    setSelectedMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const newDate = new Date(y, m, 1);
    setSelectedMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  return (
    <div className="emp-dash min-h-screen bg-slate-50/80 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* EXECUTIVE PAGE HEADER */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Work Roster & Schedule
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-full">
                    {formatMonthLabel(selectedMonth, true)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  View your active work shifts, timings, and customized monthly week-off calendar.
                </p>
              </div>
            </div>

            {/* Right Controls: Month Switcher & Refresh */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {/* Month Navigation Control */}
              <div className="inline-flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 shadow-2xs transition-colors cursor-pointer"
                  title="Previous Month"
                  aria-label="Previous Month"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
                  title="Select month"
                />

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 shadow-2xs transition-colors cursor-pointer"
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={loadAllData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title="Refresh Roster Data"
              >
                <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
              aria-label="Close error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN BODY: 3 METRIC / INFO CARDS & FULL CALENDAR */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-10 h-10 mx-auto mb-3 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <h3 className="text-sm font-bold text-slate-900">Loading Roster Schedule...</h3>
            <p className="text-xs text-slate-500 mt-1">Retrieving employee shift allocations and week-off pattern...</p>
          </div>
        ) : !currentEmployeeDetails ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <FaUsers className="text-xl" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Employee Information Found</h3>
            <p className="text-xs text-slate-500 mt-1">Please ensure you are logged in or employee records are available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ROW 1: 3 METRIC CARDS (RESPONSIVE GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              
              {/* CARD 1: EMPLOYEE IDENTITY & ROLE */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative flex-shrink-0">
                    {currentEmployee.profilePicture ? (
                      <img
                        src={
                          currentEmployee.profilePicture.startsWith('http')
                            ? currentEmployee.profilePicture
                            : `${BASE_URL}/${currentEmployee.profilePicture.replace(/^\//, '')}`
                        }
                        alt={currentEmployee.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {(currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Active Staff" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60">
                        {currentEmployee.employeeId || 'ID'}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/60">
                        Active
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
                      {currentEmployee.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {currentEmployee.role || currentEmployee.designation || 'Staff'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <FiBriefcase className="text-slate-400 text-xs" />
                      <span>Department:</span>
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{currentEmployee.department || '-'}</span>
                  </div>
                  {currentEmployee.email && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <FiMail className="text-slate-400 text-xs" />
                        <span>Email:</span>
                      </span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]" title={currentEmployee.email}>
                        {currentEmployee.email}
                      </span>
                    </div>
                  )}
                  {currentEmployee.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <FiPhone className="text-slate-400 text-xs" />
                        <span>Contact:</span>
                      </span>
                      <span className="font-semibold text-slate-700">{currentEmployee.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: ASSIGNED SHIFT TIMING */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Work Shift Schedule
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiClock className="text-base" />
                  </div>
                </div>

                {currentEmployeeDetails.shift ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-2xs">
                        {currentEmployeeDetails.shift.shiftType}
                      </span>
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {currentEmployeeDetails.shift.shiftName}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
                      <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                        <FaClock className="text-emerald-600 text-xs" />
                        <span>Working Timing:</span>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-emerald-950 mt-0.5 tracking-tight">
                        {currentEmployeeDetails.shift.timeRange}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <p className="text-xs font-semibold text-slate-500">General Hours</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">09:00 AM - 06:00 PM</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Category:</span>
                  <span className="font-semibold text-slate-700">
                    {currentEmployeeDetails.shift?.shiftCategory || 'Regular Shift'} ({currentEmployeeDetails.shift?.shiftHours || 9}h)
                  </span>
                </div>
              </div>

              {/* CARD 3: WEEK-OFF PATTERN SUMMARY */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Week-Off Policy
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiCalendar className="text-base" />
                  </div>
                </div>

                {currentEmployeeDetails.hasWeekOff ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg ${
                        currentEmployeeDetails.isWeekly
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/70'
                          : 'bg-purple-50 text-purple-700 border border-purple-200/70'
                      }`}>
                        {currentEmployeeDetails.isWeekly ? 'Weekly Pattern' : 'Week-wise Pattern'}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700">
                        {currentEmployeeDetails.weekOff?.selectAllEmployees ? 'Standard Rule' : 'Assigned Rule'}
                      </span>
                    </div>

                    <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/70">
                      <div className="text-[11px] text-purple-800 font-semibold">Configured Days:</div>
                      <div className="text-sm font-bold text-purple-950 mt-0.5">
                        {currentEmployeeDetails.isWeekly
                          ? `Every ${currentEmployeeDetails.weekOff?.weekOffDays?.join(', ') || 'Sunday'}`
                          : currentEmployeeDetails.weekOff?.weekwiseSelection
                              ?.map(item => `W${item.week}: ${item.day.slice(0, 3)}`)
                              .join(', ') || 'Custom week days'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <p className="text-xs text-slate-500 font-medium">No custom week-off rule assigned</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Standard working days apply</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Off-Days in {formatMonthLabel(selectedMonth, true)}:</span>
                  <span className={`font-bold ${currentEmployeeDetails.isInactiveMonth ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {currentEmployeeDetails.isInactiveMonth
                      ? '0 (Inactive Month)'
                      : `${currentEmployeeDetails.calculatedOffDates.length} Days Off`}
                  </span>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* ROW 2: FULL RESPONSIVE CALENDAR */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              
              {/* CALENDAR HEADER */}
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <FaCalendarAlt className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {currentEmployee.name}'s Schedule Calendar
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roster and week-off days for <strong>{currentMonthLabel}</strong>
                    </p>
                  </div>
                </div>

                {/* Color Legend & Arrows */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Color Legend */}
                  <div className="flex items-center gap-2.5 text-xs font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
                      <span className="text-emerald-900">
                        Week Off ({currentEmployeeDetails.calculatedOffDates.length})
                      </span>
                    </div>
                    {currentEmployeeDetails.weekOff?.specificDates?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                        <span className="text-amber-900">Extra Off</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block border border-slate-300" />
                      <span className="text-slate-500">Working Day</span>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
                      title="Previous Month"
                      aria-label="Previous Month"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-900 min-w-[110px] text-center">
                      {currentMonthLabel}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
                      title="Next Month"
                      aria-label="Next Month"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CONFIGURED MONTHS QUICK JUMP BAR */}
              {currentEmployeeDetails.hasSpecificMonths && (
                <div className="px-4 sm:px-6 py-2.5 bg-purple-50/60 border-b border-purple-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                    <span>🎯 Configured Target Months:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentEmployeeDetails.weekOff.selectedMonths.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMonth(m)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          selectedMonth === m
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {formatMonthLabel(m, true)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CALENDAR BODY */}
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* INACTIVE MONTH ALERT */}
                {currentEmployeeDetails.isInactiveMonth && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        <strong>No Week-Offs in {currentMonthLabel}:</strong> This policy was configured specifically for{' '}
                        <strong>{currentEmployeeDetails.weekOff.selectedMonths.map(m => formatMonthLabel(m, true)).join(', ')}</strong>.
                      </span>
                    </div>
                    {currentEmployeeDetails.weekOff.selectedMonths.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(currentEmployeeDetails.weekOff.selectedMonths[0])}
                        className="px-3 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        Jump to {formatMonthLabel(currentEmployeeDetails.weekOff.selectedMonths[0], true)} →
                      </button>
                    )}
                  </div>
                )}

                {/* NO POLICY NOTICE */}
                {!currentEmployeeDetails.hasWeekOff && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
                    <span>
                      Standard weekly work schedule is active for this employee.
                    </span>
                  </div>
                )}

                {/* 7-COLUMN MONTHLY CALENDAR GRID */}
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 text-center bg-slate-100/80 border-b border-slate-200/80 text-xs font-bold py-2.5 sm:py-3">
                    {WEEK_DAY_LABELS.map((d, i) => (
                      <div
                        key={d.full}
                        className={i === 0 ? 'text-rose-600 font-extrabold' : i === 6 ? 'text-indigo-600 font-extrabold' : 'text-slate-700'}
                      >
                        <span className="hidden sm:inline">{d.full}</span>
                        <span className="sm:hidden">{d.short}</span>
                      </div>
                    ))}
                  </div>

                  {/* Day Slots */}
                  <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-center">
                    {blanks.map((_, i) => (
                      <div
                        key={`blank-${i}`}
                        className="min-h-[55px] sm:min-h-[75px] md:min-h-[85px] bg-slate-50/40 p-1.5 sm:p-2"
                      />
                    ))}

                    {days.map((d) => {
                      const isOff = currentEmployeeDetails.calculatedOffDates.includes(d.dateStr);
                      const isSpecific = currentEmployeeDetails.weekOff?.specificDates?.includes(d.dateStr);

                      return (
                        <div
                          key={d.day}
                          className={`min-h-[55px] sm:min-h-[75px] md:min-h-[85px] p-1.5 sm:p-2 flex flex-col justify-between transition-all relative ${
                            isOff
                              ? 'bg-emerald-50/90 border border-emerald-400 sm:border-2 sm:border-emerald-500 rounded-lg sm:rounded-xl m-0.5 sm:m-1 shadow-2xs'
                              : isSpecific
                              ? 'bg-amber-50/90 border border-amber-400 sm:border-2 sm:border-amber-500 rounded-lg sm:rounded-xl m-0.5 sm:m-1 shadow-2xs'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isOff
                                  ? 'text-emerald-800 font-extrabold'
                                  : isSpecific
                                  ? 'text-amber-800 font-extrabold'
                                  : d.dayOfWeek === 0
                                  ? 'text-rose-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              {d.day}
                            </span>
                            {isOff && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse hidden sm:inline-block" />
                            )}
                            {isSpecific && !isOff && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse hidden sm:inline-block" />
                            )}
                          </div>

                          {isOff && (
                            <div className="mt-1">
                              <span className="inline-block px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-emerald-600 text-white rounded sm:rounded-md shadow-2xs whitespace-nowrap">
                                <span className="hidden sm:inline">🌿 </span>Week Off
                              </span>
                            </div>
                          )}

                          {isSpecific && !isOff && (
                            <div className="mt-1">
                              <span className="inline-block px-1 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white rounded sm:rounded-md shadow-2xs whitespace-nowrap">
                                <span className="hidden sm:inline">🎯 </span>Extra Off
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OFF DATES SUMMARY CHIPS */}
                {!currentEmployeeDetails.isInactiveMonth && currentEmployeeDetails.calculatedOffDates.length > 0 && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <FiCheckCircle className="text-emerald-600 text-sm" />
                        <span>
                          Total Week-Off Days in {currentMonthLabel}:{' '}
                          <strong className="text-emerald-700 font-extrabold text-sm">
                            {currentEmployeeDetails.calculatedOffDates.length} Days
                          </strong>
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                      {currentEmployeeDetails.calculatedOffDates.map((dateStr) => {
                        const d = new Date(dateStr + 'T00:00:00');
                        const dayName = WEEK_DAYS[d.getDay()];
                        return (
                          <span
                            key={dateStr}
                            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 text-xs font-semibold bg-white text-emerald-800 border border-emerald-300/80 rounded-lg shadow-2xs"
                          >
                            <span>{dateStr.slice(8, 10)} {formatMonthLabel(selectedMonth, true).slice(0, 3)}</span>
                            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-normal">({dayName})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
