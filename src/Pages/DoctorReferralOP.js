// ReferralBookings.js — Combined Doctor + Customer Referred OP Bookings
// ✅ Only referrals WITH bookings shown
// ✅ Total Payable card removed (4 stat cards)
// ✅ Edit button opens Payment Modal (uses updatedoctorpayment / updatecustomerpayment APIs)
// ✅ Fees badge + Referral % badges
// ✅ All "Pending" → "Due"
// ✅ Stats & Revenue Breakdown computed from filteredRows (respects ALL filters)
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaUserMd, FaUserInjured, FaSearch, FaCalendarAlt, FaClock,
  FaTimes, FaPhoneAlt, FaRupeeSign, FaCheckCircle,
  FaTimesCircle, FaEye, FaEdit, FaHandHoldingUsd,
  FaBuilding,
  FaPills, FaFlask, FaClinicMedical, FaUser,
  FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import {
  FiUsers, FiUserCheck, FiClock, FiFilter, FiDownload, FiTrash2,
  FiEye, FiEdit2, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiChevronDown, FiChevronUp, FiAward, FiDollarSign
} from "react-icons/fi";
import "./EmployeeDashboard.css";
import "./EmployeeLeaves.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://api.timelyhealth.in/api";
const REFERRAL_API = `${API_BASE_URL}/referralcontacts`;
const BOOKINGS_API = `${API_BASE_URL}/appointment-slots`;

const TIME_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "All", label: "All" },
];

const PAYMENT_TYPE_FILTER_OPTIONS = [
  { value: "All", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
  { value: "insurance", label: "Insurance" },
  { value: "card", label: "Card" },
  { value: "due", label: "Due" },
];

const BOOKING_TYPE_OPTIONS = [
  { value: "All", label: "All Booking Types" },
  { value: "Walk-In", label: "Walk-In" },
  { value: "Online", label: "Online" },
];

const REVENUE_CATEGORY_OPTIONS = [
  { value: "All", label: "All Revenue Types" },
  { value: "clinic", label: "Clinic Only" },
  { value: "lab", label: "Lab Only" },
  { value: "pharmacy", label: "Pharmacy Only" },
];

// ==================== HELPERS ====================
const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val._id) return String(val._id);
  return "";
};

const extractName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.customerName || val.doctorName || val.name || "";
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
  const normalized = status === "Pending" ? "Due" : status;
  const map = {
    Paid:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    Partial: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: FaClock,       iconColor: "text-amber-600" },
    Due:     { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: FaTimesCircle, iconColor: "text-red-500" },
  };
  return map[normalized] || map.Due;
};

const getBookingServices = (booking) => {
  if (!booking) return [];
  const fromServiceItems = Array.isArray(booking.serviceItems) && booking.serviceItems.length > 0 ? booking.serviceItems : null;
  const fromServices = Array.isArray(booking.services) && booking.services.length > 0 ? booking.services : null;
  const arr = fromServiceItems || fromServices || [];
  return arr.map((s) => {
    const raw = s.paymentStatus || booking.paymentStatus || "Due";
    return {
      serviceId: s.serviceId || s._id || "",
      _id: s.serviceId || s._id || "",
      name: s.name || "Service",
      price: Number(s.price) || 0,
      description: s.description || "",
      paymentStatus: raw === "Pending" ? "Due" : raw,
      category: s.category || s.serviceCategory || s.type || "",
    };
  });
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
    Number(booking.finalPayable) || Number(booking.finalPayableAmount) ||
    Number(booking.grandTotal) || Number(booking.totalAmount) || 0;
  if (final > 0) return final;
  const items = getBookingServices(booking);
  const subtotal = items.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const commission = Number(booking.commissionAmount) || 0;
  const discount = Number(booking.discount) || 0;
  return subtotal - commission - discount;
};

