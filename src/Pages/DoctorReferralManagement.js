// DoctorReferralManagement.js - Doctor Referrals Only

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  FaFilter,
  FaStethoscope as FaStethoscopeIcon
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
  FiGift,
  FiExternalLink
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

const API_BASE_URL = "http://localhost:5001/api/referralcontacts";
const BASE_API = "http://localhost:5001/api";

const STATUS_OPTIONS = ["active", "inactive"];

const EMPTY_FORM = {
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

const COMMISSION_FIELDS = [
  { key: "clinicCommission", label: "Clinic", icon: FaClinicMedical, color: "blue" },
  { key: "pharmacyCommission", label: "Pharmacy", icon: FaPills, color: "green" },
  { key: "labCommission", label: "Lab", icon: FaFlask, color: "purple" }
];

// ✅ SAFE ID EXTRACTION — handles both string and populated object
const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val._id) return String(val._id);
  return "";
};

const extractName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.doctorName || val.customerName || val.name || "";
  }
  return "";
};

// ✅ Service payable calculator (per-category)
const getServiceDoctorPayable = (doctor, booking) => {
  if (!doctor || !booking) return 0;

  const rawServices =
    (Array.isArray(booking.services) && booking.services.length > 0 && booking.services) ||
    (Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 && booking.serviceItems) ||
    [];

  if (!rawServices.length) return 0;

  const clinicP = parseFloat(doctor.clinicCommission) || 0;
  const pharmacyP = parseFloat(doctor.pharmacyCommission) || 0;
  const labP = parseFloat(doctor.labCommission) || 0;

  let total = 0;
  rawServices.forEach((svc) => {
    const price = Number(svc.price) || 0;
    const cat = (svc.category || svc.serviceCategory || svc.type || "clinic").toString().toLowerCase();
    let pct = clinicP;
    if (cat.includes("pharm") || cat.includes("medic")) pct = pharmacyP;
    else if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos")) pct = labP;
    else pct = clinicP;
    total += (price * pct) / 100;
  });

  return Math.round(total);
};

