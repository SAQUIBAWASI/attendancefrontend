import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_DOMAIN } from '../config';
import { FaPlus, FaSearch, FaCalendarAlt, FaFilePdf, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { FiBriefcase, FiCheckCircle, FiHome, FiZap } from "react-icons/fi";
import StatCard from "../Components/StatCard";

function MyJobs() {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    location: '',
    salary: '',
    startDate: '',
    endDate: '',
    offerLetter: null,
    payslip: null
  });

  // Current Job State (from external API)
  const [currentJobData, setCurrentJobData] = useState(null);

  // Resignation State
  const [isResignationModalOpen, setIsResignationModalOpen] = useState(false);
  const [isResigning, setIsResigning] = useState(false);
  const [resignationData, setResignationData] = useState({
    lastWorkingDay: '',
    letter: ''
  });

  const getAuthInfo = () => {
    const isEmployeeView = window.location.pathname.includes('/emp-');

    if (isEmployeeView) {
      const employeeDataRaw = localStorage.getItem("employeeData");
      let employeeId = null;
      if (employeeDataRaw) {
        try {
          const data = JSON.parse(employeeDataRaw);
          employeeId = data.employeeId;
        } catch (e) {
          console.error("Error parsing employeeData", e);
        }
      }
      if (!employeeId) employeeId = localStorage.getItem("employeeId");
      return employeeId ? { type: "employee", id: employeeId } : null;
    } else {
      // Candidate View
      const candidateToken = localStorage.getItem("candidateToken");
      return candidateToken ? { type: "candidate", token: candidateToken } : null;
    }
  };

  const fetchExperiences = async () => {
    const authInfo = getAuthInfo();
    if (!authInfo) {
      setErrorMsg("User authentication not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (authInfo.type === "candidate") {
        response = await axios.get(`${API_BASE_URL}/candidate/experience`, {
          headers: { Authorization: `Bearer ${authInfo.token}` }
        });
      } else {
        response = await axios.get(`${API_BASE_URL}/employees/experience/${authInfo.id}`);
      }

      if (response.data && response.data.success) {
        // Sort by startDate descending (newest first)
        const sortedExperiences = (response.data.data || []).sort((a, b) =>
          new Date(b.startDate) - new Date(a.startDate)
        );
        setExperiences(sortedExperiences);
        setFilteredExperiences(sortedExperiences);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setErrorMsg("Failed to fetch experiences.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentEmployeeJob = async () => {
    const isEmployeeView = window.location.pathname.includes('/emp-');
    if (!isEmployeeView) return;
    try {
      const email = localStorage.getItem("employeeEmail");
      if (!email) return;
      const res = await axios.get("https://api.timelyhealth.in/api/employees/get-employees");
      const employees = res.data || [];
      const match = employees.find(e => e.email?.toLowerCase() === email.toLowerCase());
      if (match) {
        // --- Added: Fetch Assigned Location (Shortened Format) ---
        // Use addressLine2 (often "Area, City") or fall back to city, state
        let displayLocation = match.addressLine2 ||
          (match.city && match.state ? `${match.city}, ${match.state}` : match.city || match.addressLine1 || "India");

        const empIdForLocation = match.employeeId;
        if (empIdForLocation) {
          try {
            const locRes = await axios.get(`https://api.timelyhealth.in/api/employees/mylocation/${empIdForLocation}`);
            if (locRes.data && locRes.data.success && locRes.data.data) {
              const locData = Array.isArray(locRes.data.data) ? locRes.data.data[0] : locRes.data.data;
              if (locData?.location?.name) {
                // Use the Location Name + City for a clean "cut" address
                displayLocation = `${locData.location.name}${match.city ? `, ${match.city}` : ""}`;
              }
            }
          } catch (locErr) {
            console.error("Error fetching assigned location:", locErr);
          }
        }
        // ---------------------------------------------------------

        setCurrentJobData({
          _id: "__current_job__",
          companyName: "Timely Health Tech Pvt Ltd",
          role: match.role || "-",
          location: displayLocation,
          salary: match.salaryPerMonth ? `₹${match.salaryPerMonth.toLocaleString('en-IN')}/mo` : "-",
          startDate: match.joinDate || null,
          endDate: null,
          department: match.department || "-",
          __isCurrent: true,
        });
      }
    } catch (err) {
      console.error("Error fetching current employee job from API:", err);
    }
  };

  useEffect(() => {
    fetchExperiences();
    fetchCurrentEmployeeJob();
  }, []);

  const openResignationModal = () => {
    const employeeDataRaw = localStorage.getItem("employeeData");
    let name = "Employee";
    let role = "Employee";
    if (employeeDataRaw) {
      try {
        const data = JSON.parse(employeeDataRaw);
        name = data.name || "Employee";
        role = data.role || "Employee";
      } catch (e) {}
    }

    const template = `Dear Manager,

I am writing to formally resign from my position as ${role} at Timely Health Tech Pvt Ltd. 

I appreciate the opportunities for professional and personal development that I have had during my time here. Thank you for your support and guidance.

I will do my best to ensure a smooth transition of my responsibilities before my departure.

Best regards,
${name}`;

    setResignationData({
      lastWorkingDay: '',
      letter: template
    });
    setIsResignationModalOpen(true);
  };

  const handleResignationSubmit = async (e) => {
    e.preventDefault();
    if (!resignationData.lastWorkingDay || !resignationData.letter) {
      alert("Please provide both the last working day and the resignation letter.");
      return;
    }

    setIsResigning(true);
    try {
      const email = localStorage.getItem("employeeEmail");
      const res = await axios.post(`${API_BASE_URL}/employees/submit-resignation`, {
        email,
        resignationLetter: resignationData.letter,
        lastWorkingDay: resignationData.lastWorkingDay
      });

      if (res.data.success) {
        alert("✅ Resignation submitted successfully!");
        setIsResignationModalOpen(false);
      }
    } catch (err) {
      console.error("Resignation submit error:", err);
      alert(err.response?.data?.message || "Failed to submit resignation.");
    } finally {
      setIsResigning(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = experiences;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.companyName?.toLowerCase().includes(term) ||
        exp.role?.toLowerCase().includes(term) ||
        exp.location?.toLowerCase().includes(term)
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.startDate).toISOString().split("T")[0];
        return expDate === selectedDate;
      });
    }

    // Month filter
    if (selectedMonth) {
      const [year, monthNum] = selectedMonth.split("-").map(Number);
      filtered = filtered.filter(exp => {
        const d = new Date(exp.startDate);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }

    setFilteredExperiences(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedMonth, experiences]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedMonth("");
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDate("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedMonth("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const authInfo = getAuthInfo();
    if (!authInfo) {
      setErrorMsg("User authentication not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Validation
    if (!formData.companyName || !formData.role || !formData.startDate || !formData.salary || !formData.location) {
      setErrorMsg("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    submitData.append('companyName', formData.companyName);
    submitData.append('role', formData.role);
    submitData.append('location', formData.location);
    submitData.append('salary', formData.salary);
    submitData.append('startDate', formData.startDate);
    if (formData.endDate) submitData.append('endDate', formData.endDate);

    if (formData.offerLetter) submitData.append('offerLetter', formData.offerLetter);
    if (formData.payslip) submitData.append('payslip', formData.payslip);

    try {
      let response;
      if (authInfo.type === "candidate") {
        response = await axios.post(`${API_BASE_URL}/candidate/experience`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authInfo.token}`
          }
        });
      } else {
        submitData.append('employeeId', authInfo.id);
        response = await axios.post(`${API_BASE_URL}/employees/experience`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data && response.data.success) {
        alert("✅ Experience submitted successfully!");
        fetchExperiences();
        setIsModalOpen(false);
        setFormData({
          companyName: '', role: '', location: '', salary: '', startDate: '', endDate: '', offerLetter: null, payslip: null
        });
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      setErrorMsg(error.response?.data?.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredExperiences.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExperiences.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  // currentJobData is populated by fetchCurrentEmployeeJob (via the external API)


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const baseURL = API_DOMAIN;

  // Helper to construct document URL safely (handles both absolute and relative paths)
  const getDocumentUrl = (path) => {
    if (!path) return "";
    let cleanPath = path.replace(/\\/g, '/');
    // If the path contains 'uploads/', strip everything before it to make it relative
    if (cleanPath.includes("uploads/")) {
      cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
    }
    return `${baseURL}/${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your experiences...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalExperiences = experiences.length;
  const currentRoles = experiences.filter(exp => !exp.endDate).length;
  // A simple calculation: total companies worked for is the number of distinct company names (or just total experiences since usually it's one per row)
  const uniqueCompanies = new Set(experiences.map(exp => exp.companyName?.toLowerCase())).size;

  return (
    <div className="min-h-screen px-2 py-2 bg-gray-100 font-sans sm:px-3 sm:py-3">
      <div className="mx-auto max-w-9xl">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
          <StatCard
            label="Total Roles"
            value={totalExperiences}
            color="indigo"
            icon={FiBriefcase}
          />
          <StatCard
            label="Current Roles"
            value={currentRoles}
            color="emerald"
            icon={FiCheckCircle}
          />
          <StatCard
            label="Total Companies"
            value={uniqueCompanies}
            color="amber"
            icon={FiHome}
          />
          <StatCard
            label="Profile Strength"
            value={experiences.length > 0 ? "Active" : "New"}
            color="purple"
            icon={FiZap}
          />
        </div>

        {/* Filters Section - Synced with UserActivity/EmployeeLetters style */}
        <div className="p-2 mb-3 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <FaSearch className="absolute text-sm text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="text"
                placeholder="Search by company, role or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Date Filter */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Month Filter */}
            <div className="relative w-[130px]">
              <FaCalendarAlt className="absolute text-xs text-gray-400 transform -translate-y-1/2 left-2 top-1/2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Add Experience Button - Inside Filters */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              <FaPlus className="text-xs" /> Add Experience
            </button>

            {/* Resign Button */}
            {window.location.pathname.includes('/emp-') && (
              <button
                onClick={openResignationModal}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition bg-red-600 rounded-md hover:bg-red-700"
              >
                <FaSignOutAlt className="text-xs" /> Resign
              </button>
            )}

            {/* Clear Filters */}
            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="h-8 px-3 text-xs font-medium text-gray-600 transition bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
            <span>
              Showing <strong>{filteredExperiences.length}</strong> of <strong>{experiences.length}</strong> records
            </span>
            {filteredExperiences.length !== experiences.length && (
              <span className="font-semibold text-orange-600">
                🔍 Filters applied
              </span>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          {filteredExperiences.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🏢</div>
              <p className="mb-4 text-lg font-semibold text-gray-600">
                {experiences.length === 0 ? "No experience records found." : "No records match your filters."}
              </p>
              {experiences.length > 0 ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🔄 Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  ➕ Add Your First Role
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-sm text-center text-white bg-blue-600">
                    <tr className="uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-2.5 px-6">ROLE & COMPANY</th>
                      <th className="py-2.5 px-6">LOCATION</th>
                      <th className="py-2.5 px-6">DURATION</th>
                      <th className="py-2.5 px-6">SALARY</th>
                      <th className="py-2.5 px-6">DOCUMENTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* ── Pinned Current Job Row (Employee view) ── */}
                    {currentJobData && (
                      <tr className="bg-green-50 border-l-4 border-green-500 hover:bg-green-100 transition duration-150">
                        <td className="px-2 py-2 text-center sm:px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <div>
                              <span className="block font-bold text-gray-800 text-xs sm:text-sm">
                                {currentJobData.role}
                              </span>
                              <span className="block text-xs text-green-700 font-semibold">
                                {currentJobData.companyName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-xs sm:text-sm text-gray-600">
                          {currentJobData.location}
                        </td>
                        <td className="px-2 py-2 text-center text-xs sm:text-sm whitespace-nowrap">
                          {formatDate(currentJobData.startDate)}
                          {" – "}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Current
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                            {currentJobData.salary}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="text-[10px] text-green-600 font-semibold italic">Active Employee</span>
                        </td>
                      </tr>
                    )}
                    {/* ── Past Experience Rows ── */}
                    {currentRecords.map((exp, index) => (
                      <tr
                        key={exp._id || index}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150`}
                      >
                        <td className="px-2 py-1.5 text-center sm:px-3 sm:py-2">
                          <span className="block font-semibold text-gray-800 text-xs sm:text-sm">
                            {exp.role}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {exp.companyName}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center text-xs sm:text-sm">
                          {exp.location}
                        </td>
                        <td className="px-2 py-1.5 text-center text-xs sm:text-sm whitespace-nowrap">
                          {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                            {exp.salary}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {exp.offerLetter && (
                              <a
                                href={getDocumentUrl(exp.offerLetter)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="Offer Letter"
                              >
                                <FaFilePdf size={16} />
                              </a>
                            )}
                            {exp.payslip && (
                              <a
                                href={getDocumentUrl(exp.payslip)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="Payslip"
                              >
                                <FaFilePdf size={16} />
                              </a>
                            )}
                            {!exp.offerLetter && !exp.payslip && (
                              <span className="text-[10px] text-gray-400 italic">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredExperiences.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 sm:flex-row">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">
                        Show:
                      </label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="p-1 text-xs border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">entries</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredExperiences.length)}</strong> of{" "}
                      <strong>{filteredExperiences.length}</strong> records
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      ← Prev
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition min-w-[28px] ${page === "..."
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Experience Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 sm:text-xl">Add Working Experience</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Company Name *</label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="E.g. TechCorp"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Role / Job Title *</label>
                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="E.g. Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Location *</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Salary (CTC) *</label>
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="E.g. $80k/yr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Start Date *</label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">End Date (Blank = Current)</label>
                  <input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Offer Letter</label>
                  <input
                    name="offerLetter"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Payslip</label>
                  <input
                    name="payslip"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resignation Modal */}
      {isResignationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Submit Resignation</h3>
              <button 
                onClick={() => setIsResignationModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleResignationSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Last Working Day *</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="date"
                    required
                    value={resignationData.lastWorkingDay}
                    onChange={(e) => setResignationData({ ...resignationData, lastWorkingDay: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Resignation Letter *</label>
                <textarea
                  required
                  rows={10}
                  value={resignationData.letter}
                  onChange={(e) => setResignationData({ ...resignationData, letter: e.target.value })}
                  className="w-full p-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none font-sans leading-relaxed"
                  placeholder="Draft your resignation letter here..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResignationModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  disabled={isResigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResigning}
                  className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-100 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isResigning ? "Submitting..." : "Submit Resignation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJobs;