import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiUsers, FiFilter, FiUserX, FiPercent, FiCalendar, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const BASE_URL = API_BASE_URL;

const AbsentToday = () => {
  const [absentRecords, setAbsentRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allDatesCount, setAllDatesCount] = useState(1);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getTodayDate = () => {
    return formatDateForAPI(new Date());
  };
  
  const parseDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };
  
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
 const [selectedMonth, setSelectedMonth] = useState(
  new Date().toISOString().slice(0, 7)
);
  
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
      const saved = localStorage.getItem('absentToday_itemsPerPage');
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
    fetchAbsentRecords();
  }, [fromDate, toDate, selectedMonth]);

  useEffect(() => {
    filterRecords();
  }, [absentRecords, searchTerm, filterDepartment, filterDesignation]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, filterDepartment, filterDesignation]);

  const filterRecords = () => {
    let filtered = [...absentRecords];
    
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
    localStorage.setItem('absentToday_itemsPerPage', String(limit));
  };

  const fetchAbsentRecords = async () => {
    try {
      setLoading(true);
      setError(null);

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
      }

      const [empResp, attResp] = await Promise.all([
        axios.get(`${BASE_URL}/employees/get-employees`),
        axios.get(`${BASE_URL}/attendance/allattendance${params.toString() ? `?${params.toString()}` : ''}`)
      ]);

      const employeesData = empResp.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);
      
      extractUniqueValues(activeEmployees);

      let attendanceData = attResp.data || [];
      if (attendanceData.allAttendance) {
        attendanceData = attendanceData.allAttendance;
      } else if (attendanceData.records) {
        attendanceData = attendanceData.records;
      }
      
      const allAttendance = Array.isArray(attendanceData) ? attendanceData : [];

      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      const allDatesInRange = [];
      let currentDate = new Date(startDateTime);
      while (currentDate <= endDateTime) {
        const dateStr = formatDateForAPI(currentDate);
        allDatesInRange.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setAllDatesCount(allDatesInRange.length || 1);
      
      const presentDatesByEmployee = new Map();
      
      allAttendance.forEach(record => {
        let checkInTime = record.checkInTime;
        
        if (checkInTime) {
          let recordDate;
          if (typeof checkInTime === 'string' && checkInTime.includes('-')) {
            const parts = checkInTime.split(' ');
            const datePart = parts[0];
            if (datePart.includes('-')) {
              const dateParts = datePart.split('-');
              if (dateParts[0].length === 4) {
                recordDate = new Date(datePart);
              } else {
                recordDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
              }
            } else {
              recordDate = new Date(checkInTime);
            }
          } else {
            recordDate = new Date(checkInTime);
          }
          
          if (!isNaN(recordDate.getTime()) && recordDate >= startDateTime && recordDate <= endDateTime) {
            const recordDateStr = formatDateForAPI(recordDate);
            
            let id = record.employeeId;
            if (typeof id === 'object' && id !== null) {
              id = id.employeeId || id._id;
            }
            
            if (id) {
              if (!presentDatesByEmployee.has(id.toString())) {
                presentDatesByEmployee.set(id.toString(), new Set());
              }
              presentDatesByEmployee.get(id.toString()).add(recordDateStr);
            }
          }
        }
      });
      
      const absentRecordsList = [];
      
      activeEmployees.forEach((emp) => {
        const empId = (emp.employeeId || emp._id || emp.empId)?.toString();
        if (!empId) return;
        
        const presentDates = presentDatesByEmployee.get(empId) || new Set();
        
        allDatesInRange.forEach(date => {
          if (!presentDates.has(date)) {
            absentRecordsList.push({
              _id: `${empId}_${date}`,
              employeeId: empId,
              employeeName: emp.name || emp.fullName || "N/A",
              date: date,
              department: emp.department || emp.departmentName || "N/A",
              designation: emp.designation || emp.role || "N/A",
              profilePicture: emp.profilePicture || null
            });
          }
        });
      });
      
      absentRecordsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAbsentRecords(absentRecordsList);
      setFilteredRecords(absentRecordsList);
      setPagination(prev => ({
        ...prev,
        totalCount: absentRecordsList.length,
        totalPages: Math.ceil(absentRecordsList.length / prev.limit)
      }));
      
    } catch (err) {
      console.error("Error fetching absent records:", err);
      setError("Failed to fetch absent records");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate(getTodayDate());
    setToDate(getTodayDate());
    setSelectedMonth("");
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

  const handleCardClick = (filterType) => {
    const tableSection = document.querySelector('.emp-dash__card:last-child');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading absent records...</p>
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
                <h3 className="emp-dash__card-title">Couldn't load absent records</h3>
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

        {/* ✅ Header with Title Only - REMOVED DATE PILL */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Absent <span>Today</span>
            </h1>
          </div>

          {/* Right side: All Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[130px] pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Department */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => {
                  setShowDepartmentFilter(!showDepartmentFilter);
                  setShowDesignationFilter(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  filterDepartment
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaBuilding className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDepartmentFilter && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
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
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  filterDesignation
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaUserTag className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{filterDesignation || "Design"}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showDesignationFilter && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
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

            {/* Date From */}
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="From"
                className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                placeholder="To"
                className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Month Picker */}
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAbsentRecords}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Clear Filters Button */}
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

        {/* ✅ Mobile Header - REMOVED DATE PILL */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Absent <span className="text-indigo-600">Today</span>
          </h1>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
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
              <strong>{filteredRecords.length}</strong> absences
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
                    onClick={fetchAbsentRecords}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('total')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Absences</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value">{absentRecords.length}</div>
            <div className="emp-dash__stat-meta">active in view</div>
          </div>
          
          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('filtered')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Absences</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('employees')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Employees</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{employees.length}</div>
            <div className="emp-dash__stat-meta">active employees</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('rate')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Avg Absent Rate</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiPercent />
              </div>
            </div>
            <div className="emp-dash__stat-value">
              {employees.length > 0 ? ((absentRecords.length / (employees.length * allDatesCount)) * 100).toFixed(1) : 0}%
            </div>
            <div className="emp-dash__stat-meta">average rate</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="emp-dash__card">
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-5xl">🎉</div>
              <p className="mb-1 text-base font-bold text-slate-700">
                {fromDate && toDate && fromDate === toDate 
                  ? `No absent employees on ${formatDateForDisplay(fromDate)}` 
                  : fromDate && toDate && fromDate !== toDate
                  ? `No absent employees from ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`
                  : selectedMonth 
                  ? `No absent employees in ${selectedMonth}`
                  : "No absent employees found"}
              </p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">Everyone has checked in successfully during this period!</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>Emp ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th style={{ textAlign: "right" }}>Absent Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((rec) => (
                      <tr key={rec._id} className="hover:bg-gray-55/60 transition-all">
                        <td style={{ textAlign: "center" }} className="font-semibold text-gray-900 whitespace-nowrap">{rec.employeeId}</td>
                        <td className="font-semibold text-gray-900 whitespace-nowrap">
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
                        <td>{rec.department}</td>
                        <td>{rec.designation}</td>
                        <td style={{ textAlign: "right" }} className="font-bold text-rose-600 whitespace-nowrap">
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
                          <h4 className="font-semibold text-gray-900">{rec.employeeName}</h4>
                          <span className="text-xs text-gray-500">{rec.employeeId}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                        Absent: {formatDateForDisplay(rec.date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600 mt-2">
                      <div><span className="text-gray-400">Dept:</span> {rec.department}</div>
                      <div><span className="text-gray-400">Desig:</span> {rec.designation}</div>
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
                    <span className="text-xs text-slate-400">entries</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-700">{(pagination.currentPage - 1) * pagination.limit + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</strong> of <strong className="text-slate-700">{pagination.totalCount}</strong> absences
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
                      pagination.currentPage === 1
                        ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? setPagination(prev => ({ ...prev, currentPage: page })) : null}
                      disabled={page === "..."}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
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
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${
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

export default AbsentToday;