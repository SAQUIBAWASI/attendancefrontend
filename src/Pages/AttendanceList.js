import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaSearch, FaUserTag, FaChevronUp, FaChevronDown, FaTimes, FaClock } from "react-icons/fa";
import { FiCoffee, FiFilter, FiMapPin, FiUserCheck, FiUsers, FiDownload, FiTrash2, FiImage } from "react-icons/fi";
import { API_BASE_URL } from "../config";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// ✅ Remove /api from BASE_URL for static files
const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

// ✅ Helper: format break minutes
const formatBreakMinutes = (minutes) => {
  if (!minutes || minutes === 0) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

// ✅ Helper: get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
};

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({}); // ✅ O(1) lookup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [searchTerm, setSearchTerm] = useState("");

  // Department/Designation filters
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('attendanceList_itemsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Image popup
  const [imagePopup, setImagePopup] = useState({
    isOpen: false,
    imageUrl: null,
    imageType: null,
    employeeName: null,
    employeeId: null,
    date: null,
    rawImagePath: null,
    checkInTime: null,
    checkOutTime: null,
    viewingImageType: null,
  });

  // ✅ Format decimal hours
  const formatDecimalHours = (decimalHours) => {
    if (!decimalHours && decimalHours !== 0) return "0h 0m";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) return `${hours + 1}h 0m`;
    return `${hours}h ${minutes}m`;
  };

  // Click outside handlers
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

  // ✅ SINGLE API call — everything in one go
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (fromDate && toDate) {
        params.append("fromDate", fromDate);
        params.append("toDate", toDate);
      }

      const res = await fetch(`${API_BASE_URL}/attendance/page-data?${params}`);
      if (!res.ok) throw new Error("Failed to fetch attendance data");
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed");

      // ✅ Build employee map for O(1) lookup
      const empMap = {};
      (data.employees || []).forEach((emp) => {
        empMap[emp.employeeId] = emp;
      });

      setEmployees(data.employees || []);
      setEmployeeMap(empMap);
      setRecords(data.records || []);
      setFilteredRecords(data.records || []);
      setUniqueDepartments(data.meta?.departments || []);
      setUniqueDesignations(data.meta?.designations || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ Re-fetch when filters change
  const refetchWithFilters = async (month, from, to) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (from && to) {
        params.append("fromDate", from);
        params.append("toDate", to);
      }
      const res = await fetch(`${API_BASE_URL}/attendance/page-data?${params}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setFilteredRecords(data.records || []);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Refetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setFromDate("");
    setToDate("");
    refetchWithFilters(month, "", "");
  };

  const handleFromDateChange = (e) => {
    const from = e.target.value;
    setFromDate(from);
    if (from) setSelectedMonth("");
    refetchWithFilters(from ? "" : selectedMonth, from, toDate);
  };

  const handleToDateChange = (e) => {
    const to = e.target.value;
    setToDate(to);
    if (to) setSelectedMonth("");
    refetchWithFilters(to ? "" : selectedMonth, fromDate, to);
  };

  const getDayName = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ✅ O(1) lookup from map — no more find() per row!
  const getEmployeeDetails = (employeeId) => {
    if (!employeeId) return { name: "Unknown", department: "N/A", designation: "N/A", profilePicture: null };
    return employeeMap[employeeId] || { name: "Unknown", department: "N/A", designation: "N/A", profilePicture: null };
  };

  // Apply search + dept + designation filters (client-side, fast)
  const applyFilters = () => {
    let filtered = [...records];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((rec) => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        const name = empDetails.name.toLowerCase();
        const id = (rec.employeeId || "").toString().toLowerCase();
        return name.includes(term) || id.includes(term);
      });
    }

    if (filterDepartment) {
      filtered = filtered.filter((rec) => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    if (filterDesignation) {
      filtered = filtered.filter((rec) => {
        const empDetails = getEmployeeDetails(rec.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
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
    const defaultMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(defaultMonth);
    refetchWithFilters(defaultMonth, "", "");
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

  const handlePageClick = (page) => setCurrentPage(page);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // ✅ CSV download
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
        const breakMinutes = rec.totalBreakMinutes || 0;
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
      hour: '2-digit', minute: '2-digit', hour12: true
    }) : null;

    const checkOut = checkOutTime ? new Date(checkOutTime).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
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

  const openImagePopup = (imagePath, imageType, employeeName, employeeId, date, checkInTime, checkOutTime, viewingImageType) => {
    if (!imagePath) return;
    const fullImageUrl = getImageUrl(imagePath);
    setImagePopup({
      isOpen: true,
      imageUrl: fullImageUrl,
      imageType,
      employeeName,
      employeeId,
      date,
      rawImagePath: imagePath,
      checkInTime,
      checkOutTime,
      viewingImageType,
    });
  };

  const closeImagePopup = () => {
    setImagePopup({
      isOpen: false, imageUrl: null, imageType: null, employeeName: null,
      employeeId: null, date: null, rawImagePath: null,
      checkInTime: null, checkOutTime: null, viewingImageType: null,
    });
  };

  const handleCardClick = () => {
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

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Attendance <span>List</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Department Filter */}
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
                    onClick={() => { setFilterDepartment(""); setShowDepartmentFilter(false); }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Departments
                  </div>
                  {uniqueDepartments.map((dept) => (
                    <div
                      key={dept}
                      onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }}
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

            {/* Designation Filter */}
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
                    onClick={() => { setFilterDesignation(""); setShowDesignationFilter(false); }}
                    className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
                  >
                    All Designations
                  </div>
                  {uniqueDesignations.map((des) => (
                    <div
                      key={des}
                      onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }}
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
                onChange={handleFromDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
              />
            </div>

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

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <h1 className="text-base font-bold whitespace-nowrap">
            Attendance <span className="text-indigo-600">List</span>
          </h1>
          <div className="emp-dash__date-pill text-[10px] px-2 py-1">
            <FaCalendarAlt className="text-[10px]" />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden mb-3">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <FiFilter className="text-blue-600 text-base" />
              <span>Filters &amp; Actions</span>
              {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
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

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleCardClick}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div>
            </div>
            <div className="emp-dash__stat-value">{records.length}</div>
            <div className="emp-dash__stat-meta">in selected period</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleCardClick}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Onsite Entries</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiMapPin /></div>
            </div>
            <div className="emp-dash__stat-value">{records.filter((r) => r.onsite).length}</div>
            <div className="emp-dash__stat-meta">office check-ins</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleCardClick}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Checked In</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiUserCheck /></div>
            </div>
            <div className="emp-dash__stat-value">{records.filter((r) => r.status === "checked-in").length}</div>
            <div className="emp-dash__stat-meta">currently active</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleCardClick}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiFilter /></div>
            </div>
            <div className="emp-dash__stat-value">{filteredRecords.length}</div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1 cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleCardClick}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Break Time</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiCoffee /></div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
              {formatBreakMinutes(
                records.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0)
              )}
            </div>
            <div className="emp-dash__stat-meta">accumulated</div>
          </div>
        </div>

        {/* Attendance Records */}
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
                    {currentRecords.map((rec) => {
                      const empDetails = getEmployeeDetails(rec.employeeId);
                      const recordDate = rec.checkInTime ? new Date(rec.checkInTime) : null;
                      const breakMinutes = rec.totalBreakMinutes || 0;

                      let hoursBadgeClass = 'text-red-700 bg-red-50 border-red-100';
                      if (rec.totalHours >= 8) hoursBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                      else if (rec.totalHours >= 4) hoursBadgeClass = 'text-amber-700 bg-amber-50 border-amber-100';

                      const hasCheckInImage = rec.checkInImage && rec.checkInImage !== null && rec.checkInImage !== "";
                      const hasCheckOutImage = rec.checkOutImage && rec.checkOutImage !== null && rec.checkOutImage !== "";
                      const hasAnyImage = hasCheckInImage || hasCheckOutImage;

                      return (
                        <tr key={rec._id} className="transition-colors hover:bg-slate-50/50">
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
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {hasAnyImage ? (
                              <div className="flex items-center justify-center gap-1.5">
                                {hasCheckInImage && (
                                  <button
                                    onClick={() => openImagePopup(
                                      rec.checkInImage, 'Check-In', empDetails.name,
                                      rec.employeeId, recordDate, rec.checkInTime, rec.checkOutTime, 'checkin'
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
                                      rec.checkOutImage, 'Check-Out', empDetails.name,
                                      rec.employeeId, recordDate, rec.checkInTime, rec.checkOutTime, 'checkout'
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

              {/* Pagination */}
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

      {/* Image Popup */}
      {imagePopup.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4"
          onClick={closeImagePopup}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImagePopup}
              className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-red-50 hover:text-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:rotate-90 border border-gray-200/50"
              aria-label="Close"
            >
              <FaTimes className="text-gray-700 hover:text-red-500 transition-colors text-xl font-bold" />
            </button>

            <div className="flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 pr-16">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📸</span>
                    {imagePopup.imageType} Photo
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {imagePopup.employeeName} ({imagePopup.employeeId})
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-[11px] text-gray-600 flex items-center gap-1">
                      <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                      {imagePopup.date ? formatDate(imagePopup.date) : '-'}
                    </p>

                    {imagePopup.viewingImageType === 'checkin' ? (
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <FaClock className="text-emerald-500 text-[10px]" />
                        Check-In: {imagePopup.checkInTime ? new Date(imagePopup.checkInTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        }) : '-'}
                      </p>
                    ) : imagePopup.viewingImageType === 'checkout' ? (
                      <p className="text-[11px] text-indigo-600 flex items-center gap-1 font-semibold">
                        <FaClock className="text-indigo-500 text-[10px]" />
                        Check-Out: {imagePopup.checkOutTime ? new Date(imagePopup.checkOutTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit', hour12: true
                        }) : '-'}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px] max-h-[70vh]">
                {imagePopup.imageUrl ? (
                  <img
                    src={imagePopup.imageUrl}
                    alt={`${imagePopup.imageType} Photo`}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="text-center text-gray-400 flex flex-col items-center justify-center"
                  style={{ display: imagePopup.imageUrl ? 'none' : 'flex' }}
                >
                  <FiImage className="w-16 h-16 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50/50 text-center">
                <p className="text-[10px] text-gray-400 font-medium">
                  {imagePopup.imageType} photo captured during attendance marking
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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