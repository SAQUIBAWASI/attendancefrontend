import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_DOMAIN } from '../config';
import { FaPlus, FaSearch, FaCalendarAlt, FaFilePdf, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { FiBriefcase, FiCheckCircle, FiHome, FiZap } from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeePageShell.css";

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
      <div className="emp-dash__loading">
        <div className="emp-dash__spinner" />
        <p className="emp-dash__loading-text">Loading your experiences...</p>
      </div>
    );
  }

  // Calculate stats
  const totalExperiences = experiences.length;
  const currentRoles = experiences.filter(exp => !exp.endDate).length;
  // A simple calculation: total companies worked for is the number of distinct company names (or just total experiences since usually it's one per row)
  const uniqueCompanies = new Set(experiences.map(exp => exp.companyName?.toLowerCase())).size;

  return (
    <div>
    <div className="w-full">

        {/* Stats Cards */}
        <div className="emp-dash__stats">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Roles</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiBriefcase />
              </div>
            </div>
            <div className="emp-dash__stat-value">{totalExperiences}</div>
            <div className="emp-dash__stat-meta">experience records</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Current Roles</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiCheckCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value">{currentRoles}</div>
            <div className="emp-dash__stat-meta">active positions</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Companies</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiHome />
              </div>
            </div>
            <div className="emp-dash__stat-value">{uniqueCompanies}</div>
            <div className="emp-dash__stat-meta">unique employers</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Profile</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--absent">
                <FiZap />
              </div>
            </div>
            <div className="emp-dash__stat-value" style={{ fontSize: "1.15rem" }}>
              {experiences.length > 0 ? "Active" : "New"}
            </div>
            <div className="emp-dash__stat-meta">experience status</div>
          </div>
        </div>

        {/* Filters Section - Synced with UserActivity/EmployeeLetters style */}
        <div className="emp-dash__card" style={{ marginBottom: "1rem" }}>
          <div className="emp-dash__card-header">
            <div>
              <h3 className="emp-dash__card-title">Jobs / Experience</h3>
              <p className="emp-dash__card-desc">Search and review your experience records.</p>
            </div>
            <div className="emp-page__pill emp-page__pill--muted">
              Showing {filteredExperiences.length} / {experiences.length}
            </div>
          </div>

          <div className="emp-dash__card-body" style={{ paddingTop: "1rem" }}>
          <div className="emp-page__filters">

            {/* Search */}
            <div className="emp-page__search-wrap">
              <FaSearch className="emp-page__search-icon" />
              <input
                type="text"
                placeholder="Search by company, role or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="emp-page__search"
              />
            </div>

            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="emp-page__field"
            />

            {/* Month Filter */}
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="emp-page__field emp-page__field--month"
            />

            {/* Add Experience Button - Inside Filters */}
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-900 transition bg-blue-600 rounded-md hover:bg-blue-800"
            >
              <FaPlus className="text-xs" /> Add Experience
            </button> */}

            {/* Resign Button */}
            {window.location.pathname.includes('/emp-') && (
              <button
                onClick={openResignationModal}
                className="emp-page__danger-btn"
              >
                <FaSignOutAlt className="text-xs" /> Resign
              </button>
            )}

            {/* Clear Filters */}
            {(searchTerm || selectedDate || selectedMonth) && (
              <button
                onClick={clearFilters}
                className="emp-page__secondary-btn"
              >
                Clear
              </button>
            )}
          </div>

          </div>
        </div>

        {/* Table Section */}
        <div className="emp-dash__card">
          {filteredExperiences.length === 0 ? (
            <div className="emp-page__empty">
              <div className="emp-page__empty-icon">
                <FiBriefcase />
              </div>
              <h3>{experiences.length === 0 ? "No experience records found" : "No records match your filters"}</h3>
              <p>{experiences.length === 0 ? "Add your first role to start building your profile." : "Try clearing filters or using different search terms."}</p>
              {experiences.length > 0 ? (
                <button
                  onClick={clearFilters}
                  className="emp-page__secondary-btn"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="emp-page__primary-btn"
                >
                  Add Your First Role
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="emp-dash__table-wrap">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th>Role & Company</th>
                      <th>Location</th>
                      <th>Duration</th>
                      <th>Salary</th>
                      <th style={{ textAlign: "right" }}>Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ── Pinned Current Job Row (Employee view) ── */}
                    {currentJobData && (
                      <tr style={{ background: "var(--ed-success-soft)" }}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                            <span style={{ fontWeight: 700 }}>{currentJobData.role}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--ed-text-secondary)" }}>{currentJobData.companyName}</span>
                          </div>
                        </td>
                        <td>{currentJobData.location}</td>
                        <td>
                          {formatDate(currentJobData.startDate)} –{" "}
                          <span className="emp-page__badge emp-page__badge--success">Current</span>
                        </td>
                        <td>
                          <span className="emp-page__badge emp-page__badge--primary">{currentJobData.salary}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="emp-page__badge emp-page__badge--primary">Active Employee</span>
                        </td>
                      </tr>
                    )}
                    {/* ── Past Experience Rows ── */}
                    {currentRecords.map((exp, index) => (
                      <tr key={exp._id || index}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                            <span style={{ fontWeight: 700 }}>{exp.role}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--ed-text-secondary)" }}>{exp.companyName}</span>
                          </div>
                        </td>
                        <td>{exp.location}</td>
                        <td>
                          {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                        </td>
                        <td>
                          <span className="emp-page__badge emp-page__badge--primary">{exp.salary}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
                            {exp.offerLetter && (
                              <a
                                href={getDocumentUrl(exp.offerLetter)}
                                target="_blank"
                                rel="noreferrer"
                                className="emp-page__icon-btn"
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
                                className="emp-page__icon-btn"
                                title="Payslip"
                              >
                                <FaFilePdf size={16} />
                              </a>
                            )}
                            {!exp.offerLetter && !exp.payslip && (
                              <span className="emp-page__badge emp-page__badge--primary">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="emp-dash__mobile-list">
                {/* Pinned Current Job Card */}
                {currentJobData && (
                  <div className="emp-dash__mobile-item" style={{ background: "var(--ed-success-soft)" }}>
                    <div className="emp-dash__mobile-item-top">
                      <div className="emp-dash__mobile-date" style={{ fontWeight: 700 }}>{currentJobData.role}</div>
                      <span className="emp-page__badge emp-page__badge--success">Current</span>
                    </div>
                    <div className="emp-dash__mobile-grid">
                      <div className="emp-dash__mobile-field">
                        <span>Company</span>
                        <span>{currentJobData.companyName}</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Location</span>
                        <span>{currentJobData.location}</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Duration</span>
                        <span>{formatDate(currentJobData.startDate)} – Present</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Salary</span>
                        <span>{currentJobData.salary}</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Past Experiences Cards */}
                {currentRecords.map((exp, index) => (
                  <div key={exp._id || index} className="emp-dash__mobile-item">
                    <div className="emp-dash__mobile-item-top">
                      <div className="emp-dash__mobile-date" style={{ fontWeight: 700 }}>{exp.role}</div>
                      <span className="emp-page__badge emp-page__badge--primary">{exp.salary}</span>
                    </div>
                    <div className="emp-dash__mobile-grid">
                      <div className="emp-dash__mobile-field">
                        <span>Company</span>
                        <span>{exp.companyName}</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Location</span>
                        <span>{exp.location}</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Duration</span>
                        <span>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                      </div>
                      <div className="emp-dash__mobile-field">
                        <span>Documents</span>
                        <div style={{ display: "inline-flex", gap: "0.35rem", marginTop: "0.15rem" }}>
                          {exp.offerLetter && (
                            <a href={getDocumentUrl(exp.offerLetter)} target="_blank" rel="noreferrer" className="emp-page__icon-btn" style={{ width: "1.75rem", height: "1.75rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="Offer Letter">
                              <FaFilePdf size={12} />
                            </a>
                          )}
                          {exp.payslip && (
                            <a href={getDocumentUrl(exp.payslip)} target="_blank" rel="noreferrer" className="emp-page__icon-btn" style={{ width: "1.75rem", height: "1.75rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="Payslip">
                              <FaFilePdf size={12} />
                            </a>
                          )}
                          {!exp.offerLetter && !exp.payslip && <span style={{ fontSize: "0.75rem" }}>N/A</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredExperiences.length > 0 && (
                <div className="emp-dash__card-body" style={{ borderTop: "1px solid var(--ed-border-light)", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <label className="emp-dash__card-desc" style={{ margin: 0 }}>Show</label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="emp-page__select"
                        style={{ height: "2.25rem" }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="emp-dash__card-desc" style={{ margin: 0 }}>entries</span>
                    </div>
                    <div className="emp-dash__card-desc" style={{ margin: 0 }}>
                      Showing <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredExperiences.length)}</strong> of{" "}
                      <strong>{filteredExperiences.length}</strong> records
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="emp-page__secondary-btn"
                      style={{ padding: "0.45rem 0.75rem", opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      Prev
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
                        disabled={page === "..."}
                        className={`emp-page__chip ${currentPage === page ? "emp-page__chip--active" : ""}`}
                        style={{ height: "2.25rem", padding: "0 0.75rem", minWidth: "2.25rem", opacity: page === "..." ? 0.6 : 1 }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="emp-page__secondary-btn"
                      style={{ padding: "0.45rem 0.75rem", opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 emp-dash-modal">
          <div className="emp-dash__modal-panel bg-white shadow-2xl rounded-2xl" style={{ maxWidth: "740px" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-700 sm:text-xl">Add Working Experience</h3>
              <button onClick={() => setIsModalOpen(false)} className="emp-page__icon-btn">
                <FaTimes />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" style={{ padding: "0 1.25rem 1.25rem" }}>
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
                  className="flex-1 py-2 text-sm text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white  backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-700">Submit Resignation</h3>
              <button 
                onClick={() => setIsResignationModalOpen(false)} 
                className="p-2 text-gray-500 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleResignationSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Last Working Day *</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute text-gray-900 transform -translate-y-1/2 left-3 top-1/2" />
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
                  className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  disabled={isResigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResigning}
                  className="flex-1 py-3 text-sm font-bold text-gray-900 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-100 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
