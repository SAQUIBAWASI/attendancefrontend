import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { FaBuilding, FaDownload, FaSearch, FaUserTag } from "react-icons/fa";
import { FiCalendar, FiCheckCircle, FiClock, FiList, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config";
import { isEmployeeHidden } from "../utils/employeeStatus";

const ApprovedLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ Fetch all leaves and employees
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
  const getEmployeeDetails = (employeeId) => {
    const emp = employees.find(e => e.employeeId === employeeId || e._id === employeeId);
    return {
      department: emp?.department || emp?.departmentName || "N/A",
      designation: emp?.designation || emp?.role || "N/A"
    };
  };

  // ✅ Apply Filters
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

    // Filter by Department
    if (filterDepartment) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.department === filterDepartment;
      });
    }

    // Filter by Designation
    if (filterDesignation) {
      filtered = filtered.filter(l => {
        const empDetails = getEmployeeDetails(l.employeeId);
        return empDetails.designation === filterDesignation;
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
    leaves,
  ]);

  // ✅ Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setLeaveTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setFilterDepartment("");
    setFilterDesignation("");
  };

  const navigate = useNavigate();

  // ✅ Download Excel
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

  // ✅ Pagination Handlers
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

  // ✅ Stat Box - Matching the Dashboard design
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${color} cursor-pointer hover:shadow-md transition-all duration-300 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400 text-base flex-shrink-0" />
        <div className="text-sm font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        <CountUp end={value} duration={2} separator="," />
      </div>
    </div>
  );

  // ✅ Loading Screen
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-b-2 border-green-600 rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-600">
            Loading approved requests...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen px-2 py-2 bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="mx-auto max-w-9xl">
        {/* ✅ Stats - Simplified to focus on Approved */}
        {/* <div className="grid grid-cols-1 gap-2 mb-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
             icon={FiCheckCircle}
             label="Approved Leaves"
             value={leaves.filter((l) => l.status === "approved").length}
             color="border-green-500"
          />
          <StatCard
            icon={FiList}
            label="Total Search Results"
            value={filteredLeaves.length}
            color="border-purple-500"
          />
        </div> */}


        {/* Filters Section */}
        <div className="p-3 mb-3 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-2">

            {/* Title / Back Indicator */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 mr-2">
                <FiCheckCircle className="text-xl text-green-600" />
                <h1 className="text-sm font-bold tracking-widest text-gray-800 uppercase">Approved</h1>
            </div>

            {/* ID/Name Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Leave Type Filter */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="h-8 px-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 min-w-[100px]"
            >
              <option value="all">All Types</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="other">Other</option>
            </select>

            {/* Department Filter Button */}
            <div className="relative" ref={departmentFilterRef}>
              <button
                onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDepartment
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDepartment === dept ? 'bg-blue-50 text-blue-700 font-medium' : ''
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
                className={`h-8 px-3 text-xs font-medium rounded-md transition flex items-center gap-1 ${filterDesignation
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100 cursor-pointer hover:bg-blue-50"
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
                      className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer ${filterDesignation === des ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                    >
                      {des}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* From Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                From:
              </span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-12 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* To Date */}
            <div className="relative w-[130px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 pointer-events-none">
                To:
              </span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-10 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filterDepartment || filterDesignation || leaveTypeFilter !== "all" || startDateFilter || endDateFilter) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}

            {/* Download Excel Button */}
            <button
              onClick={downloadExcel}
              disabled={filteredLeaves.length === 0}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <FaDownload className="text-xs" />
              Download XL ({filteredLeaves.length})
            </button>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="mb-6 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
            <table className="min-w-full">
              <thead className="text-sm text-left text-white bg-gradient-to-r from-green-500 to-emerald-600">
                <tr>
                  <th className="py-2 text-center ">Employee ID</th>
                  <th className="py-2 text-center ">Name</th>
                  <th className="py-2 text-center ">Department</th>
                  <th className="py-2 text-center ">Designation</th>
                  <th className="py-2 text-center ">Dates</th>
                  <th className="py-2 text-center ">Days</th>
                  <th className="py-2 text-center ">Reason</th>
                  <th className="py-2 text-center ">Status</th>
                  <th className="py-2 text-center rounded-tr-lg ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((l) => {
                    const empDetails = getEmployeeDetails(l.employeeId);
                    return (
                      <tr
                        key={l._id}
                        className="transition border-b hover:bg-green-50/30"
                      >
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {l.employeeId || "N/A"}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <div className="font-medium">{l.employeeName}</div>
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 ">
                          {empDetails.department}
                        </td>
                        <td className="px-2 py-2 text-center text-gray-600 ">
                          {empDetails.designation}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          {new Date(l.startDate).toLocaleDateString()} <br />
                          <span className="text-xs text-gray-400">to</span> <br />
                          {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <span className="px-2 py-2 text-xs text-center text-blue-700 bg-blue-100 rounded-full">
                            {l.days} {l.days === 1 ? 'day' : 'days'}
                          </span>
                        </td>
                        <td className="max-w-xs px-2 py-2 font-medium text-center text-gray-500 truncate whitespace-nowrap">
                          {l.reason}
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <span className="px-2 py-2 text-xs text-center text-green-700 bg-green-100 rounded-full">
                            ✅ Approved
                          </span>
                        </td>
                        <td className="px-2 py-2 font-medium text-center text-gray-900 whitespace-nowrap">
                          <span className="text-xs italic text-gray-400">
                             No actions
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-gray-500">
                      No approved leave records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Pagination Section */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 ">
                  Show:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="p-2 border rounded-lg"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-200"
                  }`}
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                  disabled={page === "..."}
                  className={`px-4 py-1 text-sm border rounded-lg ${page === "..."
                      ? "text-gray-500 bg-gray-50 cursor-default"
                      : currentPage === page
                        ? "text-white bg-blue-600 border-blue-600"
                        : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 text-sm border rounded-lg ${currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-blue-600 bg-white hover:bg-blue-50 border-blue-300"
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