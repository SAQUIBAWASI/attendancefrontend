// ReferredOP.js - Complete Referred OP Management (Partner Payment Editable with Dropdown Below)

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
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCreditCard,
  FaMoneyBillWave,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaFileInvoiceDollar,
  FaUserInjured,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaEye,
  FaCheck,
  FaUserPlus,
  FaShareAlt,
  FaPercent,
  FaClinicMedical,
  FaPills,
  FaFlask,
  FaBuilding,
  FaUser,
  FaHospital,
  FaGift,
  FaChartPie,
  FaDatabase
} from "react-icons/fa";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiPercent
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";

// Utility functions
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "N/A";
  }
};

const formatDateTimeToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "N/A";
  }
};

const getPaymentStatusColors = (status) => {
  const statusMap = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FaClock, iconColor: "text-gray-500" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" }
  };
  return statusMap[status] || statusMap.Due;
};

const getStatusColors = (status) => {
  const statusMap = {
    booked: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    consulting: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  };
  return statusMap[status?.toLowerCase()] || statusMap.booked;
};

// PARTNER PAYMENT STATUS OPTIONS - EDITABLE
const PARTNER_PAYMENT_STATUS_OPTIONS = [
  { value: "Due", label: "Due" },
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" }
];

const COMMISSION_TYPE_MAP = {
  "Clinic": { icon: FaClinicMedical, color: "blue", label: "Clinic" },
  "Pharmacy": { icon: FaPills, color: "green", label: "Pharmacy" },
  "Lab": { icon: FaFlask, color: "purple", label: "Lab" }
};