const getBookingPaidInfo = (booking) => {
  if (!booking) return { final: 0, paid: 0, balance: 0, status: "Due" };
  const final = getBookingFinalPayable(booking);
  const raw = booking.paymentStatus || "Due";
  const status = raw === "Pending" ? "Due" : raw;
  let paid = Number(booking.amountPaid) || 0;
  if (status === "Paid") paid = final;
  else if (status === "Due") paid = 0;
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

const formatCommission = (referrer, key, typeKey) => {
  const val = referrer?.[key] || 0;
  const type = referrer?.[typeKey] || "%";
  return type === "₹" ? `₹${val}` : `${val}%`;
};

/* ============================================================
   DateRangePopup
   ============================================================ */
const DateRangePopup = ({
  isOpen, position, fromDate, toDate,
  onFromChange, onToChange, onClear, onClose, dataAttr,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d.getTime())) setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        else setCalendarMonth(new Date());
      } else setCalendarMonth(new Date());
    }
  }, [isOpen, fromDate]);

  if (!isOpen) return null;

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ date: new Date(year, month, i), currentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), currentMonth: false });
    return days;
  };

  const days = getDaysInMonth(calendarMonth);
  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayStr = toYMD(new Date());

  const handleDayClick = (dateStr, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    if (!fromDate || (fromDate && toDate)) {
      onFromChange(dateStr);
      onToChange("");
    } else if (fromDate && !toDate) {
      if (dateStr >= fromDate) onToChange(dateStr);
      else onFromChange(dateStr);
    }
  };

  const isInRange = (d) => {
    if (!fromDate || !toDate) return false;
    return d >= fromDate && d <= toDate;
  };

  const fmtDisplay = (ymd) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div
      data-attr={dataAttr}
      className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl"
      style={{ top: position.top, left: position.left, zIndex: 999999, width: 340 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">Date Range</h3>
        <button type="button" onClick={onClear} className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition-colors">
          Reset
        </button>
      </div>

      <div className="px-3 py-3 bg-gray-50 flex items-center gap-2">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">From</label>
          <div className="px-2 py-1.5 text-[11px] border border-gray-300 rounded-md bg-white text-gray-800 font-semibold">
            {fmtDisplay(fromDate) || <span className="text-gray-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">To</label>
          <div className="px-2 py-1.5 text-[11px] border border-gray-300 rounded-md bg-white text-gray-800 font-semibold">
            {fmtDisplay(toDate) || <span className="text-gray-400 font-normal">dd/mm/yyyy</span>}
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <div className="text-xs font-bold text-gray-800">{monthLabel}</div>
          <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekdays.map((wd, i) => (
            <div key={wd} className={`text-[9px] font-bold text-center py-1 ${i === 0 ? "text-red-500" : "text-gray-500"}`}>{wd}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map(({ date, currentMonth }, idx) => {
            const ymd = toYMD(date);
            const inRange = isInRange(ymd);
            const isFromDay = ymd === fromDate;
            const isToDay = ymd === toDate;
            const isToday = ymd === todayStr;
            const isWeekend = date.getDay() === 0;

            let cls = "text-[11px] font-semibold py-1.5 rounded-md text-center transition-colors ";
            if (!currentMonth) cls += "text-gray-300 cursor-default ";
            else if (isFromDay || isToDay) cls += "bg-orange-500 text-white cursor-pointer ";
            else if (inRange) cls += "bg-orange-100 text-orange-700 cursor-pointer ";
            else if (isToday) cls += "bg-blue-50 text-blue-700 ring-1 ring-blue-300 cursor-pointer ";
            else if (isWeekend) cls += "text-red-500 hover:bg-orange-50 cursor-pointer ";
            else cls += "text-gray-800 hover:bg-orange-50 cursor-pointer ";

            return (
              <button key={idx} type="button" onClick={() => handleDayClick(ymd, currentMonth)} className={cls}>
                {String(date.getDate()).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button type="button" onClick={onClose} className="text-xs font-bold text-gray-600 hover:text-gray-900">Close</button>
        <button type="button" onClick={onClose} className="text-xs font-bold text-orange-600 hover:text-orange-700">Confirm</button>
      </div>
    </div>
  );
};

export default function ReferralBookings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("doctor");

  // DATA
  const [doctorReferrals, setDoctorReferrals] = useState([]);
  const [customerReferrals, setCustomerReferrals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [referrerFilter, setReferrerFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("All");
  const [revenueCategoryFilter, setRevenueCategoryFilter] = useState("All");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [apptFromDate, setApptFromDate] = useState("");
  const [apptToDate, setApptToDate] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeCardFilter, setActiveCardFilter] = useState("all");
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);

  // DATE POPUPS
  const [showRegDatePopup, setShowRegDatePopup] = useState(false);
  const [showApptDatePopup, setShowApptDatePopup] = useState(false);
  const [regPopupPos, setRegPopupPos] = useState({ top: 0, left: 0 });
  const [apptPopupPos, setApptPopupPos] = useState({ top: 0, left: 0 });

  // UI
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("referralBookings_itemsPerPage");
    return saved ? parseInt(saved, 10) : 10;
  });

  // MODALS
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [selectedReferrerForPayment, setSelectedReferrerForPayment] = useState(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("Due");
  const [savingPayment, setSavingPayment] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ============ FETCH ============
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const refRes = await axios.get(`${REFERRAL_API}/getallreferralcontacts`);
      let allReferrals = [];
      if (refRes.data?.success) allReferrals = refRes.data.data || [];
      else if (Array.isArray(refRes.data)) allReferrals = refRes.data;

      setDoctorReferrals(allReferrals.filter((r) => r.referralType === "doctor"));
      setCustomerReferrals(allReferrals.filter((r) => r.referralType === "customer"));
    } catch (err) {
      console.error("Error fetching referral contacts:", err);
      showToast(err.response?.data?.message || "Failed to load referrals", "error");
    }
    await fetchBookings();
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (timeFilter && timeFilter !== "All") params.append("timeFilter", timeFilter);
      if (apptFromDate) params.append("apptFrom", apptFromDate);
      if (apptToDate) params.append("apptTo", apptToDate);
      if (fromDate) params.append("regFrom", fromDate);
      if (toDate) params.append("regTo", toDate);
      if (selectedMonth) params.append("month", selectedMonth);
      if (doctorFilter !== "All") params.append("doctor", doctorFilter);
      if (paymentTypeFilter !== "All") params.append("paymentType", paymentTypeFilter);
      if (statusFilter !== "All") params.append("paymentStatus", statusFilter);
      if (bookingTypeFilter !== "All") params.append("bookingType", bookingTypeFilter);
      if (revenueCategoryFilter !== "All") params.append("revenueCategory", revenueCategoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const url = `${BOOKINGS_API}/getallreferralbookings${params.toString() ? "?" + params.toString() : ""}`;
      const res = await axios.get(url);
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching referral bookings:", err);
      setBookings([]);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeFilter,
    fromDate, toDate, apptFromDate, apptToDate, selectedMonth,
    doctorFilter, paymentTypeFilter, statusFilter,
    bookingTypeFilter, revenueCategoryFilter, searchQuery,
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-attr="reg"]') && !e.target.closest('[data-btn="reg"]')) {
        setShowRegDatePopup(false);
      }
      if (!e.target.closest('[data-attr="appt"]') && !e.target.closest('[data-btn="appt"]')) {
        setShowApptDatePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeReferrals = activeTab === "doctor" ? doctorReferrals : customerReferrals;
  const isDoctorTab = activeTab === "doctor";

  // ============ GET BOOKINGS FOR REFERRAL ============
  const getBookingsForReferral = (referral) => {
    if (!referral) return [];
    const refId = String(referral._id || "");
    const refName = (isDoctorTab ? (referral.doctorName || "") : (referral.customerName || "")).trim().toLowerCase();

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

      if (refName && (refCustomerName === refName || refDoctorName === refName || referredBy === refName)) return true;
      return false;
    });
  };

  // ✅ Only referrals WITH bookings
  const buildFlatRows = () => {
    const rows = [];
    activeReferrals.forEach((ref) => {
      const refBookings = getBookingsForReferral(ref);
      if (refBookings.length === 0) return;
      refBookings.forEach((b) => rows.push({ referrer: ref, booking: b }));
    });
    return rows;
  };

  const flatRows = useMemo(() => buildFlatRows(), [activeReferrals, bookings, activeTab]);

  const uniqueReferrers = useMemo(() => {
    const map = new Map();
    activeReferrals.forEach((r) => {
      const name = isDoctorTab ? r.doctorName : r.customerName;
      if (name) map.set(r._id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeReferrals, activeTab]);

  const getUniqueDoctors = () => {
    const map = new Map();
    bookings.forEach((b) => { if (b.doctorName) map.set(b.doctorName, true); });
    return Array.from(map.keys());
  };

  const filteredRows = useMemo(() => {
    return flatRows.filter(({ referrer, booking }) => {
      if (!booking) return false;
      if (referrerFilter !== "All" && referrer._id !== referrerFilter) return false;

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

  useEffect(() => { setCurrentPage(1); }, [
    searchQuery, statusFilter, referrerFilter, fromDate, toDate, selectedMonth, activeTab,
    timeFilter, doctorFilter, bookingTypeFilter, revenueCategoryFilter, paymentTypeFilter,
  ]);

  // ✅ STATS — Computed from filteredRows
  const stats = useMemo(() => {
    const bookingRows = filteredRows.filter((r) => r.booking);
    const totalBookings = bookingRows.length;

    let paidCount = 0, partialCount = 0, dueCount = 0;
    bookingRows.forEach(({ booking }) => {
      const raw = booking.paymentStatus || "Due";
      const st = raw === "Pending" ? "Due" : raw;
      if (st === "Paid") paidCount++;
      else if (st === "Partial") partialCount++;
      else if (st === "Due") dueCount++;
    });

    const referrerIds = new Set(bookingRows.map((r) => r.referrer._id));

    return {
      totalReferrers: referrerIds.size,
      totalBookings,
      paidCount,
      partialCount,
      dueCount,
    };
  }, [filteredRows]);

  // ✅ CATEGORY REVENUE — Computed from filteredRows
  const categoryRevenue = useMemo(() => {
    const bookingRows = filteredRows.filter((r) => r.booking);

    const clinic   = { total: 0, cash: 0, online: 0, due: 0, footFall: 0, referralPayable: 0 };
    const lab      = { total: 0, cash: 0, online: 0, due: 0, footFall: 0, referralPayable: 0 };
    const pharmacy = { total: 0, cash: 0, online: 0, due: 0, footFall: 0, referralPayable: 0 };

    bookingRows.forEach(({ referrer, booking }) => {
      const cats = getBookingCategoryAmounts(booking);
      const paid = Number(booking.amountPaid) || 0;
      const due  = Number(booking.balanceAmount) || Math.max(0, getBookingFinalPayable(booking) - paid);
      const pt   = (booking.paymentType || "").toString().toLowerCase();

      const catTotal = cats.clinicAmount + cats.labAmount + cats.pharmacyAmount;
      if (catTotal <= 0) return;

      const cShare = cats.clinicAmount / catTotal;
      const lShare = cats.labAmount / catTotal;
      const pShare = cats.pharmacyAmount / catTotal;

      if (cats.clinicAmount > 0)   clinic.footFall += 1;
      if (cats.labAmount > 0)      lab.footFall += 1;
      if (cats.pharmacyAmount > 0) pharmacy.footFall += 1;

      clinic.total += cats.clinicAmount;
      clinic.due   += due * cShare;
      if (pt === "cash")           clinic.cash      += paid * cShare;
      else if (pt === "online")    clinic.online    += paid * cShare;
      else if (pt === "card")      clinic.cash      += paid * cShare;
      else if (pt === "insurance") clinic.online    += paid * cShare;

      lab.total += cats.labAmount;
      lab.due   += due * lShare;
      if (pt === "cash")           lab.cash      += paid * lShare;
      else if (pt === "online")    lab.online    += paid * lShare;
      else if (pt === "card")      lab.cash      += paid * lShare;
      else if (pt === "insurance") lab.online    += paid * lShare;

      pharmacy.total += cats.pharmacyAmount;
      pharmacy.due   += due * pShare;
      if (pt === "cash")           pharmacy.cash      += paid * pShare;
      else if (pt === "online")    pharmacy.online    += paid * pShare;
      else if (pt === "card")      pharmacy.cash      += paid * pShare;
      else if (pt === "insurance") pharmacy.online    += paid * pShare;

      if (referrer) {
        clinic.referralPayable   += (cats.clinicAmount   * (parseFloat(referrer.clinicCommission)   || 0)) / 100;
        lab.referralPayable      += (cats.labAmount      * (parseFloat(referrer.labCommission)      || 0)) / 100;
        pharmacy.referralPayable += (cats.pharmacyAmount * (parseFloat(referrer.pharmacyCommission) || 0)) / 100;
      }
    });

    [clinic, lab, pharmacy].forEach((obj) => {
      Object.keys(obj).forEach((k) => {
        if (k === "footFall") obj[k] = Number(obj[k]) || 0;
        else obj[k] = Math.round(obj[k]);
      });
    });

    return {
      clinic, lab, pharmacy,
      grandTotal: clinic.total + lab.total + pharmacy.total,
      grandFootFall: clinic.footFall + lab.footFall + pharmacy.footFall,
      grandReferralPayable: clinic.referralPayable + lab.referralPayable + pharmacy.referralPayable,
    };
  }, [filteredRows]);

  const handleCardClick = (type) => {
    setActiveCardFilter(type);
    setCurrentPage(1);
    if (type === "all") setStatusFilter("All");
    else setStatusFilter(type);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== "All") { setApptFromDate(""); setApptToDate(""); setSelectedMonth(""); }
  };

  const clearFilters = () => {
    setSearchQuery(""); setStatusFilter("All"); setReferrerFilter("All");
    setFromDate(""); setToDate(""); setSelectedMonth("");
    setApptFromDate(""); setApptToDate("");
    setDoctorFilter("All"); setBookingTypeFilter("All");
    setRevenueCategoryFilter("All"); setPaymentTypeFilter("All");
    setTimeFilter("All");
    setActiveCardFilter("all"); setCurrentPage(1);
    setShowRegDatePopup(false); setShowApptDatePopup(false);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "All" || referrerFilter !== "All" ||
    fromDate !== "" || toDate !== "" || (selectedMonth && selectedMonth !== "") ||
    doctorFilter !== "All" || bookingTypeFilter !== "All" ||
    revenueCategoryFilter !== "All" || paymentTypeFilter !== "All" ||
    apptFromDate !== "" || apptToDate !== "" || timeFilter !== "All";

  // Pagination
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

  // CSV
  const downloadCSV = () => {
    if (!filteredRows.length) { alert("No records available to export!"); return; }
    const referrerLabel = isDoctorTab ? "Doctor" : "Customer";
    const headers = ["#", `${referrerLabel} Name`, `${referrerLabel} Phone`,
      isDoctorTab ? "Organization" : "Address",
      "Clinic %", "Pharmacy %", "Lab %", "Fees %", "Patient", "Appt. Date",
      "Clinic Amount", "Pharmacy Amount", "Lab Amount", "Total",
      "Payment Status", `${referrerLabel} Payable`, `${referrerLabel} Payment Status`,
      "Paid At", "Payment Mode", "Created At"];
    const csvRows = [headers.join(","), ...filteredRows.map((row, idx) => {
      const { referrer, booking } = row;
      const name = isDoctorTab ? (referrer.doctorName || "") : (referrer.customerName || "");
      const phone = isDoctorTab ? (referrer.doctorPhone || "") : (referrer.customerPhone || "");
      const extra = isDoctorTab ? (referrer.doctorOrganization || "") : (referrer.customerAddress || "");
      const payStatus = isDoctorTab ? (booking?.doctorPaymentStatus || "Due") : (booking?.customerPaymentStatus || "Due");
      const payAt = isDoctorTab ? booking?.doctorPaymentUpdatedAt : booking?.customerPaymentUpdatedAt;

      const clinicCom = formatCommission(referrer, "clinicCommission", "clinicCommissionType");
      const pharmacyCom = formatCommission(referrer, "pharmacyCommission", "pharmacyCommissionType");
      const labCom = formatCommission(referrer, "labCommission", "labCommissionType");
      const feesCom = formatCommission(referrer, "feesCommission", "feesCommissionType");

      if (!booking) return [];
      const info = getBookingPaidInfo(booking);
      const payable = getReferralPayable(referrer, booking);
      const cats = getBookingCategoryAmounts(booking);
      return [
        idx + 1, `"${name.replace(/"/g, '""')}"`, `"${phone}"`, `"${extra.replace(/"/g, '""')}"`,
        `"${clinicCom}"`, `"${pharmacyCom}"`, `"${labCom}"`, `"${feesCom}"`,
        `"${(booking.patientTitle || "")} ${(booking.patientName || "").replace(/"/g, '""')}"`,
        `"${formatDateToDDMMYYYY(booking.appointmentDate || booking.date)}"`,
        cats.clinicAmount, cats.pharmacyAmount, cats.labAmount, info.final,
        `"${booking.paymentStatus || "Due"}"`, payable, `"${payStatus}"`,
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

  // ============ PAYMENT MODAL ============
  const openPaymentModal = (referrer, booking) => {
    if (!booking) { showToast("No booking selected", "error"); return; }
    setSelectedReferrerForPayment(referrer);
    setSelectedBookingForPayment(booking);
    const current = isDoctorTab
      ? (booking?.doctorPaymentStatus || "Due")
      : (booking?.customerPaymentStatus || "Due");
    // Normalize "Pending" → "Due"
    setNewPaymentStatus(current === "Pending" ? "Due" : current);
    setShowPaymentModal(true);
  };

  const handleSavePaymentStatus = async () => {
    if (!selectedBookingForPayment) { showToast("No booking selected", "error"); return; }
    setSavingPayment(true);
    try {
      const endpoint = isDoctorTab
        ? `${BOOKINGS_API}/updatedoctorpayment/${selectedBookingForPayment._id}`
        : `${BOOKINGS_API}/updatecustomerpayment/${selectedBookingForPayment._id}`;
      const payload = isDoctorTab
        ? { doctorPaymentStatus: newPaymentStatus }
        : { customerPaymentStatus: newPaymentStatus };

      console.log(`📤 Sending ${isDoctorTab ? "doctor" : "customer"} payment update:`, endpoint, payload);

      const res = await axios.put(endpoint, payload);
      if (res.data?.success || res.status === 200) {
        setBookings((prev) => prev.map((b) =>
          b._id === selectedBookingForPayment._id
            ? {
                ...b,
                ...(isDoctorTab
                  ? { doctorPaymentStatus: newPaymentStatus, doctorPaymentUpdatedAt: new Date().toISOString() }
                  : { customerPaymentStatus: newPaymentStatus, customerPaymentUpdatedAt: new Date().toISOString() }),
              }
            : b
        ));
        const label = isDoctorTab ? "Doctor" : "Customer";
        showToast(`✅ ${label} payment status updated to ${newPaymentStatus}!`, "success");
        setShowPaymentModal(false);
        setSelectedReferrerForPayment(null);
        setSelectedBookingForPayment(null);
      } else {
        showToast(res.data?.message || "Failed to update", "error");
      }
    } catch (err) {
      console.error("❌ Payment update error:", err);
      showToast(err.response?.data?.message || "Failed to update payment status", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReferrerFilter("All");
    setCurrentPage(1);
    setActiveCardFilter("all");
    setStatusFilter("All");
  };

  // Labels
  const referrerLabel = isDoctorTab ? "Doctor" : "Customer";
  const referrerLabelPlural = isDoctorTab ? "Doctors" : "Customers";
  const avatarBg = isDoctorTab ? "bg-purple-500" : "bg-indigo-500";
  const avatarText = isDoctorTab ? "text-purple-800" : "text-indigo-800";
  const payableTextColor = isDoctorTab ? "text-purple-700" : "text-indigo-700";
  const payableBgColor = isDoctorTab ? "bg-purple-50" : "bg-indigo-50";
  const payableBorderColor = isDoctorTab ? "border-purple-200" : "border-indigo-200";
  const statPayableColor = isDoctorTab ? "text-purple-700" : "text-indigo-700";
  const headerAccent = isDoctorTab ? "text-purple-600" : "text-indigo-600";

  const fmt = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

  return (
    <div className="emp-dash">
      <main className="p-2 sm:p-4 lg:p-6">
        {toast && (
          <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white ${toast.type === "error" ? "bg-red-600" : toast.type === "info" ? "bg-cyan-600" : "bg-emerald-600"}`}>
            {toast.type === "error" ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 overflow-x-auto">
          <button onClick={() => handleTabChange("doctor")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === "doctor" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <FaUserMd className="w-4 h-4" /> Doctor Referred Bookings
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "doctor" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>{doctorReferrals.length}</span>
          </button>
          <button onClick={() => handleTabChange("customer")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === "customer" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <FaUser className="w-4 h-4" /> Customer Referred Bookings
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "customer" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>{customerReferrals.length}</span>
          </button>
        </div>

        {/* ROW 1 */}
        <div className="hidden lg:grid grid-cols-3 items-center gap-2 mb-3">
          <div className="flex items-center">
            <h1 className="emp-dash__greeting text-lg font-bold whitespace-nowrap">{referrerLabel} Referral <span className={headerAccent}>OP</span></h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="relative flex-shrink-0">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[140px] pl-8 pr-2 py-2 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {TIME_FILTER_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${timeFilter === opt.value ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white hover:text-gray-900"}`}
                  title={opt.label}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={downloadCSV} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 whitespace-nowrap shadow-sm">
              <FiDownload className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* ROW 2 — Filters */}
        <div className="hidden lg:flex items-center gap-1.5 flex-nowrap mb-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
            <option value="All">All Payment</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>

          <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
            {BOOKING_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg max-w-[110px] truncate flex-shrink-0">
            <option value="All">All Doctors</option>
            {getUniqueDoctors().map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
            {REVENUE_CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg flex-shrink-0">
            {PAYMENT_TYPE_FILTER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>

          <select value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg max-w-[140px] truncate flex-shrink-0">
            <option value="All">All {referrerLabelPlural}</option>
            {uniqueReferrers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <div className="relative flex-shrink-0">
            <button
              data-btn="reg"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 340;
                const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                setRegPopupPos({ top: rect.bottom + 6, left });
                setShowRegDatePopup(!showRegDatePopup);
                setShowApptDatePopup(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${(fromDate || toDate) ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}
            >
              <FaCalendarAlt className="w-3 h-3" />
              <span>
                {!fromDate && !toDate ? "Reg Date"
                  : fromDate && toDate ? `${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)} – ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}`
                  : fromDate ? `From ${fromDate.slice(8, 10)}/${fromDate.slice(5, 7)}`
                  : `To ${toDate.slice(8, 10)}/${toDate.slice(5, 7)}`}
              </span>
              {(fromDate || toDate) && (
                <span onClick={(e) => { e.stopPropagation(); setFromDate(""); setToDate(""); }} className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer">✕</span>
              )}
            </button>
            <DateRangePopup
              isOpen={showRegDatePopup}
              position={regPopupPos}
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
              onClear={() => { setFromDate(""); setToDate(""); }}
              onClose={() => setShowRegDatePopup(false)}
              dataAttr="reg"
            />
          </div>

          <div className="relative flex-shrink-0">
            <button
              data-btn="appt"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const popupWidth = 340;
                const left = Math.min(rect.left, window.innerWidth - popupWidth - 20);
                setApptPopupPos({ top: rect.bottom + 6, left });
                setShowApptDatePopup(!showApptDatePopup);
                setShowRegDatePopup(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${(apptFromDate || apptToDate) ? "border-blue-500 text-blue-700 bg-blue-50 ring-2 ring-blue-500/10" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}
            >
              <FaCalendarAlt className="w-3 h-3" />
              <span>
                {!apptFromDate && !apptToDate ? "Appt Date"
                  : apptFromDate && apptToDate ? `${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)} – ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}`
                  : apptFromDate ? `From ${apptFromDate.slice(8, 10)}/${apptFromDate.slice(5, 7)}`
                  : `To ${apptToDate.slice(8, 10)}/${apptToDate.slice(5, 7)}`}
              </span>
              {(apptFromDate || apptToDate) && (
                <span onClick={(e) => { e.stopPropagation(); setApptFromDate(""); setApptToDate(""); }} className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center hover:bg-red-600 cursor-pointer">✕</span>
              )}
            </button>
            <DateRangePopup
              isOpen={showApptDatePopup}
              position={apptPopupPos}
              fromDate={apptFromDate}
              toDate={apptToDate}
              onFromChange={setApptFromDate}
              onToChange={setApptToDate}
              onClear={() => { setApptFromDate(""); setApptToDate(""); }}
              onClose={() => setShowApptDatePopup(false)}
              dataAttr="appt"
            />
          </div>

          <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setTimeFilter("All"); }} className="h-9 px-2 text-xs border border-gray-300 bg-white rounded-lg w-[110px] flex-shrink-0" title="Appointment month" />

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0">
              <FiTrash2 className="w-3 h-3 text-red-500" /> Clear
            </button>
          )}
        </div>

        {/* MOBILE HEADER */}
        <div className="lg:hidden flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold whitespace-nowrap">{referrerLabel} Referral <span className={headerAccent}>OP</span></h1>
            <div className="emp-dash__date-pill text-[10px] px-2 py-1">
              {isDoctorTab ? <FaUserMd className={`w-3 h-3 ${headerAccent}`} /> : <FaUser className={`w-3 h-3 ${headerAccent}`} />}
              <span>{activeReferrals.length}{isDoctorTab ? "D" : "C"} • {stats.totalBookings}B</span>
            </div>
          </div>
          <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
            <FiFilter className="w-3 h-3" /> Filters
          </button>
        </div>

        <div className="lg:hidden mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TIME_FILTER_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => handleTimeFilterChange(opt.value)}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${timeFilter === opt.value ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-300"}`}>{opt.label}</button>
            ))}
          </div>
        </div>

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
                <option value="All">All Status</option><option value="Partial">Partial</option><option value="Paid">Paid</option><option value="Due">Due</option>
              </select>
              <select value={referrerFilter} onChange={(e) => setReferrerFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                <option value="All">All {referrerLabelPlural}</option>
                {uniqueReferrers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Booking Type</label>
              <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                {BOOKING_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={revenueCategoryFilter} onChange={(e) => setRevenueCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                {REVENUE_CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg">
                {PAYMENT_TYPE_FILTER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Registered Date</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); if (e.target.value) setSelectedMonth(""); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={apptFromDate} onChange={(e) => { setApptFromDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
                <input type="date" value={apptToDate} onChange={(e) => { setApptToDate(e.target.value); if (e.target.value) { setSelectedMonth(""); setTimeFilter("All"); } }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
              </div>
            </div>
            <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFromDate(""); setToDate(""); setTimeFilter("All"); }} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg" />
            <div className="pt-3 border-t border-gray-200 flex gap-2">
              <button onClick={downloadCSV} disabled={!filteredRows.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"><FiDownload className="w-4 h-4" /> Export</button>
              <button onClick={fetchAllData} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg"><FiRefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                <FiTrash2 className="w-4 h-4 text-red-500" /> Clear All
              </button>
            )}
          </div>
        )}

        {/* REVENUE BREAKDOWN */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FaRupeeSign className="text-indigo-600 w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Referral Revenue Breakdown</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200">
                {filteredRows.filter((r) => r.booking).length} bookings
              </span>
              <button
                onClick={() => setShowRevenueBreakdown(!showRevenueBreakdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50 shadow-sm transition-colors"
              >
                {showRevenueBreakdown ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                {showRevenueBreakdown ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {showRevenueBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
              <div className="rounded-lg p-4 border border-blue-200 bg-blue-50 min-h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase">
                    <FaClinicMedical className="text-xs" /> Clinic Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-blue-600 leading-tight">FootFall: {categoryRevenue.clinic.footFall}</span>
                    <span className="text-xl font-extrabold text-blue-800">{fmt(categoryRevenue.clinic.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {fmt(categoryRevenue.clinic.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {fmt(categoryRevenue.clinic.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {fmt(categoryRevenue.clinic.due)}</span>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-purple-200 bg-purple-50 min-h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase">
                    <FaFlask className="text-xs" /> Lab Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-purple-600 leading-tight">FootFall: {categoryRevenue.lab.footFall}</span>
                    <span className="text-xl font-extrabold text-purple-800">{fmt(categoryRevenue.lab.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {fmt(categoryRevenue.lab.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {fmt(categoryRevenue.lab.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {fmt(categoryRevenue.lab.due)}</span>
                </div>
               
              </div>

              <div className="rounded-lg p-4 border border-green-200 bg-green-50 min-h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase">
                    <FaPills className="text-xs" /> Pharmacy Revenue
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-green-600 leading-tight">FootFall: {categoryRevenue.pharmacy.footFall}</span>
                    <span className="text-xl font-extrabold text-green-800">{fmt(categoryRevenue.pharmacy.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-emerald-700 whitespace-nowrap">Cash: {fmt(categoryRevenue.pharmacy.cash)}</span>
                  <span className="text-cyan-700 whitespace-nowrap">Online: {fmt(categoryRevenue.pharmacy.online)}</span>
                  <span className="text-red-600 whitespace-nowrap">Due: {fmt(categoryRevenue.pharmacy.due)}</span>
                </div>
               
              </div>

              <div className="rounded-lg p-4 border border-slate-300 bg-slate-50 min-h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                    <FaRupeeSign className="text-xs" /> Total Referral
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-600 leading-tight">FootFall: {categoryRevenue.grandFootFall}</span>
                    <span className="text-xl font-extrabold text-slate-900">{fmt(categoryRevenue.grandTotal)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
                  <span className="text-blue-700 whitespace-nowrap">Clinic: {fmt(categoryRevenue.clinic.total)}</span>
                  <span className="text-purple-700 whitespace-nowrap">Lab: {fmt(categoryRevenue.lab.total)}</span>
                  <span className="text-green-700 whitespace-nowrap">Pharmacy: {fmt(categoryRevenue.pharmacy.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STATS — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform ${activeCardFilter === "all" ? "ring-2 ring-blue-500/20 border-blue-400" : ""}`} onClick={() => handleCardClick("all")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Total {referrerLabelPlural}</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FiUsers /></div></div>
            <div className="emp-dash__stat-value">{stats.totalReferrers}</div>
            <div className="emp-dash__stat-meta">{stats.totalBookings} bookings</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform ${activeCardFilter === "Paid" ? "ring-2 ring-emerald-500/20 border-emerald-400" : ""}`} onClick={() => handleCardClick("Paid")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Paid</span><div className="emp-dash__stat-icon emp-dash__stat-icon--present"><FiUserCheck /></div></div>
            <div className="emp-dash__stat-value text-emerald-600">{stats.paidCount}</div>
            <div className="emp-dash__stat-meta">completed payments</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform ${activeCardFilter === "Partial" ? "ring-2 ring-amber-500/20 border-amber-400" : ""}`} onClick={() => handleCardClick("Partial")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Partial</span><div className="emp-dash__stat-icon emp-dash__stat-icon--rate"><FaClock /></div></div>
            <div className="emp-dash__stat-value text-amber-600">{stats.partialCount}</div>
            <div className="emp-dash__stat-meta">partially paid</div>
          </div>
          <div className={`emp-dash__stat cursor-pointer hover:scale-105 transition-transform ${activeCardFilter === "Due" ? "ring-2 ring-red-500/20 border-red-400" : ""}`} onClick={() => handleCardClick("Due")}>
            <div className="emp-dash__stat-top"><span className="emp-dash__stat-label">Due</span><div className="emp-dash__stat-icon emp-dash__stat-icon--late"><FiXCircle /></div></div>
            <div className="emp-dash__stat-value text-red-500">{stats.dueCount}</div>
            <div className="emp-dash__stat-meta">overdue payments</div>
          </div>
        </div>

        {/* TABLE / CARDS */}
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
              <p className="text-xs text-gray-500 mt-1 mb-4">
                {flatRows.length === 0 ? `No bookings from referred ${referrerLabelPlural.toLowerCase()} yet.` : "No records match your filters."}
              </p>
              {hasActiveFilters && <button onClick={clearFilters} className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">Clear Filters</button>}
            </div>
          ) : (
            <>
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
                      <th style={{ textAlign: "center" }}>{referrerLabel} Pay Status</th>
                      <th style={{ textAlign: "center", minWidth: "110px" }}>Paid At</th>
                      <th style={{ textAlign: "center", minWidth: "140px" }}>Referral %</th>
                      <th style={{ textAlign: "center" }}>Created At</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row, idx) => {
                      const { referrer, booking } = row;
                      if (!booking) return null;
                      const name = isDoctorTab ? (referrer.doctorName || "N/A") : (referrer.customerName || "N/A");
                      const subInfo = isDoctorTab ? (referrer.doctorOrganization || "-") : (referrer.customerPhone || "-");

                      const info = getBookingPaidInfo(booking);
                      const paymentColors = getPaymentStatusColors(booking.paymentStatus);
                      const payStatusRaw = isDoctorTab ? (booking.doctorPaymentStatus || "Due") : (booking.customerPaymentStatus || "Due");
                      const payStatus = payStatusRaw === "Pending" ? "Due" : payStatusRaw;
                      const payColors = getPaymentStatusColors(payStatus);
                      const cats = getBookingCategoryAmounts(booking);
                      const payAt = isDoctorTab ? booking.doctorPaymentUpdatedAt : booking.customerPaymentUpdatedAt;

                      return (
                        <tr key={booking._id} className={`hover:${isDoctorTab ? "bg-purple-50/30" : "bg-indigo-50/30"}`}>
                          <td className="px-2 py-3 text-center text-slate-500 text-[11px]">{indexOfFirstItem + idx + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-[10px]`}>{name.charAt(0).toUpperCase()}</div>
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
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaClinicMedical className="text-[9px]" /> Clinic:</span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.clinicAmount)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaPills className="text-[9px]" /> Pharmacy:</span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.pharmacyAmount)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-700 text-[10px]">
                                <span className="font-semibold whitespace-nowrap flex items-center gap-1"><FaFlask className="text-[9px]" /> Lab:</span>
                                <span className="font-bold whitespace-nowrap">₹{Math.round(cats.labAmount)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap"><span className="text-xs font-bold text-slate-800">₹{Math.round(info.final)}</span></td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border}`}>
                              <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {booking.paymentStatus || "Due"}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button type="button" onClick={() => openPaymentModal(referrer, booking)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border cursor-pointer hover:shadow-md transition-all ${payColors.bg} ${payColors.text} ${payColors.border}`}
                              title={`Click to update ${referrerLabel.toLowerCase()} payment status`}>
                              <payColors.icon className={`w-2.5 h-2.5 ${payColors.iconColor}`} /> {payStatus}
                            </button>
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {payAt ? (
                              <div className="text-[10px] font-semibold text-slate-700">
                                {formatDateToDDMMYYYY(payAt)}
                                <div className="text-[9px] text-gray-400">{new Date(payAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                              </div>
                            ) : (<span className="text-[10px] text-gray-400 italic">-</span>)}
                          </td>

                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex flex-col gap-0.5 items-center">
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                Clinic: {formatCommission(referrer, "clinicCommission", "clinicCommissionType")}
                              </span>
                              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                Pharmacy: {formatCommission(referrer, "pharmacyCommission", "pharmacyCommissionType")}
                              </span>
                              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                Lab: {formatCommission(referrer, "labCommission", "labCommissionType")}
                              </span>
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                Fees: {formatCommission(referrer, "feesCommission", "feesCommissionType")}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-center text-[10px] text-gray-500 whitespace-nowrap">
                            <div className="font-semibold text-slate-700">{formatDateToDDMMYYYY(booking.createdAt)}</div>
                            <div className="text-[9px] text-gray-400">{booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}</div>
                          </td>

                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setSelectedReferrer(referrer); setSelectedBookingForModal(booking); setShowDetailModal(true); }}
                                className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="View Details">
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => openPaymentModal(referrer, booking)}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg" title={`Update ${referrerLabel} Payment`}>
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="lg:hidden p-3 space-y-3 bg-gray-50/50">
                {currentRows.map((row) => {
                  const { referrer, booking } = row;
                  if (!booking) return null;
                  const name = isDoctorTab ? (referrer.doctorName || "N/A") : (referrer.customerName || "N/A");
                  const subInfo = isDoctorTab ? (referrer.doctorOrganization || "-") : (referrer.customerPhone || "-");

                  const info = getBookingPaidInfo(booking);
                  const paymentColors = getPaymentStatusColors(booking.paymentStatus);
                  const payStatusRaw = isDoctorTab ? (booking.doctorPaymentStatus || "Due") : (booking.customerPaymentStatus || "Due");
                  const payStatus = payStatusRaw === "Pending" ? "Due" : payStatusRaw;
                  const payColors = getPaymentStatusColors(payStatus);
                  const cats = getBookingCategoryAmounts(booking);
                  const payAt = isDoctorTab ? booking.doctorPaymentUpdatedAt : booking.customerPaymentUpdatedAt;

                  return (
                    <div key={booking._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-xs flex-shrink-0`}>{name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-bold text-sm ${avatarText} truncate`}>{name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1"><FaPhoneAlt className="text-[8px]" /> {subInfo}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${paymentColors.bg} ${paymentColors.text} ${paymentColors.border} flex-shrink-0`}>
                          <paymentColors.icon className={`w-2.5 h-2.5 ${paymentColors.iconColor}`} /> {booking.paymentStatus || "Due"}
                        </span>
                      </div>

                      <div className="p-3 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <FaUserInjured className="text-gray-400 text-[10px]" />
                          <span className="font-semibold text-slate-700 truncate">{booking.patientTitle || ""} {booking.patientName || "N/A"}</span>
                          <span className="text-[9px] text-gray-400">({booking.patientAge || "?"} yrs • {booking.patientGender || "-"})</span>
                        </div>

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

                        <div className="pt-2 border-t border-gray-100">
                          <div className="text-center p-2 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="text-[9px] font-bold text-gray-500 uppercase">Total Amount</div>
                            <div className="text-base font-extrabold text-slate-800">₹{Math.round(info.final)}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase text-gray-400">{referrerLabel} Pay:</span>
                            <button type="button" onClick={() => openPaymentModal(referrer, booking)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border cursor-pointer hover:shadow-md transition-all ${payColors.bg} ${payColors.text} ${payColors.border}`}>
                              <payColors.icon className={`w-2.5 h-2.5 ${payColors.iconColor}`} /> {payStatus}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium">{payAt ? formatDateToDDMMYYYY(payAt) : "-"}</div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            Clinic: {formatCommission(referrer, "clinicCommission", "clinicCommissionType")}
                          </span>
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            Pharmacy: {formatCommission(referrer, "pharmacyCommission", "pharmacyCommissionType")}
                          </span>
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                            Lab: {formatCommission(referrer, "labCommission", "labCommissionType")}
                          </span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            Fees: {formatCommission(referrer, "feesCommission", "feesCommissionType")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="text-[10px] text-gray-500">{formatDateToDDMMYYYY(booking.createdAt)}</div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setSelectedReferrer(referrer); setSelectedBookingForModal(booking); setShowDetailModal(true); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold">
                              <FiEye className="w-3.5 h-3.5" /> View
                            </button>
                            <button onClick={() => openPaymentModal(referrer, booking)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold">
                              <FiEdit2 className="w-3.5 h-3.5" /> Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
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
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Prev</button>
                  {getPageNumbers().map((page, i) => (
                    <button key={i} onClick={() => typeof page === "number" && setCurrentPage(page)} disabled={page === "..."}
                      className={`px-3 py-1 text-xs font-semibold border rounded-lg min-w-[32px] ${page === "..." ? "text-gray-400 border-transparent" : currentPage === page ? "text-white bg-blue-600 border-blue-600" : "text-gray-700 bg-white hover:bg-gray-50"}`}>{page}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-2.5 py-1 text-xs font-semibold border rounded-lg ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* DETAIL MODAL */}
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
                <button onClick={() => { setShowDetailModal(false); setSelectedReferrer(null); setSelectedBookingForModal(null); }} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <div className="my-4 bg-gray-50 p-5 rounded-xl border space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className={`w-14 h-14 rounded-full ${avatarBg} text-white font-bold text-xl flex items-center justify-center`}>
                    {(isDoctorTab ? selectedReferrer.doctorName : selectedReferrer.customerName)?.charAt(0).toUpperCase() || (isDoctorTab ? "D" : "C")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base">{isDoctorTab ? selectedReferrer.doctorName : selectedReferrer.customerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {isDoctorTab ? <FaBuilding className="text-[10px]" /> : <FaPhoneAlt className="text-[10px]" />}
                      {isDoctorTab ? (selectedReferrer.doctorOrganization || "N/A") : (selectedReferrer.customerPhone || "N/A")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-[10px] font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                    <FiAward className={headerAccent} /> Referral % Breakdown
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-center border border-blue-100">
                      <div className="text-[9px] text-blue-600 font-bold">Clinic</div>
                      <div className="text-sm font-extrabold text-blue-900">{formatCommission(selectedReferrer, "clinicCommission", "clinicCommissionType")}</div>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-center border border-green-100">
                      <div className="text-[9px] text-green-600 font-bold">Pharmacy</div>
                      <div className="text-sm font-extrabold text-green-900">{formatCommission(selectedReferrer, "pharmacyCommission", "pharmacyCommissionType")}</div>
                    </div>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-center border border-purple-100">
                      <div className="text-[9px] text-purple-600 font-bold">Lab</div>
                      <div className="text-sm font-extrabold text-purple-900">{formatCommission(selectedReferrer, "labCommission", "labCommissionType")}</div>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-lg text-center border border-amber-100">
                      <div className="text-[9px] text-amber-600 font-bold">Fees</div>
                      <div className="text-sm font-extrabold text-amber-900">{formatCommission(selectedReferrer, "feesCommission", "feesCommissionType")}</div>
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
                      <div className="text-base font-extrabold text-emerald-900">₹{getBookingsForReferral(selectedReferrer).reduce((sum, b) => sum + getBookingFinalPayable(b), 0).toLocaleString()}</div>
                    </div>
                    <div className={`${payableBgColor} p-2 rounded-lg text-center border ${payableBorderColor}`}>
                      <div className={`text-[9px] ${payableTextColor} font-bold`}>{referrerLabel} Payable</div>
                      <div className={`text-base font-extrabold ${statPayableColor}`}>₹{getBookingsForReferral(selectedReferrer).reduce((sum, b) => sum + getReferralPayable(selectedReferrer, b), 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {selectedBookingForModal && (() => {
                  const breakdown = getReferralPayableBreakdown(selectedReferrer, selectedBookingForModal);
                  const payStatusRaw = isDoctorTab ? (selectedBookingForModal.doctorPaymentStatus || "Due") : (selectedBookingForModal.customerPaymentStatus || "Due");
                  const payStatus = payStatusRaw === "Pending" ? "Due" : payStatusRaw;
                  const payAt = isDoctorTab ? selectedBookingForModal.doctorPaymentUpdatedAt : selectedBookingForModal.customerPaymentUpdatedAt;
                  return (
                    <div className="pt-3 border-t">
                      <div className="text-[10px] font-bold uppercase text-gray-400 mb-2">Selected Booking Details</div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">Patient:</span><span className="font-semibold">{selectedBookingForModal.patientTitle} {selectedBookingForModal.patientName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Amount:</span><span className="font-semibold">₹{Math.round(getBookingFinalPayable(selectedBookingForModal))}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{referrerLabel} Payment:</span>
                          <span className={`font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase ${getPaymentStatusColors(payStatus).bg} ${getPaymentStatusColors(payStatus).text}`}>{payStatus}</span>
                        </div>
                        {payAt && (<div className="flex justify-between"><span className="text-gray-500">Paid At:</span><span className="font-semibold text-[10px]">{formatDateTimeToDDMMYYYY(payAt)}</span></div>)}
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
                                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${it.category === "clinic" ? "bg-blue-50 text-blue-700" : it.category === "pharmacy" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"}`}>{it.category}</span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-semibold text-gray-700">₹{it.price}</td>
                                  <td className="px-2 py-1.5 text-center font-semibold text-gray-600">{it.percent}%</td>
                                  <td className={`px-2 py-1.5 text-right font-bold ${payableTextColor}`}>₹{it.payable}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className={`${payableBgColor} border-t-2 ${payableBorderColor}`}>
                              <tr>
                                <td colSpan={4} className={`px-2 py-2 text-right font-bold ${payableTextColor} text-[11px]`}>Total {referrerLabel} Payable</td>
                                <td className={`px-2 py-2 text-right font-extrabold ${statPayableColor} text-[12px]`}>₹{breakdown.total}</td>
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
                  onClick={() => { const r = selectedReferrer; const b = selectedBookingForModal; setShowDetailModal(false); setSelectedReferrer(null); setSelectedBookingForModal(null); if (b) openPaymentModal(r, b); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5">
                  <FiEdit2 className="w-3.5 h-3.5" /> Update {referrerLabel} Payment
                </button>
                <button onClick={() => { setShowDetailModal(false); setSelectedReferrer(null); setSelectedBookingForModal(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT MODAL — for doctor/customer referral payment status */}
        {showPaymentModal && selectedReferrerForPayment && selectedBookingForPayment && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${isDoctorTab ? "bg-purple-600" : "bg-indigo-600"} text-white flex items-center justify-center`}>
                    <FaHandHoldingUsd />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Update {referrerLabel} Payment</h3>
                    <p className="text-xs text-gray-500">{isDoctorTab ? selectedReferrerForPayment.doctorName : selectedReferrerForPayment.customerName}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPaymentModal(false); setSelectedReferrerForPayment(null); setSelectedBookingForPayment(null); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Payable Info */}
              <div className={`mt-4 p-3 ${payableBgColor} rounded-lg border ${payableBorderColor}`}>
                <div className={`text-xs ${payableTextColor} font-bold uppercase`}>{referrerLabel} Payable For This Booking</div>
                <div className={`text-lg font-extrabold ${statPayableColor} mt-0.5`}>₹{getReferralPayable(selectedReferrerForPayment, selectedBookingForPayment)}</div>
                <div className={`text-[10px] ${payableTextColor} mt-0.5`}>
                  Patient: {selectedBookingForPayment.patientTitle} {selectedBookingForPayment.patientName} • Total: ₹{Math.round(getBookingFinalPayable(selectedBookingForPayment))}
                </div>
              </div>

              {/* Current Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Current Status</div>
                {(() => {
                  const currentRaw = isDoctorTab ? (selectedBookingForPayment.doctorPaymentStatus || "Due") : (selectedBookingForPayment.customerPaymentStatus || "Due");
                  const current = currentRaw === "Pending" ? "Due" : currentRaw;
                  const colors = getPaymentStatusColors(current);
                  return (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
                      <colors.icon className={`w-3 h-3 ${colors.iconColor}`} /> {current}
                    </span>
                  );
                })()}
              </div>

              {/* New Status Selection */}
              <div className="mt-5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">Update {referrerLabel} Payment Status To:</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Due", "Partial", "Paid"].map((st) => {
                    const isSelected = newPaymentStatus === st;
                    const colors = getPaymentStatusColors(st);
                    return (
                      <button key={st} type="button" onClick={() => setNewPaymentStatus(st)}
                        className={`px-2 py-2.5 rounded-lg text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-blue-400/30` : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                        <colors.icon className={`w-4 h-4 ${colors.iconColor}`} />
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t mt-5">
                <button onClick={() => { setShowPaymentModal(false); setSelectedReferrerForPayment(null); setSelectedBookingForPayment(null); }} className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleSavePaymentStatus} disabled={savingPayment}
                  className={`px-5 py-2 rounded-lg text-xs font-bold ${isDoctorTab ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white flex items-center gap-1.5 disabled:opacity-50`}>
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