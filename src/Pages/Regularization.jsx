import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaBuilding, FaSearch, FaUserTag } from "react-icons/fa";
import { FiCalendar, FiCheckCircle, FiClock, FiFilter, FiUsers, FiXCircle } from "react-icons/fi";
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
      <main className="p-4 sm:p-6 lg:p-8">

        <div className="emp-dash__header">
          <div>
            <h1 className="emp-dash__greeting">
              Regularization <span>Requests</span>
            </h1>
            <p className="emp-dash__subtitle">
              Review edited attendance records and drill down employee-wise changes.
            </p>
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
              <span className="emp-dash__stat-label">Employees Edited</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{requests.length}</div>
            <div className="emp-dash__stat-meta">unique profiles</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Edits</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">{requests.reduce((acc, curr) => acc + curr.records.length, 0)}</div>
            <div className="emp-dash__stat-meta">accumulated changes</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Filters</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value">{(searchTerm || filterDepartment || filterDesignation) ? "Active" : "None"}</div>
            <div className="emp-dash__stat-meta">applied filters</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Selected Period</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiCalendar />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg font-bold truncate">{getPeriodLabel()}</div>
            <div className="emp-dash__stat-meta">active window</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="emp-dash__card mb-6">
          <div className="emp-dash__card-header flex-col sm:flex-row gap-3">
            <div>
              <h3 className="emp-dash__card-title flex items-center gap-2">
                <FiFilter className="text-blue-600" /> Filters &amp; Actions
              </h3>
              <p className="emp-dash__card-desc">Search and filter regularization logs by employee, department, date, and month.</p>
            </div>
          </div>

          <div className="emp-dash__card-body bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate("");
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Specific Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full h-9 px-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Search Employee</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative" ref={departmentFilterRef}>
                <label className="text-xs font-medium text-gray-600">Department</label>
                <button
                  onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
                  className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
                    filterDepartment
                      ? "border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FaBuilding className="text-gray-400" />
                    {filterDepartment || "All Departments"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {showDepartmentFilter && (
                  <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
                          filterDepartment === dept ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 relative" ref={designationFilterRef}>
                <label className="text-xs font-medium text-gray-600">Designation</label>
                <button
                  onClick={() => setShowDesignationFilter(!showDesignationFilter)}
                  className={`w-full h-9 px-3 text-xs font-medium rounded-lg transition-all border text-left flex items-center justify-between bg-white ${
                    filterDesignation
                      ? "border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-500/10"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FaUserTag className="text-gray-400" />
                    {filterDesignation || "All Designations"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {showDesignationFilter && (
                  <div className="absolute left-0 right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                        className={`px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer transition-all ${
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

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50">
              <div className="text-xs text-gray-500 font-medium">
                Showing <strong>{filteredRequests.length}</strong> of <strong>{requests.length}</strong> records
              </div>
              <div className="flex gap-2">
                {(searchTerm ||
                  filterDepartment ||
                  filterDesignation ||
                  selectedDate ||
                  selectedMonth !== new Date().toISOString().slice(0, 7)) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="emp-dash__card">
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Regularization Requests</h3>
              <p className="emp-dash__card-desc">List of employee attendance records with edits and regularizations.</p>
            </div>
          </div>
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