export default function ReferredOP() {
  // ===== STATES =====
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [referralContacts, setReferralContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referralTypeFilter, setReferralTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showReferralDetailModal, setShowReferralDetailModal] = useState(false);
  const [selectedReferralData, setSelectedReferralData] = useState(null);
  
  // Only Partner Payment dropdown - editable
  const [openPartnerPaymentDropdown, setOpenPartnerPaymentDropdown] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("referredOP_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const patientsRes = await axios.get(`${API_BASE_URL}/patients`);
      let patientsData = [];
      if (patientsRes.data && patientsRes.data.success) {
        patientsData = patientsRes.data.data || [];
      } else if (Array.isArray(patientsRes.data)) {
        patientsData = patientsRes.data;
      }
      setPatients(patientsData);

      const bookingsRes = await axios.get(`${API_BASE_URL}/appointment-slots/getallbookings`);
      let bookingsData = [];
      if (bookingsRes.data && bookingsRes.data.success) {
        bookingsData = bookingsRes.data.bookings || bookingsRes.data.data || [];
      } else if (Array.isArray(bookingsRes.data)) {
        bookingsData = bookingsRes.data;
      }
      
      const transformedBookings = bookingsData.map((b) => ({
        _id: b._id || b.id,
        slotId: b.slotId || b._id,
        patientName: b.patientName || "",
        patientAge: b.patientAge || "",
        patientGender: b.patientGender || "Male",
        patientPhone: b.patientPhone || "",
        patientAddress: b.patientAddress || "",
        date: b.appointmentDate || b.date || "",
        startTime: b.startTime || "",
        endTime: b.endTime || "",
        doctorId: b.doctorId || "",
        doctorName: b.doctorName || "",
        doctorSpecialization: b.doctorSpecialization || "",
        purpose: b.purpose || "",
        consultationFee: b.consultationFee || 300,
        paymentType: b.paymentType || "cash",
        paymentStatus: b.paymentStatus || "Pending",
        totalAmount: b.totalAmount || b.finalPayable || b.consultationFee || 300,
        finalPayable: b.finalPayable || b.totalAmount || b.consultationFee || 300,
        amountPaid: b.amountPaid || 0,
        balanceAmount: b.balanceAmount || 0,
        status: b.status || "confirmed",
        services: b.services || [],
        createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
        appointmentDate: b.appointmentDate || b.date || "",
        referredBy: b.referredBy || "",
        referralContactId: b.referralContactId || "",
        referralCommission: b.referralCommission || "",
        referralCommissionType: b.referralCommissionType || "",
        subtotal: b.subtotal || 0,
        commissionAmount: b.commissionAmount || 0,
        partnerPaymentStatus: b.partnerPaymentStatus || "Due"
      }));
      setBookings(transformedBookings);

      const referralRes = await axios.get(`${API_BASE_URL}/referralcontacts/getallreferralcontacts`);
      let contacts = [];
      if (referralRes.data && referralRes.data.success) {
        contacts = referralRes.data.data || [];
      } else if (Array.isArray(referralRes.data)) {
        contacts = referralRes.data;
      }
      setReferralContacts(contacts);

    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".partner-payment-dropdown")) {
        setOpenPartnerPaymentDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ===== GET REFERRED PATIENTS =====
  const getReferredPatients = useMemo(() => {
    const referredPatients = patients.filter((patient) => {
      if (patient.referredBy || patient.referralContactId) {
        return true;
      }
      const hasReferralBooking = bookings.some((b) => {
        const isSamePatient = 
          b.patientPhone === patient.phone ||
          (b.patientName && patient.name && 
            b.patientName.toLowerCase() === patient.name.toLowerCase());
        return isSamePatient && (b.referredBy || b.referralContactId);
      });
      return hasReferralBooking;
    });

    return referredPatients.map((patient) => {
      const patientBookings = bookings.filter((b) => {
        return b.patientPhone === patient.phone ||
          (b.patientName && patient.name && 
            b.patientName.toLowerCase() === patient.name.toLowerCase());
      });

      const referralBooking = patientBookings.find((b) => b.referredBy || b.referralContactId) || patientBookings[0];

      const referralContact = referralContacts.find(
        (c) => c._id === (referralBooking?.referralContactId || patient.referralContactId)
      );

      // ===== DIRECTLY USING FIELDS FROM BACKEND =====
      const subtotal = referralBooking?.subtotal || 0;
      const finalPayable = referralBooking?.finalPayable || 0;
      const commissionPercent = parseFloat(referralBooking?.referralCommission) || 0;
      const commissionAmount = referralBooking?.commissionAmount || 0;
      const commissionType = referralBooking?.referralCommissionType || "Total";

      const isPartnerPaid = referralBooking?.partnerPaymentStatus === "Paid";

      const patientPaymentStatus = referralBooking?.paymentStatus || patient.paymentStatus || "Pending";
      const patientAmountPaid = referralBooking?.amountPaid || patient.amountPaid || 0;

      return {
        patient,
        bookings: patientBookings,
        referralBooking,
        referralContact,
        subtotal,
        finalPayable,
        commissionPercent,
        commissionAmount, // Direct from backend
        isPartnerPaid,
        patientPaymentStatus,
        patientAmountPaid,
        partnerPaymentStatus: referralBooking?.partnerPaymentStatus || "Due",
        commissionType,
        referralName: referralBooking?.referredBy || patient.referredBy || "N/A",
        referralType: referralContact?.referralType || "customer",
        referralContactName: referralContact ? 
          (referralContact.referralType === "customer" ? referralContact.customerName : referralContact.doctorName) : 
          "N/A"
      };
    });
  }, [patients, bookings, referralContacts]);

  // ===== FILTER LOGIC =====
  const filteredReferredPatients = useMemo(() => {
    return getReferredPatients.filter((item) => {
      const { patient, referralBooking, referralContact } = item;
      
      if (statusFilter !== "All") {
        const paymentStatus = referralBooking?.partnerPaymentStatus || "Due";
        if (paymentStatus !== statusFilter) return false;
      }

      if (referralTypeFilter !== "All") {
        const refType = referralContact?.referralType || "customer";
        if (refType !== referralTypeFilter) return false;
      }

      if (selectedMonth && selectedMonth !== "") {
        const recordDate = new Date(patient.createdAt);
        const recordMonth = recordDate.toISOString().slice(0, 7);
        if (recordMonth !== selectedMonth) return false;
      }

      if (patient.createdAt) {
        const recordDate = new Date(patient.createdAt);
        if (fromDate && toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        } else if (fromDate && !toDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          const to = new Date(fromDate);
          to.setHours(23, 59, 59, 999);
          if (recordDate < from || recordDate > to) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (patient.name || "").toLowerCase().includes(q);
        const matchPhone = (patient.phone || "").toLowerCase().includes(q);
        const matchReferral = (item.referralName || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchReferral) return false;
      }

      return true;
    });
  }, [getReferredPatients, statusFilter, referralTypeFilter, searchQuery, fromDate, toDate, selectedMonth]);

  // ===== STATS =====
  const stats = useMemo(() => {
    const total = filteredReferredPatients.length;
    let paidCount = 0, pendingCount = 0, dueCount = 0;
    let totalCommissionEarned = 0;
    let totalSubtotal = 0;
    let totalFinalPayable = 0;
    let totalCommissionAmount = 0;

    filteredReferredPatients.forEach((item) => {
      const paymentStatus = item.referralBooking?.partnerPaymentStatus || "Due";
      if (paymentStatus === "Paid") {
        paidCount++;
        totalCommissionEarned += item.commissionAmount;
      } else if (paymentStatus === "Pending") pendingCount++;
      else dueCount++;
      totalSubtotal += item.subtotal;
      totalFinalPayable += item.finalPayable;
      totalCommissionAmount += item.commissionAmount;
    });

    return {
      total,
      paid: paidCount,
      pending: pendingCount,
      due: dueCount,
      totalCommissionEarned,
      totalSubtotal,
      totalFinalPayable,
      totalCommissionAmount
    };
  }, [filteredReferredPatients]);

  // ===== UPDATE PARTNER PAYMENT STATUS =====
  const handlePartnerPaymentSelect = async (item, paymentStatus, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (updatingPayment) return;
    
    const booking = item.referralBooking;
    if (!booking) {
      showToast("No booking found to update", "error");
      return;
    }
    
    const currentStatus = booking.partnerPaymentStatus || "Due";
    if (paymentStatus === currentStatus) {
      setOpenPartnerPaymentDropdown(null);
      return;
    }
    
    setUpdatingPayment(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/appointment-slots/${booking._id}/update-partner-payment`, { 
        partnerPaymentStatus: paymentStatus 
      });
      
      if (res && res.data && res.data.success) {
        showToast(`Partner payment status updated to ${paymentStatus}!`, "success");
        setOpenPartnerPaymentDropdown(null);
        fetchAllData();
      } else {
        showToast(res.data.message || "Failed to update partner payment", "error");
      }
    } catch (error) {
      console.error("Error updating partner payment:", error);
      showToast(error.response?.data?.message || "Failed to update partner payment", "error");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/patients/${id}`);
      fetchAllData();
      showToast("Patient record deleted successfully", "info");
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("Failed to delete patient record", "error");
    }
  };

  const handleViewReferralDetail = (item) => {
    setSelectedReferralData(item);
    setShowReferralDetailModal(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setReferralTypeFilter("All");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const hasActiveFilters = 
    searchQuery !== "" ||
    statusFilter !== "All" ||
    referralTypeFilter !== "All" ||
    fromDate !== "" ||
    toDate !== "" ||
    (selectedMonth && selectedMonth !== "");

  const totalPages = Math.ceil(filteredReferredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReferredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
    localStorage.setItem("referredOP_itemsPerPage", String(newValue));
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

  const downloadCSV = () => {
    if (filteredReferredPatients.length === 0) {
      alert("No referred patient records available to export!");
      return;
    }

    const headers = [
      "#", "Patient Name", "Phone", "Referred By", "Referral Type",
      "Services", "Subtotal", "Final Payable", "Commission %", "Commission Amount",
      "Patient Payment Status", "Patient Amount Paid", "Partner Payment Status", 
      "Booking Status", "Appointment Date", "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...filteredReferredPatients.map((item, idx) => {
        const { patient, referralBooking, subtotal, finalPayable, commissionPercent, commissionAmount, referralName, referralType, patientPaymentStatus, patientAmountPaid, partnerPaymentStatus } = item;
        const servicesCount = (referralBooking?.services || []).length;
        
        return [
          idx + 1,
          `"${(patient.name || "").replace(/"/g, '""')}"`,
          `"${patient.phone || ""}"`,
          `"${(referralName || "").replace(/"/g, '""')}"`,
          `"${referralType || "customer"}"`,
          servicesCount,
          subtotal,
          finalPayable,
          commissionPercent,
          commissionAmount,
          `"${patientPaymentStatus || "Pending"}"`,
          patientAmountPaid || 0,
          `"${partnerPaymentStatus || "Due"}"`,
          `"${referralBooking?.status || "confirmed"}"`,
          `"${formatDateToDDMMYYYY(referralBooking?.appointmentDate || referralBooking?.date)}"`,
          `"${formatDateTimeToDDMMYYYY(patient.createdAt)}"`
        ].join(",");
      })
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Referred_OP_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredReferredPatients.length} referred patient records!`);
  };

  // ============ RENDER ============
  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">

        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white transition-all transform animate-bounce ${
            toast.type === "error" ? "bg-red-600" : 
            toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"
          }`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
              Referred <span className="text-indigo-600">OP</span>
            </h1>
            <div className="emp-dash__date-pill">
              <FaShareAlt />
              <span>{filteredReferredPatients.length} Referred Patients</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Partner Payment</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Due">Due</option>
            </select>

            <select
              value={referralTypeFilter}
              onChange={(e) => setReferralTypeFilter(e.target.value)}
              className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Referrals</option>
              <option value="customer">Customer</option>
              <option value="doctor">Doctor</option>
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Select Month"
            />

            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>

            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
            >
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
              >
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Header - Mobile */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">
              Referred <span className="text-indigo-600">OP</span>
            </h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              <FaShareAlt className="w-3 h-3 text-indigo-600" />
              <span>{filteredReferredPatients.length} Patients</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          {showMobileFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Partner Payment</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Due">Due</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Referral Type</label>
                  <select
                    value={referralTypeFilter}
                    onChange={(e) => setReferralTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="All">All</option>
                    <option value="customer">Customer</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex gap-2">
                <button
                  onClick={downloadCSV}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm"
                >
                  <FiDownload className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" /> Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Referred</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FiUsers />
              </div>
            </div>
            <div className="emp-dash__stat-value">{stats.total}</div>
            <div className="emp-dash__stat-meta">referred patients</div>
          </div>

          <div className="emp-dash__stat cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setStatusFilter("Paid")}>
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Bonus Paid</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FiUserCheck />
              </div>
            </div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paid}</div>
            <div className="emp-dash__stat-meta">bonus paid to partner</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Pending</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiClock />
              </div>
            </div>
            <div className="emp-dash__stat-value text-amber-600">{stats.pending}</div>
            <div className="emp-dash__stat-meta">bonus pending</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Due</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--late">
                <FiXCircle />
              </div>
            </div>
            <div className="emp-dash__stat-value text-red-500">{stats.due}</div>
            <div className="emp-dash__stat-meta">bonus due</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total Bonus</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-indigo-700">₹{stats.totalCommissionEarned.toFixed(2)}</div>
            <div className="emp-dash__stat-meta">total bonus paid</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Subtotal</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-blue-700">₹{stats.totalSubtotal.toFixed(2)}</div>
            <div className="emp-dash__stat-meta">total consultation + services</div>
          </div>

          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Commission Amount</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--rate">
                <FaRupeeSign />
              </div>
            </div>
            <div className="emp-dash__stat-value text-purple-700">₹{stats.totalCommissionAmount.toFixed(2)}</div>
            <div className="emp-dash__stat-meta">total commission amount</div>
          </div>
        </div>

        {/* Main Table */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <FiRefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Loading referred patients...</p>
            </div>
          ) : filteredReferredPatients.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FaShareAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Referred Patients Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                {getReferredPatients.length === 0 ? 
                  "No patients with referral contacts found." : 
                  "No records match your current search/date filters."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
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
                      <th style={{ width: "30px", textAlign: "center" }}>#</th>
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>Referred By</th>
                      <th style={{ textAlign: "center" }}>Type</th>
                      <th style={{ textAlign: "center" }}>Services</th>
                      <th style={{ textAlign: "center" }}>Subtotal</th>
                      <th style={{ textAlign: "center" }}>Final Payable</th>
                      <th style={{ textAlign: "center" }}>Commission %</th>
                      <th style={{ textAlign: "center" }}>Commission Amount</th>
                      <th style={{ textAlign: "center" }}>Patient Payment</th>
                      <th style={{ textAlign: "center" }}>Partner Payment</th>
                      <th style={{ textAlign: "center" }}>Booking Status</th>
                      <th style={{ textAlign: "center" }}>Appt. Date</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, idx) => {
                      const { patient, referralBooking, subtotal, finalPayable, commissionPercent, commissionAmount, referralName, referralType, patientPaymentStatus, partnerPaymentStatus } = item;
                      const bookingStatus = referralBooking?.status || "confirmed";
                      const patientColors = getPaymentStatusColors(patientPaymentStatus);
                      const partnerColors = getPaymentStatusColors(partnerPaymentStatus);
                      const statusColors = getStatusColors(bookingStatus);
                      const servicesCount = (referralBooking?.services || []).length;

                      return (
                        <tr key={patient._id} className="transition-colors hover:bg-indigo-50/40">
                          <td className="px-1 py-3 font-semibold text-center text-slate-500 text-[11px]">
                            {indexOfFirstItem + idx + 1}
                          </td>
                          
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">
                                {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 text-xs truncate max-w-[70px]">
                                  {patient.name || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-3 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-slate-700">{patient.phone || "N/A"}</span>
                          </td>

                          <td className="px-2 py-3">
                            <div className="flex items-center gap-1">
                              <FaUserPlus className="text-indigo-500 text-[10px]" />
                              <span className="text-[11px] font-medium text-indigo-700 truncate max-w-[80px]">
                                {referralName}
                              </span>
                            </div>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                              referralType === "customer" 
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}>
                              {referralType === "customer" ? <FaUser className="text-[9px]" /> : <FaUserMd className="text-[9px]" />}
                              {referralType === "customer" ? "Customer" : "Doctor"}
                            </span>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            {servicesCount > 0 ? (
                              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                                {servicesCount} services
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="text-[11px] font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                              ₹{finalPayable.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                              <FaPercent className="text-[9px]" />
                              {commissionPercent}%
                            </span>
                          </td>

                          {/* ===== COMMISSION AMOUNT - DIRECT FROM BACKEND ===== */}
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200">
                              ₹{commissionAmount.toFixed(2)}
                            </span>
                          </td>

                          {/* PATIENT PAYMENT - DISPLAY ONLY */}
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${patientColors.bg} ${patientColors.text} ${patientColors.border}`}>
                              <patientColors.icon className={`w-2 h-2 ${patientColors.iconColor}`} />
                              {patientPaymentStatus}
                            </span>
                          </td>

                          {/* PARTNER PAYMENT - EDITABLE WITH DROPDOWN BELOW */}
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <div className="relative inline-block partner-payment-dropdown">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPartnerPaymentDropdown(openPartnerPaymentDropdown === patient._id ? null : patient._id);
                                }}
                                className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${partnerColors.bg} ${partnerColors.text} ${partnerColors.border} hover:opacity-80 transition-all`}
                              >
                                <partnerColors.icon className={`w-2 h-2 ${partnerColors.iconColor}`} />
                                {partnerPaymentStatus}
                                <FiChevronDown className="w-2.5 h-2.5 ml-0.5" />
                              </button>
                              
                              {/* DROPDOWN - THIK NECHE */}
                              {openPartnerPaymentDropdown === patient._id && (
                                <div
                                  className="absolute left-0 top-full mt-1 z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[140px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {PARTNER_PAYMENT_STATUS_OPTIONS.map((st) => {
                                    const isActive = st.value === partnerPaymentStatus;
                                    const colors = getPaymentStatusColors(st.value);
                                    const Icon = colors.icon;
                                    return (
                                      <button
                                        key={st.value}
                                        onClick={(e) => handlePartnerPaymentSelect(item, st.value, e)}
                                        className={`w-full px-4 py-2 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                          isActive ? colors.text : "text-gray-600"
                                        }`}
                                      >
                                        <Icon className={`w-3 h-3 ${colors.iconColor}`} />
                                        {st.label}
                                        {isActive && <FaCheck className="w-2.5 h-2.5 ml-auto text-green-500" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                              <FaCheckCircle className="w-2 h-2" />
                              {bookingStatus}
                            </span>
                          </td>

                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="text-[10px] font-medium text-slate-700">
                              {formatDateToDDMMYYYY(referralBooking?.appointmentDate || referralBooking?.date)}
                            </span>
                          </td>

                          <td className="px-2 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewReferralDetail(item)}
                                className="p-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 shadow-sm border border-indigo-100 hover:shadow-md hover:scale-105"
                                title="View Referral Details"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(patient._id)}
                                className="p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm border border-red-100 hover:shadow-md hover:scale-105"
                                title="Delete Record"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
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
                    Showing <strong className="text-gray-800">
                      {filteredReferredPatients.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredReferredPatients.length)}
                    </strong> of <strong className="text-gray-800">{filteredReferredPatients.length}</strong> records
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
                          ? "text-white bg-indigo-600 border-indigo-600 shadow-sm"
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

        {/* ===== REFERRAL DETAIL MODAL ===== */}
        {showReferralDetailModal && selectedReferralData && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                    <FaShareAlt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Referral Details</h3>
                    <p className="text-xs text-gray-500">
                      {selectedReferralData.patient.name} • Referred by {selectedReferralData.referralName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReferralDetailModal(false);
                    setSelectedReferralData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className="my-5 space-y-4">
                {/* Patient Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                      {selectedReferralData.patient.name?.charAt(0).toUpperCase() || "P"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {selectedReferralData.patient.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaPhoneAlt className="text-gray-400 text-[10px]" />
                        {selectedReferralData.patient.phone || "N/A"}
                        <span className="text-gray-300">|</span>
                        {selectedReferralData.patient.age || "N/A"} Yrs
                        <span className="text-gray-300">|</span>
                        {selectedReferralData.patient.gender || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Info */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FaUserPlus className="text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-900">Referred By:</span>
                      <span className="text-sm font-semibold text-indigo-800">{selectedReferralData.referralName}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedReferralData.referralType === "customer"
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                        : "bg-purple-100 text-purple-700 border-purple-300"
                    }`}>
                      {selectedReferralData.referralType === "customer" ? <FaUser className="text-[10px]" /> : <FaUserMd className="text-[10px]" />}
                      {selectedReferralData.referralType === "customer" ? "Customer" : "Doctor"}
                    </span>
                  </div>
                  {selectedReferralData.referralContact && (
                    <div className="mt-2 text-xs text-indigo-700">
                      <span className="font-medium">Contact:</span> {
                        selectedReferralData.referralContact.referralType === "customer"
                          ? selectedReferralData.referralContact.customerName
                          : selectedReferralData.referralContact.doctorName
                      }
                      {selectedReferralData.referralContact.referralType === "doctor" && 
                        ` (${selectedReferralData.referralContact.doctorOrganization || "N/A"})`}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Subtotal</div>
                    <div className="text-sm font-bold text-gray-900">₹{selectedReferralData.subtotal.toFixed(2)}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-blue-600">Final Payable</div>
                    <div className="text-sm font-bold text-blue-800">₹{selectedReferralData.finalPayable.toFixed(2)}</div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-amber-600">Commission %</div>
                    <div className="text-sm font-bold text-amber-800">{selectedReferralData.commissionPercent}%</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-purple-600">Commission Amount</div>
                    <div className="text-sm font-bold text-purple-800">₹{selectedReferralData.commissionAmount.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-blue-600">Patient Payment</div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getPaymentStatusColors(selectedReferralData.patientPaymentStatus).bg} ${getPaymentStatusColors(selectedReferralData.patientPaymentStatus).text} ${getPaymentStatusColors(selectedReferralData.patientPaymentStatus).border}`}>
                      {selectedReferralData.patientPaymentStatus}
                    </span>
                    {selectedReferralData.patientAmountPaid > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">₹{selectedReferralData.patientAmountPaid.toFixed(2)} paid</div>
                    )}
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                    <div className="text-[10px] font-bold uppercase text-purple-600">Partner Payment</div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getPaymentStatusColors(selectedReferralData.partnerPaymentStatus).bg} ${getPaymentStatusColors(selectedReferralData.partnerPaymentStatus).text} ${getPaymentStatusColors(selectedReferralData.partnerPaymentStatus).border}`}>
                      {selectedReferralData.partnerPaymentStatus}
                    </span>
                  </div>
                </div>

                {!selectedReferralData.isPartnerPaid && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                    <FiAlertCircle className="text-amber-600 w-4 h-4 flex-shrink-0" />
                    <span className="text-xs text-amber-700">
                      Referral bonus will be payable once partner payment status is marked as <strong>"Paid"</strong>
                    </span>
                  </div>
                )}

                {/* Services List */}
                {selectedReferralData.referralBooking?.services?.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-[11px] font-bold uppercase text-gray-500 mb-2">Services</div>
                    <div className="space-y-1">
                      {(selectedReferralData.referralBooking.services || []).map((svc, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-100 py-1 last:border-0">
                          <span className="font-medium text-gray-700">{svc.name}</span>
                          <span className="font-bold text-gray-900">₹{svc.price || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    <div className="font-bold text-gray-400">Booking Status</div>
                    <div className="font-semibold text-gray-800 capitalize">
                      {selectedReferralData.referralBooking?.status || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-400">Appointment Date</div>
                    <div className="font-semibold text-gray-800">
                      {formatDateToDDMMYYYY(selectedReferralData.referralBooking?.appointmentDate || selectedReferralData.referralBooking?.date)}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-400">Doctor</div>
                    <div className="font-semibold text-gray-800">
                      {selectedReferralData.referralBooking?.doctorName || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-400">Created</div>
                    <div className="font-semibold text-gray-800">
                      {formatDateTimeToDDMMYYYY(selectedReferralData.patient.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowReferralDetailModal(false);
                    setSelectedReferralData(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <FaPrint className="w-3.5 h-3.5" />
                  Print Details
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}