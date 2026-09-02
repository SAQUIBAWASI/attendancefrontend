// DoctorManagement.js - Complete fixed component

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaStethoscope,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaRupeeSign,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaAward
} from "react-icons/fa";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiAward,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiCheck
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const DEFAULT_SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Gynecologist",
  "Neurologist",
  "Ophthalmologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Surgeon",
  "Urologist",
  "General Medicine"
];

const TIME_OPTIONS = [
  "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM",
  "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM",
  "11:00 PM", "11:30 PM", "12:00 AM"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  specialization: "",
  qualification: "",
  experience: "",
  address: "",
  consultationFee: "",
  availableDays: [],
  availableTimeStart: "",
  availableTimeEnd: "",
  status: "active"
};

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const specDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const [activeCardFilter, setActiveCardFilter] = useState("all");

  // FIX: Month filter - default to ALL (empty string) instead of current month
  const [selectedMonth, setSelectedMonth] = useState("");

  const [toast, setToast] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("doctorMgmt_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target)) {
        setShowSpecDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // FIXED: Fetch doctors with proper data extraction
  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors/getalldoctors`);
      console.log("=== FULL API RESPONSE ===", res);
      console.log("=== RESPONSE DATA ===", res.data);
      
      let doctorsData = [];
      
      if (res.data && res.data.success) {
        if (res.data.data && Array.isArray(res.data.data)) {
          doctorsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          doctorsData = res.data;
        } else {
          doctorsData = res.data.data || [];
        }
      } else if (Array.isArray(res.data)) {
        doctorsData = res.data;
      }
      
      console.log("=== EXTRACTED DOCTORS ===", doctorsData);
      console.log("=== DOCTORS COUNT ===", doctorsData.length);
      
      setDoctors(doctorsData);
      
      // If doctors exist, show success toast
      if (doctorsData.length > 0) {
        showToast(`Loaded ${doctorsData.length} doctors successfully!`);
      }
      
    } catch (err) {
      console.error("=== ERROR FETCHING DOCTORS ===", err);
      setDoctors([]);
      setError(err.response?.data?.message || "Failed to fetch doctor records");
      showToast(err.response?.data?.message || "Failed to fetch doctor records", "error");
    } finally {
      setLoading(false);
    }
  };

  const addDoctor = async (payload) => {
    return await axios.post(`${API_BASE_URL}/doctors/adddoctor`, payload);
  };

  const updateDoctor = async (id, payload) => {
    return await axios.put(`${API_BASE_URL}/doctors/updatedoctor/${id}`, payload);
  };

  const deleteDoctor = async (id) => {
    return await axios.delete(`${API_BASE_URL}/doctors/deletedoctor/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.specialization) {
      showToast("Please fill in Name, Phone, and Specialization", "error");
      return;
    }
    if (!editingId && !formData.password) {
      showToast("Please set a password for the new doctor", "error");
      return;
    }
    if (!editingId && formData.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData };

      if (payload.availableTimeStart && payload.availableTimeEnd) {
        payload.availableTime = `${payload.availableTimeStart} - ${payload.availableTimeEnd}`;
      } else if (payload.availableTimeStart) {
        payload.availableTime = payload.availableTimeStart;
      } else {
        payload.availableTime = "";
      }

      delete payload.availableTimeStart;
      delete payload.availableTimeEnd;

      if (editingId && !payload.password) {
        delete payload.password;
      }

      if (editingId) {
        const res = await updateDoctor(editingId, payload);
        if (res.data.success) {
          setDoctors((prev) =>
            prev.map((d) => (d._id === editingId ? res.data.data : d))
          );
          showToast("Doctor record updated successfully!");
        }
      } else {
        const res = await addDoctor(payload);
        if (res.data.success) {
          setDoctors((prev) => [res.data.data, ...prev]);
          showToast("Doctor added successfully!");
        }
      }
      setFormData({ ...EMPTY_FORM });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving doctor:", err);
      showToast(err.response?.data?.message || "Failed to save doctor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor) => {
    let startTime = "";
    let endTime = "";
    if (doctor.availableTime) {
      const parts = doctor.availableTime.split(" - ");
      if (parts.length === 2) {
        startTime = parts[0].trim();
        endTime = parts[1].trim();
      } else {
        startTime = doctor.availableTime;
      }
    }

    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      password: "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      address: doctor.address || "",
      consultationFee: doctor.consultationFee || "",
      availableDays: doctor.availableDays || [],
      availableTimeStart: startTime,
      availableTimeEnd: endTime,
      status: doctor.status || "active"
    });
    setEditingId(doctor._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor record?")) return;
    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      showToast("Doctor record deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast(err.response?.data?.message || "Failed to delete doctor record", "error");
    }
  };

  const handleStatusToggle = async (doctor) => {
    const newStatus = doctor.status === "active" ? "inactive" : "active";
    try {
      const res = await updateDoctor(doctor._id, { status: newStatus });
      if (res.data.success) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === doctor._id ? { ...d, status: newStatus } : d))
        );
        if (selectedDoctor && selectedDoctor._id === doctor._id) {
          setSelectedDoctor((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Doctor status updated to '${newStatus}'`);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const cancelForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const getDefaultMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  const isDefaultMonth = selectedMonth === getDefaultMonth();

  const hasActiveFilters = searchQuery || specializationFilter !== "All" || statusFilter !== "All" || selectedMonth !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setSpecializationFilter("All");
    setStatusFilter("All");
    setSelectedMonth(""); // FIX: Clear month filter
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      setShowMobileFilters(false);
    }
  };

  const getSpecLabel = () => {
    if (specializationFilter === "All") return "Specialization";
    return specializationFilter;
  };

  const getStatusLabel = () => {
    if (statusFilter === "All") return "Status";
    return statusFilter === "active" ? "Active" : "Inactive";
  };

  const uniqueSpecializations = useMemo(() => {
    const fromData = doctors.map((d) => d.specialization).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_SPECIALIZATIONS, ...fromData]));
    return combined.sort();
  }, [doctors]);

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") {
      setStatusFilter("All");
    } else if (type === "active") {
      setStatusFilter("active");
    } else if (type === "inactive") {
      setStatusFilter("inactive");
    }
  };

  // FIXED: Filter logic - only apply month filter if selectedMonth is not empty
  const filteredDoctors = useMemo(() => {
    console.log("=== FILTERING DOCTORS ===");
    console.log("All Doctors:", doctors);
    console.log("Selected Month:", selectedMonth);
    console.log("Specialization Filter:", specializationFilter);
    console.log("Status Filter:", statusFilter);
    console.log("Search Query:", searchQuery);
    
    const filtered = doctors.filter((d) => {
      // Apply month filter ONLY if selectedMonth is not empty
      if (selectedMonth && selectedMonth !== "") {
        const createdAt = new Date(d.createdAt);
        const doctorMonth = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        console.log(`Doctor ${d.name} month: ${doctorMonth}, Selected: ${selectedMonth}`);
        if (doctorMonth !== selectedMonth) return false;
      }

      if (specializationFilter !== "All" && d.specialization !== specializationFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.name || "").toLowerCase().includes(q);
        const matchPhone = (d.phone || "").toLowerCase().includes(q);
        const matchEmail = (d.email || "").toLowerCase().includes(q);
        const matchSpecialization = (d.specialization || "").toLowerCase().includes(q);
        const matchQualification = (d.qualification || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchSpecialization && !matchQualification) {
          return false;
        }
      }
      return true;
    });
    
    console.log("=== FILTERED DOCTORS COUNT ===", filtered.length);
    console.log("=== FILTERED DOCTORS ===", filtered);
    return filtered;
  }, [doctors, specializationFilter, statusFilter, searchQuery, selectedMonth]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, specializationFilter, statusFilter, selectedMonth]);

  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((d) => d.status === "active").length;
    const inactive = doctors.filter((d) => d.status === "inactive").length;
    const totalSpecializations = new Set(doctors.map((d) => d.specialization).filter(Boolean)).size;
    return { total, active, inactive, totalSpecializations };
  }, [doctors]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const downloadCSV = () => {
    if (filteredDoctors.length === 0) {
      alert("No doctor records available to download!");
      return;
    }

    const headers = [
      "Sl No", "Doctor ID", "Doctor Name", "Specialization", "Qualification", "Experience (Years)",
      "Phone", "Email", "Consultation Fee (INR)", "Available Days", "Available Time", "Status", "Joined Date"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredDoctors.map((d, idx) => {
        const days = (d.availableDays || []).join("; ");
        return [
          idx + 1,
          `"${d._id}"`,
          `"${(d.name || "").replace(/"/g, '""')}"`,
          `"${d.specialization || ""}"`,
          `"${(d.qualification || "").replace(/"/g, '""')}"`,
          `"${d.experience || "0"}"`,
          `"${d.phone || ""}"`,
          `"${d.email || ""}"`,
          d.consultationFee || 0,
          `"${days}"`,
          `"${d.availableTime || ""}"`,
          `"${d.status || "active"}"`,
          `"${formatDate(d.createdAt)}"`
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctor_records_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredDoctors.length} doctor records to CSV!`);
  };

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("doctorMgmt_itemsPerPage", String(newValue));
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

  const getSpecializationBadgeStyle = (spec) => {
    const colorMap = {
      "Cardiologist": "bg-rose-50 text-rose-700 border-rose-200",
      "Dermatologist": "bg-amber-50 text-amber-700 border-amber-200",
      "General Physician": "bg-blue-50 text-blue-700 border-blue-200",
      "General Medicine": "bg-cyan-50 text-cyan-700 border-cyan-200",
      "Gynecologist": "bg-pink-50 text-pink-700 border-pink-200",
      "Neurologist": "bg-purple-50 text-purple-700 border-purple-200",
      "Orthopedic": "bg-teal-50 text-teal-700 border-teal-200",
      "Pediatrician": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Psychiatrist": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Surgeon": "bg-red-50 text-red-700 border-red-200"
    };
    return colorMap[spec] || "bg-violet-50 text-violet-700 border-violet-200";
  };

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading doctor records...</p>
        </div>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="emp-dash">
        <main className="grid place-items-center min-h-[60vh] p-4">
          <div className="emp-dash__card max-w-[520px] w-full">
            <div className="emp-dash__card-header">
              <div>
                <h3 className="emp-dash__card-title">Couldn't load doctor records</h3>
                <p className="emp-dash__card-desc text-red-600 mt-1">{error}</p>
              </div>
              <button type="button" className="emp-dash__card-link" onClick={fetchDoctors}>
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

        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
              toast.type === "error"
                ? "bg-red-600"
                : toast.type === "info"
                ? "bg-cyan-600"
                : "bg-emerald-600"
            }`}
          >
            {toast.type === "error" ? (
              <FiXCircle className="w-5 h-5" />
            ) : (
              <FiCheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Doctor <span>Management</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill flex-shrink-0">
              <FaUserMd />
              <span>{doctors.length} Registered Doctors</span>
            </div>
            
            <div className="relative min-w-[150px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search Name, Phone, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[180px] pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Month Filter - ADDED */}
            <div className="relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                title="Filter by month"
              />
            </div>

            <div className="relative" ref={specDropdownRef}>
              <button
                onClick={() => {
                  setShowSpecDropdown(!showSpecDropdown);
                  setShowStatusDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  specializationFilter !== "All"
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaAward className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{getSpecLabel()}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showSpecDropdown && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px] max-h-60 overflow-y-auto"
                  style={{
                    zIndex: 99999,
                    top: specDropdownRef.current ? specDropdownRef.current.getBoundingClientRect().bottom + 4 : "auto",
                    left: specDropdownRef.current ? specDropdownRef.current.getBoundingClientRect().left : "auto"
                  }}
                >
                  <div
                    onClick={() => {
                      setSpecializationFilter("All");
                      setShowSpecDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs font-medium border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${
                      specializationFilter === "All" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-500"
                    }`}
                  >
                    All Specializations
                  </div>
                  {uniqueSpecializations.map((spec) => (
                    <div
                      key={spec}
                      onClick={() => {
                        setSpecializationFilter(spec);
                        setShowSpecDropdown(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                        specializationFilter === spec ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      <span>{spec}</span>
                      {specializationFilter === spec && <FiCheck className="w-3 h-3 text-blue-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowSpecDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  statusFilter !== "All"
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiUserCheck className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[60px]">{getStatusLabel()}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showStatusDropdown && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[150px]"
                  style={{
                    zIndex: 99999,
                    top: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().bottom + 4 : "auto",
                    left: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().left : "auto"
                  }}
                >
                  <div
                    onClick={() => {
                      setStatusFilter("All");
                      setShowStatusDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      statusFilter === "All" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>All Status</span>
                    {statusFilter === "All" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div
                    onClick={() => {
                      setStatusFilter("active");
                      setShowStatusDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      statusFilter === "active" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>Active</span>
                    {statusFilter === "active" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div
                    onClick={() => {
                      setStatusFilter("inactive");
                      setShowStatusDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      statusFilter === "inactive" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>Inactive</span>
                    {statusFilter === "inactive" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" />
                Clear
              </button>
            )}

            <button
              onClick={fetchDoctors}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
              title="Export CSV"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          </div>
        </div>

        <div className="lg:hidden flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base font-bold whitespace-nowrap">
              Doctor <span className="text-indigo-600">Management</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaUserMd className="text-[10px]" />
              <span>{doctors.length} Doctors</span>
            </div>
          </div>
          
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiFilter className="text-blue-600 text-sm" />
              <span>Filter</span>
              {showMobileFilters ? (
                <FiChevronUp className="text-gray-400 text-xs" />
              ) : (
                <FiChevronDown className="text-gray-400 text-xs" />
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" />
                Clear
              </button>
            )}
            
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm ml-auto"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {showMobileFilters && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="All">All Specializations</option>
                  {uniqueSpecializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={fetchDoctors}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Doctors</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all registered</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "active" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""
            }`}
            onClick={() => handleCardClick("active")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active Doctors</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">available for booking</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "inactive" ? "ring-2 ring-red-500/20 border-red-400" : ""
            }`}
            onClick={() => handleCardClick("inactive")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Inactive</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiUserX />
              </div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.inactive}</div>
            <div className="emp-dash__stat-meta">temporarily paused</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Specializations</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiAward />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">{stats.totalSpecializations}</div>
            <div className="emp-dash__stat-meta">medical specialties</div>
          </div>

          <div className="emp-dash__stat col-span-2 lg:col-span-1">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Filtered Records</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiFilter />
              </div>
            </div>
            <div className="emp-dash__stat-value text-base sm:text-lg md:text-xl font-bold truncate">
              {filteredDoctors.length}
            </div>
            <div className="emp-dash__stat-meta">matching filters</div>
          </div>
        </div>

        <div className="emp-dash__card">
          {filteredDoctors.length === 0 ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">
                <FaStethoscope className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No doctor records found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                {doctors.length === 0
                  ? "Click 'Add Doctor' to register a new doctor."
                  : "There are no doctor records matching your current filter criteria."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFormData({ ...EMPTY_FORM });
                    setEditingId(null);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add Doctor
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>S.No</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Qualification</th>
                      <th style={{ textAlign: "center" }}>Experience</th>
                      <th style={{ textAlign: "center" }}>Fee</th>
                      <th>Available Schedule</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Joined</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDoctors.map((doctor, idx) => {
                      const isActive = doctor.status === "active";
                      const specBadgeClass = getSpecializationBadgeStyle(doctor.specialization);

                      return (
                        <tr key={doctor._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-3 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                                {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, "").charAt(0).toUpperCase() : "D"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate">
                                  {doctor.name || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${specBadgeClass}`}>
                              <FiAward className="text-[10px]" />
                              {doctor.specialization || "General"}
                            </span>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap text-slate-700 text-xs font-medium">
                            {doctor.qualification ? (
                              <div className="flex items-center gap-1">
                                <FaGraduationCap className="text-gray-400 text-[11px]" />
                                <span>{doctor.qualification}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {doctor.experience ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 rounded border border-slate-200">
                                {doctor.experience} {Number(doctor.experience) === 1 ? "yr" : "yrs"}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-800">
                              ₹{doctor.consultationFee || 0}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1 max-w-[190px]">
                              {doctor.availableDays && doctor.availableDays.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {doctor.availableDays.map((day, i) => (
                                    <span
                                      key={i}
                                      className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100"
                                    >
                                      {day.slice(0, 3)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">No days set</span>
                              )}
                              {doctor.availableTime && (
                                <div className="text-[10px] font-medium text-slate-600 flex items-center gap-1">
                                  <FiClock className="text-gray-400 text-[10px]" />
                                  <span>{doctor.availableTime}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {isActive ? (
                                  <span className="relative flex w-1.5 h-1.5">
                                    <span className="absolute inline-flex w-full h-full bg-emerald-400 rounded-full opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  </span>
                                ) : (
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                )}
                                {doctor.status || "active"}
                              </span>
                              <button
                                onClick={() => handleStatusToggle(doctor)}
                                className={`text-[9px] font-medium underline transition-colors ${
                                  isActive ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"
                                }`}
                              >
                                {isActive ? "Set Inactive" : "Set Active"}
                              </button>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="font-semibold text-slate-700 text-[11px]">
                              {formatDate(doctor.createdAt)}
                            </div>
                            <div className="text-[10px] text-gray-400">{formatTime(doctor.createdAt)}</div>
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedDoctor(doctor);
                                  setShowDetailModal(true);
                                  setShowPasswordInModal(false);
                                }}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(doctor)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="Edit Doctor"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doctor._id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Delete Record"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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
                    Showing{" "}
                    <strong className="text-gray-800">
                      {filteredDoctors.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredDoctors.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredDoctors.length}</strong> records
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === 1
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => (typeof page === "number" ? handlePageClick(page) : null)}
                      disabled={page === "..."}
                      className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all min-w-[32px] ${
                        page === "..."
                          ? "text-gray-400 bg-transparent border-transparent cursor-default"
                          : currentPage === page
                          ? "text-white bg-blue-600 border-blue-600 shadow-sm"
                          : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-all ${
                      currentPage === totalPages || totalPages === 0
                        ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaStethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingId ? "Edit Doctor Details" : "Add New Doctor"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in the doctor profile information</p>
                  </div>
                </div>
                <button
                  onClick={cancelForm}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Doctor Name <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FaUserMd className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. John Doe"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <FaEnvelope className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="doctor@hospital.com"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Specialization <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <FiAward className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        required
                      >
                        <option value="">Select Specialization</option>
                        {uniqueSpecializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Password {!editingId && <span className="text-blue-600">*</span>}
                    {editingId && (
                      <span className="text-gray-400 text-[10px] font-normal ml-1">
                        (Leave blank to keep current password)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <FaLock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={
                        editingId ? "Enter new password (optional)" : "Set a password (min 6 characters)"
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-12 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      required={!editingId}
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                    </button>
                  </div>
                  {!editingId && (
                    <p className="text-[10px] text-gray-400 mt-1">Password must be at least 6 characters long</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Qualification
                    </label>
                    <div className="relative">
                      <FaGraduationCap className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="MBBS, MD (Cardiology), etc."
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Experience (Years)
                    </label>
                    <div className="relative">
                      <FaBriefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="5"
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Consultation Fee (₹)
                    </label>
                    <div className="relative">
                      <FaRupeeSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        placeholder="500"
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {["active", "inactive"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, status: st }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all capitalize ${
                            formData.status === st
                              ? st === "active"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                                : "border-red-500 bg-red-50 text-red-700 shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {st === "active" ? (
                            <FaCheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <FaTimesCircle className="w-3 h-3 text-red-500" />
                          )}
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Clinic / Hospital Address
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Clinic address or Hospital room #"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = formData.availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Available Time Schedule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Start Time</label>
                      <div className="relative">
                        <FaClock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <select
                          name="availableTimeStart"
                          value={formData.availableTimeStart}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        >
                          <option value="">Select Start Time</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`start-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">End Time</label>
                      <div className="relative">
                        <FaClock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <select
                          name="availableTimeEnd"
                          value={formData.availableTimeEnd}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium appearance-none"
                        >
                          <option value="">Select End Time</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`end-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs absolute right-3 top-2.5 pointer-events-none">▾</span>
                      </div>
                    </div>
                  </div>
                  {formData.availableTimeStart && formData.availableTimeEnd && (
                    <p className="text-xs text-blue-600 font-semibold mt-1.5 flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" /> Selected Slot: {formData.availableTimeStart} - {formData.availableTimeEnd}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : editingId ? (
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <FiPlus className="w-3.5 h-3.5" />
                    )}
                    {editingId ? "Update Doctor" : "Add Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaStethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Doctor Profile</h3>
                    <p className="text-xs text-gray-500">ID: {selectedDoctor._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDoctor(null);
                    setShowPasswordInModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                    {selectedDoctor.name
                      ? selectedDoctor.name.replace(/^Dr\.\s*/i, "").charAt(0).toUpperCase()
                      : "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-gray-900 truncate">
                      {selectedDoctor.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <FiAward className="text-purple-600" />
                      <span>{selectedDoctor.specialization || "General Physician"}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                      selectedDoctor.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedDoctor.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <FaPhoneAlt className="text-gray-400 text-[10px]" />
                      {selectedDoctor.phone || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Email</div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                      <FaEnvelope className="text-gray-400 text-[10px]" />
                      {selectedDoctor.email || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Qualification</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">
                      {selectedDoctor.qualification || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Experience</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">
                      {selectedDoctor.experience ? `${selectedDoctor.experience} years` : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Address</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-start gap-1">
                    <FaMapMarkerAlt className="text-gray-400 text-[11px] mt-0.5 flex-shrink-0" />
                    <span>{selectedDoctor.address || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Consultation Fee</div>
                    <div className="text-sm font-extrabold text-blue-900 mt-0.5">
                      ₹{selectedDoctor.consultationFee || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Joined Date</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5">
                      {formatDate(selectedDoctor.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Available Days</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDoctor.availableDays && selectedDoctor.availableDays.length > 0 ? (
                      selectedDoctor.availableDays.map((day, i) => (
                        <span
                          key={i}
                          className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Available Time Slot</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-center gap-1">
                    <FiClock className="text-gray-400" />
                    <span>{selectedDoctor.availableTime || "Not set"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-200 bg-blue-50/50 -mx-5 px-5 py-3 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FaKey className="text-blue-600 text-xs" />
                      <div className="text-[10px] font-bold uppercase text-gray-600">Login Password</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono font-bold text-gray-800 bg-white px-2.5 py-1 rounded-md border border-gray-300 min-w-[100px] text-center">
                        {showPasswordInModal ? selectedDoctor.password || "********" : "••••••••"}
                      </div>
                      <button
                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title={showPasswordInModal ? "Hide Password" : "Show Password"}
                      >
                        {showPasswordInModal ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-all"
                >
                  <FaPrint className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => {
                    const doc = selectedDoctor;
                    setShowDetailModal(false);
                    handleEdit(doc);
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-all"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDoctor(null);
                    setShowPasswordInModal(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}