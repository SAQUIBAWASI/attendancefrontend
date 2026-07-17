import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { FaBuilding, FaUserTag, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { FiCalendar, FiCheckCircle, FiClock, FiDownload, FiFilter, FiList, FiTrash2,  FiChevronUp,FiChevronDown, } from "react-icons/fi";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const ApprovedLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Employees data for department/designation
  const [employees, setEmployees] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  // HARDCODED FOR THIS PAGE
  const statusFilter = "approved";
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Department and Designation filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showDesignationFilter, setShowDesignationFilter] = useState(false);

  // Unique departments and designations
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueDesignations, setUniqueDesignations] = useState([]);

  // Leave Balances state
  const [showBalancePopup, setShowBalancePopup] = useState(false);
  const [selectedEmpBalance, setSelectedEmpBalance] = useState(null);

  // Refs for click outside
  const departmentFilterRef = useRef(null);
  const designationFilterRef = useRef(null);
  const balancePopupRef = useRef(null);

  // Click outside handlers for filter dropdowns & modal popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentFilterRef.current && !departmentFilterRef.current.contains(event.target)) {
        setShowDepartmentFilter(false);
      }
      if (designationFilterRef.current && !designationFilterRef.current.contains(event.target)) {
        setShowDesignationFilter(false);
      }
      if (balancePopupRef.current && !balancePopupRef.current.contains(event.target)) {
        setShowBalancePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all leaves and employees
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/leaves/leaves`),
        axios.get(`${API_BASE_URL}/employees/get-employees`)
      ]);

      const employeesData = empRes.data || [];
      const activeEmployees = employeesData.filter(emp => !isEmployeeHidden(emp));
      setEmployees(activeEmployees);

      // Extract unique departments and designations
      const depts = new Set();
      const designations = new Set();
      activeEmployees.forEach(emp => {
        if (emp.department) depts.add(emp.department);
        if (emp.role || emp.designation) designations.add(emp.role || emp.designation);
      });
      setUniqueDepartments(Array.from(depts).sort());
      setUniqueDesignations(Array.from(designations).sort());

      const leavesData = leavesRes.data.records || leavesRes.data || [];
      const sorted = leavesData.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      );

      // Filter out leaves from hidden employees
      const activeEmployeeIds = new Set(activeEmployees.map(emp => emp.employeeId || emp._id));
      const filteredLeavesData = sorted.filter(leave =>
        activeEmployeeIds.has(leave.employeeId)
      );

      setLeaves(filteredLeavesData);
      setFilteredLeaves(filteredLeavesData);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Get employee department and designation
  const getEmployeeDetails = useCallback((employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A"
    };
  }, [employees]);

  // View Leave Balances
  const viewEmployeeBalances = async (employeeId, employeeName) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/leaves/balances/${employeeId}`);
      if (resp.data?.success) {
        setSelectedEmpBalance({ employeeId, employeeName, balances: resp.data.balances });
        setShowBalancePopup(true);
      }
    } catch (err) {
      alert("Failed to fetch balances");
    }
  };

  // Apply Filters
  useEffect(() => {
    let filtered = [...leaves];

    // HARDCODED FILTER FOR APPROVED ONLY
    filtered = filtered.filter((l) => l.status === statusFilter);

    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((l) => l.leaveType === leaveTypeFilter);
    }

    if (startDateFilter) {
      const start = new Date(startDateFilter);
      filtered = filtered.filter((l) => new Date(l.startDate) >= start);
    }

    if (endDateFilter) {
      const end = new Date(endDateFilter);
      filtered = filtered.filter((l) => new Date(l.endDate) <= end);
    }

    if (filterDepartment) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    if (filterDesignation) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.designation === filterDesignation;
      });
    }

    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(l => {
        const d = new Date(l.startDate);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    startDateFilter,
    endDateFilter,
    filterDepartment,
    filterDesignation,
    selectedMonth,
    leaves,
    getEmployeeDetails,
  ]);

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setFilterDepartment("");
    setFilterDesignation("");
    setSelectedMonth("");
  };

  // Download Excel
  const downloadExcel = () => {
    const rows = filteredLeaves.map((l) => {
      const empDetails = getEmployeeDetails(l.employeeId);
      return {
        "Employee ID": l.employeeId || "N/A",
        Name: l.employeeName || "N/A",
        Department: empDetails.department,
        Designation: empDetails.designation,
        "Leave Type": l.leaveType || "N/A",
        "Start Date": l.startDate ? new Date(l.startDate).toLocaleDateString() : "N/A",
        "End Date": l.endDate ? new Date(l.endDate).toLocaleDateString() : "N/A",
        Days: l.days || 0,
        Reason: l.reason || "",
        Status: l.status || "approved",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approved Leaves");
    XLSX.writeFile(wb, `Approved_Leaves_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Pagination Handlers
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  // Loading Screen
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">
            Loading approved requests...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4 lg:p-6">
        
        {/* Dashboard Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
           <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Approved <span className="text-blue-600">Leaves</span>
            </h1>
          {/* <p className="emp-dash__subtitle text-xs sm:text-sm text-gray-500 font-medium">
              Review and inspect approved employee leave applications
            </p> */}
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
            <FiCalendar className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Top KPI Stats Grid - 2 per row on mobile */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Approved</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
                <FiCheckCircle className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              <CountUp end={leaves.filter((l) => l.status === "approved").length} duration={1} />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-gray-500">approved leaves</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Results</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <FiList className="text-sm sm:text-base" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              <CountUp end={filteredLeaves.length} duration={1} />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs text-gray-500">matching filters</div>
          </div>
        </div>

        {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
  {/* Desktop View */}
  <div className="hidden sm:block">
    <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200">
      {/* Left - Filters */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Search */}
        <div className="relative min-w-[120px] flex-1 max-w-[160px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Leave Type Filter - Compact */}
        <div className="relative">
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="sick">Sick</option>
            <option value="casual">Casual</option>
            <option value="earned">Earned</option>
            <option value="other">Other</option>
          </select>
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
            <span className="truncate max-w-[80px]">{filterDepartment || "Dept"}</span>
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
            <span className="truncate max-w-[80px]">{filterDesignation || "Desig"}</span>
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
            value={startDateFilter}
            onChange={(e) => { setStartDateFilter(e.target.value); setSelectedMonth(""); }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            placeholder="From"
            className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Date To - Compact */}
        <div className="relative">
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => { setEndDateFilter(e.target.value); setSelectedMonth(""); }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            placeholder="To"
            className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Month Picker - Compact */}
        <div className="relative">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setStartDateFilter(""); setEndDateFilter(""); }}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold"
          />
        </div>
      </div>

      {/* Right - Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={downloadExcel}
          disabled={filteredLeaves.length === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-3 h-3" />
          <span>XL ({filteredLeaves.length})</span>
        </button>
        
        {(searchTerm || filterDepartment || filterDesignation || leaveTypeFilter !== "all" || startDateFilter || endDateFilter || selectedMonth) && (
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
        {showMobileFilters ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
      </button>
      <span className="text-xs text-gray-500">
        <strong>{filteredLeaves.length}</strong> requests
      </span>
    </div>

    {showMobileFilters && (
      <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Employee</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Leave Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="other">Other</option>
          </select>
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
              filterDepartment ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
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
              <div onClick={() => { setFilterDepartment(""); setShowDepartmentFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Departments</div>
              {uniqueDepartments.map((dept) => (
                <div key={dept} onClick={() => { setFilterDepartment(dept); setShowDepartmentFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{dept}</div>
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
              filterDesignation ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50" : "border-gray-300 text-gray-700"
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
              <div onClick={() => { setFilterDesignation(""); setShowDesignationFilter(false); }} className="px-3 py-2.5 text-sm font-medium text-gray-500 border-b border-gray-100 cursor-pointer hover:bg-blue-50">All Designations</div>
              {uniqueDesignations.map((des) => (
                <div key={des} onClick={() => { setFilterDesignation(des); setShowDesignationFilter(false); }} className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 ${filterDesignation === des ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>{des}</div>
              ))}
            </div>
          )}
        </div>

        {/* Date From & To */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" value={startDateFilter} onChange={(e) => { setStartDateFilter(e.target.value); setSelectedMonth(""); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" value={endDateFilter} onChange={(e) => { setEndDateFilter(e.target.value); setSelectedMonth(""); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setStartDateFilter(""); setEndDateFilter(""); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold" />
        </div>

        {/* Mobile Action Buttons */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={downloadExcel} disabled={filteredLeaves.length === 0} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <FiDownload className="w-4 h-4" /> XL ({filteredLeaves.length})
            </button>
            {(searchTerm || filterDepartment || filterDesignation || leaveTypeFilter !== "all" || startDateFilter || endDateFilter || selectedMonth) && (
              <button onClick={clearFilters} className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                <FiTrash2 className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Leave Balances Modal Popup */}
        {showBalancePopup && selectedEmpBalance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div ref={balancePopupRef} className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-gray-200">
              <h2 className="mb-4 text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiList className="text-blue-600" /> Leave Balances
              </h2>
              
              <div className="p-3 mb-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <p className="font-semibold text-blue-900">{selectedEmpBalance.employeeName}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{selectedEmpBalance.employeeId}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Casual Leave (CL)</span>
                  <span className="text-gray-900 font-medium">{selectedEmpBalance.balances.CL.available} Left / {selectedEmpBalance.balances.CL.used} Used</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Sick Leave (SL)</span>
                  <span className="text-gray-900 font-medium">{selectedEmpBalance.balances.SL.available} Left / {selectedEmpBalance.balances.SL.used} Used</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                  <span className="font-semibold text-gray-700">Earned Leave (EL)</span>
                  <span className="text-gray-900 font-medium">{selectedEmpBalance.balances.EL.available} Left / {selectedEmpBalance.balances.EL.used} Used</span>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button 
                  onClick={() => setShowBalancePopup(false)} 
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Requests Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiList className="text-blue-600" /> Approved Requests
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Approved employee leave applications</p>
            </div>
          </div> */}

          {filteredLeaves.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 font-medium">
              No approved leave records found matching current filter values.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Employee ID</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Name</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Department</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Designation</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Dates</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Days</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-left">Reason</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Status</th>
                      <th style={{ color: 'black' }} className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {currentItems.map((l) => {
                      const empDetails = getEmployeeDetails(l.employeeId);
                      return (
                        <tr 
                          key={l._id} 
                          className="hover:bg-gray-50 transition-all"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{l.employeeId || "N/A"}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{l.employeeName}</td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={empDetails.department}>{empDetails.department}</td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]" title={empDetails.designation}>{empDetails.designation}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-gray-700 font-medium">{new Date(l.startDate).toLocaleDateString()}</div>
                            <div className="text-gray-400 text-xs">to</div>
                            <div className="text-gray-700 font-medium">{new Date(l.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {l.days || 1} {l.days === 1 ? 'day' : 'days'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]" title={l.reason}>{l.reason || "No reason provided"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                              Approved
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => viewEmployeeBalances(l.employeeId, l.employeeName)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all shadow-sm"
                              title="View Balances"
                            >
                              <FiClock className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {currentItems.map((l) => {
                  const empDetails = getEmployeeDetails(l.employeeId);
                  return (
                    <div key={l._id} className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{l.employeeName}</h4>
                          <span className="text-xs text-gray-500">{l.employeeId || "N/A"} • {empDetails.department}</span>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full border border-green-200">
                          Approved
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3 text-gray-600">
                        <div><span className="text-gray-400">Designation:</span> {empDetails.designation}</div>
                        <div><span className="text-gray-400">Days:</span> {l.days || 1}</div>
                        <div className="col-span-2"><span className="text-gray-400">Dates:</span> {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}</div>
                        <div className="col-span-2"><span className="text-gray-400">Reason:</span> {l.reason || "No reason provided"}</div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => viewEmployeeBalances(l.employeeId, l.employeeName)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-all"
                        >
                          Balances
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination Section */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 text-xs">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-1.5 text-xs border rounded-lg bg-white text-gray-900"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs text-gray-500 font-medium">entries</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-gray-300"
                }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                  disabled={page === "..."}
                  className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all ${
                    page === "..."
                      ? "text-gray-400 bg-white cursor-default border-transparent"
                      : currentPage === page
                        ? "text-white bg-blue-600 border-blue-600 shadow-sm"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedLeaves;