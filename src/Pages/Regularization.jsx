import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaSearch, FaUserTag, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiCalendar, FiCheckCircle, FiClock, FiFilter, FiUsers, FiXCircle, FiTrash2,
  FiChevronUp,
  FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const Regularization = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [employees, setEmployees] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState("");
  
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);

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

  const groupRecordsByEmployee = (records) => {
    const grouped = new Map();
    
    records.forEach(rec => {
      if (!grouped.has(rec.employeeId)) {
        grouped.set(rec.employeeId, {
          employeeId: rec.employeeId,
          records: []
        });
      }
      grouped.get(rec.employeeId).records.push(rec);
    });
    
    return Array.from(grouped.values());
  };

  const fetchEditedRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const recordsUrl = selectedDate 
        ? `${API_BASE_URL}/attendancesummary/edited-records?date=${selectedDate}`
        : `${API_BASE_URL}/attendancesummary/edited-records?month=${selectedMonth}`;

      const [recordsRes, empRes] = await Promise.all([
        axios.get(recordsUrl),
        axios.get(`${API_BASE_URL}/employees/get-employees`)
      ]);

      const employeesData = empRes.data || [];
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

      const editedRecords = recordsRes.data.data || [];
      
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId));
      const filteredRecords = editedRecords.filter(rec => activeEmployeeIds.has(rec.employeeId));

      const grouped = groupRecordsByEmployee(filteredRecords);
      
      setRequests(grouped);
      setFilteredRequests(grouped);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch edited records:", err);
      setError("Couldn't load regularization records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditedRecords();
  }, [selectedMonth, selectedDate]);

  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId);
    return {
      name: emp?.name || "N/A",
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A",
      profilePicture: emp?.profilePicture || null
    };
  };

  useEffect(() => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter((group) => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return (
          empDetails.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (filterDepartment) {
      filtered = filtered.filter((group) => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    if (filterDesignation) {
      filtered = filtered.filter((group) => {
        const empDetails = getEmployeeDetails(group.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterDesignation, requests]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterDesignation("");
    setSelectedDate("");
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
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
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleViewDetails = (group) => {
    const empDetails = getEmployeeDetails(group.employeeId);
    setSelectedEmployeeData({
      ...empDetails,
      employeeId: group.employeeId,
      records: group.records.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
    });
    setShowDetailsModal(true);
  };

  if (loading && requests.length === 0)
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading regularization records...</p>
        </div>
      </div>
    );

  const getPeriodLabel = () => {
    try {
      if (selectedDate) {
        return new Date(selectedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }
      return new Date(`${selectedMonth}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
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
              Regularization <span>Requests</span>
            </h1>
          {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Review edited attendance records and drill down employee-wise changes.
            </p> */}
          </div>
          <div className="emp-dash__date-pill">
            <FiCalendar />
            <span>{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Top KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Employees Edited</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{requests.length}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">unique profiles</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Total Edits</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{requests.reduce((acc, curr) => acc + curr.records.length, 0)}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">accumulated changes</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Active Filters</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-lg sm:text-xl lg:text-2xl">{(searchTerm || filterDepartment || filterDesignation) ? "Active" : "None"}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">applied filters</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label text-[10px] sm:text-xs">Selected Period</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg lg:text-xl font-bold truncate">{getPeriodLabel()}</div>
            <div className="emp-dash__stat-meta text-[10px] sm:text-xs">active window</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
  {/* Desktop View */}
  <div className="hidden sm:block">
    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
      {/* Left - Filters */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Month Picker - Compact */}
        <div className="relative">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDate("");
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-[130px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
          />
        </div>

        {/* Date Picker - Compact */}
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

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
      </div>

      {/* Right - Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {(searchTerm || filterDepartment || filterDesignation || selectedDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
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
    {/* Mobile Header with Toggle */}
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
      >
        <FiFilter className="text-blue-600 text-base" />
        <span>Filters</span>
        {showMobileFilters ? (
          <FiChevronUp className="text-gray-400" />
        ) : (
          <FiChevronDown className="text-gray-400" />
        )}
      </button>
      <span className="text-xs text-gray-500">
        <strong>{filteredRequests.length}</strong> records
      </span>
    </div>

    {/* Mobile Filters */}
    {showMobileFilters && (
      <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
        {/* Month */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDate("");
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
          />
        </div>

        {/* Specific Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Specific Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
            }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

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

        {/* Mobile Action Buttons */}
        <div className="pt-3 border-t border-gray-200">
          {(searchTerm || filterDepartment || filterDesignation || selectedDate || selectedMonth !== new Date().toISOString().slice(0, 7)) && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div className="emp-dash__card">
          {/* <div className="emp-dash__card-header">
            <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">Regularization <span>Requests</span></h1>
               <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">List of employee attendance records with edits and regularizations.</p>
            </div>
          </div> */}
          <div className="overflow-x-auto">
            <table className="emp-dash__table">
              <thead>
                <tr>
                  <th className="text-center">Employee ID</th>
                  <th className="text-center">Employee Name</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Designation</th>
                  <th className="text-center">Edit Count</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {currentItems.length > 0 ? (
                  currentItems.map((group) => {
                    const empDetails = getEmployeeDetails(group.employeeId);
                    return (
                      <tr key={group.employeeId} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-3 py-3 font-semibold text-center text-slate-800 whitespace-nowrap text-[11px]">{group.employeeId || "N/A"}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {empDetails.profilePicture ? (
                              <img src={empDetails.profilePicture} className="w-7 h-7 rounded-full border border-slate-100 object-cover shadow-sm" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                            ) : null}
                            <div style={{ display: empDetails.profilePicture ? 'none' : 'flex' }} className="items-center justify-center w-7 h-7 text-[10px] font-bold bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full shadow-inner">{empDetails.name.charAt(0)}</div>
                            <div className="font-semibold text-slate-800 text-xs whitespace-nowrap">{empDetails.name}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">{empDetails.department}</td>
                        <td className="px-3 py-3 text-center text-slate-600 text-[11px] font-medium whitespace-nowrap">{empDetails.designation}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                           <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold">{group.records.length} edits</span>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                           <button onClick={() => handleViewDetails(group)} className="px-3 py-1 text-[10px] font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm active:scale-95 transition-all">View Details</button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">{loading ? "Loading records..." : "No edited records found for this period."}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRequests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200/50 bg-gray-50/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <span>Show</span>
                  <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Showing <strong className="text-gray-800">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRequests.length)}</strong> of <strong className="text-gray-800">{filteredRequests.length}</strong> entries
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === 1 ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>Prev</button>
                {getPageNumbers().map((page, index) => (
                  <button key={index} onClick={() => typeof page === 'number' ? handlePageClick(page) : null} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${page === "..." ? "text-gray-400 bg-transparent border-transparent cursor-default" : currentPage === page ? "text-white bg-blue-600 border-blue-600 shadow-sm" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"}`}>{page}</button>
                ))}
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${currentPage === totalPages ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"}`}>Next</button>
              </div>
            </div>
          )}
        </div>

        {showDetailsModal && selectedEmployeeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col border border-slate-100">
              <div className="flex items-center justify-between px-6 py-4 text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-700">
                <div className="flex items-center gap-3">
                   <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full shadow-inner"><FaUserTag className="text-lg text-white" /></div>
                   <div>
                     <h3 className="text-sm font-bold leading-tight">{selectedEmployeeData.name} ({selectedEmployeeData.employeeId})</h3>
                     <p className="text-[10px] text-blue-100 font-medium mt-0.5">{selectedEmployeeData.department} • {selectedEmployeeData.designation}</p>
                   </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="p-1 transition-colors rounded-full hover:bg-white/10"><FiXCircle className="text-xl text-white/90" /></button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                <div className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">Times (In / Out)</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">Hours</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">Admin Comment</th>
                        <th className="px-4 py-3 text-xs font-semibold text-center text-slate-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedEmployeeData.records.map((rec) => (
                        <tr key={rec._id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 text-[11px] font-bold text-center text-slate-800 whitespace-nowrap">{new Date(rec.checkInTime).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{formatTime(rec.checkInTime)}</span>
                              <span className="text-slate-400 text-[10px]">to</span>
                              <span className="text-[10px] font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">{formatTime(rec.checkOutTime)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap"><span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 rounded border border-blue-100">{rec.totalHours?.toFixed(2) || "0.00"}h</span></td>
                          <td className="px-4 py-3 text-xs text-center text-slate-500 italic">{rec.comment || <span className="text-slate-400 font-medium">No comment</span>}</td>
                          <td className="px-4 py-3 text-center whitespace-nowrap"><span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full uppercase tracking-wider">{rec.reason || "Edited"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 bg-white border-t border-slate-150 flex justify-end">
                <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 active:scale-95 transition-all">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Regularization;