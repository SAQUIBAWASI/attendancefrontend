// ReferralManagement.js - Complete component integrated with backend API

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
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
  FaAward,
  FaUser,
  FaHospital,
  FaBuilding,
  FaFlask,
  FaPills,
  FaClinicMedical,
  FaShareAlt,
  FaUsers,
  FaChartPie,
  FaPercent,
  FaDatabase,
  FaUserPlus,
  FaUserCheck,
  FaGift,
  FaMoneyBillWave,
  FaHandshake,
  FaFilter
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
  FiCheck,
  FiUser,
  FiUserPlus,
  FiUserMinus,
  FiDollarSign,
  FiPercent,
  FiFileText,
  FiActivity,
  FiGift
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// API Base URL
const API_BASE_URL = "http://localhost:5001/api/referralcontacts";

// Referral Types
const REFERRAL_TYPES = {
  CUSTOMER: "customer",
  DOCTOR: "doctor"
};

// Status Options
const STATUS_OPTIONS = ["active", "inactive"];

// ============ EMPTY FORM ============
const EMPTY_CUSTOMER_FORM = {
  referralType: "customer",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  clinicCommission: "",
  pharmacyCommission: "",
  labCommission: "",
  totalCommission: "",
  referralDate: "",
  referralNotes: "",
  status: "active"
};

const EMPTY_DOCTOR_FORM = {
  referralType: "doctor",
  doctorName: "",
  doctorOrganization: "",
  doctorPhone: "",
  doctorSpecialization: "",
  clinicCommission: "",
  pharmacyCommission: "",
  labCommission: "",
  totalCommission: "",
  referralDate: "",
  referralNotes: "",
  status: "active"
};

