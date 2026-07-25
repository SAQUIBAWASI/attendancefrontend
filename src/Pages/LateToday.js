import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaSearch, FaUserTag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiUsers, FiFilter, FiClock, FiPercent, FiCalendar, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "../index.css";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import { isEmployeeHidden } from "../utils/employeeStatus";

const BASE_URL = API_BASE_URL;

const LateToday = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [allDatesCount, setAllDatesCount] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);
  
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);
  
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  
  // ─── PERSISTED PAGINATION ───
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: (() => {
      const saved = localStorage.getItem('lateToday_itemsPerPage');
      return saved ? parseInt(saved, 10) : 10;
    })(),
  });

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

  useEffect(() => {
    fetchLateAttendance();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation]);

  const filterRecords = () => {
    let filtered = [...records];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => 
        rec.employeeId?.toString().toLowerCase().includes(term) ||
        rec.employeeName?.toLowerCase().includes(term)
      );
    }
    
    if (filterDepartment) {
      filtered = filtered.filter(rec => rec.department === filterDepartment);
    }
    
    if (filterDesignation) {
      filtered = filtered.filter(rec => rec.designation === filterDesignation);
    }
    
    setFilteredRecords(filtered);
    setPagination(prev => ({
      ...prev,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit)
    }));
  };

  const indexOfLastRow = pagination.currentPage * pagination.limit;
  const indexOfFirstRow = indexOfLastRow - pagination.limit;
  const currentRows = filteredRecords.slice(indexOfFirstRow, indexOfLastRow);

  // ─── HANDLE ITEMS PER PAGE CHANGE WITH LOCALSTORAGE ───
  const handleItemsPerPageChange = (limit) => {
    setPagination({
      currentPage: 1,
      limit: limit,
      totalCount: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / limit)
    });
    localStorage.setItem('lateToday_itemsPerPage', String(limit));
  };

  const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
    const shiftAssignment = shiftsData.find(s => {
      const empId = s.employeeAssignment?.employeeId || s.employeeId;
      return empId === employeeId || 
             empId?.toString() === employeeId?.toString() ||
             (s.employeeId && s.employeeId === employeeId);
    });

    if (!shiftAssignment) {
      return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false, shiftType: "DEFAULT" };
    }

    const shiftType = shiftAssignment.shiftType || shiftAssignment.shift?.shiftType;
    
    if (!shiftType) {
      return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false };
    }
    
    const masterShift = masterShifts.find(shift => shift.shiftType === shiftType);

    if (!masterShift) {
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
    }

    if (masterShift.isBrakeShift && masterShift.timeSlots && masterShift.timeSlots.length >= 2) {
      const startTime = masterShift.timeSlots[0]?.timeRange?.split('-')[0]?.trim() || "07:00";
      return {
        start: startTime,
        end: masterShift.timeSlots[1]?.timeRange?.split('-')[1]?.trim() || "21:30",
        grace: masterShift.graceMinutes || 5,
        isBrakeShift: true,
        shiftType: shiftType
      };
    }

    if (masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      const timeSlot = masterShift.timeSlots[0];
      if (timeSlot.timeRange) {
        const [start, end] = timeSlot.timeRange.split('-').map(s => s.trim());
        return {
          start: start || "09:00",
          end: end || "18:00",
          grace: masterShift.graceMinutes || 5,
          isBrakeShift: false,
          shiftType: shiftType
        };
      }
    }

    return { start: "09:00", end: "18:00", grace: 5, isBrakeShift: false, shiftType: shiftType };
  };

  const calculateLateMinutes = (employeeId, checkInTime, shiftsData, masterShifts) => {
    if (!checkInTime) return 0;
    
    const shift = getEmployeeShift(employeeId, shiftsData, masterShifts);
    if (!shift || !shift.start) return 0;

    const checkInDateTime = new Date(checkInTime);
    
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
      const diffMs = checkInDateTime - graceTime;
      return Math.floor(diffMs / (1000 * 60));
    }

    return 0;
  };

  const processLateRecords = (attendanceData, employees, activeEmployeeIds, shiftsData, masterShifts) => {
    const lateRecords = [];

    attendanceData.forEach(record => {
      if (!record.checkInTime) return;

      const recordDate = new Date(record.checkInTime);
      const recordDateStr = recordDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const id = (typeof record.employeeId === 'object' 
        ? record.employeeId?.employeeId || record.employeeId?._id
        : record.employeeId);
      
      if (!id) return;
      if (!activeEmployeeIds.has(id)) return;

      const lateMinutes = calculateLateMinutes(id, record.checkInTime, shiftsData, masterShifts);
      
      if (lateMinutes > 0) {
        const emp = employees.find(e => (e.employeeId === id || e._id === id));
        const shift = getEmployeeShift(id, shiftsData, masterShifts);

        const recordObj = {
          _id: record._id || `${id}_${recordDateStr}_${Date.now()}_${Math.random()}`,
          employeeId: id,
          employeeName: emp?.name || "Unknown",
          department: emp?.department || emp?.departmentName || "N/A",
          designation: emp?.designation || emp?.role || "N/A",
          shiftStart: shift?.start || "Not set",
          checkInTime: record.checkInTime,
          lateByMinutes: lateMinutes,
          shiftType: shift?.shiftType || "Unknown",
          isBrakeShift: shift?.isBrakeShift || false,
          expectedTime: shift?.start || "Not set",
          actualTime: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: recordDateStr,
          checkInTimeFull: record.checkInTime,
          profilePicture: emp?.profilePicture || null
        };

        lateRecords.push(recordObj);
      }
    });

    return lateRecords.sort((a, b) => new Date(b.checkInTimeFull) - new Date(a.checkInTimeFull));
  };

  const fetchLateAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      
      let startDate = fromDate;
      let endDate = toDate;
      
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
        startDate = firstDay;
        endDate = lastDay;
      }
      
      if (startDate && endDate) {
        params.append('fromDate', startDate);
        params.append('toDate', endDate);
      } else if (startDate) {
        params.append('fromDate', startDate);
        params.append('toDate', startDate);
      }

      const [empResp, shiftsResp, masterShiftsResp, attendanceResp] = await Promise.all([
        axios.get(`${BASE_URL}/employees/get-employees`),
        axios.get(`${BASE_URL}/shifts/assignments`),
        axios.get(`${BASE_URL}/shifts/master`),
        axios.get(`${BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`)
      ]);

      const employeesData = empResp.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      
      extractUniqueValues(activeEmployees);

      const shiftsData = shiftsResp.data.success ? shiftsResp.data.data || [] : [];
      const masterShifts = masterShiftsResp.data.success ? masterShiftsResp.data.data || [] : [];

      const attendanceData = attendanceResp.data || [];
      const allAttendance = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.records || attendanceData.allAttendance || [];

      const lateRecords = processLateRecords(allAttendance, employeesData, activeEmployeeIds, shiftsData, masterShifts);
      
      setRecords(lateRecords);
      setFilteredRecords(lateRecords);
      setPagination(prev => ({
        ...prev,
        totalCount: lateRecords.length,
        totalPages: Math.ceil(lateRecords.length / prev.limit)
      }));

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getLateColor = (minutes) => {
    if (minutes <= 5) return 'text-blue-700 bg-blue-100';
    if (minutes <= 10) return 'text-lime-600 bg-lime-100';
    if (minutes <= 20) return 'text-yellow-600 bg-yellow-100';
    if (minutes <= 30) return 'text-orange-600 bg-orange-100';
    if (minutes <= 45) return 'text-red-600 bg-red-100';
    if (minutes <= 55) return 'text-red-700 bg-red-200';
    if (minutes <= 65) return 'text-red-800 bg-red-300';
    return 'text-red-900 bg-red-400';
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate(getTodayDate());
    setToDate(getTodayDate());
    setSelectedMonth("");
    if (window.innerWidth < 640) {
      setShowMobileFilters(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pageNumbers.push(i);
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[0]}-${parts[1]}-${parts[2]}`;
        }
    }
    return dateStr;
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading late records...</p>
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
                <h3 className="emp-dash__card-title">Couldn't load late records</h3>
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

        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Late <span>Today</span>
            </h1>
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Late</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{records.length}</div>
            <div className="emp-dash__stat-meta">active in view</div>
          </div>
          
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Late</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Employees</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{employees.length}</div>
            <div className="emp-dash__stat-meta">active employees</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Late Rate</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiPercent />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {employees.length > 0 ? ((records.length / employees.length) * 100).toFixed(1) : 0}%
            </div>
            <div className="emp-dash__stat-meta">average rate</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          {/* Desktop View */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
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

                <div className="relative">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={fetchLateAttendance}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {(searchTerm || filterDepartment || filterDesignation || fromDate !== getTodayDate() || toDate !== getTodayDate() || selectedMonth) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <FiFilter className="text-blue-600 text-base" />
                <span>Filters</span>
                {showMobileFilters ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              <span className="text-xs text-gray-500">
                <strong>{filteredRecords.length}</strong> late records
              </span>
            </div>

            {showMobileFilters && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
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

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={fetchLateAttendance}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    {(searchTerm || filterDepartment || filterDesignation || fromDate !== getTodayDate() || toDate !== getTodayDate() || selectedMonth) && (
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

        {/* Table Section */}
        <div className="emp-dash__card">
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-5xl">🎉</div>
              <p className="mb-1 text-base font-bold text-slate-700">
                {fromDate && toDate && fromDate === toDate 
                  ? `No late employees on ${formatDateForDisplay(fromDate)}` 
                  : fromDate && toDate && fromDate !== toDate
                  ? `No late employees from ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`
                  : selectedMonth 
                  ? `No late employees in ${selectedMonth}`
                  : "No late employees found"}
              </p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">Everyone has checked in on time during this period!</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>Emp ID</th>
                      <th>Employee Name</th>
                      <th className="hidden md:table-cell">Department</th>
                      <th className="hidden lg:table-cell">Designation</th>
                      <th style={{ textAlign: "center" }}>Expected Time</th>
                      <th style={{ textAlign: "center" }}>Actual Time</th>
                      <th style={{ textAlign: "center" }}>Late By</th>
                      <th style={{ textAlign: "right" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec) => (
                      <tr key={rec._id} className="hover:bg-gray-55/60 transition-all">
                        <td style={{ textAlign: "center" }} className="font-semibold text-gray-900 whitespace-nowrap text-[11px]">{rec.employeeId}</td>
                        <td className="font-semibold text-gray-900 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-2">
                            {rec.profilePicture ? (
                              <img 
                                src={rec.profilePicture} 
                                alt={rec.employeeName} 
                                className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div 
                              style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                              className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
                            >
                              {rec.employeeName ? rec.employeeName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span>{rec.employeeName}</span>
                          </div>
                        </td>
                        <td className="text-[11px] hidden md:table-cell">{rec.department}</td>
                        <td className="text-[11px] hidden lg:table-cell">{rec.designation}</td>
                        <td style={{ textAlign: "center" }} className="font-semibold text-blue-600 whitespace-nowrap text-[11px]">{rec.expectedTime || "-"}</td>
                        <td style={{ textAlign: "center" }} className="font-semibold text-orange-600 whitespace-nowrap text-[11px]">{rec.actualTime || "-"}</td>
                        <td style={{ textAlign: "center" }}><span className={`px-2 py-1 rounded-full text-[9px] font-semibold ${getLateColor(rec.lateByMinutes)}`}>{rec.lateByMinutes} mins</span></td>
                        <td style={{ textAlign: "right" }} className="text-gray-500 whitespace-nowrap text-[11px]">
                          {formatDateForDisplay(rec.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="block lg:hidden divide-y divide-gray-100">
                {currentRows.map((rec) => (
                  <div key={rec._id} className="p-4 hover:bg-gray-55/60 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {rec.profilePicture ? (
                          <img 
                            src={rec.profilePicture} 
                            alt={rec.employeeName} 
                            className="w-7 h-7 rounded-full border border-gray-200 object-cover shadow-sm"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div 
                          style={{ display: rec.profilePicture ? 'none' : 'flex' }}
                          className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
                        >
                          {rec.employeeName ? rec.employeeName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{rec.employeeName}</h4>
                          <span className="text-xs text-gray-500">{rec.employeeId}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded border border-red-200 text-[9px] font-bold ${getLateColor(rec.lateByMinutes)}`}>
                        {rec.lateByMinutes} mins
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600 mt-2">
                      <div><span className="text-gray-400">Dept:</span> {rec.department}</div>
                      <div><span className="text-gray-400">Desig:</span> {rec.designation}</div>
                      <div><span className="text-gray-400">Expected:</span> {rec.expectedTime}</div>
                      <div><span className="text-gray-400">Actual:</span> {rec.actualTime}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Date: <span className="font-medium text-gray-600">{formatDateForDisplay(rec.date)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── PAGINATION SECTION ─── */}
              <div className="flex flex-col items-center justify-between gap-4 p-4 border-t border-gray-100 sm:flex-row bg-white rounded-b-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500">
                      Show:
                    </label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="p-1 px-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-xs text-slate-400 hidden sm:inline">entries</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-700">{(pagination.currentPage - 1) * pagination.limit + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</strong> of <strong className="text-slate-700">{pagination.totalCount}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      pagination.currentPage === 1
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? setPagination(prev => ({ ...prev, currentPage: page })) : null}
                      disabled={page === "..."}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all duration-150 min-w-[28px] ${
                        page === "..."
                          ? "bg-white text-slate-400 border-none cursor-default"
                          : pagination.currentPage === page
                            ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      pagination.currentPage === pagination.totalPages
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
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
    </div>
  );
};

export default LateToday;