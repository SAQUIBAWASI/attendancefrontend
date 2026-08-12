
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag, FaChevronUp, FaChevronDown, FaTimes, FaClock } from "react-icons/fa";
import { FiCoffee, FiFilter, FiMapPin, FiUserCheck, FiUsers, FiDownload, FiTrash2, FiImage } from "react-icons/fi";
import { filterActiveRecords, isEmployeeHidden } from "../utils/employeeStatus";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// ✅ Remove /api from BASE_URL for static files
const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

// ✅ Helper function to format break minutes
const formatBreakMinutes = (minutes) => {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

// ✅ Helper function to calculate total break minutes from breaks array
const calculateTotalBreakMinutes = (breaks) => {
  if (!breaks || breaks.length === 0) return 0;
  return breaks.reduce((total, b) => total + (b.breakMinutes || 0), 0);
};

// ✅ Helper function to get full image URL - REMOVED /api
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
};

// ✅ Helper function to format date with time
const formatDateWithTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }) + ' at ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function AttendanceList() {
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Mobile filter visibility state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('attendanceList_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // ✅ Image Popup states
  const [imagePopup, setImagePopup] = useState({
    isOpen: false,
    imageUrl: null,
    imageType: null,
    employeeName: null,
    employeeId: null,
    date: null,
    rawImagePath: null,
    checkInTime: null,
    checkOutTime: null
  });

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

  // ✅ Apply date filters on frontend
  const applyDateFilters = (data, month, from, to) => {
    let filtered = [...data];
    
    if (from && to) {
      const fromDateObj = new Date(from);
      fromDateObj.setHours(0, 0, 0, 0);
      const toDateObj = new Date(to);
      toDateObj.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        if (!rec.checkInTime) return false;
        const recordDate = new Date(rec.checkInTime);
        return recordDate >= fromDateObj && recordDate <= toDateObj;
      });
    }
    else if (month && !from && !to) {
      filtered = filtered.filter(rec => {
        if (!rec.checkInTime) return false;
        const recordMonth = new Date(rec.checkInTime).toISOString().slice(0, 7);
        return recordMonth === month;
      });
    }
    else if (from && !to) {
      const fromDateObj = new Date(from);
      fromDateObj.setHours(0, 0, 0, 0);
      const toDateObj = new Date(from);
      toDateObj.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(rec => {
        if (!rec.checkInTime) return false;
        const recordDate = new Date(rec.checkInTime);
        return recordDate >= fromDateObj && recordDate <= toDateObj;
      });
    }
    
    setRecords(filtered);
    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  // ✅ Main fetch function
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const empRes = await fetch(`${BASE_URL}/api/employees/get-employees`);
      const employeesData = empRes.ok ? await empRes.json() : [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);

      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      const url = `${BASE_URL}/api/attendance/allattendance`;
      console.log("Fetching all attendance data from:", url);
      
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

      const sortedRecords = (data.records || []).sort((a, b) =>
        new Date(b.checkInTime) - new Date(a.checkInTime)
      );

      const activeRecords = filterActiveRecords(sortedRecords, employeesData);
      
      setAllAttendanceData(activeRecords);
      applyDateFilters(activeRecords, selectedMonth, "", "");
      
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");
    applyDateFilters(allAttendanceData, month, "", "");
  };

  const handleFromDateChange = (e) => {
    const from = e.target.value;
    setFromDate(from);
    if (from) {
      setSelectedMonth("");
    }
    applyDateFilters(allAttendanceData, "", from, toDate);
  };

  const handleToDateChange = (e) => {
    const to = e.target.value;
    setToDate(to);
    if (to) {
      setSelectedMonth("");
    }
    applyDateFilters(allAttendanceData, "", fromDate, to);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getDayName = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return { name: "Unknown", department: "N/A", designation: "N/A", profilePicture: null };
    const emp = employees.find(
      (e) =>
        e.employeeId === employeeId ||
        e._id === employeeId
    );
    return {
      name: emp ? emp.name : "Unknown",
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A",
      profilePicture: emp?.profilePicture || null
    };
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        const name = empDetails.name.toLowerCase();
        const id = (rec.employeeId || "").toString().toLowerCase();
        return name.includes(term) || id.includes(term);
      });
    }

    if (filterDepartment) {
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    if (filterDesignation) {
      filtered = filtered.filter(rec => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDepartment, filterDesignation, records]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setFromDate("");
    setToDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    applyDateFilters(allAttendanceData, new Date().toISOString().slice(0, 7), "", "");
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem('attendanceList_itemsPerPage', String(newValue));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Employee ID", "Employee Name", "Department", "Designation",
      "Date", "Day", "Check-In Time", "Check-Out Time", "Total Hours", 
      "Break Time", "Distance (m)", "Onsite", "Reason", "Status"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((rec) => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        const recordDate = rec.checkInTime ? new Date(rec.checkInTime) : null;
        const formattedHours = formatDecimalHours(rec.totalHours);
        const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
        const formattedBreak = formatBreakMinutes(breakMinutes);
        return [
          `"${rec.employeeId}"`,
          `"${empDetails.name}"`,
          `"${empDetails.department}"`,
          `"${empDetails.designation}"`,
          `"${recordDate ? formatDate(rec.checkInTime) : "-"}"`,
          `"${recordDate ? getDayName(rec.checkInTime) : "-"}"`,
          `"${rec.checkInTime ? new Date(rec.checkInTime).toLocaleString() : "-"}"`,
          `"${rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : "-"}"`,
          formattedHours,
          formattedBreak,
          rec.distance?.toFixed(2) || "0.00",
          rec.onsite ? "Yes" : "No",
          `"${rec.reason || "Not specified"}"`,
          rec.status
        ].join(",");
      }),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_records_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimeWithStatus = (checkInTime, checkOutTime) => {
    const checkIn = checkInTime ? new Date(checkInTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;

    const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;

    if (checkIn && !checkOut) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full bg-emerald-400 rounded-full opacity-75 animate-ping"></span>
              <span className="relative inline-flex w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </span>
            {checkIn}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">Active In</span>
        </div>
      );
    } else if (checkIn && checkOut) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
          <span className="text-[11px] font-semibold text-slate-700 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">{checkIn}</span>
          <span className="text-slate-400 text-[10px]">to</span>
          <span className="text-[11px] font-semibold text-indigo-700 px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100">{checkOut}</span>
        </div>
      );
    } else {
      return <span className="text-slate-400 font-medium">-</span>;
    }
  };

  // ✅ Image Popup Handlers - WITH DATE & TIME
  const openImagePopup = (imagePath, imageType, employeeName, employeeId, date, checkInTime, checkOutTime) => {
    console.log("🔍 Opening image popup with path:", imagePath);
    console.log("🔍 BASE_URL (without /api):", BASE_URL);
    
    if (!imagePath) {
      console.log("❌ No image path provided");
      return;
    }
    
    const fullImageUrl = getImageUrl(imagePath);
    console.log("✅ Full image URL:", fullImageUrl);
    
    setImagePopup({
      isOpen: true,
      imageUrl: fullImageUrl,
      imageType: imageType,
      employeeName: employeeName,
      employeeId: employeeId,
      date: date,
      rawImagePath: imagePath,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime
    });
  };

  const closeImagePopup = () => {
    setImagePopup({
      isOpen: false,
      imageUrl: null,
      imageType: null,
      employeeName: null,
      employeeId: null,
      date: null,
      rawImagePath: null,
      checkInTime: null,
      checkOutTime: null
    });
  };

  const handleCardClick = (filterType) => {
    const tableSection = document.querySelector('.emp-dash__card:last-child');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        <div className="emp-dash__header">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Attendance <span>List</span>
            </h1>
          </div>
          <div className="emp-dash__date-pill">
            <FaCalendarAlt />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('total')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{records.length}</div>
            <div className="emp-dash__stat-meta">in selected period</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('onsite')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Onsite Entries</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiMapPin />
              </div>
            </div>
            <div className="emp-dash__stat-value">{records.filter((r) => r.onsite).length}</div>
            <div className="emp-dash__stat-meta">office check-ins</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('active')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Checked In</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value">{records.filter((r) => r.status === "checked-in").length}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div 
            className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('filtered')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>

          <div 
            className="emp-dash__stat col-span-2 lg:col-span-1 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCardClick('break')}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Break Time</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCoffee />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
              {formatBreakMinutes(
                records.reduce(
                  (sum, r) => sum + (r.totalBreakMinutes || calculateTotalBreakMinutes(r.breaks)),
                  0
                )
              )}
            </div>
            <div className="emp-dash__stat-meta">accumulated</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          <div className="hidden lg:block">
            <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search */}
                <div className="relative min-w-[140px] flex-1 max-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
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

                {/* Date From */}
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="From"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Date To */}
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="To"
                    className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Month Picker */}
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
                  onClick={downloadCSV}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md whitespace-nowrap"
                >
                  <FiDownload className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
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
                <strong>{filteredRecords.length}</strong> records
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
                      onChange={handleSearchChange}
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
                      onChange={handleFromDateChange}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={handleToDateChange}
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
                    onChange={handleMonthChange}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
                  />
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadCSV}
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

        {/* Attendance Records Section */}
        <div className="emp-dash__card">
          {filteredRecords.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">📭</div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No attendance records found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">There are no records matching the selected search query or filters.</p>
              {(searchTerm || filterDepartment || filterDesignation || fromDate || toDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-55 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th style={{ textAlign: "center" }}>Date</th>
                      <th style={{ textAlign: "center" }}>Day</th>
                      <th style={{ textAlign: "center" }}>Check-In / Out</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Break</th>
                      <th style={{ textAlign: "center" }}>Distance</th>
                      <th style={{ textAlign: "center" }}>Onsite</th>
                      <th style={{ textAlign: "center" }}>Attendance Images</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((rec, idx) => {
                      const empDetails = getEmployeeDetails(rec.employeeId);
                      const recordDate = rec.checkInTime ? new Date(rec.checkInTime) : null;
                      const breakMinutes = rec.totalBreakMinutes || calculateTotalBreakMinutes(rec.breaks);
                      
                      let hoursBadgeClass = 'text-red-700 bg-red-50 border-red-100';
                      if (rec.totalHours >= 8) hoursBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                      else if (rec.totalHours >= 4) hoursBadgeClass = 'text-amber-700 bg-amber-50 border-amber-100';
                      
                      // Check if images exist
                      const hasCheckInImage = rec.checkInImage && rec.checkInImage !== null && rec.checkInImage !== "";
                      const hasCheckOutImage = rec.checkOutImage && rec.checkOutImage !== null && rec.checkOutImage !== "";
                      const hasAnyImage = hasCheckInImage || hasCheckOutImage;
                      
                      return (
                        <tr
                          key={rec._id}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          <td className="px-3 py-3 font-semibold text-center text-slate-800 whitespace-nowrap text-[11px]">
                            {rec.employeeId}
                          </td>

                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center gap-2">
                              {empDetails.profilePicture ? (
                                <img 
                                  src={empDetails.profilePicture} 
                                  alt={empDetails.name} 
                                  className="w-7 h-7 rounded-full border border-slate-100 object-cover shadow-sm"
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                              ) : null}
                              <div 
                                style={{ display: empDetails.profilePicture ? 'none' : 'flex' }}
                                className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner"
                              >
                                {empDetails.name ? empDetails.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                                {empDetails.name}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3 text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
                            {empDetails.department}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">
                            {empDetails.designation}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-600 text-[11px] font-bold whitespace-nowrap">
                            {recordDate ? formatDate(rec.checkInTime) : "-"}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-500 text-[11px] font-medium whitespace-nowrap">
                            {recordDate ? getDayName(rec.checkInTime) : "-"}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {formatTimeWithStatus(rec.checkInTime, rec.checkOutTime)}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${hoursBadgeClass}`}>
                              {formatDecimalHours(rec.totalHours)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {breakMinutes > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                <FiCoffee className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-amber-600">
                                  {formatBreakMinutes(breakMinutes)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-50 rounded border border-slate-100">
                              {rec.distance?.toFixed(0) || "0"}m
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                rec.onsite
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                              }`}
                            >
                              {rec.onsite ? "🏢 WFO" : "🏠 WFH"}
                            </span>
                          </td>
                          {/* ✅ Attendance Images Column */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {hasAnyImage ? (
                              <div className="flex items-center justify-center gap-1.5">
                                {hasCheckInImage && (
                                  <button
                                    onClick={() => openImagePopup(
                                      rec.checkInImage,
                                      'Check-In',
                                      empDetails.name,
                                      rec.employeeId,
                                      recordDate,
                                      rec.checkInTime,
                                      rec.checkOutTime
                                    )}
                                    className="relative group flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
                                    title="View Check-In Image"
                                  >
                                    <FiImage className="w-4 h-4 text-emerald-600" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                                  </button>
                                )}
                                {hasCheckOutImage && (
                                  <button
                                    onClick={() => openImagePopup(
                                      rec.checkOutImage,
                                      'Check-Out',
                                      empDetails.name,
                                      rec.employeeId,
                                      recordDate,
                                      rec.checkInTime,
                                      rec.checkOutTime
                                    )}
                                    className="relative group flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
                                    title="View Check-Out Image"
                                  >
                                    <FiImage className="w-4 h-4 text-indigo-600" />
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white"></span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-medium">-</span>
                            )}
                          </td>
                          <td className="text-right whitespace-nowrap">
                            <span
                              className={`emp-dash__table-status ${
                                rec.status === "checked-in"
                                  ? "emp-dash__table-status--present"
                                  : "emp-dash__table-status--other"
                              }`}
                            >
                              {rec.status === "checked-in" ? "Active" : "Logged Out"}
                            </span>
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
                    Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRecords.length)}</strong> of{" "}
                    <strong className="text-gray-800">{filteredRecords.length}</strong> records
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

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                      disabled={page === "..."}
                      className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                        page === "..."
                          ? "text-gray-400 bg-transparent border-transparent cursor-default"
                          : currentPage === page
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

      {/* ✅ IMAGE POPUP MODAL - WITH X ICON TOP RIGHT */}
      {imagePopup.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4"
          onClick={closeImagePopup}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✅ X Icon - Top Right Corner */}
            <button
              onClick={closeImagePopup}
              className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:rotate-90 border border-gray-200/50"
              aria-label="Close"
            >
              <FaTimes className="text-gray-700 hover:text-red-500 transition-colors text-xl font-bold" />
            </button>

            {/* Popup Content */}
            <div className="flex flex-col">
              {/* Popup Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 pr-16">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📸</span>
                    {imagePopup.imageType} Photo
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {imagePopup.employeeName} ({imagePopup.employeeId})
                  </p>
                  {/* ✅ Show Date and Time */}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[11px] text-gray-600 flex items-center gap-1">
                      <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                      {imagePopup.date ? formatDate(imagePopup.date) : '-'}
                    </p>
                    <p className="text-[11px] text-gray-600 flex items-center gap-1">
                      <FaClock className="text-indigo-400 text-[10px]" />
                      {imagePopup.checkInTime ? new Date(imagePopup.checkInTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : '-'}
                    </p>
                  </div>
                 
                 
                </div>
              </div>

              {/* Image Container */}
              <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px] max-h-[70vh]">
                {imagePopup.imageUrl ? (
                  <img
                    src={imagePopup.imageUrl}
                    alt={`${imagePopup.imageType} Photo`}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error("❌ Image load error for URL:", imagePopup.imageUrl);
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log("✅ Image loaded successfully:", imagePopup.imageUrl);
                    }}
                  />
                ) : null}
                {/* Fallback div when image fails */}
                <div 
                  className="text-center text-gray-400 flex flex-col items-center justify-center"
                  style={{ display: imagePopup.imageUrl ? 'none' : 'flex' }}
                >
                  <FiImage className="w-16 h-16 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No image available</p>
                  {imagePopup.rawImagePath && (
                    <p className="text-xs text-gray-300 mt-1 truncate max-w-[200px]">
                      {imagePopup.rawImagePath}
                    </p>
                  )}
                </div>
              </div>

              {/* Popup Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50/50 text-center">
                <p className="text-[10px] text-gray-400 font-medium">
                  {imagePopup.imageType} photo captured during attendance marking
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}