export default function DoctorReferralManagement() {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConnected, setApiConnected] = useState(true);
  
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
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
    const saved = localStorage.getItem("doctorReferral_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [showPartnerFilter, setShowPartnerFilter] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterResults, setFilterResults] = useState(null);

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

  const fetchBookingsData = async () => {
    try {
      // ✅ Use the getallreferralbookings endpoint (has referralContactId populated)
      const res = await axios.get(`${BASE_API}/appointment-slots/getallreferralbookings`);
      if (res.data && res.data.success) {
        const bookingsData = res.data.bookings || [];
        setBookings(bookingsData);
        return bookingsData;
      }
      // Fallback to old endpoint
      const res2 = await axios.get(`${BASE_API}/appointment-slots/getallbookings`);
      if (res2.data && res2.data.success) {
        const bookingsData = res2.data.bookings || res2.data.data || [];
        const transformed = bookingsData.map((b) => {
          const slotDetails = b.slotDetails || {};
          return {
            _id: b._id || b.id,
            referralContactId: b.referralContactId || "",
            referralDoctorId: b.referralDoctorId || "",
            referralCustomerId: b.referralCustomerId || "",
            referredByDoctor: b.referredByDoctor || "",
            referredBy: b.referredBy || "",
            patientName: b.patientName || "",
            patientPhone: b.patientPhone || "",
            date: slotDetails.date || b.appointmentDate || b.date || "",
            doctorName: slotDetails.doctorName || b.doctorName || "",
            consultationFee: b.consultationFee || 0,
            commissionAmount: b.commissionAmount || 0,
            finalPayable: b.finalPayable || b.totalAmount || 0,
            paymentStatus: b.paymentStatus || "Pending",
            status: b.status || "confirmed",
            services: b.services || [],
            serviceItems: b.serviceItems || [],
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

  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    setApiConnected(true);
    
    try {
      await fetchBookingsData();
      
      const res = await axios.get(`${API_BASE_URL}/getallreferralcontacts`);
      
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
      
      const doctorReferrals = referralsData.filter(r => r.referralType === "doctor");
      
      if (doctorReferrals.length === 0) {
        setApiConnected(false);
        setReferrals([]);
        showToast("No doctor referrals found.", "info");
      } else {
        setReferrals(doctorReferrals);
        showToast(`Loaded ${doctorReferrals.length} doctor referrals!`, "success");
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

  // ✅ FIXED — Match bookings to referral using safe ID extraction + name fallback
  const getReferralMetrics = (referral) => {
    if (!referral) {
      return { opCount: 0, revenue: 0, patientCount: 0, lastVisit: null, bookingIds: [], bookings: [] };
    }

    const refId = String(referral._id || "");
    const refName = (referral.doctorName || "").trim().toLowerCase();

    const matchedBookings = bookings.filter((b) => {
      const cId = extractId(b.referralContactId);
      const dId = extractId(b.referralDoctorId);
      const cuId = extractId(b.referralCustomerId);

      if (cId && cId === refId) return true;
      if (dId && dId === refId) return true;
      if (cuId && cuId === refId) return true;

      // Fallback: match by name
      const refDoctorName = (extractName(b.referralDoctorId) || b.referredByDoctor || "").trim().toLowerCase();
      const refCustomerName = (extractName(b.referralCustomerId) || b.referredByCustomer || "").trim().toLowerCase();
      const referredBy = (b.referredBy || "").trim().toLowerCase();

      if (refName && (refDoctorName === refName || refCustomerName === refName || referredBy === refName)) {
        return true;
      }
      return false;
    });
    
    const opCount = matchedBookings.filter((b) => b.isOP === true).length;

    // ✅ Revenue = sum of per-service doctor payable (using doctor's commission %)
    const revenue = matchedBookings.reduce((sum, b) => {
      return sum + getServiceDoctorPayable(referral, b);
    }, 0);
    
    const patientCount = new Set(matchedBookings.map((b) => b.patientName)).size;
    
    return {
      opCount,
      revenue,
      patientCount,
      lastVisit: matchedBookings.length > 0 
        ? matchedBookings.reduce((latest, b) => {
            const d = new Date(b.createdAt || b.bookedAt);
            return d > latest ? d : latest;
          }, new Date(0))
        : null,
      bookingIds: matchedBookings.map((b) => b._id),
      bookings: matchedBookings
    };
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "clinicCommission" || name === "pharmacyCommission" || name === "labCommission") {
      const clinic = parseFloat(name === "clinicCommission" ? value : formData.clinicCommission) || 0;
      const pharmacy = parseFloat(name === "pharmacyCommission" ? value : formData.pharmacyCommission) || 0;
      const lab = parseFloat(name === "labCommission" ? value : formData.labCommission) || 0;
      setFormData((prev) => ({
        ...prev,
        totalCommission: (clinic + pharmacy + lab).toString()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorName || !formData.doctorOrganization) {
      showToast("Please fill in Doctor Name and Organization", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        ...formData,
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
      setFormData({ ...EMPTY_FORM });
      setEditingId(null);
      setEditingType(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving doctor referral:", err);
      showToast(err.response?.data?.message || "Failed to save doctor referral", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (referral) => {
    setFormData({
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
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor referral record?")) return;
    try {
      await deleteReferral(id);
      setReferrals((prev) => prev.filter((r) => r._id !== id));
      showToast("Doctor referral deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast(err.response?.data?.message || "Failed to delete referral", "error");
    }
  };

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

  const cancelForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setEditingType(null);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setMonthFilter("");
    setActiveCardFilter("all");
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      setShowMobileFilters(false);
    }
  };

  const hasActiveFilters = searchQuery || statusFilter !== "All" || monthFilter !== "";

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

  const filteredReferrals = useMemo(() => {
    const filtered = referrals.filter((r) => {
      if (monthFilter && monthFilter !== "") {
        const createdAt = new Date(r.createdAt);
        const referralMonth = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (referralMonth !== monthFilter) return false;
      }

      if (statusFilter !== "All" && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (r.doctorName || "").toLowerCase().includes(q);
        const phone = (r.doctorPhone || "").toLowerCase().includes(q);
        const org = (r.doctorOrganization || "").toLowerCase().includes(q);
        const spec = (r.doctorSpecialization || "").toLowerCase().includes(q);
        if (!name && !phone && !org && !spec) return false;
      }
      return true;
    });
    return filtered;
  }, [referrals, statusFilter, searchQuery, monthFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const total = referrals.length;
    const active = referrals.filter((r) => r.status === "active").length;
    const inactive = referrals.filter((r) => r.status === "inactive").length;
    
    let totalOps = 0;
    let totalRevenue = 0;
    referrals.forEach(r => {
      const metrics = getReferralMetrics(r);
      totalOps += metrics.opCount;
      totalRevenue += metrics.revenue;
    });
    
    return { total, active, inactive, totalOps, totalRevenue };
  }, [referrals, bookings]);

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

  const downloadCSV = () => {
    if (filteredReferrals.length === 0) {
      alert("No doctor referral records available to download!");
      return;
    }

    const headers = [
      "Sl No", "Referral ID", "Name", "Organization", "Phone", "Specialization",
      "Clinic Commission (%)", "Pharmacy Commission (%)", 
      "Lab Commission (%)", "Total Commission (%)", "Status", "Date",
      "No. of OPs", "Revenue (₹)"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredReferrals.map((r, idx) => {
        const metrics = getReferralMetrics(r);
        return [
          idx + 1,
          `"${r._id}"`,
          `"${(r.doctorName || "").replace(/"/g, '""')}"`,
          `"${(r.doctorOrganization || "").replace(/"/g, '""')}"`,
          `"${r.doctorPhone || ""}"`,
          `"${(r.doctorSpecialization || "").replace(/"/g, '""')}"`,
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
    a.download = `doctor_referral_records_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredReferrals.length} doctor referral records to CSV!`);
  };

  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReferrals = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("doctorReferral_itemsPerPage", String(newValue));
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

  if (loading) {
    return (
      <div className="emp-dash">
        <div className="emp-dash__loading">
          <div className="emp-dash__spinner" />
          <p className="emp-dash__loading-text">Loading doctor referrals...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER ============
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
            toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
          }`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Doctor <span>Referrals</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill flex-shrink-0">
              <FaUserMd />
              <span>{referrals.length} Doctors</span>
            </div>
            
            <div className="relative min-w-[150px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search Name, Org..."
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

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
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

            {/* Doctor Referred OP Button */}
            <button
              onClick={() => navigate("/doctorreffredop")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
              title="View Doctor Referred OP Bookings"
            >
              <FaStethoscopeIcon className="w-3.5 h-3.5" />
              <span>Doctor Referred OP</span>
            </button>

            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowForm(true);
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
              Doctor <span className="text-purple-600">Referrals</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaUserMd className="text-[10px]" />
              <span>{referrals.length} Doctors</span>
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
              onClick={() => navigate("/doctorreffredop")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaStethoscopeIcon className="w-3.5 h-3.5" />
              <span>Referred OP</span>
            </button>
            
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM });
                setEditingId(null);
                setEditingType(null);
                setShowForm(true);
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

        {/* Stats Cards */}
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
            <div className="emp-dash__stat-meta">all doctor referrals</div>
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
              <span className="emp-dash__stat-label">Total OPs</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaUsers className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-600">{stats.totalOps}</div>
            <div className="emp-dash__stat-meta">total OP visits</div>
          </div>

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

        {/* Main Table */}
        <div className="emp-dash__card">
          {referrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">
                <FaUserMd className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No doctor referrals found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                Click "Add Doctor" to create a new doctor referral.
              </p>
              <button
                onClick={() => {
                  setFormData({ ...EMPTY_FORM });
                  setEditingId(null);
                  setEditingType(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all shadow-sm inline-flex items-center gap-1.5"
              >
                <FaUserMd className="w-3.5 h-3.5" /> Add Doctor
              </button>
            </div>
          ) : filteredReferrals.length === 0 && !loading ? (
            <div className="emp-dash__card-body py-12 text-center text-gray-500">
              <div className="mb-3 text-4xl text-gray-300">
                <FaUserMd className="w-12 h-12 text-gray-300 mx-auto" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">No matching records found</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                No doctor referrals matching your current filter criteria.
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
                      <th>Doctor</th>
                      <th>Organization</th>
                      <th>Phone</th>
                      <th>Specialization</th>
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
                              <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                                {referral.doctorName ? referral.doctorName.charAt(0).toUpperCase() : "D"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate">
                                  {referral.doctorName || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <FaBuilding className="text-gray-400 text-[11px]" />
                              <span className="truncate max-w-[150px]">{referral.doctorOrganization || "N/A"}</span>
                            </div>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700">{referral.doctorPhone || "N/A"}</span>
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                              <FiAward className="text-gray-400 text-[11px]" />
                              {referral.doctorSpecialization || "General"}
                            </span>
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

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                              <FaUsers className="text-[10px]" />
                              {metrics.opCount}
                            </span>
                          </td>

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

        {/* ===== ADD/EDIT DOCTOR FORM MODAL ===== */}
        {showForm && (
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
                      Doctor Name <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <FaUserMd className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
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
                        value={formData.doctorOrganization}
                        onChange={handleInputChange}
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
                        value={formData.doctorPhone}
                        onChange={handleInputChange}
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
                        value={formData.doctorSpecialization}
                        onChange={handleInputChange}
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
                              value={formData[field.key]}
                              onChange={handleInputChange}
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
                  {(formData.clinicCommission || formData.pharmacyCommission || formData.labCommission) && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                          <FiPercent className="w-3.5 h-3.5" />
                          Total Commission
                        </span>
                        <span className="text-base font-extrabold text-blue-900">
                          {formData.totalCommission || 0}%
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
                        value={formData.referralDate}
                        onChange={handleInputChange}
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
                      value={formData.status}
                      onChange={handleInputChange}
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
                    value={formData.referralNotes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Add any additional notes..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium resize-none"
                  />
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

        {/* ===== DETAIL MODAL ===== */}
        {showDetailModal && selectedReferral && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <FaShareAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Doctor Referral Details</h3>
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
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getTypeBadgeColor("doctor")}`}>
                    <FaUserMd className="text-[11px]" />
                    Doctor
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${getStatusBadgeColor(selectedReferral.status)}`}
                  >
                    {selectedReferral.status}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-purple-500 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                    {selectedReferral.doctorName?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-gray-900 truncate">
                      {selectedReferral.doctorName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <FaBuilding className="text-gray-400 text-[10px]" />
                      <span>{selectedReferral.doctorOrganization || "N/A"}</span>
                      <span className="text-gray-300">|</span>
                      <FaPhoneAlt className="text-gray-400 text-[10px]" />
                      <span>{selectedReferral.doctorPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Specialization</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-center gap-1">
                    <FiAward className="text-gray-400 text-[11px]" />
                    {selectedReferral.doctorSpecialization || "General"}
                  </div>
                </div>

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