// Commission Fields
const COMMISSION_FIELDS = [
  { key: "clinicCommission", label: "Clinic", icon: FaClinicMedical, color: "blue" },
  { key: "pharmacyCommission", label: "Pharmacy", icon: FaPills, color: "green" },
  { key: "labCommission", label: "Lab", icon: FaFlask, color: "purple" }
];

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConnected, setApiConnected] = useState(true);
  
  // Form states - separate for customer and doctor
  const [customerFormData, setCustomerFormData] = useState({ ...EMPTY_CUSTOMER_FORM });
  const [doctorFormData, setDoctorFormData] = useState({ ...EMPTY_DOCTOR_FORM });
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [referralTypeFilter, setReferralTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const [activeCardFilter, setActiveCardFilter] = useState("all");

  const [toast, setToast] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("referralMgmt_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  // ===== PARTNER FILTER POPUP STATES =====
  const [showPartnerFilter, setShowPartnerFilter] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterResults, setFilterResults] = useState(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setShowTypeDropdown(false);
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

  // ============ FETCH BOOKINGS ============
  const fetchBookingsData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL.replace("/referralcontacts", "")}/appointment-slots/getallbookings`);
      if (res.data && res.data.success) {
        const bookingsData = res.data.bookings || res.data.data || [];
        const transformed = bookingsData.map((b) => {
          const slotDetails = b.slotDetails || {};
          return {
            _id: b._id || b.id,
            referralContactId: b.referralContactId || "",
            patientName: b.patientName || "",
            patientPhone: b.patientPhone || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            consultationFee: b.consultationFee || 0,
            commissionAmount: b.commissionAmount || 0,
            paymentStatus: b.paymentStatus || "Pending",
            status: b.status || "confirmed",
            services: b.services || [],
            isOP: b.isOP === true,
            createdAt: b.createdAt || b.bookedAt || new Date().toISOString()
          };
        });
        setBookings(transformed);
        return transformed;
      }
      setBookings([]);
      return [];
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      return [];
    }
  };

  // ============ FETCH REFERRALS FROM API ============
  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    setApiConnected(true);
    
    try {
      // Fetch bookings first
      await fetchBookingsData();
      
      const res = await axios.get(`${API_BASE_URL}/getallreferralcontacts`);
      console.log("=== API RESPONSE ===", res);
      
      let referralsData = [];
      
      if (res.data && res.data.success) {
        if (res.data.data && Array.isArray(res.data.data)) {
          referralsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          referralsData = res.data;
        }
      } else if (Array.isArray(res.data)) {
        referralsData = res.data;
      }
      
      if (referralsData.length === 0) {
        setApiConnected(false);
        setReferrals([]);
        showToast("No data found in database. Please add some records.", "info");
      } else {
        setReferrals(referralsData);
        showToast(`Loaded ${referralsData.length} referrals from server!`, "success");
      }
      
    } catch (err) {
      console.error("=== ERROR FETCHING REFERRALS ===", err);
      setApiConnected(false);
      setReferrals([]);
      setError(err.response?.data?.message || "Failed to fetch referral records");
      showToast(err.response?.data?.message || "Failed to fetch referral records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // ============ GET REFERRAL METRICS (OPs & Revenue via referralContactId) ============
  const getReferralMetrics = (referral) => {
    // Match by referralContactId
    const matchedBookings = bookings.filter(b => 
      b.referralContactId === referral._id
    );
    
    // Count only OP bookings (isOP === true)
    const opCount = matchedBookings.filter(b => b.isOP === true).length;
    
    // Revenue = sum of commissionAmount from all bookings
    const revenue = matchedBookings.reduce((sum, b) => {
      return sum + (b.commissionAmount || 0);
    }, 0);
    
    // Additional metrics
    const patientCount = new Set(matchedBookings.map(b => b.patientName)).size;
    
    return {
      opCount,
      revenue,
      patientCount,
      lastVisit: matchedBookings.length > 0 
        ? matchedBookings.reduce((latest, b) => {
            const d = new Date(b.createdAt || b.bookedAt || b.createdAt);
            return d > latest ? d : latest;
          }, new Date(0))
        : null,
      bookingIds: matchedBookings.map(b => b._id),
      bookings: matchedBookings
    };
  };

  // ============ PARTNER FILTER LOGIC ============
  const filteredPartners = useMemo(() => {
    if (!partnerSearch.trim()) return referrals;
    const q = partnerSearch.toLowerCase();
    return referrals.filter(r => {
      const name = r.customerName || r.doctorName || "";
      const phone = r.customerPhone || r.doctorPhone || "";
      return name.toLowerCase().includes(q) || phone.includes(q);
    });
  }, [referrals, partnerSearch]);

  const applyPartnerFilter = () => {
    if (!selectedPartner) {
      showToast("Please select a partner first", "error");
      return;
    }

    const metrics = getReferralMetrics(selectedPartner);
    let filteredBookings = metrics.bookings || [];

    // Apply date range filter
    if (filterFromDate || filterToDate) {
      filteredBookings = filteredBookings.filter(b => {
        const date = new Date(b.createdAt);
        if (filterFromDate) {
          const from = new Date(filterFromDate);
          from.setHours(0, 0, 0, 0);
          if (date < from) return false;
        }
        if (filterToDate) {
          const to = new Date(filterToDate);
          to.setHours(23, 59, 59, 999);
          if (date > to) return false;
        }
        return true;
      });
    }

    // Apply month filter
    if (filterMonth) {
      filteredBookings = filteredBookings.filter(b => {
        const date = new Date(b.createdAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return month === filterMonth;
      });
    }

    // Calculate filtered metrics
    const opCount = filteredBookings.filter(b => b.isOP === true).length;
    const revenue = filteredBookings.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const totalBookings = filteredBookings.length;

    setFilterResults({
      partner: selectedPartner,
      bookings: filteredBookings,
      opCount,
      revenue,
      totalBookings,
      fromDate: filterFromDate,
      toDate: filterToDate,
      month: filterMonth
    });
  };

  const resetPartnerFilter = () => {
    setPartnerSearch("");
    setSelectedPartner(null);
    setFilterFromDate("");
    setFilterToDate("");
    setFilterMonth("");
    setFilterResults(null);
  };

  const closePartnerFilter = () => {
    setShowPartnerFilter(false);
    resetPartnerFilter();
  };

  // ============ API CALLS ============
  const addReferral = async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/addreferralcontact`, payload);
    return res;
  };

  const updateReferral = async (id, payload) => {
    const res = await axios.put(`${API_BASE_URL}/updatereferralcontact/${id}`, payload);
    return res;
  };

  const deleteReferral = async (id) => {
    const res = await axios.delete(`${API_BASE_URL}/deletereferralcontact/${id}`);
    return res;
  };

  // ============ CUSTOMER FORM HANDLERS ============
  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate total commission
    if (name === "clinicCommission" || name === "pharmacyCommission" || name === "labCommission") {
      const clinic = parseFloat(name === "clinicCommission" ? value : customerFormData.clinicCommission) || 0;
      const pharmacy = parseFloat(name === "pharmacyCommission" ? value : customerFormData.pharmacyCommission) || 0;
      const lab = parseFloat(name === "labCommission" ? value : customerFormData.labCommission) || 0;
      setCustomerFormData((prev) => ({
        ...prev,
        totalCommission: (clinic + pharmacy + lab).toString()
      }));
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerFormData.customerName || !customerFormData.customerPhone) {
      showToast("Please fill in Customer Name and Phone", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        ...customerFormData,
        referralType: "customer"
      };
      
      if (editingId) {
        const res = await updateReferral(editingId, payload);
        if (res.data.success) {
          const updatedData = res.data.data || { _id: editingId, ...payload };
          setReferrals((prev) =>
            prev.map((r) => (r._id === editingId ? { ...r, ...updatedData } : r))
          );
          showToast("Customer referral updated successfully!");
        }
      } else {
        const res = await addReferral(payload);
        if (res.data.success) {
          const newData = res.data.data || { _id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
          setReferrals((prev) => [newData, ...prev]);
          showToast("Customer referral added successfully!");
        }
      }
      setCustomerFormData({ ...EMPTY_CUSTOMER_FORM });
      setEditingId(null);
      setEditingType(null);
      setShowCustomerForm(false);
    } catch (err) {
      console.error("Error saving customer referral:", err);
      showToast(err.response?.data?.message || "Failed to save customer referral", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ DOCTOR FORM HANDLERS ============
  const handleDoctorInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate total commission
    if (name === "clinicCommission" || name === "pharmacyCommission" || name === "labCommission") {
      const clinic = parseFloat(name === "clinicCommission" ? value : doctorFormData.clinicCommission) || 0;
      const pharmacy = parseFloat(name === "pharmacyCommission" ? value : doctorFormData.pharmacyCommission) || 0;
      const lab = parseFloat(name === "labCommission" ? value : doctorFormData.labCommission) || 0;
      setDoctorFormData((prev) => ({
        ...prev,
        totalCommission: (clinic + pharmacy + lab).toString()
      }));
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    
    if (!doctorFormData.doctorName || !doctorFormData.doctorOrganization) {
      showToast("Please fill in Doctor Name and Organization", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        ...doctorFormData,
        referralType: "doctor"
      };
      
      if (editingId) {
        const res = await updateReferral(editingId, payload);
        if (res.data.success) {
          const updatedData = res.data.data || { _id: editingId, ...payload };
          setReferrals((prev) =>
            prev.map((r) => (r._id === editingId ? { ...r, ...updatedData } : r))
          );
          showToast("Doctor referral updated successfully!");
        }
      } else {
        const res = await addReferral(payload);
        if (res.data.success) {
          const newData = res.data.data || { _id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
          setReferrals((prev) => [newData, ...prev]);
          showToast("Doctor referral added successfully!");
        }
      }
      setDoctorFormData({ ...EMPTY_DOCTOR_FORM });
      setEditingId(null);
      setEditingType(null);
      setShowDoctorForm(false);
    } catch (err) {
      console.error("Error saving doctor referral:", err);
      showToast(err.response?.data?.message || "Failed to save doctor referral", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ EDIT HANDLER ============
  const handleEdit = (referral) => {
    if (referral.referralType === "customer") {
      setCustomerFormData({
        referralType: "customer",
        customerName: referral.customerName || "",
        customerPhone: referral.customerPhone || "",
        customerAddress: referral.customerAddress || "",
        clinicCommission: referral.clinicCommission || "",
        pharmacyCommission: referral.pharmacyCommission || "",
        labCommission: referral.labCommission || "",
        totalCommission: referral.totalCommission || "",
        referralDate: referral.referralDate || "",
        referralNotes: referral.referralNotes || "",
        status: referral.status || "active"
      });
      setEditingId(referral._id);
      setEditingType("customer");
      setShowCustomerForm(true);
    } else {
      setDoctorFormData({
        referralType: "doctor",
        doctorName: referral.doctorName || "",
        doctorOrganization: referral.doctorOrganization || "",
        doctorPhone: referral.doctorPhone || "",
        doctorSpecialization: referral.doctorSpecialization || "",
        clinicCommission: referral.clinicCommission || "",
        pharmacyCommission: referral.pharmacyCommission || "",
        labCommission: referral.labCommission || "",
        totalCommission: referral.totalCommission || "",
        referralDate: referral.referralDate || "",
        referralNotes: referral.referralNotes || "",
        status: referral.status || "active"
      });
      setEditingId(referral._id);
      setEditingType("doctor");
      setShowDoctorForm(true);
    }
  };

  // ============ DELETE HANDLER ============
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this referral record?")) return;
    try {
      await deleteReferral(id);
      setReferrals((prev) => prev.filter((r) => r._id !== id));
      showToast("Referral deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast(err.response?.data?.message || "Failed to delete referral", "error");
    }
  };

  // ============ STATUS CHANGE HANDLER ============
  const handleStatusChange = async (referral, newStatus) => {
    try {
      const res = await updateReferral(referral._id, { status: newStatus });
      if (res.data.success) {
        setReferrals((prev) =>
          prev.map((r) => (r._id === referral._id ? { ...r, status: newStatus } : r))
        );
        if (selectedReferral && selectedReferral._id === referral._id) {
          setSelectedReferral((prev) => ({ ...prev, status: newStatus }));
        }
        showToast(`Referral status updated to '${newStatus}'`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  // ============ CANCEL FORM ============
  const cancelCustomerForm = () => {
    setCustomerFormData({ ...EMPTY_CUSTOMER_FORM });
    setEditingId(null);
    setEditingType(null);
    setShowCustomerForm(false);
  };

  const cancelDoctorForm = () => {
    setDoctorFormData({ ...EMPTY_DOCTOR_FORM });
    setEditingId(null);
    setEditingType(null);
    setShowDoctorForm(false);
  };

  // ============ FILTERS ============
  const clearFilters = () => {
    setSearchQuery("");
    setReferralTypeFilter("All");
    setStatusFilter("All");
    setMonthFilter("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      setShowMobileFilters(false);
    }
  };

  const hasActiveFilters = searchQuery || referralTypeFilter !== "All" || statusFilter !== "All" || monthFilter !== "";

  const getTypeLabel = () => {
    if (referralTypeFilter === "All") return "Type";
    return referralTypeFilter === "customer" ? "Customer" : "Doctor";
  };

  const getStatusLabel = () => {
    if (statusFilter === "All") return "Status";
    return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  };

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") {
      setStatusFilter("All");
    } else {
      setStatusFilter(type);
    }
  };

  // ============ FILTER LOGIC ============
  const filteredReferrals = useMemo(() => {
    const filtered = referrals.filter((r) => {
      if (monthFilter && monthFilter !== "") {
        const createdAt = new Date(r.createdAt);
        const referralMonth = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (referralMonth !== monthFilter) return false;
      }

      if (referralTypeFilter !== "All" && r.referralType !== referralTypeFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = r.referralType === "customer" ? r.customerName : r.doctorName;
        const phone = r.referralType === "customer" ? r.customerPhone : r.doctorPhone;
        const org = r.referralType === "customer" ? r.customerAddress : r.doctorOrganization;
        if (!(name || "").toLowerCase().includes(q) && 
            !(phone || "").toLowerCase().includes(q) && 
            !(org || "").toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
    return filtered;
  }, [referrals, referralTypeFilter, statusFilter, searchQuery, monthFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, referralTypeFilter, statusFilter, monthFilter]);

  // ============ STATS ============
  const stats = useMemo(() => {
    const total = referrals.length;
    const active = referrals.filter((r) => r.status === "active").length;
    const inactive = referrals.filter((r) => r.status === "inactive").length;
    const customerReferrals = referrals.filter((r) => r.referralType === "customer").length;
    const doctorReferrals = referrals.filter((r) => r.referralType === "doctor").length;
    
    // Calculate total OPs and Revenue from all referrals
    let totalOps = 0;
    let totalRevenue = 0;
    referrals.forEach(r => {
      const metrics = getReferralMetrics(r);
      totalOps += metrics.opCount;
      totalRevenue += metrics.revenue;
    });
    
    return { total, active, inactive, customerReferrals, doctorReferrals, totalOps, totalRevenue };
  }, [referrals, bookings]);

  // ============ UTILITY FUNCTIONS ============
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

  const getStatusBadgeColor = (status) => {
    return status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const getTypeBadgeColor = (type) => {
    return type === "customer"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-purple-50 text-purple-700 border-purple-200";
  };

  // ============ DOWNLOAD CSV ============
  const downloadCSV = () => {
    if (filteredReferrals.length === 0) {
      alert("No referral records available to download!");
      return;
    }

    const headers = [
      "Sl No", "Referral ID", "Type", "Name", "Organization/Address", "Phone",
      "Clinic Commission (%)", "Pharmacy Commission (%)", 
      "Lab Commission (%)", "Total Commission (%)", "Status", "Date",
      "No. of OPs", "Revenue (₹)"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredReferrals.map((r, idx) => {
        const name = r.referralType === "customer" ? r.customerName : r.doctorName;
        const org = r.referralType === "customer" ? r.customerAddress : r.doctorOrganization;
        const phone = r.referralType === "customer" ? r.customerPhone : r.doctorPhone;
        const metrics = getReferralMetrics(r);
        return [
          idx + 1,
          `"${r._id}"`,
          `"${r.referralType || "customer"}"`,
          `"${(name || "").replace(/"/g, '""')}"`,
          `"${(org || "").replace(/"/g, '""')}"`,
          `"${phone || ""}"`,
          r.clinicCommission || 0,
          r.pharmacyCommission || 0,
          r.labCommission || 0,
          r.totalCommission || 0,
          `"${r.status || "active"}"`,
          `"${formatDate(r.createdAt)}"`,
          metrics.opCount,
          metrics.revenue
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral_records_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredReferrals.length} referral records to CSV!`);
  };

  // ============ PAGINATION ============
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReferrals = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("referralMgmt_itemsPerPage", String(newValue));
    setCurrentPage(1);
  };

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

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading referral contacts...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {/* Toast Notification */}
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

        {/* API Connection Status Banner */}
        {!apiConnected && referrals.length === 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FiXCircle className="text-red-600 text-xl" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-red-800">Connection Error</span>
              <span className="text-xs text-red-700 ml-2">
                Could not connect to server. Please check your backend server.
              </span>
            </div>
            <button
              onClick={fetchReferrals}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <FiRefreshCw className="inline mr-1 w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {!apiConnected && referrals.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <FaDatabase className="text-amber-600 text-xl" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-amber-800">Data Mode</span>
              <span className="text-xs text-amber-700 ml-2">
                Showing cached data. Server connection may be unavailable.
              </span>
            </div>
            <button
              onClick={fetchReferrals}
              className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <FiRefreshCw className="inline mr-1 w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Referral <span>Contacts</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill flex-shrink-0">
              <FaShareAlt />
              <span>{referrals.length} Total Referrals</span>
            </div>
            
            <div className="relative min-w-[150px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[180px] pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              title="Filter by month"
            />

            {/* Type Filter */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowStatusDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  referralTypeFilter !== "All"
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaUsers className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[80px]">{getTypeLabel()}</span>
                <span className="text-gray-400 text-[10px]">▾</span>
              </button>
              {showTypeDropdown && (
                <div
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl min-w-[180px]"
                  style={{
                    zIndex: 99999,
                    top: typeDropdownRef.current ? typeDropdownRef.current.getBoundingClientRect().bottom + 4 : "auto",
                    left: typeDropdownRef.current ? typeDropdownRef.current.getBoundingClientRect().left : "auto"
                  }}
                >
                  <div
                    onClick={() => {
                      setReferralTypeFilter("All");
                      setShowTypeDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs font-medium border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${
                      referralTypeFilter === "All" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-500"
                    }`}
                  >
                    All Types
                  </div>
                  <div
                    onClick={() => {
                      setReferralTypeFilter("customer");
                      setShowTypeDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      referralTypeFilter === "customer" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>Customer</span>
                    {referralTypeFilter === "customer" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                  <div
                    onClick={() => {
                      setReferralTypeFilter("doctor");
                      setShowTypeDropdown(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                      referralTypeFilter === "doctor" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span>Doctor</span>
                    {referralTypeFilter === "doctor" && <FiCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowTypeDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all bg-white whitespace-nowrap ${
                  statusFilter !== "All"
                    ? "border-blue-500 text-blue-700 ring-2 ring-blue-500/10 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiActivity className="text-gray-400 text-[10px]" />
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
                  {STATUS_OPTIONS.map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                        statusFilter === status ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      <span className="capitalize">{status}</span>
                      {statusFilter === status && <FiCheck className="w-3 h-3 text-blue-600" />}
                    </div>
                  ))}
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

            {/* Partner Filter Button */}
            <button
              onClick={() => setShowPartnerFilter(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all shadow-sm"
            >
              <FaFilter className="w-3.5 h-3.5" />
              <span>Partner Filter</span>
            </button>

            <button
              onClick={fetchReferrals}
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
                setCustomerFormData({ ...EMPTY_CUSTOMER_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowCustomerForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaUserPlus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
            <button
              onClick={() => {
                setDoctorFormData({ ...EMPTY_DOCTOR_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowDoctorForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm"
            >
              <FaUserMd className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          </div>
        </div>

        {/* Header - Mobile */}
        <div className="lg:hidden flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="text-base font-bold whitespace-nowrap">
              Referral <span className="text-indigo-600">Contacts</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaShareAlt className="text-[10px]" />
              <span>{referrals.length} Referrals</span>
            </div>
          </div>
          
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search referral..."
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
              onClick={() => setShowPartnerFilter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all shadow-sm"
            >
              <FaFilter className="w-3.5 h-3.5" />
              <span>Partner</span>
            </button>
            
            <button
              onClick={() => {
                setCustomerFormData({ ...EMPTY_CUSTOMER_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowCustomerForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaUserPlus className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                setDoctorFormData({ ...EMPTY_DOCTOR_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowDoctorForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm"
            >
              <FaUserMd className="w-3.5 h-3.5" />
              <span>Doctor</span>
            </button>
          </div>

          {showMobileFilters && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={referralTypeFilter}
                  onChange={(e) => setReferralTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="All">All Types</option>
                  <option value="customer">Customer</option>
                  <option value="doctor">Doctor</option>
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
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="capitalize">{status}</option>
                  ))}
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
                    onClick={fetchReferrals}
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

        {/* Stats Cards - UPDATED with OPs and Revenue */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""
            }`}
            onClick={() => handleCardClick("all")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Referrals</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">all referrals</div>
          </div>

          <div
            className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeCardFilter === "active" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""
            }`}
            onClick={() => handleCardClick("active")}
          >
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Active</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.active}</div>
            <div className="emp-dash__stat-meta">active referrals</div>
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
            <div className="emp-dash__stat-meta">inactive referrals</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Customer</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaUser />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-600">{stats.customerReferrals}</div>
            <div className="emp-dash__stat-meta">customer referrals</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Doctor</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaUserMd />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-600">{stats.doctorReferrals}</div>
            <div className="emp-dash__stat-meta">doctor referrals</div>
          </div>

          {/* NEW: Total OPs */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total OPs</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaUsers className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-600">{stats.totalOps}</div>
            <div className="emp-dash__stat-meta">total OP visits</div>
          </div>

          {/* NEW: Total Revenue */}
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Revenue</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="emp-dash__stat-meta">total revenue</div>
          </div>
        </div>

        {/* Main Table - UPDATED with 2 new columns */}
        <div className="emp-dash__card">
          {referrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">
                <FaShareAlt className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No referral contacts found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                Click "Add Customer" or "Add Doctor" to create a new referral contact.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCustomerFormData({ ...EMPTY_CUSTOMER_FORM });
                    setEditingId(null);
                    setEditingType(null);
                    setShowCustomerForm(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FaUserPlus className="w-3.5 h-3.5" /> Add Customer
                </button>
                <button
                  onClick={() => {
                    setDoctorFormData({ ...EMPTY_DOCTOR_FORM });
                    setEditingId(null);
                    setEditingType(null);
                    setShowDoctorForm(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <FaUserMd className="w-3.5 h-3.5" /> Add Doctor
                </button>
              </div>
            </div>
          ) : filteredReferrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">
                <FaShareAlt className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No matching records found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                There are no referral contacts matching your current filter criteria.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>S.No</th>
                      <th>Referral Contact</th>
                      <th>Type</th>
                      <th>Organization / Address</th>
                      <th style={{ textAlign: "center" }}>Clinic %</th>
                      <th style={{ textAlign: "center" }}>Pharmacy %</th>
                      <th style={{ textAlign: "center" }}>Lab %</th>
                      <th style={{ textAlign: "center" }}>Total %</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "center" }}>Date</th>
                      <th style={{ textAlign: "center" }}>No. of OPs</th>
                      <th style={{ textAlign: "center" }}>Revenue</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReferrals.map((referral, idx) => {
                      const isCustomer = referral.referralType === "customer";
                      const name = isCustomer ? referral.customerName : referral.doctorName;
                      const phone = isCustomer ? referral.customerPhone : referral.doctorPhone;
                      const org = isCustomer ? referral.customerAddress : referral.doctorOrganization;
                      const clinic = parseFloat(referral.clinicCommission) || 0;
                      const pharmacy = parseFloat(referral.pharmacyCommission) || 0;
                      const lab = parseFloat(referral.labCommission) || 0;
                      const total = parseFloat(referral.totalCommission) || 0;
                      const metrics = getReferralMetrics(referral);

                      return (
                        <tr key={referral._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-3 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${isCustomer ? 'bg-indigo-500' : 'bg-purple-500'} text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm`}>
                                {name ? name.charAt(0).toUpperCase() : isCustomer ? "C" : "D"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate">
                                  {name || "N/A"}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <FaPhoneAlt className="text-[9px]" />
                                  {phone || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadgeColor(referral.referralType)}`}>
                              {isCustomer ? <FaUser className="text-[10px]" /> : <FaUserMd className="text-[10px]" />}
                              {isCustomer ? "Customer" : "Doctor"}
                            </span>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              {isCustomer ? <FaMapMarkerAlt className="text-gray-400 text-[11px]" /> : <FaBuilding className="text-gray-400 text-[11px]" />}
                              <span className="truncate max-w-[150px]">{org || "N/A"}</span>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {clinic}%
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              {pharmacy}%
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              {lab}%
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {total}%
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeColor(referral.status)}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${referral.status === "active" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                                {referral.status}
                              </span>
                              <div className="flex items-center gap-1">
                                <select
                                  value={referral.status}
                                  onChange={(e) => handleStatusChange(referral, e.target.value)}
                                  className="text-[9px] font-medium border border-gray-200 rounded px-1.5 py-0.5 bg-white focus:outline-none"
                                >
                                  {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status} className="capitalize">{status}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="font-semibold text-slate-700 text-[11px]">
                              {formatDate(referral.createdAt)}
                            </div>
                            <div className="text-[10px] text-gray-400">{formatTime(referral.createdAt)}</div>
                          </td>

                          {/* NEW: No. of OPs column */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                              <FaUsers className="text-[10px]" />
                              {metrics.opCount}
                            </span>
                          </td>

                          {/* NEW: Revenue column (commissionAmount) */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              <FaRupeeSign className="text-[10px]" />
                              ₹{metrics.revenue.toLocaleString()}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedReferral(referral);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(referral)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="Edit Referral"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(referral._id)}
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
                    Showing{" "}
                    <strong className="text-gray-800">
                      {filteredReferrals.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredReferrals.length)}
                    </strong>{" "}
                    of <strong className="text-gray-800">{filteredReferrals.length}</strong> records
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                      onClick={() => (typeof page === "number" ? setCurrentPage(page) : null)}
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

        {/* ============================================================ */}
        {/* ============ PARTNER FILTER POPUP MODAL ============ */}
        {/* ============================================================ */}
        {showPartnerFilter && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
                    <FaFilter className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Partner Filter</h3>
                    <p className="text-xs text-gray-500">Select a partner and filter by date/month</p>
                  </div>
                </div>
                <button
                  onClick={closePartnerFilter}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* Partner Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Search Partner <span className="text-cyan-600">*</span>
                  </label>
                  <div className="relative">
                    <FaSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={partnerSearch}
                      onChange={(e) => {
                        setPartnerSearch(e.target.value);
                        setSelectedPartner(null);
                      }}
                      placeholder="Type name or phone to search..."
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                  
                  {/* Partner List Dropdown */}
                  {partnerSearch.trim() && filteredPartners.length > 0 && (
                    <div className="mt-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg shadow-lg bg-white">
                      {filteredPartners.map((partner) => {
                        const name = partner.customerName || partner.doctorName || "N/A";
                        const phone = partner.customerPhone || partner.doctorPhone || "";
                        const type = partner.referralType || "customer";
                        return (
                          <div
                            key={partner._id}
                            onClick={() => {
                              setSelectedPartner(partner);
                              setPartnerSearch("");
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-cyan-50 flex items-center justify-between ${
                              selectedPartner?._id === partner._id ? "bg-cyan-50 border-l-4 border-cyan-500" : "border-l-4 border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full ${type === "customer" ? "bg-indigo-500" : "bg-purple-500"} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-800">{name}</div>
                                <div className="text-[10px] text-gray-400">{phone}</div>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${type === "customer" ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"}`}>
                              {type === "customer" ? "Customer" : "Doctor"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {partnerSearch.trim() && filteredPartners.length === 0 && (
                    <div className="mt-1 p-3 text-center text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                      No partners found matching "{partnerSearch}"
                    </div>
                  )}

                  {/* Selected Partner Display */}
                  {selectedPartner && (
                    <div className="mt-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${selectedPartner.referralType === "customer" ? "bg-indigo-500" : "bg-purple-500"} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                          {(selectedPartner.customerName || selectedPartner.doctorName || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {selectedPartner.customerName || selectedPartner.doctorName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedPartner.customerPhone || selectedPartner.doctorPhone || "No phone"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-200 text-cyan-800">
                        {selectedPartner.referralType === "customer" ? "Customer" : "Doctor"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Date and Month Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      From Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        value={filterFromDate}
                        onChange={(e) => setFilterFromDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      To Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        value={filterToDate}
                        onChange={(e) => setFilterToDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Month / Year
                    </label>
                    <input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Apply / Reset Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={applyPartnerFilter}
                    disabled={!selectedPartner}
                    className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                      selectedPartner
                        ? "bg-cyan-600 hover:bg-cyan-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Apply Filter
                  </button>
                  <button
                    onClick={resetPartnerFilter}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Reset
                  </button>
                </div>

                {/* Filter Results */}
                {filterResults && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                      <FaChartPie className="text-cyan-600" />
                      Filter Results
                    </h4>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                        <div className="text-[9px] text-blue-600 font-bold uppercase">Total OPs</div>
                        <div className="text-lg font-extrabold text-blue-900">{filterResults.opCount}</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg text-center border border-emerald-100">
                        <div className="text-[9px] text-emerald-600 font-bold uppercase">Revenue</div>
                        <div className="text-lg font-extrabold text-emerald-900">₹{filterResults.revenue.toLocaleString()}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
                        <div className="text-[9px] text-purple-600 font-bold uppercase">Total Bookings</div>
                        <div className="text-lg font-extrabold text-purple-900">{filterResults.totalBookings}</div>
                      </div>
                    </div>

                    {/* Booking List */}
                    {filterResults.bookings.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-bold text-gray-600">Patient</th>
                              <th className="px-2 py-1.5 text-left font-bold text-gray-600">Date</th>
                              <th className="px-2 py-1.5 text-center font-bold text-gray-600">OP</th>
                              <th className="px-2 py-1.5 text-right font-bold text-gray-600">Commission</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filterResults.bookings.map((b, idx) => (
                              <tr key={b._id || idx} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-2 py-1.5 font-medium text-gray-800">{b.patientName || "N/A"}</td>
                                <td className="px-2 py-1.5 text-gray-600">{formatDate(b.createdAt)}</td>
                                <td className="px-2 py-1.5 text-center">
                                  {b.isOP ? (
                                    <span className="text-blue-600 font-bold">✓</span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-right font-bold text-emerald-600">
                                  ₹{(b.commissionAmount || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-xs">
                        No bookings found for this partner with the selected filters
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={closePartnerFilter}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ============ CUSTOMER REFERRAL FORM MODAL ============ */}
        {/* ============================================================ */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                    <FaUserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingType === "customer" ? "Edit Customer Referral" : "Add Customer Referral"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in the customer referral details</p>
                  </div>
                </div>
                <button
                  onClick={cancelCustomerForm}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Customer Name <span className="text-indigo-600">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="customerName"
                        value={customerFormData.customerName}
                        onChange={handleCustomerInputChange}
                        placeholder="John Doe"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-indigo-600">*</span>
                    </label>
                    <div className="relative">
                      <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="customerPhone"
                        value={customerFormData.customerPhone}
                        onChange={handleCustomerInputChange}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="customerAddress"
                      value={customerFormData.customerAddress}
                      onChange={handleCustomerInputChange}
                      placeholder="Customer's address"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Commission Fields */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Commission Distribution (%)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMMISSION_FIELDS.map((field) => {
                      const Icon = field.icon;
                      const colorMap = {
                        blue: "border-blue-500 focus:ring-blue-500/20 bg-blue-50/30",
                        green: "border-green-500 focus:ring-green-500/20 bg-green-50/30",
                        purple: "border-purple-500 focus:ring-purple-500/20 bg-purple-50/30"
                      };
                      return (
                        <div key={field.key}>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1 flex items-center gap-1">
                            <Icon className="text-[12px]" />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name={field.key}
                              value={customerFormData[field.key]}
                              onChange={handleCustomerInputChange}
                              placeholder="0"
                              min="0"
                              max="100"
                              className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 ${colorMap[field.color]} font-medium`}
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(customerFormData.clinicCommission || customerFormData.pharmacyCommission || customerFormData.labCommission) && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <FiPercent className="w-3.5 h-3.5" />
                          Total Commission
                        </span>
                        <span className="text-base font-extrabold text-blue-900">
                          {customerFormData.totalCommission || 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Referral Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        name="referralDate"
                        value={customerFormData.referralDate}
                        onChange={handleCustomerInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={customerFormData.status}
                      onChange={handleCustomerInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <textarea
                    name="referralNotes"
                    value={customerFormData.referralNotes}
                    onChange={handleCustomerInputChange}
                    rows="2"
                    placeholder="Add any additional notes..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelCustomerForm}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : editingType === "customer" ? (
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <FaUserPlus className="w-3.5 h-3.5" />
                    )}
                    {editingType === "customer" ? "Update Customer" : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ============ DOCTOR REFERRAL FORM MODAL ============ */}
        {/* ============================================================ */}
        {showDoctorForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                    <FaUserMd className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {editingType === "doctor" ? "Edit Doctor Referral" : "Add Doctor Referral"}
                    </h3>
                    <p className="text-xs text-gray-500">Fill in the doctor referral details</p>
                  </div>
                </div>
                <button
                  onClick={cancelDoctorForm}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDoctorSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Doctor Name <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <FaUserMd className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="doctorName"
                        value={doctorFormData.doctorName}
                        onChange={handleDoctorInputChange}
                        placeholder="Dr. Jane Smith"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Organization <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <FaBuilding className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="doctorOrganization"
                        value={doctorFormData.doctorOrganization}
                        onChange={handleDoctorInputChange}
                        placeholder="City Hospital, Clinic"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="doctorPhone"
                        value={doctorFormData.doctorPhone}
                        onChange={handleDoctorInputChange}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Specialization
                    </label>
                    <div className="relative">
                      <FiAward className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="doctorSpecialization"
                        value={doctorFormData.doctorSpecialization}
                        onChange={handleDoctorInputChange}
                        placeholder="Cardiologist, General"
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Commission Fields */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Commission Distribution (%)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMMISSION_FIELDS.map((field) => {
                      const Icon = field.icon;
                      const colorMap = {
                        blue: "border-blue-500 focus:ring-blue-500/20 bg-blue-50/30",
                        green: "border-green-500 focus:ring-green-500/20 bg-green-50/30",
                        purple: "border-purple-500 focus:ring-purple-500/20 bg-purple-50/30"
                      };
                      return (
                        <div key={field.key}>
                          <label className="block text-[10px] font-medium text-gray-500 mb-1 flex items-center gap-1">
                            <Icon className="text-[12px]" />
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name={field.key}
                              value={doctorFormData[field.key]}
                              onChange={handleDoctorInputChange}
                              placeholder="0"
                              min="0"
                              max="100"
                              className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 ${colorMap[field.color]} font-medium`}
                            />
                            <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(doctorFormData.clinicCommission || doctorFormData.pharmacyCommission || doctorFormData.labCommission) && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <FiPercent className="w-3.5 h-3.5" />
                          Total Commission
                        </span>
                        <span className="text-base font-extrabold text-blue-900">
                          {doctorFormData.totalCommission || 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Referral Date
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        name="referralDate"
                        value={doctorFormData.referralDate}
                        onChange={handleDoctorInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={doctorFormData.status}
                      onChange={handleDoctorInputChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <textarea
                    name="referralNotes"
                    value={doctorFormData.referralNotes}
                    onChange={handleDoctorInputChange}
                    rows="2"
                    placeholder="Add any additional notes..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelDoctorForm}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : editingType === "doctor" ? (
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <FaUserMd className="w-3.5 h-3.5" />
                    )}
                    {editingType === "doctor" ? "Update Doctor" : "Add Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ============ DETAIL MODAL ============ */}
        {/* ============================================================ */}
        {showDetailModal && selectedReferral && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaShareAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Referral Contact Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedReferral._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReferral(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="my-5 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getTypeBadgeColor(selectedReferral.referralType)}`}>
                    {selectedReferral.referralType === "customer" ? (
                      <FaUser className="text-[11px]" />
                    ) : (
                      <FaUserMd className="text-[11px]" />
                    )}
                    {selectedReferral.referralType === "customer" ? "Customer" : "Doctor"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getStatusBadgeColor(selectedReferral.status)}`}
                  >
                    {selectedReferral.status}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-200">
                  <div className={`w-12 h-12 rounded-full ${selectedReferral.referralType === "customer" ? 'bg-indigo-500' : 'bg-purple-500'} text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-inner`}>
                    {(selectedReferral.referralType === "customer" 
                      ? selectedReferral.customerName 
                      : selectedReferral.doctorName
                    )?.charAt(0).toUpperCase() || "R"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-gray-900 truncate">
                      {selectedReferral.referralType === "customer" 
                        ? selectedReferral.customerName 
                        : selectedReferral.doctorName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <FaPhoneAlt className="text-gray-400 text-[10px]" />
                      <span>
                        {selectedReferral.referralType === "customer" 
                          ? selectedReferral.customerPhone 
                          : selectedReferral.doctorPhone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">
                    {selectedReferral.referralType === "customer" ? "Address" : "Organization"}
                  </div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-start gap-1">
                    {selectedReferral.referralType === "customer" ? (
                      <FaMapMarkerAlt className="text-gray-400 text-[11px] mt-0.5 flex-shrink-0" />
                    ) : (
                      <FaBuilding className="text-gray-400 text-[11px] mt-0.5 flex-shrink-0" />
                    )}
                    <span>
                      {selectedReferral.referralType === "customer" 
                        ? selectedReferral.customerAddress || "N/A"
                        : selectedReferral.doctorOrganization || "N/A"}
                    </span>
                  </div>
                </div>

                {selectedReferral.referralType === "doctor" && (
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Specialization</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-center gap-1">
                      <FiAward className="text-gray-400 text-[11px]" />
                      {selectedReferral.doctorSpecialization || "General"}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Commission Distribution</div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Clinic</div>
                      <div className="text-sm font-extrabold text-blue-900">{selectedReferral.clinicCommission || 0}%</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
                      <div className="text-[9px] text-green-600 font-bold">Pharmacy</div>
                      <div className="text-sm font-extrabold text-green-900">{selectedReferral.pharmacyCommission || 0}%</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-100">
                      <div className="text-[9px] text-purple-600 font-bold">Lab</div>
                      <div className="text-sm font-extrabold text-purple-900">{selectedReferral.labCommission || 0}%</div>
                    </div>
                  </div>
                  <div className="mt-1 p-2 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <span className="text-xs font-semibold text-blue-700">Total Commission</span>
                    <span className="ml-2 text-base font-extrabold text-blue-900">
                      {selectedReferral.totalCommission || 0}%
                    </span>
                  </div>
                </div>

                {/* NEW: OP & Revenue metrics in detail modal */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">OP Metrics</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Total OPs</div>
                      <div className="text-sm font-extrabold text-blue-900">
                        {getReferralMetrics(selectedReferral).opCount}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                      <div className="text-[9px] text-emerald-600 font-bold">Revenue</div>
                      <div className="text-sm font-extrabold text-emerald-900">
                        ₹{getReferralMetrics(selectedReferral).revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReferral.referralNotes && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Notes</div>
                    <div className="text-xs font-medium text-gray-700 mt-0.5 p-2 bg-white rounded-lg border border-gray-200">
                      {selectedReferral.referralNotes}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold uppercase text-gray-400">Created</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5">
                    {formatDate(selectedReferral.createdAt)} at {formatTime(selectedReferral.createdAt)}
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
                    const ref = selectedReferral;
                    setShowDetailModal(false);
                    handleEdit(ref);
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5 transition-all"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReferral(null);
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