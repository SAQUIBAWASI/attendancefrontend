// ReferralBookings.js — Combined Doctor + Customer Referred OP Bookings
// ✅ Tabs: Doctor Referred Bookings | Customer Referred Bookings
// ✅ Mobile Card View Added
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  FaUserMd, FaUserInjured, FaSearch, FaCalendarAlt, FaClock,
  FaTimes, FaPhoneAlt, FaRupeeSign, FaPrint, FaCheckCircle,
  FaTimesCircle, FaFileInvoiceDollar, FaEye, FaEdit, FaTrashAlt,
  FaBuilding, FaAward, FaUsers, FaShareAlt, FaUserFriends,
  FaPrescription, FaFilePdf, FaSyncAlt, FaPills, FaFlask, FaClinicMedical,
  FaUser, FaMapMarkerAlt, FaUserCheck
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2,
  FiPlus, FiEdit2, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiCalendar, FiChevronDown, FiAlertCircle, FiAward, FiUser
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://api.timelyhealth.in/api";
const REFERRAL_API = `${API_BASE_URL}/referralcontacts`;
const BOOKINGS_API = `${API_BASE_URL}/appointment-slots`;

// ==================== SHARED HELPERS ====================
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
    return val.customerName || val.doctorName || val.name || "";
  }
  return "";
};

const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
  } catch { return "N/A"; }
};

const formatDateTimeToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()} ${hh}:${mm}`;
  } catch { return "N/A"; }
};

const getPaymentStatusColors = (status) => {
  const map = {
    Paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaClock, iconColor: "text-amber-600" },
    Pending: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: FaClock, iconColor: "text-gray-500" },
    Due: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle, iconColor: "text-red-500" }
  };
  return map[status] || map.Pending;
};

const getBookingServices = (booking) => {
  if (!booking) return [];
  const fromServiceItems = Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 ? booking.serviceItems : null;
  const fromServices = Array.isArray(booking.services) && booking.services.length > 0 ? booking.services : null;
  const arr = fromServiceItems || fromServices || [];
  return arr.map((s) => ({
    serviceId: s.serviceId || s._id || "",
    _id: s.serviceId || s._id || "",
    name: s.name || "Service",
    price: Number(s.price) || 0,
    description: s.description || "",
    paymentStatus: s.paymentStatus || booking.paymentStatus || "Pending",
    category: s.category || s.serviceCategory || s.type || "",
  }));
};

const classifyService = (svc) => {
  if (!svc) return "clinic";
  const cat = (svc.category || svc.serviceCategory || svc.type || "").toString().toLowerCase();
  const name = (svc.name || "").toString().toLowerCase();
  if (cat.includes("pharm") || cat.includes("medic") || name.includes("pharm") || name.includes("medic")) return "pharmacy";
  if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos") || name.includes("lab") || name.includes("test")) return "lab";
  return "clinic";
};

const getBookingFinalPayable = (booking) => {
  if (!booking) return 0;
  const final =
    Number(booking.finalPayable) ||
    Number(booking.finalPayableAmount) ||
    Number(booking.grandTotal) ||
    Number(booking.totalAmount) ||
    0;
  if (final > 0) return final;
  const items = getBookingServices(booking);
  const subtotal = items.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const commission = Number(booking.commissionAmount) || 0;
  const discount = Number(booking.discount) || 0;
  return subtotal - commission - discount;
};

const getBookingPaidInfo = (booking) => {
  if (!booking) return { final: 0, paid: 0, balance: 0, status: "Pending" };
  const final = getBookingFinalPayable(booking);
  const status = booking.paymentStatus || "Pending";
  let paid = Number(booking.amountPaid) || 0;
  if (status === "Paid") paid = final;
  else if (status === "Pending" || status === "Due") paid = 0;
  const balance = Math.max(0, final - paid);
  return { final, paid, balance, status };
};

const getBookingCategoryAmounts = (booking) => {
  if (!booking) return { clinicAmount: 0, labAmount: 0, pharmacyAmount: 0 };

  const services = getBookingServices(booking);
  let clinicAmount = 0, labAmount = 0, pharmacyAmount = 0;

  services.forEach((s) => {
    const cat = classifyService(s);
    const price = Number(s.price) || 0;
    if (cat === "lab") labAmount += price;
    else if (cat === "pharmacy") pharmacyAmount += price;
    else clinicAmount += price;
  });

  pharmacyAmount += Number(booking.medicineTotal) || 0;
  labAmount += Number(booking.labTotal) || 0;

  return { clinicAmount, labAmount, pharmacyAmount };
};

// Generic payable calculator (works for both doctor & customer)
const getReferralPayable = (referrer, booking) => {
  if (!referrer || !booking) return 0;
  const { clinicAmount, labAmount, pharmacyAmount } = getBookingCategoryAmounts(booking);

  const clinicP = parseFloat(referrer.clinicCommission) || 0;
  const pharmacyP = parseFloat(referrer.pharmacyCommission) || 0;
  const labP = parseFloat(referrer.labCommission) || 0;

  const total =
    (clinicAmount * clinicP) / 100 +
    (pharmacyAmount * pharmacyP) / 100 +
    (labAmount * labP) / 100;

  return Math.round(total);
};

const getReferralPayableBreakdown = (referrer, booking) => {
  if (!referrer || !booking) return { total: 0, items: [] };

  const services = getBookingServices(booking);
  const clinicP = parseFloat(referrer.clinicCommission) || 0;
  const pharmacyP = parseFloat(referrer.pharmacyCommission) || 0;
  const labP = parseFloat(referrer.labCommission) || 0;

  const items = [];
  let total = 0;

  services.forEach((svc) => {
    const price = Number(svc.price) || 0;
    const cat = classifyService(svc);
    let pct = clinicP;
    if (cat === "pharmacy") pct = pharmacyP;
    else if (cat === "lab") pct = labP;

    const payable = (price * pct) / 100;
    total += payable;
    items.push({ name: svc.name, price, category: cat, percent: pct, payable: Math.round(payable) });
  });

  const medicineTotal = Number(booking.medicineTotal) || 0;
  if (medicineTotal > 0) {
    const payable = (medicineTotal * pharmacyP) / 100;
    total += payable;
    items.push({ name: "Medicines (Manual)", price: medicineTotal, category: "pharmacy", percent: pharmacyP, payable: Math.round(payable) });
  }

  const labTotal = Number(booking.labTotal) || 0;
  if (labTotal > 0) {
    const payable = (labTotal * labP) / 100;
    total += payable;
    items.push({ name: "Lab Tests (Manual)", price: labTotal, category: "lab", percent: labP, payable: Math.round(payable) });
  }

  return { total: Math.round(total), items };
};

const getAppliedCategories = (referrer, booking) => {
  if (!referrer || !booking) return [];
  const applied = new Set();
  const services = getBookingServices(booking);
  services.forEach((svc) => applied.add(classifyService(svc)));
  if (Number(booking.medicineTotal) > 0) applied.add("pharmacy");
  if (Number(booking.labTotal) > 0) applied.add("lab");
  return Array.from(applied);
};

export default function ReferralBookings() {
  const navigate = useNavigate();

  // ==================== ACTIVE TAB ====================
  const [activeTab, setActiveTab] = useState("doctor"); // "doctor" | "customer"

  // ==================== SHARED DATA ====================
  const [doctorReferrals, setDoctorReferrals] = useState([]);
  const [customerReferrals, setCustomerReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================== FILTERS ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referrerFilter, setReferrerFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");

  // ==================== UI STATE ====================
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("referralBookings_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  // ==================== MODALS ====================
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [selectedReferrerForPayment, setSelectedReferrerForPayment] = useState(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("Pending");
  const [savingPayment, setSavingPayment] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ==================== FETCH ====================
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const refRes = await axios.get(`${REFERRAL_API}/getallreferralcontacts`);
      let allReferrals = [];
      if (refRes.data?.success) allReferrals = refRes.data.data || [];
      else if (Array.isArray(refRes.data)) allReferrals = refRes.data;

      setDoctorReferrals(allReferrals.filter((r) => r.referralType === "doctor"));
      setCustomerReferrals(allReferrals.filter((r) => r.referralType === "customer"));

      const bookRes = await axios.get(`${BOOKINGS_API}/getallreferralbookings`);
      if (bookRes.data?.success) {
        setBookings(bookRes.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
      showToast(err.response?.data?.message || "Failed to load data", "error");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ==================== ACTIVE DATA (based on tab) ====================
  const activeReferrals = activeTab === "doctor" ? doctorReferrals : customerReferrals;
  const isDoctorTab = activeTab === "doctor";

  // ==================== GET BOOKINGS FOR REFERRAL ====================
  const getBookingsForReferral = (referral) => {
    if (!referral) return [];
    const refId = String(referral._id || "");
    const refName = (
      isDoctorTab ? (referral.doctorName || "") : (referral.customerName || "")
    ).trim().toLowerCase();

    return bookings.filter((b) => {
      const cId = extractId(b.referralContactId);
      const cuId = extractId(b.referralCustomerId);
      const dId = extractId(b.referralDoctorId);

      if (cId && cId === refId) return true;
      if (cuId && cuId === refId) return true;
      if (dId && dId === refId) return true;

      const refCustomerName = (extractName(b.referralCustomerId) || "").trim().toLowerCase();
      const refDoctorName = (extractName(b.referralDoctorId) || b.referredByDoctor || "").trim().toLowerCase();
      const referredBy = (b.referredBy || "").trim().toLowerCase();

      if (refName && (refCustomerName === refName || refDoctorName === refName || referredBy === refName)) {
        return true;
      }

      return false;
    });
  };

  // ==================== FLAT ROWS ====================
  const buildFlatRows = () => {
    const rows = [];
    activeReferrals.forEach((ref) => {
      const refBookings = getBookingsForReferral(ref);
      if (refBookings.length === 0) {
        rows.push({ referrer: ref, booking: null });
      } else {
        refBookings.forEach((b) => {
          rows.push({ referrer: ref, booking: b });
        });
      }
    });
    return rows;
  };

  const flatRows = useMemo(() => buildFlatRows(), [activeReferrals, bookings, activeTab]);

  // ==================== UNIQUE REFERRERS ====================
  const uniqueReferrers = useMemo(() => {
    const map = new Map();
    activeReferrals.forEach((r) => {
      const name = isDoctorTab ? r.doctorName : r.customerName;
      if (name) map.set(r._id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeReferrals, activeTab]);

  // ==================== FILTERED ROWS ====================
  const filteredRows = useMemo(() => {
    return flatRows.filter(({ referrer, booking }) => {
      if (referrerFilter !== "All" && referrer._id !== referrerFilter) return false;

      if (!booking) {
        if (statusFilter !== "All") return false;
        if (fromDate || toDate || selectedMonth) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = isDoctorTab ? (referrer.doctorName || "") : (referrer.customerName || "");
          const org = isDoctorTab ? (referrer.doctorOrganization || "") : (referrer.customerAddress || "");
          const phone = isDoctorTab ? (referrer.doctorPhone || "") : (referrer.customerPhone || "");
          const spec = isDoctorTab ? (referrer.doctorSpecialization || "") : "";
          const m =
            name.toLowerCase().includes(q) ||
            org.toLowerCase().includes(q) ||
            phone.toLowerCase().includes(q) ||
            spec.toLowerCase().includes(q);
          if (!m) return false;
        }
        return true;
      }

      if (statusFilter !== "All" && booking.paymentStatus !== statusFilter) return false;

      if (selectedMonth && selectedMonth !== "") {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (m !== selectedMonth) return false;
      }

      if (fromDate && toDate) {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const f = new Date(fromDate); f.setHours(0, 0, 0, 0);
        const t = new Date(toDate); t.setHours(23, 59, 59, 999);
        if (d < f || d > t) return false;
      } else if (fromDate) {
        const d = new Date(booking.createdAt || booking.bookedAt);
        const f = new Date(fromDate); f.setHours(0, 0, 0, 0);
        const t = new Date(fromDate); t.setHours(23, 59, 59, 999);
        if (d < f || d > t) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = isDoctorTab ? (referrer.doctorName || "") : (referrer.customerName || "");
        const org = isDoctorTab ? (referrer.doctorOrganization || "") : (referrer.customerAddress || "");
        const phone = isDoctorTab ? (referrer.doctorPhone || "") : (referrer.customerPhone || "");
        const m =
          (booking.patientName || "").toLowerCase().includes(q) ||
          (booking.patientPhone || "").toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          org.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q);
        if (!m) return false;
      }

      return true;
    });
  }, [flatRows, referrerFilter, statusFilter, searchQuery, fromDate, toDate, selectedMonth, isDoctorTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, referrerFilter, fromDate, toDate, selectedMonth, activeTab]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const totalReferrers = activeReferrals.length;
    const totalBookings = flatRows.filter((r) => r.booking).length;

    let payableTotal = 0;
    let paidCount = 0, partialCount = 0, pendingCount = 0, dueCount = 0;

    flatRows.forEach(({ booking }) => {
      if (!booking) return;
      const st = booking.paymentStatus || "Pending";
      if (st === "Paid") paidCount++;
      else if (st === "Partial") partialCount++;
      else if (st === "Due") dueCount++;
      else pendingCount++;
    });

    flatRows.forEach(({ referrer, booking }) => {
      if (referrer && booking) {
        payableTotal += getReferralPayable(referrer, booking);
      }
    });

    return {
      totalReferrers,
      totalBookings,
      paidCount,
      partialCount,
      pendingCount,
      dueCount,
      totalPayable: payableTotal
    };
  }, [activeReferrals, flatRows]);

  // ==================== CARD CLICK ====================
  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else setStatusFilter(type);
  };

  // ==================== CLEAR FILTERS ====================
  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setReferrerFilter("All");
    setFromDate(""); setToDate(""); setSelectedMonth("");
    setActiveCardFilter("all"); setCurrentPage(1);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || referrerFilter !== "All" ||
    fromDate !== "" || toDate !== "" || (selectedMonth && selectedMonth !== "");

  // ==================== PAGINATION ====================
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const v = Number(e.target.value);
    setItemsPerPage(v);
    localStorage.setItem("referralBookings_itemsPerPage", String(v));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
      else if (i === currentPage - 3 || i === currentPage + 3) pages.push("...");
    }
    return pages;
  };

  // ==================== CSV EXPORT ====================
  const downloadCSV = () => {
    if (!filteredRows.length) { alert("No records available to export!"); return; }
    const referrerLabel = isDoctorTab ? "Doctor" : "Customer";
    const headers = [
      "#", `${referrerLabel} Name`, `${referrerLabel} Phone`,
      isDoctorTab ? "Organization" : "Address",
      "Clinic %", "Pharmacy %", "Lab %",
      "Patient", "Appt. Date",
      "Clinic Amount", "Pharmacy Amount", "Lab Amount",
      "Total", "Payment Status", `${referrerLabel} Payable`,
      `${referrerLabel} Payment Status`, "Paid At",
      "Payment Mode", "Created At"
    ];
    const csvRows = [headers.join(","), ...filteredRows.map((row, idx) => {
      const { referrer, booking } = row;
      const name = isDoctorTab ? (referrer.doctorName || "") : (referrer.customerName || "");
      const phone = isDoctorTab ? (referrer.doctorPhone || "") : (referrer.customerPhone || "");
      const extra = isDoctorTab ? (referrer.doctorOrganization || "") : (referrer.customerAddress || "");
      const payStatus = isDoctorTab ? (booking?.doctorPaymentStatus || "Pending") : (booking?.customerPaymentStatus || "Pending");
      const payAt = isDoctorTab ? booking?.doctorPaymentUpdatedAt : booking?.customerPaymentUpdatedAt;

      if (!booking) {
        return [
          idx + 1,
          `"${name.replace(/"/g, '""')}"`,
          `"${phone}"`,
          `"${extra.replace(/"/g, '""')}"`,
          `"${referrer.clinicCommission || 0}"`,
          `"${referrer.pharmacyCommission || 0}"`,
          `"${referrer.labCommission || 0}"`,
          `"-"`, `"-"`,
          0, 0, 0,
          0, `"-"`, 0, `"${payStatus}"`, `"-"`, `"-"`, `"-"`
        ].join(",");
      }
      const info = getBookingPaidInfo(booking);
      const payable = getReferralPayable(referrer, booking);
      const cats = getBookingCategoryAmounts(booking);
      return [
        idx + 1,
        `"${name.replace(/"/g, '""')}"`,
        `"${phone}"`,
        `"${extra.replace(/"/g, '""')}"`,
        `"${referrer.clinicCommission || 0}"`,
        `"${referrer.pharmacyCommission || 0}"`,
        `"${referrer.labCommission || 0}"`,
        `"${(booking.patientTitle || "")} ${(booking.patientName || "").replace(/"/g, '""')}"`,
        `"${formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}"`,
        cats.clinicAmount,
        cats.pharmacyAmount,
        cats.labAmount,
        info.final,
        `"${booking.paymentStatus || "Pending"}"`,
        payable,
        `"${payStatus}"`,
        `"${payAt ? formatDateTimeToDDMMYYYY(payAt) : "-"}"`,
        `"${booking.paymentType || "cash"}"`,
        `"${formatDateTimeToDDMMYYYY(booking.createdAt)}"`
      ].join(",");
    })];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${referrerLabel}_Referral_OP_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredRows.length} records!`);
  };

  // ==================== PAYMENT MODAL ====================
  const openPaymentModal = (referrer, booking) => {
    if (!booking) {
      showToast("No booking selected", "error");
      return;
    }
    setSelectedReferrerForPayment(referrer);
    setSelectedBookingForPayment(booking);
    const current = isDoctorTab
      ? (booking?.doctorPaymentStatus || "Pending")
      : (booking?.customerPaymentStatus || "Pending");
    setNewPaymentStatus(current);
    setShowPaymentModal(true);
  };

  const handleSavePaymentStatus = async () => {
    if (!selectedBookingForPayment) {
      showToast("No booking selected", "error");
      return;
    }
    setSavingPayment(true);
    try {
      const endpoint = isDoctorTab
        ? `${BOOKINGS_API}/updatedoctorpayment/${selectedBookingForPayment._id}`
        : `${BOOKINGS_API}/updatecustomerpayment/${selectedBookingForPayment._id}`;
      const payload = isDoctorTab
        ? { doctorPaymentStatus: newPaymentStatus }
        : { customerPaymentStatus: newPaymentStatus };

      const res = await axios.put(endpoint, payload);
      if (res.data?.success || res.status === 200) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBookingForPayment._id
              ? {
                  ...b,
                  ...(isDoctorTab
                    ? {
                        doctorPaymentStatus: newPaymentStatus,
                        doctorPaymentUpdatedAt: new Date().toISOString(),
                      }
                    : {
                        customerPaymentStatus: newPaymentStatus,
                        customerPaymentUpdatedAt: new Date().toISOString(),
                      }),
                }
              : b
          )
        );
        const label = isDoctorTab ? "Doctor" : "Customer";
        showToast(`${label} payment status updated to ${newPaymentStatus}!`, "success");
        setShowPaymentModal(false);
        setSelectedReferrerForPayment(null);
        setSelectedBookingForPayment(null);
      } else {
        showToast(res.data?.message || "Failed to update", "error");
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      showToast(err.response?.data?.message || "Failed to update payment status", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  // ==================== TAB CHANGE ====================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReferrerFilter("All");
    setCurrentPage(1);
    setActiveCardFilter("all");
    setStatusFilter("All");
  };

  // ==================== LABELS ====================
  const referrerLabel = isDoctorTab ? "Doctor" : "Customer";
  const referrerLabelPlural = isDoctorTab ? "Doctors" : "Customers";
  const accentColor = isDoctorTab ? "purple" : "indigo";
  const avatarBg = isDoctorTab ? "bg-purple-500" : "bg-indigo-500";
  const avatarText = isDoctorTab ? "text-purple-800" : "text-indigo-800";
  const payableTextColor = isDoctorTab ? "text-purple-700" : "text-indigo-700";
  const payableBgColor = isDoctorTab ? "bg-purple-50" : "bg-indigo-50";
  const payableBorderColor = isDoctorTab ? "border-purple-200" : "border-indigo-200";
  const statPayableColor = isDoctorTab ? "text-purple-700" : "text-indigo-700";
  const headerAccent = isDoctorTab ? "text-purple-600" : "text-indigo-600";

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* ==================== TABS ==================== */}
        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange("doctor")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "doctor"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUserMd className="w-4 h-4" />
            Doctor Referred Bookings
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "doctor" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
            }`}>
              {doctorReferrals.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("customer")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
              activeTab === "customer"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUser className="w-4 h-4" />
            Customer Referred Bookings
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "customer" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
            }`}>
              {customerReferrals.length}
            </span>
          </button>
        </div>

        {/* ==================== HEADER DESKTOP ==================== */}
        <div className="hidden lg:flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="emp-dash__greeting text-lg sm:text-xl font-bold whitespace-nowrap">
            {referrerLabel} Referral <span>{isDoctorTab ? "OP" : "OP"}</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="emp-dash__date-pill">
              {isDoctorTab ? <FaUserMd /> : <FaUser />}
              <span>{activeReferrals.length} {referrerLabelPlural} • {stats.totalBookings} Bookings</span>
            </div>
            <div className="relative min-w-[130px]">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] pl-8 pr-2 py-1.5 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg">
              <option value="All">All Payment</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Due">Due</option>
            </select>
            <select value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} className="h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg max-w-[150px] truncate">
              <option value="All">All {referrerLabelPlural}</option>
              {uniqueReferrers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-[110px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); }} className="w-[120px] h-8 px-2 py-1 text-xs border border-gray-300 bg-white text-gray-900 rounded-lg" />
            <button onClick={fetchAllData} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm">
              <FiDownload className="w-3 h-3" /> Export CSV
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm">
                <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ==================== HEADER MOBILE ==================== */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">{referrerLabel} Referral <span className={headerAccent}>OP</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              {isDoctorTab ? <FaUserMd className={`w-3 h-3 ${headerAccent}`} /> : <FaUser className={`w-3 h-3 ${headerAccent}`} />}
              <span>{activeReferrals.length}{isDoctorTab ? "D" : "C"} • {stats.totalBookings}B</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
              <FiFilter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>

        {/* ==================== MOBILE FILTERS ==================== */}
        {showMobileFilters && (
          <div className="lg:hidden mb-4 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
              </select>
              <select value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                <option value="All">All {referrerLabelPlural}</option>
                {uniqueReferrers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
            </div>
            <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
            <div className="pt-3 border-t border-gray-200 flex gap-2">
              <button onClick={downloadCSV} disabled={!filteredRows.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50">
                <FiDownload className="w-4 h-4" /> Export
              </button>
              <button onClick={fetchAllData} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* ==================== STATS ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total {referrerLabelPlural}</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.totalReferrers}</div>
            <div className="emp-dash__stat-meta">referring {referrerLabelPlural.toLowerCase()}</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total Bookings</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaUserInjured /></div></div>
            <div className="emp-dash__stat-value text-blue-600">{stats.totalBookings}</div>
            <div className="emp-dash__stat-meta">referred OP bookings</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paidCount}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partialCount}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 ${activeCardFilter === "Pending" ? "ring-2 ring-gray-500/20 border-gray-400" : ""}`} onClick={() => handleCardClick("Pending")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Pending</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiClock /></div></div>
            <div className="emp-dash__stat-value text-gray-600">{stats.pendingCount}</div>
            <div className="emp-dash__stat-meta">awaiting payment</div>
          </div>
          <div className="emp-dash__stat">
            <div className="emp-dash__stat-top">
              <span className="emp-dash__stat-label">Total {referrerLabel} Payable</span>
              <div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FaRupeeSign /></div>
            </div>
            <div className={`emp-dash__stat-value ${statPayableColor}`}>₹{stats.totalPayable.toLocaleString()}</div>
            <div className="emp-dash__stat-meta">payable to {referrerLabelPlural.toLowerCase()}</div>
          </div>
        </div>

        {/* ==================== MAIN TABLE / CARD ==================== */}
        <div className="emp-dash__card">
          {loading ? (
            <div className="py-12 text-center">
              <FiRefreshCw className={`w-8 h-8 ${headerAccent} animate-spin mx-auto mb-3`} />
              <p className="text-sm text-gray-500">Loading {referrerLabel.toLowerCase()} referral OP records...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-12 text-center">
              {isDoctorTab ? <FaUserMd className="w-12 h-12 text-gray-300 mx-auto mb-3" /> : <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />}
              <h3 className="text-base font-bold text-gray-700">No {referrerLabel} Referral OP Records</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">{flatRows.length === 0 ? "No referrals or bookings yet." : "No records match your filters."}</p>
              {hasActiveFilters && <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Clear Filters</button>}
            </div>
          ) : (
            <>
              {/* ===== DESKTOP TABLE VIEW ===== */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="emp-dash__table">
                  <thead>
                    <tr>
                      <th style={{ width: "35px", textAlign: "center" }}>#</th>
                      <th>Referred By {referrerLabel}</th>
                      <th>Patient</th>
                      <th style={{ textAlign: "center", minWidth: "130px" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Total</th>
                      <th style={{ textAlign: "center" }}>Payment Status</th>
                      <th style={{ textAlign: "center" }}>{referrerLabel} Payable</th>
                      <th style={{ textAlign: "center" }}>{referrerLabel} Payment Status</th>
                      <th style={{ textAlign: "center", minWidth: "110px" }}>Paid At</th>
                      <th style={{ textAlign: "center" }}>Referral %</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => {
                      const { referrer, booking } = row;
                      const name = isDoctorTab ? (referrer.doctorName || "N/A") : (referrer.customerName || "N/A");
                      const subInfo = isDoctorTab
                        ? (referrer.doctorOrganization || "-")
                        : (referrer.customerPhone || "-");

                      if (!booking) {
                        return (
                          <tr key={`${referrer._id}-no-booking`} className={`hover:${isDoctorTab ? "bg-purple-50/30" : "bg-indigo-50/30"}`}>
                            <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-[10px]`}>
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className={`font-semibold text-xs ${avatarText} truncate max-w-[120px]`}>{name}</div>
                                  <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{subInfo}</div>
                                </div>
                              </div>
                            </td>
                            <td colSpan={10} className="px-3 py-3 text-center text-xs text-gray-400 italic">No referrals made yet</td>
                          </tr>
                        );
                      }

                      const info = getBookingPaidInfo(booking);
                      const paymentColors = getPaymentStatusColors(booking.paymentStatus);
                      const payable = getReferralPayable(referrer, booking);
                      const payStatus = isDoctorTab
                        ? (booking.doctorPaymentStatus || "Pending")
                        : (booking.customerPaymentStatus || "Pending");
                      const payColors = getPaymentStatusColors(payStatus);
                      const cats = getBookingCategoryAmounts(booking);
                      const payAt = isDoctorTab ? booking.doctorPaymentUpdatedAt : booking.customerPaymentUpdatedAt;

                      return (
                        <tr key={booking._id} className={`hover:${isDoctorTab ? "bg-purple-50/30" : "bg-indigo-50/30"}`}>
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-[10px]`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className={`font-semibold text-xs ${avatarText} truncate max-w-[120px]`}>{name}</div>
                                <div className="text-[9px] text-gray-400 truncate max-w-[120px]">{subInfo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-xs text-slate-800 truncate max-w-[120px]">{booking.patientTitle || ""} {booking.patientName || "N/A"}</div>
                            <div className="text-[9px] text-gray-400">{booking.patientAge || "?"} yrs • {booking.patientGender || "-"}</div>
                          </td>

                          <td className="px-3 py-3" style={{ minWidth: "130px" }}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1">
                                  <FaClinicMedical className="text-[9px]" /> Clinic:
                                </span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.clinicAmount)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1">
                                  <FaPills className="text-[9px]" /> Pharmacy:
                                </span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.pharmacyAmount)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1">
                                  <FaFlask className="text-[9px]" /> Lab:
                                </span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.labAmount)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-bold text-slate-800">₹{Math.round(info.final)}</span></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border}`}>
                              <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {booking.paymentStatus || "Pending"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`text-xs font-bold ${payableTextColor} ${payableBgColor} px-2 py-0.5 rounded-full border ${payableBorderColor}`}>
                              ₹{payable}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openPaymentModal(referrer, booking)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border cursor-pointer hover:shadow-md transition-all ${payColors.bg} ${payColors.text} ${payColors.border}`}
                              title={`Click to update ${referrerLabel.toLowerCase()} payment status`}
                            >
                              <payColors.icon className={`w-2.5 h-2.5 ${payColors.iconColor}`} />
                              {payStatus}
                            </button>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {payAt ? (
                              <div className="text-[10px] font-semibold text-slate-700">
                                {formatDateToDDMMYYYY(payAt)}
                                <div className="text-[9px] text-gray-400">
                                  {new Date(payAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">-</span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 items-center">
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Clinic">
                                Clinic: {referrer.clinicCommission || 0}%
                              </span>
                              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100" title="Pharmacy">
                                Pharmacy: {referrer.pharmacyCommission || 0}%
                              </span>
                              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100" title="Lab">
                                Lab: {referrer.labCommission || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-[10px] text-gray-500 whitespace-nowrap">
                            <div className="font-semibold text-slate-700">{formatDateToDDMMYYYY(booking.createdAt)}</div>
                            <div className="text-[9px] text-gray-400">{booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}</div>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedReferrer(referrer);
                                setSelectedBookingForModal(booking);
                                setShowDetailModal(true);
                              }}
                              className={`p-1.5 ${isDoctorTab ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"} rounded-lg`}
                              title="View Details"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ===== MOBILE CARD VIEW ===== */}
              <div className="lg:hidden p-3 space-y-3 bg-gray-50/50">
                {currentRows.map((row, idx) => {
                  const { referrer, booking } = row;
                  const name = isDoctorTab ? (referrer.doctorName || "N/A") : (referrer.customerName || "N/A");
                  const subInfo = isDoctorTab
                    ? (referrer.doctorOrganization || "-")
                    : (referrer.customerPhone || "-");

                  if (!booking) {
                    return (
                      <div key={`${referrer._id}-no-booking`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-xs flex-shrink-0`}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-bold text-sm ${avatarText} truncate`}>{name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{subInfo}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-xs text-gray-400 italic py-2 border-t border-gray-100">
                          No referrals made yet
                        </div>
                      </div>
                    );
                  }

                  const info = getBookingPaidInfo(booking);
                  const paymentColors = getPaymentStatusColors(booking.paymentStatus);
                  const payable = getReferralPayable(referrer, booking);
                  const payStatus = isDoctorTab
                    ? (booking.doctorPaymentStatus || "Pending")
                    : (booking.customerPaymentStatus || "Pending");
                  const payColors = getPaymentStatusColors(payStatus);
                  const cats = getBookingCategoryAmounts(booking);
                  const payAt = isDoctorTab ? booking.doctorPaymentUpdatedAt : booking.customerPaymentUpdatedAt;

                  return (
                    <div key={booking._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-xs flex-shrink-0`}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-bold text-sm ${avatarText} truncate`}>{name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <FaPhoneAlt className="text-[8px]" /> {subInfo}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border} flex-shrink-0`}>
                          <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} />
                          {booking.paymentStatus || "Pending"}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 space-y-2.5">
                        {/* Patient */}
                        <div className="flex items-center gap-2 text-[11px]">
                          <FaUserInjured className="text-gray-400 text-[10px]" />
                          <span className="font-semibold text-slate-700 truncate">{booking.patientTitle || ""} {booking.patientName || "N/A"}</span>
                          <span className="text-[9px] text-gray-400">({booking.patientAge || "?"} yrs • {booking.patientGender || "-"})</span>
                        </div>

                        {/* Amount Breakdown */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-[8px] font-bold text-blue-600 uppercase">Clinic</div>
                            <div className="text-xs font-extrabold text-blue-800">₹{Math.round(cats.clinicAmount)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-[8px] font-bold text-green-600 uppercase">Pharmacy</div>
                            <div className="text-xs font-extrabold text-green-800">₹{Math.round(cats.pharmacyAmount)}</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-[8px] font-bold text-purple-600 uppercase">Lab</div>
                            <div className="text-xs font-extrabold text-purple-800">₹{Math.round(cats.labAmount)}</div>
                          </div>
                        </div>

                        {/* Total + Payable */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                          <div className="text-center p-1.5 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="text-[9px] font-bold text-gray-500 uppercase">Total Amount</div>
                            <div className="text-sm font-extrabold text-slate-800">₹{Math.round(info.final)}</div>
                          </div>
                          <div className={`text-center p-1.5 rounded-lg ${payableBgColor} border ${payableBorderColor}`}>
                            <div className={`text-[9px] font-bold ${payableTextColor} uppercase`}>{referrerLabel} Payable</div>
                            <div className={`text-sm font-extrabold ${statPayableColor}`}>₹{payable}</div>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase text-gray-400">{referrerLabel} Pay:</span>
                            <button
                              type="button"
                              onClick={() => openPaymentModal(referrer, booking)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border cursor-pointer hover:shadow-md transition-all ${payColors.bg} ${payColors.text} ${payColors.border}`}
                              title={`Click to update ${referrerLabel.toLowerCase()} payment status`}
                            >
                              <payColors.icon className={`w-2.5 h-2.5 ${payColors.iconColor}`} />
                              {payStatus}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">
                            {payAt ? formatDateToDDMMYYYY(payAt) : "-"}
                          </div>
                        </div>

                        {/* Referral % Badges */}
                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            Clinic: {referrer.clinicCommission || 0}%
                          </span>
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            Pharmacy: {referrer.pharmacyCommission || 0}%
                          </span>
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                            Lab: {referrer.labCommission || 0}%
                          </span>
                        </div>

                        {/* Date + Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="text-[10px] text-gray-500">
                            {formatDateToDDMMYYYY(booking.createdAt)}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedReferrer(referrer);
                              setSelectedBookingForModal(booking);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold"
                            title="View Details"
                          >
                            <FiEye className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ==================== PAGINATION ==================== */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-gray-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Show</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="p-1 border rounded-md bg-white">
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Showing <strong>{filteredRows.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredRows.length)}</strong> of <strong>{filteredRows.length}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Prev</button>
                  {getPageNumbers().map((page, i) => (
                    <button key={i} onClick={() => typeof page === "number" && setCurrentPage(page)} disabled={page === "..."} className={`px-3 py-1 text-xs font-semibold border rounded-lg min-w-[32px] ${page === "..." ? "text-gray-400 border-transparent" : currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white hover:bg-gray-50"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==================== DETAIL MODAL ==================== */}
        {showDetailModal && selectedReferrer && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDoctorTab ? "bg-purple-600" : "bg-indigo-600"} text-white flex items-center justify-center`}>
                    {isDoctorTab ? <FaUserMd /> : <FaUser />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{referrerLabel} Referral Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedReferrer._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReferrer(null);
                    setSelectedBookingForModal(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="my-4 bg-gray-50 p-5 rounded-xl border space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className={`w-14 h-14 rounded-full ${avatarBg} text-white font-bold text-xl flex items-center justify-center`}>
                    {(isDoctorTab ? selectedReferrer.doctorName : selectedReferrer.customerName)?.charAt(0).toUpperCase() || (isDoctorTab ? "D" : "C")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base">
                      {isDoctorTab ? selectedReferrer.doctorName : selectedReferrer.customerName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {isDoctorTab ? <FaBuilding className="text-[10px]" /> : <FaPhoneAlt className="text-[10px]" />}
                      {isDoctorTab ? (selectedReferrer.doctorOrganization || "N/A") : (selectedReferrer.customerPhone || "N/A")}
                    </div>
                    {!isDoctorTab && selectedReferrer.customerAddress && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="text-[10px]" />
                        {selectedReferrer.customerAddress}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Phone</div>
                    <div className="font-semibold">
                      {isDoctorTab ? (selectedReferrer.doctorPhone || "N/A") : (selectedReferrer.customerPhone || "N/A")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">
                      {isDoctorTab ? "Specialization" : "Status"}
                    </div>
                    <div className="font-semibold">
                      {isDoctorTab
                        ? (selectedReferrer.doctorSpecialization || "General")
                        : (selectedReferrer.status || "active")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                    <FiAward className={headerAccent} /> Referral % Breakdown
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold flex items-center justify-center gap-1">
                        <FaClinicMedical className="text-[10px]" /> Clinic
                      </div>
                      <div className="text-base font-extrabold text-blue-900">{selectedReferrer.clinicCommission || 0}%</div>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-center border border-green-100">
                      <div className="text-[9px] text-green-600 font-bold flex items-center justify-center gap-1">
                        <FaPills className="text-[10px]" /> Pharmacy
                      </div>
                      <div className="text-base font-extrabold text-green-900">{selectedReferrer.pharmacyCommission || 0}%</div>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-center border border-purple-100">
                      <div className="text-[9px] text-purple-600 font-bold flex items-center justify-center gap-1">
                        <FaFlask className="text-[10px]" /> Lab
                      </div>
                      <div className="text-base font-extrabold text-purple-900">{selectedReferrer.labCommission || 0}%</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-2">Referral Metrics</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Total OPs</div>
                      <div className="text-base font-extrabold text-blue-900">{getBookingsForReferral(selectedReferrer).length}</div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                      <div className="text-[9px] text-emerald-600 font-bold">Patient Total</div>
                      <div className="text-base font-extrabold text-emerald-900">
                        ₹{getBookingsForReferral(selectedReferrer).reduce((sum, b) => sum + getBookingFinalPayable(b), 0).toLocaleString()}
                      </div>
                    </div>
                    <div className={`${payableBgColor} p-2 rounded-lg text-center border ${payableBorderColor}`}>
                      <div className={`text-[9px] ${payableTextColor} font-bold`}>{referrerLabel} Payable</div>
                      <div className={`text-base font-extrabold ${statPayableColor}`}>
                        ₹{getBookingsForReferral(selectedReferrer).reduce((sum, b) => sum + getReferralPayable(selectedReferrer, b), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBookingForModal && (() => {
                  const breakdown = getReferralPayableBreakdown(selectedReferrer, selectedBookingForModal);
                  const payStatus = isDoctorTab
                    ? (selectedBookingForModal.doctorPaymentStatus || "Pending")
                    : (selectedBookingForModal.customerPaymentStatus || "Pending");
                  const payAt = isDoctorTab
                    ? selectedBookingForModal.doctorPaymentUpdatedAt
                    : selectedBookingForModal.customerPaymentUpdatedAt;
                  return (
                    <div className="pt-3 border-t">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-2">Selected Booking Details</div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Patient:</span>
                          <span className="font-semibold">{selectedBookingForModal.patientTitle} {selectedBookingForModal.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Amount:</span>
                          <span className="font-semibold">₹{Math.round(getBookingFinalPayable(selectedBookingForModal))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{referrerLabel} Payment:</span>
                          <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase ${getPaymentStatusColors(payStatus).bg} ${getPaymentStatusColors(payStatus).text}`}>
                            {payStatus}
                          </span>
                        </div>
                        {payAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Paid At:</span>
                            <span className="font-semibold text-[10px]">{formatDateTimeToDDMMYYYY(payAt)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Service-wise Commission</div>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Service</th>
                                <th className="text-center px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Category</th>
                                <th className="text-right px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Price</th>
                                <th className="text-center px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">%</th>
                                <th className="text-right px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase">Payable</th>
                              </tr>
                            </thead>
                            <tbody>
                              {breakdown.items.map((it, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="px-2 py-1.5 font-medium text-gray-700">{it.name}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                      it.category === "clinic"
                                        ? "bg-blue-50 text-blue-700"
                                        : it.category === "pharmacy"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-purple-50 text-purple-700"
                                    }`}>
                                      {it.category}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-semibold text-gray-700">₹{it.price}</td>
                                  <td className="px-2 py-1.5 text-center font-semibold text-gray-600">{it.percent}%</td>
                                  <td className={`px-2 py-1.5 text-right font-bold ${payableTextColor}`}>₹{it.payable}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className={`${payableBgColor} border-t-2 ${payableBorderColor}`}>
                              <tr>
                                <td colSpan={4} className={`px-2 py-2 text-right font-bold ${payableTextColor} text-[11px]`}>
                                  Total {referrerLabel} Payable
                                </td>
                                <td className={`px-2 py-2 text-right font-extrabold ${statPayableColor} text-[12px]`}>
                                  ₹{breakdown.total}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReferrer(null);
                    setSelectedBookingForModal(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAYMENT MODAL ==================== */}
        {showPaymentModal && selectedReferrerForPayment && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><FaEdit /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update {referrerLabel} Payment</h3>
                    <p className="text-xs text-gray-500">
                      {isDoctorTab ? selectedReferrerForPayment.doctorName : selectedReferrerForPayment.customerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedReferrerForPayment(null); setSelectedBookingForPayment(null); }}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <div className={`mt-4 p-3 ${payableBgColor} rounded-lg border ${payableBorderColor}`}>
                <div className={`text-xs ${payableTextColor} font-bold uppercase`}>{referrerLabel} Payable For This Booking</div>
                <div className={`text-lg font-extrabold ${statPayableColor} mt-0.5`}>
                  ₹{getReferralPayable(selectedReferrerForPayment, selectedBookingForPayment)}
                </div>
                <div className={`text-[10px] ${payableTextColor} mt-0.5`}>
                  Patient: {selectedBookingForPayment.patientName} • Total: ₹{Math.round(getBookingFinalPayable(selectedBookingForPayment))}
                </div>
              </div>

              <div className="my-5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                  {referrerLabel} Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pending", "Paid"].map((st) => {
                    const isSelected = newPaymentStatus === st;
                    const colors = getPaymentStatusColors(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewPaymentStatus(st)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 ${isSelected ? `${colors.bg} ${colors.text} border-blue-500 ring-2 ring-blue-400/20` : "border-gray-200 bg-white text-gray-700"}`}
                      >
                        <colors.icon className={`w-3.5 h-3.5 ${colors.iconColor}`} />
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedReferrerForPayment(null); setSelectedBookingForPayment(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaymentStatus}
                  disabled={savingPayment}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPayment ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                  {savingPayment ? "Saving..." : "Save Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}